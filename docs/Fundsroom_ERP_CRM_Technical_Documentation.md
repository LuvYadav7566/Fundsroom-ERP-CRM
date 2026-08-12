# TECHNICAL PROJECT DOCUMENTATION
## Mini ERP + CRM Operations Portal
**Client / Case Study Target:** Fundsroom Infotech Pvt. Ltd.  
**Submission Type:** Technical Case-Study Submission — Full Stack Developer Position  
**Author:** Candidate Developer  
**Status:** Production Ready & Deployed  

---

## 🌐 1. EXECUTIVE SUMMARY & LIVE DEPLOYMENT LINKS

### Executive Overview
This technical submission is a full-stack enterprise **Mini ERP + CRM Operations Portal** engineered for **Fundsroom Infotech Pvt. Ltd.** to automate and streamline B2B wholesale distribution, inventory management, customer relationship tracking, and sales challan document generation.

The application addresses critical operational challenges in enterprise distribution:
1. **Stock Overselling Prevention**: Built with database-level transactional guards (`prisma.$transaction`) to prevent stock from becoming negative or corrupted.
2. **Pricing Snapshot Preservation**: Line-item pricing is frozen upon order creation so historical financial records remain immutable when base catalog prices change.
3. **Role-Based Workflows**: Multi-role system tailored for `ADMIN`, `SALES`, `WAREHOUSE`, and `ACCOUNTS` departments.

---

### Production Deployment URLs

