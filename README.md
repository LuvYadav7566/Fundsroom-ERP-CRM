# Fundsroom Infotech Mini ERP + CRM Operations Portal

A production-quality full-stack operations management portal built for **Fundsroom Infotech Pvt. Ltd.** to streamline business workflows across Wholesale, Distribution, Customer CRM, Inventory Management, and Sales Challans.

---

## Key Features

- **Role-Based Access Control (RBAC)**: Support for `ADMIN`, `SALES`, `WAREHOUSE`, and `ACCOUNTS` roles with enforced backend API guards.
- **Customer CRM Module**: Complete customer lifecycle management, contact tracking, type classification (`RETAIL`, `WHOLESALE`, `DISTRIBUTOR`), status management, and CRM follow-up scheduling.
- **Inventory & Stock Management**: Real-time stock tracking, automated low-stock warnings, warehouse location tagging, and immutable `StockMovement` logs for all `IN` / `OUT` transactions.
- **Sales Challans Workflow**: Multi-item sales challan builder with draft saving, dynamic available stock verification, snapshot historical pricing, and database transaction confirmation with automatic stock deduction.
- **Interactive Dashboard**: Role-tailored business summary metrics, recent activity streams, and dynamic interactive Recharts visualizations.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, React Router v6, Axios, Lucide Icons, Recharts, Custom CSS Modules / Design Variables.
- **Backend**: Node.js, Express, TypeScript, JWT Authentication, Bcrypt Password Hashing, Zod Validation.
- **Database**: PostgreSQL / SQLite with Prisma ORM.

---

## Quick Start (Local Setup)

### 1. Backend Setup

```bash
cd backend
npm install
npx prisma db push
npm run seed
npm run dev
```

The backend server will run at `http://localhost:5000`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend application will run at `http://localhost:5173`.

---

## Demo Credentials

| Role | Email | Password |
| --- | --- | --- |
| **ADMIN** | admin@fundsroom.demo | Fundsroom@123 |
| **SALES** | sales@fundsroom.demo | Fundsroom@123 |
| **WAREHOUSE** | warehouse@fundsroom.demo | Fundsroom@123 |
| **ACCOUNTS** | accounts@fundsroom.demo | Fundsroom@123 |

---

## License & Copyright

Designed and developed for Fundsroom Infotech Pvt. Ltd. Operations Case Study.
