# Audience entrypoint switch

The shared skill, evidence corpus, host rules, and static validation apply to both audiences. Only `active.md` selects chat/output behavior. It contains both selector blocks; exactly one must be uncommented and the other must be enclosed in one `<!-- ... -->` comment.

- [`customer-active.md`](customer-active.md) and [`developer-active.md`](developer-active.md) are the two copyable selector blocks.
- To switch audiences, uncomment the required two-line block and comment out the other entire block. No shared evidence or operating-contract file changes are needed.

Do not merge the two entrypoints into one active route. The developer entrypoint deliberately exposes technical preview artifacts in the developer workflow; the customer entrypoint deliberately keeps raw SQL and configuration JSON out of chat.

## Deferred guided setup design

[`guided-widget-setup-draft.md`](guided-widget-setup-draft.md) preserves the customer-facing guided-widget setup text for future implementation. It is not an active customer workflow. Any agent working on the guided setup must read it before changing routing, response handling, validation, or customer instructions.
