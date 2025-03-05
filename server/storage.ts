import { interactions, type Interaction, type InsertInteraction } from "@shared/schema";

export interface IStorage {
  createInteraction(interaction: InsertInteraction): Promise<Interaction>;
  getRecentInteractions(limit?: number): Promise<Interaction[]>;
}

export class MemStorage implements IStorage {
  private interactions: Interaction[];
  private currentId: number;

  constructor() {
    this.interactions = [];
    this.currentId = 1;
  }

  async createInteraction(insertInteraction: InsertInteraction): Promise<Interaction> {
    const interaction: Interaction = {
      id: this.currentId++,
      timestamp: new Date(),
      ...insertInteraction,
    };
    this.interactions.push(interaction);
    return interaction;
  }

  async getRecentInteractions(limit: number = 50): Promise<Interaction[]> {
    return this.interactions
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
