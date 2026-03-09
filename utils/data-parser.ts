import { ProfileData, BentoItem, BentoItemType } from '@/types/bento';

function toRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

export function parseBentoData(raw: unknown): ProfileData {
    const root = toRecord(raw);
    const profile = toRecord(root.profile);
    const bento = toRecord(profile.bento);
    const rawItems = Array.isArray(bento.items) ? bento.items : [];
    const bio = toRecord(profile.bio);
    const bioContent = Array.isArray(bio.content) ? bio.content : [];
    const fallback = toRecord(root.fallback);

    const items: BentoItem[] = rawItems.map((item, index: number) => {
        const rawItem = toRecord(item);
        const data = toRecord(rawItem.data);
        const position = toRecord(rawItem.position);
        const overrides = toRecord(data.overrides);
        const href = typeof data.href === 'string' ? data.href : undefined;
        const metadataKey = href ? `/urlmetadata/${encodeURIComponent(href)}` : '';
        const metadata = metadataKey ? toRecord(fallback[metadataKey]) : undefined;
        const metadataImageUrl = metadata && typeof metadata.imageUrl === 'string' ? metadata.imageUrl : undefined;
        const metadataFaviconUrl = metadata && typeof metadata.faviconUrl === 'string' ? metadata.faviconUrl : undefined;
        const metadataTouchIconUrl = metadata && typeof metadata.touchIconUrl === 'string' ? metadata.touchIconUrl : undefined;

        const overrideTitle = overrides.title;
        const overrideTitleDoc = toRecord(overrideTitle);
        const overrideTitleContent = Array.isArray(overrideTitleDoc.content) ? overrideTitleDoc.content : [];
        const firstParagraph = toRecord(overrideTitleContent[0]);
        const paragraphContent = Array.isArray(firstParagraph.content) ? firstParagraph.content : [];
        const firstTextNode = toRecord(paragraphContent[0]);
        const title = typeof overrideTitle === 'string'
            ? overrideTitle
            : typeof firstTextNode.text === 'string'
                ? firstTextNode.text
                : "";

        const itemType: BentoItemType = typeof data.type === 'string' ? data.type as BentoItemType : 'link';
        const desktopPosition = toRecord(position.desktop);
        const mobilePosition = toRecord(position.mobile);
        const style = toRecord(data.style);

        return {
            id: typeof data.id === 'string' ? data.id : `item-${index}`,
            type: itemType,
            href,
            title: title || (typeof data.title === 'string' ? data.title : "Untitled"),
            category: typeof overrides.category === 'string'
                ? overrides.category
                : typeof data.category === 'string'
                    ? data.category
                    : undefined,
            host: typeof data.host === 'string' ? data.host : undefined,
            image: typeof overrides.ogImage === 'string'
                ? overrides.ogImage
                : metadataImageUrl,
            icon: typeof overrides.icon === 'string'
                ? overrides.icon
                : metadataFaviconUrl
                    ? metadataFaviconUrl
                    : metadataTouchIconUrl
                        ? metadataTouchIconUrl
                        : undefined,
            raw_data: data,
            style: {
                desktop: typeof style.desktop === 'string' ? style.desktop : '2x2',
                mobile: typeof style.mobile === 'string' ? style.mobile : '2x2',
            },
            position: {
                desktop: {
                    x: typeof desktopPosition.x === 'number' ? desktopPosition.x : 1,
                    y: typeof desktopPosition.y === 'number' ? desktopPosition.y : 1,
                },
                mobile: {
                    x: typeof mobilePosition.x === 'number' ? mobilePosition.x : 1,
                    y: typeof mobilePosition.y === 'number' ? mobilePosition.y : 1,
                },
            },
        };
    });

    return {
        name: typeof profile.name === 'string' ? profile.name : "Unknown",
        handle: typeof profile.handle === 'string' ? profile.handle : "",
        image: typeof profile.image === 'string' ? profile.image : "",
        bio: bioContent
            .map((paragraph) => {
                const paragraphRecord = toRecord(paragraph);
                const content = Array.isArray(paragraphRecord.content) ? paragraphRecord.content : [];
                const firstNode = toRecord(content[0]);
                return typeof firstNode.text === 'string' ? firstNode.text : "";
            })
            .filter(Boolean),
        items,
    };
}
