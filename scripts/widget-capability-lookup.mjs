#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatorProtocolVersion, hashAuthorityInputs, outputPath } from './build-widget-capability-index.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cacheKey = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const families = new Set(['ListView', 'ChartView', 'SummaryView', 'DynamicListView', 'DynamicView']);

export function normalizeCapabilityRequest(request) {
    if (!request || typeof request !== 'object' || Array.isArray(request) || typeof request.source !== 'string') throw new Error('A structured request with source is required.');
    if (request.reportWidgetFamily !== undefined && request.reportWidgetFamily !== null && !families.has(request.reportWidgetFamily)) throw new Error('Unsupported reportWidgetFamily.');
    const normalizePaths = value => (value ?? []).map(path => {
        if (!Array.isArray(path) || !path.length || !path.every(label => typeof label === 'string')) throw new Error('Paths must be non-empty string arrays.');
        return [...path];
    });
    const browser = request.browserAuthoring ?? null;
    if (browser !== null && (typeof browser !== 'object' || Array.isArray(browser))) throw new Error('browserAuthoring must be an object when supplied.');
    return {
        source: request.source.toLowerCase(), reportWidgetFamily: request.reportWidgetFamily ?? null,
        columns: normalizePaths(request.columns), groupings: normalizePaths(request.groupings),
        aggregate: request.aggregate?.path ? { path: normalizePaths([request.aggregate.path])[0] } : null,
        filters: request.filters ?? [], host: request.host ?? null,
        // surfaceId names a row in ui-doctrine/surface-coverage.json (e.g. "my-desk-widget-authoring").
        // There is no runner, compiler-admission, or input-control-coverage axis any more: a native
        // browser-driving agent doesn't consume a compiled plan through a scripted runner, so the only
        // remaining question is "has this surface/family combination actually been observed in the UI".
        browserAuthoring: browser && {
            surfaceId: browser.surfaceId ?? null,
            reportWidgetFamily: browser.reportWidgetFamily ?? request.reportWidgetFamily ?? null,
        },
    };
}

export async function validateIndexFreshness(index, read = readFile) {
    if (index.generatorProtocolVersion !== generatorProtocolVersion) return { ok: false, reason: 'generator-protocol-mismatch' };
    try {
        const current = await hashAuthorityInputs(read);
        return JSON.stringify(current) === JSON.stringify(index.authorityInputs)
            ? { ok: true, current } : { ok: false, reason: 'index-stale-or-unavailable', current };
    } catch (error) { return { ok: false, reason: 'index-stale-or-unavailable', error: error.message }; }
}

function verdict(status, reasonCode, explanation, negativeConstraints = [], evidence = []) {
    return { status, reasonCode, explanation, negativeConstraints, evidence };
}
// Case-insensitive, the same way source names already are (request.source.toLowerCase()) — a
// requested label like "Account Number" must resolve against the corpus's stored "Account number"
// without a failed round-trip first. Evidence still cites the option's real corpus-cased path, not
// the request's casing, since evidence comes from the matched option, never from the request itself.
function samePath(left, right) {
    return left.length === right.length && left.every((label, index) => label.toLowerCase() === right[index].toLowerCase());
}
function optionsFor(source, path) { return source.options.filter(option => samePath(option.path, path)); }

function browserVerdict(index, browser) {
    if (!browser) return verdict('needs-clarification', 'browser-request-not-supplied', 'No browser-authoring request was supplied.', ['Semantic support does not authorize browser mutation.']);
    const surface = index.surfaces.find(item => item.surfaceId === browser.surfaceId);
    const requirements = [
        { code: 'no-proven-wizard-doctrine', met: Boolean(surface && surface.status === 'live-proven'), evidence: surface?.evidence ?? [] },
        { code: 'family-not-covered-by-surface-doctrine', met: Boolean(surface && surface.families?.includes(browser.reportWidgetFamily)), evidence: surface?.evidence ?? [] },
    ];
    const unmet = requirements.filter(requirement => !requirement.met);
    return verdict(
        unmet.length ? 'unavailable' : 'available',
        unmet.length ? 'wizard-doctrine-requirements-unmet' : 'wizard-doctrine-requirements-met',
        unmet.length
            ? 'This surface/family combination has not been directly observed in the BMEW wizard UI. Proceeding without that observation means verifying every state and postcondition yourself as you go, not assuming the flow matches a similar surface.'
            : 'This surface/family combination has directly-observed wizard-flow doctrine (see ui-doctrine/wizard-flows.md). Still plan against the domain evidence first and verify named postconditions before Finish — proven UI mechanics do not substitute for validated report configuration.',
        unmet.map(requirement => requirement.code), requirements.flatMap(requirement => requirement.evidence),
    );
}

