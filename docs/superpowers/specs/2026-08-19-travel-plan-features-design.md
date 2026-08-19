# TravelGuide 本地行程功能设计

**日期：** 2026-08-19

**状态：** 已确认的设计

## 目标

把 TravelGuide 做成一个以本地使用为主的个人旅行工作台：统一目的地图片，支持保存和编辑 AI 行程，并让同一份行程数据可以导入、导出、打印、加入日历、显示在地图上以及记录预算。

## 产品决策

- 本阶段不增加账号、数据库和服务器端行程存储。
- 默认使用浏览器 `localStorage` 保存行程。
- JSON 是完整、可移植的标准格式。
- Markdown 和浏览器打印 PDF 是展示型导出格式。
- ICS 是日历导出格式，用于 Google Calendar、Apple 日历等。
- 分享使用系统分享、剪贴板或文件导出；不把完整 AI 内容塞进 URL，避免链接过长或失效。
- AI 生成的价格、营业时间和交通时间都标记为参考值，并允许用户修改。

## 统一的行程数据结构

应用保存一个版本化的 `TripPlan`，不再只把 AI 返回的 Markdown 当作唯一数据源。

```ts
interface TripPlan {
  schemaVersion: 1;
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  request: PlannerRequest;
  guide: TravelGuide;
  itinerary: TripDay[];
  budget: BudgetPlan;
}

interface TripDay {
  id: string;
  date: string;
  label: string;
  activities: TripActivity[];
}

interface TripActivity {
  id: string;
  title: string;
  period: "morning" | "afternoon" | "evening" | "all-day" | "other";
  startTime?: string;
  endTime?: string;
  location?: string;
  coordinates?: { lat: number; lng: number };
  category?: string;
  notes?: string;
  estimatedCost?: number;
  currency?: string;
}

interface BudgetPlan {
  currency: string;
  items: BudgetItem[];
}

interface BudgetItem {
  id: string;
  category: "transport" | "accommodation" | "food" | "tickets" | "shopping" | "other";
  label: string;
  amount: number;
  note?: string;
}
```

现有 AI 流式生成流程保持兼容：攻略仍然可以实时显示现有的 `GuideSection[]`。生成完成后，再把“行程建议”解析成可编辑的 `TripDay[]`。如果解析不完整，仍保留原始 Markdown，并允许用户手动添加结构化行程。

## 保存和我的行程

- 新增独立的本地存储模块，使用带命名空间的 key，并安全处理损坏的 JSON。
- 在 `localStorage` 中保存多个 `TripPlan` 和当前选中的行程 ID。
- 新增 `/my-trips` 页面，支持查看、重命名、复制、删除、导入和导出。
- AI 生成成功后自动保存，用户编辑后也自动保存，并更新 `updatedAt`。
- 所有浏览器存储访问都放在客户端逻辑中，避免静态渲染和 hydration 问题。
- 导入 JSON 时校验数据结构和版本；不兼容的文件不会覆盖已有行程。

## 图片方案

- 为每个目的地维护独立的主图和缩略图配置。
- 目的地主图优先使用地标、风景或能代表城市的场景。
- 人物、美食和生活方式图片只放在攻略正文，不作为目的地主图。
- 图片配置中保存来源和 alt 文本。
- 图片加载失败时显示统一的“城市名称卡片”，不再显示风格混乱的渐变占位图。

## 导出和分享

- JSON 导出：包含完整、版本化的 `TripPlan`，可再次导入。
- Markdown 导出：按基本信息、每日行程、预算、攻略内容的顺序生成可读文本。
- PDF 导出：利用现有打印功能和打印专用样式，由用户在浏览器中保存为 PDF，不增加服务器 PDF 依赖。
- ICS 导出：没有具体时间的活动生成全天事件；有开始和结束时间的活动生成定时事件。
- 系统分享：分享简短摘要和当前页面地址；用户也可以选择复制 Markdown 或 JSON。

## 地图和路线

- 扩展现有 Leaflet 地图，让它支持按顺序显示每日行程活动。
- 有坐标的活动显示地图标记，并按照行程顺序连接路线。
- 自动让地图适配所有已有标记；没有活动坐标时，退回显示目的地中心点。
- 没有接入实时路线服务前，不显示所谓的实时交通时间；只有在有坐标时，才可计算直线距离。
- 保留现有目的地地图功能，不影响首页和目的地页面。

## 预算功能

- 支持添加和编辑预算项目，包括分类、名称、金额、币种和备注。
- 显示分类小计和总预算。
- 如果能从 AI 内容中解析出费用，就作为参考值填入；否则显示空白的手动添加界面。
- 第一版不做自动汇率换算，使用用户选择的行程币种，并允许手动修改。

## 错误处理和隐私

- 本地保存、导入和导出失败时，显示明确的提示和解决方法。
- 损坏的文件不会覆盖已有行程。
- 删除行程前需要二次确认。
- 页面明确说明：行程保存在当前浏览器，但 AI 规划请求仍会把用户填写的规划信息发送到 AI 接口。
- 导出文件只包含用户实际输入或生成的行程内容，不主动加入其他敏感信息。

## 开发顺序

1. 整理目的地图片配置，建立 `TripPlan` 类型和本地存储工具。
2. 保存 AI 生成结果，增加“我的行程”页面。
3. 增加 JSON 导入导出、Markdown 分享和 PDF 打印样式。
4. 增加 ICS 日历导出。
5. 增加可编辑的每日行程和地图路线。
6. 增加预算编辑和统计。
7. 完成回归测试、lint、生产构建和主要页面的浏览器验证。

## 本阶段暂不做

- 用户账号和跨设备同步。
- 服务器端分享链接。
- 自动订票和支付。
- 实时交通、天气、营业时间和汇率服务。
- 未经用户确认，自动为每一个 AI 生成的地点进行地理编码。
