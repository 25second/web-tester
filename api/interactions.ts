import type { VercelRequest, VercelResponse } from '@vercel/node';
import { insertInteractionSchema } from '../shared/schema';
import { storage } from '../server/storage';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method === 'POST') {
    try {
      const interaction = insertInteractionSchema.parse(req.body);
      const created = await storage.createInteraction(interaction);
      return res.status(200).json(created);
    } catch (error) {
      return res.status(400).json({ error: "Invalid interaction data" });
    }
  }

  if (req.method === 'GET') {
    const interactions = await storage.getRecentInteractions();
    return res.status(200).json(interactions);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
