# DynamicView / Dynamic-window offline construction evidence

## Purpose and evidence boundary

This handover captures the static source contract for the product-facing **Dynamic window**, whose dashboard-item discriminator is `DynamicView`. It is an integration supplement to:

- [Report-backed widget construction corpus](report-widget-construction-corpus.md), which remains authoritative for `ListView`, `ChartView`, `SummaryView`, and `DynamicListView` report-option semantics.
- [Non-Card host and target evidence](non-card-host-and-target-evidence.md), which remains authoritative for dashboard attachment, selected-layout resolution, and generic target-snapshot requirements.

`DynamicView` is **not** a fifth report-option family. It has no report source, display-label paths, filters, or query configuration of its own. The limited Summary/ListView excerpts below explain its coordination contract only; they do not duplicate the report-option corpus.

The construction and coordination evidence is static local source inspection. The persistence section is additionally reconciled against the read-only local Development Server snapshot [dynamic-window-development-schema-snapshot.json](dynamic-window-development-schema-snapshot.json). No application code, database write, SQL preview generation, browser, deployment, skill edit, application edit, capability refresh, or independent-agent test occurred.

## Collection inventory

| Requirement | Status | Evidence / boundary |
| --- | --- | --- |
| DynamicView discriminator and generated dashboard-item payload | Captured | `addWidget.ts`, `item.ts` capsules below |
| Common dashboard-item and layout fields | Captured, with serializer/interface caveat | `BaseItem` plus wizard serializer. The report corpus owns the general layout conventions. |
| Hash generation and storage key | Captured | `randomBytes(5).toString('hex')`; dynamic row lookup is current user plus hash. |
| Summary-to-window event payload and fan-out | Captured | Summary emits `dynamic`; every mounted DynamicView registers a listener on its Dashboard instance. |
| Empty and restored window behavior | Captured | Nullable dynamic row configuration; renderer acts only on a stored/emitted `ListView` item. |
| Per-user persistence schema, create, read and save behavior | Captured and Development Server reconciled | Source capsules plus physical schema snapshot. |
| Physical columns, defaults, indexes, foreign key, row count and duplicate result | Captured, environment-specific | Development Server snapshot; do not generalize to another installation. |
| Copy, restore, share and modification implications | Captured as consequences of the static contracts; generic layout operations remain in the non-Card handover | No DynamicView-specific migration/copy operation exists in the inspected references. |
| Selected dashboard layout and generic host admission | Target-snapshot requirement | Refer to non-Card handover sections P1 and target-snapshot contract. |
| Existing hashes and dynamic rows for affected users | Target-snapshot requirement | Needed to reject collisions and decide prepopulation safely. |
| A persisted dashboard-wide selected-Summary ID | Unavailable because no such source mechanism was found | The actual mechanism is an in-memory Dashboard event plus separate per-window rows. |

## DynamicView dashboard-item and hash contract

The declared type is the intersection `BaseItem & DynamicItem`. `DynamicItem` adds only `type: 'DynamicView'` and `hash: string`.

```ts
export interface BaseItem {
    icon: keyof typeof icons
    item: DraggableItemProps
    theme: PaletteColorOptions
    title: string
    type: string
    removable: boolean
    restricted: boolean
    removeDuplicateCurrentTab?: boolean
    removeAddTab?: boolean
    removeTab?: boolean
    lastActiveTab?: number
}

export interface DynamicItem {
    type: 'DynamicView'
    hash: string
}

export type DynamicItemConfiguration = BaseItem & DynamicItem
```

Source: `server/component/dashboard/item.ts`.

The generic wizard begins with common `icon`, `item`, `theme`, `title`, `type`, and `removable` fields. When Dynamic window is selected it assigns `icon = 'DynamicFeed'` and `title = 'Dynamic window'`; it does not create `list`, `chart`, `summary`, or `summaryItems`. At finish it adds a fresh hash.

```ts
const parsedConfig: Partial<ItemConfiguration> = {
    icon: config.icon,
    item: config.item,
    theme: config.theme,
    title: config.title,
    type: config.type,
    removable: config.removable
}

if (config.type === 'DynamicView') {
    (parsedConfig as DynamicItemConfiguration).hash = randomBytes(5).toString('hex')
}
```

