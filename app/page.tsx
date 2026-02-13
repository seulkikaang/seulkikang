import ProfileHeader from '@/components/ProfileHeader';
import BentoGrid from '@/components/BentoGrid';
import { parseBentoData } from '@/utils/data-parser';
import { kv } from '@vercel/kv';
import rawDataFromJson from '@/data/bento-data.json';

export default async function Home() {
  let rawData: any;
  try {
    rawData = await kv.get('bento_data');
    if (!rawData) {
      rawData = rawDataFromJson;
    }
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
        <div className="mt-8">
          <BentoGrid items={profileData.items} />
        </div>
      </div>
    </main>
  );
}
