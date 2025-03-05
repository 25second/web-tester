import { interactions, type Interaction, type InsertInteraction } from "@shared/schema";

// In-memory storage that persists between function calls
let interactionsData: Interaction[] = [];
let currentId = 1;

export interface IStorage {
  createInteraction(interaction: InsertInteraction): Promise<Interaction>;
  getRecentInteractions(limit?: number): Promise<Interaction[]>;
}

export class MemStorage implements IStorage {
  async createInteraction(insertInteraction: InsertInteraction): Promise<Interaction> {
    const interaction: Interaction = {
      id: currentId++,
      timestamp: new Date(),
      buttonId: insertInteraction.buttonId,
      eventType: insertInteraction.eventType,
      cursorPosition: insertInteraction.cursorPosition || null,
      cursorVelocity: insertInteraction.cursorVelocity || null,
      cursorAcceleration: insertInteraction.cursorAcceleration || null,
      timingData: insertInteraction.timingData || null,
      behaviorMetrics: insertInteraction.behaviorMetrics || null,
      metadata: insertInteraction.metadata || null
    };

    interactionsData.push(interaction);
    return interaction;
  }

  async getRecentInteractions(limit: number = 50): Promise<Interaction[]> {
    return interactionsData
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();