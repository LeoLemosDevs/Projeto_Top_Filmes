export interface ProcessedVideo {
  type: 
    | 'gdrive' 
    | 'youtube' 
    | 'vimeo' 
    | 'tokyvideo' 
    | 'dailymotion' 
    | 'okru' 
    | 'archive' 
    | 'direct' 
    | 'embed'
    | string;
  src: string;
}

export function processVideoUrl(rawUrl: string): ProcessedVideo {
  if (!rawUrl) {
    return { type: 'embed', src: '' };
  }

  let trimmed = rawUrl.trim();

  // Se o usuário colou o código <iframe> completo, extrai a URL do atributo src
  const iframeMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    trimmed = iframeMatch[1].trim();
  }

  // 1. TokyVideo (tokyvideo.com, tokyvideo.com/br, /es, /fr, etc.)
  if (trimmed.includes('tokyvideo.com')) {
    // Caso já seja uma URL de embed
    const embedMatch = trimmed.match(/tokyvideo\.com\/(?:[a-zA-Z]{2}\/)?embed\/([a-zA-Z0-9_-]+)/i);
    if (embedMatch && embedMatch[1]) {
      return {
        type: 'tokyvideo',
        src: `https://www.tokyvideo.com/embed/${embedMatch[1]}`,
      };
    }

    // Caso seja o link normal de visualização (/video/... ou /br/video/...)
    const videoMatch = trimmed.match(/tokyvideo\.com\/(?:[a-zA-Z]{2}\/)?video\/([a-zA-Z0-9_-]+)/i);
    if (videoMatch && videoMatch[1]) {
      return {
        type: 'tokyvideo',
        src: `https://www.tokyvideo.com/embed/${videoMatch[1]}`,
      };
    }
  }

  // 2. Dailymotion (dailymotion.com, dai.ly, geo.dailymotion.com)
  if (trimmed.includes('dailymotion.com') || trimmed.includes('dai.ly')) {
    // Link curto dai.ly/{id}
    const dailyShort = trimmed.match(/dai\.ly\/([a-zA-Z0-9]+)/i);
    if (dailyShort && dailyShort[1]) {
      return {
        type: 'dailymotion',
        src: `https://geo.dailymotion.com/player.html?video=${dailyShort[1]}&autoplay=1`,
      };
    }

    // Player geo com ?video={id}
    const geoMatch = trimmed.match(/video=([a-zA-Z0-9]+)/i);
    if (geoMatch && geoMatch[1]) {
      return {
        type: 'dailymotion',
        src: `https://geo.dailymotion.com/player.html?video=${geoMatch[1]}&autoplay=1`,
      };
    }

    // Link padrão dailymotion.com/video/{id} ou embed/video/{id}
    const dmMatch = trimmed.match(/dailymotion\.com\/(?:embed\/)?video\/([a-zA-Z0-9]+)/i);
    if (dmMatch && dmMatch[1]) {
      return {
        type: 'dailymotion',
        src: `https://geo.dailymotion.com/player.html?video=${dmMatch[1]}&autoplay=1`,
      };
    }
  }

  // 3. Google Drive
  // Patterns: drive.google.com/file/d/{id}/view, drive.google.com/open?id={id}
  if (trimmed.includes('drive.google.com')) {
    const gdriveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
    if (gdriveMatch && gdriveMatch[1]) {
      return {
        type: 'gdrive',
        src: `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`,
      };
    }
  }

  // 4. YouTube
  // Patterns: youtube.com/watch?v={id}, youtu.be/{id}, youtube.com/embed/{id}, youtube.com/shorts/{id}
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`,
    };
  }

  // 5. Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/i);
  if (vimeoMatch && (vimeoMatch[3] || vimeoMatch[1])) {
    const vimeoId = vimeoMatch[3] || vimeoMatch[1];
    return {
      type: 'vimeo',
      src: `https://player.vimeo.com/video/${vimeoId}?autoplay=1`,
    };
  }

  // 6. Ok.ru (Odnoklassniki)
  if (trimmed.includes('ok.ru')) {
    const okMatch = trimmed.match(/ok\.ru\/(?:video|videoembed)\/(\d+)/i);
    if (okMatch && okMatch[1]) {
      return {
        type: 'okru',
        src: `https://ok.ru/videoembed/${okMatch[1]}`,
      };
    }
  }

  // 7. Internet Archive (archive.org)
  if (trimmed.includes('archive.org')) {
    const archiveMatch = trimmed.match(/archive\.org\/(?:details|embed)\/([a-zA-Z0-9_.-]+)/i);
    if (archiveMatch && archiveMatch[1]) {
      return {
        type: 'archive',
        src: `https://archive.org/embed/${archiveMatch[1]}`,
      };
    }
  }

  // 8. Arquivos diretos de vídeo (MP4, HLS m3u8, WebM, Ogg)
  if (/\.(mp4|webm|ogg|m3u8)($|\?)/i.test(trimmed)) {
    return {
      type: 'direct',
      src: trimmed,
    };
  }

  // 9. Embed genérico (Streamtape, Mega, Vidmoly, etc.)
  return {
    type: 'embed',
    src: trimmed,
  };
}
