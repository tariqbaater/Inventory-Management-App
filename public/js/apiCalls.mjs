
//*********** API *************
// Base URL for the API
const BASE_URL = 'https://cfmo8g9ssz.sqlite.cloud:8090/v2/functions';

// Show/hide the loading indicator during API calls
let loaderRequestCount = 0;
const showLoader = () => {
  loaderRequestCount++;
  const loader = document.getElementById('loading-indicator');
  if (loader && loaderRequestCount > 0) loader.style.display = 'flex';
};
const hideLoader = () => {
  loaderRequestCount = Math.max(loaderRequestCount - 1, 0);
  const loader = document.getElementById('loading-indicator');
  if (loader && loaderRequestCount === 0) loader.style.display = 'none';
};

// Generic function to fetch data from the API
const showError = (msg) => {
  const errDiv = document.getElementById('api-error-message');
  if (errDiv) {
    errDiv.textContent = msg;
    errDiv.style.display = 'block';
    setTimeout(() => {
      errDiv.style.display = 'none';
    }, 4000);
  }
};

const fetchData = async (endpoint, params = '') => {
  showLoader();
  try {
    const response = await fetch(`${BASE_URL}/${endpoint}${params}`);
    if (!response.ok) {
      showError(`API Error: ${response.status} ${response.statusText}`);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (!data || (!data.data && data.error)) {
      showError(data.error ? `API error: ${data.error}` : 'API error: invalid data');
      throw new Error(data.error ? data.error : 'Invalid API response');
    }
    return data.data;
  } catch (err) {
    showError(err.message || 'Unknown error');
    throw err;
  } finally {
    hideLoader();
  }
};

// Read history data from db api
export const historyData = (id) => fetchData('item_history', `?id=${id}`);

// Read dry delivery data from db api
export const deliveryData = (id) => fetchData('wh_delivery', `?id=${id}`);

// Read DSD delivery data from db api
export const dsdDelivery = (id) => fetchData('dsd_deliveries', `?id=${id}`);

// Read sales history data from db api
export const salesHistory = (id) => fetchData('sales_history', `?id=${id}`);

// Read search data from db api
export const loadData = () => fetchData('search_products');

// Read top products data from db api
export const loadKvi = () => fetchData('kvi').then(data => data[0]);

// Read total sales data from db api
export const loadWastePercentage = () => fetchData('waste_percentage').then(data => data[0]);

// Read write-off data from db api
export const loadWriteOff = () => fetchData('write_off');

// Read high value data from db api
export const loadHighValue = () => fetchData('high_value');

// Read missing availability data from db api
export const loadMissingAvailability = () => fetchData('missing_availability');
