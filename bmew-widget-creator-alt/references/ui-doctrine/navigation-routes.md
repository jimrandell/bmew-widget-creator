# Navigation routes

A curated subset of BMEW's dashboard (entity-list) routes, hand-picked from
the full host catalogue in
[`../domain/non-card-host-and-target-evidence.md`](../domain/non-card-host-and-target-evidence.md)
for direct URL navigation. It exists so the agent can jump straight to a
known dashboard instead of clicking through menus to reach it — see
[`authoring-safety.md`](authoring-safety.md)'s navigation section for how to
use it and why detail pages aren't listed here.

Every route below is a dashboard/list surface with no `:parameter` — none of
them require a target-instance record ID, so they're safe to navigate to
directly. Combine a route with the current browser tab's own origin (for
example `https://<tenant>.example.com` + `/purchasing/suppliers`); this file
never states or assumes a tenant's domain.

This list is deliberately short and hand-picked, not the full 121-host
catalogue. Extending it is a decision for the person to make, not something
to do unprompted — see `authoring-safety.md`.

| Name | Route | hostId |
| --- | --- | --- |
| customersList | `/sales/customers` | H022 |
| suppliersList | `/purchasing/suppliers` | H103 |
| salesOrdersList | `/sales/orders` | H094 |
| purchaseOrdersList | `/purchasing/orders` | H080 |
| quotesList | `/sales/quotes` | H084 |
| jobsList | `/work/jobs` | H047 |
| invoicesList | `/financials/invoices` | H045 |
| productList | `/purchasing/products` | H060 |
| prospectsList | `/sales/prospects` | H077 |
| opportunitiesList | `/sales/opportunities` | H058 |
| desk (My Desk) | `/my/mydesk` | H029 |
