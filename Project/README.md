# Medicine Stock Management & Analytics Portal for Pharmaceuticals

## Project Review – 2

**KL UNIVERSITY**

**Project Guide:** Dr. R. Sateesh Kumar

### Team Members

| Name | Roll No. |
|---|---|
| KARKALA SHIVA REDDY | 2520030105 |
| PARIPALLI NAVADEEP | 2520030196 |

## Project Overview

The **Medicine Stock Management & Analytics Portal for Pharmaceuticals** is a centralized inventory management system designed to improve the organization and monitoring of pharmaceutical stock information.

The system maintains structured data related to medicines, suppliers, batches, purchases, sales, and inventory levels to provide better visibility and consistency across inventory operations.

The portal targets **batch-wise stock tracking**, **low-stock identification**, **near-expiry monitoring**, **role-based access**, and a **visual analytics dashboard** to support faster inventory decisions.

## Current Implementation Status

> **Milestone 1 (complete):** React/Vite frontend prototype with a full routed dashboard and a bundled demo-data layer. All screen interactions work against local fixtures; the service layer simulates latency so the UI can be evaluated without a backend.

> **Milestone 2 (planned):** Express + Mongoose + MongoDB backend, REST APIs, JWT authentication, and frontend-backend integration. Not yet implemented.

The target architecture for the completed system is described below; the code that exists today is limited to the frontend prototype.

## Key Capabilities (frontend prototype)

- Medicine management
- Supplier management
- Batch-wise stock tracking
- Purchase and sales transaction recording
- Low-stock identification
- Near-expiry monitoring
- Role-based access (design-time demo only)
- Analytics dashboard using Recharts

## Target System Architecture

**Frontend:** React.js, HTML5, CSS3, JavaScript (ES6+)

**Backend (planned):** Node.js, Express.js

**API Layer (planned):** RESTful APIs

**Data Access (planned):** Mongoose

**Database (planned):** MongoDB

**Security (planned):** JWT authentication and bcrypt password hashing

### Target Data Flow

User Action → React Interface → RESTful API → Node.js / Express.js → Validation & Authorization → Mongoose → MongoDB → Response → React UI

## Technology Stack

### Frontend (implemented)

- React.js
- HTML5
- CSS3
- JavaScript (ES6+)
- Recharts

### Backend (planned)

- Node.js
- Express.js

### Database & ODM (planned)

- MongoDB
- Mongoose

### API & Security (planned)

- RESTful APIs
- JWT
- bcrypt

### Development & Testing Tools

- Postman
- MongoDB Compass
- Visual Studio Code
- npm
- Git
- GitHub

## Project Documentation

- [Abstract](docs/ABSTRACT.md)
- [Project Review-2 Presentation](docs/Medicine_Stock_Management_Review2_FINAL_MASTER.pptx)

## Academic Context

**Domain:** Database Systems Engineering & Distributed Backend Development

**Review:** Project Review – 2

**University:** KL UNIVERSITY

**Guide:** Dr. R. Sateesh Kumar