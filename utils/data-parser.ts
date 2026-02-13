import { ProfileData, BentoItem, BentoItemType } from '@/types/bento';

export function parseBentoData(raw: any): ProfileData {
    const profile = raw.profile;
    const items: BentoItem[] = profile.bento.items.map((item: any) => {
        const data = item.data;
        const position = item.position;

        // Extract title from rich text doc if available
        let title = typeof data.overrides?.title === 'string'
            ? data.overrides.title
            : data.overrides?.title?.content?.[0]?.content?.[0]?.text || "";

        const itemType: BentoItemType = data.type as BentoItemType;

        return {
            id: data.id,
            type: itemType,
            href: data.href,
            title: title || data.title || "Untitled",
            host: data.host,
            image: data.overrides?.ogImage || raw.fallback?.[`/urlmetadata/${encodeURIComponent(data.href)}`]?.imageUrl,
            icon: raw.fallback?.[`/urlmetadata/${encodeURIComponent(data.href)}`]?.faviconUrl || raw.fallback?.[`/urlmetadata/${encodeURIComponent(data.href)}`]?.touchIconUrl,
            style: {
                desktop: data.style.desktop,
                mobile: data.style.mobile,
            },
            position: {
                desktop: position.desktop,
                mobile: position.mobile,
            },
        };
    });

    return {
        name: profile.name,
        handle: profile.handle,
        image: profile.image,
        bio: profile.bio.content.map((p: any) => p.content?.[0]?.text || ""),
        items,
    };
}
