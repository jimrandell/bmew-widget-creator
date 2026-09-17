# Preview-SQL export contract

## Purpose

`export-widget` and `export-dashboard` create a local, reviewable, parameterized preview-SQL artifact. An export is a copy of a validated proposed configuration for review. It is not an archive, restore/reset action, database mutation, database connection, or SQL execution.

Do not write an artifact until static capability validation has passed. If static validation fails, return the blocking evidence and no SQL artifact.

## Common artifact requirements

Write one UTF-8 `.preview.sql` file at the requested local path. If no path is supplied, use a descriptive working-directory filename ending in `.preview.sql`; do not overwrite an existing artifact.

Every artifact must begin with comments that state:

- `PREVIEW ONLY — DO NOT EXECUTE`;
- operation (`export-widget` or `export-dashboard`), creation mode, and exact host route/component/context identity;
- supported widget family and report source, or `DynamicView` layout-item-only status;
- exact bundled evidence records used;
- supplied target facts and every unresolved named placeholder;
- preservation rule for unrelated layout items; and
- developer responsibility to reconcile the then-current target layout JSON before any execution.

Use explicit named placeholders such as `:dashboard_configuration_id`, `:existing_configuration_json`, `:resulting_configuration_json`, `:layout_owner_user_id`, `:recipient_user_id`, `:template_id`, and `:runtime_record_id`. They are review placeholders, not executable MariaDB parameter syntax. The artifact must explain how each is resolved.

Use fully qualified table names in preview statements. Never include a connection command, executable credentials, or an instruction to run the artifact.

## `export-widget`

Use for one validated report-backed widget or one `DynamicView` layout item.

The artifact must contain:

1. The complete validated widget JSON, including all required serializer-compatible members.
2. A parameterized preview showing an append/replace operation against the selected `businessman.dashboard_configuration.configuration` JSON while preserving unrelated elements.
3. The exact selected-layout, ownership, route/context, and permission/module assumptions.
4. For templates or sharing, only the applicable parameterized `businessman.dashboard_widget_template` or `businessman.shared_widget_relation` preview statement and the required recipient/template facts.

For `DynamicView`, export common item fields, `type: 'DynamicView'`, and a fresh non-colliding ten-hex-character hash. Do not emit a `dynamic_window_configuration` statement, selected-Summary field, or prepopulated ListView state.

## `export-dashboard`

Use for a complete selected-layout copy supplied in the target snapshot or request. It does not discover, archive, restore, reset, or mutate a dashboard.

The artifact must contain:

1. The complete validated resulting layout JSON and the source layout identity.
2. A parameterized preview for the selected `businessman.dashboard_configuration` operation.
3. Explicit preservation/collision assumptions for layout ownership, active selection, templates, and sharing where applicable.
4. A list of every required target fact that was not supplied.

Never infer a current-record ID, recipient, active relation, or existing layout JSON from the dashboard name. Never offer the factory-default/restore mechanism through this operation.

## Placeholder boundary

Placeholders are permitted only for target-instance facts. They never stand in for static capability validity: report sources, display-label paths, option classes, relation traversal, filter operators/configuration, serializer shape, and bounded host eligibility must already be validated from bundled evidence.
