import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import rawData from '@/data/bento-data.json';

export async function GET() {
    try {
        const data = await kv.get('bento_data');
        if (!data) {
            // If KV is empty, return the initial data from the JSON file
            return NextResponse.json(rawData);
        }
        return NextResponse.json(data);
    } catch (error) {
        console.error('KV Fetch error:', error);
        return NextResponse.json(rawData); // Fallback to JSON on error
    }
}
