# CourseWise

Agent-assisted course planning, with the student in control.

CourseWise helps students discover courses, compare linked sections, and build a semester around their constraints. A browser agent can propose a schedule through **nine native WebMCP tools**; the student reviews the options before applying a proposal.

Built by [Vinay Thorat](https://github.com/vnytht). Independent prototype using fictional university data—not an enrollment system.

## Product decisions

- **Keep decisions visible.** Show exact sections and scheduling trade-offs before applying a proposal, with Undo afterward.
- **Respect existing commitments.** Check date-aware conflicts, linked lectures and labs, busy time, locked courses, and unit constraints.
- **Make assistance easy to try.** A guided, deterministic demo works without an agent-compatible browser and saves into a separate plan.
- **Use one source of logic.** Manual controls and agent tools share the same scheduling engine.

## Preliminary usability findings

The project owner's study summary reports **20 students** completing course discovery, skill-relevance assessment, selection, and schedule creation using manual and assisted workflows.

| Reported mean completion time | Manual | Assisted |
| --- | --- | --- |
| Workflow | 8 min 20 sec | 5 min 50 sec |

That is **30% lower average completion time**: `(500 − 350) / 500 × 100`.

These are owner-reported aggregate results from a small sample, not an independently verified or causal finding. Participant-level timings, task order, and completion rates are not documented. See [study details and limitations](STUDY.md).

## Run locally

Requires Node.js 18+ and Python 3. No dependencies or build step.

```sh
git clone https://github.com/vnytht/coursewise.git
cd coursewise
npm test
npm run dev
```

Open [localhost:5173](http://127.0.0.1:5173). Select **Try planning demo**, generate sample options, and review a 12-unit CS schedule that protects Tuesday morning for work. Saving creates a separate demo plan; Undo reverses it. Select **Project & study** for the in-app case study.

## Implementation

Vanilla JavaScript, HTML, and CSS. The synthetic catalog contains 60 courses across six departments and two terms. Plans persist in browser-local storage; there are no accounts or application backend.

| Module | Responsibility |
| --- | --- |
| [engine.js](dist/engine.js) | Validation, conflict detection, bounded schedule generation, calendar export |
| [app.js](dist/app.js) | Interface, local persistence, native WebMCP adapter |
| [data.js](dist/data.js) | Fictional courses, sections, and terms |
| [demo.js](dist/demo.js) | Guided planning example |
| [tests](tests) | Scheduling and demo regression checks |

The interface supports filtering, shortlists, linked-section selection, up to three named plans per term, weekly calendars, mobile agendas, and ICS export. Static hosts can serve `dist/` directly.

### Agent interface

The adapter feature-detects `document.modelContext`; ordinary planning remains available when it is unsupported. Live agent use requires a compatible browser and agent. The guided demo is not a live AI response.

- Discovery: `search_courses`, `get_course_details`, `get_plan_context`
- Plan changes: `set_bookmark`, `add_course_bundle`, `remove_course_bundle`
- Review: `check_plan`, `propose_schedule`, `prepare_plan_export`

Mutation tools validate plan revisions and linked sections. Request IDs prevent repeated mutations within the current page session. Multi-course proposals require application through the visible student interface; individual mutation tools can directly update the plan.

## Validation and scope

The test suite contains **23 automated checks**, including linked-section validation, date-aware conflicts, stale proposals, and demo isolation. The in-app WebMCP lab exposes 20 deterministic engine checks. Automated checks are separate from usability evidence.

This prototype does not verify prerequisites, degree eligibility, skill outcomes, or live seat availability. It has no university integration, cloud sync, or embedded AI chat. Implementation used AI assistance; product decisions and project ownership remain with Vinay Thorat.