Source: `server/component/dashboard/configurator/addWidget.ts`.

### Serialization rules and limits

- For a newly created DynamicView, the actual wizard serialization is the common fields above plus `type: 'DynamicView'` and `hash`; no report/query members are serialized.
- `item` is required as the dashboard grid/layout object. Its default wizard value is `x: 0`, `y: 30`, `width: 6`, `height: 9`, `minimumWidth: 2`, `minimumHeight: 2`, `draggable: true`, `resizable: true`, `static: false`. Existing layout items may contain their saved layout/customization values.
- `BaseItem.restricted` is declared in the TypeScript interface but is not assigned by this new-widget serializer. Do not fabricate it in preview SQL merely to satisfy a static interface.
- `hash` is a ten-character hexadecimal value from five random bytes. The source does not query for collisions, declare a uniqueness constraint, or regenerate on collision. A preview generator must generate a fresh hash and reject a collision against the supplied target snapshot.
- The hash is part of the dashboard-layout JSON. Cloning, restoring, sharing, or copying that exact JSON preserves the hash unless an operation explicitly creates a new DynamicView through the wizard. The separate display-state key also includes user, so copied layouts for different users do not share a row solely because their hashes match.

## Summary-to-DynamicView coordination contract

A Summary renders its own small value query. Selecting it does not send a Summary identifier. Instead, it emits an ordinary `ListView` item made from that Summary’s persisted associated `list` configuration.

```ts
widget.on('click', () => {
    if (configuration.list !== undefined) {
        this.dashboard.emit('dynamic', {
            type: 'ListView',
            list: configuration.list,
            item: configuration.item,
            icon: configuration.icon,
            theme: configuration.theme,
            title: `${configuration.title}`,
            removable: true
        })
    }
})
```

Source: `server/component/dashboard/item.ts`, `SummaryView` branch.

Each DynamicView on the same `Dashboard` instance subscribes to that event. It renders only a ListView payload; it does not construct a `ReportQuery` itself.

```ts
const setConfiguration = (configuration: ItemConfiguration): void => {
    if (configuration.type === 'ListView') {
        widget
            .clearChildren()
            .addChild(
                new ListView(this.dashboard, configuration.list, this.application, undefined, this.context)
                    .setTitle(configuration.title)
            )
    }
}

if (this.dynamicConfig && this.dynamicConfig.configuration) {
    setConfiguration(JSON.parse(this.dynamicConfig.configuration) as ItemConfiguration)
}

this.dashboard.on('dynamic', configuration => {
    setConfiguration(configuration)
    this.dashboard.emit('updateDynamicConfig', ({ dynamicConfig: this.dynamicConfig, itemConfig: configuration }))
})
```

Source: `server/component/dashboard/item.ts`, `DynamicView` branch.

### Scope and initial state

- Fan-out boundary: every mounted DynamicView subscribed to the **same Dashboard component instance** receives the event. A different Dashboard instance, even if it displays the same saved layout name, has its own event emitter and runtime context.
- Host and record context: the rendered ListView receives the DynamicView’s enclosing Dashboard and `this.context`. The generic host/context rules are in the non-Card handover; DynamicView adds no persisted host or record identifier.
- User boundary: display persistence is keyed by the current user plus the item hash.
- Before a Summary is selected: a newly added DynamicView has no persisted display configuration. The renderer has no child ListView until it receives a `ListView` event. There is no source-defined default Summary selection.
- The source exposes no persisted, dashboard-wide `selectedSummary` field or equivalent. Multiple mounted windows change together only while an event is emitted in that Dashboard instance.

## Per-user display-state lifecycle

### Stored model

```ts
@Entity({ name: 'dynamic_window_configuration' })
export class DynamicWindowConfiguration extends Base {
    @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
    public id?: string

    @Column({ name: 'created', type: 'datetime', nullable: false })
    public created?: Date

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'user_id' })
    public user?: User

    @Column({ name: 'hash', type: 'char', nullable: false })
    public hash?: string

    @Column({ name: 'configuration', type: 'varchar', nullable: true })
    public configuration?: string | null
}
```

