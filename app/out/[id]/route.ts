import { NextRequest, NextResponse } from 'next/server';
import rawData from '@/data/bento-data.json';
import { mergeWithFallbackData } from '@/utils/raw-data';
import { parseBentoData } from '@/utils/data-parser';
import { trackLinkView } from '@/utils/view-counter';
import { getFixedSocialLink } from '@/utils/link-presentation';
import { getProfileSettings } from '@/utils/profile-settings';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const fallbackUrl = new URL('/', request.url);
  let merged = rawData;

  try {
    const kvData = await kv.get('bento_data');
    merged = mergeWithFallbackData(kvData, rawData);
  } catch {
    // Fall back to the bundled JSON when KV is unavailable.
  }

  const profile = parseBentoData(merged);
  const item = profile.items.find((entry) => entry.id === id);
  const socialLink = getProfileSettings(merged).socialLinks.find((link) => link.id === id);
  const fixedSocialLink = getFixedSocialLink(id);
  const href = item?.href ?? socialLink?.href ?? fixedSocialLink?.href;

  if (!href) {
    return NextResponse.redirect(fallbackUrl);
  }

  await trackLinkView(id);
  return NextResponse.redirect(href);
}
