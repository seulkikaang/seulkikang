import ProfileHeader from '@/components/ProfileHeader';
import BentoGrid from '@/components/BentoGrid';
import { parseBentoData } from '@/utils/data-parser';
import rawData from '@/data/bento-data.json';

export default function Home() {
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