export function lookupCapability(index, request) {
    const normalized = normalizeCapabilityRequest(request);
    const source = index.sources.find(item => item.source.toLowerCase() === normalized.source);
    if (!source) return {
        normalized, semantic: verdict('unsupported', 'unknown-source', 'The requested report source is not in the authority corpus.'),
        hostContext: verdict('unavailable', 'semantic-stop', 'No host evaluation follows an unknown source.'),
        browserAuthoring: verdict('unavailable', 'semantic-stop', 'No browser route follows an unsupported design.'),
        verifiedLifecycleState: 'idea', maximumPermittedNextState: 'idea',
    };
    const requestedPaths = [...normalized.columns, ...normalized.groupings, ...(normalized.aggregate ? [normalized.aggregate.path] : [])];
    const matches = requestedPaths.map(path => optionsFor(source, path));
    const selected = matches.map(options => options[0]);
    const ambiguous = matches.find(options => options.length > 1);
    const container = selected.find(option => option?.className === 'RelationOption');
    const missing = selected.some(option => !option);
    // A missing path longer than one segment whose first segment names a real relation on this
    // source (e.g. ["Type", "Type"]) is someone guessing a composed drill-down path, not a
    // genuinely unknown field — the corpus rarely pre-flattens that composition onto the parent
    // source. This guess is common enough (it's the natural next move after a container-only-path
    // verdict) that it earns its own reasonCode and a pointer straight at the fix, rather than the
    // generic unknown-path message — see capability-index/README.md's container-only-path section.
    const guessedComposedPath = !ambiguous && !container && requestedPaths.find((path, index) =>
        !selected[index] && path.length > 1
        && source.options.some(option => option.path.length === 1 && option.className === 'RelationOption' && option.path[0].toLowerCase() === path[0].toLowerCase()));
    const semantic = missing || container || ambiguous
        ? verdict(
            'unsupported',
            ambiguous ? 'ambiguous-path' : container ? 'container-only-path' : guessedComposedPath ? 'composed-relation-path' : 'unknown-path',
            guessedComposedPath
                ? `"${guessedComposedPath[0]}" is a relation on this source, not a container the corpus pre-flattens — a composed path like ${JSON.stringify(guessedComposedPath)} does not exist for the lookup to confirm. Query the related source's own options to confirm the field exists, then resolve it live in the wizard's hierarchical picker. Stop guessing composed paths against this source.`
                : 'A requested path is not a uniquely selectable terminal capability.',
            ['Do not invent a terminal relationship path.'],
        )
        : verdict('supported', 'resolved-paths', 'The requested report paths resolve in the authority corpus.', [], selected.map(option => option.evidence));
    const host = normalized.host && index.hosts.find(item => item.hostId === normalized.host.hostId);
    const hostContext = semantic.status !== 'supported'
        ? verdict('unavailable', 'semantic-stop', 'Host evaluation stopped with semantic support.')
        : !normalized.host ? verdict('needs-clarification', 'host-required', 'Supply the exact host record and target snapshot facts.')
            : !host ? verdict('unsupported', 'unknown-host', 'The supplied host record is absent from authority evidence.')
                : verdict('needs-clarification', 'target-state-required', 'The host is recorded; target-state predicates and selected layout still require supplied facts.', [], [host.evidence]);
    const browserAuthoring = semantic.status === 'supported'
        ? browserVerdict(index, normalized.browserAuthoring)
        : verdict('unavailable', 'semantic-stop', 'No browser route follows an unsupported design.');
    return {
        normalized, semantic, hostContext, browserAuthoring,
        verifiedLifecycleState: semantic.status === 'supported' ? 'evidence-validated-design' : 'idea',
        maximumPermittedNextState: semantic.status === 'supported' ? 'reviewed-plan' : 'idea',
        customerAnswer: { requiredDistinctions: ['semantic support is separate from browser authoring'], forbiddenClaims: ['browser configured', 'saved', 'verified on target page'] },
    };
}

export async function createCapabilityLookupSession({ indexPath = outputPath, readFile: read = readFile } = {}) {
    const cache = new Map();
    // Load the index and check freshness at most once per session, not once per lookup() call — the
    // freshness check re-hashes both multi-thousand-line evidence files, and nothing inside one
    // session's lifetime can make that check's answer change partway through.
    let loaded = null;
    const load = () => loaded ??= (async () => {
        const index = JSON.parse(await read(indexPath, 'utf8'));
        const freshness = await validateIndexFreshness(index, read);
        return { index, freshness };
    })();
    return { async lookup(request) {
        const { index, freshness } = await load();
        if (!freshness.ok) return {
            semantic: verdict('unavailable', freshness.reason, 'The capability index is stale or incompatible; request an explicit refresh.'),
            hostContext: verdict('unavailable', freshness.reason, 'No result is served from stale evidence.'),
            browserAuthoring: verdict('unavailable', freshness.reason, 'No result is served from stale evidence.'),
            verifiedLifecycleState: 'idea', maximumPermittedNextState: 'idea', cache: { hit: false },
        };
        const normalized = normalizeCapabilityRequest(request);
        const key = cacheKey({ normalized, authorityInputs: index.authorityInputs, generatorProtocolVersion: index.generatorProtocolVersion });
        if (cache.has(key)) return { ...cache.get(key), cache: { hit: true } };
        const result = lookupCapability(index, normalized);
        cache.set(key, result);
        return { ...result, cache: { hit: false } };
    } };
}

// CLI entrypoint: node widget-capability-lookup.mjs <request.json>
// <request.json> is either one structured request object, or a JSON array of them — every request
// in the array is answered in this one process, against one freshness check, not one process each.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const requestPath = process.argv[2];
    if (!requestPath) {
        process.stderr.write('Usage: node widget-capability-lookup.mjs <request.json>\n');
        process.stderr.write('<request.json>: one request object, or a JSON array of them to answer together.\n');
        process.exitCode = 1;
    } else {
        const parsed = JSON.parse(await readFile(requestPath, 'utf8'));
        const requests = Array.isArray(parsed) ? parsed : [parsed];
        const session = await createCapabilityLookupSession();
        const results = [];
        for (const request of requests) results.push(await session.lookup(request));
        process.stdout.write(`${JSON.stringify(Array.isArray(parsed) ? results : results[0], null, 2)}\n`);
    }
}
