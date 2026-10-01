# PharmaStock Frontend

React/Vite frontend for the Medicine Stock Management & Analytics Portal.

## Stack

- React 18
- Vite
- React Router
- Recharts
- Lucide React
- Custom CSS design system

## Run

```bash
npm install
npm run dev
```

The development server proxies `/api` to `http://localhost:5000`. Set `VITE_API_URL` when the API is hosted at another origin.

## Production build

```bash
npm run build
npm run preview
```

## Data flow

Application pages use `src/services/api.js`, which sends authenticated HTTP requests to the Express API. No production screen imports a fixture: the historical `src/data/` modules and the unreferenced `src/pages/Home.jsx` landing page were removed, so every visible number comes from the API.

Authentication is managed by `src/contexts/AuthContext.jsx`. It stores the JWT, validates it with `/api/auth/me` on startup, and clears invalid sessions. All business data is refreshed from the API after mutations.

## Main routes

`/login`, `/dashboard`, `/medicines`, `/medicines/:id`, `/batches`, `/low-stock`, `/expiry`, `/suppliers`, `/purchases`, `/sales`, `/adjustments`, `/audit-log`, `/analytics`, `/reports`, `/users`, `/profile`, and `/settings`.

`/adjustments` and `/audit-log` are inventory-role and admin screens respectively; the API enforces the same boundary, so the UI restriction is only a convenience.

## Verification

The production build is the compile/integration check:

```bash
npm run build
```

The browser E2E suite uses `playwright-core`. It starts the API and the Vite dev
server itself, seeds nothing, and refuses to run against a database whose name
is not disposable:

```bash
E2E_MONGODB_URI='mongodb://127.0.0.1:27018/pharmastock_e2e?replicaSet=rs0' E2E_PASSWORD='your-local-test-password' npm run test:e2e
```

Optional variables: `E2E_API_PORT`, `E2E_WEB_PORT`, `E2E_JWT_SECRET`, and
`E2E_CHROME_PATH` (a browser executable path; otherwise a local Chrome install
or Playwright's own cache is used).

On failure the suite writes `test-results/e2e-failure.log` and
`test-results/e2e-failure.png`, which CI uploads as an artifact.

For backend setup, tests, and replica-set transaction requirements, see `Project/docs/TESTING.md` and `Project/docs/DEPLOYMENT.md`.
