# Travel Plan Features Design

**Date:** 2026-08-19

**Status:** User-approved design

## Goal

Turn TravelGuide into a local-first personal trip workspace: destination images become consistent, generated trips can be saved and edited locally, and the same trip data can be imported, exported, printed, added to calendars, viewed on a map, and tracked with a budget.

## Product decisions

- No account, database, or server-side trip storage in this phase.
- Browser `localStorage` is the default persistence layer.
- JSON is the canonical portable format.
- Markdown and browser print-to-PDF are presentation exports.
- ICS is an optional calendar export generated from dated itinerary items.
- Sharing uses the system share sheet, clipboard, Markdown, or files; full trips are not encoded into URLs because AI content can exceed safe URL lengths.
- AI-generated prices, opening hours, and travel times remain clearly marked as estimates and editable by the user.

## Canonical data model

The application will store a versioned `TripPlan` rather than treating streamed Markdown as the only source of truth.

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

The current AI stream remains compatible: existing `GuideSection[]` content continues to render immediately. Once generation completes, the itinerary section is parsed into editable `TripDay[]`; if parsing is incomplete, the raw Markdown remains available and the user can add structured activities manually.

## Persistence and navigation

- Add a small storage module with namespaced keys and safe JSON parsing.
- Store a list of `TripPlan` records and a selected plan ID in `localStorage`.
- Add a `/my-trips` page with recent trips, rename, duplicate, delete, import, and export actions.
- Save after successful generation and after user edits; update `updatedAt` on every write.
- Guard browser-only storage access so static rendering and hydration remain stable.
- Validate imported data with the existing Zod-based validation style and reject unknown or incompatible schema versions with a readable error.

## Images

- Keep one curated hero image and thumbnail per destination in a dedicated image manifest.
- Main destination imagery should prioritize landmarks, landscape, or recognizable city scenes.
- People, food, and lifestyle images can appear inside guide content but not as the default destination hero.
- Keep image credit and alt text with the manifest entry.
- Use the existing safe-image fallback, but make the fallback a consistent destination card with the city name rather than an ambiguous generic gradient.

## Export and sharing

- JSON export includes the complete versioned `TripPlan`.
- Markdown export renders the request, daily itinerary, budget, and guide sections in a readable order.
- PDF export uses the existing print flow plus print-specific layout styles; no server PDF dependency is required.
- ICS export creates all-day events when an activity has no time and timed events when both start and end times are present.
- Native sharing shares a concise summary and the current page URL; clipboard sharing can copy Markdown or JSON when selected.

## Map and route behavior

- Extend the existing Leaflet map to accept ordered itinerary activities.
- Show markers for activities that have coordinates and a polyline in itinerary order.
- Fit the map to the available markers and fall back to the destination center when no activity coordinates exist.
- Do not claim live routing or travel duration without a routing provider; route distance is optional and calculated locally only when coordinates are available.
- Keep the current destination map behavior intact.

## Budget behavior

- Add editable budget items with category, label, amount, currency, and note.
- Show category totals and a grand total.
- Seed the budget from AI estimates only when they can be parsed; otherwise start empty with clear manual-add controls.
- Keep currency conversion out of the first release; display the selected trip currency and allow manual edits.

## Error handling and privacy

- All local-storage, import, and export failures show an actionable toast or inline message.
- Corrupt files never overwrite existing trips.
- Deletion requires a confirmation step.
- The UI states that local trips stay in the browser, while planner requests still send the entered planning data to the AI endpoint.
- No sensitive data is included in exports unless the user entered it into the trip.

## Delivery phases

1. Curate the image manifest and introduce the `TripPlan` types plus storage helpers.
2. Save generated trips and add the `/my-trips` management page.
3. Add JSON import/export, Markdown sharing, and print/PDF layout.
4. Add ICS calendar export.
5. Add editable itinerary activities and map route rendering.
6. Add editable budget management and totals.
7. Run regression tests, lint, production build, and rendered browser verification for the main flows.

## Non-goals for this release

- User accounts or cross-device synchronization.
- Server-side sharing links.
- Automatic booking or payment integrations.
- Live traffic, weather, opening-hours, or currency conversion services.
- Automatic geocoding of every AI-generated place name without user confirmation.
