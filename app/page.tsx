import ProfileHeader from '@/components/ProfileHeader';
import BentoGrid from '@/components/BentoGrid';
import { parseBentoData } from '@/utils/data-parser';
import { mergeWithFallbackData } from '@/utils/raw-data';
import {
  DISPLAY_HANDLE,
  UNCATEGORIZED_VALUE,
  getFeaturedLink,
  getSocialLinks,
  groupBentoItems,
  setCategories,
} from '@/utils/link-presentation';
import { getProfileSettings, ProfileSettings } from '@/utils/profile-settings';
import { trackHomeView } from '@/utils/view-counter';
import { kv } from '@vercel/kv';
import rawDataFromJson from '@/data/bento-data.json';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let rawData: unknown = rawDataFromJson;
  const viewCount = await trackHomeView();
  try {
    const kvData = await kv.get('bento_data');
    rawData = mergeWithFallbackData(kvData, rawDataFromJson);
  } catch (error) {
    console.error('KV Fetch error:', error);
    rawData = rawDataFromJson;
  }

  const profileData = parseBentoData(rawData);
  const profileSettings = getProfileSettings(rawData);

  // Load custom categories if available
  if (profileSettings.categories.length > 0) {
    setCategories(profileSettings.categories);
  }

  const featuredLink = getFeaturedLink(profileData.items);
  const socialLinks = profileSettings.socialLinks.length > 0
    ? profileSettings.socialLinks.map((link) => ({
        id: link.id,
        href: link.href,
        title: link.title,
        iconSrc: link.iconSrc,
      }))
    : getSocialLinks();
  const sections = groupBentoItems(profileData.items);

  return (
    <main className="site-shell flex min-h-screen justify-center px-4 py-5 sm:px-6 sm:py-8">
      <div className="paper-panel w-full max-w-[428px] rounded-[34px] border border-[color:var(--frame)] px-5 pb-8 pt-6 sm:px-6">
        <ProfileHeader
          name={profileSettings.name || profileData.name}
          handle={profileSettings.handle || DISPLAY_HANDLE}
          image={profileSettings.profileImage || profileData.image}
          bio={profileSettings.bio.length > 0 ? profileSettings.bio : profileData.bio}
          socialLinks={socialLinks}
        />
        {profileSettings.showViews && (
          <div className="dotted-rule mt-2 flex items-center justify-end px-1 py-2">
            <span className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--accent)]/80">
              {viewCount.toLocaleString()} views
            </span>
          </div>
        )}
        <div className="mt-4 space-y-6">
          {featuredLink && (
            <section>
              <BentoGrid items={[featuredLink]} />
            </section>
          )}
          {sections.map((section) => (
            <section key={section.id}>
              {section.id !== UNCATEGORIZED_VALUE && (
                <div className="mb-3 flex items-center gap-3 px-1">
                  <span className="h-px flex-1 bg-[rgba(156,37,49,0.22)]" />
                  <h2 className="type-display text-[1.1rem] font-semibold italic text-[color:var(--accent)]">
                    {section.title}
                  </h2>
                  <span className="h-px flex-1 bg-[rgba(156,37,49,0.22)]" />
                </div>
              )}
              <BentoGrid items={section.items} />
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
