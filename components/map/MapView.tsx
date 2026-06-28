"use client";

import { useEffect, useRef, useState } from "react";
import type { Interest } from "@/types";
import { getRegionLabel } from "@/lib/region";

interface MapDestination {
  slug: string;
  name: string;
  country: string;
  region: string;
  coordinates: { lat: number; lng: number };
  tags: Interest[];
  thumbnailUrl: string;
}

interface MapViewProps {
  destinations: MapDestination[];
  height?: string;
  className?: string;
  centerOn?: { lat: number; lng: number };
  zoom?: number;
}

function createPopupHtml(dest: MapDestination): string {
  const regionLabel = getRegionLabel(dest.region);
  return `
    <div style="font-family: system-ui, sans-serif; min-width: 180px;">
      <img
        src="${dest.thumbnailUrl}"
        alt="${dest.name}"
        style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;"
        onerror="this.style.display='none'"
      />
      <div style="font-weight: 700; font-size: 15px; color: #1c1917; margin-bottom: 2px;">
        ${dest.name}
      </div>
      <div style="font-size: 13px; color: #78716c; margin-bottom: 4px;">
        ${dest.country} · ${regionLabel}
      </div>
      <a
        href="/destinations/${dest.slug}"
        style="display: inline-block; margin-top: 6px; padding: 6px 14px; background: #d97706; color: white; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none;"
      >
        查看攻略 →
      </a>
    </div>
  `;
}

export function MapView({
  destinations,
  height = "500px",
  className,
  centerOn,
  zoom = 2,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const [mounted, setMounted] = useState(false);

  // Ensure we only render on client
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current || mapRef.current) return;

    let map: import("leaflet").Map | null = null;
    let cleanup = false;

    // Dynamic import: Leaflet only works in browser
    import("leaflet").then((L) => {
      if (cleanup || !containerRef.current) return;

      // Fix Leaflet default icon paths
      delete (
        (L.Icon.Default.prototype as unknown as Record<string, unknown>)
          ._getIconUrl
      );
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const container = containerRef.current!;

      // Initialize map
      map = L.map(container, {
        center: centerOn ? [centerOn.lat, centerOn.lng] : [20, 0],
        zoom,
        scrollWheelZoom: true,
        attributionControl: true,
      });

      // Tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      // Add markers
      const bounds: L.LatLng[] = [];

      destinations.forEach((dest) => {
        const latLng: [number, number] = [
          dest.coordinates.lat,
          dest.coordinates.lng,
        ];
        bounds.push(L.latLng(latLng));

        const marker = L.marker(latLng, { title: dest.name });
        marker.bindPopup(createPopupHtml(dest), {
          maxWidth: 260,
          className: "custom-map-popup",
        });
        marker.addTo(map!);
      });

      // Fit bounds
      if (destinations.length > 0 && !centerOn) {
        const latLngBounds = L.latLngBounds(bounds);
        map.fitBounds(latLngBounds.pad(0.1), { maxZoom: 10 });
      }

      mapRef.current = map;
    });

    return () => {
      cleanup = true;
      if (map) map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  if (!mounted) {
    return (
      <div
        style={{ height }}
        className="bg-surface-100 rounded-2xl animate-pulse flex items-center justify-center"
      >
        <p className="text-surface-400 text-sm">加载地图中...</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className={`rounded-2xl overflow-hidden border border-surface-200 ${className || ""}`}
    />
  );
}
