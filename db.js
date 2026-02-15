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
      JOIN kvi k ON ms.Item_No = k.ItemNo
      WHERE CAST(ms.Phy_Qty AS SIGNED) > 0
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
    `SELECT d.ItemNo, d.Description, dd.QtyPCs, dd.Date
     FROM data d
     JOIN dry_delivey dd ON d.ItemNo = dd.ItemNo
     WHERE d.ItemNo = ?
     UNION ALL
     SELECT d.ItemNo, d.Description, dr.Qty AS QtyPCs, dr.Date
     FROM data d
     JOIN dsd_receiving dr ON d.ItemNo = dr.ItemNo
     WHERE d.ItemNo = ?`,
    [item, item]
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
    `SELECT s.ItemNo, d.Description, s.Qty, s.Amount FROM sales s JOIN data d ON s.ItemNo = d.ItemNo WHERE s.ItemNo = ?;`,
    [item]
  );
  return rows;
}

export async function searchTable() {
  const [rows] = await pool.query(
    `SELECT ItemNo, Description, Barcode FROM data`
  );
  return rows;
}

export async function writeOff() {
  const [rows] = await pool.query(
    "SELECT ItemNo, Description, Qty AS QtyPCs, `Total Price` AS TotalPrice FROM write_off"
  );
  return rows;
}

export async function highValue() {
  const [rows] = await pool.query(
    `SELECT ms.Item_No AS ItemNo, ms.Item_Description AS Description, CAST(ms.Phy_Qty AS SIGNED) AS Qty, ROUND((s.AmountVAT / s.Qty) * CAST(ms.Phy_Qty AS SIGNED), 2) as value FROM main_sheet ms JOIN sales s ON ms.Item_No = s.ItemNo WHERE CAST(ms.Phy_Qty AS SIGNED) > 0 AND ROUND((s.AmountVAT / s.Qty) * CAST(ms.Phy_Qty AS SIGNED), 2) > 500 ORDER BY value DESC`
  );
  return rows;
}

export async function missingAvailability() {
  const [rows] = await pool.query(
    "SELECT `ac`.ItemNo, `ac`.Description, CAST(`ms`.Phy_Qty AS SIGNED) AS stock FROM `active_list` ac JOIN `main_sheet` ms ON `ac`.`ItemNo` = `ms`.`Item_No` JOIN `pack_size` dd ON `ac`.`ItemNo` = `dd`.`ItemNo` WHERE `ac`.`Mode` = 'DC' AND ac.ItemClass IN ('P-A', 'P-B', 'S', 'G-A') AND CAST(ms.Phy_Qty AS SIGNED) < dd.QtyPCs/`dd`.QtyVPE AND ac.ItemCategory NOT IN ('Smoking Needs', 'Frozen Foods') GROUP BY ac.ItemNo, ac.Description, ac.Mode, ac.ItemCategory, ac.Status, ac.ItemClass, dd.QtyPCs/`dd`.QtyVPE, ms.Phy_Qty"
  );
  return rows;
}
