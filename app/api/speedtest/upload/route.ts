export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { checkRateLimit } from '../_lib/safeguards';

export async function POST(req: Request) {
  // Note: Next.js may pass a NextRequest in app routes; allow either.
  try {
    const maybe = req as unknown as NextRequest;
    const rl = checkRateLimit(maybe, 2, 30);
    if (rl) return rl;
  } catch { }
  try {
    const started = performance.now();
    let bytes = 0;
    const reader = req.body?.getReader();
    if (!reader) return Response.json({ error: 'No body' }, { status: 400 });

    // Limit to ~32MB to avoid exhausting memory/time
    const MAX = 32 * 1024 * 1024;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value?.byteLength || 0;
      if (bytes > MAX) return Response.json({ error: 'Too large' }, { status: 413 });
    }
    const ms = performance.now() - started;
    return Response.json({ bytes, ms });
  } catch (e: any) {
    return Response.json({ error: e.message || 'Unexpected error' }, { status: 500 });
  }
}
