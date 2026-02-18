import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST || "inventory-management-dukandb-i41rfq",
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

export async function kvi() {
  const [rows] = await pool.query(`
    WITH availability AS (
      SELECT count(k.ItemNo) as available
      FROM main_sheet ms
      JOIN kvi k ON ms.ItemNo = k.ItemNo
      WHERE ms.Qty > 0
    ),
    kvi_count AS (
      SELECT count(k.ItemNo) as kvi_count FROM kvi k
    )
    SELECT ROUND((available/kvi_count) * 100, 0) as kvi_percentage
    FROM (
      SELECT * FROM availability JOIN kvi_count ON 1=1
    ) AS subquery
  `);
  return rows;
}

export async function wastePercentage() {
  const [rows] = await pool.query(
    "SELECT ROUND((totalwaste/totalsalesvat)*100, 2) AS `percentage`, FORMAT(ROUND(totalwaste, 2), 0) AS `totalwaste`, FORMAT(ROUND(totalsales, 2), 0) AS totalsales, FORMAT(ROUND(totalsalesvat, 2), 0) AS totalsalesvat, FORMAT(ROUND(totalsales / datediff(date_format(now(), '%Y-%m-%d'), date_format('2024-05-04', '%Y-%m-%d')), 0), 0) AS Avg_Sales, datediff(date_format(now(), '%Y-%m-%d'), date_format('2024-05-04', '%Y-%m-%d') ) as DaysSince, FORMAT(ROUND(sales, 2), 0) AS totalsalesbudget, ROUND((totalsales/Sales)*100, 0) AS `vsbudget` FROM ( SELECT ROUND(SUM(`total price`), 2) AS `totalwaste` FROM `write_off`) AS `totalwaste`, ( SELECT ROUND(SUM(`Amount`), 2) AS `totalsales` FROM `sales`) AS `totalsales`, ( SELECT ROUND(SUM(`AmountVAT`), 2) AS `totalsalesvat` FROM `sales`) AS `totalsalesvat`, ( SELECT ROUND(SUM(`Sales`), 2) AS `Sales` from `budget`) AS `salesbudget`"
  );
  return rows;
}

export async function readData(item) {
  const [rows] = await pool.query(
    `SELECT ItemNo, Description, SUM(QtyPCs) AS QtyPCs, 'WH' AS Remarks, 3 AS priority
     FROM dry_delivey WHERE ItemNo = ? GROUP BY ItemNo, Description
     UNION ALL
     SELECT ItemNo, Description, SUM(Qty) AS QtyPCs, 'DSD' AS Remarks, 4 AS priority
     FROM dsd_receiving WHERE ItemNo = ? GROUP BY ItemNo, Description
     UNION ALL
     SELECT ItemNo, Description, SUM(Qty * -1) AS QtyPCs, 'SALES' AS Remarks, 11 AS priority
     FROM sales WHERE ItemNo = ? GROUP BY ItemNo, Description
     UNION ALL
     SELECT itemno, description, ROUND(SUM(qty * -1), 2) AS QtyPCs, 'WASTE' AS Remarks, 10 AS priority
     FROM write_off WHERE ItemNo = ? GROUP BY itemno, description
     UNION ALL
     SELECT itemno, description, SUM(Qty) AS QtyPCs, 'STOCK' AS Remarks, 1 AS priority
     FROM main_sheet WHERE ItemNo = ? GROUP BY itemno, description
     UNION ALL
     SELECT itemno, description, SUM(opening) AS QtyPCs, 'OPENING' AS Remarks, 2 AS priority
     FROM opening WHERE ItemNo = ? GROUP BY itemno, description
     UNION ALL
     SELECT itemno, description, SUM(qty * -1) AS QtyPCs, 'IST OUT' AS Remarks, 9 AS priority
     FROM inter_store WHERE ItemNo = ? GROUP BY itemno, description
     UNION ALL
     SELECT itemno, description, ROUND(SUM(quantity * -1), 2) AS QtyPCs, 'RTW' AS Remarks, 8 AS priority
     FROM rtw WHERE ItemNo = ? GROUP BY itemno, description
     UNION ALL
     SELECT itemno, description, ROUND(SUM(qty * -1), 2) AS QtyPCs, 'SHORT' AS Remarks, 7 AS priority
     FROM short_claim WHERE ItemNo = ? GROUP BY itemno, description
     UNION ALL
     SELECT itemno, description, SUM(qty) AS QtyPCs, 'OVER' AS Remarks, 5 AS priority
     FROM over_claim WHERE ItemNo = ? GROUP BY itemno, description
     UNION ALL
     SELECT itemno, description, SUM(qty * -1) AS QtyPCs, 'RTV' AS Remarks, 6 AS priority
     FROM dsd_return WHERE ItemNo = ? GROUP BY itemno, description
     ORDER BY priority`,
    [item, item, item, item, item, item, item, item, item, item, item]
  );
  return rows;
}

export async function dryDelivery(item) {
  const [rows] = await pool.query(
    `SELECT ItemNo, Description, QtyPCs, Date FROM dry_delivey WHERE ItemNo = ?;`,
    [item]
  );
  return rows;
}

export async function dsdDelivery(item) {
  const [rows] = await pool.query(
    `SELECT ItemNo, Description, Qty, Date FROM dsd_receiving WHERE ItemNo = ?;`,
    [item]
  );
  return rows;
}

