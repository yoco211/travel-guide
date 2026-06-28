import type { PlannerRequest } from "@/types";

/**
 * System prompt for the AI Travel Planner.
 * Instructs DeepSeek to output structured JSON with sections.
 */
export function buildPlannerSystemPrompt(language: "zh" | "en" = "zh"): string {
  const isZh = language === "zh";

  return `You are an expert travel guide and trip planner. ${
    isZh
      ? "你是一位资深的旅行规划师和当地导游，对全球各大旅游目的地有深入了解。"
      : "You are a senior travel planner and local guide with deep knowledge of global destinations."
  }

Your task: Based on the user's destination, travel dates, budget, interests, and travel style, generate a comprehensive, practical, and personalized travel guide.

${isZh ? "**关键要求：**" : "**Key Requirements:**"}
1. ${
    isZh
      ? "输出必须是严格的 JSON 格式，包含一个 sections 数组。"
      : "Output MUST be strict JSON with a sections array."
  }
2. ${
    isZh
      ? "每个 section 的 content 字段使用 Markdown 格式编写详细内容。"
      : "Each section's content field must be detailed Markdown."
  }
3. ${
    isZh
      ? "内容必须实用、具体，包含真实的景点名称、餐厅推荐、价格区间、交通方式等。"
      : "Content must be practical and specific — real attraction names, restaurant suggestions, price ranges, transport methods."
  }
4. ${
    isZh
      ? "根据用户预算水平调整推荐档次。"
      : "Adjust recommendation tiers based on the user's budget."
  }
5. ${
    isZh
      ? "考虑到旅行日期，给出季节性的建议。"
      : "Consider travel dates and give seasonal advice."
  }

**JSON Output Schema:**
\`\`\`json
{
  "sections": [
    {
      "id": "overview",
      "title": "${isZh ? "目的地概览" : "Overview"}",
      "content": "Markdown content with destination overview, best time to visit, visa info, local customs...",
      "order": 1
    },
    {
      "id": "attractions",
      "title": "${isZh ? "景点推荐" : "Top Attractions"}",
      "content": "Markdown content with 5-8 must-visit attractions, each with name, description, estimated time, ticket prices, and tips...",
      "order": 2
    },
    {
      "id": "food",
      "title": "${isZh ? "美食指南" : "Food & Dining"}",
      "content": "Markdown content with local must-try dishes, recommended restaurants at different budget levels, food streets/areas...",
      "order": 3
    },
    {
      "id": "transport_from_origin",
      "title": "${isZh ? "出发地→目的地 交通详情" : "Origin → Destination Transport"}",
      "content": "Markdown content with COMPREHENSIVE transport options from the origin city to the destination. MUST include:
- ✈️ 飞机航班：列出具体航空公司、航班号、起飞到达时间、飞行时长、经济舱/商务舱参考票价（人民币）
- 🚄 高铁/火车：列出车次号、出发到达时间、行驶时长、一等座/二等座/硬卧/软卧票价
- 🚌 长途大巴：列出班次时间、行驶时长、票价、上车站点
- 🚗 自驾路线：总里程、预计耗时、高速费用、推荐路线
- 💰 各方式性价比对比表格
Use real route data where possible. Format as detailed Markdown tables.",
      "order": 3
    },
    {
      "id": "transport",
      "title": "${isZh ? "当地交通攻略" : "Local Transportation"}",
      "content": "Markdown content covering local transport options (metro, bus, taxi, rental bikes, etc.), costs, travel passes, tips, recommended routes...",
      "order": 5
    },
    {
      "id": "accommodation",
      "title": "${isZh ? "住宿推荐" : "Accommodation"}",
      "content": "Markdown content with recommended areas to stay, hotel suggestions at the user's budget level, booking tips...",
      "order": 5
    },
    {
      "id": "itinerary",
      "title": "${isZh ? "行程建议" : "Suggested Itinerary"}",
      "content": "Markdown content with a day-by-day itinerary covering morning, afternoon, and evening activities...",
      "order": 6
    },
    {
      "id": "tips",
      "title": "${isZh ? "实用贴士" : "Practical Tips"}",
      "content": "Markdown content with safety tips, money-saving advice, local etiquette, SIM cards, emergency numbers...",
      "order": 7
    }
  ]
}
\`\`\`

${
  isZh
    ? "**重要：** 所有 section 的 content 必须使用中文撰写。请确保 JSON 是有效的，且内容大量详实。每个 content 至少 300 字。"
    : "**Important:** Each section's content must be substantial — at least 300 words per section. Ensure the JSON is valid."
}`;
}

