import * as apiCallsMjs from "./apiCalls.mjs";
import * as indexMjs from "./index.mjs";

// *********** PAGINATION STATE ***********
let currentPage = 1;
let currentLimit = 50;
let currentViewFn = null;

function updatePagination(total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  indexMjs.pageInfo.textContent = `Page ${page} of ${totalPages}`;
  indexMjs.prevPageBtn.disabled = page <= 1;
  indexMjs.nextPageBtn.disabled = page >= totalPages;
  indexMjs.paginationControls.style.display = totalPages > 1 ? 'flex' : 'none';
}

export function navigatePage(delta) {
  if (currentViewFn) {
    currentViewFn(currentPage + delta);
  }
}

// *********** DATA FUNCTIONS ***********
// function to be called when search/item history button is clicked
export const itemHistoryTableData = () => {
  indexMjs.searchHistory.style.display = "block";
  indexMjs.searchDiv3.style.display = "none";
  indexMjs.paginationControls.style.display = "none";
  indexMjs.noResults.style.display = "none";
  indexMjs.table.innerHTML = "";
  const theaderRow = ["Item No", "Description", "Qty", "Date"];
  indexMjs.createThead(theaderRow);
  apiCallsMjs.historyData(indexMjs.searchHistBox.value).then((data) => {
    if (!data || data.length === 0) {
      indexMjs.noResults.style.display = "block";
      return;
    }
    indexMjs.createRows(data.map(item => [
      item.ItemNo,
      item.Description,
      item.QtyPCs,
      item.Date ? item.Date.substring(0, 10) : '',
    ]));
  });
};
// function to be called when search/wh deliveries button is clicked
export const whDeliveriesTableData = () => {
  indexMjs.paginationControls.style.display = "none";
  indexMjs.noResults.style.display = "none";
  indexMjs.table.innerHTML = "";
  const theaderRow = ["Item No", "Description", "Qty", "Date"];
  indexMjs.createThead(theaderRow);
  apiCallsMjs.deliveryData(indexMjs.searchHistBox.value).then((data) => {
    if (!data || data.length === 0) {
      indexMjs.noResults.style.display = "block";
      return;
    }
    indexMjs.createRows(data.map(item => [
      item.ItemNo,
      item.Description,
      item.QtyPCs,
      item.Date.substring(0, 10),
    ]));
  });
};
// function to be called when search/dsd deliveries button is clicked
export const dsdDeliveriesTableData = () => {
  indexMjs.paginationControls.style.display = "none";
  indexMjs.noResults.style.display = "none";
  indexMjs.table.innerHTML = "";
  const theaderRow = ["Item No", "Description", "Qty", "Date"];
  indexMjs.createThead(theaderRow);
  apiCallsMjs.dsdDelivery(indexMjs.searchHistBox.value).then((data) => {
    if (!data || data.length === 0) {
      indexMjs.noResults.style.display = "block";
      return;
    }
    indexMjs.createRows(data.map(item => [
      item.ItemNo,
      item.Description,
      item.Qty,
      item.Date.substring(0, 10),
    ]));
  });
};
// function to be called when search/sales history button is clicked
export const salesHistoryTableData = () => {
  indexMjs.paginationControls.style.display = "none";
  indexMjs.noResults.style.display = "none";
  indexMjs.table.innerHTML = "";
  const theaderRow = ["Item No", "Description", "Qty", "Date"];
  indexMjs.createThead(theaderRow);
  apiCallsMjs.salesHistory(indexMjs.searchHistBox.value).then((data) => {
    if (!data || data.length === 0) {
      indexMjs.noResults.style.display = "block";
      return;
    }
    indexMjs.createRows(data.map(item => [
      item.ItemNo,
      item.Description,
      item.Qty,
      item.Date ? item.Date.substring(0, 10) : '',
    ]));
  });
};
// function to be called when all products button is clicked
export const searchAllProducts = (page = 1) => {
  currentPage = page;
  currentViewFn = searchAllProducts;
  indexMjs.searchHistory.style.display = "none";
  indexMjs.searchDiv3.style.display = "block";
  indexMjs.searchDiv2.style.display = "none";
  indexMjs.printBtnDiv.style.display = "none";
  indexMjs.dashboard.style.display = "none";
  indexMjs.userFormContainer.style.display = "none";
  indexMjs.noResults.style.display = "none";
  indexMjs.table.innerHTML = "";
  const theaderRow = ["Item No", "Description", "Barcode"];
  indexMjs.createThead(theaderRow);
  apiCallsMjs.loadData(page, currentLimit).then((result) => {
    if (!result.data || result.data.length === 0) {
      indexMjs.noResults.style.display = "block";
      indexMjs.paginationControls.style.display = "none";
      return;
    }
    indexMjs.createRows(result.data.map(item => [item.ItemNo, item.Description, item.Barcode]));
    updatePagination(result.total, result.page, result.limit);
  });
};

