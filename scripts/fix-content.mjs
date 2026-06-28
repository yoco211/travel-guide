import fs from "fs";

let c = fs.readFileSync("data/destinations.ts", "utf8");

// Fix language fields
const langMap = {
  Mandarin: "普通话",
  "Cantonese, Mandarin": "粤语、普通话",
  "Cantonese, English": "粤语、英语",
  "Tibetan, Mandarin": "藏语、普通话",
  "English, Mandarin, Malay, Tamil": "英语、普通话、马来语、泰米尔语",
  "English, Afrikaans, Xhosa": "英语、南非荷兰语、科萨语",
  "Arabic, French": "阿拉伯语、法语",
};

for (const [en, zh] of Object.entries(langMap)) {
  c = c.replaceAll(`language: "${en}"`, `language: "${zh}"`);
}

// Fix season fields — convert to Chinese month format
const seasonMap = {
  "March-May": "3-5月",
  "April-June": "4-6月",
  "April-May": "4-5月",
  "May-October": "5-10月",
  "June-August": "6-8月",
  "June-September": "6-9月",
  "July-August": "7-8月",
  "September-November": "9-11月",
  "September-October": "9-10月",
  "October-April": "10-4月",
  "October-December": "10-12月",
  "October-November": "10-11月",
  "November-February": "11-2月",
  "November-March": "11-3月",
  "November-April": "11-4月",
  "December-March": "12-3月",
  "December-February": "12-2月",
  "March-October": "3-10月",
  "March-November": "3-11月",
  "March-June": "3-6月",
  "April-October": "4-10月",
  "April-September": "4-9月",
  "May-July": "5-7月",
  "February-April": "2-4月",
  "Year-round": "全年皆宜",
};

// Handle seasons with parentheses (like Midnight Sun notes)
for (const [en, zh] of Object.entries(seasonMap)) {
  // Match patterns like "June-August (Midnight Sun), September-March (Northern Lights)"
  c = c.replaceAll(`bestSeason: "${en}`, `bestSeason: "${zh}`);

  // Fix parenthetical notes
  c = c.replaceAll("(Midnight Sun)", "(极昼)");
  c = c.replaceAll("(Northern Lights)", "(极光季)");
}

// Fix remaining English text in descriptions that might be problematic
// Fix "Best season" headers in DestinationHero
// Already handled by the component

// Fix any remaining currency names
c = c.replaceAll('"Japanese"', '"日语"');
c = c.replaceAll('"French"', '"法语"');
c = c.replaceAll('"Thai"', '"泰语"');
c = c.replaceAll('"English"', '"英语"');
c = c.replaceAll('"Italian"', '"意大利语"');
c = c.replaceAll('"Spanish"', '"西班牙语"');
c = c.replaceAll('"Korean"', '"韩语"');
c = c.replaceAll('"Turkish"', '"土耳其语"');
c = c.replaceAll('"Czech"', '"捷克语"');
c = c.replaceAll('"Dutch"', '"荷兰语"');
c = c.replaceAll('"Greek"', '"希腊语"');
c = c.replaceAll('"Icelandic"', '"冰岛语"');
c = c.replaceAll('"German"', '"德语"');
c = c.replaceAll('"Portuguese"', '"葡萄牙语"');
c = c.replaceAll('"Malay"', '"马来语"');
c = c.replaceAll('"Vietnamese"', '"越南语"');
c = c.replaceAll('"Indonesian"', '"印尼语"');
c = c.replaceAll('"Arabic"', '"阿拉伯语"');
c = c.replaceAll('"Dhivehi"', '"迪维希语"');

fs.writeFileSync("data/destinations.ts", c);
console.log("Fixed all languages, seasons, and remaining English text");
