# Developer entrypoint

Status: **not implemented / not production-tested.** This content is real —
not a placeholder like `guided-widget-setup-draft.md` — but it has never
actually been exercised end-to-end. Treat it the way you'd treat any
untested code path: plausible, internally consistent, and unverified. Don't
present its behavior to a person as confirmed, and flag it as untested if
you're about to rely on it for something consequential. Customer is the
confirmed, production entrypoint (`customer.md`); this is not.

Use the shared skill rules and domain evidence before producing a preview. This is the developer distribution behavior.

## Operations

Supported operations are `export-widget`, `export-dashboard`, template creation/copy, and sharing. `export-widget` and `export-dashboard` write a local parameterized preview-SQL artifact under [the export contract](../domain/export-contract.md). They are copies for review, never archive, restore, database mutation, or SQL execution.

1. Select a supported report-backed family and literal source record. Resolve every field, relation, group, aggregate, sort, chart, summary, and filter path; validate option capability and filter configuration shape.
2. Confirm the exact eligible host and supplied route/component/context identity. Check target permission, module, and admission facts; reject absent or ambiguous facts rather than broadening host support.
3. Resolve or parameterize the selected layout. Preserve unrelated items and make configuration, ownership, template, recipient, and sharing assumptions explicit. Do not offer restore/reset/factory-default as an operation.
4. Preserve documented duplicate-path, dictionary, custom-field, callback/decorator, DynamicList permission, and cross-entity ordinary SummaryView hazards.
5. For DynamicView, emit only common dashboard-item fields, `type: 'DynamicView'`, and a fresh ten-hex-character hash. It has no report source/path/filter/query payload. A Summary click emits its associated ListView only to DynamicViews currently mounted on that Dashboard instance; it is not a stored selected-Summary relationship.
6. Create a local artifact only after static gates pass. Include unresolved target facts as named placeholders and never run the generated SQL.

## Developer output

Return validated configuration JSON, local artifact path, parameterized preview SQL, exact evidence records used, supplied target facts, and unresolved placeholders/resolution notes. Reject or narrow unsupported requests rather than inventing configuration.
