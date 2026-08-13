"use client";

import { useEffect, useState } from "react";

export function OfflineNotice() {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  if (!offline) return null;
  return <div role="status" className="fixed bottom-4 left-1/2 z-[90] -translate-x-1/2 rounded-full bg-[var(--beige)] px-5 py-3 text-sm font-semibold text-[var(--ink)] shadow-2xl">Jesteś offline. Niektóre fotografie mogą się nie załadować.</div>;
}
