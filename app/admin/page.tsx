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
import { getFaviconUrl, getSiteSettings, SiteSettings } from '@/utils/site-settings';
import { Save, Plus, Upload, Loader2 } from 'lucide-react';

export default function AdminPage() {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isEditing, setIsEditing] = useState<BentoItemData | null>(null);
    const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadingIcon, setIsUploadingIcon] = useState(false);
    const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/data');
                const data = await res.json();
                setProfile(parseBentoData(data));
                setSiteSettings(getSiteSettings(data));
            } catch (err) {
                console.error('Failed to fetch data:', err);
            }
        };
        fetchData();
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
            } else {
                alert(`Upload failed: ${data.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            alert('Upload failed: Network error or server crashed');
        } finally {
            setIsUploading(false);
        }
    };

    const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !siteSettings) return;

        setIsUploadingFavicon(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const resp = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await resp.json();
            if (data.success) {
                setSiteSettings({
                    ...siteSettings,
                    faviconType: 'image',
                    faviconImage: data.url,
                });
            } else {
                alert(`Upload failed: ${data.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            alert('Upload failed: Network error or server crashed');
        } finally {
            setIsUploadingFavicon(false);
            e.target.value = '';
        }
    };

    const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !isEditing) return;

        setIsUploadingIcon(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const resp = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await resp.json();
            if (data.success) {
                setIsEditing({ ...isEditing, icon: data.url });
            } else {
                alert(`Upload failed: ${data.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            alert('Upload failed: Network error or server crashed');
        } finally {
            setIsUploadingIcon(false);
            e.target.value = '';
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
        if (!profile || !siteSettings) return;
        setIsSaving(true);
        try {
            const resp = await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: profile.items, site: siteSettings }),
            });
            if (resp.ok) alert('Saved successfully!');
        } catch (err) {
            alert('Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    if (!profile || !siteSettings) return <div>Loading...</div>;

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
                        handle={profile.handle}
                        image={profile.image}
                        bio={profile.bio}
                    />

                    <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
                        <h2 className="text-sm font-semibold text-gray-900">Site Settings</h2>
                        <p className="mt-1 text-xs text-gray-500">Favicon을 이모지 또는 업로드 이미지로 설정할 수 있습니다.</p>

                        <div className="mt-4 space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Site Title</label>
                                <input
                                    type="text"
                                    value={siteSettings.title}
                                    onChange={(e) => setSiteSettings({ ...siteSettings, title: e.target.value })}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 p-2 text-sm"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSiteSettings({ ...siteSettings, faviconType: 'emoji' })}
                                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${siteSettings.faviconType === 'emoji' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}
                                >
                                    Emoji
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSiteSettings({ ...siteSettings, faviconType: 'image' })}
                                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${siteSettings.faviconType === 'image' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}
                                >
                                    Image
                                </button>
                            </div>

                            {siteSettings.faviconType === 'emoji' ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Emoji</label>
                                    <input
                                        type="text"
                                        value={siteSettings.faviconEmoji}
                                        maxLength={2}
                                        onChange={(e) => setSiteSettings({ ...siteSettings, faviconEmoji: e.target.value })}
                                        className="mt-1 block w-24 rounded-lg border border-gray-300 p-2 text-center text-xl"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Favicon Image</label>
                                    <div className="mt-1 flex items-center gap-3">
                                        {siteSettings.faviconImage ? (
                                            <img src={siteSettings.faviconImage} className="h-8 w-8 rounded object-cover" />
                                        ) : (
                                            <div className="h-8 w-8 rounded bg-gray-100" />
                                        )}
                                        <label className="flex cursor-pointer items-center space-x-2 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 hover:bg-gray-50">
                                            {isUploadingFavicon ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" /> : <Upload className="h-4 w-4 text-gray-400" />}
                                            <span className="text-xs text-gray-600">Upload</span>
                                            <input type="file" className="hidden" onChange={handleFaviconUpload} accept="image/*" disabled={isUploadingFavicon} />
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                                Preview favicon: <img src={getFaviconUrl(siteSettings)} className="ml-2 inline h-4 w-4 align-text-bottom" />
                            </div>
                        </div>
                    </section>

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
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Icon (Favicon)</label>
                                <input
                                    type="text"
                                    value={isEditing.icon || ''}
                                    onChange={(e) => setIsEditing({ ...isEditing, icon: e.target.value })}
                                    placeholder="https://... or /images/..."
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm border p-2"
                                />
                                <div className="mt-2 flex items-center gap-3">
                                    {isEditing.icon && (
                                        <img src={isEditing.icon} className="h-8 w-8 rounded object-cover" />
                                    )}
                                    <label className="flex cursor-pointer items-center space-x-2 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 hover:bg-gray-50">
                                        {isUploadingIcon ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" /> : <Upload className="h-4 w-4 text-gray-400" />}
                                        <span className="text-xs text-gray-600">Upload Icon</span>
                                        <input type="file" className="hidden" onChange={handleIconUpload} accept="image/*" disabled={isUploadingIcon} />
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
