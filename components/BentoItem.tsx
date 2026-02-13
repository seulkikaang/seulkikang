import React from 'react';
import { BentoItem as BentoItemData } from '@/types/bento';
import { ExternalLink } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BentoItemProps {
    item: BentoItemData;
}

const BentoItem: React.FC<BentoItemProps> = ({ item }) => {
    return (
        <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "group relative flex flex-row items-center overflow-hidden rounded-[20px] bg-white p-4 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-xl hover:-translate-y-1",
                "col-span-4 aspect-[4/1]"
            )}
        >
            <div className="flex flex-1 flex-col justify-center pr-3 min-w-0">
                <div className="mb-1 min-w-0">
                    {item.icon && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gray-50 p-1">
                            <img
                                src={item.icon.startsWith('http') ? item.icon : item.icon.startsWith('/uploads') ? item.icon : `/images/${item.icon.split('/').pop()}`}
                                alt=""
                                className="h-full w-full object-contain"
                            />
                        </div>
                    )}
                </div>

                <h3 className="line-clamp-2 text-sm font-bold leading-tight text-gray-900 group-hover:text-bento-blue transition-colors whitespace-normal break-words overflow-visible">
                    {item.title}
                </h3>
                {item.host && <p className="mt-0.5 text-[9px] text-gray-400 truncate">{item.host}</p>}
            </div>

            {item.image && (
                <div className="h-full w-1/4 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                    <img
                        src={item.image.startsWith('http') ? item.image : item.image.startsWith('/uploads') ? item.image : `/images/${item.image.split('/').pop()}`}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                </div>
            )}
        </a>
    );
};

export default BentoItem;
