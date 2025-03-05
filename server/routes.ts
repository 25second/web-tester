import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInteractionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/interactions", async (req, res) => {
    try {
      const interaction = insertInteractionSchema.parse(req.body);
      const created = await storage.createInteraction(interaction);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid interaction data" });
    }
  });

  app.get("/api/interactions", async (_req, res) => {
    const interactions = await storage.getRecentInteractions();
    res.json(interactions);
  });

  return createServer(app);
}
