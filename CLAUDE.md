# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dukan is a retail/store inventory management web application built with Node.js, Express, and MySQL. It provides a dashboard with KPIs (sales, wastage, budget achievement, KVI availability), item/product search, delivery tracking, sales history, report generation with CSV export, and multi-user authentication with admin controls.

Deployed on Dokploy (VPS) with the app and MySQL database running as two services in the same project, communicating via Docker internal networking.

## Commands

```bash
npm install          # Install dependencies
npm start            # Run server (node app.js) — serves on localhost:8080
npx nodemon app.js   # Dev server with auto-reload
npx eslint .         # Lint
npx prettier .       # Format check
npx jest             # Run tests (none currently exist)
node scripts/seed-user.js <username> <password>  # Create admin user
```

## Environment Variables

Configured in Dokploy's environment settings for the app service. See `.env.example`.

| Variable | Description | Default |
|----------|-------------|---------|
| `MYSQL_HOST` | Dokploy internal service hostname | `inventory-management-dukandb-i41rfq` |
| `MYSQL_PORT` | MySQL port | `3306` |
| `MYSQL_USER` | Database username | — |
| `MYSQL_PASSWORD` | Database password | — |
| `MYSQL_DATABASE` | Database name | `dukan` |
| `PORT` | Server port | `8080` |
| `SESSION_SECRET` | Secret for signing session cookies | — |
| `CORS_ORIGIN` | Allowed CORS origin | Request origin |
| `NODE_ENV` | Set to `production` for secure cookies | — |

## Architecture

**Three-tier server architecture with session-based auth:**

### Backend
- **`app.js`** — Express entry point. Configures Helmet CSP, CORS, express-session (secure cookies, 8-hour expiry), Winston logging, trust proxy for Dokploy reverse proxy, static file serving (`public/`, `views/`), mounts API routes at `/api/v1`.
- **`db.js`** — MySQL connection pool (`mysql2/promise`). Exports query functions: `kvi`, `wastePercentage`, `readData`, `dryDelivery`, `dsdDelivery`, `salesHistory`, `searchTable`, `writeOff`, `highValue`, `missingAvailability`, plus user management functions (`findUserByUsername`, `getAllUsers`, `createUser`, `deleteUser`). Paginated functions accept `(page, limit, search)` and return `{ rows, total }`.
- **`routes/api.js`** — RESTful API. Auth routes (login/logout with bcrypt), data endpoints (all require `requireAuth`), admin user management (requires `requireAdmin`), CSV export via `serveCsvExport` helper using `@json2csv/node`. Pagination support on search_products, write_off, high_value, missing_availability.
- **`middleware/auth.js`** — `requireAuth` checks `req.session.userId`, `requireAdmin` checks `req.session.isAdmin`. Returns 401/403 JSON.
- **`scripts/seed-user.js`** — CLI tool to create admin users. Creates `users` table if needed, hashes password with bcrypt (12 rounds).

### Frontend (ES6 modules in `public/js/`)
Three `.mjs` files with clear separation of concerns:
- **`apiCalls.mjs`** — API layer. Exports fetch functions that call `/api/v1/...` with `credentials: 'include'` for session cookies. Includes `fetchPaginated` for paginated endpoints, auth functions (`login`, `logout`, `fetchCurrentUser`), and user management APIs. Dispatches `auth:required` custom event on 401 responses.
- **`index.mjs`** — DOM/view layer. Exports DOM element references, `createThead()`/`createRows()` (batch via DocumentFragment) for table construction, event listeners, pagination controls, user management UI, and session-based login/logout flow.
- **`searchAllProducts.mjs`** — Business logic layer. Transforms API data into table rows and dashboard cards. Manages pagination state (`currentPage`, `currentLimit`, `currentViewFn`). Numeric values rounded to 2 decimal places in write-off view.

### Data Flow
```
Browser → Express API (/api/v1) → MySQL (mysql2/promise pool)
                                    ↓
                     Dokploy internal: inventory-management-dukandb-i41rfq:3306
```

### Key Patterns
- ES6 module system (`"type": "module"` in package.json, `.mjs` extensions)
- Express v5 beta with express-session for auth (not localStorage)
- Single HTML page (`views/index.html`) with JS modules handling all view switching
- Server-side pagination with `?page=&limit=&search=` query params
- CSS Grid dashboard layout with responsive breakpoints at 768px and 500px
- Blue/white color theme (`#60a5fa` light blue, `#1a56db` dark blue)
- CI/CD via GitHub Actions (`.github/workflows/deploy.yml`) triggering Dokploy webhook on push to main
- Node.js v22.2.0 required (`engines` field in package.json)
