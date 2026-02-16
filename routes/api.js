import express from 'express';
import bcrypt from 'bcrypt';
import { Parser } from 'json2csv';
import { body, query, validationResult } from 'express-validator';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
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
  findUserByUsername,
  getAllUsers,
  createUser as createUserInDb,
  deleteUser as deleteUserInDb,
} from '../db.js';

const router = express.Router();

function parsePagination(query) {
  if (query.page == null && query.limit == null) return null;
  const page = parseInt(query.page, 10);
  const limit = parseInt(query.limit, 10);
  if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) return false;
  return { page, limit };
}

// --- Auth routes (no session required) ---

router.post(
  '/login',
  [
    body('username').isString().trim().notEmpty(),
    body('password').isString().notEmpty(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid credentials' });

    try {
      const user = await findUserByUsername(req.body.username);
      if (!user || !(await bcrypt.compare(req.body.password, user.password_hash))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Prevent session fixation
      req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.isAdmin = !!user.is_admin;
        req.session.storeId = user.store_id;
        req.session.save((err) => {
          if (err) return next(err);
          res.json({ message: 'Login successful' });
        });
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

// --- All routes below require authentication ---
router.use(requireAuth);

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
    const pagination = parsePagination(req.query);
    if (pagination === false) return res.status(400).json({ error: 'page and limit must be positive integers' });
    if (pagination) {
      const result = await searchTable(pagination.page, pagination.limit);
      return res.json({ data: result.rows, total: result.total, page: pagination.page, limit: pagination.limit });
    }
    const data = await searchTable();
    res.json({ data });
  } catch (err) { next(err); }
});

router.get("/write_off", async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    if (pagination === false) return res.status(400).json({ error: 'page and limit must be positive integers' });
    if (pagination) {
      const result = await writeOff(pagination.page, pagination.limit);
      return res.json({ data: result.rows, total: result.total, page: pagination.page, limit: pagination.limit });
    }
    const data = await writeOff();
    res.json({ data });
  } catch (err) { next(err); }
});

router.get("/high_value", async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    if (pagination === false) return res.status(400).json({ error: 'page and limit must be positive integers' });
    if (pagination) {
      const result = await highValue(pagination.page, pagination.limit);
      return res.json({ data: result.rows, total: result.total, page: pagination.page, limit: pagination.limit });
    }
    const data = await highValue();
    res.json({ data });
  } catch (err) { next(err); }
});

router.get("/missing_availability", async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    if (pagination === false) return res.status(400).json({ error: 'page and limit must be positive integers' });
    if (pagination) {
      const result = await missingAvailability(pagination.page, pagination.limit);
      return res.json({ data: result.rows, total: result.total, page: pagination.page, limit: pagination.limit });
    }
    const data = await missingAvailability();
    res.json({ data });
  } catch (err) { next(err); }
});

// --- Current user info ---
router.get('/me', (req, res) => {
  res.json({
    username: req.session.username,
    storeId: req.session.storeId,
    isAdmin: req.session.isAdmin,
  });
});

// --- Admin user management ---
router.get('/users', requireAdmin, async (req, res, next) => {
  try {
    const data = await getAllUsers();
    res.json({ data });
  } catch (err) { next(err); }
});

router.post(
  '/users',
  requireAdmin,
  [
    body('username').isString().trim().notEmpty().withMessage('Username is required'),
    body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('isAdmin').optional().isBoolean(),
    body('storeId').optional({ values: 'falsy' }).isString().trim(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const hash = await bcrypt.hash(req.body.password, 12);
      await createUserInDb(req.body.username, hash, req.body.isAdmin || false, req.body.storeId);
      res.status(201).json({ message: 'User created' });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Username already exists' });
      }
      next(err);
    }
  }
);

router.delete('/users/:id', requireAdmin, async (req, res, next) => {
  try {
    const targetId = parseInt(req.params.id, 10);
    if (targetId === req.session.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    const result = await deleteUserInDb(targetId);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted' });
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
