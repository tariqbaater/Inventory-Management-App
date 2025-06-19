import express from 'express';
import { Parser } from 'json2csv';
import fetch from 'node-fetch';
import { query, validationResult } from 'express-validator';

const router = express.Router();

// Helper function to serve CSV export routes
async function serveCsvExport(res, endpointUrl, filename, logger) {
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
    if (logger) logger.error(err);
    res.status(500).send("<h1>Error generating CSV file</h1>");
  }
}

// CSV export endpoints
router.get("/high_value_csv", async (req, res) => {
  await serveCsvExport(
    res,
    "https://cfmo8g9ssz.sqlite.cloud:8090/v2/functions/high_value",
    "high_value.csv",
    req.app.get('logger')
  );
});

router.get("/writeoff_csv", async (req, res) => {
  await serveCsvExport(
    res,
    "https://cfmo8g9ssz.sqlite.cloud:8090/v2/functions/write_off",
    "writeoff.csv",
    req.app.get('logger')
  );
});

router.get("/missing_availability_csv", async (req, res) => {
  await serveCsvExport(
    res,
    "https://cfmo8g9ssz.sqlite.cloud:8090/v2/functions/missing_availability",
    "missing_availability.csv",
    req.app.get('logger')
  );
});

// Example: validation endpoint
router.get("/history", [query('id').isInt().withMessage('id must be an integer')], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Your handler logic here (fetch and return history by id)
});

export default router;

