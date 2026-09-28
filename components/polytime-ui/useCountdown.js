"use client";

import { useEffect, useState } from "react";

// Returns the current time, refreshed every `intervalMs`. Starts as null so
// the server render and the first browser render match (the server's clock
// and the visitor's clock are never identical, which would otherwise cause
// a React hydration warning).
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}

// "03d 18h", "05h 12m", "12m", or "Ended".
export function formatRemaining(ms) {
  if (ms <= 0) return "Ended";
  const mins = Math.floor(ms / 60_000);
  const days = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  const minutes = mins % 60;
  const pad = (n) => String(n).padStart(2, "0");
  if (days > 0) return `${pad(days)}d ${pad(hours)}h`;
  if (hours > 0) return `${pad(hours)}h ${pad(minutes)}m`;
  return `${pad(minutes)}m`;
}
