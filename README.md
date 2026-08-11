# Fundsroom Infotech Mini ERP + CRM Operations Portal

A production-quality full-stack operations management portal built for **Fundsroom Infotech Pvt. Ltd.** to streamline B2B wholesale business workflows across Customer CRM, Inventory Management, Stock Movements, and Sales Challans.

---

## 🌐 Live Production Links

- **Live Application (Frontend)**: [https://fundsroom-erp-crm-sooty.vercel.app](https://fundsroom-erp-crm-sooty.vercel.app)
- **Live API Backend (Render)**: [https://fundsroom-erp-backend-h0eb.onrender.com/api/v1](https://fundsroom-erp-backend-h0eb.onrender.com/api/v1)
- **API Health Check**: [https://fundsroom-erp-backend-h0eb.onrender.com/api/v1/health](https://fundsroom-erp-backend-h0eb.onrender.com/api/v1/health)
- **Database**: Cloud PostgreSQL (Neon.tech)

---

## 🔑 Live Demo Credentials

| Role | Email | Password | Allowed Access & Features |
| --- | --- | --- | --- |
| **👑 ADMIN** | `admin@fundsroom.demo` | `Fundsroom@123` | Full access across all CRM, Products, Stock, Challans, and System Stats |
| **💼 SALES** | `sales@fundsroom.demo` | `Fundsroom@123` | Customer CRM management, Follow-ups, Create & Confirm Sales Challans |
| **📦 WAREHOUSE** | `warehouse@fundsroom.demo` | `Fundsroom@123` | Product catalog management, Low-stock alerts, Inward Stock Procurement (`IN`) |
| **📊 ACCOUNTS** | `accounts@fundsroom.demo` | `Fundsroom@123` | Transaction metrics, Confirmed revenue summary, Sales Challan document audit |

> *Note: On the login page, you can also click the ⚡ **Demo Quick Login Shortcuts** to log in with 1 click!*

---

## ✨ Key Features & Business Workflows

### 1. Database Transactional Integrity (Prisma `$transaction`)
- **Challan Confirmation**: Executes an atomic transaction that validates real-time stock availability, decrements inventory, creates outward stock movement audit logs (`OUT`), and sets status to `CONFIRMED`.
- **Insufficient Stock Guard**: If requested quantity exceeds available stock, the backend throws HTTP 400 and rolls back the entire transaction — preventing negative stock or corrupted records.
- **Historical Snapshot Pricing**: Product price snapshots (`productNameSnapshot`, `skuSnapshot`, `unitPriceSnapshot`) are frozen into line items so past historical challans remain accurate even if base product prices change later.

### 2. Customer CRM Module
- Comprehensive customer lifecycle management (`RETAIL`, `WHOLESALE`, `DISTRIBUTOR`).
- Real-time search by customer name, business, mobile, or email.
- CRM status tracking (`LEAD`, `ACTIVE`, `INACTIVE`), next follow-up date scheduling, and sales notes history.
- Dedicated Customer Profile Detail view (`/customers/:id`).

### 3. Inventory & Stock Audit Trail
- Real-time stock tracking with automated **LOW STOCK** warning badges (`currentStock <= minimumStock`).
- Inward stock entry modal (`Stock IN`) with mandatory transaction reasons and audit user tags.
- Complete immutable `StockMovement` history stream.

### 4. Sales Challans & Printable Documents
- Interactive multi-item invoice builder (`/challans/create`) with live stock availability badges.
- Auto-generated sequential Challan numbers (`FR-CH-2026-0001`).
- Official printable business document view with company header, customer details, line item snapshots, terms, and signature lines.

### 5. Interactive Operational Dashboard
- Real-time summary cards: Total Customers, Products, Stock Units, Low Stock Alerts, Confirmed Revenue.
- Recharts visualizations: Stock units by category bar chart and Challan status pie chart.
- Role-tailored alert notices for Admin, Sales, Warehouse, and Accounts users.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18, TypeScript, Vite
- **Routing**: React Router v6 (Protected Role Guards)
- **HTTP Client**: Axios with JWT Bearer Token interceptor
- **Icons & Charts**: Lucide React, Recharts
- **Styling**: Custom CSS Modules & CSS Design Variables

### Backend
- **Runtime**: Node.js, Express.js, TypeScript
- **Database ORM**: Prisma ORM
- **Database**: PostgreSQL (Cloud Hosted on Neon)
- **Security**: JWT Authentication, Bcrypt Password Hashing, Zod Request Validation, CORS

---

## 📁 Repository Structure

```
fundsroom-erp-crm/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema definitions
│   │   └── seed.ts                # Database seed script for demo data
│   ├── src/
│   │   ├── config/                # Environment and Prisma client singletons
│   │   ├── controllers/           # HTTP Request handlers
│   │   ├── middlewares/           # JWT Auth, RBAC Role guards, Zod validators
│   │   ├── routes/                # Express API endpoint routers
│   │   ├── services/              # Business logic & database transactions
│   │   └── server.ts              # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable UI components & layouts
│   │   ├── context/               # AuthContext & ToastContext providers
│   │   ├── pages/                 # Dashboard, Customers, Products, Inventory, Challans
│   │   ├── routes/                # React Router & ProtectedRoute guards
│   │   ├── services/              # API wrapper services
│   │   └── styles/                # CSS design system tokens
│   ├── package.json
│   └── vite.config.ts
├── postman/
│   └── Fundsroom-ERP.postman_collection.json # Complete API testing collection
├── README.md
└── .gitignore
```

---

## 💻 Local Development Setup

### 1. Clone & Setup Backend

```bash
cd backend
npm install
npx prisma db push
npm run seed
npm run dev
```

The backend API server will start at `http://localhost:5000`.

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend React application will start at `http://localhost:5173`.

---

## 🧪 Postman API Collection

The repository includes a ready-to-import Postman collection in `postman/Fundsroom-ERP.postman_collection.json`. It includes pre-configured requests for:
- Authentication (`POST /api/v1/auth/login`, `GET /api/v1/auth/me`)
- Customers (`GET`, `POST`, `PUT /api/v1/customers`)
- Products & Stock (`GET`, `POST /api/v1/products`, `POST /api/v1/stock/in`)
- Challans (`GET`, `POST`, `PATCH /confirm`, `PATCH /cancel /api/v1/challans`)
- Dashboard Analytics (`GET /api/v1/dashboard/stats`)

---

## 📄 License & Case Study Notice

Developed for **Fundsroom Infotech Pvt. Ltd.** Technical Operations Case Study Submission.
