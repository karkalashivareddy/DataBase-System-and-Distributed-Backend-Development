# Database Systems & Backend Development

This repository contains the **PharmaStock** Medicine Stock Management & Analytics Portal and the preserved database-systems coursework.

## PharmaStock

PharmaStock is a React/Vite frontend backed by an Express/Mongoose/MongoDB API. It manages medicines, suppliers, batches, purchases, sales, expiry alerts, stock adjustments, users, notifications, audit logs, analytics, and reports.

### Architecture

```text
React + Vite -> JWT-authenticated Express API -> Mongoose -> MongoDB
```

- `Project/frontend/` contains the production UI and HTTP service client.
- `Project/backend/` contains models, routes, controllers, services, seed data, and tests.
- `Project/docs/` contains architecture, API, security, testing, deployment, and database design notes.
- `Project/Week-9-Student-Management/` is a separate coursework implementation and is not the PharmaStock backend.

### Implemented

- JWT login, current-user validation, bcrypt password hashing, and role-based authorization.
- Medicine, supplier, batch, purchase, sale, refund, and inventory-adjustment APIs.
- FEFO batch allocation and MongoDB transaction boundaries for stock writes.
- Dashboard, analytics, reports, search, notifications, and admin audit endpoints.
- API-backed React screens; production code does not import `src/data/` fixtures.
- Guarded development seed and database reference/index verification.
- Node test suite and GitHub Actions build/test workflow.

### Important transaction requirement

MongoDB stock writes require a replica set. A standalone local MongoDB can serve catalogue reads but intentionally returns `503 TRANSACTIONS_REQUIRED` for purchases, sales, refunds, and adjustments. See `Project/docs/DEPLOYMENT.md` and `Project/docs/TESTING.md`.

## Run locally

```powershell
cd Project/backend
Copy-Item .env.example .env
npm install
npm run verify-db
npm start
```

In a second terminal:

```powershell
cd Project/frontend
npm install
npm run dev
```

The frontend development proxy sends `/api` requests to `http://localhost:5000`.

## Verification

```powershell
cd Project/backend
npm test

cd ..\frontend
npm run build
```

For a disposable seeded database:

```powershell
$env:SEED_CONFIRM='RESET'
$env:SEED_PASSWORD='use-a-local-test-password'
npm run seed -- --force
$env:VERIFY_SEED_COUNTS='true'
npm run verify-db
```

Never commit `.env`, JWT secrets, database credentials, or seed passwords. Historical practical documents are preserved as coursework artifacts; credentials found in them must be treated as exposed and rotated.

## Coursework

- `Practicals/` contains the submitted Week 1–9 practical documents.
- `Project/Week-9-Student-Management/` contains the separate Student Records practical.
- `Project/docs/Medicine_Stock_Management_Review2_FINAL_MASTER.pptx` is the preserved review presentation.

## Author

**Karkala Shiva Reddy** — [GitHub](https://github.com/karkalashivareddy)
