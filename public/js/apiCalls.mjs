
//*********** API *************
// Base URL for the API
const BASE_URL = 'https://cfmo8g9ssz.sqlite.cloud:8090/v2/functions';

// Generic function to fetch data from the API
const fetchData = async (endpoint, params = '') => {
  const response = await fetch(`${BASE_URL}/${endpoint}${params}`);
  const data = await response.json();
  return data.data;
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
