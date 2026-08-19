import { z } from "zod/v4";
import { plannerRequestSchema } from "./validators";

const guideSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  content: z.string(),
  order: z.number().int(),
});

const travelGuideSchema = z.object({
  destination: z.string().min(1),
  generatedAt: z.string().datetime(),
  sections: z.array(guideSectionSchema),
  metadata: z.object({
    model: z.string().min(1),
    tokensUsed: z.number().optional(),
  }),
});

const coordinatesSchema = z.object({
  lat: z.number().finite(),
  lng: z.number().finite(),
});

const tripActivitySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  period: z.enum(["morning", "afternoon", "evening", "all-day", "other"]),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  coordinates: coordinatesSchema.optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
  estimatedCost: z.number().finite().nonnegative().optional(),
  currency: z.string().optional(),
});

const tripDaySchema = z.object({
  id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  label: z.string().min(1),
  activities: z.array(tripActivitySchema),
});

const budgetItemSchema = z.object({
  id: z.string().min(1),
  category: z.enum([
    "transport",
    "accommodation",
    "food",
    "tickets",
    "shopping",
    "other",
  ]),
  label: z.string().min(1),
  amount: z.number().finite().nonnegative(),
  note: z.string().optional(),
});

const budgetPlanSchema = z.object({
  currency: z.string().min(1),
  items: z.array(budgetItemSchema),
});

export const tripPlanSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  title: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  request: plannerRequestSchema,
  guide: travelGuideSchema,
  itinerary: z.array(tripDaySchema),
  budget: budgetPlanSchema,
});

export function validateTripPlan(input: unknown) {
  return tripPlanSchema.safeParse(input);
}
