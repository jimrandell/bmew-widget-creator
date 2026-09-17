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
structured request. The lookup checks every authority-input's freshness and
the `generatorProtocolVersion` before returning a result. **It never rebuilds
the index.** A stale index is a safe stop until you explicitly rerun
`build-widget-capability-index.mjs` — never rebuild it automatically or
speculatively; rebuild only when the person asks for a refresh (see
`../maintenance/refresh-work-order.md`).

### `-alt`: this variant's freshness check is size/mtime, not a content hash

This is the experimental variant of `bmew-widget-creator`. The main skill's
freshness check re-reads and SHA-256-hashes both multi-thousand-line evidence
files on every lookup — expensive, but it catches any edit, however small.
This variant's `statAuthorityInputs()` instead compares each file's size and
modified-time from a single `stat()` call: much cheaper, but with two real
weaknesses to weigh before trusting it:

- **A same-size edit at the same instant is invisible to it.** A content hash
  would still catch a same-size edit; size+mtime cannot distinguish it from
  no edit at all if both happen to match.
- **It is fragile across exactly the deployment path this skill actually
  uses.** Downloading a zip and re-uploading it as a skill typically gives
  every extracted file one new modified-time at extraction, regardless of its
  original content — including `capability-index.json` itself. If the index
  was built before zipping, its recorded mtimes won't match the freshly
  extracted evidence files' new mtimes, and a freshly deployed, completely
  unmodified skill can report itself as stale on its very first lookup. The
  fix, if that happens, is to rerun `build-widget-capability-index.mjs`
  *after* the files land in their final synced location, not before zipping —
  but that's an extra step the main skill's hash-based check never needs.

Which of these matters more than the per-lookup cost it avoids is a judgment
call for whoever maintains this variant, not something settled here.

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
