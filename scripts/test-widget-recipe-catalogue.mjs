#!/usr/bin/env node
import assert from 'node:assert/strict';
import { buildRecipeCatalogue } from './build-widget-recipe-catalogue.mjs';

const catalogue = await buildRecipeCatalogue();
assert(catalogue.recipes.length === catalogue.counts.includedRecipes);
assert(catalogue.recipes.every(recipe => recipe.provenance === 'captured-stock-configuration' && recipe.notSemanticAuthority));
assert.equal(catalogue.seedInputs.length, 2);
assert(catalogue.inclusionRule.includes('DynamicListView'));
assert(catalogue.counts.excluded.card >= 0 && catalogue.counts.excluded.dynamicWindow >= 0 && catalogue.counts.excluded.other >= 0);
console.log(JSON.stringify({ passed: true, recipes: catalogue.recipes.length, excluded: catalogue.counts.excluded }));
