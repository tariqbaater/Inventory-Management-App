// imports from node_modules
import express from "express";
import path from "path";
import cors from "cors";
import { Parser } from "json2csv";
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import helmet from 'helmet';
import winston from 'winston';
import { query, validationResult } from 'express-validator';

dotenv.config();

// initialize express
const app = express();
// set port
const __dirname = path.resolve();
// set cors
const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  // credentials: true, // Cannot use credentials with origin: "*"
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "example.com"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "example.com"],
        connectSrc: ["'self'", "api.example.com"],
        fontSrc: ["'self'", "data:", "fonts.example.com"],
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
); // Add helmet middleware for security

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
// parse json
app.use(express.json());

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
