"use client";

import {
  Badge,
  Card,
  Collapse,
  Group,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { useMemo } from "react";

import { AttributeTree } from "@/components/AttributeTree";
import { LogTable } from "@/containers/LogViewer/LogTable";
import { formatCount } from "@/lib/formatters";
import {
  createSeverityCounts,
  severityColors,
  severityLabels,
  severityOrder,
} from "@/lib/severity";
import type { LogEntry, ResourceGroup } from "@/lib/types";

import styles from "./GroupedLogView.module.css";

type GroupedLogViewProps = {
  groups: ResourceGroup[];
  logs: LogEntry[];
  isGroupExpanded: (id: string) => boolean;
  onToggleGroup: (id: string) => void;
  isLogExpanded: (id: string) => boolean;
  onToggleLog: (id: string) => void;
};

export function GroupedLogView({
  groups,
  logs,
  isGroupExpanded,
  onToggleGroup,
  isLogExpanded,
  onToggleLog,
}: GroupedLogViewProps) {
  const logsById = useMemo(() => new Map(logs.map((log) => [log.id, log])), [logs]);
  const visibleGroups = useMemo(
    () =>
      groups
        .map((group) => {
          const groupLogs = group.logIds
            .map((id) => logsById.get(id))
            .filter((log): log is LogEntry => Boolean(log));

          return {
            ...group,
            logs: groupLogs,
            severityCounts: createSeverityCounts(groupLogs),
          };
        })
        .filter((group) => group.logs.length > 0),
    [groups, logsById],
  );

  if (visibleGroups.length === 0) {
    return (
      <Card withBorder radius="lg" p="lg">
        <Text c="dimmed">No resource groups are available.</Text>
      </Card>
    );
  }

  return (
    <Stack gap="md">
      {visibleGroups.map((group) => {
        const expanded = isGroupExpanded(group.id);

        return (
          <Card withBorder radius="lg" p={0} key={group.id}>
            <UnstyledButton className={styles.header} onClick={() => onToggleGroup(group.id)}>
              <Group justify="space-between" align="flex-start">
                <Group gap="md">
                  <ThemeIcon variant="light" radius="xl">
                    {expanded ? "-" : "+"}
                  </ThemeIcon>
                  <Stack gap={2}>
                    <Text fw={700}>{group.label}</Text>
                    <Text size="sm" c="dimmed">
                      {formatCount(group.logs.length)} logs
                    </Text>
                  </Stack>
                </Group>
                <Group gap="xs">
                  {severityOrder
                    .filter((level) => group.severityCounts[level] > 0)
                    .map((level) => (
                      <Badge key={level} color={severityColors[level]} variant="light" radius="sm">
                        {severityLabels[level]} {group.severityCounts[level]}
                      </Badge>
                    ))}
                </Group>
              </Group>
            </UnstyledButton>
            <Collapse expanded={expanded} keepMounted={false}>
              <Stack p="md" gap="md">
                <AttributeTree attributes={group.attributes} />
                <LogTable logs={group.logs} isExpanded={isLogExpanded} onToggle={onToggleLog} />
              </Stack>
            </Collapse>
          </Card>
        );
      })}
    </Stack>
  );
}
