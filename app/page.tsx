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
    <main className="min-h-screen bg-[#FDFDFD] flex justify-center">
      <div className="w-full max-w-[428px] px-6 pb-20">
        <ProfileHeader
          name={profileData.name}
          image={profileData.image}
          bio={profileData.bio}
        />
        <div className="mt-1 text-center text-xs text-gray-400">
          Views {viewCount.toLocaleString()}
        </div>
        <div className="mt-8">
          <BentoGrid items={profileData.items} />
        </div>
      </div>
    </main>
  );
}
