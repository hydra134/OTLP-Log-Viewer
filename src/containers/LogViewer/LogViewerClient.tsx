"use client";

import { Group, Pagination, SegmentedControl, Stack, Text } from "@mantine/core";
import { useState } from "react";
import { GroupedLogView } from "@/containers/LogViewer/GroupedLogView";
import { LogTable } from "@/containers/LogViewer/LogTable";
import { useDisclosureSet } from "@/hooks/useDisclosureSet";
import { useOffsetPagination } from "@/hooks/useOffsetPagination";
import { formatCount, formatTimestamp } from "@/lib/formatters";
import type { ViewData } from "@/lib/types";

const PAGE_LIMIT = 50;

type PaginationProps = {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  rangeStart: number;
  rangeEnd: number;
  onChange?: (page: number) => void;
};

function PaginationBlock({
  totalItems,
  totalPages,
  currentPage,
  rangeStart,
  rangeEnd,
  onChange,
}: PaginationProps) {
  return (
    <Group justify="space-between" align="center">
      <Text size="sm" c="dimmed">
        Showing {formatCount(rangeStart)}-{formatCount(rangeEnd)} of {formatCount(totalItems)} logs
      </Text>
      {totalPages > 1 ? (
        <Pagination total={totalPages} value={currentPage} onChange={onChange} />
      ) : null}
    </Group>
  );
}

type ViewMode = "flat" | "grouped";

type LogViewerClientProps = {
  data: ViewData;
};

export function LogViewerClient({ data }: LogViewerClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("flat");
  const expandedLogs = useDisclosureSet();
  const expandedGroups = useDisclosureSet([]);
  const logsPage = useOffsetPagination({
    items: data.entries,
    limit: PAGE_LIMIT,
  });

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <Text size="sm" c="dimmed">
          Last fetched {formatTimestamp(Date.parse(data.fetchedAt))}
        </Text>

        <SegmentedControl
          value={viewMode}
          onChange={(value) => {
            setViewMode(value);

            expandedLogs.closeAll();

            if (value === "grouped") {
              logsPage.resetPage();
            }
          }}
          data={[
            { value: "flat", label: "Flat list" },
            { value: "grouped", label: "Grouped" },
          ]}
        />
      </Group>

      {viewMode === "flat" && (
        <PaginationBlock
          totalItems={logsPage.totalItems}
          totalPages={logsPage.totalPages}
          currentPage={logsPage.currentPage}
          rangeStart={logsPage.rangeStart}
          rangeEnd={logsPage.rangeEnd}
          onChange={(page) => {
            expandedLogs.closeAll();
            logsPage.setPage(page);
          }}
        />
      )}

      {viewMode === "flat" ? (
        <LogTable
          logs={logsPage.pageItems}
          isExpanded={expandedLogs.isOpen}
          onToggle={expandedLogs.toggle}
        />
      ) : (
        <GroupedLogView
          groups={data.groups}
          logs={data.entries}
          isGroupExpanded={expandedGroups.isOpen}
          onToggleGroup={expandedGroups.toggle}
          isLogExpanded={expandedLogs.isOpen}
          onToggleLog={expandedLogs.toggle}
        />
      )}

      {viewMode === "flat" && (
        <PaginationBlock
          totalItems={logsPage.totalItems}
          totalPages={logsPage.totalPages}
          currentPage={logsPage.currentPage}
          rangeStart={logsPage.rangeStart}
          rangeEnd={logsPage.rangeEnd}
          onChange={(page) => {
            expandedLogs.closeAll();
            logsPage.setPage(page);
          }}
        />
      )}
    </Stack>
  );
}
