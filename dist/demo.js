import {getTerm} from './data.js';
import {newPlan, generate} from './engine.js';

// A deterministic, isolated example—not an LLM or a recorded agent session.
export function buildDemo(id = 'guided-demo') {
  const plan = newPlan('fall26', id, 'Guided demo');
  const term = getTerm(plan.term);
  plan.constraints = {...plan.constraints, minUnits: 12, maxUnits: 12};
  plan.blocks.push({id: 'demo-work', name: 'Work', days: [2], start: 540,
    end: 720, startDate: term.start, endDate: term.end, exceptions: term.exceptions});
  const courses = ['CS61', 'CS100', 'CS188'];
  return {plan, result: generate(plan, courses, courses)};
}

export function constraintSummary(plan) {
  const c = plan.constraints;
  return {units: `${c.minUnits}–${c.maxUnits} units`,
    busyBlocks: plan.blocks.length, lockedCourses: plan.items.filter(i => i.locked).length,
    noFriday: c.noFriday, openOnly: c.openOnly,
    preference: c.preference === 'gaps' ? 'smaller gaps between classes' : 'fewer days on campus'};
}
