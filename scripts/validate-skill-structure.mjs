#!/usr/bin/env node
// Structural validator for bmew-widget-creator.
//
// This replaces validate-offline-evidence.mjs, which pinned exact prose
// strings from SKILL.md and every audience file, plus an exact directory
// listing of offline-evidence/. That made the validator a golden-snapshot
// test: any deliberate rewording of SKILL.md, any trim of developer.md, or
// any new file added to the evidence folder would fail it, whether or not
// anything was actually broken. It would not have caught the three dead
// relative links this consolidation found and fixed, because it never
// followed a link — it only asserted specific known-good strings were
// present.
//
// This version checks structural invariants instead: required files exist,
// every relative Markdown link under references/ resolves to a real file,
// the capability index's authority-input hashes match the files they claim
// to authorize, and a short list of specific paths that should have been
// deleted in this consolidation are actually gone. It does not, and should
// not, assert exact wording anywhere — that would just reintroduce the same
// fragility under a new name.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, normalize, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const skillRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(path, 'utf8');
const rel = path => relative(skillRoot, path);

const requiredFiles = [
    'SKILL.md',
    'references/domain/README.md',
    'references/domain/report-widget-construction-corpus.md',
    'references/domain/non-card-host-and-target-evidence.md',
    'references/domain/dynamic-view-contract.md',
    'references/domain/export-contract.md',
    'references/domain/host-boundary.md',
    'references/domain/report-source-identities.json',
    'references/domain/seed-widgets/README.md',
    'references/domain/seed-widgets/recipe-catalogue.json',
    'references/capability-index/README.md',
    'references/capability-index/capability-index.json',
    'references/capability-index/schema.json',
    'references/ui-doctrine/README.md',
    'references/ui-doctrine/wizard-flows.md',
    'references/ui-doctrine/known-issues.md',
    'references/ui-doctrine/authoring-safety.md',
    'references/ui-doctrine/surface-coverage.json',
    'references/maintenance/source-discovery-work-order.md',
    'references/maintenance/refresh-work-order.md',
    'references/maintenance/capture-work-order.md',
    'references/audience/README.md',
    'references/audience/active.md',
    'references/audience/customer-active.md',
    'references/audience/developer-active.md',
    'references/audience/customer.md',
    'references/audience/developer.md',
    'references/audience/guided-widget-setup-draft.md',
];
for (const relPath of requiredFiles) {
    assert(existsSync(join(skillRoot, relPath)), `Missing required file: ${relPath}`);
}

// Paths that should have been removed by this consolidation. If any of these
// exist, either the deletion regressed or someone reintroduced the automation
// framework this restructuring was explicitly meant to retire.
const shouldNotExist = [
    '.agent-tools',
    'references/offline-evidence',
    'references/capability-retrieval',
    'references/browser-authoring',
    'references/audience/customer-active.md.bak',
    'scripts/compile-widget-authoring-plan.mjs',
    'scripts/browser-authoring-executor.mjs',
    'scripts/browser-authoring-runtime.js',
    'scripts/browser-authoring-fixed-list-runtime.js',
    'scripts/browser-authoring-cdp-adapter.mjs',
    'scripts/remote-debugging-page-adapter.mjs',
    'scripts/start-remote-debugging-browser.mjs',
    'scripts/run-fixed-list-pre-finish.mjs',
    'scripts/fixed-list-page-double.mjs',
    'scripts/fixed-list-authoring-runner.mjs',
    'scripts/dynamic-window-authoring-runner.mjs',
    'scripts/dynamic-tab-authoring-runner.mjs',
    'scripts/summary-authoring-runner.mjs',
    'scripts/validate-browser-authoring-framework.mjs',
];
for (const relPath of shouldNotExist) {
    assert(!existsSync(join(skillRoot, relPath)), `Obsolete path was reintroduced: ${relPath}`);
}

