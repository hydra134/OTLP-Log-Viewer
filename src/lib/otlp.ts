import { formatDecodedValue, formatRelativeTime } from "./formatters";
import { normalizeSeverity } from "./severity";
import type { Attribute, DecodedValue, LogEntry } from "./types";

type OtlpAnyValue = {
  stringValue?: string;
  boolValue?: boolean;
  intValue?: string | number;
  doubleValue?: number;
  bytesValue?: string;
  arrayValue?: { values?: OtlpAnyValue[] };
  kvlistValue?: { values?: OtlpKeyValue[] };
};

type OtlpKeyValue = {
  key?: string;
  value?: OtlpAnyValue;
};

type OtlpResource = {
  attributes?: OtlpKeyValue[];
};

type OtlpScope = {
  name?: string;
  version?: string;
  attributes?: OtlpKeyValue[];
};

type OtlpLogRecord = {
  timeUnixNano?: string | number;
  observedTimeUnixNano?: string | number;
  severityNumber?: number;
  severityText?: string;
  body?: OtlpAnyValue;
  attributes?: OtlpKeyValue[];
  traceId?: string;
  spanId?: string;
};

type OtlpScopeLogs = {
  scope?: OtlpScope;
  logRecords?: OtlpLogRecord[];
};

type OtlpResourceLogs = {
  resource?: OtlpResource;
  scopeLogs?: OtlpScopeLogs[];
};

export type OtlpLogsResponse = {
  resourceLogs?: OtlpResourceLogs[];
};

const FALLBACK_SERVICE_NAME = "unknown-service";

export function normalizeOtlpLogs(
  payload: OtlpLogsResponse,
  fetchedAtMs: number = Date.now(),
): LogEntry[] {
  const resourceLogs = payload.resourceLogs ?? [];

  const normalizedOptLogs = resourceLogs.flatMap((resourceLog, resourceIndex) => {
    const resourceAttributes = decodeAttributes(resourceLog.resource?.attributes);
    const serviceName =
      getAttributeValue(resourceAttributes, "service.name") || FALLBACK_SERVICE_NAME;
    const serviceNamespace = getAttributeValue(resourceAttributes, "service.namespace");
    const serviceVersion = getAttributeValue(resourceAttributes, "service.version");
    const resourceId = createResourceId(resourceAttributes, resourceIndex);
    const resourceLabel = createResourceLabel(serviceName, serviceNamespace, serviceVersion);

    return (resourceLog.scopeLogs ?? []).flatMap((scopeLog, scopeIndex) => {
      const scopeAttributes = decodeAttributes(scopeLog.scope?.attributes);

      return (scopeLog.logRecords ?? []).map((record, recordIndex) => {
        const eventTimestamp = parseUnixNano(record.timeUnixNano);
        const observedTimestamp = parseUnixNano(record.observedTimeUnixNano);
        const timestamp = eventTimestamp ?? observedTimestamp;
        const attributes = decodeAttributes(record.attributes);
        const body = decodeAnyValue(record.body);
        const bodyText = formatDecodedValue(body);
        const severity = normalizeSeverity(record.severityText, record.severityNumber);
        const id = [
          resourceIndex,
          scopeIndex,
          recordIndex,
          timestamp?.unixNano ?? "invalid-time",
          record.traceId,
          record.spanId,
        ]
          .filter(Boolean)
          .join(":");

        return {
          id,
          resourceId,
          resourceLabel,
          serviceName,
          serviceNamespace,
          serviceVersion,
          scopeName: scopeLog.scope?.name,
          scopeVersion: scopeLog.scope?.version,
          timestampMs: timestamp?.timestampMs,
          timestampIso: timestamp?.iso,
          relativeTimeLabel: timestamp
            ? formatRelativeTime(timestamp.timestampMs, fetchedAtMs)
            : "",
          timeUnixNano: eventTimestamp?.unixNano,
          observedTimestampIso: observedTimestamp?.iso,
          severity,
          body,
          bodyText,
          attributes,
          resourceAttributes,
          scopeAttributes,
          traceId: record.traceId,
          spanId: record.spanId,
        };
      });
    });
  });

  const sortedLogs = normalizedOptLogs.sort(compareLogsByTimestamp);

  return sortedLogs;
}

export function decodeAttributes(attributes: OtlpKeyValue[] = []): Attribute[] {
  return attributes
    .filter((attribute): attribute is Required<Pick<OtlpKeyValue, "key">> & OtlpKeyValue =>
      Boolean(attribute.key),
    )
    .map((attribute) => {
      const value = decodeAnyValue(attribute.value);
      const displayValue = formatDecodedValue(value);

      return {
        key: attribute.key,
        value,
        displayValue,
        searchValue: displayValue.toLowerCase(),
      };
    });
}

export function decodeAnyValue(value?: OtlpAnyValue): DecodedValue {
  if (!value) {
    return null;
  }

  if ("stringValue" in value) return value.stringValue ?? "";
  if ("boolValue" in value) return Boolean(value.boolValue);
  if ("intValue" in value) return decodeInteger(value.intValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("bytesValue" in value)
    return value.bytesValue ? `[base64 bytes: ${value.bytesValue.length} chars]` : "";

  if (value.arrayValue) {
    return (value.arrayValue.values ?? []).map(decodeAnyValue);
  }

  if (value.kvlistValue) {
    return Object.fromEntries(
      (value.kvlistValue.values ?? [])
        .filter((entry): entry is Required<Pick<OtlpKeyValue, "key">> & OtlpKeyValue =>
          Boolean(entry.key),
        )
        .map((entry) => [entry.key, decodeAnyValue(entry.value)]),
    );
  }

  return null;
}

type ParsedTimestamp = {
  timestampMs: number;
  iso: string;
  unixNano: string;
};

function parseUnixNano(value?: string | number): ParsedTimestamp | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const unixNano = String(value);

  try {
    const timestampMs = Number(BigInt(value) / 1_000_000n);

    return {
      timestampMs,
      iso: new Date(timestampMs).toISOString(),
      unixNano,
    };
  } catch {
    return undefined;
  }
}

function compareLogsByTimestamp(first: LogEntry, second: LogEntry): number {
  if (first.timestampMs === undefined) {
    return second.timestampMs === undefined ? 0 : 1;
  }

  if (second.timestampMs === undefined) {
    return -1;
  }

  return second.timestampMs - first.timestampMs;
}

function decodeInteger(value?: string | number): number | string {
  if (value === undefined) {
    return 0;
  }

  const numericValue = Number(value);

  if (Number.isSafeInteger(numericValue)) {
    return numericValue;
  }

  return String(value);
}

function getAttributeValue(attributes: Attribute[], key: string): string | undefined {
  return attributes.find((attribute) => attribute.key === key)?.displayValue;
}

function createResourceLabel(
  serviceName: string,
  serviceNamespace?: string,
  serviceVersion?: string,
): string {
  const qualifiedName = serviceNamespace ? `${serviceNamespace}/${serviceName}` : serviceName;

  return serviceVersion ? `${qualifiedName}@${serviceVersion}` : qualifiedName;
}

function createResourceId(attributes: Attribute[], fallbackIndex: number): string {
  const stableAttributes = attributes
    .map((attribute) => `${attribute.key}=${attribute.displayValue}`)
    .sort()
    .join("|");

  return stableAttributes || `resource-${fallbackIndex}`;
}
