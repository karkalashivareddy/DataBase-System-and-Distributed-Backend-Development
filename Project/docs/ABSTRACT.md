# Abstract

The **Medicine Stock Management & Analytics Portal for Pharmaceuticals** is a centralized inventory management system designed to improve the organization and monitoring of pharmaceutical stock information. The system maintains structured data related to medicines, suppliers, batches, purchases, sales, and inventory levels to provide better visibility and consistency across inventory operations.

The portal targets **batch-wise stock tracking**, enabling users to monitor quantities along with manufacture and expiry information. It also identifies **low-stock and near-expiry conditions** to support timely inventory action. A visual analytics dashboard provides insights into stock status, inventory trends, and fast-moving medicines.

The system follows a layered architecture using **React.js, HTML5, CSS3, and JavaScript (ES6+)** for the frontend and **Node.js with Express.js** for backend services. **RESTful APIs** connect the frontend and backend, while **MongoDB and Mongoose** provide centralized document-based data persistence and structured data access. **JWT** is used for token-based authentication and **bcrypt** for secure password hashing. **Recharts** is used for analytics visualization, with **Postman, MongoDB Compass, Visual Studio Code, npm, Git, and GitHub** supporting development and testing.

## Implementation Status

**Implemented (Milestone 1):** The React/Vite frontend prototype with routed dashboard screens, a bundled demo-data layer, and a design system. All screen interactions work against local fixtures; the service layer simulates latency so the UI can be evaluated without a database.

**Planned (Milestone 2):** The Express + Mongoose + MongoDB backend, REST APIs, JWT authentication with bcrypt password hashing, and integration of the frontend service layer with real API routes.

The full-stack architecture described above is the **target design** for the completed system, not a description of code that is currently present in the repository.

Overall, the proposed portal provides a structured and centralized approach to pharmaceutical inventory management, helping improve stock visibility, batch-level monitoring, expiry awareness, and data-driven inventory decisions.

## Project Details

**Project Title:** Medicine Stock Management & Analytics Portal for Pharmaceuticals

**University:** KL UNIVERSITY

**Project Guide:** Dr. R. Sateesh Kumar

### Team Members

1. **KARKALA SHIVA REDDY** — 2520030105
2. **PARIPALLI NAVADEEP** — 2520030196

**Domain:** Database Systems Engineering & Distributed Backend Development