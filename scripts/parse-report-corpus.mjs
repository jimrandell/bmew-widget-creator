import { normalizeReportSourceName } from './report-source-identities.mjs';

function parseSourceRecord(name, text) {
    const options = [];
    for (const line of text.split(/\r?\n/)) {
        const match = line.match(/^\| (\[.*?\]) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|$/);
        if (!match) continue;
        let path;
        try { path = JSON.parse(match[1]); } catch { continue; }
        options.push({
            path,
            className: match[2].trim(),
            property: match[3].trim(),
            flags: match[4].trim().split(',').map((flag) => flag.trim()),
            filterMap: match[5].trim(),
            relationTarget: match[3].match(/"expression":"([^"]+)"/)?.[1] ?? null,
        });
    }
    return { name, options };
}

/**
 * Parse the `### Source <name>` records out of report-widget-construction-corpus.md
 * into { name, options[] } records keyed by normalized source name.
 *
 * Extracted from the retired plan-compiler (compile-widget-authoring-plan.mjs,
 * deleted with the rest of the browser-automation framework). This function has
 * no dependency on browser plans, contracts, or that framework — it is pure
 * corpus parsing, used only by build-widget-capability-index.mjs. It has no
 * dedicated test file of its own; its only current coverage is indirect, via
 * test-widget-capability-index.mjs exercising generateCapabilityIndex().
 */
export function parseReportCorpus(corpus) {
    const heading = /^### Source ([A-Za-z0-9.]+)$/gm;
    const matches = [...corpus.matchAll(heading)];
    const records = new Map();
    for (let index = 0; index < matches.length; index += 1) {
        const start = matches[index].index + matches[index][0].length;
        const end = index + 1 < matches.length ? matches[index + 1].index : corpus.length;
        const record = parseSourceRecord(matches[index][1], corpus.slice(start, end));
        records.set(normalizeReportSourceName(record.name), record);
    }
    return records;
}
