#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const seeds = [
    'references/domain/seed-widgets/factory-dashboard-layouts.decoded.jsonl',
    'references/domain/seed-widgets/widget-templates.decoded.jsonl',
];
const output = join(root, 'references/domain/seed-widgets/recipe-catalogue.json');
const supported = new Set(['ListView', 'ChartView', 'SummaryView', 'DynamicListView']);
const hash = text => createHash('sha256').update(text).digest('hex');

function classify(item) {
    if (!item || item.type === 'Card') return 'card';
    if (item.type === 'DynamicView') return 'dynamicWindow';
    if (!supported.has(item.type)) return 'other';
    return 'included';
}
function itemRows(row) {
    const configuration = row.configuration;
    return Array.isArray(configuration) ? configuration : [configuration];
}

export async function buildRecipeCatalogue(read = readFile) {
    const inputs = await Promise.all(seeds.map(async inputPath => ({ inputPath, text: await read(join(root, inputPath), 'utf8') })));
    const recipes = [];
    const excluded = { card: 0, dynamicWindow: 0, other: 0 };
    let inputRecords = 0;
    for (const input of inputs) {
        for (const row of input.text.trim().split(/\r?\n/).filter(Boolean).map(JSON.parse)) {
            inputRecords++;
            for (const item of itemRows(row)) {
                const disposition = classify(item);
                if (disposition !== 'included') { excluded[disposition]++; continue; }
                recipes.push({
                    provenance: 'captured-stock-configuration',
                    seedSourceRecord: { file: input.inputPath, id: row.id },
                    configurationPattern: { type: item.type, title: item.title ?? row.name ?? null },
                    notSemanticAuthority: true,
                });
            }
        }
    }
    recipes.sort((a, b) => `${a.seedSourceRecord.file}:${a.seedSourceRecord.id}:${a.configurationPattern.title ?? ''}`.localeCompare(`${b.seedSourceRecord.file}:${b.seedSourceRecord.id}:${b.configurationPattern.title ?? ''}`));
    return {
        schemaVersion: 1, generatorProtocolVersion: '1',
        seedInputs: inputs.map(input => ({ inputPath: input.inputPath, sha256: hash(input.text) })),
        inclusionRule: 'ListView, ChartView, SummaryView, and DynamicListView only; cards, DynamicView, and unrecognised items are excluded.',
        counts: { inputRecords, includedRecipes: recipes.length, excluded }, recipes,
    };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    await writeFile(output, `${JSON.stringify(await buildRecipeCatalogue(), null, 2)}\n`);
}