export async function salesHistory(item) {
  const [rows] = await pool.query(
    `SELECT ItemNo, Description, Qty, Date FROM daily_sales WHERE ItemNo = ?;`,
    [item]
  );
  return rows;
}

export async function searchTable(page, limit, search) {
  let baseQuery = 'SELECT ItemNo, Description, Barcode FROM data';
  const searchParams = [];
  if (search) {
    const like = `%${search}%`;
    baseQuery += ' WHERE ItemNo LIKE ? OR Description LIKE ? OR Barcode LIKE ?';
    searchParams.push(like, like, like);
  }
  if (page != null && limit != null) {
    const offset = (page - 1) * limit;
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM (${baseQuery}) AS t`, searchParams);
    const [rows] = await pool.query(`${baseQuery} LIMIT ? OFFSET ?`, [...searchParams, limit, offset]);
    return { rows, total };
  }
  const [rows] = await pool.query(baseQuery, searchParams);
  return rows;
}

export async function writeOff(page, limit, search) {
  let whereClause = '';
  const searchParams = [];
  if (search) {
    const like = `%${search}%`;
    whereClause = ' WHERE (ItemNo LIKE ? OR Description LIKE ?)';
    searchParams.push(like, like);
  }
  const baseQuery = `SELECT ItemNo, Description, SUM(Qty) AS QtyPCs, SUM(\`Total Price\`) AS TotalPrice FROM write_off${whereClause} GROUP BY ItemNo, Description`;
  if (page != null && limit != null) {
    const offset = (page - 1) * limit;
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM (${baseQuery}) AS t`, searchParams);
    const [rows] = await pool.query(`${baseQuery} LIMIT ? OFFSET ?`, [...searchParams, limit, offset]);
    return { rows, total };
  }
  const [rows] = await pool.query(baseQuery, searchParams);
  return rows;
}

export async function highValue(page, limit, search) {
  let baseQuery = 'SELECT ms.ItemNo, ms.Description, ms.Qty, ROUND((s.AmountVAT / s.Qty) * ms.Qty, 2) as value FROM main_sheet ms JOIN sales s ON ms.ItemNo = s.ItemNo WHERE ms.Qty > 0 AND ROUND((s.AmountVAT / s.Qty) * ms.Qty, 2) > 500';
  const searchParams = [];
  if (search) {
    const like = `%${search}%`;
    baseQuery += ' AND (ms.ItemNo LIKE ? OR ms.Description LIKE ?)';
    searchParams.push(like, like);
  }
  if (page != null && limit != null) {
    const offset = (page - 1) * limit;
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM (${baseQuery}) AS t`, searchParams);
    const [rows] = await pool.query(`${baseQuery} ORDER BY value DESC LIMIT ? OFFSET ?`, [...searchParams, limit, offset]);
    return { rows, total };
  }
  const [rows] = await pool.query(`${baseQuery} ORDER BY value DESC`, searchParams);
  return rows;
}

export async function findUserByUsername(username) {
  const [rows] = await pool.query(
    'SELECT id, username, password_hash, is_admin, store_id FROM users WHERE username = ?',
    [username]
  );
  return rows[0] || null;
}

export async function getAllUsers() {
  const [rows] = await pool.query(
    'SELECT id, username, is_admin, store_id, created_at FROM users'
  );
  return rows;
}

export async function createUser(username, passwordHash, isAdmin, storeId) {
  const [result] = await pool.query(
    'INSERT INTO users (username, password_hash, is_admin, store_id) VALUES (?, ?, ?, ?)',
    [username, passwordHash, isAdmin ? 1 : 0, storeId || null]
  );
  return result;
}

export async function deleteUser(id) {
  const [result] = await pool.query(
    'DELETE FROM users WHERE id = ?',
    [id]
  );
  return result;
}

export async function missingAvailability(page, limit, search) {
  const selectFrom = "SELECT `ac`.ItemNo, `ac`.Description, `ms`.Qty AS stock FROM `active_list` ac JOIN `main_sheet` ms ON `ac`.`ItemNo` = `ms`.`ItemNo` JOIN `pack_size` dd ON `ac`.`ItemNo` = `dd`.`ItemNo`";
  let whereClause = " WHERE `ac`.`Mode` = 'DC' AND ac.ItemClass IN ('P-A', 'P-B', 'S', 'G-A') AND ms.Qty < dd.QtyPCs/`dd`.QtyVPE AND ac.ItemCategory NOT IN ('Smoking Needs', 'Frozen Foods')";
  const groupBy = " GROUP BY ac.ItemNo, ac.Description, ac.Mode, ac.ItemCategory, ac.Status, ac.ItemClass, dd.QtyPCs/`dd`.QtyVPE, ms.Qty";
  const searchParams = [];
  if (search) {
    const like = `%${search}%`;
    whereClause += ' AND (ac.ItemNo LIKE ? OR ac.Description LIKE ?)';
    searchParams.push(like, like);
  }
  const baseQuery = selectFrom + whereClause + groupBy;
  if (page != null && limit != null) {
    const offset = (page - 1) * limit;
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM (${baseQuery}) AS t`, searchParams);
    const [rows] = await pool.query(`${baseQuery} LIMIT ? OFFSET ?`, [...searchParams, limit, offset]);
    return { rows, total };
  }
  const [rows] = await pool.query(baseQuery, searchParams);
  return rows;
}
