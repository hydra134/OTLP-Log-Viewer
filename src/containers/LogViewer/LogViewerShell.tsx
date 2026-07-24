import { AppShell, AppShellMain, Stack, Title } from "@mantine/core";

import { LogViewerClient } from "@/containers/LogViewer/LogViewerClient";
import { SummaryStats } from "@/containers/LogViewer/SummaryStats";
import type { ViewData } from "@/lib/types";

import styles from "./LogViewerShell.module.css";
import { LogHistogram } from "@/containers/LogViewer/LogHistogram";

type LogViewerShellProps = {
  data: ViewData;
};

export function LogViewerShell({ data }: LogViewerShellProps) {
  return (
    <AppShell padding="md">
      <AppShellMain className={styles.main}>
        <Stack gap="lg">
          <header>
            <Title order={1}>OTLP Log Viewer</Title>
          </header>

          <SummaryStats stats={data.stats} />

          <LogHistogram buckets={data.histogram} />

          <LogViewerClient data={data} />
        </Stack>
      </AppShellMain>
    </AppShell>
  );
}
