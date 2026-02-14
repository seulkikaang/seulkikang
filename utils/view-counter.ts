import { kv } from '@vercel/kv';
import { headers } from 'next/headers';
import { createHash } from 'crypto';

function getClientIp(headerValue: string | null): string {
  if (!headerValue) return 'unknown';
  return headerValue.split(',')[0]?.trim() || 'unknown';
}

function makeVisitorId(ip: string, userAgent: string, dayKey: string): string {
  return createHash('sha256')
    .update(`${ip}|${userAgent}|${dayKey}`)
    .digest('hex');
}

export async function trackHomeView(): Promise<number> {
  try {
    const h = await headers();
    const ip = getClientIp(h.get('x-forwarded-for'));
    const userAgent = h.get('user-agent') || 'unknown';

    const dayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
    const uniqueKey = `views:home:unique:${dayKey}`;
    const totalKey = 'views:home:total';
    const visitorId = makeVisitorId(ip, userAgent, dayKey);

    const added = await kv.sadd(uniqueKey, visitorId);
    await kv.expire(uniqueKey, 60 * 60 * 24 * 8);

    if (added === 1) {
      await kv.incr(totalKey);
    }

    const total = await kv.get<number>(totalKey);
    return typeof total === 'number' ? total : 0;
  } catch {
    return 0;
  }
}
