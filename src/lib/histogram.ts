import { formatTimestamp } from "./formatters";
import { createSeverityCounts } from "./severity";
import type { HistogramBucket, LogEntry } from "./types";

const DEFAULT_BUCKET_COUNT = 16;

export function createHistogramBuckets(
  logs: LogEntry[],
  bucketCount = DEFAULT_BUCKET_COUNT,
): HistogramBucket[] {
  if (logs.length === 0) {
    return [];
  }

  const validLogs = logs.filter(
    (log): log is LogEntry & { timestampMs: number } =>
      log.timestampMs !== undefined && Number.isFinite(log.timestampMs),
  );
  const timestamps = validLogs.map((log) => log.timestampMs);

  if (timestamps.length === 0) {
    return [];
  }

  const min = Math.min(...timestamps);
  const max = Math.max(...timestamps);

  if (min === max) {
    return [
      {
        label: formatTimestamp(min),
        startMs: min,
        endMs: max,
        count: validLogs.length,
        severityCounts: createSeverityCounts(validLogs),
      },
    ];
  }

  const actualBucketCount = Math.min(bucketCount, Math.max(1, validLogs.length));
  const bucketSize = Math.ceil((max - min) / actualBucketCount);
  const buckets = Array.from({ length: actualBucketCount }, (_, index) => {
    const startMs = min + index * bucketSize;
    const endMs = index === actualBucketCount - 1 ? max : startMs + bucketSize;

    return {
      label: formatTimestamp(startMs),
      startMs,
      endMs,
      count: 0,
      severityCounts: createSeverityCounts([]),
    };
  });

  validLogs.forEach((log) => {
    const bucketIndex = Math.min(
      Math.floor((log.timestampMs - min) / bucketSize),
      buckets.length - 1,
    );
    buckets[bucketIndex].count += 1;
    buckets[bucketIndex].severityCounts[log.severity.level] += 1;
  });

  return buckets;
}
