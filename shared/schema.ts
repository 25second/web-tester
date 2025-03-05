import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const interactions = pgTable("interactions", {
  id: serial("id").primaryKey(),
  buttonId: text("button_id").notNull(),
  eventType: text("event_type").notNull(),
  cursorPosition: jsonb("cursor_position").$type<{x: number, y: number}>(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
});

export const insertInteractionSchema = createInsertSchema(interactions).omit({ 
  id: true,
  timestamp: true 
});

export type InsertInteraction = z.infer<typeof insertInteractionSchema>;
export type Interaction = typeof interactions.$inferSelect;
