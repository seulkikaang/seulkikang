"use client";

import React, { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { BentoItem as BentoItemData, ProfileData } from '@/types/bento';
import SortableBentoItem from '@/components/SortableBentoItem';
import ProfileHeader from '@/components/ProfileHeader';
import { parseBentoData } from '@/utils/data-parser';
import rawData from '@/data/bento-data.json';
import { Save, Plus, Upload, Loader2 } from 'lucide-react';

export default function AdminPage() {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isEditing, setIsEditing] = useState<BentoItemData | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        setProfile(parseBentoData(rawData));
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !isEditing) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const resp = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await resp.json();
            if (data.success) {
                setIsEditing({ ...isEditing, image: data.url });
            }
        } catch (err) {
            alert('Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id && profile) {
            const oldIndex = profile.items.findIndex((i) => i.id === active.id);
            const newIndex = profile.items.findIndex((i) => i.id === over.id);

            const newItems = arrayMove(profile.items, oldIndex, newIndex);
            setProfile({ ...profile, items: newItems });
        }
    };

    const handleAddItem = () => {
        if (!profile) return;
        const newItem: BentoItemData = {
            id: Math.random().toString(36).substring(7),
            title: 'New Item',
            href: 'https://',
            type: 'link',
            style: {
                mobile: '2x2',
                desktop: '2x2'
            },
            position: {
                mobile: { x: 0, y: 0 },
                desktop: { x: 0, y: 0 }
            }
        };
        setProfile({ ...profile, items: [newItem, ...profile.items] });
    };

    const handleDelete = (id: string) => {
        if (!profile) return;
        if (!confirm('Are you sure you want to delete this item?')) return;
        setProfile({ ...profile, items: profile.items.filter(i => i.id !== id) });
    };

    const handleSave = async () => {
        if (!profile) return;
        setIsSaving(true);
        try {
            const resp = await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: profile.items }),
            });
            if (resp.ok) alert('Saved successfully!');
        } catch (err) {
            alert('Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    if (!profile) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-[#FDFDFD]">
            <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-[428px] items-center justify-between px-6 py-4">
                    <h1 className="text-lg font-bold">Bento Admin</h1>
                    <div className="flex space-x-2">
                        <button
                            onClick={handleAddItem}
                            className="flex items-center space-x-1 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium hover:bg-gray-200"
                        >
                            <Plus className="h-3 w-3" />
                            <span>Add</span>
                        </button>
                        <a
                            href="/"
                            className="flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium hover:bg-gray-200"
                        >
                            View
                        </a>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center space-x-1.5 rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:bg-gray-400"
                        >
                            <span>{isSaving ? '...' : 'Save'}</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto flex justify-center pb-20">
                <div className="w-full max-w-[428px] px-6">
                    <ProfileHeader
                        name={profile.name}
                        image={profile.image}
                        bio={profile.bio}
                    />

                    <div className="mt-8">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={profile.items.map((i) => i.id)}
                                strategy={rectSortingStrategy}
                            >
                                <div className="grid grid-cols-4 gap-4">
                                    {profile.items.map((item) => (
                                        <SortableBentoItem
                                            key={item.id}
                                            item={item}
                                            onEdit={(it) => setIsEditing(it)}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>
            </main>

            {/* Editor Modal - Placeholder for now */}
            {isEditing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold">Edit Item</h2>
                        <div className="mt-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input
                                    type="text"
                                    value={isEditing.title}
                                    onChange={(e) => setIsEditing({ ...isEditing, title: e.target.value })}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm border p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Link</label>
                                <input
                                    type="text"
                                    value={isEditing.href}
                                    onChange={(e) => setIsEditing({ ...isEditing, href: e.target.value })}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm border p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Grid Shape</label>
                                <select
                                    value={isEditing.style.desktop}
                                    onChange={(e) => setIsEditing({ ...isEditing, style: { ...isEditing.style, desktop: e.target.value } })}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm border p-2"
                                >
                                    <option value="1x4">1x4 (Wide Small)</option>
                                    <option value="2x2">2x2 (Square)</option>
                                    <option value="2x4">2x4 (Large Rectangle)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Image</label>
                                <div className="mt-1 flex items-center space-x-4">
                                    {isEditing.image && (
                                        <img src={isEditing.image} className="h-16 w-16 rounded-lg object-cover" />
                                    )}
                                    <label className="flex cursor-pointer items-center space-x-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 hover:bg-gray-50">
                                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" /> : <Upload className="h-4 w-4 text-gray-400" />}
                                        <span className="text-sm text-gray-600">Upload</span>
                                        <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" disabled={isUploading} />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end space-x-3">
                            <button onClick={() => setIsEditing(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">Cancel</button>
                            <button
                                onClick={() => {
                                    const newItems = profile.items.map(i => i.id === isEditing.id ? isEditing : i);
                                    setProfile({ ...profile, items: newItems });
                                    setIsEditing(null);
                                }}
                                className="rounded-full bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800"
                            >
                                Apply Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
