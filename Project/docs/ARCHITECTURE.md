# PharmaStock Architecture

## Runtime topology

```text
Browser
  -> React/Vite frontend
  -> fetch client (JWT in Authorization header)
  -> Express API (/api)
  -> validation, authorization, audit middleware
  -> controllers and domain services
  -> Mongoose models
  -> MongoDB
```

The frontend contains no production imports from `src/data/`. The files in that directory are retained only as historical/demo fixtures and must not be used by application code.

## Backend layers

- `src/app.js` configures Helmet, CORS, JSON limits, rate limiting, health status, routes, and normalized errors.
- `src/server.js` owns process startup, database connection, and graceful shutdown.
- `src/routes/` defines URL boundaries, role checks, and request validation.
- `src/controllers/` translates HTTP requests into domain operations.
- `src/services/transactionService.js` owns atomic purchase, FEFO sale, refund, and inventory-adjustment operations.
- `src/services/dashboardService.js` calculates stock, health, trends, and analytics from source collections.
- `src/models/` defines MongoDB documents, references, indexes, and schema invariants.
- `src/middleware/auth.js` verifies JWTs against the current active user; role checks are server-side.
- `src/middleware/audit.js` records actor, action, entity, request IP, and metadata.

## Data ownership

`Batch.quantity` is the stock source of truth. Medicine stock, inventory value, low-stock alerts, expiry timelines, supplier outstanding amounts, and batch status are derived. The API never trusts a client-supplied stock field.

Purchases and sales reference `Medicine`, `Supplier`, `Batch`, and `User` documents. Sale records also store FEFO allocation snapshots so historical invoices retain the batch quantities and unit costs used at sale time.

## Transaction boundary

`recordPurchase`, `recordSale`, `refundSale`, and `adjustInventory` execute inside `session.withTransaction`. Sales:

1. Lock the medicine context in a MongoDB transaction.
2. Select positive, unexpired batches sorted by `expiryDate`, `createdAt`, and `_id`.
3. Decrement each batch with a guarded quantity predicate.
4. Write the sale and allocation snapshot.
5. Create the transaction notification.
6. Commit all changes together.

A standalone MongoDB server cannot provide this guarantee. The API intentionally returns `503 TRANSACTIONS_REQUIRED` rather than falling back to non-atomic writes.

## Frontend state

`AuthContext` stores the JWT and validates it with `GET /api/auth/me` on application startup. API responses are unwrapped from `{ success, data, meta }` by `src/services/api.js`. Pages refresh server data after mutations and show API errors through the toast context.

## Failure behavior

- Invalid input returns a 4xx validation error.
- Missing or invalid JWT returns 401.
- Insufficient role returns 403.
- Duplicate unique fields return 409.
- Unknown resources return 404.
- Transaction-capable MongoDB is unavailable for a write transaction returns 503 with `TRANSACTIONS_REQUIRED`.
- Production 5xx responses hide internal details; development logs retain the server error for diagnosis.
