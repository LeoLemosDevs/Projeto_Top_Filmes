"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function TrafficTracker() {
  const pathname = usePathname();
  const lastTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    if (lastTrackedRef.current === pathname) return;

    lastTrackedRef.current = pathname;

    const movieMatch = pathname.match(/^\/assistir\/([^/?#]+)/);
    const movieId = movieMatch ? movieMatch[1] : null;

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, movieId }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
