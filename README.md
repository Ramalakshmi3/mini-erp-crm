# Mini ERP + CRM Operations Portal

A full-stack ERP and CRM web application designed for wholesale and distribution business operations.

The system helps internal teams manage customers, products, warehouses, inventory, stock movements and sales challans from a single application.

---

## 1. Project Overview

Mini ERP CRM is a role-based business management system built using React, TypeScript, Node.js, Express.js, PostgreSQL and Prisma.

The application provides:

- Customer relationship management
- Product management
- Category management
- Warehouse management
- Inventory and stock movement tracking
- Sales challan management
- JWT-based authentication
- Role-based access control
- Dashboard and business statistics

The application supports four employee roles:

- ADMIN
- SALES
- WAREHOUSE
- ACCOUNTS

---

## 2. Main Features

### Authentication

- User login
- JWT-based authentication
- Protected API routes
- Role-based authorization
- Logout
- Active/inactive user validation

### Customer CRM

- View customers
- Add customers
- Edit customers
- Search customers
- View customer details
- Customer status management
- Customer follow-ups
- Notes
- GST number support

Customer types:

- Retail
- Wholesale
- Distributor

Customer statuses:

- Lead
- Active
- Inactive

### Product Management

- View products
- Add products
- Product SKU
- Category
- Warehouse
- Unit price
- Current stock
- Minimum stock level
- Low-stock indication

### Warehouse Management

- View warehouses
- Associate products with warehouses
- Track warehouse-related inventory

### Stock Management

Stock movements support:

- IN
- OUT

Each movement records:

- Product
- Warehouse
- Quantity
- Movement type
- Reason
- Created by
- Timestamp
- Reference ID

The system prevents stock from becoming negative.

### Sales Challans

The challan module supports:

- Customer selection
- Multiple products
- Product quantities
- Automatic challan number generation
- Draft challans
- Confirmed challans
- Total quantity calculation
- Total amount calculation
- Product snapshot information

When a challan is confirmed:

1. Product stock is checked.
2. Insufficient stock is rejected.
3. Product stock is reduced.
4. An OUT stock movement is created.
5. The challan status becomes CONFIRMED.

---

## 3. User Roles

| Role | Main Responsibilities |
|------|------------------------|
| ADMIN | Full system administration |
| SALES | Customers, follow-ups and sales operations |
| WAREHOUSE | Products, warehouses and stock operations |
| ACCOUNTS | Business information and viewing operational data |

Role-based access is enforced on protected backend routes.

---

## 4. Technology Stack

### Frontend

- React
- TypeScript
- React Router
- HTML
- CSS
- Vite

### Backend

- Node.js
- TypeScript
- Express.js
- REST API
- JWT
- bcrypt
- Helmet
- CORS
- Morgan
- Express Rate Limit

### Database

- PostgreSQL
- Prisma ORM

### Development Tools

- VS Code
- Postman
- Git
- Docker / Docker Compose

---

## 5. Project Structure

```text
mini-erp-crm/
│
├── backend/
│   ├── prisma/
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── generated/
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── assets/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── database/
│
├── docs/
│
├── postman/
│
├── docker-compose.yml
│
├── .gitignore
│
└── README.md