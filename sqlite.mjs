import { Database } from "@sqlitecloud/drivers";

let database = new Database(
  "sqlitecloud://cfmo8g9ssz.sqlite.cloud:8860?apikey=TZR2EUZnejoSzooT7a74yaf0l8amBikUjQjhmfHMycQ",
);
// or use sqlitecloud://xxx.sqlite.cloud:8860?apikey=xxxxxxx

// let sku = 5303;

// await database.sql`USE DATABASE dukan;`;
// let results = await database.sql`SELECT * FROM sales WHERE ItemNo = ${sku};`;

// create a function that reads history data from sqlitecloud

async function historyData(item) {
  await database.sql`USE DATABASE dukan;`;

  const rows = await database.sql(
    `
        SELECT * FROM ( SELECT ItemNo, Description, SUM(QtyPCs) AS QtyPCs, CONCAT("Dry") AS Remarks FROM dry_delivey GROUP BY ItemNo, Description UNION ALL SELECT ItemNo, Description, SUM(Qty) AS Qty, CONCAT("DSD Receiving") AS Remarks FROM dsd_receiving GROUP BY ItemNo, Description UNION ALL SELECT ItemNo, Description, (Qty * -1) AS QtyPCs, CONCAT("Sales") AS Remarks FROM sales GROUP BY ItemNo, Description, Qty UNION ALL SELECT ItemNo, Description, ROUND(SUM((Qty * -1)), 2) AS QtyPCs, CONCAT("Write Off") AS Remarks FROM write_off GROUP BY ItemNo, Description UNION ALL SELECT ItemNo, Description, physical_qty AS QtyPCs, CONCAT("Stock") AS Remarks FROM main_sheet UNION ALL SELECT ItemNo, Description, Opening AS QtyPCs, CONCAT("Opening") AS Remarks FROM main_sheet UNION ALL SELECT ItemNo, Description, (Qty * -1) AS QtyPCs, CONCAT("Inter Store") AS Remarks FROM Inter_store GROUP BY ItemNo, Description, Qty UNION ALL SELECT ItemNo, Description, (Quantity * -1) AS QtyPCs, CONCAT("RTW") AS Remarks FROM rtw GROUP BY ItemNo, Description, Quantity UNION ALL SELECT ItemNo, Description, (Qty * -1) AS QtyPCs, CONCAT("Short Claim") AS Remarks FROM short_claim GROUP BY ItemNo, Description, Qty UNION ALL SELECT ItemNo, Description, (Qty) AS QtyPCs, CONCAT("Over Claim") AS Remarks FROM over_claim GROUP BY ItemNo, Description, Qty UNION ALL SELECT ItemNo, Description, SUM(Qty * -1) AS QtyPCs, CONCAT("DSD Return") AS Remarks FROM dsd_return GROUP BY ItemNo, Description) AS t WHERE ItemNo = ?;`,
    [item],
  );
  return rows;
}

// example of new function
historyData(5303).then((data) => {
  for (const item of data) {
    console.log([item.ItemNo, item.Description, item.QtyPCs, item.Remarks]);
  }
});

//TODO: Need to make a copy of the InventoryApp Project and change all the db.js functions
// to call from sqlitecloud instead of local mysql database, make sure the function names are
// unchanged
