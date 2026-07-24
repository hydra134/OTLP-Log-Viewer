"use client";

import { Alert, Box, Card, Group, Paper, Skeleton, Stack, Text, Title } from "@mantine/core";
import dynamic from "next/dynamic";

import { formatChartTime, formatCount } from "@/lib/formatters";
import { severityChartColors, severityLabels, severityOrder } from "@/lib/severity";
import type { HistogramBucket, SeverityLevel } from "@/lib/types";

import styles from "./LogHistogram.module.css";

const BarChart = dynamic(() => import("@mantine/charts").then((module) => module.BarChart), {
  ssr: false,
  loading: () => <Skeleton height={240} radius="md" />,
});

type LogHistogramProps = {
  buckets: HistogramBucket[];
};

type HistogramChartDatum = Record<SeverityLevel, number> & {
  time: number;
  timeLabel: string;
  total: number;
};

export function LogHistogram({ buckets }: LogHistogramProps) {
  const data: HistogramChartDatum[] = buckets.map((bucket) => ({
    time: bucket.startMs,
    timeLabel: bucket.label,
    total: bucket.count,
    ...bucket.severityCounts,
  }));
  const visibleSeverities = severityOrder.filter((level) =>
    buckets.some((bucket) => bucket.severityCounts[level] > 0),
  );
  const series = visibleSeverities.map((level) => ({
    name: level,
    label: severityLabels[level],
    color: severityChartColors[level],
  }));

  return (
    <Card withBorder radius="lg" p="lg">
      <Stack gap="md">
        <div>
          <Title order={2}>Log distribution</Title>
          <Text c="dimmed" size="sm">
            Log records over time, stacked by severity
          </Text>
        </div>
        {data.length ? (
          <Box className={styles.chartFrame}>
            <BarChart
              w="100%"
              miw={0}
              h={240}
              data={data}
              dataKey="time"
              series={series}
              type="stacked"
              tickLine="y"
              withLegend
              classNames={{ container: styles.chartContainer }}
              barChartProps={{ reverseStackOrder: true }}
              legendProps={{
                itemSorter: (item) => severityOrder.indexOf(item.value as SeverityLevel),
              }}
              xAxisProps={{ tickFormatter: formatChartTime }}
              yAxisProps={{ allowDecimals: false }}
              tooltipProps={{
                content: ({ active, payload }) => (
                  <HistogramTooltip
                    active={active}
                    datum={payload?.[0]?.payload as HistogramChartDatum | undefined}
                    severities={visibleSeverities}
                  />
                ),
              }}
            />
          </Box>
        ) : (
          <Alert color="gray" variant="light">
            No logs are available to chart.
          </Alert>
        )}
      </Stack>
    </Card>
  );
}

type HistogramTooltipProps = {
  active: boolean;
  datum?: HistogramChartDatum;
  severities: SeverityLevel[];
};

function HistogramTooltip({ active, datum, severities }: HistogramTooltipProps) {
  if (!active || !datum) {
    return null;
  }

  return (
    <Paper withBorder shadow="md" p="sm">
      <Text fw={600} size="sm" mb="xs">
        {datum.timeLabel}
      </Text>
      <Group justify="space-between" gap="xl" mb={4}>
        <Text fw={600} size="xs">
          Total
        </Text>
        <Text fw={600} size="xs">
          {formatCount(datum.total)}
        </Text>
      </Group>
      <Stack gap={4}>
        {severities.map((level) => (
          <Group justify="space-between" gap="xl" key={level} wrap="nowrap">
            <Group gap="xs" wrap="nowrap">
              <Box bg={severityChartColors[level]} h={8} w={8} style={{ borderRadius: "50%" }} />
              <Text size="xs">{severityLabels[level]}</Text>
            </Group>
            <Text size="xs">{formatCount(datum[level])}</Text>
          </Group>
        ))}
      </Stack>
    </Paper>
  );
}
