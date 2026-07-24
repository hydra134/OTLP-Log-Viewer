"use client";

import { Alert, Button, Container, Stack, Title } from "@mantine/core";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <Container size="sm" py="xl">
      <Stack gap="md">
        <Title order={1}>Unable to load logs</Title>
        <Alert color="red" title="The OTLP API request failed">
          {error.message}
        </Alert>
        <Button onClick={reset}>Try again</Button>
      </Stack>
    </Container>
  );
}
