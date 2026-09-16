import test from 'node:test';
import assert from 'node:assert/strict';
import {buildDemo, constraintSummary} from '../dist/demo.js';
import {applyProposal, checkPlan, generate} from '../dist/engine.js';

test('guided demo generates feasible 12-unit options and preserves its base', () => {
  const {plan, result} = buildDemo('isolated-test');
  assert.ok(result.options.length > 0);
  const before = structuredClone(plan);
  for (const option of result.options) {
    const applied = applyProposal(plan, option);
    assert.equal(checkPlan(applied).units, 12);
    assert.deepEqual(checkPlan(applied).issues, []);
    assert.deepEqual(applied.blocks, before.blocks);
    assert.deepEqual(applied.items.map(i => i.course).sort(), ['CS100','CS188','CS61']);
  }
  assert.deepEqual(plan, before);
});

test('guided demo instances do not share mutable state', () => {
  const first = buildDemo('first');
  first.plan.blocks[0].name = 'Changed';
  const second = buildDemo('second');
  assert.equal(second.plan.blocks[0].name, 'Work');
  assert.equal(second.result.options[0].planId, 'second');
  assert.equal(constraintSummary(second.plan).busyBlocks, 1);
});

test('impossible planning constraints return no options without mutation', () => {
  const {plan} = buildDemo();
  plan.constraints.earliest = 1199;
  const before = structuredClone(plan);
  const result = generate(plan, ['CS61','CS100','CS188'], ['CS61','CS100','CS188']);
  assert.equal(result.options.length, 0);
  assert.ok(result.reason);
  assert.deepEqual(plan, before);
});
