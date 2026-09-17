# BMEW widget wizard — observed flows

This is a plain-prose record of how the `Configure widget` / `Configure
dynamic tab` wizard actually behaves, per surface, as directly observed in
the running application. It replaces the old `browser-authoring/contracts/*`
JSON files and `browser-authoring/evidence/*.md` capture notes, which encoded
the same facts as locator strategies for a scripted runner that no longer
exists. Nothing about *what the UI does* changes when the thing driving the
browser changes from a script to a native agent — only the mechanism for
finding and clicking elements does, and that mechanism is now your own
judgment, not a recorded selector.

**Read this before free-driving any of these surfaces.** It tells you the
states you should expect to pass through and what should be true at each one.
It does not tell you CSS selectors, ARIA paths, or exact DOM structure — go
look at the live page for that. Where this document says "confirmed", someone
watched it happen and wrote down what was true. Where it doesn't cover
something, nobody has confirmed it yet — proceed, but verify each state
yourself rather than assuming it matches a similar surface.

Every surface composes the same dialog shell and shared controls, described
once in **Shared components** below rather than repeated per surface.

Status per surface (also recorded machine-readably in `surface-coverage.json`
for the capability index): "confirmed" means the flow described was directly
observed; "confirmed for X, not for Y" means exactly that — don't extrapolate
X's proof to Y.

---

## Shared components

These are common to every surface below (`Configure widget` and `Configure
dynamic tab` are both instances of the same Material UI wizard-dialog
pattern).

**Dialog shell.** One visible dialog, uniquely identified by its accessible
title (`Configure widget` or `Configure dynamic tab`). It has a state rail
down one side and `Previous` / `Next` / `Cancel` / `Finish` actions. `Next`
renders as a clickable element with `role="button"`, not always a native
`<button>` — don't assume a CSS selector for "button" will find it. `Previous`
is disabled on the first state.

**Hierarchical column/field picker** (used for List columns, Data grouping,
Summary data, and filter Clause field selection). Opens an embedded picker
inside the dialog headed `Choose column`. It renders as one or more sibling
scrollable columns: the first column lists top-level field/relation choices;
selecting a relation opens a new sibling column one level deeper, up to
however many relationship hops the request needs. Selecting a *terminal*
(non-relation) field collapses the picker and adds one row to a "Selected"
area outside it, showing the field's display label and its full
relationship breadcrumb (e.g. `Bank → Currency → Code`). Each selected row
has an unnamed row-action control that opens a small menu — for a plain
selected column/grouping row, that menu's only action is `Remove`; for a
List-columns row specifically, the menu also exposes Alignment (submenu:
Left/Center/Right, opens on hover not click), Width, text/sticky settings,
grouping/sub-summary settings, Summary type (submenu: sum/avg/min/max/count,
opens on hover), Rename/Remove, and movement.

Selecting a terminal item in **List columns** specifically opens a *child*
dialog titled `Edit column`, stacked above the main dialog, with an editable
`Label` field (pre-filled, editable) plus `Cancel`/`Save`. On a dynamic-tab's
List columns, this child dialog additionally exposes `Make as group`, `Make
as summary`, and (only once "Make as summary" is checked) a `Summary Type`
picker with exactly `sum` / `count` / `avg` / `min` / `max`. Checking `Make as
group` alone was observed to reveal no further controls.

**Filters.** The initial Filters state shows one outer filter group: a
conjunction field (defaults to `and`), a remove control, and an add control
(a `+`). Opening the conjunction field opens a small popover with exactly two
choices, `and` / `or`. Opening the add control opens a popover with exactly
two branches: `Clause` and `Group`. Hovering `Clause` opens a sibling
hierarchical field picker (the same picker described above) restricted to
filterable fields; selecting a terminal field adds one Clause row to the
group, with the field label, an operator field, a value field, and a row-local
remove control. Selecting `Group` instead adds a nested child filter
container with its own conjunction field and its own add control, recursively
— a Group's add-menu and conjunction picker must be scoped to that child
container, not the parent's. Removing a temporary Clause returns the group to
its empty initial state (conjunction field + add control only).

The operator field opens its own small popover; observed options for a
text-compatible field were `contains` / `equals` / `notEqual` / `notNull` /
`isNull` — **this is specific to the field type that was staged when it was
observed, not a universal operator catalogue.** Check the actual field's
operator list rather than assuming it matches.