| Service | Environment / Platform | Live URL / Connection |
| --- | --- | --- |
| **Frontend UI** | Vercel Cloud | [https://fundsroom-erp-crm-sooty.vercel.app](https://fundsroom-erp-crm-sooty.vercel.app) |
| **Backend REST API** | Render Web Service | [https://fundsroom-erp-backend-h0eb.onrender.com/api/v1](https://fundsroom-erp-backend-h0eb.onrender.com/api/v1) |
| **API Health Status** | Render Service Status | [https://fundsroom-erp-backend-h0eb.onrender.com/api/v1/health](https://fundsroom-erp-backend-h0eb.onrender.com/api/v1/health) |
| **Database** | Cloud PostgreSQL (Neon.tech) | `postgresql://neondb_owner:...@ep-blue-violet...neon.tech/neondb` |

---

### Demo User Accounts

| Role | Email Address | Password | Module Access Scope |
| --- | --- | --- | --- |
| **👑 ADMIN** | `admin@fundsroom.demo` | `Fundsroom@123` | Unrestricted full system access across all modules, metrics, and logs |
| **💼 SALES** | `sales@fundsroom.demo` | `Fundsroom@123` | Customer CRM management, Follow-ups, Create & Confirm Sales Challans |
| **📦 WAREHOUSE** | `warehouse@fundsroom.demo` | `Fundsroom@123` | Product catalog management, Low-stock alerts, Inward Stock Entry (`IN`) |
| **📊 ACCOUNTS** | `accounts@fundsroom.demo` | `Fundsroom@123` | Dashboard analytics, Confirmed revenue totals, Sales Challan audit trail |

---

## 🏗️ 2. SYSTEM ARCHITECTURE & TECH STACK

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            REACT 18 FRONTEND (Vite)                         │
│   AuthContext | ToastContext | AppShell | Recharts | Custom CSS Modules      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS / REST (Axios + Bearer JWT)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                           EXPRESS NODE.JS BACKEND                           │
│  - Routes & Middleware: authMiddleware (JWT), roleMiddleware (RBAC)         │
│  - Zod Request Validation & Centralized Error Handler                        │
│  - Controllers & Services: ChallanService, StockService, CustomerService    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Prisma ORM ($transaction)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                   CLOUD POSTGRESQL DATABASE (Neon.tech)                     │
│   users | customers | products | stock_movements | challans | challan_items │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack Table

| Layer | Technology Selected | Justification & Purpose |
| --- | --- | --- |
| **Frontend Core** | React 18, TypeScript, Vite | Fast build times, strong static type safety, component modularity |
| **State & Routing** | React Router v6, React Context | Protected client-side routing, global Auth & Toast state |
| **Visualization** | Recharts, Lucide Icons | Responsive interactive stock bar charts and status pie charts |
| **Styling** | Custom CSS Modules & Variables | Clean corporate branding (#0B1F3A Navy, #1565C0 Blue, #00A8E8 Cyan) |
| **Backend Runtime** | Node.js, Express.js, TypeScript | Non-blocking I/O event loop, scalable controller-service architecture |
| **Database ORM** | Prisma ORM 5.x | Type-safe SQL queries, automated schema migrations, `$transaction` support |
| **Database** | PostgreSQL (Cloud Neon) | Relational ACID compliance, native ENUM types, multi-table index support |
| **Security** | JWT, BcryptJS, Zod | Stateless token authentication, 10-round salt password encryption, input validation |

---

## 🗄️ 3. DATABASE SCHEMA & ENTITY RELATIONSHIPS

The database consists of 6 core relational models designed with foreign keys, indexes, and cascade deletion rules:

```mermaid
erDiagram
    USER ||--o{ STOCK_MOVEMENT : creates
    USER ||--o{ CHALLAN : creates
    CUSTOMER ||--o{ CHALLAN : receives
    PRODUCT ||--o{ STOCK_MOVEMENT : tracks
    PRODUCT ||--o{ CHALLAN_ITEM : snapshot
    CHALLAN ||--|{ CHALLAN_ITEM : contains

    USER {
        string id PK
        string email UK
        string name
        enum role
    }

    CUSTOMER {
        string id PK
        string customerName
        string businessName
        enum customerType
        enum status
        datetime followUpDate
    }

    PRODUCT {
        string id PK
        string sku UK
        string productName
        float unitPrice
        int currentStock
        int minimumStock
    }

    STOCK_MOVEMENT {
        string id PK
        string productId FK
        int quantity
        enum movementType
        string createdBy FK
    }

    CHALLAN {
        string id PK
        string challanNumber UK
        string customerId FK
        enum status
        int totalQuantity
        string createdBy FK
    }

    CHALLAN_ITEM {
        string id PK
        string challanId FK
        string productId FK
        string productNameSnapshot
        string skuSnapshot
        float unitPriceSnapshot
        int quantity
        float totalPrice
    }
```

---

## ⚡ 4. CORE BUSINESS LOGIC & TECHNICAL HIGHLIGHTS

### 1. Atomic Transactional Stock Deduction (`prisma.$transaction`)
When a Sales Challan is confirmed (`POST /api/v1/challans/:id/confirm`), the system executes a strict multi-step database transaction:
1. Validates that the sales challan exists and is currently in `DRAFT` status.
2. Loops through all line items and queries real-time stock levels for each `productId`.
3. If `currentStock < requestedQuantity`, the transaction immediately throws an `AppError(400)` and rolls back completely — preventing negative inventory.
4. Decrements `currentStock` by `quantity` for each product.
5. Creates an immutable `StockMovement` log (`movementType: OUT`, `reason: Sales Challan Confirmation: FR-CH-XXXX`).
6. Updates `challan.status` to `CONFIRMED`.

```typescript
// Core Transaction Implementation Snippet (challanService.ts)
return await prisma.$transaction(async (tx) => {
  for (const item of challan.items) {
    const product = await tx.product.findUnique({ where: { id: item.productId } });
    if (!product || product.currentStock < item.quantity) {
      throw new AppError(`Insufficient stock for product '${item.productNameSnapshot}'. Available: ${product?.currentStock || 0}, Requested: ${item.quantity}`, 400);
    }
    
    await tx.product.update({
      where: { id: item.productId },
      data: { currentStock: { decrement: item.quantity } },
    });

    await tx.stockMovement.create({
      data: {
        productId: item.productId,
        quantity: item.quantity,
        movementType: 'OUT',
        reason: `Sales Challan Confirmation: ${challan.challanNumber}`,
        createdBy: userId,
      },
    });
  }
  return await tx.challan.update({
    where: { id: challanId },
    data: { status: 'CONFIRMED' },
  });
});
```

### 2. Historical Snapshot Pricing Protection
Prices in B2B wholesale fluctuate over time. If a base product price is updated from ₹12,000 to ₹15,000 next month, historical sales documents generated today must **not** change their recorded values. 
- In `ChallanItem`, the system captures `productNameSnapshot`, `skuSnapshot`, and `unitPriceSnapshot` at the moment of order creation.

### 3. Role-Based Security Matrix (RBAC)

| System Action | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
| --- | :---: | :---: | :---: | :---: |
| **View Dashboard & Metrics** | ✅ | ✅ | ✅ | ✅ |
| **Manage CRM Customers** | ✅ | ✅ | ❌ | ❌ |
| **Manage Product Catalog** | ✅ | ❌ | ✅ | ❌ |
| **Inward Stock Entry (`Stock IN`)** | ✅ | ❌ | ✅ | ❌ |
| **Create Draft Sales Challan** | ✅ | ✅ | ❌ | ❌ |
| **Confirm / Cancel Challan** | ✅ | ✅ | ❌ | ❌ |
| **View Printable Documents** | ✅ | ✅ | ✅ | ✅ |

---

## 📡 5. REST API SPECIFICATION SUMMARY

| HTTP Method | Endpoint Path | Auth Guard | Access Scope | Description |
| --- | --- | --- | --- | --- |
| **POST** | `/api/v1/auth/login` | Public | All | Authenticates user & issues JWT token |
| **GET** | `/api/v1/auth/me` | JWT | All | Returns authenticated user profile |
| **GET** | `/api/v1/customers` | JWT | All | Lists CRM customers with search, pagination & filters |
| **POST** | `/api/v1/customers` | JWT + Role | Admin, Sales | Creates new customer record |
| **GET** | `/api/v1/customers/:id` | JWT | All | Returns customer profile, follow-ups & orders |
| **GET** | `/api/v1/products` | JWT | All | Lists products catalog & low stock items |
| **POST** | `/api/v1/stock/in` | JWT + Role | Admin, Warehouse | Performs inward stock entry with log |
| **GET** | `/api/v1/challans` | JWT | All | Lists sales challans with status filters |
| **POST** | `/api/v1/challans` | JWT + Role | Admin, Sales | Creates new draft sales challan |
| **POST** | `/api/v1/challans/:id/confirm` | JWT + Role | Admin, Sales | Atomic transaction stock deduction & confirm |
| **POST** | `/api/v1/challans/:id/cancel` | JWT + Role | Admin, Sales | Cancels draft sales challan |
| **GET** | `/api/v1/dashboard/stats` | JWT | All | Aggregates summary cards & Recharts datasets |

---

## 🧪 6. BUILD & VERIFICATION RESULTS

### 1. TypeScript Production Builds
- **Backend Build (`backend`)**: `tsc` compiled clean with 0 warnings/errors.
- **Frontend Build (`frontend`)**: `tsc && vite build` compiled cleanly into `dist/`.

### 2. Database Migration & Seed Verification
```bash
> npx prisma db push
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "neondb" on Cloud Neon
The database is in sync with the Prisma schema.

> npm run seed
🌱 Starting Fundsroom Infotech ERP Database Seeding...
🧹 Cleaned existing database tables.
👤 Demo Users Created: Admin, Sales, Warehouse, Accounts.
📋 Seeded 12 Customers.
📦 Seeded 16 Products (including 4 low-stock items).
🔄 Initial Stock Movement IN Logs created.
🧾 Seeded Sample Draft and Confirmed Sales Challans.
✅ Fundsroom Infotech ERP Database Seeding Complete!
```

---

## 🏁 7. CONCLUSION & ROADMAP

The **Fundsroom Infotech Mini ERP + CRM Operations Portal** provides a complete, scalable, production-grade foundation for wholesale operations. The architecture strictly adheres to modern full-stack standards: separation of concerns, transactional database safety, RBAC authorization, responsive UX, and cloud deployment.

### Future Roadmap Enhancements
1. **PDF Export Integration**: Native server-side PDF stream generation (`pdfkit`) alongside current browser print CSS.
2. **Automated Email Notifications**: Sending automated follow-up reminders to sales representatives via Nodemailer / SendGrid.
3. **Multi-Warehouse Support**: Expanding stock locations from a single hub to multi-city distribution warehouses.
