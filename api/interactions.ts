import type { VercelRequest, VercelResponse } from '@vercel/node';
import { insertInteractionSchema } from '../shared/schema';
import { storage } from '../server/storage';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const interaction = insertInteractionSchema.parse(req.body);
      const created = await storage.createInteraction(interaction);
      return res.status(200).json(created);
    } catch (error) {
      console.error('Error creating interaction:', error);
      return res.status(400).json({ error: "Invalid interaction data" });
    }
  }

  if (req.method === 'GET') {
    try {
      const interactions = await storage.getRecentInteractions();
      return res.status(200).json(interactions);
    } catch (error) {
      console.error('Error getting interactions:', error);
      return res.status(500).json({ error: "Failed to fetch interactions" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}