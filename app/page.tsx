import ProfileHeader from '@/components/ProfileHeader';
import BentoGrid from '@/components/BentoGrid';
import { parseBentoData } from '@/utils/data-parser';
import { mergeWithFallbackData } from '@/utils/raw-data';
import {
  DISPLAY_HANDLE,
  getDailyLinkItem,
  groupBentoItems,
} from '@/utils/link-presentation';
import { kv } from '@vercel/kv';
import rawDataFromJson from '@/data/bento-data.json';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let rawData: any = rawDataFromJson;
  try {
    const kvData = await kv.get('bento_data');
    rawData = mergeWithFallbackData(kvData, rawDataFromJson);
  } catch (error) {
    console.error('KV Fetch error:', error);
    rawData = rawDataFromJson;
  }

  const profileData = parseBentoData(rawData);
  const dailyLink = getDailyLinkItem(profileData.items);
  const sections = groupBentoItems(profileData.items);

  return (
    <main className="site-shell flex min-h-screen justify-center px-4 py-5 sm:px-6 sm:py-8">
      <div className="paper-panel w-full max-w-[428px] rounded-[34px] border border-[color:var(--frame)] px-5 pb-8 pt-6 sm:px-6">
        <ProfileHeader
          name={profileData.name}
          handle={DISPLAY_HANDLE}
          image={profileData.image}
          bio={profileData.bio}
        />
        <div className="dotted-rule mt-2 flex items-center justify-end px-1 py-2">
          {dailyLink && (
            <a
              href={`/out/${dailyLink.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="type-display text-lg font-semibold italic tracking-[0.08em] text-[color:var(--accent)] transition-opacity hover:opacity-70"
            >
              daily
            </a>
          )}
        </div>
        <div className="mt-4 space-y-6">
          {sections.map((section) => (
            <section key={section.id}>
              <div className="mb-3 flex items-center gap-3 px-1">
                <span className="h-px flex-1 bg-[rgba(156,37,49,0.22)]" />
                <h2 className="type-display text-[1.1rem] font-semibold italic text-[color:var(--accent)]">
                  {section.title}
                </h2>
                <span className="h-px flex-1 bg-[rgba(156,37,49,0.22)]" />
              </div>
              <BentoGrid items={section.items} />
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
