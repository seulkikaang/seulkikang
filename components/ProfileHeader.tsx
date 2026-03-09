import React from 'react';
import { resolveImageSrc } from '@/utils/image-src';
import { SocialLinkItem } from '@/utils/link-presentation';

interface ProfileHeaderProps {
    name: string;
    handle: string;
    image: string;
    bio: string[];
    socialLinks?: SocialLinkItem[];
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ name, handle, image, bio, socialLinks = [] }) => {
    return (
        <div className="flex flex-col items-center pb-4 text-center">
            <p className="type-display text-xl font-semibold italic tracking-[0.08em] text-[color:var(--accent)]">
                {handle ? `@${handle}` : "curated links"}
            </p>

            <div className="mt-4 relative h-32 w-32 overflow-hidden rounded-[2rem] border border-[color:var(--frame)] bg-[color:var(--paper-strong)] p-1 shadow-[0_18px_40px_-34px_rgba(53,41,31,0.75)] md:h-36 md:w-36">
                <img src={resolveImageSrc(image)} alt={name} className="h-full w-full object-cover" />
            </div>

            <h1 className="type-display mt-5 max-w-[16rem] text-[3.4rem] leading-[0.86] font-semibold tracking-[-0.04em] text-[color:var(--foreground)] md:text-[3.8rem]">
                {name}
            </h1>

            <div className="mt-3 max-w-sm space-y-1.5 px-4 text-[15px] leading-[1.55] text-[color:var(--text-muted)] md:text-base">
                {bio.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                ))}
            </div>

            {socialLinks.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                    {socialLinks.map((link) => (
                        <a
                            key={link.id}
                            href={link.href ? `/out/${link.id}` : '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={link.title}
                            title={link.title}
                            className="group rounded-[16px] border border-[color:var(--frame)] bg-[rgba(255,255,255,0.38)] p-1.5 shadow-[0_14px_28px_-24px_rgba(53,41,31,0.95)] transition-transform duration-200 hover:-translate-y-0.5"
                        >
                            <img
                                src={resolveImageSrc(link.iconSrc)}
                                alt={link.title}
                                className="h-10 w-10 rounded-[12px] object-cover opacity-92 transition-opacity duration-200 group-hover:opacity-100"
                            />
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProfileHeader;
