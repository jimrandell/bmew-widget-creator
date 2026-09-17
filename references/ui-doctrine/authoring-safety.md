# Browser-authoring safety doctrine

This is what survives from the retired browser-automation framework (a
hand-built CDP adapter, page-side injected runtime, family-specific script
runners, and a compiled-plan admission gate — all deleted). None of that
machinery is required or expected any more: **drive the browser natively and
directly**, the way you drive any browser. What follows is the discipline
that machinery used to enforce mechanically. Nothing here should be read as
"don't touch the browser" — the old blanket restriction against ad-hoc
clicking, screenshots, and DOM inspection is gone. It's about what to check
and when to stop, not about staying off the page.

## Plan against the evidence before you act

Before opening the wizard, resolve every business decision — source,
relationship path, columns, groupings, filters, summary path, title, host —
against `../domain/` (and the faster `../capability-index/` lookup over it)
first. An unresolved, ambiguous, or unsupported fact is a stop, not a guess.

**Never invent a field, report path, filter operator, host eligibility rule,
or JSON member that isn't in the domain evidence.** This was previously
enforced by a compiler that refused to emit a plan for anything it couldn't
resolve, and an admission gate that rejected any action not carrying that
compiler's exact output object. You don't have a compiler enforcing this for
you anymore — it's your own discipline now. Practically: if you can't point
to where in `report-widget-construction-corpus.md` or
`non-card-host-and-target-evidence.md` a path/operator/field is confirmed,
don't use it. Ambiguous or missing evidence stops the plan before you touch
the browser, not after.

## Verify a named fact after every meaningful step

`wizard-flows.md` describes states you should expect to reach and what should
be true at each one — a picker closed and reflecting a selection, a row count
that matches what you added, a dialog title, a child dialog that appeared.
After a meaningful action, check the *specific* fact that proves it worked,
rather than assuming success because nothing visibly errored. This is the
same discipline the old runners called "named postconditions" — the concept
survives, the rigid postcondition-name vocabulary and ledger bookkeeping that
enforced it in code do not.

Where `wizard-flows.md` or `surface-coverage.json` marks a surface as only
partially proven (detail-page, currently) or a family as unconfirmed on a
given surface, verify more carefully, not less — you're in territory nobody
has watched happen yet.

## A screenshot is not your default check — it is a fallback

**After a click, the first thing you reach for is a structural read of the
page — an accessibility-tree read, or a natural-language element search —
never a screenshot.** This is not a cost/benefit judgment call to make fresh
each time. It's the default action. Treat any screenshot you're about to
take as something you need a specific reason for, not something you do
out of habit because it's the obvious move.

This has already failed once, on this exact wizard. An agent that had just
finished reading this file still took a screenshot after every single click
anyway, and kept doing it through several wizard states. It only stopped
after being asked, twice, directly, whether it was following this
instruction — and even then, its first attempt at an answer talked about a
different rule (not batching across a branch point) instead of admitting it
hadn't touched a structural read at all. Reading this paragraph is not the
same as obeying it. If you notice yourself reaching for a screenshot,
stop and name, explicitly, why a structural read won't answer the question —
if you can't, take the structural read instead.

A screenshot is justified only for: a genuinely visual question (how
something is laid out or rendered, a chart, a virtualized list), or a state
`wizard-flows.md` hasn't documented, where there's no known label to search
for and a wider look is the only option. Those are named exceptions you
reach for deliberately — not a default you fall into because it's easier
than deciding which tool fits.

When you do a structural read, search for the exact instruction text, dialog
title, or field label `wizard-flows.md` already records for that state — for
example `Set the data source for the widget`, `Choose column`, or `Selected
data source:` — rather than guessing at wording. It already carries what a
correct state actually says; use that as the search target instead of
rediscovering it each time.

## Don't batch across a branch point

Taking several actions in one turn before checking anything is safe only for
a fixed, non-branching sequence — one where nothing between the actions can
change what the next one should target. Most of this wizard is the opposite:
selecting a relation opens a new picker column one level deeper, some menu
items only reveal themselves on hover, and `Next` on Data source and Summary
data stays disabled until a value is set. Verify individually across any of
those. Batch only a run of independent, already-visible controls — for
instance, a few Customize fields that don't affect one another.

This is a separate rule from the one above — don't satisfy it and assume
you've also satisfied the screenshot rule. Verifying individually per step
and verifying *cheaply* per step are two different disciplines; the wizard
needs both.

## `Finish` requires explicit, named authorization

`Finish` (and the equivalent terminal action on any dialog) is permitted only
when:

1. the person has given **explicit, specific** authorization for that exact
   Finish — not a general "go ahead and set this up," but authorization tied
   to the reviewed plan you're about to commit; and
2. you check a named postcondition afterward: the dialog actually closed,
   *and* specific page evidence confirms the widget exists in the expected
   state (not just "no error was thrown").

`Create` is not an observed terminal wizard action anywhere in this
skill's evidence — don't treat it as equivalent to `Finish`.

This gate applies to browser mutation only. It does not relax or replace the
separate, always-on constraints in `SKILL.md`: no SQL, no database
connection, no deployment, and the existing offline preview/export route
(`../domain/export-contract.md`) stays entirely separate from — and
unaffected by — anything in this document.

## Create-new-widget only

Create new widgets. Do not edit an existing widget as part of ordinary
authoring. The one exception is a narrow, same-run repair: after `Finish` and
post-save verification shows the intended state did not persist for a widget
*you just created in this run*, you may reopen that same widget (never a
different one) to restore the reviewed configuration. See
`known-issues.md`'s Fixed-list persistence workaround for the concrete case
this exists for.

For appending a tab to an existing Tabbed-list widget: identify its owner
first (exact route, tab-group title, widget-local identity signature). If
that identity resolves to zero or multiple tab groups, stop — don't guess
which one was meant. Use only that resolved group's own local `Add tab`
menu entry, never a different widget's.

## Host boundary and source-context variants

Two things worth restating here even though they live elsewhere:

- The host-eligibility test (mounted `Dashboard` construction + `getActions()`
  wired to that exact instance + validated route/component/context — not a
  name match) is in `../domain/host-boundary.md`. It governs *where* a
  widget can be attached; it's a domain-evidence fact, not a UI-mechanics
  fact, which is why it lives there rather than here.
- The three source-context variants — entity-dashboard (report entity fixed
  by the route, no independent source step), detail-page (contextual,
  hierarchical source picker scoped to the current record), and My Desk
  (flat, searchable, starts with a real, selectable `None` sentinel) — behave
  differently enough that assuming one matches another is the single most
  likely way to get a wizard flow wrong. See `wizard-flows.md` for the detail.

## Scope this doesn't touch

Cards, Card placement, Card registry/permissions, and every uninvestigated
wizard category remain excluded from this skill's support path entirely —
that's a scope decision from `SKILL.md`, not something this document changes.
Charts are similarly deferred (see `surface-coverage.json`'s
`cards-and-charts` entry). This document governs how you act *within*
supported scope; it doesn't expand what that scope is.