// function to be called when dashboard button is clicked
export const dashBoard = () => {
  indexMjs.paginationControls.style.display = "none";
  indexMjs.noResults.style.display = "none";
  indexMjs.dashboard.style.display = "block";
  indexMjs.salesDiv.innerHTML = "";
  indexMjs.wastageDiv.innerHTML = "";
  indexMjs.percentageDiv.innerHTML = "";
  indexMjs.vsbudgetDiv.innerHTML = "";
  indexMjs.salesBudgetDiv.innerHTML = "";
  indexMjs.inventoryDayDiv.innerHTML = "";
  const wastePromise = apiCallsMjs.loadWastePercentage().then((data) => {
    const totalSalesdata = data.totalsales.toLocaleString();
    const averageSales = data.Avg_Sales.toLocaleString();
    const vsBudget = data.vsbudget + "%";
    const percentage = data.percentage + "%";
    const salesBudget = data.totalsalesbudget.toLocaleString();

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
  const kviPromise = apiCallsMjs.loadKvi().then((data) => {
    const kvi = data.kvi_percentage + "%";
    const span = document.createElement("span");
    span.innerHTML = kvi;
    indexMjs.inventoryDayDiv.appendChild(span);
  });
  return Promise.all([wastePromise, kviPromise]);
};

// function to be called when write off button is clicked
export const writeOff = (page = 1) => {
  currentPage = page;
  currentViewFn = writeOff;
  indexMjs.searchHistory.style.display = "none";
  indexMjs.searchDiv3.style.display = "block";
  indexMjs.searchDiv2.style.display = "none";
  indexMjs.dashboard.style.display = "none";
  indexMjs.userFormContainer.style.display = "none";
  indexMjs.noResults.style.display = "none";
  indexMjs.printBtnDiv.style.display = "flex";
  indexMjs.printBtnDiv.innerHTML = `
    <div class="print-btn-container">
     <a href="/api/v1/writeoff_csv" class="download-btn">
        <button class="print-btn">
          <i class="fa-solid fa-print"></i> Print Report
        </button></a>
    </div>
`;
  indexMjs.table.innerHTML = "";
  const theaderRow = ["Item No", "Description", "Qty", "Totals"];
  indexMjs.createThead(theaderRow);
  apiCallsMjs.loadWriteOff(page, currentLimit).then((result) => {
    if (!result.data || result.data.length === 0) {
      indexMjs.noResults.style.display = "block";
      indexMjs.paginationControls.style.display = "none";
      return;
    }
    indexMjs.createRows(result.data.map(item => [
      item.ItemNo,
      item.Description,
      item.QtyPCs,
      item.TotalPrice,
    ]));
    updatePagination(result.total, result.page, result.limit);
  });
};
// function to be called when high value button is clicked
export const highValueReport = (page = 1) => {
  currentPage = page;
  currentViewFn = highValueReport;
  indexMjs.searchHistory.style.display = "none";
  indexMjs.searchDiv3.style.display = "block";
  indexMjs.searchDiv2.style.display = "none";
  indexMjs.dashboard.style.display = "none";
  indexMjs.userFormContainer.style.display = "none";
  indexMjs.noResults.style.display = "none";
  indexMjs.printBtnDiv.style.display = "flex";
  indexMjs.printBtnDiv.innerHTML = `
        <div class="print-btn-container">
     <a href="/api/v1/high_value_csv" class="download-btn">
        <button class="print-btn">
          <i class="fa-solid fa-print"></i> Print Report
        </button></a>
    </div>

    `;
  indexMjs.table.innerHTML = "";
  const theaderRow = ["Item No", "Description", "Qty", "Value"];
  indexMjs.createThead(theaderRow);
  apiCallsMjs.loadHighValue(page, currentLimit).then((result) => {
    if (!result.data || result.data.length === 0) {
      indexMjs.noResults.style.display = "block";
      indexMjs.paginationControls.style.display = "none";
      return;
    }
    indexMjs.createRows(result.data.map(item => [
      item.ItemNo,
      item.Description,
      item.Qty,
      item.value,
    ]));
    updatePagination(result.total, result.page, result.limit);
  });
};

// function to be called when user management button is clicked
export const userManagement = () => {
  indexMjs.searchHistory.style.display = "none";
  indexMjs.searchDiv3.style.display = "none";
  indexMjs.searchDiv2.style.display = "none";
  indexMjs.printBtnDiv.style.display = "none";
  indexMjs.dashboard.style.display = "none";
  indexMjs.paginationControls.style.display = "none";
  indexMjs.noResults.style.display = "none";
  indexMjs.userFormContainer.style.display = "block";
  indexMjs.table.innerHTML = "";
  const theaderRow = ["Username", "Store ID", "Admin", "Created", "Actions"];
  indexMjs.createThead(theaderRow);
  apiCallsMjs.loadUsers().then((data) => {
    if (!data || data.length === 0) {
      indexMjs.noResults.style.display = "block";
      return;
    }
    let tbody = indexMjs.table.querySelector("tbody");
    if (!tbody) {
      tbody = document.createElement("tbody");
      indexMjs.table.appendChild(tbody);
    }
    const fragment = document.createDocumentFragment();
    for (const user of data) {
      const tr = document.createElement("tr");
      tr.className = "table-row";

      const cells = [
        user.username,
        user.store_id || '-',
        user.is_admin ? 'Yes' : 'No',
        user.created_at ? new Date(user.created_at).toLocaleDateString() : '-',
      ];

      for (const val of cells) {
        const td = document.createElement("td");
        td.className = "table-data";
        td.textContent = val;
        tr.appendChild(td);
      }

      const actionTd = document.createElement("td");
      actionTd.className = "table-data";
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "Delete";
      deleteBtn.dataset.userId = user.id;
      actionTd.appendChild(deleteBtn);
      tr.appendChild(actionTd);

      fragment.appendChild(tr);
    }
    tbody.appendChild(fragment);
  });
};

// function to be called when missing availability button is clicked
export const missingAvailiabilityReport = (page = 1) => {
  currentPage = page;
  currentViewFn = missingAvailiabilityReport;
  indexMjs.searchHistory.style.display = "none";
  indexMjs.searchDiv3.style.display = "block";
  indexMjs.searchDiv2.style.display = "none";
  indexMjs.dashboard.style.display = "none";
  indexMjs.userFormContainer.style.display = "none";
  indexMjs.noResults.style.display = "none";
  indexMjs.printBtnDiv.style.display = "flex";
  indexMjs.printBtnDiv.innerHTML = `
    <div class="print-btn-container">
     <a href="/api/v1/missing_availability_csv" class="download-btn">
        <button class="print-btn">
          <i class="fa-solid fa-print"></i> Print Report
        </button></a>
    </div>
`;
  indexMjs.table.innerHTML = "";
  const theaderRow = ["Item No", "Description", "Stock"];
  indexMjs.createThead(theaderRow);
  apiCallsMjs.loadMissingAvailability(page, currentLimit).then((result) => {
    if (!result.data || result.data.length === 0) {
      indexMjs.noResults.style.display = "block";
      indexMjs.paginationControls.style.display = "none";
      return;
    }
    indexMjs.createRows(result.data.map(item => [item.ItemNo, item.Description, item.stock]));
    updatePagination(result.total, result.page, result.limit);
  });
};
