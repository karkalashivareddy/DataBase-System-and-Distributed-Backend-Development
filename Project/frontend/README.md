# PharmaStock — Frontend

**PharmaStock** is the frontend for the **Medicine Stock Management & Analytics Portal for Pharmaceuticals**, an academic project for the **Database Systems Engineering & Distributed Backend Development** course at **KL UNIVERSITY** (Project Guide: Dr. R. Sateesh Kumar).

## Overview

This repository contains a React + Vite frontend for a pharmaceutical inventory management application. The project is developed in incremental milestones:

- **Commit 1 (current)** — Foundation & design system: React/Vite setup, routing foundation, design tokens, global styles, reusable common components, utilities, and a polished landing shell.
- **Next milestones** — Dashboard and navigation, medicine inventory & batches, suppliers & transactions, analytics & reports, alerts, authentication, and 3D polish.

## Technology

- React 18
- Vite
- JavaScript (ES6+)
- React Router
- CSS (custom design-token system)
- Recharts (analytics — introduced with the dashboard milestone)
- Lucide React (icons)

## Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Production Build

```bash
npm run build
npm run preview
```

## Foundation Scope (Commit 1)

- React/Vite application entry (`main.jsx`, `App.jsx`)
- Routing foundation (`/` landing shell, `*` NotFound fallback)
- Design-token system (`styles/variables.css`)
- Global styling and layout primitives
- Reusable common components (Button, Modal, StatusBadge, EmptyState, LoadingState)
- Utility helpers (formatters, validators) and a localStorage hook
- Project documentation

## Accessible & Responsive

The design system is responsive and respects `prefers-reduced-motion`, with visible focus states and semantic HTML.

> This milestone is frontend-only. Authentication and backend behaviour are planned for later milestones and must never rely on insecure client-side checks.
