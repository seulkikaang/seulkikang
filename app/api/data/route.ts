import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import rawData from '@/data/bento-data.json';
import { mergeWithFallbackData } from '@/utils/raw-data';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const data = await kv.get('bento_data');
        return NextResponse.json(mergeWithFallbackData(data, rawData));
    } catch (error) {
        console.error('KV Fetch error:', error);
        return NextResponse.json(rawData); // Fallback to JSON on error
    }
}
