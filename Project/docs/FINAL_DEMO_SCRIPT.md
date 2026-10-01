# PharmaStock — Final Demo Script

A ~15 minute walkthrough for faculty review. Each step lists the **UI path** and,
where it helps, the **API endpoint** or **command** behind it.

## Before you start

```powershell
# Terminal 1 — API
cd Project/backend
Copy-Item .env.example .env     # set MONGODB_URI (replica set), JWT_SECRET, CLIENT_ORIGIN
npm run verify-db
npm start                      # http://localhost:5000

# Terminal 2 — UI
cd Project/frontend
npm run dev                    # http://localhost:5173
```

Seed a fresh demo dataset first if needed:

```powershell
cd Project/backend
$env:SEED_CONFIRM='RESET'
$env:SEED_PASSWORD='<demo password>'
npm run seed -- --force
```

Demo logins (all share the seed password):

| Email | Role | Use for |
|---|---|---|
| `karkala@pharmastock.in` | Admin | The main walkthrough |
| `sateesh@pharmastock.in` | Viewer | The RBAC demonstration (step 13) |

---

## 1. Login and RBAC foundation

**Path:** `/login`

Sign in as `karkala@pharmastock.in`.

> **Say:** Authentication is JWT-based with bcrypt-hashed passwords. The token is
> stored in `localStorage` for demo simplicity, and the app revalidates it with
> `GET /api/auth/me` on load — an invalid token is cleared immediately.

Open **Profile → Change Password** to show the self-service credential flow
(`POST /api/auth/change-password`), then close it. Mention that a user cannot
change their own role or status: that is server-enforced, not just hidden in the UI.

## 2. Dashboard

**Path:** `/dashboard`

Show the KPI cards, the low-stock and expiry panels, and the charts.

> **Say:** Every number is computed server-side in `dashboardService.js` and
> returned ready to render. Stock value is `Batch.quantity × Batch.costPerUnit`,
> summed across live batches — the browser never computes totals.

## 3. Medicine catalogue

**Path:** `/medicines`

Show the 34 seeded medicines, the category filter, and pagination.

Open one medicine to reach `/medicines/:id`.

Add or edit a medicine through the modal to demonstrate centralized validation —
submit an empty name or a negative price and show the inline field error coming
from the API, not from a browser-only check.

> **Say:** The schema has no SKU, tax, or prescription fields. Stock identity is
> the **batch**, not the medicine — a medicine is a catalogue entry, a batch is a
> physical lot with an expiry date.

## 4. Suppliers and batches

**Path:** `/suppliers`, then `/batches`

On **Suppliers**, open a supplier to show supplied-medicine and payment-compliance
rollups derived from purchase history.

On **Batches**, show `batchNo`, supplier, expiry date, quantity, and cost per unit.

Now click **Add Batch**.

> **Say:** This is an important design point. The batch form submits only
> descriptive fields — no quantity, no cost. A new batch always starts at
> quantity 0 and cost 0, because stock only arrives through a purchase. If you
> try to PATCH quantity directly, the API returns `BATCH_STOCK_IMMUTABLE`.

To demonstrate that server-side guarantee directly:

```powershell
$headers = @{ Authorization = "Bearer <token>" }
Invoke-RestMethod -Uri http://localhost:5000/api/batches/<batchId> -Method Patch `
  -Headers $headers -ContentType "application/json" -Body '{"quantity":999}'
# => 400 BATCH_STOCK_IMMUTABLE
```

## 5. Purchase workflow

**Path:** `/purchases` → **New Purchase**

1. Pick a supplier.
2. Add a medicine line with quantity and per-unit cost.
3. Enter a **paid amount** that is intentionally less than the total.
4. Submit.

Show the resulting purchase row with the **Paid** and **Outstanding** columns.

> **Say:** The purchase runs inside a MongoDB transaction. It creates or tops up
> batches, and outstanding payment is derived server-side as
> `total - paidAmount` — never trusted from the client.

Verify in the terminal:

```powershell
Invoke-RestMethod -Uri http://localhost:5000/api/purchases/<id> -Headers $headers |
  Select-Object -ExpandProperty data | Select-Object total, paidAmount, outstanding
```

## 6. Inventory update (adjustment)

**Path:** `/adjustments` → **New Adjustment**

Decrease the quantity of that medicine's batch by a small amount and give a
mandatory reason such as "damage in transit". Submit.

> **Say:** Adjustments are stored as their own document type, not as an edit to a
> purchase. That keeps manual corrections distinguishable from real stock
> movements, and every one is audited.

Confirm the audit trail entry at `/audit-log` — action `INVENTMENT_ADJUSTMENT`,
with your name as the actor.

## 7. FEFO sale — the centrepiece

**Path:** `/sales` → **New Sale**

1. Use **Paracetamol 500mg**, which has multiple batches with different expiry dates.
2. First, open `/batches` filtered to that medicine and note the expiry dates and
   quantities — the earliest-expiring lot has visible stock.
3. Sell a quantity large enough to consume more than one batch.
4. Submit, then reopen the batch list.

> **Say:** This is FEFO — First Expired, First Out. The service loads only batches
> with `quantity > 0` and a non-expired date, sorts them by expiry ascending, and
> consumes them in that order. It writes one allocation record per batch consumed,
> which is what makes the refund exact.

Show the sale's COGS and gross margin. Those come from the allocated batch costs,
snapshotted at sale time.

## 8. Expiry and low-stock behaviour

**Path:** `/expiry` and `/low-stock`

Show the expiry buckets by days remaining.

Then go back to **Adjustments** and reduce a medicine below its reorder level.
Return to `/low-stock`.

> **Say:** Reorder level is per medicine. When on-hand quantity drops below it, an
> alert is generated. These alerts are **shared**, not personal.

## 9. Notifications and acknowledgement

The bell icon in the top bar shows the unread count from `GET /api/notifications`
(`meta.unread`, not the page length — a deliberate fix so the badge can't lie).

Acknowledge an alert from the panel.

> **Say:** Because the alert feed is shared, acknowledgement records **who**
> reviewed it — `acknowledgedBy`, `acknowledgedByEmail`, `acknowledgedAt` — rather
> than flipping an anonymous flag nobody can be shown to own.

Verify:

```powershell
Invoke-RestMethod -Uri http://localhost:5000/api/notifications -Headers $headers |
  Select-Object -ExpandProperty data | Where-Object acknowledgedBy |
  Select-Object title, acknowledgedByEmail
