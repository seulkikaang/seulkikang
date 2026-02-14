function toObject(value: unknown): Record<string, any> {
  if (!value) return {};

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  return typeof value === 'object' ? (value as Record<string, any>) : {};
}

export function mergeWithFallbackData(raw: unknown, fallbackRaw: unknown) {
  const data = toObject(raw);
  const fallback = toObject(fallbackRaw);

  const fallbackProfile = fallback.profile ?? {};
  const dataProfile = data.profile ?? {};

  return {
    ...fallback,
    ...data,
    profile: {
      ...fallbackProfile,
      ...dataProfile,
      bio: fallbackProfile.bio ?? dataProfile.bio,
      bento: {
        ...(fallbackProfile.bento ?? {}),
        ...(dataProfile.bento ?? {}),
        items: Array.isArray(dataProfile?.bento?.items)
          ? dataProfile.bento.items
          : Array.isArray(fallbackProfile?.bento?.items)
            ? fallbackProfile.bento.items
            : [],
      },
    },
    fallback: {
      ...(fallback.fallback ?? {}),
      ...(data.fallback ?? {}),
    },
    site: {
      ...(fallback.site ?? {}),
      ...(data.site ?? {}),
    },
  };
}
