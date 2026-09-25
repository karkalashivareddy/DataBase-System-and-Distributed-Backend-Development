# PharmaStock Backend

Express/Mongoose API for the Medicine Stock Management & Analytics Portal.

## Stack

- Node.js 18+
- Express
- Mongoose and MongoDB
- JWT and bcryptjs
- Helmet, CORS, express-rate-limit
- Node built-in test runner

## Setup

```powershell
Copy-Item .env.example .env
npm install
```

Set a real `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, and `CLIENT_ORIGIN`. Never commit `.env`.

## Database

The seed is intentionally destructive and guarded:

```powershell
$env:SEED_CONFIRM='RESET'
$env:SEED_PASSWORD='use-a-local-test-password'
npm run seed -- --force
npm run verify-db
```

`SEED_PASSWORD` must be supplied explicitly; the seed does not contain a default password. Use a replica-set MongoDB deployment for purchase, sale, refund, and inventory-adjustment operations. A standalone server returns `503 TRANSACTIONS_REQUIRED` for those writes by design.

## Run

```bash
npm start
```

Health endpoint: `GET http://localhost:5000/api/health`.

## Scripts

| Command | Purpose |
|---|---|
| `npm start` | Start the API |
| `npm run dev` | Start with Node watch mode |
| `npm run seed` | Guarded destructive development seed |
| `npm run verify-db` | Verify counts, references, hashes, allocations, and indexes |
| `npm test` | Run unit and API contract tests |
| `npm run test:unit` | Run dependency-free unit tests |
| `npm run test:integration` | Run API tests; database-dependent cases skip without configuration |

## Structure

- `src/app.js` — middleware, health endpoint, route mounting, error handling
- `src/server.js` — process/database lifecycle
- `src/models/` — Mongoose schemas and indexes
- `src/routes/` — REST route definitions and authorization
- `src/controllers/` — HTTP handlers
- `src/services/` — dashboard, supplier, and transaction domain logic
- `src/middleware/` — JWT authentication and audit recording
- `src/seed/seed.js` — development-only seed
- `src/utils/verifyDb.js` — database verification
- `test/` — Node test files

See `Project/docs/API.md`, `Project/docs/SECURITY.md`, and `Project/docs/DEPLOYMENT.md` for the complete contract and deployment requirements.
