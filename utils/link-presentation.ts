import { BentoItem } from '@/types/bento';

export const DISPLAY_HANDLE = 'marketer.ai.seulki';
export const SOCIAL_LINK_IDS = [
  'oCxaY1i7VlF9ZmBW',
  '6dLbjJ1sC79nZNng',
  'O7qvJhTRMm1z1jRB',
  'fPTrE1OHkRKzN5bK',
] as const;

export const FIXED_SOCIAL_LINKS = [
  {
    id: 'oCxaY1i7VlF9ZmBW',
    href: 'https://linkedin.com/in/seulki-kang',
    title: '링크드인',
    iconSrc: '/social/linkedin.svg',
  },
  {
    id: '6dLbjJ1sC79nZNng',
    href: 'https://www.threads.com/@marketer.seulki.ai',
    title: '스레드',
    iconSrc: '/social/threads.svg',
  },
  {
    id: 'O7qvJhTRMm1z1jRB',
    href: 'https://www.instagram.com/marketer.seulki.ai/',
    title: '인스타그램',
    iconSrc: '/social/instagram.svg',
  },
  {
    id: 'fPTrE1OHkRKzN5bK',
    href: 'https://brunch.co.kr/@sukistory',
    title: '브런치',
    iconSrc: '/social/brunch.svg',
  },
] as const;

export type LinkGroupId =
  | 'education'
  | 'community'
  | 'stories'
  | 'ai-tools';

export interface LinkGroupSection {
  id: LinkGroupId;
  title: string;
  items: BentoItem[];
}

export interface SocialLinkItem {
  id: string;
  href?: string;
  title: string;
  iconSrc: string;
}

export const CATEGORY_OPTIONS = [
  { value: 'education', label: '강의 & 챌린지 & 전자책' },
  { value: 'community', label: '커뮤니티 참여' },
  { value: 'stories', label: '기사 + 영상' },
  { value: 'ai-tools', label: 'AI 툴 추천' },
] as const;

export const FEATURED_LINK_ID = '6lxZn7qTuxzOrWVq';

const GROUP_TITLES: Record<LinkGroupId, string> = {
  education: '강의 & 챌린지 & 전자책',
  community: '커뮤니티 참여',
  stories: '기사 + 영상',
  'ai-tools': 'AI 툴 추천',
};

const GROUP_ORDER: LinkGroupId[] = [
  'education',
  'community',
  'stories',
  'ai-tools',
];

const ITEM_GROUPS: Record<string, LinkGroupId> = {
  '6lxZn7qTuxzOrWVq': 'community',
  qwyBoLLHJ1ByLD8n: 'education',
  D6AvzG4NEInLxtlP: 'education',
  crHmxxmCv8FPTegZ: 'education',
  eDw5LqjKhmPGvzFj: 'education',
  AjMXxfH68vwoUQ1z: 'education',
  svk9l7IYWgMZ0wUR: 'education',
  DnX1DcWfrPsUXfeK: 'community',
  sjHoVNRtTtaKsrAu: 'community',
  SbdPDh8npRTt6lrG: 'community',
  aqb1qjZzRdPIe23d: 'community',
  XomURjdAVur84sBQ: 'community',
  '3237glxyooooM2yV': 'stories',
  AOjIettJPPaAmw4f: 'stories',
  V31BrdI3cr28m4zu: 'stories',
  DJLjokMyf0cIygdP: 'ai-tools',
  If8B6All2rnzM8CG: 'ai-tools',
};

function isLinkGroupId(value: string): value is LinkGroupId {
  return CATEGORY_OPTIONS.some((option) => option.value === value);
}

export function getSocialLinks(): SocialLinkItem[] {
  return FIXED_SOCIAL_LINKS.map((item) => ({
    ...item,
  }));
}

export function getFeaturedLink(items: BentoItem[]): BentoItem | undefined {
  return items.find((item) => item.id === FEATURED_LINK_ID);
}

export function getFixedSocialLink(id: string): SocialLinkItem | undefined {
  return FIXED_SOCIAL_LINKS.find((item) => item.id === id);
}

export function getLinkGroupId(item: BentoItem): LinkGroupId {
  if (typeof item.category === 'string' && isLinkGroupId(item.category)) {
    return item.category;
  }

  const presetGroup = ITEM_GROUPS[item.id];
  if (presetGroup) return presetGroup;

  const title = getItemDisplayTitle(item).toLowerCase();
  const href = (item.href ?? '').toLowerCase();

  if (
    href.includes('inf.run') ||
    href.includes('classu.co.kr') ||
    href.includes('fastcampus') ||
    href.includes('calendar.app.google') ||
    href.includes('latpeed.com') ||
    href.includes('notion.site') ||
    title.includes('강의') ||
    title.includes('챌린지') ||
    title.includes('전자책') ||
    title.includes('가이드') ||
    title.includes('컨설팅')
  ) {
    return 'education';
  }

  if (
    href.includes('youtube.com') ||
    href.includes('folin.co') ||
    href.includes('ditoday.com') ||
    title.includes('영상') ||
    title.includes('기사')
  ) {
    return 'stories';
  }

  if (
    href.includes('open.kakao.com') ||
    href.includes('afterworkai.club') ||
    href.includes('linkedin.com/groups') ||
    href.includes('usergroups.tableau.com') ||
    href.includes('naver.me') ||
    title.includes('커뮤니티') ||
    title.includes('밋업') ||
    title.includes('그룹')
  ) {
    return 'community';
  }

  if (
    href.includes('coupang.com') ||
    title.includes('젠스파크') ||
    title.includes('ai 툴')
  ) {
    return 'ai-tools';
  }

  return 'education';
}

export function getLinkGroupLabel(item: BentoItem): string {
  return GROUP_TITLES[getLinkGroupId(item)];
}

export function getItemDisplayTitle(item: BentoItem): string {
  if (item.title.trim()) return item.title.trim();
  if (!item.href) return 'Untitled';

  try {
    return new URL(item.href).hostname.replace(/^www\./, '');
  } catch {
    return 'Untitled';
  }
}

export function groupBentoItems(items: BentoItem[]): LinkGroupSection[] {
  const grouped = new Map<LinkGroupId, BentoItem[]>();

  for (const groupId of GROUP_ORDER) {
    grouped.set(groupId, []);
  }

  for (const item of items) {
    if (
      SOCIAL_LINK_IDS.includes(item.id as typeof SOCIAL_LINK_IDS[number]) ||
      item.id === FEATURED_LINK_ID
    ) {
      continue;
    }
    grouped.get(getLinkGroupId(item))?.push(item);
  }

  return GROUP_ORDER.map((groupId) => {
    const groupItems = grouped.get(groupId) ?? [];
    const orderedItems = groupItems.sort((left, right) => {
      if (groupId !== 'ai-tools') return 0;
      if (left.id === 'If8B6All2rnzM8CG') return 1;
      if (right.id === 'If8B6All2rnzM8CG') return -1;
      return 0;
    });

    return {
      id: groupId,
      title: GROUP_TITLES[groupId],
      items: orderedItems,
    };
  }).filter((section) => section.items.length > 0);
}
