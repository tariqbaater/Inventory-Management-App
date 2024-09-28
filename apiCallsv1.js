
// Configuration for the API base URL and function endpoints
const apiBaseUrl = 'https://cfmo8g9ssz.sqlite.cloud:8090/v2/functions/';
const endpoints = {
    history: 'item_history',
    dryDelivery: 'wh_delivery',
    dsdDelivery: 'dsd_deliveries',
    salesHistory: 'sales_history',
    searchProducts: 'search_products',
    kvi: 'kvi',
    wastePercentage: 'waste_percentage',
    writeOff: 'write_off',
    highValue: 'high_value',
    missingAvailability: 'missing_availability',
};

// Helper function to make API calls
async function fetchData(endpoint, id) {
    const url = `${apiBaseUrl}${endpoint}${id ? `?id=${id}` : ''}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.data;
}

console.log(fetchData(endpoints.history, 1));

// // Exported functions for API data retrieval
// export const historyData = async (id) => await fetchData(endpoints.history, id);
// export const deliveryData = async (id) => await fetchData(endpoints.dryDelivery, id);
// export const dsdDelivery = async (id) => await fetchData(endpoints.dsdDelivery, id);
// export const salesHistory = async (id) => await fetchData(endpoints.salesHistory, id);
// export const loadData = async () => await fetchData(endpoints.searchProducts);
// export const loadKvi = async () => {
//     const data = await fetchData(endpoints.kvi);
//     return data[0]; // Assuming only one KVI record is expected
// };
// export const loadWastePercentage = async () => {
//     const data = await fetchData(endpoints.wastePercentage);
//     return data[0]; // Assuming only one waste percentage record is expected
// };
// export const loadWriteOff = async () => await fetchData(endpoints.writeOff);
// export const loadHighValue = async () => await fetchData(endpoints.highValue);
// export const loadMissingAvailiability = async () => await fetchData(endpoints.missingAvailability);
//
