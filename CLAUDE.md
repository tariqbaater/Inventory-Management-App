# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dukan is a retail/store inventory management web application built with Node.js, Express, and SQLiteCloud. It provides a dashboard with KPIs (sales, wastage, budget achievement, KVI availability), item/product search, delivery tracking, sales history, and report generation with CSV export.

**Live site:** https://retail-inventory-app.onrender.com/index.html

## Commands

```bash
npm install          # Install dependencies
npm start            # Run server (node app.js) — serves on localhost:8080
npx nodemon app.js   # Dev server with auto-reload
npx eslint .         # Lint
npx prettier .       # Format check
npx jest             # Run tests (none currently exist)
```

## Architecture

**Client-server app with three-layer frontend module system:**

### Backend
- **`app.js`** — Express entry point. Configures Helmet CSP, CORS, Winston logging, static file serving (`public/`, `views/`), mounts API routes, and error handling middleware.
- **`routes/api.js`** — API endpoints. Primarily serves CSV export via a `serveCsvExport` helper that fetches from SQLiteCloud edge functions, converts JSON to CSV with `@json2csv/node`, and streams the response. Uses `express-validator` for input validation.

### Frontend (ES6 modules in `public/js/`)
Three `.mjs` files with clear separation of concerns:
- **`apiCalls.mjs`** — API layer. Exports fetch functions (`historyData`, `deliveryData`, `dsdDelivery`, `salesHistory`, `searchProducts`, etc.) that call SQLiteCloud edge function endpoints directly. Manages loading spinner.
- **`index.mjs`** — DOM/view layer. Exports DOM element references, `createThead()`/`createRow()` for dynamic table construction, event listeners for nav buttons, and localStorage-based auth modal.
- **`searchAllProducts.mjs`** — Business logic layer. Transforms API data into table rows and dashboard cards. Functions like `itemHistoryTableData`, `whDeliveriesTableData`, `dashBoard` consume API data and manipulate the DOM via exports from `index.mjs`.

### Data Flow
Frontend modules call SQLiteCloud edge functions directly (base URL: `https://cfmo8g9ssz.sqlite.cloud:8090/v2/functions`). The Express backend is only used for CSV export endpoints and serving static files.

### Key Patterns
- ES6 module system (`"type": "module"` in package.json, `.mjs` extensions)
- Express v5 beta
- Single HTML page (`views/index.html`) with JS modules handling all view switching
- CSS Grid dashboard layout with responsive breakpoint at 500px
- Node.js v22.2.0 required (`engines` field in package.json)
