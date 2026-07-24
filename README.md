# OTLP Log Viewer

A server-rendered OpenTelemetry log viewer built with Next.js App Router, TypeScript, Mantine, and Mantine Charts.

The app fetches random mock OTLP log records from:

```text
https://take-home-assignment-otlp-logs-api.vercel.app/api/v2/logs
```

## Features

- SSR-first data loading with `cache: "no-store"` so every refresh can retrieve a new random API payload.
- Flat log table with severity, timestamp, body, and expandable OTLP attributes.
- URL-backed flat-list pagination that does not refetch the random dataset when changing pages.
- Grouped view organized by parent resource, with service metadata and severity counts.
- Mantine Charts histogram showing log distribution over time, stacked by severity.
- Recursive OTLP `AnyValue` decoding for log body, resource attributes, scope attributes, and record attributes.
- Invalid timestamps are counted, excluded from the histogram, labeled in the table, and sorted last.

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Quality Commands

```bash
npm run lint
npm run stylelint
npm run format:check
npm run build
```

Use `npm run format` to apply Prettier formatting.

## Architecture Notes

The app treats the App Router as the owner of server data. `src/app/page.tsx` fetches the OTLP payload on the server, normalizes records, computes resource groups, summary stats, and histogram buckets, then passes serializable view data into a focused client island.

Client components are limited to interactions that need the browser: URL-backed pagination, row expansion, grouped-view disclosure state, view-mode switching, and Mantine Charts rendering. Pagination uses the native History API so changing pages updates navigation state without refetching the API. There is no global client store because the canonical data is server-fetched and the remaining state is local UI state.

Domain logic lives in `src/lib`:

- `src/api/logs.ts`: server fetch and view-data assembly.
- `otlp.ts`: OTLP response types, timestamp parsing, `AnyValue` decoding, and normalization.
- `histogram.ts`: deterministic time bucketing.
- `severity.ts`: severity normalization, ordering, labels, and colors.
- `formatters.ts`: display formatting.

Hooks are intentionally thin and UI-focused. Components compose Mantine primitives and delegate OTLP-specific logic to the domain modules.

## Filtering And Sharing Discussion

Filtering is intentionally discussion-only for this assignment. The random-data endpoint makes a shared query different from a shared result snapshot, so the product and backend semantics should be clarified before implementation.

Questions I would ask product and users before expanding this:

- Which investigations are most common: incident triage, release verification, debugging a single trace, or service health review?
- Should shared links represent a live query against fresh logs or an immutable snapshot of what the sender saw?
- Which fields must be first-class filters: service, severity, time range, trace ID, deployment version, host, region, or arbitrary attributes?
- Do users expect Datadog-style query syntax, guided filter controls, or both?
- What is the expected data size and retention window for this viewer?

Questions for backend:

- Can the API support server-side filtering, pagination, time range constraints, and stable sorting?
- Which attributes are indexed, and what are the cardinality limits?
- Are timestamps guaranteed to be populated and ordered?
- Should filtering use OTLP severity numbers, severity text, or both?
- How should malformed or unknown OTLP values be represented?

Next-step frontend architecture:

- Introduce a typed filter model that maps cleanly to URL params and backend query params.
- Keep URL params as the source of truth for shareable filters.
- Add an attribute filter builder for `key operator value` once backend semantics are clear.
- Move filtering from local server-side processing to API-backed queries when data volume exceeds a single response.
- Consider saved searches or shared investigations only after clarifying whether sharing means live query, snapshot, or collaborative note.

Trade-offs:

- Client/server filtering: client filtering is fast for this mock dataset, but backend filtering is required for large log volumes and pagination.
- Free text/structured filters: free text is quick and forgiving, while structured filters are precise and easier to optimize.
- URL/saved state: URL params are simple and shareable; saved investigations need identity, persistence, permissions, and lifecycle rules.
- UX/performance: eager filtering feels responsive, but debouncing or explicit apply controls avoid noisy route updates and expensive backend calls.
- Observability constraints: arbitrary attribute filters can create high-cardinality queries, so the UI should guide users toward indexed fields first.

## Deployment

This app is ready to deploy to Vercel. The API is public and does not require environment variables.

## Known Limitations

- The API returns random mock data on each request, so refreshes replace the current dataset.
- Filtering remains a product and architecture discussion rather than an implemented feature.
- The app does not virtualize rows; that is a deliberate scope choice for the expected take-home dataset size.

## Tech Stack

- Next.js App Router
- TypeScript
- Mantine
- Mantine Charts
- ESLint
- Prettier
- Stylelint
