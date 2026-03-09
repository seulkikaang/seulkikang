import { NextResponse } from 'next/server';
import rawData from '@/data/bento-data.json';
import { mergeWithFallbackData } from '@/utils/raw-data';
import { parseBentoData } from '@/utils/data-parser';
import { getDailyHomeViews, getDailyLinkViews } from '@/utils/view-counter';
import { FIXED_SOCIAL_LINKS, getItemDisplayTitle, getLinkGroupLabel } from '@/utils/link-presentation';
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
  const catalog = [
    ...FIXED_SOCIAL_LINKS.map((item) => ({
      id: item.id,
      href: item.href,
      title: item.title,
      group: '프로필 상단 링크',
    })),
    ...profile.items
      .filter((item) => !FIXED_SOCIAL_LINKS.some((fixed) => fixed.id === item.id))
      .map((item) => ({
        id: item.id,
        href: item.href ?? '',
        title: getItemDisplayTitle(item),
        group: getLinkGroupLabel(item),
      })),
  ];
  const dailyVisitors = await getDailyHomeViews(7);
  const stats = await getDailyLinkViews(catalog.map((item) => item.id), 7);

  const links = catalog.map((item) => {
    const matched = stats.rows.find((row) => row.itemId === item.id);
    const counts = matched?.counts ?? stats.dates.map(() => 0);

    return {
      itemId: item.id,
      title: item.title,
      href: item.href,
      group: item.group,
      todayClicks: counts.at(-1) ?? 0,
      totalClicks: counts.reduce((sum, count) => sum + count, 0),
    };
  }).sort((left, right) => right.totalClicks - left.totalClicks);

  return NextResponse.json({
    dates: dailyVisitors.dates,
    dailyVisitors: dailyVisitors.counts,
    links,
  });
}
