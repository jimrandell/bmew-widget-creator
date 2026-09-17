# Widget SQL capability manual refresh work order

## Goal

Rebuild the source-backed knowledge needed to generate only widget JSON and
SQL that the chosen Businessman Web source supports. This work order runs only
when the user explicitly requests a refresh.

## Constraints

- Do not self-initiate this work order. An absent catalogue, elapsed time, or
  any perceived source mismatch is not a refresh request.
- Do not inspect, determine, compare, validate, or act on version or release
  identity. The user alone decides whether a refresh is wanted and which
  source context it uses.
- Read source and target-instance evidence without executing SQL or altering
  Businessman Web source, releases, or database records. Creating the four
  required skill-reference outputs is the authorised documentation work.
- Record the chosen source location and direct source evidence.
- Treat source, generated release, and live database behaviour as separate.
- Dynamically discover source sets. Do not copy a previous release's list.

## Required outputs

Save the first three outputs in this skill's `references/` directory and refresh
the derived index in its fixed capability-index location. Use an output
label supplied by the user when one is wanted; do not derive one from a source
version or release:

1. `<label>-widget-source-manifest.md` — Phase 1 file index only.
2. `<label>-widget-capability-research.md` — Phase 2 detailed findings.
3. `<label>-widget-capability-catalogue.md` — Phase 3 concise reference.
4. `capability-index/capability-index.json` — regenerated derived index with the
   complete authority-input hash set and generator protocol version.

Do not publish Phase 3 or refresh the index until Phase 2 is complete and
reviewed against the saved Phase-1 manifest. Generate the index only with
`scripts/build-widget-capability-index.mjs` and validate its input hashes before
publication. Preserve every earlier output and label superseded or incomplete
material rather than deleting it.

## Phase 1: source discovery

Follow [the source-discovery work order](source-discovery-work-order.md).
Save the exact grouped paths, counts, discovery expressions, source location,
and inclusion/exclusion evidence. The manifest must not contain behavioural
conclusions beyond why each source set is included.

## Phase 2: capability research

Use the saved Phase-1 manifest as the mandatory reading plan. Record source
anchors and detailed findings in `<label>-widget-capability-research.md`.
Do not substitute filenames, counts, or broad search results for behaviour.

### Required research coverage

1. Trace dashboard entry, `ItemConfiguration`, renderer, and persistence.
   Enumerate each active discriminator, common/type-specific JSON members,
   serializer defaults, and edit/create/remove/resize/duplicate paths.
2. Trace every active widget/tab wizard to emitted JSON. Compare interfaces,
   serializers, and core-data fixtures; report any difference.
3. Locate `getSourceTables()` and report all dashboard, module, permission,
   and custom-field limits on source eligibility.
4. Locate the `getReportOptions()` registry, its registration lifecycle, and
   every callback dynamically. Include sibling registration files and all
   entity models needed for relation metadata.
5. Trace the picker, report options, relation paths, joins, filters, query
   execution, aliases, aggregation, cycle guards, and permissions. Evaluate
   instantiated callback options where source-only enumeration cannot prove
   their labels, option classes, or accepted filters.
6. Trace dashboard configuration, templates, restore snapshots, sharing,
   selected-dashboard relations, dynamic windows, schema/upversions, and all
   core-data dashboard examples.
7. Trace the card registry and every selectable card implementation, including
   contextual eligibility, permissions, removability, and special members.
8. For every candidate historical source, prove its state through export,
   import, and call-path evidence. Absence from one current wizard import is
   insufficient proof of exclusion.

### Phase-2 completion check

The research record must contain: source-manifest reference;
a per-widget-type configuration table; wizard/default/serializer findings;
field-path and join contract; filter/query contract; persistence contract;
card and dynamic-window rules; active/excluded candidates with evidence;
SQL-generator validation rules; and gaps requiring live database or browser
verification.

## Phase 3: skill publication

Derive `<label>-widget-capability-catalogue.md` from the completed Phase-2
research record. It is the normal reference used by `SKILL.md`; link it to the
research record and manifest. Keep it concise enough for widget-SQL generation
while preserving the research record as the detailed evidence layer.

## Publication completion check

The four outputs together must answer: which source files establish the
release's widget behaviour; which widgets are loadable; how each valid
configuration is authored and rendered; which entities/paths/filters/relations
are selectable; how they become queries; which persistence records participate;
and how the evidence will be rediscovered next release.
