# TravelGuide 本地旅行工作台实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不增加账号系统的前提下，把 TravelGuide 扩展为可保存、编辑、导入导出、打印、同步日历、查看路线和管理预算的本地旅行工作台。

**Architecture:** 以版本化 `TripPlan` 作为唯一业务数据模型；`localStorage` 保存行程 JSON，IndexedDB 保存照片等二进制数据。现有 AI 流式攻略继续负责即时展示，生成完成后转换为可编辑的结构化行程；所有导出、地图和预算功能都消费同一份 `TripPlan`。

**Tech Stack:** Next.js App Router、React 19、TypeScript、Zod、Leaflet、浏览器 localStorage/IndexedDB、Web Share API、打印 CSS、ICS 文本生成；继续兼容 Cloudflare Pages 静态导出和现有 Pages Functions。

**Spec:** `docs/superpowers/specs/2026-08-19-travel-plan-features-design.md`

## Global Constraints

- 不增加账号、数据库、服务端行程存储或服务器端分享链接。
- JSON 是唯一完整导入导出格式，必须带 `schemaVersion`。
- 损坏或不兼容的导入文件不得覆盖现有行程。
- AI 价格、时间、天气和交通信息必须标记为参考信息，不能伪装成实时保证。
- 继续支持 `next.config.ts` 的静态导出和 Cloudflare Pages 部署。
- 新增业务逻辑必须先写失败测试，再实现最小代码，再运行全量测试。
- 浏览器专属 API 必须隔离在客户端逻辑，避免 SSR/hydration 不一致。
- 每个阶段完成后运行相关测试、lint 和生产构建；最终补充浏览器交互验证。

---

### Task 1: 建立 TripPlan 类型、校验和本地存储基础

**Files:**
- Modify: `types/index.ts`
- Create: `lib/trip-schema.ts`
- Create: `lib/trip-storage.ts`
- Create: `lib/trip-utils.ts`
- Create: `tests/trip-domain.test.mjs`

**Interfaces:**
- Produces `TripPlan`, `TripDay`, `TripActivity`, `BudgetPlan`, `BudgetItem`。
- Produces `createTripPlan()`, `validateTripPlan()`, `listStoredTrips()`, `saveStoredTrip()`, `deleteStoredTrip()`。
- Storage module必须支持浏览器不可用时的安全空结果，不在模块加载阶段直接访问 `window`。

- [ ] **Step 1: Write the failing tests** for creating a versioned plan, rejecting malformed imports, calculating updated timestamps, and preserving multiple stored plans.
- [ ] **Step 2: Run the focused tests and confirm they fail** because the new domain helpers do not exist.
- [ ] **Step 3: Implement the minimum types, Zod schema, pure helpers, and storage adapter** needed by the tests.
- [ ] **Step 4: Run focused tests and the existing regression suite**; keep all tests green.
- [ ] **Step 5: Run targeted ESLint and commit the foundation** with a focused message.

### Task 2: 统一目的地图片和安全占位图

**Files:**
- Create: `data/destination-images.ts`
- Modify: `data/destinations.ts`
- Modify: `components/ui/SafeImage.tsx`
- Modify: `components/ui/DestinationCard.tsx`
- Modify: `components/destination/DestinationHero.tsx`
- Create: `tests/destination-images.test.mjs`

**Interfaces:**
- `destination-images.ts` exports a typed manifest containing hero URL, thumbnail URL, alt text, and credit.
- `SafeImage` accepts a destination label for a consistent fallback card.

- [ ] **Step 1: Write failing tests** for every destination having a valid manifest entry, usable alt text, and a fallback label.
- [ ] **Step 2: Run the image tests and confirm the manifest checks fail** against the current scattered fields.
- [ ] **Step 3: Move destination image metadata behind the manifest** and make the fallback visually consistent.
- [ ] **Step 4: Run image tests, lint, and inspect the generated homepage/destination HTML** for broken image URLs.
- [ ] **Step 5: Commit the image consistency change.**

### Task 3: 保存生成结果、我的行程和旅行仪表盘

**Files:**
- Modify: `app/ai-planner/page.tsx`
- Modify: `components/planner/GuideResult.tsx`
- Create: `app/my-trips/page.tsx`
- Create: `components/trips/TripList.tsx`
- Create: `components/trips/TripCard.tsx`
- Create: `components/trips/TripDashboard.tsx`
- Modify: `components/layout/Header.tsx`
- Create: `tests/trip-persistence.test.mjs`

