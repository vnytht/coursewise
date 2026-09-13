import test from 'node:test';
import assert from 'node:assert/strict';
import {runChecks} from '../dist/checks.js';
for(const r of runChecks())test(r.name,()=>assert.equal(r.pass,true,r.error));
