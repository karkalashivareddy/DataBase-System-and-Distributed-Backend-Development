# PharmaStock Deployment

## Local development

1. Start MongoDB as a replica set when testing inventory transactions.
2. Copy `Project/backend/.env.example` to `Project/backend/.env`.
3. Set `MONGODB_URI`, a random `JWT_SECRET`, `CLIENT_ORIGIN`, and a test-only `SEED_PASSWORD`.
4. Run `npm ci` in `Project/backend`.
5. Run `npm run seed -- --force` only against a disposable local database.
6. Run `npm run verify-db`.
7. Run `npm start` in `Project/backend`.
8. Run `npm install` and `npm run dev` in `Project/frontend`.
9. Open the Vite URL. The development proxy forwards `/api` to `http://localhost:5000`.

## Production frontend

```bash
cd Project/frontend
npm ci
npm run build
```

Serve `dist/` from a static host or reverse proxy. Configure `VITE_API_URL` at build time when the API is not same-origin. Do not expose API secrets through Vite environment variables.

## Production API

- Deploy `Project/backend` on Node.js 20.19 or newer.
- Supply environment variables through the host secret manager.
- Use MongoDB Atlas or another replica-set deployment.
- Configure TLS, CORS, request limits, and process monitoring.
- Run `npm ci --omit=dev` if dependencies are installed in a production image.
- Use a process supervisor or container platform with graceful shutdown.
- Do not run the seed as a startup step.

## Reverse proxy requirements

Forward `/api` to the Express service, preserve the `Authorization` header, and use HTTPS. Restrict direct public access to MongoDB. The API trusts one proxy hop through `app.set("trust proxy", 1)`; adjust this only when the deployment topology matches the proxy configuration.

## Release verification

Run frontend production build, backend tests, database verification against a disposable database, and an authenticated API smoke test. Confirm that transaction writes are enabled before accepting stock mutations in production.
