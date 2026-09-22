# CourseWise

### Find the right courses. Build a semester that works.

CourseWise brings course discovery, selection, and scheduling into one workspace. Students can plan manually or use a browser agent to explore options—then review the proposed schedule before applying it.

Created by [Vinay Thorat](https://github.com/vnytht).

## The problem

Choosing courses means balancing interests, linked lectures and labs, overlapping meetings, unit targets, and commitments outside class. A useful planning assistant needs to account for those constraints while leaving the student in control.

## The experience

- **Discover and shortlist.** Search courses and filter by department, level, units, requirements, availability, and meeting preferences.
- **Build around commitments.** Protect busy time, lock selected courses, and compare compatible section combinations.
- **Review before applying.** Inspect proposed schedules, exact sections, and trade-offs. Apply a proposal or adjust the constraints.
- **Keep planning flexible.** Maintain multiple plans, undo changes, and export a schedule to a calendar.

## Product approach

**Student control.** Multi-course proposals require student approval. Changes remain visible and reversible.

**Constraint-aware assistance.** The scheduler checks linked sections and date-aware conflicts, and rejects stale proposals rather than overwriting a newer plan.

**Consistent behavior.** Manual actions and nine native WebMCP tools use the same scheduling engine.

**Accessible exploration.** A clearly labeled guided example lets visitors experience the planning workflow without a compatible browser agent.

## Preliminary evaluation

The project owner's usability summary reports **20 students** finding courses, assessing relevance to their skill goals, selecting courses, and creating schedules.

| Reported average workflow time | |
| --- | --- |
| Manual planning | 8 min 20 sec |
| Assisted planning | 5 min 50 sec |
| Reduction | **30%** |

This is a preliminary, owner-reported result from a small sample—not a causal or independently verified finding. [Study methodology and limitations →](STUDY.md)

## Engineering

Built with JavaScript, HTML, and CSS. A shared scheduling engine powers the interface and the WebMCP integration, with validation for linked sections, plan revisions, and repeated mutation requests.

**23 automated checks** cover scheduling rules and guided-flow behavior. Plans are stored locally on the student's device.

[Scheduling engine](dist/engine.js) · [WebMCP integration](dist/app.js) · [Tests](tests)

## Current scope

CourseWise is an independent planning prototype with a synthetic catalog of 60 courses across two terms. It is not connected to university enrollment systems and does not verify degree eligibility, prerequisites, skill outcomes, or live seats. Live agent assistance requires a compatible browser; the guided example is deterministic.