**Interfaces:**
- AI completion maps the request and sections into `TripPlan` and saves it once.
- The trips page supports list, rename, duplicate, delete, search, and filter by destination/date/budget.
- Dashboard shows next trip, countdown, recent trips, and incomplete checklist counts.

- [ ] **Step 1: Write failing tests** for saving a generated plan, duplicating it with a new ID, deleting only the selected plan, and filtering the list.
- [ ] **Step 2: Run the focused tests and confirm the persistence behavior is missing.**
- [ ] **Step 3: Add the save/list/edit/delete UI and connect it to the storage module.**
- [ ] **Step 4: Add empty, corrupt-storage, and delete-confirmation states.**
- [ ] **Step 5: Run tests, lint, build, and a basic rendered smoke check.**
- [ ] **Step 6: Commit the trip library and dashboard.**

### Task 4: 结构化每日行程、模板、多目的地和冲突检测

**Files:**
- Modify: `lib/parse-itinerary.ts`
- Create: `lib/itinerary-utils.ts`
- Create: `components/trips/ItineraryEditor.tsx`
- Create: `components/trips/TripDayEditor.tsx`
- Create: `components/trips/ActivityEditor.tsx`
- Create: `components/trips/TripTemplates.tsx`
- Modify: `components/planner/PlannerForm.tsx`
- Modify: `types/index.ts`
- Create: `tests/itinerary-utils.test.mjs`

**Interfaces:**
- Parser converts the current Markdown itinerary into best-effort `TripDay[]` without losing raw content.
- Editors support adding, deleting, reordering, and editing activities.
- Requests support a list of destination stops while remaining backward-compatible with the existing single-destination form.
- Conflict helper returns date errors, overlapping time ranges, missing travel gaps, and overfull-day warnings.

- [ ] **Step 1: Write failing parser, reorder, multi-stop, and conflict tests.**
- [ ] **Step 2: Run them and confirm the new structured behavior fails.**
- [ ] **Step 3: Implement pure itinerary normalization and conflict detection.**
- [ ] **Step 4: Build the editable day/activity UI and template presets.**
- [ ] **Step 5: Preserve manual edits when an individual day is regenerated.**
- [ ] **Step 6: Run focused tests, lint, and mobile layout checks.**
- [ ] **Step 7: Commit the structured itinerary milestone.**

### Task 5: JSON、Markdown、PDF、ICS 和分享

**Files:**
- Create: `lib/trip-export.ts`
- Create: `lib/ics-export.ts`
- Create: `components/trips/TripExportMenu.tsx`
- Create: `components/trips/TripImportButton.tsx`
- Modify: `components/ui/ShareButton.tsx`
- Modify: `components/ui/PrintButton.tsx`
- Modify: `app/globals.css`
- Create: `tests/trip-export.test.mjs`

**Interfaces:**
- `serializeTripToJson()`, `tripToMarkdown()`, and `tripToIcs()` return deterministic strings suitable for download.
- Import uses the schema validator before changing local storage.
- Print styles support detailed, compact, and daily-schedule modes.

- [ ] **Step 1: Write failing tests** for JSON round trips, Markdown sections, ICS escaping/all-day events, and invalid imports.
- [ ] **Step 2: Run focused tests and confirm exports are absent.**
- [ ] **Step 3: Implement deterministic exporters and safe file downloads.**
- [ ] **Step 4: Add import/export menu, copy Markdown/JSON actions, and print modes.**
- [ ] **Step 5: Add native share fallback behavior and actionable errors.**
- [ ] **Step 6: Run tests, inspect downloaded text, lint, and build.**
- [ ] **Step 7: Commit the import/export milestone.**

### Task 6: 地图路线、交通和住宿记录

**Files:**
- Create: `components/map/TripRouteMap.tsx`
- Modify: `components/map/MapView.tsx`
- Create: `lib/geo.ts`
- Create: `components/trips/TransportStayEditor.tsx`
- Create: `tests/geo.test.mjs`

**Interfaces:**
- Route map accepts ordered activities and renders markers, a polyline, and a local straight-line distance summary.
- Activities without coordinates remain visible in the editor but are not incorrectly placed on the map.
- Transport/stay records are editable metadata on the trip, not fake booking integrations.

- [ ] **Step 1: Write failing tests** for distance calculation, route ordering, and coordinate filtering.
- [ ] **Step 2: Run focused geo tests and confirm failure.**
- [ ] **Step 3: Implement route geometry and map layers while preserving existing destination map behavior.**
- [ ] **Step 4: Add transport and accommodation fields to the trip editor.**
- [ ] **Step 5: Verify map loading, marker cleanup, and mobile layout.**
- [ ] **Step 6: Commit the map milestone.**

