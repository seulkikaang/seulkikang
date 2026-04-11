"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BentoItem as BentoItemData } from '@/types/bento';
import ProfileHeader from '@/components/ProfileHeader';
import { parseBentoData } from '@/utils/data-parser';
import { resolveImageSrc } from '@/utils/image-src';
import { getFaviconUrl, getSiteSettings, SiteSettings } from '@/utils/site-settings';
import {
    getCategoryOptionsWithUncategorized,
    UNCATEGORIZED_VALUE,
    DISPLAY_HANDLE,
    SOCIAL_LINK_IDS,
    getLinkGroupId,
    CategoryOption,
} from '@/utils/link-presentation';
import {
    getProfileSettings,
    ProfileSettings,
    SocialChannel,
    SOCIAL_PLATFORM_OPTIONS,
    FIXED_SOCIAL_LINKS_DEFAULT,
} from '@/utils/profile-settings';
import {
    Plus, Upload, Loader2, Trash2, GripVertical, Pencil,
    ChevronDown, ChevronRight, Settings2,
} from 'lucide-react';

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

/* ─── Sortable Link Row ─── */
function SortableLinkRow({
    item,
    onEdit,
    onDelete,
}: {
    item: BentoItemData;
    onEdit: (item: BentoItemData) => void;
    onDelete: (id: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 50 : 'auto' as const,
    };

    const thumb = item.image ? resolveImageSrc(item.image) : null;
    const iconImg = item.icon ? resolveImageSrc(item.icon) : null;
    const autoFavicon = !iconImg && item.href ? (() => { try { return `https://www.google.com/s2/favicons?domain=${new URL(item.href!).hostname}&sz=64`; } catch { return null; } })() : null;

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3 py-2">
            <button {...attributes} {...listeners} className="cursor-grab text-gray-300 hover:text-gray-500 active:cursor-grabbing shrink-0">
                <GripVertical className="h-4 w-4" />
            </button>
            {thumb ? (
                <img src={thumb} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
            ) : iconImg ? (
                <img src={iconImg} alt="" className="h-8 w-8 shrink-0 rounded object-cover" />
            ) : autoFavicon ? (
                <img src={autoFavicon} alt="" className="h-8 w-8 shrink-0 rounded object-cover" />
            ) : (
                <div className="h-12 w-12 shrink-0 rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="text-[10px] text-gray-400">No img</span>
                </div>
            )}
            <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-gray-900">{item.title || 'Untitled'}</p>
                {item.href && (
                    <p className="truncate text-[10px] text-gray-400">{item.href}</p>
                )}
            </div>
            <div className="flex shrink-0 gap-1">
                <button onClick={() => onEdit(item)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                    <Settings2 className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => onDelete(item.id)} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}

/* ─── Main ─── */
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
    const [analyticsOpen, setAnalyticsOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<{ catValue: string; label: string } | null>(null);
    const [newCategory, setNewCategory] = useState<{ value: string; label: string } | null>(null);

    useEffect(() => {
        const fetchLinkViews = async () => {
            setIsLoadingViews(true);
            try {
                const res = await fetch('/api/link-views');
                setLinkViews(await res.json());
            } catch (err) {
                console.error('Failed to fetch link views:', err);
            } finally {
                setIsLoadingViews(false);
            }
        };
        const fetchData = async () => {
            try {
                const [dataRes] = await Promise.all([fetch('/api/data'), fetchLinkViews()]);
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

    /* ── File upload helpers ── */
    const uploadFile = async (file: File): Promise<string | null> => {
        const fd = new FormData();
        fd.append('file', file);
        try {
            const resp = await fetch('/api/upload', { method: 'POST', body: fd });
            const data = await resp.json();
            if (data.success) return data.url;
            alert(`Upload failed: ${data.error || 'Unknown error'}`);
        } catch {
            alert('Upload failed');
        }
        return null;
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !isEditing) return;
        setIsUploading(true);
        const url = await uploadFile(file);
        if (url) setIsEditing({ ...isEditing, image: url });
        setIsUploading(false);
    };

    const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !siteSettings) return;
        setIsUploadingFavicon(true);
        const url = await uploadFile(file);
        if (url) setSiteSettings({ ...siteSettings, faviconType: 'image', faviconImage: url });
        setIsUploadingFavicon(false);
        e.target.value = '';
    };

    const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !profileSettings) return;
        setIsUploadingProfile(true);
        const url = await uploadFile(file);
        if (url) setProfileSettings({ ...profileSettings, profileImage: url });
        setIsUploadingProfile(false);
        e.target.value = '';
    };

    const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !isEditing) return;
        setIsUploadingIcon(true);
        const url = await uploadFile(file);
        if (url) setIsEditing({ ...isEditing, icon: url });
        setIsUploadingIcon(false);
        e.target.value = '';
    };

    /* ── DnD ── */
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id || !profile) return;

        const items = [...profile.items];
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        // If dropped into a different category, update category
        const targetItem = items[newIndex];
        const sourceItem = items[oldIndex];
        const targetCat = getEffectiveCategory(targetItem);
        const sourceCat = getEffectiveCategory(sourceItem);

        const reordered = arrayMove(items, oldIndex, newIndex);
        if (targetCat !== sourceCat) {
            const moved = { ...reordered.find((i) => i.id === active.id)!, category: targetCat };
            setProfile({ ...profile, items: reordered.map((i) => i.id === active.id ? moved : i) });
        } else {
            setProfile({ ...profile, items: reordered });
        }
    };

    /* ── Helpers ── */
    const isSocialLink = (item: BentoItemData) =>
        SOCIAL_LINK_IDS.includes(item.id as any);

    const getEffectiveCategory = (item: BentoItemData): string => {
        if (item.category === UNCATEGORIZED_VALUE) return UNCATEGORIZED_VALUE;
        if (item.category && profileSettings?.categories.some((c) => c.value === item.category)) return item.category;
        return getLinkGroupId(item);
    };

    const groupedItems = useMemo(() => {
        if (!profile || !profileSettings) return [];
        const cats = profileSettings.categories;
        const allCats = [{ value: UNCATEGORIZED_VALUE, label: '카테고리 설정 안함' }, ...cats];
        const regular = profile.items.filter((i) => !isSocialLink(i));

        return allCats.map((cat) => ({
            ...cat,
            items: regular.filter((item) => getEffectiveCategory(item) === cat.value),
        }));
    }, [profile, profileSettings]);

    const allDraggableIds = useMemo(
        () => groupedItems.flatMap((g) => g.items.map((i) => i.id)),
        [groupedItems],
    );

    const handleAddItem = (categoryValue?: string) => {
        if (!profile) return;
        const newItem: BentoItemData = {
            id: Math.random().toString(36).substring(7),
            title: 'New Item',
            href: 'https://',
            type: 'link',
            category: categoryValue ?? UNCATEGORIZED_VALUE,
            style: { mobile: '2x2', desktop: '2x2' },
            position: { mobile: { x: 0, y: 0 }, desktop: { x: 0, y: 0 } },
        };
        setProfile({ ...profile, items: [...profile.items, newItem] });
    };

    const handleDelete = (id: string) => {
        if (!profile) return;
        if (!confirm('이 항목을 삭제하시겠습니까?')) return;
        setProfile({ ...profile, items: profile.items.filter((i) => i.id !== id) });
    };

    /* ── Social ── */
    const handleAddSocialLink = () => {
        if (!profileSettings) return;
        setProfileSettings({
            ...profileSettings,
            socialLinks: [...profileSettings.socialLinks, {
                id: Math.random().toString(36).substring(7),
                title: '', href: '', iconSrc: '', platform: 'custom',
            }],
        });
    };

    const handleRemoveSocialLink = (id: string) => {
        if (!profileSettings) return;
        setProfileSettings({ ...profileSettings, socialLinks: profileSettings.socialLinks.filter((l) => l.id !== id) });
    };

    const handleUpdateSocialLink = (id: string, updates: Partial<SocialChannel>) => {
        if (!profileSettings) return;
        setProfileSettings({
            ...profileSettings,
            socialLinks: profileSettings.socialLinks.map((l) => l.id === id ? { ...l, ...updates } : l),
        });
    };

    /* ── Category CRUD ── */
    const handleAddCategory = () => setNewCategory({ value: '', label: '' });

    const handleSaveNewCategory = () => {
        if (!newCategory || !profileSettings || !newCategory.value.trim() || !newCategory.label.trim()) return;
        const slug = newCategory.value.trim().toLowerCase().replace(/\s+/g, '-');
        setProfileSettings({
            ...profileSettings,
            categories: [...profileSettings.categories, { value: slug, label: newCategory.label.trim() }],
        });
        setNewCategory(null);
    };

    const handleDeleteCategory = (catValue: string) => {
        if (!profileSettings || !profile) return;
        const itemsInCat = profile.items.filter((i) => !isSocialLink(i) && getEffectiveCategory(i) === catValue);
        if (itemsInCat.length > 0) {
            if (!confirm(`카테고리 삭제 시 포함된 링크 ${itemsInCat.length}개도 함께 삭제됩니다. 진행하시겠습니까?`)) return;
            setProfile({ ...profile, items: profile.items.filter((i) => !itemsInCat.some((ci) => ci.id === i.id)) });
        }
        setProfileSettings({ ...profileSettings, categories: profileSettings.categories.filter((c) => c.value !== catValue) });
    };

    const handleSaveEditCategory = () => {
        if (!editingCategory || !profileSettings) return;
        setProfileSettings({
            ...profileSettings,
            categories: profileSettings.categories.map((cat) =>
                cat.value === editingCategory.catValue ? { ...cat, label: editingCategory.label } : cat
            ),
        });
        setEditingCategory(null);
    };

    /* ── Save ── */
    const handleSave = async () => {
        if (!profile || !siteSettings || !profileSettings) return;
        setIsSaving(true);
        try {
            const resp = await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: profile.items, site: siteSettings, profileSettings }),
            });
            if (resp.ok) alert('저장 완료!');
        } catch {
            alert('저장 실패');
        } finally {
            setIsSaving(false);
        }
    };

    if (!profile || !siteSettings || !profileSettings) return <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">Loading...</div>;

    const categoryOptions = getCategoryOptionsWithUncategorized();

    return (
        <div className="min-h-screen bg-[#FDFDFD]">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-[428px] items-center justify-between px-6 py-4">
                    <h1 className="text-lg font-bold">Bento Admin</h1>
                    <div className="flex space-x-2">
                        <Link href="/" className="flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium hover:bg-gray-200">
                            View
                        </Link>
                        <button onClick={handleSave} disabled={isSaving} className="rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:bg-gray-400">
                            {isSaving ? '...' : 'Save'}
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto flex justify-center pb-20">
                <div className="w-full max-w-[428px] px-6">
                    {/* Profile Preview */}
                    <ProfileHeader
                        name={profileSettings.name || profile.name}
                        handle={profileSettings.handle || DISPLAY_HANDLE}
                        image={profileSettings.profileImage || profile.image}
                        bio={profileSettings.bio.length > 0 ? profileSettings.bio : profile.bio}
                    />

                    {/* ── Profile Settings ── */}
                    <Section title="프로필 설정" desc="소개글, 핸들, 프로필 사진 등">
                        <div className="space-y-3">
                            <Field label="이름">
                                <input type="text" value={profileSettings.name} onChange={(e) => setProfileSettings({ ...profileSettings, name: e.target.value })} placeholder={profile.name} className="block w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
                            </Field>
                            <Field label="대표 핸들">
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-400">@</span>
                                    <input type="text" value={profileSettings.handle} onChange={(e) => setProfileSettings({ ...profileSettings, handle: e.target.value })} placeholder={DISPLAY_HANDLE} className="input-field ml-1" />
                                </div>
                            </Field>
                            <Field label="소개글 (줄 구분)">
                                <textarea value={profileSettings.bio.join('\n')} onChange={(e) => setProfileSettings({ ...profileSettings, bio: e.target.value.split('\n') })} placeholder={profile.bio.join('\n')} rows={3} className="block w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
                            </Field>
                            <Field label="프로필 사진">
                                <div className="flex items-center gap-3">
                                    {(profileSettings.profileImage || profile.image) && (
                                        <img src={resolveImageSrc(profileSettings.profileImage || profile.image)} alt="" className="h-12 w-12 rounded-xl object-cover" />
                                    )}
                                    <UploadButton loading={isUploadingProfile} onChange={handleProfileImageUpload} />
                                </div>
                            </Field>
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-gray-700">VIEWS 노출</label>
                                <ToggleSwitch checked={profileSettings.showViews} onChange={() => setProfileSettings({ ...profileSettings, showViews: !profileSettings.showViews })} />
                            </div>
                        </div>
                    </Section>

                    {/* ── SNS Channels ── */}
                    <Section title="SNS 채널 관리" desc="프로필에 노출할 SNS 채널" action={<SmallButton icon={<Plus className="h-3 w-3" />} label="추가" onClick={handleAddSocialLink} />}>
                        <div className="space-y-3">
                            {profileSettings.socialLinks.map((link) => {
                                const platformInfo = SOCIAL_PLATFORM_OPTIONS.find((p) => p.value === link.platform);
                                return (
                                    <div key={link.id} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                                        <div className="flex items-center gap-2">
                                            {link.iconSrc && <img src={link.iconSrc} alt="" className="h-6 w-6 rounded" />}
                                            <select value={link.platform} onChange={(e) => {
                                                const p = SOCIAL_PLATFORM_OPTIONS.find((p) => p.value === e.target.value);
                                                handleUpdateSocialLink(link.id, { platform: e.target.value, title: p?.label ?? link.title, iconSrc: p?.defaultIcon ?? link.iconSrc });
                                            }} className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-xs">
                                                {SOCIAL_PLATFORM_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                            </select>
                                            <button onClick={() => handleRemoveSocialLink(link.id)} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                                        </div>
                                        <div className="mt-2 space-y-2">
                                            <input type="text" value={link.title} onChange={(e) => handleUpdateSocialLink(link.id, { title: e.target.value })} placeholder="채널 이름" className="block w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
                                            <input type="text" value={link.href} onChange={(e) => handleUpdateSocialLink(link.id, { href: e.target.value })} placeholder="https://..." className="block w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
                                        </div>
                                    </div>
                                );
                            })}
                            {profileSettings.socialLinks.length === 0 && (
                                <p className="py-2 text-xs text-gray-400">기본 SNS 채널이 사용됩니다. 추가하면 커스텀 채널로 대체됩니다.</p>
                            )}
                        </div>
                    </Section>

                    {/* ── Site Settings (Favicon) ── */}
                    <Section title="Site Settings" desc="Favicon을 이모지 또는 이미지로 설정">
                        <div className="space-y-3">
                            <Field label="Site Title">
                                <input type="text" value={siteSettings.title} onChange={(e) => setSiteSettings({ ...siteSettings, title: e.target.value })} className="block w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
                            </Field>
                            <div className="flex items-center gap-3">
                                <PillButton active={siteSettings.faviconType === 'emoji'} onClick={() => setSiteSettings({ ...siteSettings, faviconType: 'emoji' })} label="Emoji" />
                                <PillButton active={siteSettings.faviconType === 'image'} onClick={() => setSiteSettings({ ...siteSettings, faviconType: 'image' })} label="Image" />
                            </div>
                            {siteSettings.faviconType === 'emoji' ? (
                                <Field label="Emoji">
                                    <input type="text" value={siteSettings.faviconEmoji} onChange={(e) => setSiteSettings({ ...siteSettings, faviconEmoji: e.target.value })} className="w-24 rounded-lg border border-gray-300 p-2 text-center text-xl" />
                                </Field>
                            ) : (
                                <Field label="Favicon Image">
                                    <div className="flex items-center gap-3">
                                        {siteSettings.faviconImage ? <img src={siteSettings.faviconImage} alt="" className="h-8 w-8 rounded object-cover" /> : <div className="h-8 w-8 rounded bg-gray-100" />}
                                        <UploadButton loading={isUploadingFavicon} onChange={handleFaviconUpload} />
                                    </div>
                                </Field>
                            )}
                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                                Preview: <img src={getFaviconUrl(siteSettings)} alt="" className="ml-2 inline h-4 w-4 align-text-bottom" />
                            </div>
                        </div>
                    </Section>

                    {/* ── Analytics (collapsible) ── */}
                    <section className="mt-6 rounded-2xl border border-gray-200 bg-white">
                        <button onClick={() => setAnalyticsOpen(!analyticsOpen)} className="flex w-full items-center justify-between p-5">
                            <div className="text-left">
                                <h2 className="text-sm font-semibold text-gray-900">방문 & 클릭 분석</h2>
                                <p className="mt-1 text-xs text-gray-500">최근 7일 일별 방문자와 링크별 클릭 수</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {isLoadingViews && <span className="text-xs text-gray-400">Loading...</span>}
                                {analyticsOpen ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                            </div>
                        </button>
                        {analyticsOpen && (
                            <div className="border-t border-gray-100 p-5 pt-4">
                                <div className="grid grid-cols-7 gap-2">
                                    {linkViews?.dates.map((date, idx) => (
                                        <div key={date} className="rounded-xl border border-gray-200 bg-gray-50 px-2 py-3 text-center">
                                            <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400">{date.slice(5)}</p>
                                            <p className="mt-1 text-lg font-semibold text-gray-900">{linkViews?.dailyVisitors[idx] ?? 0}</p>
                                            <p className="text-[11px] text-gray-500">visitors</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="border-b border-gray-200 text-[11px] uppercase tracking-[0.18em] text-gray-400">
                                                <th className="pb-3 pr-2 font-medium">Link</th>
                                                <th className="w-14 pb-3 text-center font-medium">Today</th>
                                                <th className="w-14 pb-3 text-center font-medium">7d</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {linkViews?.links.map((row) => (
                                                <tr key={row.itemId} className="border-b border-gray-100 align-top last:border-b-0">
                                                    <td className="py-2.5 pr-2">
                                                        <p className="truncate text-xs font-medium text-gray-900 max-w-[220px]">{row.title}</p>
                                                        <p className="truncate text-[10px] text-gray-400 max-w-[220px]">{row.group}</p>
                                                    </td>
                                                    <td className="w-14 py-2.5 text-center text-xs text-gray-700">{row.todayClicks}</td>
                                                    <td className="w-14 py-2.5 text-center text-xs font-semibold text-gray-900">{row.totalClicks}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {!isLoadingViews && linkViews?.links.length === 0 && (
                                        <p className="py-4 text-xs text-gray-500">데이터 없음</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* ── Links by Category ── */}
                    <section className="mt-8">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-900">링크 관리</h2>
                            <SmallButton icon={<Plus className="h-3 w-3" />} label="카테고리 추가" onClick={handleAddCategory} />
                        </div>

                        {newCategory && (
                            <div className="mb-4 flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5">
                                <input type="text" value={newCategory.value} onChange={(e) => setNewCategory({ ...newCategory, value: e.target.value })} placeholder="slug (예: newsletter)" className="w-28 rounded border border-gray-300 px-2 py-1 text-xs" autoFocus />
                                <input type="text" value={newCategory.label} onChange={(e) => setNewCategory({ ...newCategory, label: e.target.value })} placeholder="표시 이름" className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs" />
                                <button onClick={handleSaveNewCategory} className="rounded bg-black px-2 py-1 text-xs text-white">추가</button>
                                <button onClick={() => setNewCategory(null)} className="text-xs text-gray-500">취소</button>
                            </div>
                        )}

                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={allDraggableIds} strategy={verticalListSortingStrategy}>
                                <div className="space-y-6">
                                    {groupedItems.map((group) => (
                                        <div key={group.value} className="rounded-2xl border border-gray-200 bg-white p-4">
                                            {/* Category header */}
                                            <div className="mb-3 flex items-center justify-between">
                                                {editingCategory?.catValue === group.value ? (
                                                    <div className="flex flex-1 items-center gap-2">
                                                        <input type="text" value={editingCategory.label} onChange={(e) => setEditingCategory({ ...editingCategory, label: e.target.value })} className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs" autoFocus />
                                                        <button onClick={handleSaveEditCategory} className="rounded bg-black px-2 py-1 text-xs text-white">저장</button>
                                                        <button onClick={() => setEditingCategory(null)} className="text-xs text-gray-500">취소</button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <h3 className="text-xs font-semibold text-gray-700">
                                                            {group.value === UNCATEGORIZED_VALUE ? '최상단 기본 노출' : group.label}
                                                            <span className="ml-1.5 text-[10px] font-normal text-gray-400">({group.items.length})</span>
                                                        </h3>
                                                        <div className="flex items-center gap-1">
                                                            <button onClick={() => handleAddItem(group.value)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600" title="링크 추가">
                                                                <Plus className="h-3.5 w-3.5" />
                                                            </button>
                                                            {group.value !== UNCATEGORIZED_VALUE && (
                                                                <>
                                                                    <button onClick={() => setEditingCategory({ catValue: group.value, label: group.label })} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600" title="카테고리 이름 편집">
                                                                        <Pencil className="h-3 w-3" />
                                                                    </button>
                                                                    <button onClick={() => handleDeleteCategory(group.value)} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500" title="카테고리 삭제">
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            {/* Items */}
                                            <div className="space-y-2">
                                                {group.items.map((item) => (
                                                    <SortableLinkRow key={item.id} item={item} onEdit={(it) => setIsEditing(it)} onDelete={handleDelete} />
                                                ))}
                                                {group.items.length === 0 && (
                                                    <p className="py-3 text-center text-[11px] text-gray-400">비어 있음</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </section>
                </div>
            </main>

            {/* ── Editor Modal ── */}
            {isEditing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
                        <h2 className="text-lg font-bold">링크 편집</h2>
                        <div className="mt-5 space-y-4">
                            <Field label="Title"><input type="text" value={isEditing.title} onChange={(e) => setIsEditing({ ...isEditing, title: e.target.value })} className="block w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" /></Field>
                            <Field label="Link"><input type="text" value={isEditing.href} onChange={(e) => setIsEditing({ ...isEditing, href: e.target.value })} className="block w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" /></Field>
                            <Field label="Grid Shape">
                                <select value={isEditing.style.desktop} onChange={(e) => setIsEditing({ ...isEditing, style: { ...isEditing.style, desktop: e.target.value } })} className="block w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black">
                                    <option value="1x4">1x4 (Wide Small)</option>
                                    <option value="2x2">2x2 (Square)</option>
                                    <option value="2x4">2x4 (Large Rectangle)</option>
                                </select>
                            </Field>
                            <Field label="Category">
                                <select value={isEditing.category || UNCATEGORIZED_VALUE} onChange={(e) => setIsEditing({ ...isEditing, category: e.target.value })} className="block w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black">
                                    {categoryOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </Field>
                            <Field label="Image">
                                <div className="flex items-center space-x-4">
                                    {isEditing.image && <img src={resolveImageSrc(isEditing.image)} alt="" className="h-16 w-16 rounded-lg object-cover" />}
                                    <UploadButton loading={isUploading} onChange={handleImageUpload} />
                                </div>
                            </Field>
                            <Field label="Icon (Favicon)">
                                <input type="text" value={isEditing.icon || ''} onChange={(e) => setIsEditing({ ...isEditing, icon: e.target.value })} placeholder="https://... or /images/..." className="block w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
                                <div className="mt-2 flex items-center gap-3">
                                    {isEditing.icon && <img src={resolveImageSrc(isEditing.icon)} alt="" className="h-8 w-8 rounded object-cover" />}
                                    <UploadButton loading={isUploadingIcon} onChange={handleIconUpload} label="Upload Icon" size="sm" />
                                </div>
                            </Field>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={() => setIsEditing(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                            <button onClick={() => { setProfile({ ...profile, items: profile.items.map((i) => i.id === isEditing.id ? isEditing : i) }); setIsEditing(null); }} className="rounded-full bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800">
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

/* ─── Small components ─── */
function Section({ title, desc, action, children }: { title: string; desc?: string; action?: React.ReactNode; children: React.ReactNode }) {
    return (
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
                    {desc && <p className="mt-1 text-xs text-gray-500">{desc}</p>}
                </div>
                {action}
            </div>
            <div className="mt-4">{children}</div>
        </section>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-700">{label}</label>
            <div className="mt-1">{children}</div>
        </div>
    );
}

function SmallButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
    return (
        <button onClick={onClick} className="flex items-center space-x-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium hover:bg-gray-200">
            {icon}<span>{label}</span>
        </button>
    );
}

function UploadButton({ loading, onChange, label = 'Upload', size = 'md' }: { loading: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; label?: string; size?: 'sm' | 'md' }) {
    return (
        <label className={`flex cursor-pointer items-center space-x-2 rounded-lg border border-dashed border-gray-300 hover:bg-gray-50 ${size === 'sm' ? 'px-3 py-1.5' : 'px-4 py-2'}`}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" /> : <Upload className="h-4 w-4 text-gray-400" />}
            <span className={`text-gray-600 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>{label}</span>
            <input type="file" className="hidden" onChange={onChange} accept="image/*" disabled={loading} />
        </label>
    );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
        <button type="button" onClick={onChange} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-black' : 'bg-gray-300'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );
}

function PillButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
        <button type="button" onClick={onClick} className={`rounded-full px-3 py-1.5 text-xs font-medium ${active ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}>
            {label}
        </button>
    );
}
