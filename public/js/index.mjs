// *********** IMPORTS ***********
import * as searchAllProductsMjs from "./searchAllProducts.mjs";

// *********** VARIABLES ***********
const docTitle = document.title;
const modal = document.querySelector("#modal-container");
const loginBtn = document.querySelector("#login-button");
const logOutBtn = document.querySelector("#logout-button");
const navbar = document.querySelector(".navbar");
export const table = document.querySelector(".table");
export const searchHistBox = document.querySelector("#search-history");
const searchHistBtn = document.querySelector(".search-button");
export const dashboard = document.querySelector(".dashboard-container");
export const salesDiv = document.querySelector("#sales-report");
export const wastageDiv = document.querySelector("#average-sales");
export const percentageDiv = document.querySelector("#percentage-report");
export const vsbudgetDiv = document.querySelector("#vs-budget");
export const salesBudgetDiv = document.querySelector("#sales-budget");
export const inventoryDayDiv = document.querySelector("#inventory-day");
export const searchHistory = document.querySelector(".search-bar");
export const searchDiv3 = document.querySelector(".search-bar3");
export const searchName = document.querySelector(".search-name");
const searchLiveBox = document.querySelector(".search-live");
const whDeliveriesBtn = document.querySelector("#wh-deliveries");
const dsdDeliveriesBtn = document.querySelector("#dsd-deliveries");
const salesHistoryBtn = document.querySelector("#sales-history");
const dashboardBtn = document.querySelector("#dashboard");
const itemHistoryBtn = document.querySelector("#item-history");
const allProductsBtn = document.querySelector("#all-products");
const writeOffBtn = document.querySelector("#write-off");
const highValueBtn = document.querySelector("#high-value");
const missingAvailiabilityBtn = document.querySelector("#missing-availability");
export const printBtnDiv = document.querySelector(".print-btn-container");

// *********** FUNCTIONS ***********
// function for creating dynamic th rows
export const createThead = (data) => {
  const thead = document.createElement("thead");
  const tr = document.createElement("tr");
  table.appendChild(thead);
  thead.appendChild(tr);
  for (const item of data) {
    const th = document.createElement("th");
    th.textContent = item;
    tr.appendChild(th);
  }
};

// function for creating rows with data
export const createRow = (rowData) => {
  // Check if tbody already exists, if not, create one
  let tbody = document.querySelector("tbody");
  if (!tbody) {
    tbody = document.createElement("tbody");
    table.appendChild(tbody);
  }

  const tr = document.createElement("tr");
  tr.className = "table-row";

  for (const item of rowData) {
    const td = document.createElement("td");
    td.textContent = item;
    td.className = "table-data";
    tr.appendChild(td);
  }

  // Append the row to the tbody
  tbody.appendChild(tr);
};

//*********** EVENT LISTENERS *************
window.onload = () => {
  navbar.style.display = "none";
  dashboard.style.display = "none";
  printBtnDiv.style.display = "none";
  searchDiv3.style.display = "none";
  searchHistory.style.display = "none";
  table.innerHTML = "";
  // check if user is logged in
  if (localStorage.getItem("loggedIn") === "true") {
    navbar.style.display = "block";
    modal.style.display = "none";
    searchAllProductsMjs.dashBoard();
  } else {
    modal.style.display = "block";
  }
};

// listen for login button
loginBtn.addEventListener("click", () => {
  // check if credentials are correct then set local storage to true
  if (
    document.querySelector("#username").value === "admin" &&
    document.querySelector("#password").value === "admin"
  ) {
    localStorage.setItem("loggedIn", true);
    window.location.reload();
    modal.style.display = "none";
  } else {
    alert("Invalid credentials");
  }
});

// listen for logout button
logOutBtn.addEventListener("click", () => {
  localStorage.setItem("loggedIn", false);
  window.location.reload();
});

// listen for the all products button to load all products
allProductsBtn.addEventListener("click", () => {
  searchHistory.style.display = "none";
  searchDiv3.style.display = "block";
  printBtnDiv.style.display = "none";
  dashboard.style.display = "none";
  table.innerHTML = "";
  searchAllProductsMjs.searchAllProducts();
});

// read main_sheet da// listen for search button on history data
searchHistBtn.addEventListener("click", () => {
  if (searchHistBox.value.length > 0) {
    searchAllProductsMjs.itemHistoryTableData(searchHistBox.value);
  } else {
    alert("Please enter an item number");
  }
});
// listen for enter button on history data
searchHistBox.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    if (searchHistBox.value.length > 0) {
      searchAllProductsMjs.itemHistoryTableData(searchHistBox.value);
    } else {
      alert("Please enter an item number");
    }
  }
});

//listen for dashboard button
dashboardBtn.addEventListener("click", () => {
  dashboard.style.display = "block";
  searchHistory.style.display = "none";
  searchDiv3.style.display = "none";
  printBtnDiv.style.display = "none";
  table.innerHTML = "";
  searchAllProductsMjs.dashBoard();
});

//listen for item history button
itemHistoryBtn.addEventListener("click", () => {
  searchHistory.style.display = "block";
  dashboard.style.display = "none";
  searchDiv3.style.display = "none";
  printBtnDiv.style.display = "none";
  table.innerHTML = "";
  if (searchHistBox.value.length > 0) {
    searchAllProductsMjs.itemHistoryTableData(searchHistBox.value);
  }
});

// listen for wh deliveries button
whDeliveriesBtn.addEventListener("click", () => {
  searchHistory.style.display = "block";
  dashboard.style.display = "none";
  table.innerHTML = "";
  if (searchHistBox.value.length > 0) {
    searchAllProductsMjs.whDeliveriesTableData(searchHistBox.value);
  } else {
    alert("Please enter an item number");
  }
});

// listen for dsd deliveries button
dsdDeliveriesBtn.addEventListener("click", () => {
  searchHistory.style.display = "block";
  dashboard.style.display = "none";
  table.innerHTML = "";
  if (searchHistBox.value.length > 0) {
    searchAllProductsMjs.dsdDeliveriesTableData(searchHistBox.value);
  } else {
    alert("Please enter an item number");
  }
});

// listen for sales history button
salesHistoryBtn.addEventListener("click", () => {
  searchHistory.style.display = "block";
  dashboard.style.display = "none";
  table.innerHTML = "";
  if (searchHistBox.value.length > 0) {
    searchAllProductsMjs.salesHistoryTableData(searchHistBox.value);
  } else {
    alert("Please enter an item number");
  }
});

// listen for write off button
writeOffBtn.addEventListener("click", () => {
  dashboard.style.display = "none";
  searchAllProductsMjs.writeOff();
});

// listen for high value button
highValueBtn.addEventListener("click", () => {
  dashboard.style.display = "none";
  searchAllProductsMjs.highValueReport();
});

// listen for the search-live input
searchLiveBox.addEventListener("input", (event) => {
  const value = event.target.value;
  const filteredRows = table.querySelectorAll("tbody tr");
  filteredRows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    let found = false;
    cells.forEach((cell) => {
      if (cell.textContent.toLowerCase().includes(value.toLowerCase())) {
        found = true;
      }
    });
    if (found) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
});

// listen for missing availability button
missingAvailiabilityBtn.addEventListener("click", () => {
  dashboard.style.display = "none";
  searchAllProductsMjs.missingAvailiabilityReport();
});

// listen for tab change
window.addEventListener("blur", () => {
  document.title = "Come back!😁";
});
window.addEventListener("focus", () => {
  document.title = docTitle;
});
