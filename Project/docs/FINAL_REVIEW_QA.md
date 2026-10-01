# PharmaStock — Final QA Evidence Log

Recorded output from the final verification pass. Every line below is copied
from a real command run on 2026-10-01 against a local MongoDB replica set.

Environment: Windows, Node.js 24.19.0 local (CI pins 24.19.0), MongoDB replica
set `rs0` on port 27018, demo database `pharma_stock_management`, disposable E2E
database `pharmastock_e2e`.

---

## 1. Backend test suite

```powershell
$env:RUN_TRANSACTION_TESTS="true"
$env:SEED_PASSWORD="<local test password>"
npm test
```

```text
ℹ tests 25
ℹ pass 25
ℹ fail 0
ℹ skipped 0
ℹ duration_ms 1356.6041
```

Covers validation, UTC date boundaries, FEFO ordering, batch status/serializer
drift, partial-payment validation, API contracts, and the real-replica-set
transaction integration tests (purchase, FEFO sale, refund, duplicate-refund
rejection, adjustment, rollback).

## 2. Database verification

```powershell
$env:VERIFY_SEED_COUNTS="true"
npm run verify-db
```

```text
OK: auditLogs: 6 secondary index(es) present
OK: batch medicine/expiry/quantity compound index exists
OK: batch batchNo unique index exists
OK: sale saleNo unique index exists

Database verification: PASS
```

Live collection counts:

```text
User 7, Medicine 34, Supplier 6, Batch 72, Purchase 72,
Sale 101 (Refunded 4), InventoryAdjustment 17,
Notification 67, AuditLog 137, Medicine categories 10
```

## 3. Seed verification

```powershell
$env:SEED_CONFIRM="RESET"
$env:SEED_PASSWORD="<local test password>"
$env:MONGODB_URI="mongodb://127.0.0.1:27018/pharmastock_e2e?replicaSet=rs0"
npm run seed -- --force
```

```text
  notifications       47
  auditLogs           101
Batch quantities are derived from the purchase/sale/refund/adjustment ledger.
```

A fresh seed produces 7 users, 34 medicines, 6 suppliers, 72 purchases, 72
batches, 101 sales (4 refunded), 17 adjustments, 47 notifications, 101 audit
logs. Demo activity after seeding grows the notification and audit counts, which
is expected.

## 4. Frontend production build

```powershell
npm run build
```

```text
✓ built in 705ms
```

## 5. Browser E2E

```powershell
$env:E2E_MONGODB_URI="mongodb://127.0.0.1:27018/pharmastock_e2e?replicaSet=rs0"
$env:E2E_PASSWORD="<local test password>"
npm run test:e2e
```

```text
PASS Report date filter
PASS Notification acknowledgement records the reviewer
PASS RBAC
PASS Logout
TOTAL TESTS 24
PASSED 23
FAILED 0
Browser E2E VERIFIED: YES
```

The final assertion verifies zero browser console errors.

## 6. Dependency audits

```powershell
npm audit --audit-level=high   # Project/backend
npm audit --audit-level=high   # Project/frontend
```

```text
found 0 vulnerabilities
found 0 vulnerabilities
```

## 7. Static checks

| Check | Command | Result |
|---|---|---|
| Backend syntax | `node --check` over `src/` and `test/` | 34 files, **0 failures** |
| Whitespace | `git diff --check` | no errors (LF→CRLF notices only) |
| Secrets | regex scan of tracked files for Atlas URIs, literal passwords, literal JWT secrets | **no matches** |
| `.env` tracked | `git ls-files` | **not tracked** (gitignored) |
| Coursework | `git status --porcelain -- Practicals` | **empty (untouched)** |

## 8. CI configuration

```powershell
python -c "import yaml; print(list(yaml.safe_load(open('.github/workflows/ci.yml'))['jobs']))"
```

```text
jobs: ['backend', 'frontend', 'e2e']
```

```powershell
npx --no-install playwright-core --version
```

```text
Version 1.63.0
```

**CI run 1 (initial release commit): `backend` PASS, `frontend` PASS, `e2e` FAIL.**
The E2E job failed before any browser test with
`E2E_MONGODB_URI must point at a disposable database (name containing e2e or test)`.
The workflow had passed the seeded URI `pharmastock_ci` to the E2E job; the guard in
`Project/frontend/test/e2e.mjs` correctly rejected it, and the guard was not weakened.
Root cause is workflow configuration only, now corrected so the `e2e` job seeds
`pharmastock_e2e`. The corrected run is verified in the corrective commit recorded in git history.

## 9. Accessibility review (static)

Method: scripted enumeration of every `<input>`, `<select>`, and `<textarea>` in
`src/`, comparing control count against `htmlFor` and `aria-label` coverage,
followed by manual review of modal semantics and focus order.

Before → after, controls with explicit association:

| File | Before | After |
|---|---|---|
| `MedicineForm.jsx` | 0 / 7 | 7 / 7 |
| `SupplierForm.jsx` | 0 / 5 | 5 / 5 |
| `Profile.jsx` | 0 / 6 | 6 / 6 |
| `Users.jsx` | 0 / 6 | 6 / 6 |
| `Reports.jsx` | 2 / 3 | 3 / 3 (`sr-only` labels) |
| `Settings.jsx` | 4 / 5 | 5 / 5 |
| List-page search inputs | `aria-label` only | unchanged (acceptable) |

Known remaining gap: no automated axe/Lighthouse scan and no screen-reader
verification, so this is a static best-effort pass, not a WCAG conformance claim.

## 10. Defects found and fixed during the final pass

| # | Defect | Evidence | Fix |
|---|---|---|---|
| 1 | `Report date filter` check intermittently asserted against an unfiltered response | E2E failed with "the date filter let an out-of-range row through" while a direct API call returned correctly filtered rows | Predicate now requires `from=` and `to=` in the request URL |
| 2 | `/adjustments` and `/audit-log` headers rendered no action buttons | `PageHeader` expects `actions=`, both pages passed `action=` | Corrected prop name; both screens build and are reachable |
| 3 | Batch creation submitted quantity/cost that the backend forbids | Form fields contradicted `BATCH_STOCK_IMMUTABLE` | Form now sends descriptive fields only and explains the purchase-based stock rule |
| 4 | `Adjustments`/`AuditLog` referenced a missing `actions` prop | Build-level component contract | Same as #2 |
| 5 | Supplier edit form markup was corrupted by a scripted replace | Literal `<INPUT id="{...` text visible in source | Rewrote the four field lines by hand and re-verified the build |

## 11. Release gate summary

| Gate | Result |
|---|---|
| Backend tests (incl. transaction, FEFO, refund, RBAC) | PASS |
| Frontend build | PASS |
| Browser E2E | PASS |
| Backend syntax validation | PASS |
| Database verification | PASS |
| Seed verification | PASS |
| Dependency audits (backend + frontend) | PASS |
| Secret scan | PASS |
| Whitespace check | PASS |
| Link scan | PASS |
| Documentation consistency | PASS |
| Coursework protection | PASS |
| Accessibility | PARTIAL (static pass, no scanner) |
| CI on GitHub Actions | run 1: backend PASS, frontend PASS, e2e FAIL (disposable-database guard tripped by workflow config); fixed in the corrective commit |
