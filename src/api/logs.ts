import { formatTimeRange } from "@/lib/formatters";
import { createHistogramBuckets } from "@/lib/histogram";
import { normalizeOtlpLogs, type OtlpLogsResponse } from "@/lib/otlp";
import { createSeverityCounts } from "@/lib/severity";
import type { LogEntry, ResourceGroup, SummaryStats, ViewData } from "@/lib/types";

const LOGS_ENDPOINT = "https://take-home-assignment-otlp-logs-api.vercel.app/api/v2/logs";
const REQUEST_TIMEOUT_MS = 10_000;

async function fetchOtlpLogs(): Promise<OtlpLogsResponse> {
  const response = await fetch(LOGS_ENDPOINT, {
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch OTLP logs: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as OtlpLogsResponse;
}

function groupByResource(logs: LogEntry[]): ResourceGroup[] {
  const groups = new Map<string, ResourceGroup>();

  logs.forEach((log) => {
    const existing = groups.get(log.resourceId);

    if (existing) {
      existing.logIds.push(log.id);
      existing.severityCounts[log.severity.level] += 1;
      return;
    }

    groups.set(log.resourceId, {
      id: log.resourceId,
      label: log.resourceLabel,
      serviceName: log.serviceName,
      serviceNamespace: log.serviceNamespace,
      serviceVersion: log.serviceVersion,
      attributes: log.resourceAttributes,
      logIds: [log.id],
      severityCounts: createSeverityCounts([log]),
    });
  });

  return Array.from(groups.values()).sort(
    (first, second) =>
      second.logIds.length - first.logIds.length || first.label.localeCompare(second.label),
  );
}

function createSummaryStats(logs: LogEntry[]): SummaryStats {
  const timestamps = logs
    .map((log) => log.timestampMs)
    .filter((timestamp): timestamp is number => timestamp !== undefined);
  const startMs = timestamps.length ? Math.min(...timestamps) : undefined;
  const endMs = timestamps.length ? Math.max(...timestamps) : undefined;

  return {
    totalLogs: logs.length,
    resourceCount: new Set(logs.map((log) => log.resourceId)).size,
    invalidTimestampCount: logs.filter((log) => log.timestampMs === undefined).length,
    timeRangeLabel: formatTimeRange(startMs, endMs),
    severityCounts: createSeverityCounts(logs),
  };
}

export async function getLogsViewData(): Promise<ViewData> {
  const fetchedAtMs = Date.now();
  const payload = await fetchOtlpLogs();
  const normalizedOptLogs = normalizeOtlpLogs(payload, fetchedAtMs);

  return {
    entries: normalizedOptLogs,
    groups: groupByResource(normalizedOptLogs),
    histogram: createHistogramBuckets(normalizedOptLogs),
    stats: createSummaryStats(normalizedOptLogs),
    fetchedAt: new Date(fetchedAtMs).toISOString(),
  };
}
