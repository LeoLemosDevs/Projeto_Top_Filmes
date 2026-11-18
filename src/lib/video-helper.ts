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

export function processVideoUrl(rawUrl: string, startSeconds = 0): ProcessedVideo {
  if (!rawUrl) {
    return { type: 'embed', src: '' };
  }

  const safeStart = Math.max(0, Math.floor(startSeconds || 0));
  let trimmed = rawUrl.trim();

  // Se o usuário colou o código <iframe> completo, extrai a URL do atributo src
  const iframeMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    trimmed = iframeMatch[1].trim();
  }

  // 1. TokyVideo (tokyvideo.com, tokyvideo.com/br, /es, /fr, etc.)
  if (trimmed.includes('tokyvideo.com')) {
    // Caso já seja uma URL de embed com ID numérico (ex: /br/embed/717987 ou /embed/717987)
    const numericEmbed = trimmed.match(/tokyvideo\.com\/(?:[a-zA-Z]{2}\/)?embed\/(\d+)/i);
    if (numericEmbed && numericEmbed[1]) {
      return {
        type: 'tokyvideo',
        src: `https://www.tokyvideo.com/br/embed/${numericEmbed[1]}`,
      };
    }

    // Caso seja uma URL de embed com slug
    const embedSlugMatch = trimmed.match(/tokyvideo\.com\/(?:[a-zA-Z]{2}\/)?embed\/([a-zA-Z0-9_-]+)/i);
    if (embedSlugMatch && embedSlugMatch[1]) {
      return {
        type: 'tokyvideo',
        src: `https://www.tokyvideo.com/br/embed/${embedSlugMatch[1]}`,
      };
    }

    // Caso seja o link normal de visualização (/video/slug ou /br/video/slug)
    const videoMatch = trimmed.match(/tokyvideo\.com\/(?:[a-zA-Z]{2}\/)?video\/([a-zA-Z0-9_-]+)/i);
    if (videoMatch && videoMatch[1]) {
      return {
        type: 'tokyvideo',
        src: `https://www.tokyvideo.com/br/embed/${videoMatch[1]}`,
      };
    }
  }

  // 2. Dailymotion (dailymotion.com, dai.ly, geo.dailymotion.com)
  if (trimmed.includes('dailymotion.com') || trimmed.includes('dai.ly')) {
    const startParam = safeStart > 5 ? `&startTime=${safeStart}` : '';
    // Link curto dai.ly/{id}
    const dailyShort = trimmed.match(/dai\.ly\/([a-zA-Z0-9]+)/i);
    if (dailyShort && dailyShort[1]) {
      return {
        type: 'dailymotion',
        src: `https://geo.dailymotion.com/player.html?video=${dailyShort[1]}&autoplay=1${startParam}`,
      };
    }

    // Player geo com ?video={id}
    const geoMatch = trimmed.match(/video=([a-zA-Z0-9]+)/i);
    if (geoMatch && geoMatch[1]) {
      return {
        type: 'dailymotion',
        src: `https://geo.dailymotion.com/player.html?video=${geoMatch[1]}&autoplay=1${startParam}`,
      };
    }

    // Link padrão dailymotion.com/video/{id} ou embed/video/{id}
    const dmMatch = trimmed.match(/dailymotion\.com\/(?:embed\/)?video\/([a-zA-Z0-9]+)/i);
    if (dmMatch && dmMatch[1]) {
      return {
        type: 'dailymotion',
        src: `https://geo.dailymotion.com/player.html?video=${dmMatch[1]}&autoplay=1${startParam}`,
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
    const startParam = safeStart > 5 ? `&start=${safeStart}` : '';
    return {
      type: 'youtube',
      src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1${startParam}`,
    };
  }

  // 5. Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/i);
  if (vimeoMatch && (vimeoMatch[3] || vimeoMatch[1])) {
    const vimeoId = vimeoMatch[3] || vimeoMatch[1];
    const hashParam = safeStart > 5 ? `#t=${safeStart}s` : '';
    return {
      type: 'vimeo',
      src: `https://player.vimeo.com/video/${vimeoId}?autoplay=1${hashParam}`,
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

/**
 * Resolução assíncrona avançada para plataformas como TokyVideo que utilizam slugs na URL pública
 * mas requerem o ID numérico específico no endpoint de embed (/br/embed/ID).
 */
export async function resolveVideoUrlAsync(rawUrl: string): Promise<ProcessedVideo> {
  const initial = processVideoUrl(rawUrl);

  // Se for TokyVideo e ainda contiver um slug alfanumérico em vez de apenas dígitos
  if (initial.type === 'tokyvideo') {
    const slugMatch = initial.src.match(/tokyvideo\.com\/(?:[a-zA-Z]{2}\/)?embed\/([a-zA-Z0-9_-]+)/i);
    if (slugMatch && slugMatch[1] && !/^\d+$/.test(slugMatch[1])) {
      const slug = slugMatch[1];
      const watchUrl = `https://www.tokyvideo.com/br/video/${slug}`;
      try {
        const res = await fetch(watchUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
          },
        });

        if (res.ok) {
          const html = await res.text();
          // Procura o ID numérico no código de embed da página do TokyVideo
          const matchEmbed = 
            html.match(/tokyvideo\.com\/(?:[a-zA-Z]{2}\/)?embed\/(\d+)/i) ||
            html.match(/data-(?:stats-)?video-id=['"](\d+)['"]/i) ||
            html.match(/tokyvideo\.com\/videos\/\d+\/(\d+)\//i);

          if (matchEmbed && matchEmbed[1]) {
            return {
              type: 'tokyvideo',
              src: `https://www.tokyvideo.com/br/embed/${matchEmbed[1]}`,
            };
          }
        }
      } catch (err) {
        console.error("Falha ao resolver Tokyvideo ID:", err);
      }
    }
  }

  return initial;
}
