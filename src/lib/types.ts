export type DecodedValue =
  string | number | boolean | null | DecodedValue[] | { [key: string]: DecodedValue };

export type Attribute = {
  key: string;
  value: DecodedValue;
  displayValue: string;
  searchValue: string;
};

export type SeverityLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal" | "unknown";

export type NormalizedSeverity = {
  level: SeverityLevel;
  text: string;
  number?: number;
};

export type LogEntry = {
  id: string;
  resourceId: string;
  resourceLabel: string;
  serviceName: string;
  serviceNamespace?: string;
  serviceVersion?: string;
  scopeName?: string;
  scopeVersion?: string;
  timestampMs?: number;
  timestampIso?: string;
  relativeTimeLabel: string;
  timeUnixNano?: string;
  observedTimestampIso?: string;
  severity: NormalizedSeverity;
  body: DecodedValue;
  bodyText: string;
  attributes: Attribute[];
  resourceAttributes: Attribute[];
  scopeAttributes: Attribute[];
  traceId?: string;
  spanId?: string;
};

export type ResourceGroup = {
  id: string;
  label: string;
  serviceName: string;
  serviceNamespace?: string;
  serviceVersion?: string;
  attributes: Attribute[];
  logIds: string[];
  severityCounts: Record<SeverityLevel, number>;
};

export type HistogramBucket = {
  label: string;
  startMs: number;
  endMs: number;
  count: number;
  severityCounts: Record<SeverityLevel, number>;
};

export type SummaryStats = {
  totalLogs: number;
  resourceCount: number;
  invalidTimestampCount: number;
  timeRangeLabel: string;
  severityCounts: Record<SeverityLevel, number>;
};

export type ViewData = {
  entries: LogEntry[];
  groups: ResourceGroup[];
  histogram: HistogramBucket[];
  stats: SummaryStats;
  fetchedAt: string;
};
