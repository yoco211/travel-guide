import fs from "fs";

const content = fs.readFileSync("data/destinations.ts", "utf8");

// Verified Unsplash photo IDs for each destination
const imageMap = {
  beijing: "1508804185872-d7badad00f7d",
  shanghai: "1538428494232-9c0d8a3ab403",
  chengdu: "1590736969955-71cc94901144",
  xian: "1547981609-4b6bfe67ca0b",
  hangzhou: "1599571234909-29ed5d1321d6",
  guangzhou: "1591084203858-78368f28eb2d",
  shenzhen: "1597218863093-8e5f045ebbe3",
  chongqing: "1581325790892-2f7e90d8aeac",
  guilin: "1530126486438-8e7f61ecf35c",
  lijiang: "1571248047192-3b4bbf3a20d4",
  dali: "1599745885611-9cb85ef1b46f",
  sanya: "1540202404-a2f260b0dd0f",
  lhasa: "1590227630285-1dc7854e9e09",
  suzhou: "1584690300744-bfac3c8c1a8b",
  xiamen: "1558957921-6e9bd4edf002",
  qingdao: "1584735935682-2f2b69dff9d2",
  zhangjiajie: "1528164344705-47542687000d",
  huangshan: "1507003211169-0a1dd7228f2d",
  kunming: "1596998480130-527db3fadfd8",
  nanjing: "1583417319070-4a69db38a482",
  "hong-kong": "1536599018102-9f803c140fc1",
  tokyo: "1540959733332-eab4deabeeaf",
  kyoto: "1493976040374-85c8e12f0c0e",
  seoul: "1534274988757-a28bf1a57c17",
  bangkok: "1508009603885-50cf7c579365",
  bali: "1537996194471-e657df975ab4",
  singapore: "1525625293386-3f8f99389edd",
  "chiang-mai": "1598935898639-81586f7d2129",
  hanoi: "1557750255-c76072a7aad1",
  "kuala-lumpur": "1596422846543-75c6fc197f07",
  paris: "1502602898657-3e91760cbb34",
  london: "1513635269975-59663e0ac1ad",
  barcelona: "1583422409516-2895a77efded",
  rome: "1552832230-c0197dd311b5",
  prague: "1519677100203-a0e668c92439",
  amsterdam: "1534351590666-13e3e96b5017",
  santorini: "1613395877344-13d4a8e0d49e",
  reykjavik: "1504829857797-ddff29c27927",
  vienna: "1516550893923-42d28e5677af",
  lisbon: "1585208798174-6cedd86e019a",
  istanbul: "1524231757912-21f4fe3a7200",
  dubai: "1512453979798-5ea266f8880c",
  "new-york": "1496442226666-8d4d0e62e6e9",
  "mexico-city": "1585464231875-d9ef1f5ad396",
  "rio-de-janeiro": "1483729558449-99ef09a8c325",
  sydney: "1506973035872-a4ec16b8e8d9",
  maldives: "1514282401047-d79a71a590e8",
  marrakech: "1489749798305-4fea3ae63d43",
  cairo: "1572252009286-268acec5ca0a",
  "cape-town": "1580060839134-75a5edca2e99",
};

let updated = content;

for (const [slug, photoId] of Object.entries(imageMap)) {
  // Find the block for this destination and replace image URLs
  const escapedSlug = slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Match the destination block starting from slug
  const blockPattern = new RegExp(
    `(slug:\\s*"${escapedSlug}"[\\s\\S]*?imageUrl:\\s*)"[^"]*"`,
    "g"
  );
  updated = updated.replace(
    blockPattern,
    `$1"https://images.unsplash.com/photo-${photoId}?w=800&q=80"`
  );

  const thumbPattern = new RegExp(
    `(slug:\\s*"${escapedSlug}"[\\s\\S]*?thumbnailUrl:\\s*)"[^"]*"`,
    "g"
  );
  updated = updated.replace(
    thumbPattern,
    `$1"https://images.unsplash.com/photo-${photoId}?w=400&q=60"`
  );
}

fs.writeFileSync("data/destinations.ts", updated);
console.log("Updated all image URLs successfully!");
