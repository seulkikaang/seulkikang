import { CategoryOption, DEFAULT_CATEGORY_OPTIONS, FIXED_SOCIAL_LINKS } from './link-presentation';

export interface SocialChannel {
  id: string;
  title: string;
  href: string;
  iconSrc: string;
  platform: string;
}

export const FIXED_SOCIAL_LINKS_DEFAULT: SocialChannel[] = FIXED_SOCIAL_LINKS.map((l) => ({
  id: l.id,
  title: l.title,
  href: l.href,
  iconSrc: l.iconSrc,
  platform: l.id === 'oCxaY1i7VlF9ZmBW' ? 'linkedin'
    : l.id === '6dLbjJ1sC79nZNng' ? 'threads'
    : l.id === 'O7qvJhTRMm1z1jRB' ? 'instagram'
    : l.id === 'fPTrE1OHkRKzN5bK' ? 'brunch'
    : 'custom',
}));

export interface ProfileSettings {
  name: string;
  handle: string;
  bio: string[];
  profileImage: string;
  showViews: boolean;
  socialLinks: SocialChannel[];
  categories: CategoryOption[];
}

export const SOCIAL_PLATFORM_OPTIONS = [
  { value: 'linkedin', label: 'LinkedIn', defaultIcon: '/social/linkedin.svg' },
  { value: 'threads', label: 'Threads', defaultIcon: '/social/threads.svg' },
  { value: 'instagram', label: 'Instagram', defaultIcon: '/social/instagram.svg' },
  { value: 'brunch', label: 'Brunch', defaultIcon: '/social/brunch.svg' },
  { value: 'youtube', label: 'YouTube', defaultIcon: '/social/youtube.svg' },
  { value: 'twitter', label: 'X (Twitter)', defaultIcon: '/social/twitter.svg' },
  { value: 'facebook', label: 'Facebook', defaultIcon: '/social/facebook.svg' },
  { value: 'github', label: 'GitHub', defaultIcon: '/social/github.svg' },
  { value: 'tiktok', label: 'TikTok', defaultIcon: '/social/tiktok.svg' },
  { value: 'blog', label: 'Blog', defaultIcon: '/social/blog.svg' },
  { value: 'email', label: 'Email', defaultIcon: '/social/email.svg' },
  { value: 'custom', label: 'Custom', defaultIcon: '' },
] as const;

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

export function getProfileSettings(raw: unknown): ProfileSettings {
  const root = toRecord(raw);
  const ps = toRecord(root.profileSettings);

  const name = typeof ps.name === 'string' ? ps.name : '';
  const handle = typeof ps.handle === 'string' ? ps.handle : '';
  const profileImage = typeof ps.profileImage === 'string' ? ps.profileImage : '';
  const showViews = typeof ps.showViews === 'boolean' ? ps.showViews : true;

  const bio: string[] = Array.isArray(ps.bio)
    ? (ps.bio as unknown[]).filter((b): b is string => typeof b === 'string')
    : [];

  const socialLinks: SocialChannel[] = Array.isArray(ps.socialLinks)
    ? (ps.socialLinks as unknown[]).map((link) => {
        const l = toRecord(link);
        return {
          id: typeof l.id === 'string' ? l.id : Math.random().toString(36).substring(7),
          title: typeof l.title === 'string' ? l.title : '',
          href: typeof l.href === 'string' ? l.href : '',
          iconSrc: typeof l.iconSrc === 'string' ? l.iconSrc : '',
          platform: typeof l.platform === 'string' ? l.platform : 'custom',
        };
      })
    : [];

  const categories: CategoryOption[] = Array.isArray(ps.categories)
    ? (ps.categories as unknown[]).map((cat) => {
        const c = toRecord(cat);
        return {
          value: typeof c.value === 'string' ? c.value : '',
          label: typeof c.label === 'string' ? c.label : '',
        };
      }).filter((c) => c.value && c.label)
    : [];

  return {
    name,
    handle,
    bio,
    profileImage,
    showViews,
    socialLinks: socialLinks.length > 0 ? socialLinks : FIXED_SOCIAL_LINKS_DEFAULT,
    categories: categories.length > 0 ? categories : DEFAULT_CATEGORY_OPTIONS,
  };
}

export const DEFAULT_PROFILE_SETTINGS: ProfileSettings = {
  name: '',
  handle: '',
  bio: [],
  profileImage: '',
  showViews: true,
  socialLinks: [],
  categories: DEFAULT_CATEGORY_OPTIONS,
};
