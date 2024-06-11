async function test() {
  const response = await fetch(
    "https://backend.al-sadhan.com/api/customer/products/search?",
    {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization:
          "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2JhY2tlbmQuYWwtc2FkaGFuLmNvbS9hcGkvY3VzdG9tZXIvaG9tZS9pbml0aWFsaXplIiwiaWF0IjoxNzE4MTI2NDI5LCJleHAiOjM3NzE4MTI2NDI5LCJuYmYiOjE3MTgxMjY0MjksImp0aSI6Im1RT09qTlF4ZVp0enA2VlQiLCJzdWIiOjE4MDU1ODYsInBydiI6IjRhYzA1YzBmOGFjMDhmMzY0Y2I0ZDAzZmI4ZTFmNjMxZmVjMzIyZTgifQ.UVcZgxm0gwNLrkc_uL6DAckVDIWvb9eTS1xkPEMd-DQ",
        "content-type": "application/json",
        lang: "1",
        "x-admin-preview": "0",
        Referer: "https://al-sadhan.com/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: '{"q":"","search":"","brand_ids":[],"sub_categories":[],"sub_categories_slugs":[],"categories":[],"category_id":"","category_slug":"household","price_from":null,"price_to":null,"page":"","page_size":"10000","sort":"","attributes_ids":[],"vendor_ids":[],"options_values_ids":[],"group_id":[],"group_slugs":[],"list_ids":[],"promotions":"","in_stock":""}',
      method: "POST",
    },
  );

  const data = await response.json();
  return data.data.products;
}

await test().then((data) => {
  var obj = [];
  for (let i = 0; i < data.length; i++) {
    var objArray = {
      sku: data[i].sku,
      name: data[i].name,
      price: data[i].price,
      qty: data[i].stock,
    };
    //append json to array
    obj.push(objArray);
  }

  console.log(obj);
});
