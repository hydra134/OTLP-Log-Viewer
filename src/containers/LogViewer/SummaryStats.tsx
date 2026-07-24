import { Card, Group, SimpleGrid, Stack, Text, Title, Box, Badge } from "@mantine/core";

import { formatCount } from "@/lib/formatters";
import { severityColors, severityLabels, severityOrder } from "@/lib/severity";
import type { SummaryStats } from "@/lib/types";
import styles from "./SummartStats.module.css";

type SummaryStatsProps = {
  stats: SummaryStats;
};

export function SummaryStats({ stats }: SummaryStatsProps) {
  const visibleSeverities = severityOrder.filter((level) => stats.severityCounts[level] > 0);

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
      <Card withBorder radius="lg" p="md" orientation="horizontal" className={styles.summaryCard}>
        <Box mr={16}>
          <Text c="dimmed" size="sm">
            Logs
          </Text>
          <Title order={3}>{formatCount(stats.totalLogs)}</Title>
        </Box>
        <Box mr={16}>
          <Text c="dimmed" size="sm">
            Resources
          </Text>
          <Title order={3}>{formatCount(stats.resourceCount)}</Title>
        </Box>
        <Box>
          <Text c="dimmed" size="sm">
            Logs with invalid time
          </Text>
          <Title order={3} c={stats.invalidTimestampCount > 0 ? "orange" : undefined}>
            {formatCount(stats.invalidTimestampCount)}
          </Title>
        </Box>
      </Card>

      <Card withBorder radius="lg" p="md">
        <Stack gap={6}>
          <Text c="dimmed" size="sm">
            Severity mix
          </Text>

          {visibleSeverities.length ? (
            <Group gap="xs">
              {visibleSeverities.map((level) => (
                <Badge key={level} color={severityColors[level]} variant="light" radius="sm">
                  {severityLabels[level]} {formatCount(stats.severityCounts[level])}
                </Badge>
              ))}
            </Group>
          ) : (
            <Text size="sm">No logs available</Text>
          )}
        </Stack>
      </Card>

      <Card withBorder radius="lg" p="md">
        <Box mr={16}>
          <Text c="dimmed" size="sm">
            Time range
          </Text>
          <Title order={3}>{stats.timeRangeLabel}</Title>
        </Box>
      </Card>
    </SimpleGrid>
  );
}
