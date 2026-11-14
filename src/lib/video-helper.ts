export interface ProcessedVideo {
  type: 'gdrive' | 'youtube' | 'vimeo' | 'direct' | 'embed';
  src: string;
}

export function processVideoUrl(rawUrl: string): ProcessedVideo {
  if (!rawUrl) {
    return { type: 'embed', src: '' };
  }

  const trimmed = rawUrl.trim();

  // 1. Google Drive
  // Patterns: drive.google.com/file/d/{id}/view, drive.google.com/open?id={id}
  const gdriveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  if (trimmed.includes('drive.google.com') && gdriveMatch && gdriveMatch[1]) {
    return {
      type: 'gdrive',
      src: `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`,
    };
  }

  // 2. YouTube
  // Patterns: youtube.com/watch?v={id}, youtu.be/{id}, youtube.com/embed/{id}
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`,
    };
  }

  // 3. Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/);
  if (vimeoMatch && vimeoMatch[3]) {
    return {
      type: 'vimeo',
      src: `https://player.vimeo.com/video/${vimeoMatch[3]}?autoplay=1`,
    };
  }

  // 4. Direct video files
  if (/\.(mp4|webm|ogg|m3u8)($|\?)/i.test(trimmed)) {
    return {
      type: 'direct',
      src: trimmed,
    };
  }

  // 5. Generic embed / iframe
  return {
    type: 'embed',
    src: trimmed,
  };
}