Source: `server/models/dynamicWindowConfiguration.ts`.

### Development Server physical-schema reconciliation

The static model is reconciled with the read-only local Development Server artifact [dynamic-window-development-schema-snapshot.json](dynamic-window-development-schema-snapshot.json). The environment-specific physical facts are:

- `id bigint(20) NOT NULL AUTO_INCREMENT PRIMARY KEY`.
- `created timestamp(6) NOT NULL DEFAULT current_timestamp(6)`, rather than the source model's generic `datetime` declaration.
- `user_id bigint(20) NOT NULL`; foreign key `dynamic_window_configuration_ibfk_1` references `businessman.application_user.id`, with `RESTRICT` update and delete rules.
- `hash char(10) NOT NULL`; it has a character maximum length of 10 and a reported octet maximum length of 40.
- `configuration text NULL`; it has a reported maximum of 65,535 characters/octets. This avoids the source-model `varchar` ambiguity and is conditionally sufficient for an initial serialized ListView item. A preview generator must still validate each serialized payload's encoded length is at most 65,535 bytes before optional prepopulation.
- Indexes are `PRIMARY (id)` and non-unique `user_id (user_id, hash)`. There is no unique `(user_id, hash)` constraint in this Development Server schema.
- At capture, the table had one row and no duplicate `(user_id, hash)` pairs. The existing portable skill snapshot also has one row with `id` 1, `user_id` 3, hash `2aec5a76f6`, and null configuration; its timestamp representation has greater local-time precision than the QuickDB result.

This environment-specific evidence does not establish another target installation's schema or contents. It confirms the source-level observation that there is no dashboard-configuration foreign key or host/dashboard-name field in this Development Server table.

The application lookup is:

```ts
if (itemConfiguration.type === 'DynamicView') {
    dynamicConfig = await dynamicConfigRepository.findOne({
        where: {
            hash: itemConfiguration.hash,
            user: application.getUser()
        }
    })

    if (dynamicConfig === undefined) {
        dynamicConfig = await dynamicConfigRepository.save(
            dynamicConfigRepository.create({
                user: application.getUser(),
                hash: itemConfiguration.hash
            })
        )
    }
}
```

On a Summary click, the Dashboard saves the emitted ListView item as JSON into that row:

```ts
this.on('updateDynamicConfig', ({ dynamicConfig, itemConfig }): void => {
    if (dynamicConfig) {
        dynamicConfig.configuration = JSON.stringify(itemConfig)
        getRepository(models.DynamicWindowConfiguration).save(dynamicConfig)
    }
})
```

Source: `server/component/dashboard/index.ts`.

### Consequences

- The dashboard layout and the last rendered Dynamic-window display are separate persistence domains. The former is a `DashboardConfiguration.configuration` JSON array; the latter is a nullable JSON string in one user/hash row.
- Adding a DynamicView item only is safe: when the application next mounts it, it lazily creates the row with null/absent `configuration`. No row is required in preview SQL for an empty initial window.
- A stored row can restore a prior ListView display before a user clicks a Summary during the current mount.
- The Development Server has a non-unique `(user_id, hash)` index, not a unique constraint. If more than one row exists for the same user/hash, the shown `findOne` has no explicit ordering. Treat that as an invalid/ambiguous snapshot condition rather than choosing one.
- The selection event writes the received ListView item. The shown ListView sort/rows-per-page handlers mutate that received object and emit DashboardItem `save`, but they do not emit `updateDynamicConfig`; do not claim from this source that post-selection sort or page-size changes are rewritten to the dynamic row.
- Removing or changing a layout item does not show DynamicWindowConfiguration cleanup in the inspected DynamicView paths. User deletion does delete that user’s DynamicWindowConfiguration records, but that is account cleanup, not layout synchronization.

## Preview-SQL decision table

