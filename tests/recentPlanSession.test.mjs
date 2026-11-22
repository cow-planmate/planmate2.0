import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { saveRecentPlan, getRecentPlan, clearRecentPlan } from '../src/utils/recentPlanSession.js';

const storage = new Map();
const events = [];
globalThis.sessionStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
};
globalThis.window = { dispatchEvent: (event) => events.push(event.type) };
globalThis.CustomEvent = class { constructor(type) { this.type = type; } };
beforeEach(() => { storage.clear(); events.length = 0; });

test('deleting another plan preserves the current recent edit shortcut', () => {
  saveRecentPlan({ planId: 'current', planName: '부산' });
  clearRecentPlan('other');
  assert.equal(getRecentPlan().path, '/create?id=current');
  assert.equal(events.length, 1);
});
test('deleting the recent plan clears the shortcut and notifies the navbar', () => {
  saveRecentPlan({ planId: 'recent', planName: '부산' });
  clearRecentPlan('recent');
  assert.equal(getRecentPlan(), null);
  assert.equal(events.length, 2);
});
test('bulk deletion only clears a matching shortcut, including encoded IDs', () => {
  saveRecentPlan({ planId: 'a/b', planName: '부산' });
  ['other', 'a/b', 'last'].forEach(clearRecentPlan);
  assert.equal(getRecentPlan(), null);
  assert.equal(events.length, 2);
});
test('deleting a saved plan preserves the unsaved draft shortcut', () => {
  saveRecentPlan({ planId: -1, planName: '임시 일정' });
  clearRecentPlan('saved');
  assert.equal(getRecentPlan().path, '/create');
  clearRecentPlan();
  assert.equal(getRecentPlan(), null);
});
