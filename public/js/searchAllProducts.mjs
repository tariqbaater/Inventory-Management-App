import * as apiCallsMjs from "./apiCalls.mjs";
import * as indexMjs from "./index.mjs";

// *********** DATA FUNCTIONS ***********
// function to be called when search/item history button is clicked
export const itemHistoryTableData = () => {
  indexMjs.searchHistory.style.display = "block";
  indexMjs.searchDiv3.style.display = "none";
  indexMjs.table.innerHTML = "";
  const theaderRow = ["Item No", "Description", "Qty", "Remarks"];
  indexMjs.createThead(theaderRow);
  apiCallsMjs.historyData(indexMjs.searchHistBox.value).then((data) => {
    for (const item of data) {
      indexMjs.createRow([
        item.ItemNo,
        item.Description,
        item.QtyPCs,
        item.Remarks,
      ]);
    }
  });
};
// function to be called when search/wh deliveries button is clicked
export const whDeliveriesTableData = () => {
  indexMjs.table.innerHTML = "";
  const theaderRow = ["Item No", "Description", "Qty", "Date"];
  indexMjs.createThead(theaderRow);
  apiCallsMjs.deliveryData(indexMjs.searchHistBox.value).then((data) => {
    for (const item of data) {
      indexMjs.createRow([
        item.ItemNo,
        item.Description,
        item.QtyPCs,
        item.Date.substring(0, 10),
      ]);
    }
  });
};
// function to be called when search/wh deliveries button is clicked
export const dsdDeliveriesTableData = () => {
  indexMjs.table.innerHTML = "";
  const theaderRow = ["Item No", "Description", "Qty", "Date"];
  indexMjs.createThead(theaderRow);
  apiCallsMjs.dsdDelivery(indexMjs.searchHistBox.value).then((data) => {
    for (const item of data) {
      indexMjs.createRow([
        item.ItemNo,
        item.Description,
        item.Qty,
        item.Date.substring(0, 10),
      ]);
    }
  });
};
// function to be called when search/sales history button is clicked
export const salesHistoryTableData = () => {
  indexMjs.table.innerHTML = "";
  const theaderRow = ["Item No", "Description", "Qty", "Date"];
  indexMjs.createThead(theaderRow);
  apiCallsMjs.salesHistory(indexMjs.searchHistBox.value).then((data) => {
    for (const item of data) {
      indexMjs.createRow([
        item.ItemNo,
        item.Description,
        item.Qty,
        item.Date.substring(0, 10),
      ]);
    }
  });
};
// function to be called when all products button is clicked
export const searchAllProducts = () => {
  indexMjs.searchHistory.style.display = "none";
  indexMjs.searchDiv3.style.display = "block";
  indexMjs.table.innerHTML = "";
  const theaderRow = ["Item No", "Description", "Barcode"];
  indexMjs.createThead(theaderRow);
  apiCallsMjs.loadData(indexMjs.searchName.value).then((data) => {
    for (const item of data) {
      indexMjs.createRow([item.ItemNo, item.Description, item.Barcode]);
    }
  });
};

// function to be called when dashboard button is clicked
export const dashBoard = () => {
  indexMjs.dashboard.style.display = "block";
  indexMjs.salesDiv.innerHTML = "";
  indexMjs.wastageDiv.innerHTML = "";
  indexMjs.percentageDiv.innerHTML = "";
  indexMjs.vsbudgetDiv.innerHTML = "";
  indexMjs.salesBudgetDiv.innerHTML = "";
  indexMjs.inventoryDayDiv.innerHTML = "";
  apiCallsMjs.loadWastePercentage().then((data) => {
    const totalSalesdata = data.totalsales;
    const averageSales = data.Avg_Sales;
    const vsBudget = data.vsbudget + "%";
    const percentage = data.percentage + "%";
    const salesBudget = data.totalsalesbudget;
    // const inventory = data.DaysSince;
    const span = document.createElement("span");
    const span2 = document.createElement("span");
    const span3 = document.createElement("span");
    const span4 = document.createElement("span");
    const span5 = document.createElement("span");
    // const span6 = document.createElement("span");
    span.innerHTML = totalSalesdata;
    indexMjs.salesDiv.appendChild(span);
    span2.innerHTML = averageSales;
    indexMjs.wastageDiv.appendChild(span2);
    span3.innerHTML = percentage;
    indexMjs.percentageDiv.appendChild(span3);
    span4.innerHTML = vsBudget;
    indexMjs.vsbudgetDiv.appendChild(span4);
    span5.innerHTML = salesBudget;
    indexMjs.salesBudgetDiv.appendChild(span5);
    // span6.innerHTML = inventory;
    // indexMjs.inventoryDayDiv.appendChild(span6);
  });
  apiCallsMjs.loadKvi().then((data) => {
    const kvi = data.kvi_percentage + "%";
    const span = document.createElement("span");
    span.innerHTML = kvi;
    indexMjs.inventoryDayDiv.appendChild(span);
  });
};

