# PharmaStock API

Base path: `/api`

All protected requests require:

```http
Authorization: Bearer <jwt>
Content-Type: application/json
```

Successful responses use:

```json
{"success":true,"data":{},"meta":{}}
```

`meta` is optional. Errors use:

```json
{"success":false,"error":{"code":"VALIDATION_ERROR","message":"...","details":[]}}
```

## Authentication

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/auth/login` | Public, rate-limited | Authenticate and return `{ token, user }` |
| GET | `/auth/me` | Authenticated | Return current user |
| PATCH | `/auth/me` | Authenticated | Update name and phone |
| POST | `/auth/change-password` | Authenticated | Change password |

Login input:

```json
{"email":"user@example.in","password":"a-strong-password"}
```

## Catalogue

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/medicines` | Read roles | List medicines with derived stock |
| POST | `/medicines` | Inventory roles | Create medicine |
| GET | `/medicines/:id` | Read roles | Get medicine |
| PATCH | `/medicines/:id` | Inventory roles | Update medicine fields |
| DELETE | `/medicines/:id` | Inventory roles | Delete only when no batches exist |
| GET | `/batches` | Read roles | List/filter batches |
| POST | `/batches` | Inventory roles | Create batch |
| GET | `/batches/:id` | Read roles | Get batch |
| PATCH | `/batches/:id` | Inventory roles | Update batch fields |
| DELETE | `/batches/:id` | Inventory roles | Delete only depleted batches |
| GET | `/suppliers` | Read roles | List suppliers with metrics |
| POST | `/suppliers` | Inventory roles | Create supplier |
| GET | `/suppliers/:id` | Read roles | Get supplier |
| PATCH | `/suppliers/:id` | Inventory roles | Update supplier |
| DELETE | `/suppliers/:id` | Inventory roles | Delete only when no batches exist |
| GET | `/search?q=...` | Read roles | Search catalogue and transactions |

Medicine write payload:

```json
{"name":"Paracetamol 500mg","generic":"Acetaminophen","category":"Analgesics","manufacturer":"Sun Pharma","dosage":"500 mg tab","unitPrice":2.4,"reorderLevel":200}
```

Batch write payload:

```json
{"medicineId":"ObjectId","supplierId":"ObjectId","batchNo":"PCM-2401","manufactureDate":"2026-01-01","expiryDate":"2027-01-01","quantity":100,"costPerUnit":1.9}
```

## Transactions

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/purchases` | Read roles | List purchases |
| POST | `/purchases` | Inventory roles | Add stock to an existing batch atomically |
| GET | `/purchases/:id` | Read roles | Get purchase |
| GET | `/sales` | Read roles | List sales |
| POST | `/sales` | Transaction roles | Sell stock using FEFO atomically |
| GET | `/sales/:id` | Read roles | Get sale |
| POST | `/sales/:id/refund` | Inventory roles | Restore allocated batches atomically |
| GET | `/adjustments` | Inventory roles | List inventory adjustments |
| POST | `/adjustments` | Inventory roles | Apply a signed quantity adjustment atomically |

Purchase payload:

```json
{"medicineId":"ObjectId","supplierId":"ObjectId","batchId":"ObjectId","quantity":50,"unitCost":1.8,"status":"Paid"}
```

Sale payload:

```json
{"medicineId":"ObjectId","quantity":2,"unitPrice":2.4,"customer":"City Meds"}
```

The server calculates totals. It rejects insufficient available stock and expired/depleted batches. A sale spanning multiple batches records every allocation.

## Insights and administration

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/dashboard` | Authenticated | KPIs, stock health, alerts, expiry timeline |
| GET | `/analytics?from=&to=` | Authenticated | Revenue, margin, turnover, category, supplier, expiry analytics |
| GET | `/reports?type=...` | Authenticated | Inventory, sales, purchase, expiry, low-stock, supplier report |
| GET | `/notifications` | Authenticated | List notifications |
| PATCH | `/notifications/:id/read` | Authenticated | Mark a notification read |
| GET | `/users` | Admin | List users |
| POST | `/users` | Admin | Create user |
| PATCH | `/users/:id` | Admin | Update name, email, phone, role, or status |
| GET | `/audit-logs` | Admin | Read audit trail |

Report `type` values are `inventory`, `sales`, `purchase`, `expiry`, `low-stock`, and `supplier`.
