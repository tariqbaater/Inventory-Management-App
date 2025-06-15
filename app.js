// imports from node_modules
import express from "express";
import path from "path";
import cors from "cors";
import { Parser } from "json2csv";

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
    const response = await fetch(
      `https://cfmo8g9ssz.sqlite.cloud:8090/v2/functions/high_value`,
    );
    const data = await response.json();
    return data.data;
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
    const response = await fetch(
      `https://cfmo8g9ssz.sqlite.cloud:8090/v2/functions/write_off`,
    );
    const data = await response.json();
    return data.data;
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
    const response = await fetch(
      `https://cfmo8g9ssz.sqlite.cloud:8090/v2/functions/missing_availability`,
    );
    const data = await response.json();
    return data.data;
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
