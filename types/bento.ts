export type BentoItemType = 'link' | 'social' | 'image' | 'text';

export interface BentoItem {
  id: string;
  type: BentoItemType;
  href?: string;
  title: string;
  category?: string;
  host?: string;
  image?: string;
  icon?: string;
  raw_data?: unknown;
  style: {
    desktop: string; // e.g. "2x2", "2x4", "1x4"
    mobile: string;
  };
  position: {
    desktop: { x: number; y: number };
    mobile: { x: number; y: number };
  };
  color?: {
    bg: string;
    text: string;
  };
}

export interface ProfileData {
  name: string;
  handle: string;
  image: string;
  bio: string[];
  items: BentoItem[];
}
