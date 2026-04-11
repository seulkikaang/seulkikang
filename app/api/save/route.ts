import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import rawDataFromJson from '@/data/bento-data.json';
import { mergeWithFallbackData } from '@/utils/raw-data';
import { getSiteSettings } from '@/utils/site-settings';
import { BentoItem } from '@/types/bento';

interface SaveRequestBody {
    items?: BentoItem[];
    site?: {
        title?: string;
        faviconType?: string;
        faviconEmoji?: string;
        faviconImage?: string;
    };
    profileSettings?: {
        name?: string;
        handle?: string;
        bio?: string[];
        profileImage?: string;
        showViews?: boolean;
        socialLinks?: Array<{
            id: string;
            title: string;
            href: string;
            iconSrc: string;
            platform: string;
        }>;
        categories?: Array<{
            value: string;
            label: string;
        }>;
    };
}

function toRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

export async function POST(request: Request) {
    try {
        const data = await request.json() as SaveRequestBody;

        const currentData = await kv.get('bento_data');
        const baseData = mergeWithFallbackData(currentData, rawDataFromJson);
        const currentSite = getSiteSettings(baseData);
        const requestedSite = data.site ?? {};

        const nextSite = {
            title: typeof requestedSite.title === 'string' && requestedSite.title.trim()
                ? requestedSite.title.trim()
                : currentSite.title,
            faviconType: requestedSite.faviconType === 'image' ? 'image' : 'emoji',
            faviconEmoji: typeof requestedSite.faviconEmoji === 'string' && requestedSite.faviconEmoji.trim()
                ? requestedSite.faviconEmoji.trim()
                : currentSite.faviconEmoji,
            faviconImage: typeof requestedSite.faviconImage === 'string'
                ? requestedSite.faviconImage.trim()
                : currentSite.faviconImage,
        };

        const nextProfileSettings = data.profileSettings ?? toRecord(baseData).profileSettings ?? {};

        const updatedData = {
            ...baseData,
            profileSettings: nextProfileSettings,
            profile: {
                ...(baseData?.profile || {}),
                bento: {
                    ...(baseData?.profile?.bento || {}),
                    items: (data.items ?? []).map((item) => {
                        const rawData = toRecord(item.raw_data);
                        const rawOverrides = toRecord(rawData.overrides);

                        return {
                            data: {
                                ...rawData,
                                id: item.id,
                                href: item.href,
                                category: item.category,
                                style: item.style,
                                overrides: {
                                    ...rawOverrides,
                                    title: item.title,
                                    category: item.category,
                                    ogImage: item.image,
                                    icon: item.icon,
                                }
                            },
                            position: item.position
                        };
                    })
                }
            },
            site: nextSite,
        };

        await kv.set('bento_data', updatedData);
        revalidatePath('/');
        revalidatePath('/admin');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('KV Save error:', error);
        return NextResponse.json({ success: false, error: 'Failed to save data' }, { status: 500 });
    }
}
