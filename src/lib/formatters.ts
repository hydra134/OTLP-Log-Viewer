import type { DecodedValue } from "./types";

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

const CHART_TIME_FORMAT = new Intl.DateTimeFormat("en", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

const NUMBER_FORMAT = new Intl.NumberFormat("en");

export function formatCount(value: number): string {
  return NUMBER_FORMAT.format(value);
}

export function formatTimestamp(timestampMs?: number): string {
  if (timestampMs === undefined || !Number.isFinite(timestampMs)) {
    return "Invalid time";
  }

  return DATE_TIME_FORMAT.format(new Date(timestampMs));
}

export function formatChartTime(timestampMs: number): string {
  if (!Number.isFinite(timestampMs)) {
    return "--:--";
  }

  return CHART_TIME_FORMAT.format(new Date(timestampMs));
}

export function formatTimeRange(startMs?: number, endMs?: number): string {
  if (startMs === undefined || endMs === undefined) {
    return "No time range";
  }

  if (startMs === endMs) {
    return formatTimestamp(startMs);
  }

  return `${formatTimestamp(startMs)} - ${formatTimestamp(endMs)}`;
}

export function formatRelativeTime(timestampMs: number, nowMs = Date.now()): string {
  if (!Number.isFinite(timestampMs)) {
    return "unknown";
  }

  const diffSeconds = Math.round((nowMs - timestampMs) / 1000);
  const absoluteSeconds = Math.abs(diffSeconds);

  if (absoluteSeconds < 60) {
    return `${absoluteSeconds}s ${diffSeconds >= 0 ? "ago" : "from now"}`;
  }

  const diffMinutes = Math.round(absoluteSeconds / 60);

  if (diffMinutes < 60) {
    return `${diffMinutes}m ${diffSeconds >= 0 ? "ago" : "from now"}`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ${diffSeconds >= 0 ? "ago" : "from now"}`;
  }

  const diffDays = Math.round(diffHours / 24);

  return `${diffDays}d ${diffSeconds >= 0 ? "ago" : "from now"}`;
}

export function formatDecodedValue(value: DecodedValue): string {
  if (value === null) {
    return "null";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value);
}
