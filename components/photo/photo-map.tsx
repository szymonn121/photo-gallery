"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";

export function PhotoMap({ latitude, longitude, title }: { latitude: number; longitude: number; title: string }) {
  const id = useId().replace(/:/g, "");
  const mapRef = useRef<LeafletMap | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let active = true;
    import("leaflet").then((L) => {
      if (!active || mapRef.current) return;
      const map = L.map(id, { scrollWheelZoom: false, zoomControl: true }).setView([latitude, longitude], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      const icon = L.divIcon({ className: "", html: '<div class="cinematic-marker"></div>', iconSize: [22, 22], iconAnchor: [11, 22] });
      L.marker([latitude, longitude], { icon }).addTo(map).bindPopup(title);
      mapRef.current = map;
    });
    return () => {
      active = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [id, latitude, longitude, title]);

  useEffect(() => {
    if (expanded) setTimeout(() => mapRef.current?.invalidateSize(), 50);
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setExpanded(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [expanded]);


  return (
    <>
      <div className="map-frame overflow-hidden rounded-2xl border border-[var(--line)]">
        <div id={id} className="h-72 w-full sm:h-80" aria-label={`Mapa lokalizacji: ${title}`} />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="button-secondary" onClick={() => setExpanded(true)}>Otwórz większą mapę</button>
        <a className="button-ghost" target="_blank" rel="noreferrer" href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`}>Otwórz w OpenStreetMap</a>
      </div>
      {expanded && (
        <div role="dialog" aria-modal="true" aria-label="Powiększona mapa" className="fixed inset-0 z-[80] grid place-items-center bg-black/85 p-4" onClick={() => setExpanded(false)}>
          <div className="map-frame relative h-[80svh] w-full max-w-6xl overflow-hidden rounded-2xl border border-[var(--line)] bg-[#211713]" onClick={(event) => event.stopPropagation()}>
            <button type="button" autoFocus className="absolute right-4 top-4 z-[1000] button-primary px-4" onClick={() => setExpanded(false)}>Zamknij</button>
            <ExpandedMap latitude={latitude} longitude={longitude} title={title} />
          </div>
        </div>
      )}
    </>
  );
}

function ExpandedMap({ latitude, longitude, title }: { latitude: number; longitude: number; title: string }) {
  const id = useId().replace(/:/g, "");
  useEffect(() => {
    let map: LeafletMap | undefined;
    import("leaflet").then((L) => {
      map = L.map(id).setView([latitude, longitude], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 19 }).addTo(map);
      const icon = L.divIcon({ className: "", html: '<div class="cinematic-marker"></div>', iconSize: [22, 22], iconAnchor: [11, 22] });
      L.marker([latitude, longitude], { icon }).addTo(map).bindPopup(title).openPopup();
    });
    return () => map?.remove();
  }, [id, latitude, longitude, title]);
  return <div id={id} className="h-full w-full" />;
}
