import React from 'react';
import { BentoItem as BentoItemData } from '@/types/bento';
import { ExternalLink } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { resolveImageSrc } from '@/utils/image-src';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BentoItemProps {
    item: BentoItemData;
}

function getHostLabel(href?: string, host?: string) {
    if (host) return host;
    if (!href) return '';

    try {
        return new URL(href).hostname.replace(/^www\./, '');
    } catch {
        return '';
    }
}

const BentoItem: React.FC<BentoItemProps> = ({ item }) => {
    const hostLabel = getHostLabel(item.href, item.host);
    const linkHref = item.href ? `/out/${item.id}` : '#';

    return (
        <a
            href={linkHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "editorial-card bento-grid-item group relative col-span-4 flex aspect-[4/1] flex-row items-center overflow-hidden rounded-[26px] border border-[color:var(--frame)] bg-[color:var(--paper-strong)] px-4 py-3.5 shadow-[0_20px_32px_-34px_rgba(53,41,31,0.9)] transition-all"
            )}
        >
            <div className="min-w-0 flex flex-1 flex-col justify-center pr-3">
                <div className="mb-2 flex min-w-0 items-center gap-2">
                    {item.icon && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--accent-soft)] bg-[rgba(255,255,255,0.7)] p-1.5">
                            <img
                                src={resolveImageSrc(item.icon)}
                                alt=""
                                className="h-full w-full object-contain"
                            />
                        </div>
                    )}
                    {hostLabel && (
                        <p className="truncate text-[9px] uppercase tracking-[0.26em] text-[color:var(--accent)]">
                            {hostLabel}
                        </p>
                    )}
                </div>

                <h3 className="type-display line-clamp-2 text-[0.86rem] leading-[1.02] font-semibold text-[color:var(--foreground)] transition-colors group-hover:text-[color:var(--accent)] whitespace-normal break-words">
                    {item.title}
                </h3>
            </div>

            {item.image && (
                <div className="relative h-full w-[5.4rem] shrink-0 overflow-hidden rounded-[18px] border border-[color:var(--frame)] bg-[rgba(255,255,255,0.45)]">
                    <img
                        src={resolveImageSrc(item.image)}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            )}

            <div className="absolute right-3 top-3 rounded-full border border-[color:var(--accent-soft)] bg-[rgba(255,255,255,0.72)] p-1.5 text-[color:var(--accent)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
            </div>
        </a>
    );
};

export default BentoItem;
