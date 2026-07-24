"use client";

import { ActionIcon, Badge, Box, Card, Collapse, Stack, Table, Tabs, Text } from "@mantine/core";
import { memo } from "react";

import { AttributeTree } from "@/components/AttributeTree";
import { SeverityBadge } from "@/components/SeverityBadge";
import { formatDecodedValue, formatTimestamp } from "@/lib/formatters";
import type { LogEntry } from "@/lib/types";

import styles from "./LogTable.module.css";

type LogTableProps = {
  logs: LogEntry[];
  isExpanded: (id: string) => boolean;
  onToggle: (id: string) => void;
};

function formatBodyDetails(body: LogEntry["body"]): string {
  if (typeof body === "string") {
    try {
      return JSON.stringify(JSON.parse(body), null, 2);
    } catch {
      return body;
    }
  }

  if (body === null || typeof body === "number" || typeof body === "boolean") {
    return formatDecodedValue(body);
  }

  return JSON.stringify(body, null, 2);
}

const LogTableRow = memo(function LogTableRowInner({
  log,
  expanded,
  onToggle,
}: {
  log: LogEntry;
  expanded: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <>
      <Table.Tr>
        <Table.Td>
          <ActionIcon
            variant="subtle"
            color="gray"
            aria-label={expanded ? "Collapse log details" : "Expand log details"}
            onClick={() => onToggle(log.id)}
          >
            {expanded ? "-" : "+"}
          </ActionIcon>
        </Table.Td>
        <Table.Td>
          <SeverityBadge severity={log.severity} />
        </Table.Td>
        <Table.Td>
          <Stack gap={2}>
            <Text size="sm">{formatTimestamp(log.timestampMs)}</Text>
            {log.relativeTimeLabel ? (
              <Text size="xs" c="dimmed">
                {log.relativeTimeLabel}
              </Text>
            ) : null}
          </Stack>
        </Table.Td>
        <Table.Td>
          <Badge variant="light" color="gray">
            {log.resourceLabel}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Text className={styles.bodyText}>{log.bodyText}</Text>
        </Table.Td>
      </Table.Tr>

      <Table.Tr>
        <Table.Td colSpan={5} className={styles.detailsCell}>
          <Collapse expanded={expanded} keepMounted={false}>
            <Box p="md">
              <Tabs defaultValue="attributes" variant="outline" keepMounted={false}>
                <Tabs.List>
                  <Tabs.Tab value="attributes">Attributes</Tabs.Tab>
                  <Tabs.Tab value="resource">Resource</Tabs.Tab>
                  <Tabs.Tab value="scope">Scope</Tabs.Tab>
                  <Tabs.Tab value="body">Body</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="attributes" pt="md">
                  <AttributeTree attributes={log.attributes} />
                </Tabs.Panel>
                <Tabs.Panel value="resource" pt="md">
                  <AttributeTree attributes={log.resourceAttributes} />
                </Tabs.Panel>
                <Tabs.Panel value="scope" pt="md">
                  <AttributeTree attributes={log.scopeAttributes} />
                </Tabs.Panel>
                <Tabs.Panel value="body" pt="md">
                  <pre className={styles.bodyDetails}>{formatBodyDetails(log.body)}</pre>
                </Tabs.Panel>
              </Tabs>
            </Box>
          </Collapse>
        </Table.Td>
      </Table.Tr>
    </>
  );
});

export function LogTable({ logs, isExpanded, onToggle }: LogTableProps) {
  if (logs.length === 0) {
    return (
      <Card withBorder radius="lg" p="lg">
        <Text c="dimmed">No logs are available.</Text>
      </Card>
    );
  }

  return (
    <Card withBorder radius="lg" p={0}>
      <Table.ScrollContainer minWidth={800} type="native">
        <Table className={styles.table} highlightOnHover highlightOnHoverColor="gray.0">
          <Table.Thead>
            <Table.Tr>
              <Table.Th className={styles.expandColumn} />
              <Table.Th className={styles.severityColumn}>Severity</Table.Th>
              <Table.Th className={styles.timeColumn}>Time</Table.Th>
              <Table.Th className={styles.resourceColumn}>Resource</Table.Th>
              <Table.Th>Body</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {logs.map((log) => (
              <LogTableRow
                key={log.id}
                log={log}
                expanded={isExpanded(log.id)}
                onToggle={onToggle}
              />
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Card>
  );
}
