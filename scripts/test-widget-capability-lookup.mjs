#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createCapabilityLookupSession, lookupCapability, validateIndexFreshness } from './widget-capability-lookup.mjs';

const index = JSON.parse(await readFile(new URL('../references/capability-index/capability-index.json', import.meta.url), 'utf8'));
const request = { source: 'customer', columns: [['Account number']], reportWidgetFamily: 'ChartView' };

const semanticOnly = lookupCapability(index, request);
assert.equal(semanticOnly.semantic.status, 'supported');
assert.equal(semanticOnly.browserAuthoring.status, 'needs-clarification');
assert.equal(semanticOnly.verifiedLifecycleState, 'evidence-validated-design');
assert.equal(semanticOnly.maximumPermittedNextState, 'reviewed-plan');
assert(semanticOnly.customerAnswer.forbiddenClaims.includes('saved'));

const browserUnavailable = lookupCapability(index, {
    ...request,
    browserAuthoring: { surfaceId: 'my-desk-widget-authoring', reportWidgetFamily: 'ChartView' },
});
assert.equal(browserUnavailable.semantic.status, 'supported');
assert.equal(browserUnavailable.browserAuthoring.status, 'unavailable');
assert(browserUnavailable.browserAuthoring.negativeConstraints.includes('family-not-covered-by-surface-doctrine'), 'ChartView is not in my-desk-widget-authoring.families');

const browserAvailable = lookupCapability(index, {
    ...request, reportWidgetFamily: 'ListView',
    browserAuthoring: { surfaceId: 'my-desk-widget-authoring', reportWidgetFamily: 'ListView' },
});
assert.equal(browserAvailable.browserAuthoring.status, 'available', 'my-desk-widget-authoring is live-proven for ListView');

const detailPageUnproven = lookupCapability(index, {
    ...request, reportWidgetFamily: 'ListView',
    browserAuthoring: { surfaceId: 'detail-page-widget-authoring', reportWidgetFamily: 'ListView' },
});
assert.equal(detailPageUnproven.browserAuthoring.status, 'unavailable', 'detail-page must not report browser availability for any family');

const container = lookupCapability(index, { source: 'customer', columns: [['Bank']] });
assert.equal(container.semantic.reasonCode, 'container-only-path');
assert.equal(container.maximumPermittedNextState, 'idea');

// A path with zero matches (not ambiguous, not a container) must report unknown-path, not throw.
// Regression test for a bug where `selected.find(option => !option)` returned the found `undefined`
// itself, which is falsy, so a genuinely missing option was treated as "nothing missing" and the
// code fell through to `selected.map(option => option.evidence)`, crashing on the undefined entry.
const unknownPath = lookupCapability(index, { source: 'supplier', columns: [['Company', 'Name']] });
assert.equal(unknownPath.semantic.reasonCode, 'unknown-path');
assert.equal(unknownPath.maximumPermittedNextState, 'idea');

// Same bug, but mixed with otherwise-valid paths — the exact shape that originally crashed.
const unknownPathMixed = lookupCapability(index, {
    source: 'supplier', columns: [['Company', 'Name'], ['Alias'], ['Account number']],
});
assert.equal(unknownPathMixed.semantic.reasonCode, 'unknown-path');

const protocolMismatch = await validateIndexFreshness({ ...index, generatorProtocolVersion: 'wrong' });
assert.deepEqual(protocolMismatch, { ok: false, reason: 'generator-protocol-mismatch' });
const missingInput = await validateIndexFreshness(index, async () => { throw new Error('missing'); });
assert.equal(missingInput.reason, 'index-stale-or-unavailable');

let reads = 0;
const read = async (path, encoding) => {
    reads++;
    if (String(path).endsWith('capability-index.json')) return JSON.stringify(index);
    return readFile(path, encoding);
};
const session = await createCapabilityLookupSession({ readFile: read });
const first = await session.lookup({ source: 'customer', columns: [['Account number']] });
const second = await session.lookup({ source: 'customer', columns: [['Account number']] });
assert.equal(first.cache.hit, false);
assert.equal(second.cache.hit, true);
assert(reads > 2, 'Freshness checks must read authority inputs on every lookup.');

const changedIndex = { ...index, authorityInputs: index.authorityInputs.map((input, position) => position ? input : { ...input, sha256: 'changed' }) };
const staleSession = await createCapabilityLookupSession({ readFile: async path => String(path).endsWith('capability-index.json') ? JSON.stringify(changedIndex) : readFile(path, 'utf8') });
const stale = await staleSession.lookup({ source: 'customer', columns: [['Account number']] });
assert.equal(stale.semantic.reasonCode, 'index-stale-or-unavailable');

console.log(JSON.stringify({ passed: true, cases: ['semantic-browser-separation', 'family-not-covered', 'browser-available', 'detail-page-unproven', 'lifecycle-boundary', 'protocol-mismatch', 'missing-input', 'cache-hit', 'cache-invalidation'] }));