**Customize.** The last state before `Finish`, always titled with the
instruction `Customize the look of the widget` (or `...of the tab` for a
dynamic tab). Controls present vary by family:
- Fixed list / List-based families: `Title`, `Icon`, `Theme`,
  `Default rows per page` (choices: `10` / `25` / `50` / `100`), and usually a
  record-selection-checkbox toggle.
- Summary: `Title`, `Icon`, `Theme`, `Default rows per page` — **no
  grouping control and no record-selection-checkbox**, unlike list families.
- Dynamic window: `Title`, `Icon`, `Theme` only — **no rows-per-page and no
  record-selection-checkbox**, the thinnest Customize state of any family.
- Dynamic tab: `Show record selection checkboxes` and `Default rows per
  page`, plus visible `Finish` / `Previous` / `Cancel`.

`Finish` is visible at Customize in every family observed. Its presence in
the DOM is not authorization to click it — see `authoring-safety.md`.

---

## Entity dashboard

*(e.g. the Customer list/aggregate route.)* Status: confirmed.

Entry: on the dashboard route, a `Create widget` button opens `Configure
widget` at its initial `Widget type` state. Don't use the adjacent `Save
dashboard`, `Restore dashboard`, or `Share dashboard` controls — they're
unrelated dashboard-level actions, not part of widget authoring.

To edit an **existing** Fixed-list widget instead of creating one: open that
widget's own local kebab menu. Its action set is exactly `Edit list` /
`Remove list` / `Share widget`. Only `Edit list` is a non-destructive entry
point; it opens `Configure widget` directly at the existing widget's List
columns state (not at Widget type).

**Widget type state.** A direct radio group. `Bar chart` is checked by
default; the other choices are `Column chart`, `Line chart`, `Pie chart`,
`Radar chart`, `Tabbed list` (→ `DynamicListView`), `Fixed list` (→
`ListView`), `Summary` (→ `SummaryView`), `Dynamic window` (→ `DynamicView`).
Cards and Shared widgets appear as options on this surface too but remain
excluded from scope entirely.

**Fixed list.** Rail: `Widget type → Template → Data grouping → List columns
→ Filters → Customize`. **No independent Data source step** — the dashboard
route itself establishes the report entity (this is the key difference from
My Desk and detail-page, both below). Template exposes `Blank template`,
`Create widget from an existing template`, a disabled `Customise` toggle
(checked), an unchecked `Save as new template`, and a disabled `Template
name` field — checking `Save as new template` enables the name field. Data
grouping and List columns both use the shared hierarchical picker described
above; a temporary column may be required before Filters is reachable (see
`known-issues.md` for the persistence implication of this on My Desk — not
separately confirmed on entity-dashboard, but the same wizard code path is
shared).

**Summary.** Rail: `Widget type → List columns → Filters → Summary data →
Customize`. Summary data shows the instruction `Choose which colummn to total
for the summary` [sic — that's the actual product copy], a `Selected summary
column:` marker, an already-open hierarchical picker, and a `Clear summary`
control. Summary requires at least one reviewed list column and one reviewed
summary path — it has no Data-grouping step and no record-selection-checkbox
at Customize.

**Dynamic window.** Rail: `Widget type → Customize` — nothing else. It's a
two-step wrapper: no data configuration of any kind between selecting it and
reaching Customize.

---

## My Desk

*(the personal dashboard.)* Status: confirmed for Fixed list and its Filters
add-menu; Summary and Dynamic window are confirmed only as far as the shared
rail states described above, not to their own family-specific depth on this
surface specifically.

The one thing that makes My Desk different from an entity dashboard: it
inserts a **Data source** step between Template and Data grouping, because My
Desk has no fixed report entity the way a Customer dashboard does. Data
source shows the instruction `Set the data source for the widget` and one
settable field, initially showing a `None` sentinel. Opening it presents a
**separate, flat, searchable** picker (not the embedded hierarchical picker —
this is its own portal, outside the dialog's own DOM subtree, with a search
box and a flat alphabetical-ish list of source choices starting with `None`).
Selecting a non-sentinel source closes the picker, reflects the choice in the
Data source field, and only then does `Next` proceed to Data grouping.
**Never silently select the visible `None` entry for a required business
choice** — it's a real, selectable "no source" state, not a loading
placeholder.

After source selection, the rest of the Fixed-list flow (Data grouping →
List columns → Filters → Customize) matches the shared entity-dashboard
mechanics exactly — no observed wording or behavior differences once past
Data source.

**Filters add-menu, confirmed in detail:** the add control opens a popup with
exactly `Clause` and `Group`. Hovering/selecting `Clause` opens the sibling
hierarchical field picker; direct fields (e.g. `Account number`) are terminal
choices, relationship entries (e.g. `Bank`) expand into their own related
fields. Selecting `Group` adds a nested child container whose own conjunction
and add controls are scoped to that child, not the parent.

**What has actually been exercised on My Desk's Customer source**, beyond
generic mechanics: one Fixed-list placeholder column, either `Account number`
(direct field) or `Bank → Currency → Code` (a two-hop relationship path); up
to two groupings using those same two paths; and Filters limited in practice
to direct `Account number` with `contains` / `equals` / `notEqual` against a
non-empty string value, including nested `and`/`or` groups. This isn't a
technical ceiling on what the live UI supports — it's the boundary of what's
actually been watched happen. Past this boundary (other sources, other
fields, other operators, deeper filter trees), you're in unobserved
territory: proceed on the strength of the domain corpus (which does cover the
full field/operator graph) but verify each wizard state as you go rather than
assuming it behaves identically to the Customer/Account-number case.

See `known-issues.md` for a Fixed-list persistence quirk specific to (at
least) this surface.

---

## Detail page

*(an individual-record route, e.g. one specific Sales Order.)* Status:
**confirmed only for the Data-source picker mechanics and the route/context
precondition. No family's full configuration flow beyond source selection
has been observed on this surface.** `surface-coverage.json` deliberately
lists no families as covered here — don't read "some doctrine exists" as
"this surface is proven."

Like My Desk, a detail page inserts a Data source step (after Template,
before Data grouping) — but its picker is a **different mechanism** from My
Desk's. It's contextual and hierarchical rather than flat and searchable: an
embedded content list scoped to the current record's type and its related
entities, shown under a `Selected data source:` marker. Some entries are
terminal sources; selecting one updates the Data-source state directly.
Other entries are relationship navigators — selecting one keeps the current
list visible and opens a sibling child-source list one level deeper (the same
cascade pattern as the shared hierarchical picker, but this is a distinct
component from it, scoped to Data source specifically, not the generic field
picker). No terminal source or full relationship path has actually been
selected and carried through to Data grouping/List columns on this surface —
that remains unobserved.

Route/context precondition: this surface requires an eligible individual-
record route to be staged before `Create widget` is even opened; the exact
current-record context must remain unchanged for the duration of the wizard
interaction.

---

## Tabbed-list add-tab

*(appending one tab to an existing Tabbed-list widget.)* Status: confirmed.

This is **not** a way to create the outer Tabbed-list wrapper — that's just
the ordinary `DynamicListView` case of the entity-dashboard Widget-type
radio group above, with its own Customize being Theme-only (matching Dynamic
window's minimal Customize). This flow is specifically about adding one more
tab to a Tabbed-list widget that already exists.

Before opening any menu, resolve the target widget's identity from its exact
route, its tab-group title, and a widget-local identity signature. **If that
identity resolves to zero or more than one matching widget group, stop —
don't guess.** Once resolved, open only that target's own local kebab menu.
Its action set is exactly `Add tab` / `Duplicate current tab` / `Remove
tabbed list` / `Share widget`. Only `Add tab` is the entry point here; the
other three are excluded from this flow. Activating it opens a dialog titled
exactly `Configure dynamic tab`, rail: `Filters → Summary data → List
columns → Customize`.

- **Filters** reuses the shared Filters mechanics above exactly — no
  dynamic-tab-specific variation observed.
- **Summary data** shows a settable `Tab title` field alongside the
  instruction `Choose data to show in tab`, an already-open hierarchical
  picker, and `Clear summary`. **A non-empty Tab title is required before
  `Next` will advance to List columns** — this is a real gate, not a
  cosmetic field.
- **List columns** uses the shared List-columns mechanics, including the
  `Edit column` child dialog — but on a dynamic tab, that child dialog has
  the extra `Make as group` / `Make as summary` / `Summary Type` controls
  described in Shared components above.
- **Customize** exposes `Show record selection checkboxes` and `Default rows
  per page`, distinct from the outer Tabbed-list wrapper's own Theme-only
  Customize (they're two separate Customize states, at two nesting levels
  — don't confuse them).