// function to be called when write off button is clicked
export const writeOff = () => {
  indexMjs.searchHistory.style.display = "none";
  indexMjs.searchDiv3.style.display = "block";
  indexMjs.printBtnDiv.style.display = "flex";
  indexMjs.printBtnDiv.innerHTML = `
    <div class="print-btn-container">
     <a href="http://127.0.0.1:8080/writeoff_csv" class="download-btn">
        <button class="print-btn">
          <i class="fa-solid fa-print"></i> Print Report
        </button></a>
    </div>
`;
  indexMjs.table.innerHTML = "";
  const theaderRow = ["Item No", "Description", "Qty", "Totals"];
  indexMjs.createThead(theaderRow);
  apiCallsMjs.loadWriteOff().then((data) => {
    for (const item of data) {
      indexMjs.createRow([
        item.ItemNo,
        item.Description,
        item.QtyPCs,
        item.TotalPrice,
      ]);
      if (item.ItemNo === "TOTAL") {
        document.querySelector(".table-row").style.fontWeight = "700";
        document.querySelector(".table-row").style.fontSize = "18px";
        document.querySelector(".table-row").style.color = "red";
      }
    }
  });
};
// function to be called when high value button is clicked
export const highValueReport = () => {
  indexMjs.searchHistory.style.display = "none";
  indexMjs.searchDiv3.style.display = "block";
  indexMjs.printBtnDiv.style.display = "flex";
  indexMjs.table.innerHTML = "";
  const theaderRow = [
    "Item No",
    "Description",
    "Opening",
    "Dry",
    "Write Off",
    "RTW",
    "Inter Store",
    "Sales",
    "Physical",
    "Value",
  ];
  indexMjs.createThead(theaderRow);
  apiCallsMjs.loadHighValue().then((data) => {
    for (const item of data) {
      indexMjs.createRow([
        item.ItemNo,
        item.Description,
        item.Opening,
        item.Dry,
        item.write_off,
        item.rtw_qty,
        item.inter_store_qty,
        item.Sales,
        item.physical_qty,
        item.value,
      ]);
    }
  });
};

// function to be called when missing availability button is clicked
export const missingAvailiabilityReport = () => {
  indexMjs.searchHistory.style.display = "none";
  indexMjs.searchDiv3.style.display = "block";
  indexMjs.printBtnDiv.style.display = "flex";
  indexMjs.printBtnDiv.innerHTML = `
    <div class="print-btn-container">
     <a href="http://127.0.0.1:8080/missing_availability_csv" class="download-btn">
        <button class="print-btn">
          <i class="fa-solid fa-print"></i> Print Report
        </button></a>
    </div>
`;
  indexMjs.table.innerHTML = "";
  const theaderRow = ["Item No", "Description", "Category", "VPE", "Stock"];
  indexMjs.createThead(theaderRow);
  apiCallsMjs.loadMissingAvailiability().then((data) => {
    for (const item of data) {
      indexMjs.createRow([
        item.ItemNo,
        item.Description,
        item.ItemCategory,
        item.PcsPerCarton,
        item.stock,
      ]);
    }
  });
};
