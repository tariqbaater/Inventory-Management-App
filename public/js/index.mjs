// *********** IMPORTS ***********
import * as searchAllProductsMjs from "./searchAllProducts.mjs";
import { login, logout, fetchCurrentUser, createUserApi, deleteUserApi } from "./apiCalls.mjs";

// *********** VARIABLES ***********
const docTitle = document.title;
const modal = document.querySelector("#modal-container");
const loginBtn = document.querySelector("#login-button");
const logOutBtn = document.querySelector("#logout-button");
const navbar = document.querySelector(".navbar");
export const table = document.querySelector(".table");
export const searchHistBox = document.querySelector("#search-history");
const searchHistBtn = document.querySelector("#search-button");
export const dashboard = document.querySelector(".dashboard-container");
export const salesDiv = document.querySelector("#sales-report");
export const wastageDiv = document.querySelector("#average-sales");
export const percentageDiv = document.querySelector("#percentage-report");
export const vsbudgetDiv = document.querySelector("#vs-budget");
export const salesBudgetDiv = document.querySelector("#sales-budget");
export const inventoryDayDiv = document.querySelector("#inventory-day");
export const searchHistory = document.querySelector(".search-bar");
export const searchDiv2 = document.querySelector(".search-bar2");
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
export const paginationControls = document.querySelector("#pagination-controls");
export const prevPageBtn = document.querySelector("#prev-page");
export const nextPageBtn = document.querySelector("#next-page");
export const pageInfo = document.querySelector("#page-info");
export const noResults = document.querySelector("#no-results");
const userInfoSpan = document.querySelector("#user-info");
const userManagementBtn = document.querySelector("#user-management");
export const userFormContainer = document.querySelector("#user-form-container");
const createUserForm = document.querySelector("#create-user-form");

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

// function for creating a single row element (does not append to DOM)
const buildRow = (rowData) => {
    const tr = document.createElement("tr");
    tr.className = "table-row";
    for (const item of rowData) {
        const td = document.createElement("td");
        td.textContent = item;
        td.className = "table-data";
        tr.appendChild(td);
    }
    return tr;
};

// batch-create rows using DocumentFragment (single DOM reflow)
export const createRows = (allRowData) => {
    let tbody = table.querySelector("tbody");
    if (!tbody) {
        tbody = document.createElement("tbody");
        table.appendChild(tbody);
    }
    const fragment = document.createDocumentFragment();
    for (const rowData of allRowData) {
        fragment.appendChild(buildRow(rowData));
    }
    tbody.appendChild(fragment);
};

// single-row helper (kept for backwards compatibility)
export const createRow = (rowData) => {
    createRows([rowData]);
};

// Fetch and display current user info in navbar
async function populateUserInfo() {
    const user = await fetchCurrentUser();
    if (user) {
        const storeLabel = user.storeId ? ` | Store: ${user.storeId}` : '';
        userInfoSpan.textContent = `${user.username}${storeLabel}`;
        userManagementBtn.style.display = user.isAdmin ? '' : 'none';
    }
}

// Helper to show the login modal and hide app content
function showLoginModal() {
    modal.style.display = "block";
    navbar.style.display = "none";
    dashboard.style.display = "none";
    printBtnDiv.style.display = "none";
    searchDiv3.style.display = "none";
    searchDiv2.style.display = "none";
    searchHistory.style.display = "none";
    userFormContainer.style.display = "none";
    paginationControls.style.display = "none";
    noResults.style.display = "none";
    table.innerHTML = "";
    userInfoSpan.textContent = "";
    userManagementBtn.style.display = "none";
}

// Helper to show the app after successful auth
async function showApp() {
    modal.style.display = "none";
    navbar.style.display = "block";
    await populateUserInfo();
    searchAllProductsMjs.dashBoard();
}

//*********** EVENT LISTENERS *************

// Listen for 401 responses — show login modal
window.addEventListener('auth:required', () => {
    showLoginModal();
});

window.onload = () => {
    // Hide everything initially
    navbar.style.display = "none";
    dashboard.style.display = "none";
    printBtnDiv.style.display = "none";
    searchDiv3.style.display = "none";
    searchDiv2.style.display = "none";
    searchHistory.style.display = "none";
    userFormContainer.style.display = "none";
    paginationControls.style.display = "none";
    noResults.style.display = "none";
    table.innerHTML = "";
    modal.style.display = "none";

    // Try loading dashboard — if session is valid it works,
    // if not the 401 handler will show the login modal
    searchAllProductsMjs.dashBoard().then(() => {
        navbar.style.display = "block";
        populateUserInfo();
    }).catch(() => {
        // 401 handler already shows modal
    });
};

