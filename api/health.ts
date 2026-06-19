import { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

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

  const pkgPath = path.resolve(process.cwd(), 'package.json');
  let pkg = { name: null, version: null } as any;
  try {
    const content = fs.readFileSync(pkgPath, 'utf8');
    pkg = JSON.parse(content);
  } catch (e) {
    // ignore
  }

  const hasKey = typeof process.env.GEMINI_API_KEY === 'string' && process.env.GEMINI_API_KEY.trim().length > 0;

  res.status(200).json({
    ok: true,
    name: pkg.name || null,
    version: pkg.version || null,
    hasKey,
    timestamp: new Date().toISOString(),
  });
}
