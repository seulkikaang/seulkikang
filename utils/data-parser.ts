import { ProfileData, BentoItem, BentoItemType } from '@/types/bento';

export function parseBentoData(raw: any): ProfileData {
    const profile = raw?.profile ?? {};
    const rawItems = Array.isArray(profile?.bento?.items) ? profile.bento.items : [];
    const bioContent = Array.isArray(profile?.bio?.content) ? profile.bio.content : [];
    const fallback = raw?.fallback ?? {};

    const items: BentoItem[] = rawItems.map((item: any, index: number) => {
        const data = item?.data ?? {};
        const position = item?.position ?? {};
        const href = typeof data?.href === 'string' ? data.href : undefined;
        const metadataKey = href ? `/urlmetadata/${encodeURIComponent(href)}` : '';
        const metadata = metadataKey ? fallback?.[metadataKey] : undefined;

        // Extract title from rich text doc if available
        let title = typeof data.overrides?.title === 'string'
            ? data.overrides.title
            : data.overrides?.title?.content?.[0]?.content?.[0]?.text || "";

        const itemType: BentoItemType = (data.type as BentoItemType) || 'link';

        return {
            id: data.id || `item-${index}`,
            type: itemType,
            href,
            title: title || data.title || "Untitled",
            host: data.host,
            image: data.overrides?.ogImage || metadata?.imageUrl,
            icon: data.overrides?.icon || metadata?.faviconUrl || metadata?.touchIconUrl,
            style: {
                desktop: data?.style?.desktop || '2x2',
                mobile: data?.style?.mobile || '2x2',
            },
            position: {
                desktop: position?.desktop || { x: 1, y: 1 },
                mobile: position?.mobile || { x: 1, y: 1 },
            },
        };
    });

    return {
        name: profile?.name || "Unknown",
        handle: profile?.handle || "",
        image: profile?.image || "",
        bio: bioContent.map((p: any) => p?.content?.[0]?.text || "").filter(Boolean),
        items,
    };
}
