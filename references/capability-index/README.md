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

Run `node scripts/widget-capability-lookup.mjs <request.json>` for a
structured request. The lookup checks every authority-input hash and the
`generatorProtocolVersion` before returning a result. **It never rebuilds the
index.** A stale index is a safe stop until you explicitly rerun
`build-widget-capability-index.mjs` — never rebuild it automatically or
speculatively; rebuild only when the person asks for a refresh (see
`../maintenance/refresh-work-order.md`).

**`<request.json>` can be a JSON array of requests, not just one.** Every
request in the array is answered in that same single process, against one
freshness check — not one `node` invocation per question. This is the actual
mechanism behind "ask everything for one investigation in one process": put
every question you have into one array and run the script once, rather than
writing a series of small ad-hoc scripts as questions occur to you. If a
follow-up question occurs to you after seeing a result, add it to the same
array and rerun — don't start a second file. (Calling
`createCapabilityLookupSession()`/`lookupCapability()` directly from your own
script also works and shares the same per-session freshness caching, but the
CLI above needs no script-writing at all — reach for it first.)

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

A `semantic.status` of `supported` is the whole answer for "can I use this
column" — it means the path resolved to one unique, terminal option in the
corpus. The result does not, and doesn't need to, echo that option's
`className`, `flags`, or `filterMap` back to you; those are implementation
detail the corpus records for provenance, not something you need to decode
to pick a column. Don't go looking for what the flag letters mean — there's
no legend for them in the evidence, and a `supported` verdict already told
you what you needed to know.

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

## A `container-only-path` verdict: don't guess a composed path

A relation column (`Type`, `Bank`, `Company`, ...) always comes back
`container-only-path` — that's correct, it isn't a selectable terminal field
by itself. The natural next move is to guess the drilled-in path as a
two-element array, e.g. `["Type", "Type"]` — **don't.** The lookup answers
questions about one source's own option list; it does not compose a relation
with a field from the entity it points to, because most sources don't carry
that composition pre-flattened. A few do — `Country` is one, where
`["Country", "Code"]` already exists directly in the parent source's own
options — but that's the exception, not something to assume.

Before guessing, check cheaply: look at the *same* source's own option list
(you already have it from the lookup) for any existing path whose first
element matches the relation's label, the way `Country.Code` exists inline
in a source that has one. If nothing like that is there, the composed path
genuinely doesn't exist in the corpus for the lookup to confirm — stop
querying the lookup for it. That field is resolved by drilling into the
relation live in the wizard's hierarchical picker (see
`../ui-doctrine/wizard-flows.md`), not by finding the right string to feed
this tool. Querying the *related* source on its own (e.g. `supplierType`
for `supplier`'s `Type` relation) tells you the field exists and is
semantically valid — it does not give you a path string the lookup will
accept for the original source, because there isn't one to give it.

Evidence locators are structured JSON objects and must resolve exactly once.
Seed-widget recipes (`../domain/seed-widgets/recipe-catalogue.json`) are
never index inputs or semantic authority — they're worked examples, not
proof of what's supported.
