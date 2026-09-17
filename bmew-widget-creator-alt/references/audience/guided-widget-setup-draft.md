# Guided widget setup draft

Status: preserved design text, not active behavior.

This document preserves the agreed customer-facing text for a future guided-widget setup. It intentionally does not define the missing routing, answer handling, state, validation, or completion behavior. Do not use this document as active routing, response handling, validation, or product-capability guidance.

When guided setup is implemented, apply the customer conversation contract in `customer.md`: use plain customer language, ask only the next relevant question or small related group, carry forward prior answers, accept skips and amendments, and offer supported recommendations. This reference does not activate guided setup.

Before implementing guided setup, define how answers are represented, how each path advances or returns, how skipped items and amendments work, how supportable capability facts are resolved, and how the final preview is produced.

## Entering guided setup

**Great — I’ll guide you through it.**

We’ll build your widget one part at a time. I’ll only ask about the choices that matter for your widget, and I’ll keep track of what we decide along the way.

You don’t have to know all the answers now. At any point, you can ask me to **skip something for now**, **go back**, **change an earlier answer**, or **show you what we have so far**.

Let’s start with what you want the widget to do.

---

## Step 1 — Purpose

**What would you like this widget to help you see or understand?**

Just describe it in your own words. For example:

* Open sales orders that need attention
* Sales by customer this month
* Jobs grouped by engineer
* The total value of outstanding invoices
* A list of support tickets for the current customer

You don’t need to know which fields or type of widget to use yet. I can help with that.

---

## Step 2 — Where it will appear

**Where would you like to use this widget in BMEW?**

Tell me the page or area if you know it — for example, a Customer dashboard, Jobs, Sales Orders, or another BMEW dashboard.

If you’re not sure, tell me where you normally work when you want to see this information, and I’ll help narrow it down.

---

## Step 3 — Widget type

**How would you like to see the information?**

You can choose one of these, or describe what you have in mind and I’ll help you choose:

**1. List**
Show records in rows and columns.

**2. Chart**
Show the information visually as a bar, column, line, pie, or radar chart.

**3. Summary**
Highlight a single value, with supporting detail available underneath.

**4. Tabbed list**
Show several related summaries and lists as tabs.

**5. Dynamic window**
Provide a window that can display a selected BMEW summary dynamically.

If you’re not sure, tell me what you want the widget to accomplish and I’ll recommend a type.

---

## Step 4 — Data source

**What should the widget be based on?**

For example: Customers, Suppliers, Jobs, Sales Orders, Invoices, Support Tickets, or another area of BMEW.

If the page and widget type already determine the data source, I’ll use that and we can move on.

---

# LIST PATH

## Step 5 — Columns

**What information would you like to see in each row?**

Tell me the fields you want as columns, in the order you’d like to see them.

You can use ordinary descriptions — you don’t need to know the exact BMEW field names.

For example:

**Customer, Sales order number, Order date, Status, Net value**

If you’re not sure what fields are available, I can show you the relevant choices.

---

## Step 6 — Grouping

**Would you like the records grouped together in any way?**

For example, you might group sales orders by Customer, jobs by Engineer, or transactions by Month.

You can say **no grouping** if you want a straightforward list.

---

## Step 7 — Totals and summaries

**Would you like any totals or summaries shown with the list?**

For numeric fields, I may be able to show values such as:

* Sum
* Average
* Minimum
* Maximum

Tell me what you’d like summarized, or say **no totals**.

---

## Step 8 — Filters

**Should this widget show all matching records, or only certain ones?**

Describe any rules in your own words.

For example:

* Only open orders
* Invoices that are still outstanding
* Jobs for the logged-in user
* Orders created this month
* Customers in a particular status

You can combine several rules if you need to.

---

## Step 9 — Sorting

**How should the list be sorted when it first opens?**

Tell me the field and whether you want it in ascending or descending order.

For example:

* Newest first
* Customer name A–Z
* Highest value first

If you don’t have a preference, I can leave the default sorting in place.

---

## Step 10 — Column details

**Would you like to customize any of the columns?**

This is optional. We can change things such as:

* The column heading
* Column order
* Alignment
* Width
* Whether text wraps
* Whether a column stays visible while scrolling
* Totals for supported numeric columns

If the defaults are fine, just say **use the defaults**.

---

## Step 11 — List behaviour

**A couple of optional list settings:**

Would you like record-selection checkboxes?

And how many rows should normally appear on each page?

**10, 25, 50, or 100**

The standard choice is **25 rows** if you don’t have a preference.

---

# CHART PATH

## Step 5 — Chart style

**What kind of chart would you like?**

You can choose:

