import { NextRequest } from 'next/server';
import { checkRateLimit } from '../../_lib/safeguards';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const rl = checkRateLimit(req, 2, 30);
  if (rl) return rl;
  const { searchParams } = new URL(req.url);
  const sizeMb = Math.min(16, Math.max(1, Number(searchParams.get('mb') || 5)));
  const size = sizeMb * 1024 * 1024;

  const chunk = new Uint8Array(64 * 1024);
  crypto.getRandomValues(chunk);

  const stream = new ReadableStream({
    start(controller) {
      let sent = 0;
      const push = () => {
        if (sent >= size) { controller.close(); return; }
        const toSend = Math.min(chunk.length, size - sent);
        controller.enqueue(chunk.subarray(0, toSend));
        sent += toSend;
        // Yield to event loop
        setTimeout(push, 0);
      };
      push();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Cache-Control': 'no-store',
      'Content-Disposition': `attachment; filename="blob-${sizeMb}mb.bin"`
    }
  });
}
