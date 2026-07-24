import { Badge } from "@mantine/core";

import { severityColors } from "@/lib/severity";
import type { NormalizedSeverity } from "@/lib/types";

type SeverityBadgeProps = {
  severity: NormalizedSeverity;
};

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <Badge color={severityColors[severity.level]} variant="light" radius="sm">
      {severity.text}
    </Badge>
  );
}
