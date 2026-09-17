---
name: bmew-widget-creator
description: Plan and safely create validated Businessman Web report-backed widgets, with preview-only support exports. Supports a selected developer or customer entrypoint for ListView, ChartView, SummaryView, DynamicListView, and companion DynamicView items; excludes Cards, restore/reset, and uninvestigated categories.
---

# BMEW widget creator

## Scope

Supported report-backed families are `ListView`, `ChartView`, `SummaryView`,
and `DynamicListView`. `DynamicView` (Dynamic window) is a supported
companion dashboard layout item, not a fifth report-option family — it has
no report source, path, filter, or query payload of its own. See
[`references/domain/dynamic-view-contract.md`](references/domain/dynamic-view-contract.md)
before touching it; do not prepopulate its per-user display state or infer a
persisted selected-Summary relationship.

Templates and sharing are supported when their target facts are supplied. The
product restore/reset/factory-default mechanism is not a normal skill
operation. Cards, Card placement, Card registry/permissions, Charts, and
every uninvestigated wizard category are excluded from the current support
path — see
[`references/ui-doctrine/surface-coverage.json`](references/ui-doctrine/surface-coverage.json)'s
`cards-and-charts` entry.

Generate reviewable previews only. Never run SQL, connect to a database,
create database records, install, deploy, refresh capability data without
being asked, or perform release/version checks. Dashboard JSON is an
application configuration language: do not invent fields, report paths,
filter operators, host eligibility, JSON members, target rows, or permission
state — see
[`references/domain/host-boundary.md`](references/domain/host-boundary.md)
for the exact host-eligibility test and the static-validation boundary this
implies.

## Browser authoring

Drive the browser directly and natively — there is no compiled-plan runner
or adapter layer to route through. What still applies is the doctrine in
[`references/ui-doctrine/authoring-safety.md`](references/ui-doctrine/authoring-safety.md):
plan every decision against the domain evidence before opening the wizard,
verify a specific named fact after each meaningful step, and never click
`Finish` without the person's explicit authorization for that exact action
plus a checked postcondition afterward. Read
[`references/ui-doctrine/wizard-flows.md`](references/ui-doctrine/wizard-flows.md)
for what to expect on each surface (entity dashboard, My Desk, detail page,
tabbed-list add-tab) before free-driving it, and
[`references/ui-doctrine/known-issues.md`](references/ui-doctrine/known-issues.md)
for the observed Fixed-list Finish persistence bug and its workaround before
creating a Fixed-list widget anywhere.

Where a surface or family combination isn't covered in `wizard-flows.md` —
check
[`references/ui-doctrine/surface-coverage.json`](references/ui-doctrine/surface-coverage.json)
or run a capability lookup (below) — you're in unobserved territory. That's
not a stop; it means verify every state yourself as you go rather than
assuming it matches a documented surface, and consider writing down what you
find per
[`references/maintenance/capture-work-order.md`](references/maintenance/capture-work-order.md)
once the person confirms it was useful.

Create new widgets only. Do not edit an existing widget as part of ordinary
authoring — the sole exception is the same-run repair described in
`known-issues.md`. For a new tab, resolve the target Tabbed-list widget's
exact identity (route, tab-group title, widget-local signature) before
opening any menu; a zero or multiple match is a stop, not a guess.

## Fast capability questions

**Run the capability lookup first. Every time. Before you open, grep, or
page through `report-widget-construction-corpus.md` or
`non-card-host-and-target-evidence.md` at all.** For an ordinary capability
question, translate the supplied facts into the structured request accepted
by
[`scripts/widget-capability-lookup.mjs`](scripts/widget-capability-lookup.mjs)
and query the derived index immediately — see
[`references/capability-index/README.md`](references/capability-index/README.md)
for what a result contains and how its three axes (semantic / host / browser
authoring) relate. Do not collapse an unavailable browser-authoring axis into
semantic unsupported — they answer different questions.

This has already failed once. A real run spent roughly twenty commands
grepping and paging through the raw evidence files before it ever ran the
lookup script — including one read that landed on the file's front matter
instead of the record it needed, one query built to match nothing (filtering
a `hostId` field like `H103` for the substring `supplier`), and two tangents
into unrelated sources that never fed into the plan. Once it finally ran the
lookup, two calls answered the exact question the previous twenty were
groping toward. Don't repeat that. The lookup script exists precisely so you
don't have to read the raw files to answer an ordinary question — treat
reaching for `grep` or `Read` on either evidence file *before* the lookup as
a mistake to catch yourself making, not a reasonable first move.

