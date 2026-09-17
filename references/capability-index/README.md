# Capability index

This directory merges what used to be split across `offline-evidence/`
(which held `capability-index.json` itself) and a separate
`capability-retrieval/` folder (which held only this README and the schema).
One artifact, one home.

`capability-index.json` accelerates structured capability questions. It is
**derived**, not authoritative — it's a machine-built compression of
`../domain/report-widget-construction-corpus.md` (~54k lines),
`../domain/non-card-host-and-target-evidence.md` (~65k lines), and
`../ui-doctrine/surface-coverage.json`, produced by
`../../scripts/build-widget-capability-index.mjs`. Those three files remain
authoritative; this index exists so you don't have to grep 120k lines of
Markdown for every question.

Run `node scripts/widget-capability-lookup.mjs <request.json>` (or call
`createCapabilityLookupSession()`/`lookupCapability()` directly) for a
structured request. The lookup checks every authority-input hash and the
`generatorProtocolVersion` before returning a result. **It never rebuilds the
index.** A stale index is a safe stop until you explicitly rerun
`build-widget-capability-index.mjs` — never rebuild it automatically or
speculatively; rebuild only when the person asks for a refresh (see
`../maintenance/refresh-work-order.md`).

## Looking up a host by name

A host's `hostId` (`H001`, `H002`, ...) is an opaque sequence number, not a
derived slug — it never contains the entity's name, so filtering `hostId`
for a substring like `supplier` will always come back empty. Match on
`name` instead:

```js
const index = JSON.parse(await readFile(outputPath, 'utf8'));
const host = index.hosts.find(h => h.name === 'suppliersList');
```

Do this inside the same `createCapabilityLookupSession()` script as your
other questions for the request — see `SKILL.md`'s "Fast capability
questions" section for why that matters.

## What a result contains

Results separate three axes:

- **`semantic`** — does the requested report source/path/relation actually
  resolve in the corpus. This never touches UI mechanics.
- **`hostContext`** — is the target host/dashboard eligible, and what
  target-snapshot facts are still needed.
- **`browserAuthoring`** — has this UI surface/family combination actually
  been observed in the wizard (see `../ui-doctrine/surface-coverage.json`
  and `../ui-doctrine/wizard-flows.md`). This is a **coverage signal about
  proven UI knowledge, not a permission gate.** The old version of this axis
  checked for a matching compiled-plan runner and compiler admission — that
  made sense when a scripted runner was the only thing allowed to touch the
  browser. It doesn't apply to a native browser-driving agent. What still
  matters is whether the wizard mechanics for that surface have actually been
  watched happen, because that's the difference between following a verified
  script and improvising through unobserved territory. Treat `unavailable`
  here as "go carefully and verify every postcondition yourself," not as "you
  may not do this."

`verifiedLifecycleState` is evidence the lookup itself observed.
`maximumPermittedNextState` is a ceiling, never evidence that browser
configuration, saving, or target-page verification actually occurred.

Evidence locators are structured JSON objects and must resolve exactly once.
Seed-widget recipes (`../domain/seed-widgets/recipe-catalogue.json`) are
never index inputs or semantic authority — they're worked examples, not
proof of what's supported.
