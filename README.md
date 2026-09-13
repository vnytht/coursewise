# CourseWise

A standalone course catalog and schedule planner for a fictional university, with nine native WebMCP tools. All course and seat data is sample data. No university affiliation or enrollment integration.

## Run

Requires Node 18+ for checks and Python 3 for local serving. No package installation or build step is necessary.

```sh
npm test
npm run dev
```

Open http://127.0.0.1:5173. The site uses device-local browser storage; it has no app accounts or backend. Serve over HTTPS or localhost for WebMCP. Static hosting publishes `dist/`.

## Product

- 60 courses, six departments, two terms, 384 sections.
- Search, department/level/unit/requirement/time/day/format filters; complete-section availability matching.
- Course detail and linked lecture/lab/discussion selection, wishlist, unit validation.
- Up to three named plans per term, duplicate/delete/undo, autosave, lock courses, busy blocks.
- Date-aware conflicts, unknown-time warnings, bounded alternative generation, reviewed atomic application.
- Weekly calendar, mobile agenda, print, timezone-aware ICS download.
- WebMCP lab: native registration status, real invocation log, 20 runnable deterministic checks.

## WebMCP

The adapter in `dist/app.js` feature-detects `document.modelContext`. Unsupported browsers retain the normal interface. Native tools are registered once and unregistered with an AbortSignal. No polyfill or simulated registration is used.

Tools: search_courses, get_course_details, get_plan_context, set_bookmark, add_course_bundle, remove_course_bundle, check_plan, propose_schedule, prepare_plan_export.

Use get_plan_context for the actual active plan ID/revision and get_course_details for real section IDs before mutations. Mutation request IDs are idempotent for the current page session; a reload clears the request cache. Student applies multi-course proposals in the visible UI. Reads and writes use the same scheduling engine as manual controls.

Example agent prompt: “Search CS courses in fall26. Inspect CS61, CS100, and CS188, then propose a schedule containing all three. Let me review the options.”

## Verification on September 13, 2026

- Node scheduling suite: 20/20 passing.
- Browser scheduling suite: 20/20 passing.
- Nine actual native WebMCP tools discovered and invoked through Codex in-app browser, including writes and proposal/export dialogs.
- Rejected missing linked lab, unknown course/term, and stale revision. Retrying the same addition request produced no duplicate.
- Agent proposed three courses totaling 12 units; UI application and state read-back confirmed all sections and no conflicts.
- Reload restored the plan. Busy-time addition and Undo restored prior state with a new revision.
- Desktop catalog/calendar and narrow-screen agenda inspected. No page console errors observed.
- Example eight-course alternative search: ~157 ms, 761 search nodes, three results; single local run, not a p95 benchmark.

No student usability study, statistical model comparison, full accessibility audit, or independent calendar-app import has been completed. The lab does not claim those results. ICS behavior is covered by deterministic timezone/date checks. Browser availability varies; the hosted site must be opened in a WebMCP-capable context for native agent use.

## Structure

- `dist/data.js`: fictional catalog and terms.
- `dist/engine.js`: shared scheduling, validation, search, generation, export.
- `dist/app.js`: UI, local persistence, WebMCP adapter.
- `dist/styles.css`: responsive visual design.
- `dist/checks.js` / `tests/engine.test.js`: browser and Node checks.

Planned later: cloud sync, sharing, embedded AI chat, real university feeds, verified prerequisite rules, finals, and travel estimates. None is implied by the current interface.