```

## 10. Refund workflow

**Path:** `/sales`, open the sale from step 7 → **Refund**

Provide a reason and confirm.

Show the batch quantities returning to their pre-sale values — including the
partially consumed batch.

> **Say:** The refund restores the *exact* allocations recorded on the original
> sale, not "some quantity from some batch". The sale's COGS snapshot is cleared
> so margin reporting stays correct.

Now try to refund it a second time.

> **Say:** The second attempt is rejected. Without that guard you could credit the
> same stock twice.

## 11. Analytics

**Path:** `/analytics`

Show revenue, COGS, gross margin, stock value, expiry exposure, supplier
performance, and the month-bucketed trend.

> **Say:** Month bucketing is done in UTC, so a sale at 23:30 UTC can never land
> in a different month than the trend chart that displays it. All date
> boundaries come from one shared helper, `src/utils/dates.js`.

## 12. Reports and CSV export

**Path:** `/reports`

1. Choose **Sales Report**.
2. Set a start and end date, then generate.
3. Show the preview.
4. Click **Export CSV** — the file downloads.

Then try **Inventory Report** to show live stock value, and **Expiry Report** for
the horizon view.

> **Say:** A `to` date includes the entire day — the upper bound is
> `23:59:59.999Z`, not midnight. That is an easy off-by-one-day bug to write, and
> there is a unit test pinning it.

## 13. RBAC restriction

Sign out. Sign in as `sateesh@pharmastock.in` (Viewer).

Show that the Purchases, Adjustments, Users, and Audit Log entries are not
available. Try the API directly to prove the restriction is server-side:

```powershell
Invoke-RestMethod -Uri http://localhost:5000/api/purchases -Method Post `
  -Headers $headers -ContentType "application/json" -Body '{"supplier":"...","items":[]}'
# => 403 FORBIDDEN — the button being hidden is a convenience, not the boundary
```

## 14. Transaction and rollback demonstration

**The strongest single demo if time is short.**

Show the replica-set requirement:

```powershell
# With MONGODB_URI pointing at a standalone mongod, any stock write returns:
#   503 TRANSACTIONS_REQUIRED
```

Then explain the guarantee: purchases, sales, refunds, and adjustments each run
inside `session.withTransaction`, so the ledger line, the batch quantity, the
allocation records, the notification effects, and the audit record all commit or
roll back together.

Demonstrate rollback for real by attempting an over-sale:

```powershell
# Sell more than the total unexpired quantity of a medicine.
# The API rejects it before any batch is decremented, and the browser E2E suite
# asserts exactly this — no partial decrement is left behind.
```

> **Say:** Concurrent sales serialize on the same batches, so the FEFO check and
> the decrement cannot interleave and hand out stock that does not exist.

## 15. Closing — architecture and verification

Walk through the layering on the whiteboard or from the README:

```text
React + Vite → JWT-authenticated Express → authorization middleware
             → validation → controller/service → Mongoose → MongoDB (replica set)
```

Then present the verification evidence:

```powershell
cd Project/backend
npm test                                   # 25 tests, 25 pass
npm run verify-db                          # Database verification: PASS
cd ..\frontend
npm run build                             # production build
npm run test:e2e                          # 23 browser checks, 0 failures
npm audit --audit-level=high               # 0 vulnerabilities
```

Full evidence is in [`FINAL_REVIEW_QA.md`](FINAL_REVIEW_QA.md) and the hardening
narrative is in [`FINAL_REVIEW_REPORT.md`](FINAL_REVIEW_REPORT.md).

### Honest limitations to state if asked

- The JWT lives in `localStorage`, so an XSS flaw would leak the session. A
  production build should use an `HttpOnly`, `Secure` cookie.
- Settings are per-browser, not per-user.
- CI is configured but has not yet run on GitHub Actions.
- Accessibility was reviewed statically; no axe or screen-reader pass was run.
- Reports cap at 1000 rows per request and CSV export is client-side.

## Timing guide

| Step | Minutes |
|---|---|
| 1–2 Login, RBAC foundation, dashboard | 2 |
| 3–4 Catalogue, suppliers, batches | 3 |
| 5–6 Purchase, adjustment | 2 |
| 7 FEFO sale | 3 |
| 8–9 Expiry, low stock, notifications | 2 |
| 10 Refund + double-refund rejection | 2 |
| 11–12 Analytics, reports, CSV | 2 |
| 13 RBAC restriction | 1 |
| 14 Transaction / rollback | 2 |
| 15 Architecture + verification | 2 |

Total ≈ 21 minutes; steps 1, 10, and 14 are the ones to keep if time is cut.
