// imports from node_modules
import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import cors from "cors";
import { Parser } from "json2csv";

// initialize express
const app = express();
// set port
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// set cors
const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  credentials: true,
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

// export csv file using json2csv
app.get("/high_value_csv", async (_req, res, next) => {
  try {
    const response = await fetch(`https://cfmo8g9ssz.sqlite.cloud:8090/v2/functions/high_value`);
    const jsonData = await response.json();
    const data = jsonData.data;
    const parser = new Parser();
    const csv = parser.parse(data);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=high_value.csv");
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

//export csv file using json2csv
app.get("/writeoff_csv", async (_req, res, next) => {
  try {
    const response = await fetch(`https://cfmo8g9ssz.sqlite.cloud:8090/v2/functions/write_off`);
    const jsonData = await response.json();
    const data = jsonData.data;
    const parser = new Parser();
    const csv = parser.parse(data);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=writeoff.csv");
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

// get missing availability report
app.get("/missing_availability_csv/", async (_req, res, next) => {
  try {
    const response = await fetch(`https://cfmo8g9ssz.sqlite.cloud:8090/v2/functions/missing_availability`);
    const jsonData = await response.json();
    const data = jsonData.data;
    const parser = new Parser();
    const csv = parser.parse(data);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=missing_availability.csv");
    res.send(csv);
  } catch (err) {
    next(err);
  }
});
// catch errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  let message;
  switch (status) {
    case 404:
      message = "<h1>Error 404: Page not found</h1>";
      break;
    case 405:
      message = "<h1>Error 405: Method not allowed</h1>";
      break;
    default:
      message = "<h1>Error 500: Internal server error</h1>";
  }
  res.status(status).send(message);
});
