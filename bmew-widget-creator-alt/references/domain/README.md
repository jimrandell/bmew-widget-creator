# Domain evidence package

This directory (formerly `offline-evidence/`) is the authoritative BMEW widget
domain knowledge bundled with `bmew-widget-creator`. It is static evidence
gathered by reading BMEW source directly — no database connection, SQL
execution, browser testing, or deployment was involved in producing it. See
`../maintenance/refresh-work-order.md` for how it gets regenerated.

| File | Role |
| --- | --- |
| `report-widget-construction-corpus.md` | Literal report-option graph and shared construction knowledge for the four supported report-backed families (`ListView`, `ChartView`, `SummaryView`, `DynamicListView`). 184 report sources, provenance-cited to file:line. |
| `non-card-host-and-target-evidence.md` | Static host/persistence evidence: dashboard attachment, permission/module gates, custom fields, dictionary terms, and the minimum target-snapshot contract (the facts a live target instance must supply before a widget plan can be finalized). |
| `dynamic-view-contract.md` | Static `DynamicView` / Dynamic-window coordination and safe-attachment contract. Not a fifth report-option family — see the file for why. |
| `dynamic-window-development-schema-snapshot.json` | Environment-specific Development Server schema observation, used only to reconcile the DynamicView persistence section above. Never treat its rows, users, hashes, or schema as universal facts. |
| `export-contract.md` | Local preview-only behavior contract for `export-widget` and `export-dashboard`. |
| `report-source-identities.json` | Small alias table reconciling naming mismatches between the registered relationship model and the literal corpus heading (e.g. relationship target `AllJobCost` vs. corpus heading `allJobCosts`). Consumed by the capability-index builder in `../capability-index/`; read it directly if you hit a source name that doesn't resolve against the corpus. |
| `seed-widgets/` | Real captured widget/dashboard-template rows (`dashboard_widget_template` and factory `dashboard_configuration` records), canonical and decoded forms, plus `recipe-catalogue.json`, a derived filter over them limited to the four supported report-backed families. See `seed-widgets/README.md`. Useful as worked examples of valid widget JSON; **not semantic authority** — every recipe carries `notSemanticAuthority: true` and must not be used to justify a path, filter, or capability that the corpus itself doesn't support. |

The Markdown files are copied verbatim from their original evidence handovers
so their literal option graphs and source capsules stay available offline.
`SKILL.md` is the routing and decision layer; it does not duplicate these
records.

> Documentation note: `report-source-identities.json`, `seed-widgets/`, and
> `recipe-catalogue.json` were previously unreferenced from any prose file in
> this skill — reachable only by reading script source. This table is that
> missing documentation entry. Their content, format, and continued existence
> are unchanged; nothing about them was altered beyond making them findable.
