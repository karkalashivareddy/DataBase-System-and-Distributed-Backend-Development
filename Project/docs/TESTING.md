# PharmaStock Testing

Four verification layers: dependency-free unit tests, API contract tests, real
MongoDB transaction integration tests, and a browser end-to-end suite. This
document explains how to run each one and what it proves.

## Backend

From `Project/backend`:

```powershell
npm ci
npm run test:unit
npm test
```

| File | Covers |
|---|---|
| `test/unit.test.js` | Validation normalization and bounds, unknown-field rejection, UTC date boundaries, FEFO sorting, batch status, serializer totals, partial payment validation |
| `test/api.test.js` | Health contract, authentication protection, invalid login, authenticated reads, reports, search |
| `test/transactions.integration.test.js` | Purchase/sale/refund/adjustment against a real replica set, including FEFO order, allocation restore, duplicate-refund rejection, and rollback |

The API and transaction suites **skip** database-dependent cases when
`MONGODB_URI` or a test credential is unavailable, so `npm test` stays safe on a
machine without MongoDB. That skip is why `RUN_TRANSACTION_TESTS` matters.

### Running the transaction suite explicitly

```powershell
$env:RUN_TRANSACTION_TESTS='true'
$env:MONGODB_URI='mongodb://127.0.0.1:27018/pharma_stock_management?replicaSet=rs0'
$env:SEED_PASSWORD='<local test password>'
npm run test:transactions
```

Always point it at a **disposable** database name. The suite writes and rolls
back its own data.

## Database verification

```powershell
$env:VERIFY_SEED_COUNTS='true'
npm run verify-db
```

`verifyDb` checks collection counts, required fields, bcrypt hashes, referential
integrity, sale allocation arithmetic (allocated quantity equals sold quantity,
and refunded allocations are restored exactly once), purchase/sale/refund
chronology, and the required indexes — including unique `batchNo` and the
compound batch medicine/expiry/quantity index.

## Frontend

From `Project/frontend`:

```powershell
npm ci
npm run build
```

The production build is the compile/integration check. There is no React unit
test runner in this project; behavioural coverage lives in the browser suite.

## Browser end-to-end

`test/e2e.mjs` starts the API and the Vite dev server itself, so only MongoDB
needs to be running. It **refuses to start** unless the database name looks
disposable (`e2e` or `test`), which prevents accidentally running the suite
against a real dataset.

```powershell
$env:E2E_MONGODB_URI='mongodb://127.0.0.1:27018/pharmastock_e2e?replicaSet=rs0'
$env:E2E_PASSWORD='<local test password>'
npm run test:e2e
```

Optional: `E2E_API_PORT`, `E2E_WEB_PORT`, `E2E_JWT_SECRET`, `E2E_CHROME_PATH`.

The suite covers login and logout, the dashboard, catalogue CRUD, batch creation,
purchase with partial payment, FEFO sale allocation, insufficient-stock and
expired-batch rejection, refunds, duplicate-refund rejection, inventory
adjustments, audit filtering, analytics, report generation with date filtering
and CSV export, notification acknowledgement, and role-based access control
(Viewer is blocked from purchases, adjustments, acknowledgements, and the audit
log). It finishes by asserting that **no browser console errors** occurred.

On failure it writes `test-results/e2e-failure.log` and
`test-results/e2e-failure.png`, which CI uploads as an artifact.

The runner starts the API and the Vite dev server itself and tears down the
**whole process group** when finished (`taskkill /T /F` on Windows, negated
`SIGTERM` elsewhere). Killing only the `npm run dev` wrapper would orphan Vite,
which keeps the pipes open and prevents the runner from exiting — the job would
appear to pass its tests and then hang until the CI timeout.

## Transaction requirement

A standalone MongoDB server can serve catalogue reads but **cannot** run stock
mutations. The API returns `503 TRANSACTIONS_REQUIRED` in that case rather than
silently losing atomicity. FEFO, refunds, and adjustments must be verified
against a replica set.

## Dependency auditing

```powershell
npm audit --audit-level=high   # in both Project/backend and Project/frontend
```

CI runs the same command and fails on high or critical findings.

## Current verified results

Recorded on the final review pass. See
[`FINAL_REVIEW_QA.md`](FINAL_REVIEW_QA.md) for the full evidence log.

| Gate | Result |
|---|---|
| `npm test` with `RUN_TRANSACTION_TESTS=true` | 25 tests, 25 passed, 0 failed |
| `npm run verify-db` | `Database verification: PASS` |
| `npm run build` (frontend) | pass |
| `npm run test:e2e` | 23 checks passed, 0 failed, plus the console-error assertion |
| `npm audit --audit-level=high` (backend) | 0 vulnerabilities |
| `npm audit --audit-level=high` (frontend) | 0 vulnerabilities |
| CI workflow on GitHub Actions | `backend` and `frontend` jobs pass; the `e2e` job failed because the workflow seeded `pharmastock_ci` while the suite refuses any database name without `e2e`/`test`. Fixed by giving the `e2e` job its own disposable `pharmastock_e2e` URI. |
