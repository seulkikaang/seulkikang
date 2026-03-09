import React from 'react';
import { BentoItem as BentoItemData } from '@/types/bento';
import BentoItem from './BentoItem';

interface BentoGridProps {
    items: BentoItemData[];
}

const BentoGrid: React.FC<BentoGridProps> = ({ items }) => {
    return (
        <div className="grid grid-cols-4 gap-4">
            {items.map((item) => (
                <BentoItem key={item.id} item={item} />
            ))}
        </div>
    );
};

export default BentoGrid;