* Bar chart
* Column chart
* Line chart
* Pie chart
* Radar chart

If you’re not sure, tell me what comparison or trend you want to see and I’ll help you choose.

---

## Step 6 — Categories or X-axis

**What should appear along the chart’s main axis?**

This is the information you want to compare or group by — for example:

* Customer
* Engineer
* Month
* Status
* Product

For a line chart, this will normally be a date or time value.

---

## Step 7 — Values or series

**What value would you like the chart to measure?**

For example:

* Total sales value
* Number of orders
* Hours booked
* Outstanding balance

Depending on the chart, you may be able to add more than one series.

---

## Step 8 — Chart filters

**Should the chart include everything, or only certain records?**

Describe any filters in your own words.

For example:

* This financial year
* Open jobs only
* Sales for one department
* Exclude cancelled orders

---

## Step 9 — Legend labels

**Would you like to give the chart series their own labels?**

If the existing names are clear enough, we can keep them as they are.

---

# SUMMARY PATH

## Step 5 — Summary value

**What is the main value you want this widget to highlight?**

For example:

* Total outstanding invoice value
* Number of open support tickets
* Total sales this month
* Hours booked

I’ll check which summary values are available for the data we’re using.

---

## Step 6 — Supporting details

**What details would you like to see when you open the supporting list?**

Tell me which columns would be useful.

For example:

**Customer, Invoice number, Due date, Outstanding value**

---

## Step 7 — Filters

**Should the summary include everything, or only certain records?**

Describe the rules in your own words.

For example:

* Outstanding invoices only
* This month
* Open tickets only
* Jobs assigned to me

---

## Step 8 — Sorting

**How should the supporting list be sorted?**

For example:

* Oldest due date first
* Highest value first
* Customer name A–Z

If you don’t have a preference, I can leave the default sorting in place.

---

## Step 9 — Supporting list options

**Would you like to change anything about the supporting list?**

You can choose the number of rows shown per page and, where appropriate, whether record-selection checkboxes are available.

If you’re happy with the defaults, we can move on.

---

# TABBED LIST PATH

## Step 5 — First tab

**Let’s set up the first tab. What should this tab represent?**

Give it a short name and tell me what information it should show.

For example:

**Open Orders** — show the customer’s open sales orders.

---

## Step 6 — Tab summary

**What should the summary at the top of this tab show?**

For example, it might show a count, total value, average, minimum, or maximum based on an available field.

---

## Step 7 — Tab columns

**What information should appear in the list for this tab?**

Tell me the columns you’d like, in the order you want them.

---

## Step 8 — Groups and sub-summaries

**Would you like this tab to group records or show sub-summaries?**

For example, you could group records by Customer or Engineer and show a sum, count, average, minimum, or maximum for another value.

If you don’t need grouped results, just say **no grouping**.

---

## Step 9 — Tab filters

**Which records should appear on this tab?**

Describe any filters in your own words.

---

## Step 10 — Tab options

**Would you like record-selection checkboxes on this tab, and how many rows should normally appear per page?**

The standard page size is **25 rows**.

---

## Step 11 — More tabs

**Would you like to add another tab?**

If so, tell me what the next tab should represent and we’ll set it up the same way.

If not, we’ll move on to the finishing touches.

---

# DYNAMIC WINDOW PATH

## Step 5 — Dynamic window

**A Dynamic window starts empty and displays a BMEW summary when one is sent to it.**

There isn’t a fixed data source or set of columns to define for this type of widget.

We can move straight to its appearance.

---

# FINAL TOUCHES

## Appearance

**Now let’s finish the look of the widget.**

What title would you like it to have?

You can also choose an **icon** and **colour theme**, or I can use sensible defaults based on the information the widget displays.

---

## Review

**Here’s what we have so far:**

**Purpose:** [purpose]
**Location:** [page/context]
**Widget:** [widget type]
**Data:** [data source]
**Fields:** [fields/columns/axes/summary]
**Grouping:** [grouping]
**Filters:** [filters]
**Sorting:** [sorting]
**Appearance:** [title, icon, theme]
**Other options:** [relevant options]

**Anything you’d like to change before we finish?**

You can tell me what to change in your own words, ask to go back to an earlier part, or say **looks good**.

---

## Unresolved items

If something was skipped:

**We’re almost finished. There are just a few things we left open:**

* [unresolved item]
* [unresolved item]

Would you like to decide these now, or leave them open for review?

---

## Completion

**Your widget definition is ready.**

I’ve pulled together the choices we made and checked them against what BMEW supports.

[Present customer-facing widget preview.]

If you spot anything you’d like to change, just tell me what you want to adjust.
