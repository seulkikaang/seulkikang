function hashString(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) + hash) + input.charCodeAt(i);
    hash &= 0xffffffff;
  }
  return (hash >>> 0).toString(16);
}

function mapCreatorspaceMirror(src: string): string | null {
  const prefix = 'https://storage.googleapis.com/creatorspace-public/';
  if (!src.startsWith(prefix)) return null;

  const rawPath = src.slice(prefix.length).split('?')[0].split('#')[0];
  const decodedPath = decodeURIComponent(rawPath);
  const mirroredFilename = decodedPath.replaceAll('/', '_');
  if (mirroredFilename.length > 240) {
    const ext = mirroredFilename.split('.').pop() || 'png';
    return `/images/Seulki Kang_files/hashed_${hashString(decodedPath)}.${ext}`;
  }
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