### Task 7: 预算、清单、笔记和照片

**Files:**
- Create: `lib/budget-utils.ts`
- Create: `components/trips/BudgetEditor.tsx`
- Create: `components/trips/ChecklistPanel.tsx`
- Create: `components/trips/TripNotes.tsx`
- Create: `lib/photo-storage.ts`
- Create: `components/trips/TripPhotos.tsx`
- Create: `tests/budget-utils.test.mjs`

**Interfaces:**
- Budget utilities calculate category totals and grand totals without floating-point display errors.
- Checklist supports packing items and pre-trip tasks with completion state.
- Photo metadata is linked to a trip/activity while binary files are stored in IndexedDB.

- [ ] **Step 1: Write failing budget, checklist, and photo metadata tests.**
- [ ] **Step 2: Run focused tests and confirm the new utilities fail.**
- [ ] **Step 3: Implement pure budget calculations and local checklist state.**
- [ ] **Step 4: Implement IndexedDB photo storage with quota/error handling and thumbnails.**
- [ ] **Step 5: Add the panels to the trip detail view and print/export output.**
- [ ] **Step 6: Verify deletion and data backup behavior.**
- [ ] **Step 7: Commit the personal trip tools milestone.**

### Task 8: AI 行程助手、时间信息和提醒

**Files:**
- Create: `app/api/deepseek/assistant/route.ts`
- Create: `components/trips/TripAssistant.tsx`
- Create: `lib/trip-context.ts`
- Create: `lib/time-info.ts`
- Create: `lib/external-travel-data.ts`
- Create: `components/trips/TripAlerts.tsx`
- Create: `tests/trip-context.test.mjs`

**Interfaces:**
- Assistant receives only the selected local trip context and returns a response; it never mutates the trip without an explicit UI confirmation.
- Time helpers provide timezone, sunrise/sunset, and countdown formatting with safe fallbacks.
- Weather and holiday adapters are optional and fail closed; the trip remains usable when external services are unavailable.

- [ ] **Step 1: Write failing tests** for bounded assistant context, timezone formatting, countdowns, and unavailable-data fallbacks.
- [ ] **Step 2: Run focused tests and confirm missing behavior.**
- [ ] **Step 3: Implement the context builder and assistant endpoint with the existing rate-limit and validation patterns.**
- [ ] **Step 4: Add the assistant panel, day-specific replan action, alerts, and emergency information card.**
- [ ] **Step 5: Add weather/holiday adapters only behind explicit loading/error states.**
- [ ] **Step 6: Run endpoint tests, lint, and build.**
- [ ] **Step 7: Commit the assistant and travel information milestone.**

### Task 9: PWA、离线查看、暗色模式和数据管理

**Files:**
- Create: `public/manifest.webmanifest`
- Create: `public/sw.js`
- Create: `components/ui/ThemeToggle.tsx`
- Create: `components/trips/StorageManager.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Create: `tests/storage-manager.test.mjs`

**Interfaces:**
- The app shell and already-saved trips remain viewable offline after installation.
- Theme preference is local and does not create hydration mismatch.
- Storage manager can export all JSON, restore from a backup, show approximate usage, and clear local data after confirmation.

- [ ] **Step 1: Write failing tests** for backup/restore and theme preference behavior.
- [ ] **Step 2: Run focused tests and confirm missing behavior.**
- [ ] **Step 3: Add manifest, service worker caching strategy, and install metadata.**
- [ ] **Step 4: Add theme toggle and storage manager with safe confirmation flows.**
- [ ] **Step 5: Verify offline app shell and saved-trip access without caching mutable API responses.**
- [ ] **Step 6: Commit the PWA and data management milestone.**

### Task 10: 全量验证、浏览器 QA 和线上发布

**Files:**
- Modify: `tests/regressions.test.mjs`
- Modify: `package.json` only if test scripts need extension
- Create outside repository: temporary browser QA script/screenshots if needed

- [ ] **Step 1: Run all unit/domain tests and fix regressions.**
- [ ] **Step 2: Run `npm run lint` and remove new errors; record any remaining non-blocking warnings.**
- [ ] **Step 3: Run `npm run build` and inspect static routes, metadata, robots, sitemap, and manifest.**
- [ ] **Step 4: Use the Browser plugin if available; otherwise record the existing Browser runtime failure and use the permitted Playwright fallback for the main flows.**
- [ ] **Step 5: Verify the flows: generate → save → edit → import/export → print → calendar → map/budget → offline shell.**
- [ ] **Step 6: Review diff and working tree, commit final integration, push the branch, and deploy the Pages static output once.**
