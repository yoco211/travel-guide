import fs from "fs";

let c = fs.readFileSync("data/destinations.ts", "utf8");

// Fix remaining English month names in compound seasons
const months = {
  January: "1月",
  February: "2月",
  March: "3月",
  April: "4月",
  May: "5月",
  June: "6月",
  July: "7月",
  August: "8月",
  September: "9月",
  October: "10月",
  November: "11月",
  December: "12月",
};

for (const [en, zh] of Object.entries(months)) {
  c = c.replaceAll(en, zh);
}

fs.writeFileSync("data/destinations.ts", c);
console.log("Fixed remaining English months");
