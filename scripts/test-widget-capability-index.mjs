#!/usr/bin/env node
import assert from 'node:assert/strict';
import { generateCapabilityIndex, resolveEvidenceLocator, validateGeneratedIndex } from './build-widget-capability-index.mjs';

const index = validateGeneratedIndex(await generateCapabilityIndex());
assert(index.sources.length > 0);
assert(index.hosts.length > 0);
assert(index.surfaces.some(surface => surface.surfaceId === 'my-desk-widget-authoring'));
assert(index.surfaces.some(surface => surface.surfaceId === 'detail-page-widget-authoring' && surface.families.length === 0), 'detail-page must not claim family coverage it has not earned');
assert.equal(index.sourceIdentities.length, 8);
assert.deepEqual(index.sourceIdentities.map(identity => [identity.relationshipTarget, identity.source]), [
    ['AllJobCost', 'allJobCosts'], ['Division', 'divisions'], ['InventoryCost', 'inventoryCosts'],
    ['JobTitles', 'jobTitle'], ['LabourCost', 'labourCosts'], ['ProductSupplier', 'productSuppliers'],
    ['PurchaseOrderItem', 'purchaseOrderItems'], ['RecipientProduct', 'recipientProducts'],
]);
for (const identity of index.sourceIdentities) assert.equal(resolveEvidenceLocator(index, identity.evidence), identity);
for (const source of index.sources) for (const option of source.options) {
    assert.equal(option.evidence.kind, 'report-path');
    assert(Array.isArray(option.evidence.path));
}
assert.throws(() => validateGeneratedIndex({ ...index, generatorProtocolVersion: 'wrong' }));
const firstSource = index.sources[0];
const duplicate = { ...index, sources: [...index.sources, { ...firstSource, options: [firstSource.options[0]] }] };
assert.throws(() => resolveEvidenceLocator(duplicate, firstSource.options[0].evidence), /exactly once/);
console.log(JSON.stringify({ passed: true, sources: index.sources.length, hosts: index.hosts.length, surfaces: index.surfaces.length }));
