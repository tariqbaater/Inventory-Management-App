// imports from node_modules
import express from "express";
import path from "path";
import cors from "cors";
import { Parser } from "json2csv";
// Ensure fetch is available in all Node.js versions
import fetch from 'node-fetch';

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

app.listen(8080, () => {
  console.log("Listening on port 8080");
});

// serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "views")));

app.get("", (_req, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"));
});
// parse json
app.use(express.json());

// Helper function to serve CSV export routes
async function serveCsvExport(res, endpointUrl, filename) {
  try {
    const response = await fetch(endpointUrl);
    const json = await response.json();
    const data = json.data;
    const parser = new Parser();
    const csv = parser.parse(data);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).send("<h1>Error generating CSV file</h1>");
  }
}

// export csv file using json2csv
app.get("/high_value_csv", async (_req, res) => {
  await serveCsvExport(
    res,
    "https://cfmo8g9ssz.sqlite.cloud:8090/v2/functions/high_value",
    "high_value.csv"
  );
});

app.get("/writeoff_csv", async (_req, res) => {
  await serveCsvExport(
    res,
    "https://cfmo8g9ssz.sqlite.cloud:8090/v2/functions/write_off",
    "writeoff.csv"
  );
});

app.get("/missing_availability_csv/", async (_req, res) => {
  await serveCsvExport(
    res,
    "https://cfmo8g9ssz.sqlite.cloud:8090/v2/functions/missing_availability",
    "missing_availability.csv"
  );
});
// Consolidated Express error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("<h1>Error 500: Internal server error</h1>");
});
// 404 handler (after all routes)
app.use((req, res, next) => {
  res.status(404).send("<h1>Error 404: Page not found</h1>");
});
