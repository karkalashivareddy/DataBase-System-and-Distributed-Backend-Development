# Database Setup

## Local setup

1. Install MongoDB and start it on `localhost:27017`.
2. Copy `Project/backend/.env.example` to `Project/backend/.env`.
3. Set `MONGODB_URI=mongodb://localhost:27017/pharma_stock_management`.
4. Set a random `JWT_SECRET` of at least 32 characters and `CLIENT_ORIGIN=http://localhost:5173`.
5. Install backend dependencies:

```powershell
cd Project/backend
npm install
```

## Seed safely

The seed clears the PharmaStock collections before inserting demo data. Use it only with a disposable development database.

```powershell
$env:SEED_CONFIRM='RESET'
$env:SEED_PASSWORD='use-a-local-test-password'
npm run seed -- --force
```

The script has no default password. Expected counts are 6 users, 12 medicines, 5 suppliers, 12 batches, 18 purchases, and 20 sales. Sale records include FEFO allocation snapshots and purchases include paid amounts consistent with their status.

## Verify

```powershell
$env:VERIFY_SEED_COUNTS='true'
npm run verify-db
```

Verification checks counts, required fields, bcrypt hashes, references, sale allocations, and the batch medicine/expiry compound index.

## Transactions

A standalone MongoDB server is enough to inspect seeded data but cannot run stock transactions. For purchase, sale, refund, and adjustment testing, use a single-node replica set or MongoDB Atlas. The API returns `503 TRANSACTIONS_REQUIRED` on a standalone server rather than falling back to unsafe partial writes.

## MongoDB Compass

Connect Compass to `mongodb://localhost:27017`, open `pharma_stock_management`, and inspect the collections. Open a batch to demonstrate `medicine` and `supplier` `ObjectId` references. Open a sale to demonstrate its `allocations` array.

## Atlas

Create an Atlas cluster, database user, network allowlist, and connection string. Put the encrypted connection string in `.env`; never commit it. Use a replica-set-capable cluster and run the same verification commands against a disposable database.
