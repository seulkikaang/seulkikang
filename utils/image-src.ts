function mapCreatorspaceMirror(src: string): string | null {
  const prefix = 'https://storage.googleapis.com/creatorspace-public/';
  if (!src.startsWith(prefix)) return null;

  const rawPath = src.slice(prefix.length).split('?')[0].split('#')[0];
  const decodedPath = decodeURIComponent(rawPath);
  const mirroredFilename = decodedPath.replaceAll('/', '_');
  return `/images/Seulki Kang_files/${mirroredFilename}`;
}

export function resolveImageSrc(src?: string): string {
  if (!src) return '';

  const trimmed = src.trim();
  if (!trimmed) return '';

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    const mirrored = mapCreatorspaceMirror(trimmed);
    if (mirrored) return mirrored;
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  return `/images/${trimmed.split('/').pop()}`;
}
