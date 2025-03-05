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
      ...insertInteraction,
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