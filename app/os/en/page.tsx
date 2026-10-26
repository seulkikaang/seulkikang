import type { Metadata } from 'next';
import OsPage from '../OsPage';
import { en } from '../content';

export const metadata: Metadata = {
  title: en.meta.title,
  description: en.meta.description,
  metadataBase: new URL('https://experience.ai.kr'),
  alternates: {
    canonical: '/os/en',
    languages: { ko: '/os', en: '/os/en', 'x-default': '/os' },
  },
  openGraph: { title: en.meta.title, description: en.meta.description, locale: 'en_US' },
};

export default function Page() {
  return <OsPage content={en} />;
}
