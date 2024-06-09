import { Database } from "@sqlitecloud/drivers";
import dotenv from "dotenv";
dotenv.config();

let database = new Database(process.env.APIKEY);
export async function kvi() {
  await database.sql`USE DATABASE dukan;`;
  const rows = await database.sql(
    "SELECT ROUND(CAST(SUM(CASE WHEN T2.physical_qty > 0 THEN 1 ELSE 0 END) AS REAL) * 100 / COUNT(T1.ItemNo),0) AS kvi_percentage FROM kvi AS T1 INNER JOIN main_sheet AS T2 ON T1.ItemNo = T2.ItemNo",
  );
  return rows;
}
export async function wastePercentage() {
  await database.sql`USE DATABASE dukan;`;
  const rows = await database.sql(
    "SELECT CAST(ROUND((totalwaste/totalsalesvat)*100, 2) AS DOUBLE) AS percentage, CAST(ROUND(totalwaste, 2) AS INTEGER) AS totalwaste, CAST(ROUND(totalsales, 2) AS INTEGER) AS totalsales, CAST(ROUND(totalsalesvat, 2) AS INTEGER) AS totalsalesvat, CAST(JULIANDAY('now') - JULIANDAY('2024-05-04') AS INTEGER) AS DaysSinceLastInv, CAST(ROUND((totalsales/salesbudget)*100, 2) AS INTEGER) AS vsbudget, CAST(ROUND(AvgSales, 2) AS INTEGER) AS Avg_Sales, CAST(ROUND(salesbudget, 2) AS INTEGER) AS totalsalesbudget FROM ( SELECT CAST(SUM(T1.`total price`) AS REAL) AS totalwaste FROM `write_off` AS T1 WHERE T1.`Date` BETWEEN '2024-06-01' AND '2024-06-30') AS totalwaste, ( SELECT CAST(SUM(T1.`Amount`) AS REAL) AS totalsales FROM `daily_sales` AS T1 WHERE T1.`Date` BETWEEN '2024-06-01' AND '2024-06-30') AS totalsales, ( SELECT CAST(SUM(T1.`AmountVAT`) AS REAL) AS totalsalesvat FROM `daily_sales` AS T1 WHERE T1.`Date` BETWEEN '2024-06-01' AND '2024-06-30') AS totalsalesvat, ( SELECT CAST(SUM(T1.`Sales`) AS REAL) AS salesbudget FROM `budget` AS T1) AS salesbudget, ( SELECT T2.`Description`, CAST(SUM(T1.`Amount`) AS REAL) AS Total_Sales, CAST(SUM(T1.`Amount`) / (JULIANDAY('now') - JULIANDAY(strftime('%Y-%m-%d', 'now', 'start of month'))) AS REAL) AS AvgSales FROM `daily_sales` AS T1 INNER JOIN `category` AS T2 ON T1.`itemno` = T2.`itemno` WHERE T1.`Date` BETWEEN strftime('%Y-%m-%d', 'now', 'start of month') AND date('now') )",
  );
  return rows;
}

export async function readData(item) {
  await database.sql`USE DATABASE dukan;`;
  const rows = await database.sql(
    `
        SELECT * FROM (SELECT ItemNo, Description, SUM(QtyPCs) AS QtyPCs, CONCAT("Dry") AS Remarks FROM dry_delivey GROUP BY ItemNo, Description UNION ALL SELECT ItemNo, Description, SUM(Qty) AS Qty, CONCAT("DSD Receiving") AS Remarks FROM dsd_receiving GROUP BY ItemNo, Description UNION ALL SELECT ItemNo, Description, (Qty * -1) AS QtyPCs, CONCAT("Sales") AS Remarks FROM sales GROUP BY ItemNo, Description, Qty UNION ALL SELECT ItemNo, Description, ROUND(SUM((Qty * -1)), 2) AS QtyPCs, CONCAT("Write Off") AS Remarks FROM write_off GROUP BY ItemNo, Description UNION ALL SELECT ItemNo, Description, physical_qty AS QtyPCs, CONCAT("Stock") AS Remarks FROM main_sheet UNION ALL SELECT ItemNo, Description, Opening AS QtyPCs, CONCAT("Opening") AS Remarks FROM opening UNION ALL SELECT ItemNo, Description, (Qty * -1) AS QtyPCs, CONCAT("Inter Store") AS Remarks FROM Inter_store GROUP BY ItemNo, Description, Qty UNION ALL SELECT ItemNo, Description, (Quantity * -1) AS QtyPCs, CONCAT("RTW") AS Remarks FROM rtw GROUP BY ItemNo, Description, Quantity UNION ALL SELECT ItemNo, Description, (Qty * -1) AS QtyPCs, CONCAT("Short Claim") AS Remarks FROM short_claim GROUP BY ItemNo, Description, Qty UNION ALL SELECT ItemNo, Description, (Qty) AS QtyPCs, CONCAT("Over Claim") AS Remarks FROM over_claim GROUP BY ItemNo, Description, Qty UNION ALL SELECT ItemNo, Description, SUM(Qty * -1) AS QtyPCs, CONCAT("DSD Return") AS Remarks FROM dsd_return GROUP BY ItemNo, Description) AS t WHERE ItemNo = ?;`,
    [item],
  );
  return rows;
}

