// imports from node_modules
import express from "express";
import path from "path";
import cors from "cors";
import dotenv from 'dotenv';
import helmet from 'helmet';
import session from 'express-session';
import winston from 'winston';

dotenv.config();

// initialize express
const app = express();
const __dirname = path.resolve();

// CORS — tighten from origin: "*" to support credentials
const corsOptions = {
  origin: process.env.CORS_ORIGIN || true,
  optionsSuccessStatus: 200,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "data:", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      },
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    dnsPrefetchControl: { allow: false },
    expectCt: {
      maxAge: 86400,
      enforce: true,
    },
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: {
      maxAge: 15552000,
      includeSubDomains: true,
    },
    ieNoOpen: true,
    noSniff: true,
    permittedCrossDomainPolicies: { policy: "none" },
    xssFilter: true,
  })
);

// Trust proxy for secure cookies behind Dokploy reverse proxy
app.set('trust proxy', 1);

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-me-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
  },
}));

// Parse request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  logger.info(`Listening on port ${PORT}`);
});

// serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "views")));

app.get("", (_req, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"));
});

// Modularized API routes
import apiRoutes from './routes/api.js';
app.use('/api/v1', apiRoutes);
// Consolidated Express error handler middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send("<h1>Error 500: Internal server error</h1>");
});
// 404 handler (after all routes)
app.use((req, res, next) => {
  res.status(404).send("<h1>Error 404: Page not found</h1>");
});
