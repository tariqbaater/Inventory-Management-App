export const topProducts = () => {
  apiCallsMjs.loadTopProducts().then((data) => {
    return data;
  });
};

// import { Parser } from "json2csv";
// import * as fs from "fs";
//
// const loadHighValue = async () => {
//   const response = await fetch(`http://localhost:8080/high_value/`);
//   const data = await response.json();
//   return data;
// };
//
// console.log(
//   loadHighValue().then((data) => {
//     const parser = new Parser();
//     const csv = parser.parse(data);
//     fs.writeFile("high_value.csv", csv, (err) => {
//       if (err) throw err;
//       console.log("The file has been saved!");
//     });
//   }),
// );

// async function mainSheet(page, limit) {
//   const json_data = [];
//   await fetch(`http://localhost:8080/main_sheet?page=${page}&limit=${limit}`)
//     .then((response) => {
//       if (response.ok) {
//         return response.json();
//       }
//     })
//     .then((data) => {
//       for (const item of data) {
//         json_data.push(item);
//       }
//     });
//   return json_data;
// }
//
// console.log(await mainSheet(1, 10));

// get the keys of the first object in the array, which can be used to create the table heade
export const loadHighValue = async () => {
  const response = await fetch(`http://localhost:8080/top_products/`);
  const data = await response.json();
  return data;
};

export const getKeys = async (func) => {
  const data = await func();
  return Object.keys(data[0]);
};

export const getValues = async (func) => {
  const data = await func();
  return Object.values(data[0]);
};
console.log(await getValues(loadHighValue));
