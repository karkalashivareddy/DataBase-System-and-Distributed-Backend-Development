# Database Systems & Backend Development

This repository collects database-systems coursework and the **PharmaStock** medicine-inventory interface. It is organized into two areas:

- `Practicals/` — database-systems exercises and reports (Week 1–3).
- `Project/` — the PharmaStock frontend prototype, its design documentation, and a review presentation.

## PharmaStock — current status

PharmaStock is a pharmaceutical inventory management interface covering medicines, batches, suppliers, purchases, sales, expiry monitoring, low-stock views, analytics, reports, users, and settings.

**Current scope: a React + Vite frontend prototype backed entirely by local demo data.**

The frontend service layer simulates network latency and returns bundled fixtures so that the entire UI can be evaluated without a running server. There is **no backend, no database, and no API integration in this repository yet**. All authentication, inventory mutations, and analytics resolve against local mock data and React state; a page refresh reverts mutations.

The backend (Express + Mongoose + MongoDB) is designed and documented as the next milestone but has **not been implemented**. See [Project/docs/ABSTRACT.md](Project/docs/ABSTRACT.md) for the target architecture.

## What exists today

| Layer | Status |
| --- | --- |
| React + Vite dashboard frontend | Implemented (17 pages, 38 components) |
| Demo data layer (medicines, batches, suppliers, transactions, users) | Implemented (in-memory fixtures) |
| Design system (CSS design tokens, responsive, reduced-motion) | Implemented |
| Express/Mongoose backend | **Not implemented — planned** |
| MongoDB persistence | **Not implemented — planned** |
| JWT authentication | **Not implemented — decorative demo login only** |
| API integration | **Not implemented — service layer returns local fixtures** |

## Architecture (target, not yet implemented)

```mermaid
flowchart LR
    U[Browser] --> F[React + Vite frontend]
    F --> D[Bundled demo data and service layer]
    F -. future integration .-> A[Express API]
    A --> M[(MongoDB via Mongoose)]
```

## Technology stack

| Area | Technologies |
| --- | --- |
| Frontend | React 18, Vite, React Router, Recharts, Lucide React, CSS |
| Backend (planned) | Node.js, Express, Mongoose, MongoDB, JWT, bcrypt |
| Documentation | Markdown, database schema notes, coursework reports |

## Run the frontend demo

```bash
cd Project/frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal. Routes include `/login`, `/dashboard`, `/medicines`, `/batches`, `/low-stock`, `/expiry`, `/suppliers`, `/purchases`, `/sales`, `/analytics`, `/reports`, `/users`, `/profile`, and `/settings`.

Login uses a design-time demo account (shown on the login screen). It is a client-side comparison, **not** real authentication — the backend is not present yet.

## Project structure

```text
Practicals/             database exercises and reports
Project/
  frontend/             React/Vite dashboard and local demo data
  docs/                 abstract, review presentation, design notes
```

## Verification

```bash
cd Project/frontend
npm run build
```

There is no automated test suite or CI workflow yet. The next integration step is to build the Express/Mongoose backend, wire the frontend service layer to real API routes, add request validation and API tests, and define transaction boundaries for stock changes.

## Screenshots

| View | Screenshot |
| --- | --- |
| Login (demo credentials) | ![Login](docs/assets/screenshots/01-login.png) |
| Dashboard | ![Dashboard](docs/assets/screenshots/02-dashboard.png) |
| Medicines | ![Medicines](docs/assets/screenshots/03-medicines.png) |
| Analytics | ![Analytics](docs/assets/screenshots/04-analytics.png) |
| Batches | ![Batches](docs/assets/screenshots/05-batches.png) |
| Low Stock | ![Low Stock](docs/assets/screenshots/06-low-stock.png) |

*Screenshots captured from live frontend demo (Vite dev server, all data from local demo fixtures — no backend connected) on 2026-09-17.*

## Author

**Karkala Shiva Reddy** — [GitHub](https://github.com/karkalashivareddy)