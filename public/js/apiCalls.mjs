//*********** API *************
// read history data from db api
export async function historyData(id) {
  const response = await fetch(
    `https://cfmo8g9ssz.sqlite.cloud:8090/v2/functions/item_history?id=${id}`,
  );
  const data = await response.json();
  return data.data;
}
// read dry_delivery data from db api
export const deliveryData = async (id) => {
  const response = await fetch(
    `https://cfmo8g9ssz.sqlite.cloud:8090/v2/functions/wh_delivery?id=${id}`,
  );
  const data = await response.json();
  return data.data;
};

// read dsd_delivery data from db api
export const dsdDelivery = async (id) => {
  const response = await fetch(
    `https://cfmo8g9ssz.sqlite.cloud:8090/v2/functions/dsd_deliveries?id=${id}`,
  );
  const data = await response.json();
  return data.data;
};

// read sales history data from db api
export const salesHistory = async (id) => {
  const response = await fetch(
    `https://cfmo8g9ssz.sqlite.cloud:8090/v2/functions/sales_history?id=${id}`,
  );
  const data = await response.json();
  return data.data;
};

// read search data from db api
export const loadData = async () => {
  const response = await fetch(
    `https://cfmo8g9ssz.sqlite.cloud:8090/v2/functions/search_products`,
  );
  const data = await response.json();
  return data.data;
};

// read top products data from db api
export const loadKvi = async () => {
  const response = await fetch(
    `https://cfmo8g9ssz.sqlite.cloud:8090/v2/functions/kvi`,
  );
  const data = await response.json();
  return data.data[0];
};

// read total sales data from db api
export const loadWastePercentage = async () => {
  const response = await fetch(
    `https://cfmo8g9ssz.sqlite.cloud:8090/v2/functions/waste_percentage`,
  );
  const data = await response.json();
  return data.data[0];
};

// read writeoff data from db api
export const loadWriteOff = async () => {
  const response = await fetch(
    `https://cfmo8g9ssz.sqlite.cloud:8090/v2/functions/write_off`,
  );
  const data = await response.json();
  return data.data;
};
// read high value data from db api
export const loadHighValue = async () => {
  const response = await fetch(
    `https://cfmo8g9ssz.sqlite.cloud:8090/v2/functions/high_value`,
  );
  const data = await response.json();
  return data.data;
};

// read missing availiability data from db api
export const loadMissingAvailiability = async () => {
  const response = await fetch(
    `https://cfmo8g9ssz.sqlite.cloud:8090/v2/functions/high_value`,
  );
  const data = await response.json();
  return data.data;
};
