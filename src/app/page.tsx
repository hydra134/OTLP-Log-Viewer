import { LogViewerShell } from "@/containers/LogViewer/LogViewerShell";
import { getLogsViewData } from "@/api/logs";

export default async function Home() {
  const data = await getLogsViewData();

  return <LogViewerShell data={data} />;
}