// Generic relative-link checker across every Markdown file under references/.
// This is the check that would have caught the three dead links found during
// this consolidation (dynamic-view-contract.md pointing at pre-rename
// filenames) before a fresh agent hit them.
function collectMd(dir, acc = []) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) collectMd(full, acc);
        else if (entry.name.endsWith('.md')) acc.push(full);
    }
    return acc;
}
const linkPattern = /\]\(([^)]+)\)/g;
let linksChecked = 0;
for (const mdPath of collectMd(join(skillRoot, 'references'))) {
    const text = read(mdPath);
    for (const match of text.matchAll(linkPattern)) {
        const target = match[1];
        if (/^https?:\/\//.test(target) || target.startsWith('#') || target.startsWith('mailto:')) continue;
        // Skip illustrative/placeholder link targets in documentation prose (e.g. customer.md's
        // literal example `[$bmew-widget-creator](<file path ending in SKILL.md>)`), which are
        // not real relative paths: angle brackets or embedded whitespace are the tell.
        if (/[<>]/.test(target) || /\s/.test(target)) continue;
        const [targetPath] = target.split('#');
        if (!targetPath) continue;
        const resolved = normalize(join(dirname(mdPath), targetPath));
        assert(existsSync(resolved), `Dead relative link in ${rel(mdPath)}: ${target}`);
        linksChecked += 1;
    }
}

// Corpus integrity: the source-record count is a real invariant of the
// corpus content itself (not prose about the corpus), so it stays.
const corpus = read(join(skillRoot, 'references/domain/report-widget-construction-corpus.md'));
const sourceRecords = (corpus.match(/^### Source [A-Za-z0-9.]+$/gm) ?? []).length;
assert.equal(sourceRecords, 184, `Expected 184 literal report-source records, found ${sourceRecords}`);

// Capability index: protocol version and authority-input hash freshness.
const capabilityIndex = JSON.parse(read(join(skillRoot, 'references/capability-index/capability-index.json')));
assert.equal(capabilityIndex.generatorProtocolVersion, '1', 'Unexpected capability-index generator protocol');
for (const input of capabilityIndex.authorityInputs) {
    const actualHash = createHash('sha256').update(read(join(skillRoot, input.inputPath))).digest('hex');
    assert.equal(actualHash, input.sha256, `Stale authority input hash: ${input.inputPath} — rerun build-widget-capability-index.mjs`);
}
// Every surface referenced by the index must still be declared in the coverage manifest it was built from.
const surfaceCoverage = JSON.parse(read(join(skillRoot, 'references/ui-doctrine/surface-coverage.json')));
const declaredSurfaceIds = new Set(surfaceCoverage.surfaces.map(s => s.surfaceId));
for (const surface of capabilityIndex.surfaces) {
    assert(declaredSurfaceIds.has(surface.surfaceId), `Capability index references an undeclared surface: ${surface.surfaceId}`);
}

// Recipe catalogue: seed-input hashes fresh, and every recipe stays flagged non-authoritative.
const recipes = JSON.parse(read(join(skillRoot, 'references/domain/seed-widgets/recipe-catalogue.json')));
assert(recipes.recipes.every(recipe => recipe.notSemanticAuthority === true), 'Recipes must remain non-semantic authority');
assert.equal(recipes.counts.includedRecipes, recipes.recipes.length, 'Recipe inclusion count must be deterministic');
for (const input of recipes.seedInputs) {
    const actualHash = createHash('sha256').update(read(join(skillRoot, input.inputPath))).digest('hex');
    assert.equal(actualHash, input.sha256, `Stale recipe seed hash: ${input.inputPath} — rerun build-widget-recipe-catalogue.mjs`);
}

// Every SKILL.md-declared reference link must resolve (same generic check, applied specifically
// to the routing file's own outbound links, since that's the file a fresh agent starts from).
const skill = read(join(skillRoot, 'SKILL.md'));
const skillReferenced = [...skill.matchAll(/\]\((references\/[^)]+)\)/g)].map(match => join(skillRoot, match[1].split('#')[0]));
for (const path of skillReferenced) assert(existsSync(path), `SKILL.md names a missing reference: ${rel(path)}`);

// developer.md must carry an explicit not-production-tested marker rather than reading as a
// verified path. This is a structural invariant we're establishing now, not incidental prose.
const developerAudience = read(join(skillRoot, 'references/audience/developer.md'));
assert(/not (?:implemented|production[- ]tested)/i.test(developerAudience), 'developer.md must carry an explicit not-implemented/not-production-tested marker');

console.log(JSON.stringify({
    passed: true,
    requiredFilesChecked: requiredFiles.length,
    obsoletePathsConfirmedAbsent: shouldNotExist.length,
    relativeLinksChecked: linksChecked,
    sourceRecords,
    capabilityIndexSurfaces: capabilityIndex.surfaces.length,
    recipeCatalogueEntries: recipes.recipes.length,
}, null, 2));
