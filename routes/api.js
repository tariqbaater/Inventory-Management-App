import express from 'express';
import { Parser } from 'json2csv';
import { query, validationResult } from 'express-validator';
import {
  kvi,
  wastePercentage,
  readData,
  dryDelivery,
  dsdDelivery,
  salesHistory,
  searchTable,
  writeOff,
  highValue,
  missingAvailability,
} from '../db.js';

const router = express.Router();

// Data endpoints
router.get("/kvi", async (req, res, next) => {
  try {
    const data = await kvi();
    res.json({ data });
  } catch (err) { next(err); }
});

router.get("/waste_percentage", async (req, res, next) => {
  try {
    const data = await wastePercentage();
    res.json({ data });
  } catch (err) { next(err); }
});

router.get("/item_history", [query('id').isInt().withMessage('id must be an integer')], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const data = await readData(req.query.id);
    res.json({ data });
  } catch (err) { next(err); }
});

router.get("/wh_delivery", [query('id').isInt().withMessage('id must be an integer')], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const data = await dryDelivery(req.query.id);
    res.json({ data });
  } catch (err) { next(err); }
});

router.get("/dsd_deliveries", [query('id').isInt().withMessage('id must be an integer')], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const data = await dsdDelivery(req.query.id);
    res.json({ data });
  } catch (err) { next(err); }
});

router.get("/sales_history", [query('id').isInt().withMessage('id must be an integer')], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const data = await salesHistory(req.query.id);
    res.json({ data });
  } catch (err) { next(err); }
});

router.get("/search_products", async (req, res, next) => {
  try {
    const data = await searchTable();
    res.json({ data });
  } catch (err) { next(err); }
});

router.get("/write_off", async (req, res, next) => {
  try {
    const data = await writeOff();
    res.json({ data });
  } catch (err) { next(err); }
});

router.get("/high_value", async (req, res, next) => {
  try {
    const data = await highValue();
    res.json({ data });
  } catch (err) { next(err); }
});

router.get("/missing_availability", async (req, res, next) => {
  try {
    const data = await missingAvailability();
    res.json({ data });
  } catch (err) { next(err); }
});

// CSV export helper
async function serveCsvExport(res, queryFn, filename, next) {
  try {
    const data = await queryFn();
    const parser = new Parser();
    const csv = parser.parse(data);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

// CSV export endpoints
router.get("/high_value_csv", async (req, res, next) => {
  await serveCsvExport(res, highValue, "high_value.csv", next);
});

router.get("/writeoff_csv", async (req, res, next) => {
  await serveCsvExport(res, writeOff, "writeoff.csv", next);
});

router.get("/missing_availability_csv", async (req, res, next) => {
  await serveCsvExport(res, missingAvailability, "missing_availability.csv", next);
});

export default router;
