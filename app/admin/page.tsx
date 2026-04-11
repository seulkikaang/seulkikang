"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { BentoItem as BentoItemData } from '@/types/bento';
import SortableBentoItem from '@/components/SortableBentoItem';
import ProfileHeader from '@/components/ProfileHeader';
import { parseBentoData } from '@/utils/data-parser';
import { getFaviconUrl, getSiteSettings, SiteSettings } from '@/utils/site-settings';
import {
    getCategoryOptionsWithUncategorized,
    UNCATEGORIZED_VALUE,
    DISPLAY_HANDLE,
    CategoryOption,
    DEFAULT_CATEGORY_OPTIONS,
} from '@/utils/link-presentation';
import {
    getProfileSettings,
    ProfileSettings,
    SocialChannel,
    SOCIAL_PLATFORM_OPTIONS,
} from '@/utils/profile-settings';
import { Plus, Upload, Loader2, Trash2, GripVertical, Pencil } from 'lucide-react';

interface LinkViewsResponse {
    dates: string[];
    dailyVisitors: number[];
    links: Array<{
        itemId: string;
        title: string;
        href: string;
        group: string;
        todayClicks: number;
        totalClicks: number;
    }>;
}

export default function AdminPage() {
    const [profile, setProfile] = useState<ReturnType<typeof parseBentoData> | null>(null);
    const [isEditing, setIsEditing] = useState<BentoItemData | null>(null);
    const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
    const [profileSettings, setProfileSettings] = useState<ProfileSettings | null>(null);
    const [linkViews, setLinkViews] = useState<LinkViewsResponse | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadingIcon, setIsUploadingIcon] = useState(false);
    const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
    const [isUploadingProfile, setIsUploadingProfile] = useState(false);
    const [isLoadingViews, setIsLoadingViews] = useState(true);
    const [editingCategory, setEditingCategory] = useState<{ index: number; value: string; label: string } | null>(null);
    const [newCategory, setNewCategory] = useState<{ value: string; label: string } | null>(null);

    useEffect(() => {
        const fetchLinkViews = async () => {
            setIsLoadingViews(true);
            try {
                const res = await fetch('/api/link-views');
                const data = await res.json();
                setLinkViews(data);
            } catch (err) {
                console.error('Failed to fetch link views:', err);
            } finally {
                setIsLoadingViews(false);
            }
        };

        const fetchData = async () => {
            try {
                const [dataRes] = await Promise.all([
                    fetch('/api/data'),
                    fetchLinkViews(),
                ]);
                const data = await dataRes.json();
                setProfile(parseBentoData(data));
                setSiteSettings(getSiteSettings(data));
                setProfileSettings(getProfileSettings(data));
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
            const resp = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await resp.json();
            if (data.success) setIsEditing({ ...isEditing, image: data.url });
            else alert(`Upload failed: ${data.error || 'Unknown error'}`);
        } catch (err) {
            console.error(err);
            alert('Upload failed');
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
            const resp = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await resp.json();
            if (data.success) {
                setSiteSettings({ ...siteSettings, faviconType: 'image', faviconImage: data.url });
            } else alert(`Upload failed: ${data.error || 'Unknown error'}`);
        } catch (err) {
            console.error(err);
            alert('Upload failed');
        } finally {
            setIsUploadingFavicon(false);
            e.target.value = '';
        }
    };

    const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !profileSettings) return;
        setIsUploadingProfile(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const resp = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await resp.json();
            if (data.success) {
                setProfileSettings({ ...profileSettings, profileImage: data.url });
            } else alert(`Upload failed: ${data.error || 'Unknown error'}`);
        } catch (err) {
            console.error(err);
            alert('Upload failed');
        } finally {
            setIsUploadingProfile(false);
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
            const resp = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await resp.json();
            if (data.success) setIsEditing({ ...isEditing, icon: data.url });
            else alert(`Upload failed: ${data.error || 'Unknown error'}`);
        } catch (err) {
            console.error(err);
            alert('Upload failed');
        } finally {
            setIsUploadingIcon(false);
            e.target.value = '';
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id && profile) {
            const oldIndex = profile.items.findIndex((i) => i.id === active.id);
            const newIndex = profile.items.findIndex((i) => i.id === over.id);
            setProfile({ ...profile, items: arrayMove(profile.items, oldIndex, newIndex) });
        }
    };

    const handleAddItem = () => {
        if (!profile) return;
        const newItem: BentoItemData = {
            id: Math.random().toString(36).substring(7),
            title: 'New Item',
            href: 'https://',
            type: 'link',
            category: UNCATEGORIZED_VALUE,
            style: { mobile: '2x2', desktop: '2x2' },
            position: { mobile: { x: 0, y: 0 }, desktop: { x: 0, y: 0 } },
        };
        setProfile({ ...profile, items: [newItem, ...profile.items] });
    };

    const handleDelete = (id: string) => {
        if (!profile) return;
        if (!confirm('이 항목을 삭제하시겠습니까?')) return;
        setProfile({ ...profile, items: profile.items.filter((i) => i.id !== id) });
    };

    const handleAddSocialLink = () => {
        if (!profileSettings) return;
        const newLink: SocialChannel = {
            id: Math.random().toString(36).substring(7),
            title: '',
            href: '',
            iconSrc: '',
            platform: 'custom',
        };
        setProfileSettings({
            ...profileSettings,
            socialLinks: [...profileSettings.socialLinks, newLink],
        });
    };

    const handleRemoveSocialLink = (id: string) => {
        if (!profileSettings) return;
        setProfileSettings({
            ...profileSettings,
            socialLinks: profileSettings.socialLinks.filter((l) => l.id !== id),
        });
    };

    const handleUpdateSocialLink = (id: string, updates: Partial<SocialChannel>) => {
        if (!profileSettings) return;
        setProfileSettings({
            ...profileSettings,
            socialLinks: profileSettings.socialLinks.map((l) =>
                l.id === id ? { ...l, ...updates } : l
            ),
        });
    };

    const handleAddCategory = () => {
        setNewCategory({ value: '', label: '' });
    };

    const handleSaveNewCategory = () => {
        if (!newCategory || !profileSettings || !newCategory.value.trim() || !newCategory.label.trim()) return;
        const slug = newCategory.value.trim().toLowerCase().replace(/\s+/g, '-');
        setProfileSettings({
            ...profileSettings,
            categories: [...profileSettings.categories, { value: slug, label: newCategory.label.trim() }],
        });
        setNewCategory(null);
    };

    const handleDeleteCategory = (index: number) => {
        if (!profileSettings) return;
        const updated = profileSettings.categories.filter((_, i) => i !== index);
        setProfileSettings({ ...profileSettings, categories: updated });
    };

    const handleSaveEditCategory = () => {
        if (!editingCategory || !profileSettings) return;
        const updated = profileSettings.categories.map((cat, i) =>
            i === editingCategory.index ? { value: editingCategory.value, label: editingCategory.label } : cat
        );
        setProfileSettings({ ...profileSettings, categories: updated });
        setEditingCategory(null);
    };

    const handleSave = async () => {
        if (!profile || !siteSettings || !profileSettings) return;
        setIsSaving(true);
        try {
            const resp = await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: profile.items,
                    site: siteSettings,
                    profileSettings,
                }),
            });
            if (resp.ok) alert('저장 완료!');
        } catch {
            alert('저장 실패');
        } finally {
            setIsSaving(false);
        }
    };

    if (!profile || !siteSettings || !profileSettings) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;

    const categoryOptions = getCategoryOptionsWithUncategorized();

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
                        <Link href="/" className="flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium hover:bg-gray-200">
                            View
                        </Link>
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
                        name={profileSettings.name || profile.name}
                        handle={profileSettings.handle || DISPLAY_HANDLE}
                        image={profileSettings.profileImage || profile.image}
                        bio={profileSettings.bio.length > 0 ? profileSettings.bio : profile.bio}
                    />

                    {/* Profile Settings */}
                    <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
                        <h2 className="text-sm font-semibold text-gray-900">프로필 설정</h2>
                        <p className="mt-1 text-xs text-gray-500">소개글, 핸들, 프로필 사진 등을 설정합니다.</p>

                        <div className="mt-4 space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700">이름</label>
                                <input
                                    type="text"
                                    value={profileSettings.name}
                                    onChange={(e) => setProfileSettings({ ...profileSettings, name: e.target.value })}
                                    placeholder={profile.name}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 p-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700">대표 핸들</label>
                                <div className="mt-1 flex items-center">
                                    <span className="text-sm text-gray-400">@</span>
                                    <input
                                        type="text"
                                        value={profileSettings.handle}
                                        onChange={(e) => setProfileSettings({ ...profileSettings, handle: e.target.value })}
                                        placeholder={DISPLAY_HANDLE}
                                        className="ml-1 block w-full rounded-lg border border-gray-300 p-2 text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700">소개글 (줄 구분)</label>
                                <textarea
                                    value={profileSettings.bio.join('\n')}
                                    onChange={(e) => setProfileSettings({
                                        ...profileSettings,
                                        bio: e.target.value.split('\n'),
                                    })}
                                    placeholder={profile.bio.join('\n')}
                                    rows={3}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 p-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700">프로필 사진</label>
                                <div className="mt-1 flex items-center gap-3">
                                    {(profileSettings.profileImage || profile.image) && (
                                        <img
                                            src={profileSettings.profileImage || profile.image}
                                            alt=""
                                            className="h-12 w-12 rounded-xl object-cover"
                                        />
                                    )}
                                    <label className="flex cursor-pointer items-center space-x-2 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 hover:bg-gray-50">
                                        {isUploadingProfile ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                        ) : (
                                            <Upload className="h-4 w-4 text-gray-400" />
                                        )}
                                        <span className="text-xs text-gray-600">Upload</span>
                                        <input type="file" className="hidden" onChange={handleProfileImageUpload} accept="image/*" disabled={isUploadingProfile} />
                                    </label>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-gray-700">VIEWS 노출</label>
                                <button
                                    type="button"
                                    onClick={() => setProfileSettings({ ...profileSettings, showViews: !profileSettings.showViews })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profileSettings.showViews ? 'bg-black' : 'bg-gray-300'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profileSettings.showViews ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* SNS Channel Management */}
                    <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900">SNS 채널 관리</h2>
                                <p className="mt-1 text-xs text-gray-500">프로필에 노출할 SNS 채널을 관리합니다.</p>
                            </div>
                            <button
                                onClick={handleAddSocialLink}
                                className="flex items-center space-x-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium hover:bg-gray-200"
                            >
                                <Plus className="h-3 w-3" />
                                <span>추가</span>
                            </button>
                        </div>

                        <div className="mt-4 space-y-3">
                            {profileSettings.socialLinks.map((link) => (
                                <div key={link.id} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <select
                                            value={link.platform}
                                            onChange={(e) => {
                                                const platform = SOCIAL_PLATFORM_OPTIONS.find((p) => p.value === e.target.value);
                                                handleUpdateSocialLink(link.id, {
                                                    platform: e.target.value,
                                                    title: platform?.label ?? link.title,
                                                    iconSrc: platform?.defaultIcon ?? link.iconSrc,
                                                });
                                            }}
                                            className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
                                        >
                                            {SOCIAL_PLATFORM_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => handleRemoveSocialLink(link.id)}
                                            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                    <div className="mt-2 space-y-2">
                                        <input
                                            type="text"
                                            value={link.title}
                                            onChange={(e) => handleUpdateSocialLink(link.id, { title: e.target.value })}
                                            placeholder="채널 이름"
                                            className="block w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
                                        />
                                        <input
                                            type="text"
                                            value={link.href}
                                            onChange={(e) => handleUpdateSocialLink(link.id, { href: e.target.value })}
                                            placeholder="https://..."
                                            className="block w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
                                        />
                                        <input
                                            type="text"
                                            value={link.iconSrc}
                                            onChange={(e) => handleUpdateSocialLink(link.id, { iconSrc: e.target.value })}
                                            placeholder="아이콘 경로 (/social/...)"
                                            className="block w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
                                        />
                                    </div>
                                </div>
                            ))}
                            {profileSettings.socialLinks.length === 0 && (
                                <p className="py-2 text-xs text-gray-400">기본 SNS 채널이 사용됩니다. 추가하면 커스텀 채널로 대체됩니다.</p>
                            )}
                        </div>
                    </section>

                    {/* Category Management */}
                    <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900">카테고리 관리</h2>
                                <p className="mt-1 text-xs text-gray-500">링크를 분류할 카테고리를 추가/편집합니다.</p>
                            </div>
                            <button
                                onClick={handleAddCategory}
                                className="flex items-center space-x-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium hover:bg-gray-200"
                            >
                                <Plus className="h-3 w-3" />
                                <span>추가</span>
                            </button>
                        </div>

                        <div className="mt-4 space-y-2">
                            {profileSettings.categories.map((cat, index) => (
                                <div key={cat.value} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                                    {editingCategory?.index === index ? (
                                        <>
                                            <input
                                                type="text"
                                                value={editingCategory.label}
                                                onChange={(e) => setEditingCategory({ ...editingCategory, label: e.target.value })}
                                                className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
                                                autoFocus
                                            />
                                            <button onClick={handleSaveEditCategory} className="rounded bg-black px-2 py-1 text-xs text-white">저장</button>
                                            <button onClick={() => setEditingCategory(null)} className="text-xs text-gray-500">취소</button>
                                        </>
                                    ) : (
                                        <>
                                            <GripVertical className="h-3.5 w-3.5 text-gray-300" />
                                            <span className="flex-1 text-xs text-gray-700">{cat.label}</span>
                                            <span className="text-[10px] text-gray-400">{cat.value}</span>
                                            <button
                                                onClick={() => setEditingCategory({ index, value: cat.value, label: cat.label })}
                                                className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                                            >
                                                <Pencil className="h-3 w-3" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(index)}
                                                className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))}

                            {newCategory && (
                                <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                                    <input
                                        type="text"
                                        value={newCategory.value}
                                        onChange={(e) => setNewCategory({ ...newCategory, value: e.target.value })}
                                        placeholder="slug (예: newsletter)"
                                        className="w-28 rounded border border-gray-300 px-2 py-1 text-xs"
                                        autoFocus
                                    />
                                    <input
                                        type="text"
                                        value={newCategory.label}
                                        onChange={(e) => setNewCategory({ ...newCategory, label: e.target.value })}
                                        placeholder="표시 이름"
                                        className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
                                    />
                                    <button onClick={handleSaveNewCategory} className="rounded bg-black px-2 py-1 text-xs text-white">추가</button>
                                    <button onClick={() => setNewCategory(null)} className="text-xs text-gray-500">취소</button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Site Settings (Favicon) */}
                    <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
                        <h2 className="text-sm font-semibold text-gray-900">Site Settings</h2>
                        <p className="mt-1 text-xs text-gray-500">Favicon을 이모지 또는 업로드 이미지로 설정할 수 있습니다.</p>

                        <div className="mt-4 space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700">Site Title</label>
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
                                    <label className="block text-xs font-medium text-gray-700">Emoji</label>
                                    <input
                                        type="text"
                                        value={siteSettings.faviconEmoji}
                                        onChange={(e) => setSiteSettings({ ...siteSettings, faviconEmoji: e.target.value })}
                                        className="mt-1 block w-24 rounded-lg border border-gray-300 p-2 text-center text-xl"
                                    />
                                    <p className="mt-1 text-[10px] text-gray-400">이모지 하나를 입력하세요 (예: 😊, 🚀)</p>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Favicon Image</label>
                                    <div className="mt-1 flex items-center gap-3">
                                        {siteSettings.faviconImage ? (
                                            <img src={siteSettings.faviconImage} alt="" className="h-8 w-8 rounded object-cover" />
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
                                Preview favicon:{' '}
                                <img src={getFaviconUrl(siteSettings)} alt="" className="ml-2 inline h-4 w-4 align-text-bottom" />
                            </div>
                        </div>
                    </section>

                    {/* Visit & Click Analytics */}
                    <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900">방문 & 클릭 분석</h2>
                                <p className="mt-1 text-xs text-gray-500">최근 7일 일별 방문자와 링크별 클릭 수</p>
                            </div>
                            {isLoadingViews && <span className="text-xs text-gray-400">Loading...</span>}
                        </div>

                        <div className="mt-4 grid grid-cols-7 gap-2">
                            {linkViews?.dates.map((date, index) => (
                                <div key={date} className="rounded-xl border border-gray-200 bg-gray-50 px-2 py-3 text-center">
                                    <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400">{date.slice(5)}</p>
                                    <p className="mt-1 text-lg font-semibold text-gray-900">{linkViews?.dailyVisitors[index] ?? 0}</p>
                                    <p className="text-[11px] text-gray-500">visitors</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-gray-200 text-[11px] uppercase tracking-[0.18em] text-gray-400">
                                        <th className="pb-3 pr-2 font-medium">Link</th>
                                        <th className="w-16 pb-3 text-center font-medium">Today</th>
                                        <th className="w-16 pb-3 text-center font-medium">7d</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {linkViews?.links.map((row) => (
                                        <tr key={row.itemId} className="border-b border-gray-100 align-top last:border-b-0">
                                            <td className="py-3 pr-2">
                                                <p className="font-medium text-gray-900 truncate max-w-[240px]">{row.title}</p>
                                                <p className="mt-0.5 text-[11px] text-gray-500 truncate max-w-[240px]">{row.group}</p>
                                                {row.href && (
                                                    <a
                                                        href={row.href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-0.5 inline-block text-[11px] text-blue-600 hover:underline truncate max-w-[240px]"
                                                    >
                                                        {row.href}
                                                    </a>
                                                )}
                                            </td>
                                            <td className="w-16 py-3 text-center text-sm text-gray-700">
                                                {row.todayClicks}
                                            </td>
                                            <td className="w-16 py-3 text-center text-sm font-semibold text-gray-900">
                                                {row.totalClicks}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {!isLoadingViews && linkViews?.links.length === 0 && (
                                <p className="py-4 text-sm text-gray-500">표시할 분석 데이터가 없습니다.</p>
                            )}
                        </div>
                    </section>

                    {/* Bento Items */}
                    <div className="mt-8">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={profile.items.map((i) => i.id)} strategy={rectSortingStrategy}>
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

            {/* Editor Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold">Edit Item</h2>
                        <div className="mt-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input
                                    type="text"
                                    value={isEditing.title}
                                    onChange={(e) => setIsEditing({ ...isEditing, title: e.target.value })}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 p-2 text-sm shadow-sm focus:border-black focus:ring-black"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Link</label>
                                <input
                                    type="text"
                                    value={isEditing.href}
                                    onChange={(e) => setIsEditing({ ...isEditing, href: e.target.value })}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 p-2 text-sm shadow-sm focus:border-black focus:ring-black"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Grid Shape</label>
                                <select
                                    value={isEditing.style.desktop}
                                    onChange={(e) => setIsEditing({ ...isEditing, style: { ...isEditing.style, desktop: e.target.value } })}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 p-2 text-sm shadow-sm focus:border-black focus:ring-black"
                                >
                                    <option value="1x4">1x4 (Wide Small)</option>
                                    <option value="2x2">2x2 (Square)</option>
                                    <option value="2x4">2x4 (Large Rectangle)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <select
                                    value={isEditing.category || UNCATEGORIZED_VALUE}
                                    onChange={(e) => setIsEditing({ ...isEditing, category: e.target.value })}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 p-2 text-sm shadow-sm focus:border-black focus:ring-black"
                                >
                                    {categoryOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Image</label>
                                <div className="mt-1 flex items-center space-x-4">
                                    {isEditing.image && (
                                        <img src={isEditing.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
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
                                    className="mt-1 block w-full rounded-lg border border-gray-300 p-2 text-sm shadow-sm focus:border-black focus:ring-black"
                                />
                                <div className="mt-2 flex items-center gap-3">
                                    {isEditing.icon && (
                                        <img src={isEditing.icon} alt="" className="h-8 w-8 rounded object-cover" />
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
                            <button onClick={() => setIsEditing(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const newItems = profile.items.map((i) => (i.id === isEditing.id ? isEditing : i));
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
