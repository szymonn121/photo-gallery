"use client";

import { useState } from "react";

export function ShareButton({ title }: { title: string }) {
  const [label, setLabel] = useState("Udostępnij");
  async function share() {
    try {
      if (navigator.share) await navigator.share({ title, url: window.location.href });
      else {
        await navigator.clipboard.writeText(window.location.href);
        setLabel("Link skopiowany");
        setTimeout(() => setLabel("Udostępnij"), 1800);
      }
    } catch {
      // Closing the native share sheet is not an error that needs surfacing.
    }
  }
  return <button type="button" className="button-secondary" onClick={share}>{label}</button>;
}
