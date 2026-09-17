#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseReportCorpus } from './parse-report-corpus.mjs';
import { normalizeReportSourceName, parseReportSourceIdentities, sourceIdentityInputPath } from './report-source-identities.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const generatorProtocolVersion = '1';
export const outputPath = join(root, 'references', 'capability-index', 'capability-index.json');
const inputs = [
    'references/domain/report-widget-construction-corpus.md',
    'references/domain/non-card-host-and-target-evidence.md',
    'references/ui-doctrine/surface-coverage.json',
    sourceIdentityInputPath,
];
const hash = text => createHash('sha256').update(text).digest('hex');
const locator = (inputPath, kind, extra) => ({ inputPath, kind, ...extra });

// Each input here is a single flat file (surface-coverage.json is no longer a
// catalog pointing at six separate per-contract files), so freshness is just
// the hash of these four files. No expansion step needed.
export async function hashAuthorityInputs(read = readFile) {
    return Promise.all(inputs.map(async inputPath => ({ inputPath, sha256: hash(await read(join(root, inputPath), 'utf8')) })));
}

function sourceRecords(corpus) {
    return [...parseReportCorpus(corpus).values()].map(record => ({
        source: record.name,
        options: record.options.map((option, ordinal) => ({ ...option, evidence: locator(inputs[0], 'report-path', { source: record.name, path: option.path, ordinal }) })),
    })).sort((a, b) => a.source.localeCompare(b.source));
}

function hostRecords(hosts) {
    const records = [];
    for (const match of hosts.matchAll(/^#### (H\d+) '([^']+)'\s*\n\s*`{3,}json\s*\n([\s\S]*?)\n`{3,}/gm)) {
        try {
            const value = JSON.parse(match[3]);
            // value.routes is an array of literal source strings (e.g. "'/purchasing/suppliers'" or,
            // where the source used a template literal, "`/company/.../:absence`"), not objects —
            // unwrap whichever quote character wraps the first entry.
            const route = typeof value.routes?.[0] === 'string' ? value.routes[0].replace(/^['"`]|['"`]$/g, '') : null;
            records.push({ hostId: match[1], name: match[2], route, evidence: locator(inputs[1], 'host', { hostId: match[1] }) });
        } catch { /* source validation will surface malformed evidence */ }
    }
    return records;
}

function sourceIdentityRecords(text) {
    return parseReportSourceIdentities(text).map((identity, ordinal) => ({
        ...identity,
        evidence: locator(sourceIdentityInputPath, 'report-source-identity', {
            relationshipTarget: identity.relationshipTarget,
            source: identity.source,
            ordinal,
        }),
    }));
}

function surfaceRecords(coverageText) {
    const coverage = JSON.parse(coverageText);
    return coverage.surfaces.map(entry => ({
        surfaceId: entry.surfaceId,
        status: entry.status,
        sourceContext: entry.sourceContext,
        families: entry.families ?? [],
        evidence: locator(inputs[2], 'surface', { surfaceId: entry.surfaceId }),
    }));
}

export async function generateCapabilityIndex(read = readFile) {
    const [corpus, hosts, coverageText, identityText, authorityInputs] = await Promise.all([
        read(join(root, inputs[0]), 'utf8'), read(join(root, inputs[1]), 'utf8'), read(join(root, inputs[2]), 'utf8'), read(join(root, sourceIdentityInputPath), 'utf8'), hashAuthorityInputs(read),
    ]);
    return {
        schemaVersion: 1, generatorProtocolVersion, authorityInputs,
        sources: sourceRecords(corpus), sourceIdentities: sourceIdentityRecords(identityText),
        hosts: hostRecords(hosts), surfaces: surfaceRecords(coverageText),
    };
}

export function validateGeneratedIndex(index) {
    if (!index || index.schemaVersion !== 1 || index.generatorProtocolVersion !== generatorProtocolVersion) throw new Error('Invalid capability index protocol.');
    for (const input of index.authorityInputs ?? []) if (!input.inputPath || !input.sha256) throw new Error('Invalid authority input.');
    for (const source of index.sources ?? []) for (const option of source.options ?? []) resolveEvidenceLocator(index, option.evidence);
    const sourceNames = new Set((index.sources ?? []).map(source => normalizeReportSourceName(source.source)));
    const relationTargets = new Set((index.sources ?? []).flatMap(source => source.options ?? [])
        .filter(option => option.className === 'RelationOption' && option.relationTarget)
        .map(option => normalizeReportSourceName(option.relationTarget)));
    for (const identity of index.sourceIdentities ?? []) {
        if (!relationTargets.has(normalizeReportSourceName(identity.relationshipTarget))) {
            throw new Error(`Report-source identity has no matching corpus relationship target: ${identity.relationshipTarget}.`);
        }
        if (!sourceNames.has(normalizeReportSourceName(identity.source))) {
            throw new Error(`Report-source identity points to an absent corpus source: ${identity.source}.`);
        }
        resolveEvidenceLocator(index, identity.evidence);
    }
    for (const host of index.hosts ?? []) resolveEvidenceLocator(index, host.evidence);
    for (const surface of index.surfaces ?? []) resolveEvidenceLocator(index, surface.evidence);
    return index;
}

/** Resolve an index locator exactly once; ambiguous provenance is a safe stop. */
export function resolveEvidenceLocator(index, locatorValue) {
    if (!locatorValue || typeof locatorValue !== 'object') throw new Error('Invalid evidence locator.');
    const matches = [];
    if (locatorValue.kind === 'report-path') {
        for (const source of index.sources ?? []) for (const option of source.options ?? []) {
            if (option.evidence?.inputPath === locatorValue.inputPath && option.evidence?.source === locatorValue.source && option.evidence?.ordinal === locatorValue.ordinal && JSON.stringify(option.evidence?.path) === JSON.stringify(locatorValue.path)) matches.push(option);
        }
    } else if (locatorValue.kind === 'host') {
        for (const host of index.hosts ?? []) if (host.evidence?.inputPath === locatorValue.inputPath && host.evidence?.hostId === locatorValue.hostId) matches.push(host);
    } else if (locatorValue.kind === 'surface') {
        for (const surface of index.surfaces ?? []) if (surface.evidence?.inputPath === locatorValue.inputPath && surface.evidence?.surfaceId === locatorValue.surfaceId) matches.push(surface);
    } else if (locatorValue.kind === 'report-source-identity') {
        for (const identity of index.sourceIdentities ?? []) {
            if (identity.evidence?.inputPath === locatorValue.inputPath
                && identity.evidence?.relationshipTarget === locatorValue.relationshipTarget
                && identity.evidence?.source === locatorValue.source
                && identity.evidence?.ordinal === locatorValue.ordinal) matches.push(identity);
        }
    } else throw new Error(`Unknown evidence locator kind: ${locatorValue.kind}`);
    if (matches.length !== 1) throw new Error(`Evidence locator must resolve exactly once; resolved ${matches.length}.`);
    return matches[0];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const requested = process.argv[2] && resolve(process.argv[2]);
    if (requested !== outputPath) throw new Error(`Output must be exactly ${outputPath}.`);
    const index = validateGeneratedIndex(await generateCapabilityIndex());
    await writeFile(outputPath, `${JSON.stringify(index, null, 2)}\n`);
    process.stdout.write(`${relative(root, outputPath)}\n`);
}
