import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const hasKey = typeof process.env.GEMINI_API_KEY === 'string' && process.env.GEMINI_API_KEY.trim().length > 0;

  res.status(200).json({ ready: hasKey, hasKey, message: hasKey ? 'Assistant configured' : 'GEMINI_API_KEY not set' });
}
