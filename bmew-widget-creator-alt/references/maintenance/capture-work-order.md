# Adding a new observed UI fact

This replaces `browser-authoring/phase-3-capture-work-order.md`, which
described how to fill in a JSON capture packet for the old contract-file
system. The underlying activity is the same — stage a real UI state and write
down what's actually true about it — but there's no contract schema to feed
anymore, so this is shorter.

**Do not begin this without the person's explicit go-ahead.** An absent
observation, elapsed time, or a hunch that something might have changed is
not authorization to start poking around the live UI looking for it.

## Preconditions

- Use whatever browser access is already available to you.
- The person stages the exact state they want observed and confirms it's
  ready — you're recording what's true about a state someone else set up and
  pointed you at, not exploring freely to find something interesting.
- Don't click `Finish`, `Save`, `Restore`, `Share`, reload, or navigate beyond
  the specific staged state, unless the observation itself requires it and
  the person has said so.

## What to write down

For one observed state, in `wizard-flows.md` (under the relevant surface
section, or a new one if this is a new surface):

1. What surface and rail state this is (e.g. "My Desk, Fixed-list Data
   source, before a source is selected").
2. What's visibly true: instruction text, which controls are present, their
   initial values, what's enabled/disabled.
3. What action was taken (if any) and the resulting state — described the
   same way `wizard-flows.md` already describes other transitions: in plain
   language, not as a selector or locator string.
4. Anything that surprised you relative to a similar surface already
   documented — that's usually the most valuable part of a new observation.

Then update `surface-coverage.json` if this changes a surface's `status` or
`families` list — and if it does, make sure `wizard-flows.md`'s prose carries
any caveat about partial coverage in the same place as the status, not off in
a separate note (see `../ui-doctrine/README.md`'s note on why this matters —
it's exactly the mistake `detail-page`'s old contract made).

**Don't record:** raw HTML, full accessibility-tree dumps, generated
element IDs or CSS classes, screenshots, visible business data, credentials,
or current-record values. Write down what's structurally true, not a replay
log.

## Order of work

Cover one surface or one meaningfully new state at a time. Check whether the
observation was actually useful — did it change what `wizard-flows.md` says,
or just confirm something already documented — before moving on to the next
one.
