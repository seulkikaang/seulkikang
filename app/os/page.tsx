import type { Metadata } from 'next';
import OsPage from './OsPage';
import { ko } from './content';

export const metadata: Metadata = {
  title: ko.meta.title,
  description: ko.meta.description,
  metadataBase: new URL('https://experience.ai.kr'),
  alternates: {
    canonical: '/os',
    languages: { ko: '/os', en: '/os/en', 'x-default': '/os' },
  },
  openGraph: { title: ko.meta.title, description: ko.meta.description, locale: 'ko_KR' },
};

export default function Page() {
  return <OsPage content={ko} />;
}
