#!/usr/bin/env node
// Runs every test and the structural validator in one command, so there's a
// single thing to run before committing a change to this skill.
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const checks = [
    'scripts/test-widget-capability-index.mjs',
    'scripts/test-widget-capability-lookup.mjs',
    'scripts/test-widget-recipe-catalogue.mjs',
    'scripts/validate-skill-structure.mjs',
];

let failed = false;
for (const check of checks) {
    process.stdout.write(`=== ${check} ===\n`);
    const result = spawnSync(process.execPath, [join(root, check)], { cwd: root, stdio: 'inherit' });
    if (result.status !== 0) failed = true;
    process.stdout.write('\n');
}

if (failed) {
    process.stderr.write('One or more checks failed.\n');
    process.exit(1);
}
process.stdout.write('All checks passed.\n');
