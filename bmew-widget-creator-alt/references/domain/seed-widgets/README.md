# Seed widget references

These files are read-only reference captures of packaged dashboard widgets.

- `widget-templates.jsonl` is the canonical, database-shaped capture of reusable `dashboard_widget_template` rows. Each record's `configuration` remains the exact JSON text returned by the database.
- `widget-templates.decoded.jsonl` is the derived companion for template discovery, with each `configuration` decoded into a JSON object.
- `factory-dashboard-layouts.jsonl` is the canonical, database-shaped capture of factory `dashboard_configuration` rows. Each record's `configuration` remains the exact JSON text returned by the database.
- `factory-dashboard-layouts.decoded.jsonl` is a derived companion for inspection. It preserves the same records, but decodes each `configuration` string into a JSON object or array.

Use the canonical file when exact storage representation matters. Use the decoded companion for extracting widget patterns, fields, filters, titles, and layout examples. Do not treat user-specific dashboard, restore, shared-widget, or dynamic-window rows as seed-widget references.
