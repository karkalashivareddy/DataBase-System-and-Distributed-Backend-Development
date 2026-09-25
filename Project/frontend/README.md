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

Application pages use `src/services/api.js`, which sends authenticated HTTP requests to the Express API. The UI does not import `src/data/` fixtures in production code. The remaining files under `src/data/` are retained only for historical/demo reference and must not be connected to application screens.

Authentication is managed by `src/contexts/AuthContext.jsx`. It stores the JWT, validates it with `/api/auth/me` on startup, and clears invalid sessions. All business data is refreshed from the API after mutations.

## Main routes

`/login`, `/dashboard`, `/medicines`, `/medicines/:id`, `/batches`, `/low-stock`, `/expiry`, `/suppliers`, `/purchases`, `/sales`, `/analytics`, `/reports`, `/users`, `/profile`, and `/settings`.

## Verification

The production build is the compile/integration check:

```bash
npm run build
```

The browser E2E test uses `playwright-core` with the installed Chrome binary and requires a running backend plus replica-set MongoDB:

```bash
E2E_MONGODB_URI='mongodb://127.0.0.1:27018/pharma_stock_e2e?replicaSet=rs0' E2E_PASSWORD='your-local-test-password' npm run test:e2e
```

For backend setup, tests, and replica-set transaction requirements, see `Project/docs/TESTING.md` and `Project/docs/DEPLOYMENT.md`.
