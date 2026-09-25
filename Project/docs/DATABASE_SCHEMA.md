# Database Schema

Database: `pharma_stock_management`

All documents use MongoDB `ObjectId` identifiers and Mongoose timestamps where noted. References are stored as `ObjectId`; API serializers populate display names.

## `users`

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | String | Yes | Trimmed |
| `email` | String | Yes | Unique, lowercase, validated |
| `password` | String | Yes | bcrypt hash, excluded by default |
| `role` | String | Yes | `Admin`, `Inventory Manager`, `Pharmacist`, `Sales Staff`, `Viewer` |
| `phone` | String | No | Trimmed |
| `status` | String | Yes | `Active` or `Inactive` |
| `joined` | Date | Yes | Defaults to current time |
| `createdAt`, `updatedAt` | Date | Auto | Mongoose timestamps |

## `medicines`

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | String | Yes | Trimmed |
| `generic` | String | Yes | Trimmed |
| `category` | String | Yes | Application category enum |
| `manufacturer` | String | Yes | Trimmed |
| `dosage` | String | No | Trimmed |
| `unitPrice` | Number | Yes | `>= 0` |
| `reorderLevel` | Number | Yes | Non-negative integer |
| `createdAt`, `updatedAt` | Date | Auto | Mongoose timestamps |

`stock` is not stored; it is aggregated from batches.

## `suppliers`

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | String | Yes | Unique, trimmed |
| `contact` | String | Yes | Contact person |
| `email` | String | No | Validated email |
| `phone` | String | No | Trimmed |
| `status` | String | Yes | `Active`, `On Hold`, `Inactive` |
| `createdAt`, `updatedAt` | Date | Auto | Mongoose timestamps |

`medicinesSupplied`, `outstanding`, and `reliability` are derived metrics.

## `batches`

| Field | Type | Required | Reference/notes |
|---|---|---|---|
| `batchNo` | String | Yes | Unique, uppercase |
| `medicine` | ObjectId | Yes | `Medicine` |
| `supplier` | ObjectId | Yes | `Supplier` |
| `manufactureDate` | Date | Yes | — |
| `expiryDate` | Date | Yes | Must be after manufacture date |
| `quantity` | Number | Yes | Non-negative integer |
| `costPerUnit` | Number | Yes | `>= 0` |
| `createdAt`, `updatedAt` | Date | Auto | Mongoose timestamps |

`status` is a derived virtual: `Expired`, `Depleted`, `Near Expiry`, or `Active`.

## `purchases`

| Field | Type | Required | Reference/notes |
|---|---|---|---|
| `purchaseNo` | String | Yes | Unique |
| `supplier` | ObjectId | Yes | `Supplier` |
| `medicine` | ObjectId | Yes | `Medicine` |
| `batch` | ObjectId | Yes | `Batch` |
| `quantity` | Number | Yes | Positive integer |
| `unitCost` | Number | Yes | `>= 0` |
| `total` | Number | Yes | Server-calculated |
| `paidAmount` | Number | No | Defaults to zero; cannot exceed total |
| `date` | Date | Yes | Defaults to now |
| `status` | String | Yes | `Pending`, `Partially Paid`, `Paid` |
| `notes` | String | No | Trimmed |
| `createdBy` | ObjectId | Yes | `User` |
| `createdAt`, `updatedAt` | Date | Auto | Mongoose timestamps |

## `sales`

| Field | Type | Required | Reference/notes |
|---|---|---|---|
| `saleNo` | String | Yes | Unique |
| `medicine` | ObjectId | Yes | `Medicine` |
| `batch` | ObjectId | Yes | First allocated batch for compatibility |
| `allocations` | Array | Yes | FEFO batch, quantity, and unit-cost snapshot |
| `quantity` | Number | Yes | Positive integer |
| `unitPrice` | Number | Yes | `>= 0` |
| `total` | Number | Yes | Server-calculated |
| `customer` | String | No | Defaults to `Walk-in` |
| `date` | Date | Yes | Defaults to now |
| `status` | String | Yes | `Completed` or `Refunded` |
| `refundedAt` | Date | No | Set on refund |
| `notes` | String | No | Trimmed |
| `createdBy` | ObjectId | Yes | `User` |
| `createdAt`, `updatedAt` | Date | Auto | Mongoose timestamps |

## Operational collections

- `notifications`: type, title, message, entity reference, read flag, timestamps.
- `auditlogs`: action, entity type/id, actor id/email, metadata, IP address, timestamp.
- `inventoryadjustments`: medicine, batch, signed quantity delta, reason, note, actor, timestamp.

## Seed counts

The development seed creates 6 users, 12 medicines, 5 suppliers, 12 batches, 18 purchases, and 20 sales. It also creates operational collections when needed. The seed is destructive and requires explicit confirmation plus `SEED_PASSWORD`.
