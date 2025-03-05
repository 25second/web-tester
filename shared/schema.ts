import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const interactions = pgTable("interactions", {
  id: serial("id").primaryKey(),
  buttonId: text("button_id").notNull(),
  eventType: text("event_type").notNull(),
  cursorPosition: jsonb("cursor_position").$type<{x: number, y: number}>(),
  cursorVelocity: jsonb("cursor_velocity").$type<{x: number, y: number}>(),
  cursorAcceleration: jsonb("cursor_acceleration").$type<{x: number, y: number}>(),
  timingData: jsonb("timing_data").$type<{
    timeStamp: number,
    dwellTime?: number, // Time spent hovering
    movementTime?: number, // Time spent moving to target
  }>(),
  behaviorMetrics: jsonb("behavior_metrics").$type<{
    naturalness: number, // 0-1 score based on movement patterns
    jitterAmount: number, // Amount of micro-movements
    pathEfficiency: number, // Ratio of actual path to direct path
  }>(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
});

export const insertInteractionSchema = createInsertSchema(interactions).omit({ 
  id: true,
  timestamp: true 
});

export type InsertInteraction = z.infer<typeof insertInteractionSchema>;
export type Interaction = typeof interactions.$inferSelect;