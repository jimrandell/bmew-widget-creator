# Widget SQL source-discovery work order

## Purpose

Create the Phase-1 source manifest for the Businessman Web source context the
user has chosen. The
manifest tells a later researcher where the evidence is. It must not describe
widget behaviour, infer schemas, or become a substitute for Phase-2 research.

## Required manifest content

Record the source location and the exact discovery commands or expressions
used. For every source set, include its complete path list, count, why it is
included, and any inclusion or exclusion uncertainty. Do not inspect,
determine, compare, or report version or release identity.

Discover at least these sets dynamically from the chosen source context:

1. Dashboard entry, widget union, renderer, persistence, and every dashboard
   component/configurator source that might author or consume widget JSON.
2. Widget/tab dialogs, serializers, filters, and known-good core-data
   dashboard examples.
3. Source-eligibility logic, configuration registry/registration lifecycle,
   every `getReportOptions.ts` callback, and each callback's sibling
   registration file.
4. Entity models needed for report-source and relation metadata.
5. Report-option, picker, relation, filter, query, aggregate, alias, and
   permission engine sources.
6. Dashboard configuration, template, restore, sharing, dashboard-user, and
   dynamic-window models plus schema and applicable version-update sources.
7. Card registry and all card implementations that could be selectable.

## Classification rules

- Include candidates first. Exclude one only with export, import, and reachable
  call-path evidence, not because one wizard does not import it.
- A recursive file count is evidence only when saved with its exact path list.
- Do not turn callback filenames into an entity, field, relation, or operator
  catalogue. That is Phase 2 work.
- Keep source, generated release, deployed database, and browser-observed
  behaviour distinct.

## Phase-1 acceptance check

Save `<label>-widget-source-manifest.md` before beginning Phase 2, using a
label supplied by the user when one is needed. A
reviewer must be able to use the manifest alone to locate every source family
needed to determine widget JSON, authoring, selectable capabilities, query
translation, persistence, cards, and runtime constraints.
