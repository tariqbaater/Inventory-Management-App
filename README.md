# 📦 Dukan — Retail Inventory Management

A lightweight, web-based inventory management application built for retail convenience stores. Track stock levels, monitor KPIs, manage wastage, and keep your shelves stocked — all from a clean, responsive dashboard.

![Node.js](https://img.shields.io/badge/Node.js-22-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-5-blue?logo=express)
![MySQL](https://img.shields.io/badge/MySQL-8-orange?logo=mysql&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-lightgrey)

---

## ✨ Features

### 📊 Monthly Dashboard
Get a bird's-eye view of your store's performance with key KPIs:
- **Sales vs. Budget** — track actual sales against targets
- **Waste Percentage** — monitor shrinkage as a percentage of sales
- **KVI Availability** — key value item in-stock rate
- **Average Daily Sales** — calculated from historical data

### 🔍 Product Search
Search your entire product catalog by:
- **SKU / Item Number**
- **Description**
- **Barcode**

Paginated results with fast MySQL-backed queries.

### 📜 Item History
Track any item's full lifecycle by SKU:
- Warehouse (dry) deliveries
- DSD (direct store delivery) receiving
- Daily sales history
- Combined delivery timeline

### 📉 Write-Off Management
Manage and monitor product wastage:
- View all written-off items with quantities and values
- Search and filter write-offs
- Export to CSV for reporting

### 💰 High Value Items
Easily track high-priced inventory:
- Dedicated view for expensive products
- Search and paginate through high-value stock
- CSV export for audits and reviews

### 📦 Availability / Replenishment
Identify items that need restocking:
- Calculates stock levels against sales velocity
- Flags items **below required stock levels**
- Helps prevent out-of-stocks before they happen
- Export availability gaps to CSV

### 👥 Multi-Store & User Management
Built for businesses with multiple locations:
- **User authentication** with secure sessions (bcrypt + express-session)
- **Store-scoped access** — each user is linked to a specific store
- **Admin panel** — create, view, and delete user accounts
- **Role-based access** — admin vs. standard user permissions

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js, Express 5 |
| **Database** | MySQL 8 |
| **Frontend** | Vanilla JS (ES Modules), jQuery, ApexCharts |
| **Auth** | bcrypt, express-session |
| **Security** | Helmet.js, CORS, input validation (express-validator) |
| **Logging** | Winston |
| **Deployment** | Docker / Dokploy with CI/CD via GitHub Actions |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v22+
- MySQL 8 database

### Installation

```bash
# Clone the repository
git clone https://github.com/tariqbaater/Inventory-Management-App.git
cd Inventory-Management-App

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MYSQL_HOST` | MySQL host | `localhost` |
| `MYSQL_PORT` | MySQL port | `3306` |
| `MYSQL_USER` | Database username | — |
| `MYSQL_PASSWORD` | Database password | — |
| `MYSQL_DATABASE` | Database name | `dukan` |
| `PORT` | Server port | `8080` |
| `SESSION_SECRET` | Secret for signing session cookies | — |
| `CORS_ORIGIN` | Allowed CORS origin | Request origin |
| `NODE_ENV` | Environment (`production` for secure cookies) | — |

### Run

```bash
npm start
```

The app will be available at `http://localhost:8080`.

### Seed Admin User

```bash
node scripts/seed-user.js
```

---

## 📁 Project Structure

```
├── app.js                 # Express server setup
├── db.js                  # MySQL queries & data access layer
├── routes/
│   └── api.js             # RESTful API routes (auth + data + admin)
├── middleware/
│   └── auth.js            # Authentication & authorization middleware
├── public/
│   ├── css/style.css      # Stylesheet
│   ├── js/
│   │   ├── index.mjs      # Main dashboard logic
│   │   ├── apiCalls.mjs   # API client functions
│   │   └── searchAllProducts.mjs
│   └── img/               # Static assets
├── views/
│   └── index.html         # Single-page application
├── scripts/
│   └── seed-user.js       # Admin user seeder
└── .github/workflows/
    └── deploy.yml         # CI/CD pipeline (Dokploy webhook)
```

---

## 🔌 API Endpoints

All data endpoints require authentication (`POST /api/v1/login` first).

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/login` | Authenticate user |
| `POST` | `/api/v1/logout` | End session |
| `GET` | `/api/v1/me` | Current user info |
| `GET` | `/api/v1/kvi` | KVI availability percentage |
| `GET` | `/api/v1/waste_percentage` | Waste & sales KPIs |
| `GET` | `/api/v1/item_history?id=` | Item delivery history by SKU |
| `GET` | `/api/v1/sales_history?id=` | Sales history by SKU |
| `GET` | `/api/v1/search_products` | Search all products (paginated) |
| `GET` | `/api/v1/write_off` | Write-off items (paginated) |
| `GET` | `/api/v1/high_value` | High value items (paginated) |
| `GET` | `/api/v1/missing_availability` | Below-stock items (paginated) |
| `GET` | `/api/v1/*_csv` | CSV exports (high_value, writeoff, availability) |
| `GET` | `/api/v1/users` | List users (admin only) |
| `POST` | `/api/v1/users` | Create user (admin only) |
| `DELETE` | `/api/v1/users/:id` | Delete user (admin only) |

---

## 📄 License

ISC