// listen for login button
loginBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;
    try {
        await login(username, password);
        showApp();
    } catch (err) {
        alert(err.message || "Invalid credentials");
    }
});

// listen for logout button
logOutBtn.addEventListener("click", async () => {
    await logout();
    showLoginModal();
});

// listen for the all products button to load all products
allProductsBtn.addEventListener("click", () => {
    paginationControls.style.display = "none";
    noResults.style.display = "none";
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
searchHistBox.addEventListener("keydown", function(e) {
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
    searchDiv2.style.display = "none";
    printBtnDiv.style.display = "none";
    userFormContainer.style.display = "none";
    paginationControls.style.display = "none";
    noResults.style.display = "none";
    table.innerHTML = "";
    searchAllProductsMjs.dashBoard();
});

//listen for item history button
itemHistoryBtn.addEventListener("click", () => {
    searchHistory.style.display = "block";
    dashboard.style.display = "none";
    searchDiv3.style.display = "none";
    searchDiv2.style.display = "none";
    printBtnDiv.style.display = "none";
    userFormContainer.style.display = "none";
    paginationControls.style.display = "none";
    noResults.style.display = "none";
    table.innerHTML = "";
    if (searchHistBox.value.length > 0) {
        searchAllProductsMjs.itemHistoryTableData(searchHistBox.value);
    }
});

// listen for wh deliveries button
whDeliveriesBtn.addEventListener("click", () => {
    searchHistory.style.display = "block";
    dashboard.style.display = "none";
    paginationControls.style.display = "none";
    noResults.style.display = "none";
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
    paginationControls.style.display = "none";
    noResults.style.display = "none";
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
    paginationControls.style.display = "none";
    noResults.style.display = "none";
    table.innerHTML = "";
    if (searchHistBox.value.length > 0) {
        searchAllProductsMjs.salesHistoryTableData(searchHistBox.value);
    } else {
        alert("Please enter an item number");
    }
});

// listen for write off button
writeOffBtn.addEventListener("click", () => {
    paginationControls.style.display = "none";
    noResults.style.display = "none";
    searchAllProductsMjs.writeOff();
});

// listen for high value button
highValueBtn.addEventListener("click", () => {
    paginationControls.style.display = "none";
    noResults.style.display = "none";
    searchAllProductsMjs.highValueReport();
});

// listen for the search-live input (debounced 300ms, server-side search)
let searchTimeout;
searchLiveBox.addEventListener("input", (event) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const value = event.target.value.trim();
        searchAllProductsMjs.searchCurrentView(value);
    }, 300);
});

// listen for missing availability button
missingAvailiabilityBtn.addEventListener("click", () => {
    paginationControls.style.display = "none";
    noResults.style.display = "none";
    searchAllProductsMjs.missingAvailiabilityReport();
});

// listen for user management button
userManagementBtn.addEventListener("click", () => {
    dashboard.style.display = "none";
    searchHistory.style.display = "none";
    searchDiv3.style.display = "none";
    searchDiv2.style.display = "none";
    printBtnDiv.style.display = "none";
    paginationControls.style.display = "none";
    noResults.style.display = "none";
    table.innerHTML = "";
    searchAllProductsMjs.userManagement();
});

// listen for create user form submission
createUserForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.querySelector("#new-username").value.trim();
    const password = document.querySelector("#new-password").value;
    const storeId = document.querySelector("#new-store-id").value.trim();
    const isAdmin = document.querySelector("#new-is-admin").checked;
    try {
        await createUserApi(username, password, isAdmin, storeId);
        createUserForm.reset();
        searchAllProductsMjs.userManagement();
    } catch (err) {
        alert(err.message);
    }
});

// delegated click handler for delete buttons in user table
document.querySelector(".table").addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-btn")) {
        const userId = e.target.dataset.userId;
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            await deleteUserApi(userId);
            searchAllProductsMjs.userManagement();
        } catch (err) {
            alert(err.message);
        }
    }
});

// listen for pagination buttons
prevPageBtn.addEventListener("click", () => {
    searchAllProductsMjs.navigatePage(-1);
});
nextPageBtn.addEventListener("click", () => {
    searchAllProductsMjs.navigatePage(1);
});

// listen for tab change
window.addEventListener("blur", () => {
    document.title = "Come back!\u{1F601}";
});
window.addEventListener("focus", () => {
    document.title = docTitle;
});
