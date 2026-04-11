export type FaviconType = 'emoji' | 'image';

export interface SiteSettings {
  title: string;
  faviconType: FaviconType;
  faviconEmoji: string;
  faviconImage: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  title: 'Seulki Kang',
  faviconType: 'emoji',
  faviconEmoji: '😊',
  faviconImage: '',
};

export function getSiteSettings(raw: any): SiteSettings {
  const site = raw?.site ?? {};

  const title = typeof site.title === 'string' && site.title.trim()
    ? site.title.trim()
    : DEFAULT_SITE_SETTINGS.title;

  const faviconType: FaviconType = site.faviconType === 'image' ? 'image' : 'emoji';
  const faviconEmoji = typeof site.faviconEmoji === 'string' && site.faviconEmoji.trim()
    ? site.faviconEmoji.trim()
    : DEFAULT_SITE_SETTINGS.faviconEmoji;
  const faviconImage = typeof site.faviconImage === 'string' ? site.faviconImage.trim() : '';

  return {
    title,
    faviconType,
    faviconEmoji,
    faviconImage,
  };
}

export function getFaviconUrl(settings: SiteSettings): string {
  if (settings.faviconType === 'image' && settings.faviconImage) {
    return settings.faviconImage;
  }

  const emoji = settings.faviconEmoji || DEFAULT_SITE_SETTINGS.faviconEmoji;
  return `/api/favicon?emoji=${encodeURIComponent(emoji)}`;
}
