"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Re-reads the server data for the page it sits on whenever the tab regains
// focus, is restored from the back/forward cache, or every `seconds` while
// visible. The review queue uses it so anything approved, rejected or edited
// elsewhere (the Events / Links tabs, another tab, the crawler adding finds)
// shows up without a manual reload. router.refresh() keeps client state, so
// buttons mid-click and the crawler panel aren't reset.
export default function AutoRefresh({ seconds = 20 }) {
  const router = useRouter();

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const onPageShow = (e) => {
      if (e.persisted) router.refresh();
    };
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", onPageShow);
    const timer = setInterval(refresh, seconds * 1000);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", onPageShow);
      clearInterval(timer);
    };
  }, [router, seconds]);

  return null;
}
