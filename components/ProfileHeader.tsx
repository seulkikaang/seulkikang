import React from 'react';
import { resolveImageSrc } from '@/utils/image-src';

interface ProfileHeaderProps {
    name: string;
    image: string;
    bio: string[];
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ name, image, bio }) => {
    return (
        <div className="flex flex-col items-center pt-12 pb-8 text-center">
            <div className="relative h-32 w-32 overflow-hidden rounded-full ring-4 ring-gray-50 md:h-40 md:w-40">
                <img src={resolveImageSrc(image)} alt={name} className="h-full w-full object-cover" />
            </div>

            <h1 className="mt-8 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                {name}
            </h1>

            <div className="mt-4 max-w-sm space-y-1.5 text-base text-gray-500 md:text-lg">
                {bio.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                ))}
            </div>
        </div>
    );
};

export default ProfileHeader;
