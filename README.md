# OTLP Log Viewer

A server-rendered OpenTelemetry log viewer built with Next.js App Router, TypeScript, Mantine, and Mantine Charts.

It displays random mock OTLP records from the provided [logs API](https://take-home-assignment-otlp-logs-api.vercel.app/api/v2/logs).

**Live demo:** [otlp-log-viewer.vercel.app](https://otlp-log-viewer.vercel.app)

## Features

- Flat log table with severity, timestamp, body, and expandable OTLP attributes
- Histogram of log distribution over time, stacked by severity
- Collapsible groups organized by parent OTLP resource and service metadata
- URL-backed pagination for the flat view without refetching the dataset
- Recursive decoding of OTLP `AnyValue` bodies and attributes
- Graceful handling of unknown severities, malformed timestamps, and API failures

## Getting Started

Requires Node.js 20.9 or newer and network access to the mock API.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To run a production build locally:

```bash
npm run build
npm run start
```

The public API does not require environment variables.

## Architecture

`src/app/page.tsx` owns the server-rendering boundary and delegates fetching and view-data assembly to `src/api/logs.ts`. The API response is normalized into serializable log entries, resource groups, summary statistics, and histogram buckets before reaching the UI.

- Server fetching uses `cache: "no-store"` because the endpoint returns a new random payload on each request.
- OTLP parsing, timestamp handling, severity normalization, histogram bucketing, and formatting live in `src/lib`.
- Client components handle only browser interactions: pagination, expansion state, view switching, and chart rendering.
- Pagination is stored in the URL with the native History API, preserving the current dataset while supporting browser navigation.
- Local component state is sufficient, so the app does not introduce a global client store.

## Known Limitations

- Refreshing replaces the dataset because the API returns random mock data.
- Filtering and shared investigations remain design proposals rather than implemented features.
- Rows are not virtualized because the expected assignment dataset is small.
