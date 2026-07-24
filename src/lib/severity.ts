import type { LogEntry, SeverityLevel } from "./types";

const SEVERITY_BY_NUMBER: Array<{
  min: number;
  max: number;
  level: SeverityLevel;
  fallback: string;
}> = [
  { min: 1, max: 4, level: "trace", fallback: "TRACE" },
  { min: 5, max: 8, level: "debug", fallback: "DEBUG" },
  { min: 9, max: 12, level: "info", fallback: "INFO" },
  { min: 13, max: 16, level: "warn", fallback: "WARN" },
  { min: 17, max: 20, level: "error", fallback: "ERROR" },
  { min: 21, max: 24, level: "fatal", fallback: "FATAL" },
];

export const severityOrder: SeverityLevel[] = [
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
  "unknown",
];

export const severityLabels: Record<SeverityLevel, string> = {
  trace: "Trace",
  debug: "Debug",
  info: "Info",
  warn: "Warn",
  error: "Error",
  fatal: "Fatal",
  unknown: "Unknown",
};

export const severityColors: Record<SeverityLevel, string> = {
  trace: "gray",
  debug: "blue",
  info: "teal",
  warn: "yellow",
  error: "red",
  fatal: "grape",
  unknown: "dark",
};

export const severityChartColors: Record<SeverityLevel, string> = {
  trace: "gray.6",
  debug: "blue.6",
  info: "teal.6",
  warn: "yellow.6",
  error: "red.7",
  fatal: "grape.7",
  unknown: "dark.5",
};

export function normalizeSeverity(severityText?: string, severityNumber?: number) {
  const text = severityText?.trim();
  const levelFromText = parseSeverityText(text);

  if (levelFromText) {
    return {
      level: levelFromText,
      text: text || severityLabels[levelFromText].toUpperCase(),
      number: severityNumber,
    };
  }

  const range = SEVERITY_BY_NUMBER.find(
    (item) => severityNumber && severityNumber >= item.min && severityNumber <= item.max,
  );

  if (range) {
    return {
      level: range.level,
      text: text || range.fallback,
      number: severityNumber,
    };
  }

  return {
    level: "unknown" as const,
    text: text || "UNKNOWN",
    number: severityNumber,
  };
}

export function createSeverityCounts(logs: LogEntry[]): Record<SeverityLevel, number> {
  return severityOrder.reduce(
    (counts, level) => ({
      ...counts,
      [level]: logs.filter((log) => log.severity.level === level).length,
    }),
    {} as Record<SeverityLevel, number>,
  );
}

function parseSeverityText(value?: string): SeverityLevel | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.toLowerCase();

  if (normalized.startsWith("trace")) return "trace";
  if (normalized.startsWith("debug")) return "debug";
  if (normalized.startsWith("info")) return "info";
  if (normalized.startsWith("warn")) return "warn";
  if (normalized.startsWith("error")) return "error";
  if (normalized.startsWith("fatal")) return "fatal";

  return undefined;
}
