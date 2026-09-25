# PharmaStock Testing

## Backend

From `Project/backend`:

```bash
npm ci
npm run test:unit
npm test
```

`test/unit.test.js` covers validation normalization, bounds, middleware behavior, reference serialization, and derived batch status. `test/api.test.js` checks the health contract, authentication protection, invalid-login behavior, authenticated read endpoints, reports, and search. The API test skips database-dependent cases when `MONGODB_URI` or a test credential is unavailable.

With a seeded development database:

```bash
$env:SEED_PASSWORD='your-local-test-password'
$env:VERIFY_SEED_COUNTS='true'
npm run verify-db
npm test
```

The verification command checks collection counts, required fields, bcrypt hashes, references, sale allocations, and the batch medicine/expiry index.

## Frontend

From `Project/frontend`:

```bash
npm ci
npm run build
```

The production build is the frontend compile/integration check. Browser interaction testing should be run against a real API and a replica-set MongoDB before release.

## Transaction verification

A standalone MongoDB server is sufficient for read and CRUD checks but not for stock mutations. To verify FEFO, refunds, and adjustments end-to-end:

1. Run MongoDB as a single-node replica set.
2. Use a disposable database.
3. Seed it with `SEED_CONFIRM=RESET` and a test-only `SEED_PASSWORD`.
4. Create a sale spanning batches with different expiry dates.
5. Assert the earliest unexpired batch is decremented first.
6. Refund the sale and assert every allocation is restored exactly once.
7. Attempt an over-sale and assert rollback/409 behavior.

The API deliberately returns `503 TRANSACTIONS_REQUIRED` on a standalone server instead of silently losing atomicity.

## Current local verification

- `npm run build` in `Project/frontend`: passed.
- `npm test` in `Project/backend`: 15 passed with `RUN_TRANSACTION_TESTS=true` against a replica set.
- `npm run verify-db`: passed with exact seeded counts.
- Authenticated read smoke flow: passed.
- Sale mutation smoke flow: correctly blocked with `503 TRANSACTIONS_REQUIRED` on the standalone MongoDB instance.
- `npm run test:e2e` in `Project/frontend`: passed against the real replica-set stack; 15 checks, 0 failed.
