# Known BMEW UI issues

## Fixed-list Finish can silently drop the first column set

**Observed on:** My Desk, Customer source, Fixed-list creation. Not
separately confirmed on entity-dashboard's Fixed-list path, though it shares
the same underlying wizard code, so treat it as a live risk there too until
disproven.

**What happens:** creating a new Fixed-list widget, applying a full set of
list columns, and clicking `Finish` does not reliably retain the configured
columns. One authorized run showed the widget saved with its columns
missing. Reopening that same widget's `Edit list` action, reapplying the
column set, and finishing again *did* retain them.

**This is a verified workaround, not a root-cause diagnosis.** Nobody has
established *why* the initial Finish loses the columns — only that the
two-stage sequence below reliably avoids the symptom.

**The workaround:**

1. Plan the widget with exactly one placeholder list column (not the full
   intended set).
2. `Finish`.
3. Verify the resulting widget — open that same widget's `Edit list` action
   and check whether the placeholder column actually persisted.
4. If it persisted: reopen and apply the complete intended column set,
   following the unchanged empty-filter route, then `Finish` again and
   verify the rendered headers and rows once the dialog closes.
5. If the placeholder did **not** persist: this is the failure condition
   under active investigation — don't paper over it by retrying blindly;
   surface it.

**Scope of the repair exception:** this two-stage lifecycle is the *only*
case where creating-and-then-reopening the same widget in one authorized run
is acceptable. It must target the exact widget the current run just created
— never an existing widget the person didn't ask you to touch. See
`authoring-safety.md`'s create-only rule for why this is narrow by design.

**Family scope:** this is a Fixed-list-only policy until equivalent evidence
exists for another family. Don't apply the same two-stage pattern to Summary,
Dynamic window, or Tabbed-list/dynamic-tab creation without first confirming
the same symptom actually occurs there.
