// ============================================================
// Core Domain Types
// ============================================================

export interface Destination {
  slug: string;
  name: string;
  country: string;
  region: string;
  imageUrl: string;
  thumbnailUrl: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  tags: Interest[];
  bestSeason: string;
  language: string;
  currency: string;
  timezone: string;
  popularity: number; // 1-10 for sorting
  description: string;
}

// ============================================================
// AI Planner Types
// ============================================================

export interface PlannerRequest {
  origin: string;
  destination: string;
  dates: {
    from: string;
    to: string;
  };
  budget: BudgetLevel;
  interests: Interest[];
  travelStyle: TravelStyle;
  language: "zh" | "en";
  additionalNotes?: string;
}

export type BudgetLevel = "budget" | "mid-range" | "luxury";

export type Interest =
  | "food"
  | "history"
  | "nature"
  | "shopping"
  | "nightlife"
  | "technology"
  | "art"
  | "adventure"
  | "relaxation"
  | "culture";

export type TravelStyle = "solo" | "couple" | "family" | "friends";

// ============================================================
// AI Response Types
// ============================================================

export type SectionStatus = "pending" | "streaming" | "complete" | "error";

export interface GuideSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface TravelGuide {
  destination: string;
  generatedAt: string;
  sections: GuideSection[];
  metadata: {
    model: string;
    tokensUsed?: number;
  };
}

export interface StreamEvent {
  type:
    | "section_start"
    | "section_chunk"
    | "section_updated"
    | "section_complete"
    | "guide_complete"
    | "error";
  sectionId?: string;
  sectionTitle?: string;
  content?: string;
  error?: string;
}

// ============================================================
// Search Types
// ============================================================

export interface SearchResult {
  slug: string;
  name: string;
  country: string;
  matchScore: number;
  thumbnailUrl: string;
}

// ============================================================
// API Types
// ============================================================

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// ============================================================
// Planner Form State
// ============================================================

export interface PlannerFormState {
  origin: string;
  destination: string;
  dates: { from: string; to: string };
  budget: BudgetLevel;
  interests: Interest[];
  travelStyle: TravelStyle;
  additionalNotes: string;
}

// ============================================================
// Local Trip Workspace Types
// ============================================================

export type TripActivityPeriod =
  | "morning"
  | "afternoon"
  | "evening"
  | "all-day"
  | "other";

export interface TripActivity {
  id: string;
  title: string;
  period: TripActivityPeriod;
  startTime?: string;
  endTime?: string;
  location?: string;
  coordinates?: { lat: number; lng: number };
  category?: string;
  notes?: string;
  estimatedCost?: number;
  currency?: string;
}

export interface TripDay {
  id: string;
  date: string;
  label: string;
  activities: TripActivity[];
}

export interface ItineraryTemplate {
  id: string;
  name: string;
  description: string;
  days: TripDay[];
}

export type BudgetCategory =
  | "transport"
  | "accommodation"
  | "food"
  | "tickets"
  | "shopping"
  | "other";

export interface BudgetItem {
  id: string;
  category: BudgetCategory;
  label: string;
  amount: number;
  note?: string;
}

export interface BudgetPlan {
  currency: string;
  items: BudgetItem[];
}

export interface TripChecklistItem {
  id: string;
  label: string;
  done: boolean;
  category?: string;
}

export interface TripNote {
  id: string;
  content: string;
  createdAt: string;
}

export interface TripPhoto {
  id: string;
  name: string;
  dataUrl: string;
  createdAt: string;
}

export interface TripDestinationStop {
  id: string;
  destination: string;
  arrivalDate: string;
  departureDate: string;
  transportNote?: string;
}

export type TransportMode = "flight" | "train" | "bus" | "car" | "walk" | "other";

export interface TransportSegment {
  id: string;
  from: string;
  to: string;
  mode: TransportMode;
  departure?: string;
  arrival?: string;
  estimatedCost?: number;
  note?: string;
}

export interface StayRecord {
  id: string;
  name: string;
  area: string;
  checkIn: string;
  checkOut: string;
  address?: string;
  bookingUrl?: string;
  estimatedCost?: number;
  currency?: string;
  note?: string;
}

export interface TripPlan {
  schemaVersion: 1;
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  request: PlannerRequest;
  guide: TravelGuide;
  itinerary: TripDay[];
  budget: BudgetPlan;
  destinationStops?: TripDestinationStop[];
  transportSegments?: TransportSegment[];
  stays?: StayRecord[];
  checklist?: TripChecklistItem[];
  notes?: TripNote[];
  photos?: TripPhoto[];
}
