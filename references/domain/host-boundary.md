# Approved host boundary

Support report-backed widgets on domain dashboards and only those
record-detail hosts that meet all of these conditions:

- the bundled catalogue identifies a mounted current-record `Dashboard`
  construction;
- `getActions()` is wired to that exact Dashboard instance; and
- the request supplies and validates its exact route, component, runtime
  context, and applicable route/action/module predicates.

Dashboard name alone is insufficient. Construction does not prove action
visibility or even mounting — `non-card-host-and-target-evidence.md` records a
component that is never mounted despite being constructed, and a sibling
branch that is mounted but where only one branch of it actually attaches
`getActions()`. Exclude render-only hosts, unmounted constructions, the
Consignment template-branch exception, `ConfigurableListView` and
`DocumentModule` targets, Cards, and other uninvestigated categories. Defer
dynamic-name `BranchDetails` unless the request supplies and validates both
its resolved dashboard name and its `entityOf` context.

Saved-layout ownership is separate from a current-record ID at runtime. Never
infer a per-record saved layout merely because the host displays one record.

## Static validation boundary

Static evidence validates report configuration; it cannot be substituted with
placeholders. Validate report source, display-label paths, option classes,
capability/filter shape, host eligibility, and JSON shape from the bundled
evidence in this directory.

Target-instance facts may be supplied by a target snapshot or represented as
explicit named placeholders with resolution notes. This includes effective
user/role permissions, module/configuration gates, custom-field definitions
and limits, dictionary-term overrides, user IDs, the selected
`DashboardConfiguration` row and current layout JSON, recipients,
template/sharing rows, hashes, and runtime record IDs — see
`non-card-host-and-target-evidence.md`'s minimum target-snapshot contract for
the full field list.

Developers remain responsible for resolving every placeholder and reconciling
current target layout JSON before execution. Preserve unrelated JSON items;
never treat captured database exports (including `seed-widgets/`) as live
rows or a universal template.