The lookup verifies every indexed authority hash and the generator protocol
before every result. A stale or unavailable index is a safe stop that
requires an explicitly requested refresh — never rebuild it automatically or
speculatively; see
[`references/maintenance/refresh-work-order.md`](references/maintenance/refresh-work-order.md).
That freshness check re-reads and re-hashes both multi-thousand-line evidence
files, so it isn't free — **ask every capability question a request needs in
one script, inside one `createCapabilityLookupSession()`, not one shell
invocation per question.** Each separate `node` call is a fresh process: it
pays that hashing cost again and starts with an empty cache, so the session's
own caching never gets a chance to help across questions that could have
shared one.

Go to the domain evidence itself only *after* the lookup reports ambiguity
or unsupported facts, or when preparing an export/build artifact — never
before, and even then, read only the relevant record, not the whole file.
Both `report-widget-construction-corpus.md` and
`non-card-host-and-target-evidence.md` are organized as one heading per
record (`### Source <Name>` and `#### H<N> '<Name>'` respectively): search
for the specific heading and read that section. Reading either file in full
is rarely necessary and spends context budget a long session can't get back.
Lookup output cannot prove browser configuration, `Finish`, persistence,
saving, or target-page verification.

## Audience entrypoint

Use the selected audience entrypoint before gathering requirements or
deciding what to show in chat:

1. Read [`references/audience/active.md`](references/audience/active.md).
2. Read the one audience instruction file it names.

The active file is the only distribution switch. The shared domain evidence,
safety rules, and validation remain unchanged regardless of which is active.
Switch audiences by uncommenting exactly one selector block in `active.md`
and leaving the other entire block commented — see
[`references/audience/README.md`](references/audience/README.md).

**Customer is the confirmed, production entrypoint** and the default. The
**developer entrypoint is real content but not production-tested** — see the
status banner at the top of
[`references/audience/developer.md`](references/audience/developer.md)
before relying on it for anything consequential.

### Deferred guided setup design

The customer guided-widget setup is deliberately not implemented. Any agent
asked to plan, design, or implement it must read
[`references/audience/guided-widget-setup-draft.md`](references/audience/guided-widget-setup-draft.md)
first. That file preserves the agreed customer-facing text and the
outstanding implementation boundary; it is not active runtime behavior.

## Domain evidence router

Use [`references/domain/`](references/domain/) as the authoritative offline
capability evidence — see its
[`README.md`](references/domain/README.md) for the full file-by-file index,
including `seed-widgets/` (real worked examples, not semantic authority) and
`report-source-identities.json` (naming-mismatch aliases). In particular:

| Need | Read this reference |
| --- | --- |
| Valid report sources, labels, display-label paths, option classes, relations, capabilities, filters, serializers, shared implementation, and report-query hazards | [`report-widget-construction-corpus.md`](references/domain/report-widget-construction-corpus.md) |
| Host catalogue, dashboard versus record-detail context, selected-layout attachment, permissions/modules, custom fields, dictionary terms, and the minimum target-snapshot contract | [`non-card-host-and-target-evidence.md`](references/domain/non-card-host-and-target-evidence.md) |
| Approved host boundary and static validation boundary | [`host-boundary.md`](references/domain/host-boundary.md) |
| `DynamicView` layout item and per-user display-state mechanism | [`dynamic-view-contract.md`](references/domain/dynamic-view-contract.md) |
| Local export artifact contents and operation contract | [`export-contract.md`](references/domain/export-contract.md) |
| BMEW wizard UI mechanics — what to expect on each authoring surface | [`../ui-doctrine/wizard-flows.md`](references/ui-doctrine/wizard-flows.md) |

## Maintenance

This skill's domain evidence and capability index are refreshed only on
explicit user request, never self-initiated — see
[`references/maintenance/refresh-work-order.md`](references/maintenance/refresh-work-order.md)
and [`source-discovery-work-order.md`](references/maintenance/source-discovery-work-order.md).
New UI observations for `wizard-flows.md` follow
[`capture-work-order.md`](references/maintenance/capture-work-order.md), also
only on explicit request.
