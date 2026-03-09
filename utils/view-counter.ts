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

function getDayKey(offsetDays = 0): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export async function trackHomeView(): Promise<number> {
  try {
    const h = await headers();
    const ip = getClientIp(h.get('x-forwarded-for'));
    const userAgent = h.get('user-agent') || 'unknown';

    const dayKey = getDayKey();
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

export async function trackLinkView(itemId: string): Promise<void> {
  try {
    const h = await headers();
    const ip = getClientIp(h.get('x-forwarded-for'));
    const userAgent = h.get('user-agent') || 'unknown';

    const dayKey = getDayKey();
    const uniqueKey = `views:link:${itemId}:unique:${dayKey}`;
    const totalKey = `views:link:${itemId}:daily:${dayKey}`;
    const visitorId = makeVisitorId(ip, userAgent, `${itemId}|${dayKey}`);

    const added = await kv.sadd(uniqueKey, visitorId);
    await kv.expire(uniqueKey, 60 * 60 * 24 * 8);

    if (added === 1) {
      await kv.incr(totalKey);
    }
  } catch {
    // Ignore analytics failures so redirects still work.
  }
}

export interface DailyLinkViewsRow {
  itemId: string;
  counts: number[];
  total: number;
}

export interface DailyLinkViewsSnapshot {
  dates: string[];
  rows: DailyLinkViewsRow[];
}

export async function getDailyLinkViews(itemIds: string[], days = 7): Promise<DailyLinkViewsSnapshot> {
  const dates = Array.from({ length: days }, (_, index) => getDayKey(index - (days - 1)));

  try {
    const rows = await Promise.all(itemIds.map(async (itemId) => {
      const counts = await Promise.all(dates.map(async (date) => {
        const value = await kv.get<number>(`views:link:${itemId}:daily:${date}`);
        return typeof value === 'number' ? value : 0;
      }));

      return {
        itemId,
        counts,
        total: counts.reduce((sum, count) => sum + count, 0),
      };
    }));

    return { dates, rows };
  } catch {
    return {
      dates,
      rows: itemIds.map((itemId) => ({
        itemId,
        counts: dates.map(() => 0),
        total: 0,
      })),
    };
  }
}