/**
 * Build the user message for the planner based on form input
 */
export function buildPlannerUserMessage(request: PlannerRequest): string {
  const { origin, destination, dates, budget, interests, travelStyle, additionalNotes } =
    request;

  const budgetLabels: Record<string, string> = {
    budget: "经济实惠 / Budget",
    "mid-range": "舒适中档 / Mid-Range",
    luxury: "奢华享受 / Luxury",
  };

  const styleLabels: Record<string, string> = {
    solo: "独自旅行 / Solo Travel",
    couple: "情侣出游 / Couple",
    family: "家庭出行 / Family with Kids",
    friends: "朋友结伴 / Friends Trip",
  };

  const interestLabels: Record<string, string> = {
    food: "美食 / Food",
    history: "历史 / History",
    nature: "自然风光 / Nature",
    shopping: "购物 / Shopping",
    nightlife: "夜生活 / Nightlife",
    technology: "科技 / Technology",
    art: "艺术 / Art",
    adventure: "探险 / Adventure",
    relaxation: "休闲放松 / Relaxation",
    culture: "文化 / Culture",
  };

  return `请为以下旅行需求生成一份详细的旅游攻略：

**出发地：** ${origin}
**目的地：** ${destination}
**旅行日期：** ${dates.from} 至 ${dates.to}
**预算水平：** ${budgetLabels[budget] || budget}
**兴趣偏好：** ${interests.map((i) => interestLabels[i] || i).join("、")}
**旅行方式：** ${styleLabels[travelStyle] || travelStyle}
${additionalNotes ? `**补充说明：** ${additionalNotes}` : ""}

特别注意：请详细列出从 ${origin} 到 ${destination} 的所有出行方式（飞机航班号/时刻/票价、高铁车次/时刻/票价、大巴班次/票价、自驾路线/费用），用表格呈现。

请严格按照 system prompt 中定义的 JSON 格式输出，每个 section 的 content 要详细丰富，使用中文撰写。`;
}

/**
 * System prompt for destination detail guide
 */
export function buildDestinationSystemPrompt(): string {
  return `你是一位资深的当地导游，对目的地有深入的了解。

请根据用户提供的目的地名称，生成一份详细的旅游攻略。

**输出格式要求：**
必须是严格的 JSON 格式，包含 sections 数组：

{
  "sections": [
    { "id": "overview", "title": "目的地概览", "content": "Markdown...", "order": 1 },
    { "id": "attractions", "title": "必游景点", "content": "Markdown...", "order": 2 },
    { "id": "food", "title": "美食推荐", "content": "Markdown...", "order": 3 },
    { "id": "transport", "title": "交通指南", "content": "Markdown...", "order": 4 },
    { "id": "accommodation", "title": "住宿选择", "content": "Markdown...", "order": 5 },
    { "id": "tips", "title": "旅行贴士", "content": "Markdown...", "order": 6 }
  ]
}

每个 content 字段使用中文 Markdown 格式，内容详实丰富（至少 200 字），包含真实具体的信息。`;
}

export function buildDestinationUserMessage(destinationName: string): string {
  return `请为 ${destinationName} 生成一份详细的旅游攻略。`;
}
