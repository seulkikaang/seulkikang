import ProfileHeader from '@/components/ProfileHeader';
import BentoGrid from '@/components/BentoGrid';
import { parseBentoData } from '@/utils/data-parser';
import { mergeWithFallbackData } from '@/utils/raw-data';
import { trackHomeView } from '@/utils/view-counter';
import { kv } from '@vercel/kv';
import rawDataFromJson from '@/data/bento-data.json';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let rawData: any = rawDataFromJson;
  const viewCount = await trackHomeView();
  try {
    const kvData = await kv.get('bento_data');
    rawData = mergeWithFallbackData(kvData, rawDataFromJson);
  } catch (error) {
    console.error('KV Fetch error:', error);
    rawData = rawDataFromJson;
  }

  const profileData = parseBentoData(rawData);

  return (
    <main className="site-shell flex min-h-screen justify-center px-4 py-5 sm:px-6 sm:py-8">
      <div className="paper-panel w-full max-w-[428px] rounded-[34px] border border-[color:var(--frame)] px-5 pb-8 pt-6 sm:px-6">
        <ProfileHeader
          name={profileData.name}
          handle={profileData.handle}
          image={profileData.image}
          bio={profileData.bio}
        />
        <div className="dotted-rule mt-2 flex items-center justify-between px-1 py-2 text-[10px] uppercase tracking-[0.32em] text-[color:var(--accent)]">
          <span>Selected links</span>
          <span>{viewCount.toLocaleString()} views</span>
        </div>
        <div className="mt-4">
          <BentoGrid items={profileData.items} />
        </div>
      </div>
    </main>
  );
}
