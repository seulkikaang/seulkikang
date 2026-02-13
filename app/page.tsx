import ProfileHeader from '@/components/ProfileHeader';
import BentoGrid from '@/components/BentoGrid';
import { parseBentoData } from '@/utils/data-parser';

async function getData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/data`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function Home() {
  const rawData = await getData();
  if (!rawData) return <div>Failed to load data</div>;

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
