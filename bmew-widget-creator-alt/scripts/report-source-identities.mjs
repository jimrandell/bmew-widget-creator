import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const sourceIdentityInputPath = 'references/domain/report-source-identities.json';
export const normalizeReportSourceName = value => value.toLowerCase().replace(/[^a-z0-9]/g, '');

export function parseReportSourceIdentities(text) {
    const document = JSON.parse(text);
    if (!document || document.schemaVersion !== 1 || !Array.isArray(document.aliases)) throw new Error('Invalid report-source identity input.');
    const aliases = document.aliases.map((entry) => {
        if (!entry || typeof entry.relationshipTarget !== 'string' || typeof entry.source !== 'string'
            || entry.relationshipTarget.trim() === '' || entry.source.trim() === '') throw new Error('Invalid report-source identity alias.');
        return { relationshipTarget: entry.relationshipTarget, source: entry.source, rationale: entry.rationale ?? null };
    });
    const targets = aliases.map(entry => normalizeReportSourceName(entry.relationshipTarget));
    if (new Set(targets).size !== targets.length) throw new Error('Duplicate report-source identity target.');
    return aliases;
}

export function aliasMap(aliases) {
    return new Map(aliases.map(entry => [
        normalizeReportSourceName(entry.relationshipTarget), normalizeReportSourceName(entry.source),
    ]));
}

export const reportSourceAliases = aliasMap(parseReportSourceIdentities(readFileSync(join(root, sourceIdentityInputPath), 'utf8')));