| Requested result | Dashboard configuration change | Dynamic-window row change | Safe default / guard |
| --- | --- | --- | --- |
| Add a DynamicView only | Append a valid common dashboard item with `type: 'DynamicView'` and a fresh non-colliding hash to the selected layout JSON. | None. The application lazily creates an empty user/hash row when mounted. | **Safe default.** Do not invent a ListView or selected Summary. |
| Add Summary plus DynamicView | Append a valid SummaryView item, including its associated ListView, and a separate DynamicView item/hash to the same selected layout JSON. | None required. User selection of the Summary fills each mounted window. | **Safe default.** Summary must satisfy the existing corpus and host/context guardrails. |
| Prepopulate a window’s initial display | Same as above. | Insert/update exactly one `dynamic_window_configuration` row per affected user and DynamicView hash, with `configuration` equal to the complete emitted ListView item JSON derived from the intended Summary’s `list`. | Optional, user-specific operation. Require explicit intended users and reject pre-existing ambiguous user/hash rows. |
| Prepopulate several users or several Dynamic windows | Same relevant layout item(s). | One row per `(user_id, hash)` pair. | Never assume a shared dashboard layout implies shared display state. |

## DynamicView-specific target-snapshot requirements

These supplement, rather than repeat, the generic selected-layout/host/permission requirements in the non-Card handover.

| Input | Needed for | Meaning / validation |
| --- | --- | --- |
| Selected `DashboardConfiguration` row and exact existing JSON | Every operation | Identify the actually displayed layout and preserve unrelated items. See P1 in the non-Card handover. |
| Existing DynamicView item hashes in that layout and any copied/alternative layout in scope | New DynamicView | Generate and validate a non-colliding hash. |
| Affected user IDs | Optional prepopulation | The dynamic row is per user, not per layout. No user ID is needed for the layout-only safe default beyond the normal layout owner. |
| Existing `dynamic_window_configuration` rows for each affected `(user_id, hash)` | Optional prepopulation and collision protection | Preserve `id`, `created`, nullable configuration text, and detect duplicate/ambiguous rows. The Development Server's non-unique composite index makes this check essential. |
| Explicit initial-state choice | Every DynamicView request | `empty until selected` is the safe default; any initial ListView must be expressly requested. |
| Intended Summary’s already validated associated `list` configuration | Summary plus DynamicView, and required for prepopulation | This is the only report configuration a DynamicView can render. Validate from the existing report corpus. |

## Integration notes

A later `bmew-widget-creator` integration should add a compact DynamicView contract, not a report-option corpus:

1. Add `DynamicView` as a dashboard item that serializes common item fields plus `hash`, with no source/path/filter fields.
2. Require a supplied selected-layout snapshot and collision check before emitting an item hash.
3. Define layout-only insertion as the default supported operation.
4. Treat prepopulation as a separate opt-in operation requiring user IDs and a complete, validated associated ListView item.
5. Explain that a Summary emits its associated ListView to all mounted DynamicViews of one Dashboard instance; do not describe it as a persisted selected-Summary relationship.
6. Retain existing Summary cross-entity/context safety guards. DynamicView does not repair an unsafe Summary list or value query.

## Local consistency check

Static consistency checks performed against this document and the four inspected source files:

- `DynamicView`, `hash`, `dynamic`, `updateDynamicConfig`, `dynamic_window_configuration`, `user_id`, and nullable `configuration` are all represented.
- The document distinguishes dashboard layout JSON from user/hash display-state JSON.
- It contains no Card item/registry evidence and no report-option graph extraction.
- It states that an empty DynamicView needs no pre-created dynamic-window row, and that only optional initial-state prepopulation needs user/hash rows.
- The Development Server schema artifact records all five physical columns, defaults, both indexes, its foreign key, one current row, and no duplicate `(user_id, hash)` pair.
- It distinguishes static source facts from that environment-specific read-only database evidence and makes no browser, database-write, SQL-execution, deployment, or independent-agent-test claim.

## Explicit limitations

This handover contains one Development Server schema/content snapshot, but does not prove that another target has the same physical schema or rows, nor does it prove browser behavior. It does not provide a target’s permissions, modules, selected layout, hash population, or intended initial state. It does not define or broaden support for Cards or other wizard categories. Generic dashboard layout-selection, cloning, restore, template, and sharing mechanics are deliberately referenced from the non-Card handover rather than recopied here.
