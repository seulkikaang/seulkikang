import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BentoItem as BentoItemData } from '@/types/bento';
import BentoItem from './BentoItem';
import { GripVertical, Settings2, Trash2 } from 'lucide-react';

interface SortableBentoItemProps {
    item: BentoItemData;
    onEdit: (item: BentoItemData) => void;
    onDelete: (id: string) => void;
}

const SortableBentoItem: React.FC<SortableBentoItemProps> = ({ item, onEdit, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="group relative col-span-4">
            <BentoItem item={item} />

            {/* Admin Controls overlay */}
            <div className="absolute top-2 right-2 flex space-x-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                    onClick={() => onEdit(item)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-md ring-1 ring-black/5 hover:bg-gray-50 bg-opacity-90"
                >
                    <Settings2 className="h-4 w-4 text-gray-600" />
                </button>
                <button
                    onClick={() => onDelete(item.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-md ring-1 ring-black/5 hover:bg-red-50 bg-opacity-90 text-red-500"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
                <button
                    {...attributes}
                    {...listeners}
                    className="flex h-8 w-8 cursor-grab items-center justify-center rounded-lg bg-white shadow-md ring-1 ring-black/5 hover:bg-gray-50 active:cursor-grabbing bg-opacity-90"
                >
                    <GripVertical className="h-4 w-4 text-gray-400" />
                </button>
            </div>
        </div>
    );
};

export default SortableBentoItem;
