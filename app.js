// imports from node_modules
import express from "express";
import path from "path";
import cors from "cors";
import { Parser } from "json2csv";

// imports from local files
import * as dbJs from "./db.js";

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
app.get("/high_value_csv", async (_req, res) => {
  const loadHighValue = async () => {
    const response = await fetch(`http://localhost:8080/high_value/`);
    const data = await response.json();
    return data;
  };

  loadHighValue().then((data) => {
    const parser = new Parser();
    const csv = parser.parse(data);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=high_value.csv");
    res.send(csv);
  });
});

//export csv file using json2csv
app.get("/writeoff_csv", async (_req, res) => {
  const loadWriteOff = async () => {
    const response = await fetch(`http://localhost:8080/writeoff/`);
    const data = await response.json();
    return data;
  };

  loadWriteOff().then((data) => {
    const parser = new Parser();
    const csv = parser.parse(data);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=writeoff.csv");
    res.send(csv);
  });
});

// get missing availability report
app.get("/missing_availability_csv/", async (_req, res) => {
  const loadMissingAvailiability = async () => {
    const response = await fetch(`http://localhost:8080/missing_availability/`);
    const data = await response.json();
    return data;
  };

  loadMissingAvailiability().then((data) => {
    const parser = new Parser();
    const csv = parser.parse(data);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=missing_availability.csv",
    );
    res.send(csv);
  });
});

// get history procedure
app.get("/history/:id", async (req, res) => {
  // check if id is an integer
  if (!Number.isInteger(parseInt(req.params.id))) {
    res.status(400).send("Invalid item number");
    return;
  } else {
    const { id } = req.params;
    const dukan = await dbJs.readData(id);
    res.send(dukan);
  }
});

// get dry_delivey
app.get("/dry_delivery/:id", async (req, res) => {
  // check if id is an integer
  if (!Number.isInteger(parseInt(req.params.id))) {
    res.status(400).send("Invalid item number");
    return;
  } else {
    const { id } = req.params;
    const dukan = await dbJs.dryDelivery(id);
    res.send(dukan);
  }
});

// get dsd_delivery
app.get("/dsd_delivery/:id", async (req, res) => {
  // check if id is an integer
  if (!Number.isInteger(parseInt(req.params.id))) {
    res.status(400).send("Invalid item number");
    return;
  } else {
    const { id } = req.params;
    const dukan = await dbJs.dsdDelivery(id);
    res.send(dukan);
  }
});

// get sales history
app.get("/sales_history/:id", async (req, res) => {
  // check if id is an integer
  if (!Number.isInteger(parseInt(req.params.id))) {
    res.status(400).send("Invalid item number");
    return;
  } else {
    const { id } = req.params;
    const dukan = await dbJs.salesHistory(id);
    res.send(dukan);
  }
});

// search all products
app.get("/search", async (req, res) => {
  const { q } = req.query;
  const dukan = await dbJs.searchTable(q);
  res.send(dukan);
});

// get top products
app.get("/kvi/", async (_req, res) => {
  const dukan = await dbJs.kvi();
  res.send(dukan[0]);
});

// get total sales
app.get("/sales/", async (_req, res) => {
  const dukan = await dbJs.wastePercentage();
  res.send(dukan[0]);
});

// get writeoff totals
app.get("/writeoff/", async (_req, res) => {
  const dukan = await dbJs.writeOff();
  res.send(dukan);
});

// get high value products
app.get("/high_value/", async (_req, res) => {
  const dukan = await dbJs.highValue();
  res.send(dukan);
});

// get missing availability
app.get("/missing_availability/", async (_req, res) => {
  const dukan = await dbJs.missingAvailability();
  res.send(dukan);
});

// catch errors
app.use((err, res) => {
  console.error(err.stack);
  res.status(500).send("<h1>Error 500: Internal server error</h1>");
});

app.use((err, res) => {
  console.log(err.stack);
  res.status(404).send("<h1>Error 404: Page not found</h1>");
});

app.use((err, res) => {
  console.log(err.stack);
  res.status(405).send("<h1>Error 405: Method not allowed</h1>");
});
