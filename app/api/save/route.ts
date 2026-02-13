import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const filePath = path.join(process.cwd(), 'data', 'bento-data.json');

        // In a real app we'd want to be careful here, but for this prototype:
        // Update only the items and potentially profile info
        const currentData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        const updatedData = {
            ...currentData,
            profile: {
                ...currentData.profile,
                bento: {
                    ...currentData.profile.bento,
                    items: data.items.map((item: any) => ({
                        data: {
                            ...item.raw_data, // Preserve original Bento schema if needed, or simplify
                            id: item.id,
                            href: item.href,
                            style: item.style,
                            overrides: {
                                ...item.raw_data?.overrides,
                                title: item.title,
                                ogImage: item.image,
                            }
                        },
                        position: item.position
                    }))
                }
            }
        };

        fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to save data' }, { status: 500 });
    }
}
