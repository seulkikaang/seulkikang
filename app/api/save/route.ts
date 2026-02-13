import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import rawDataFromJson from '@/data/bento-data.json';
import { mergeWithFallbackData } from '@/utils/raw-data';

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // We'll store the entire profile data structure in KV
        // For simplicity, we assume 'data.items' is what we update
        // In a real app, we'd fetch the current data first, but here we can just overwrite the items
        // or expect the full state from the admin.

        // Let's get the current data to preserve other fields (like fallback)
        const currentData = await kv.get('bento_data');
        const baseData = mergeWithFallbackData(currentData, rawDataFromJson);

        const updatedData = {
            ...baseData,
            profile: {
                ...(baseData?.profile || {}),
                bento: {
                    ...(baseData?.profile?.bento || {}),
                    items: data.items.map((item: any) => ({
                        data: {
                            ...(item.raw_data || {}),
                            id: item.id,
                            href: item.href,
                            style: item.style,
                            overrides: {
                                ...(item.raw_data?.overrides || {}),
                                title: item.title,
                                ogImage: item.image,
                            }
                        },
                        position: item.position
                    }))
                }
            }
        };

        await kv.set('bento_data', updatedData);
        revalidatePath('/');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('KV Save error:', error);
        return NextResponse.json({ success: false, error: 'Failed to save data' }, { status: 500 });
    }
}
