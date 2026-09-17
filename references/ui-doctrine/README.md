# UI doctrine

This directory replaces `browser-authoring/`. That directory held a hand-built
web-automation framework — a CDP adapter, a page-side injected runtime,
family-specific script runners, an execution-ledger format, and ~20 script
files driving them — built because reliably scripting the BMEW wizard was
hard. It's gone. Agents now drive the browser natively; that scaffolding no
longer has a job to do.

What `browser-authoring/` also held, entangled with that scaffolding, was
real knowledge about how the BMEW wizard UI actually behaves — which this
directory preserves in plain prose instead:

| File | Contents |
| --- | --- |
| `wizard-flows.md` | Per-surface record of wizard states, rails, and mechanics — entity dashboard, My Desk, detail page, tabbed-list add-tab, plus the components shared across all of them. Extracted from the old `contracts/*.json` `provenFacts` and `evidence/*.md` capture notes before those were deleted. |
| `known-issues.md` | The observed Fixed-list Finish persistence bug and its verified two-stage workaround. |
| `authoring-safety.md` | The doctrine that survives the deleted admission-gate/runner machinery: plan against the domain evidence first, verify named facts after each step, `Finish` needs explicit authorization plus a checked postcondition, create-new-widget only. This replaces `SKILL.md`'s old "Manual browser-driving gate," which forbade the exact thing agents are now expected to do. |
| `surface-coverage.json` | Machine-readable version of "which surface/family combinations have actually been observed" — consumed by the capability index's `browserAuthoring` axis (see `../capability-index/README.md`). Keep this in sync with `wizard-flows.md` by hand; nothing regenerates it automatically. |

## What didn't survive, and why

The deleted `contract-schema.md` defined a `pending-dom-evidence` /
`partially-proven` / `live-proven` / `deferred` status taxonomy at the
*whole-file* level, plus a capture-question/capture-completion apparatus for
promoting a contract between those states. The underlying idea — some UI
facts are directly observed, some aren't, and that distinction matters — is
worth keeping; it's expressed here as `surface-coverage.json`'s `status`
field and the plain "confirmed" / "not confirmed" language in
`wizard-flows.md`. The apparatus around it (capture packets, redaction rules,
per-question completion maps) existed to support a recorded capture
*process* for a scripted runner, and didn't survive.

One thing to watch for, because it bit this skill once already: a
whole-file status can hide a caveat about partial coverage. `detail-page`'s
old contract was marked `live-proven` while covering only its Data-source
picker — nothing else on that surface was proven, but the file-level status
didn't say so on its own; a separate line of prose elsewhere had to carry
that caveat, and it was easy to miss. `surface-coverage.json` and
`wizard-flows.md` now say this explicitly in the same place as the status
(`detail-page-widget-authoring`'s `families` array is empty and its `note`
field spells out why) — if you ever add a new surface or extend an existing
one, keep the caveat next to the status, not in a separate document that a
reader has to already know to cross-reference.

## Adding a new observed fact

See `../maintenance/capture-work-order.md`.
