import { NextResponse } from 'next/server';
import rawData from '@/data/bento-data.json';
import { mergeWithFallbackData } from '@/utils/raw-data';
import { parseBentoData } from '@/utils/data-parser';
import { getDailyLinkViews } from '@/utils/view-counter';
import { getItemDisplayTitle, getLinkGroupLabel } from '@/utils/link-presentation';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';

export async function GET() {
  let merged = rawData;

  try {
    const kvData = await kv.get('bento_data');
    merged = mergeWithFallbackData(kvData, rawData);
  } catch (error) {
    console.error('Link views fetch error:', error);
  }

  const profile = parseBentoData(merged);
  const stats = await getDailyLinkViews(profile.items.map((item) => item.id), 7);

  const rows = profile.items.map((item) => {
    const matched = stats.rows.find((row) => row.itemId === item.id);

    return {
      itemId: item.id,
      title: getItemDisplayTitle(item),
      href: item.href ?? '',
      group: getLinkGroupLabel(item),
      counts: matched?.counts ?? stats.dates.map(() => 0),
      total: matched?.total ?? 0,
    };
  });

  return NextResponse.json({
    dates: stats.dates,
    rows,
  });
}