export async function dryDelivery(item) {
  await database.sql`USE DATABASE dukan;`;
  const rows = await database.sql(
    `SELECT ItemNo, Description, QtyPCs, Date FROM dry_delivey  WHERE ItemNo = ?;`,
    [item],
  );
  return rows;
}

export async function dsdDelivery(item) {
  await database.sql`USE DATABASE dukan;`;
  const rows = await database.sql(
    `SELECT ItemNo, Description, Qty, Date FROM dsd_receiving  WHERE ItemNo = ?;`,
    [item],
  );
  return rows;
}

export async function salesHistory(item) {
  await database.sql`USE DATABASE dukan;`;
  const rows = await database.sql(
    `SELECT ItemNo, Description, Qty, Amount, Date FROM daily_sales WHERE ItemNo = ?`,
    [item],
  );
  return rows;
}

export async function mainSheet() {
  await database.sql`USE DATABASE dukan;`;
  const rows = await database.sql(`SELECT * FROM main_sheet;`);
  return rows;
}

export async function searchTable(query = "") {
  await database.sql`USE DATABASE dukan;`;
  let sql = "";
  if (query != "") {
    sql = `SELECT itemno, description , barcode FROM data WHERE ItemNo LIKE '%${query}%' OR Description LIKE '%${query}%'`;
  } else {
    sql = `SELECT itemno, description, barcode FROM data`;
  }

  const rows = await database.sql(sql);
  return rows;
}

export async function writeOff() {
  await database.sql`USE DATABASE dukan;`;
  const rows = await database.sql(`SELECT
    ItemNo,
    Description,
    ROUND(SUM(QtyPCs), 2) AS QtyPCs,
    ROUND(SUM(TotalPrice), 2) AS TotalPrice
    FROM
    (SELECT
    COALESCE(ItemNo, 'TOTAL') AS ItemNo,
    CASE
      WHEN ItemNo IS NULL THEN 'TOTAL' ELSE COALESCE(Description, 'ITEM TOTAL')  END AS Description,
    ROUND(SUM(Qty), 2) AS QtyPCs,
    ROUND(SUM("Total Price"), 2) AS TotalPrice,
    CASE
      WHEN SUBSTR("Date", 1, 10) IS NULL AND Description IS NULL THEN 'TOTAL' ELSE SUBSTR("Date", 1, 10) END AS Date
    FROM write_off
    GROUP BY ItemNo, Description, Date) AS T
    GROUP BY ItemNo, Description
    ORDER BY SUM("TotalPrice") DESC`);
  return rows;
}

export async function highValue() {
  await database.sql`USE DATABASE dukan;`;
  const rows = await database.sql(`SELECT
ms.itemno, ms.description, ms.opening, ms.dry, ms.write_off, ms.rtw_qty, ms.inter_store_qty, ms.sales, physical_qty, ROUND((s.AmountVAT / s.Qty)  * physical_qty, 2) as value
from main_sheet ms  JOIN sales s ON ms.itemno = s.itemno
WHERE physical_qty > 0 AND ROUND((s.AmountVAT / s.Qty)  * physical_qty, 2)  > 500
ORDER BY value DESC`);
  return rows;
}

export async function missingAvailability() {
  await database.sql`USE DATABASE dukan;`;
  const rows = await database.sql(
    "SELECT `ac`.*, `dd`.QtyPCs/`dd`.QtyVPE as PcsPerCarton, `ms`.physical_qty AS stock FROM `active_list` ac JOIN `main_sheet` ms ON `ac`.`ItemNo` = `ms`.`ItemNo` JOIN `pack_size` dd ON `ac`.`ItemNo` = `dd`.`ItemNo` WHERE `ac`.`Mode` = 'DC' AND ac.ItemClass IN ('P-A', 'P-B', 'S', 'G-A') AND ms.physical_qty < dd.QtyPCs/`dd`.QtyVPE AND ac.ItemCategory NOT IN ('Smoking Needs', 'Frozen Foods') GROUP BY ac.ItemNo, ac.Description, ac.Mode, ac.ItemCategory, ac.Status, ac.ItemClass, dd.QtyPCs/`dd`.QtyVPE, ms.physical_qty",
  );

  return rows;
}
