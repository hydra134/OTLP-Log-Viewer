import { Code, Stack, Table, Text } from "@mantine/core";

import { formatDecodedValue } from "@/lib/formatters";
import type { Attribute, DecodedValue } from "@/lib/types";

import styles from "./AttributeTree.module.css";

type AttributeTreeProps = {
  attributes: Attribute[];
  emptyLabel?: string;
};

type ValueViewProps = {
  value: DecodedValue;
};

export function AttributeTree({ attributes, emptyLabel = "No attributes" }: AttributeTreeProps) {
  if (attributes.length === 0) {
    return (
      <Text c="dimmed" size="sm">
        {emptyLabel}
      </Text>
    );
  }

  return (
    <Table.ScrollContainer minWidth={420}>
      <Table className={styles.table} verticalSpacing="xs">
        <Table.Tbody>
          {attributes.map((attribute) => (
            <Table.Tr key={attribute.key}>
              <Table.Th className={styles.keyCell}>
                <Code>{attribute.key}</Code>
              </Table.Th>
              <Table.Td>
                <ValueView value={attribute.value} />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}

export function ValueView({ value }: ValueViewProps) {
  if (Array.isArray(value)) {
    return (
      <Stack gap={4}>
        {value.map((item, index) => (
          <Text component="div" size="sm" key={`${formatDecodedValue(item)}-${index}`}>
            <Code>{index}</Code> <ValueView value={item} />
          </Text>
        ))}
      </Stack>
    );
  }

  if (value && typeof value === "object") {
    return (
      <Stack gap={4}>
        {Object.entries(value).map(([key, nestedValue]) => (
          <Text component="div" size="sm" key={key}>
            <Code>{key}</Code> <ValueView value={nestedValue} />
          </Text>
        ))}
      </Stack>
    );
  }

  return (
    <Text component="span" size="sm">
      {formatDecodedValue(value)}
    </Text>
  );
}
