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
