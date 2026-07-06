// Real slippy map — MapLibre GL + CARTO's minimalist basemap (Positron in
// light, Dark Matter in dark). Streets, cities and countries, styled clean.
// No API key (CARTO CDN + OSM data, attributed). Films = accent dots, spots
// = teal diamonds; markers are HTML so they stay a fixed size at every zoom.
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTheme } from "../store/theme";

export interface MapPin {
  lat: number;
  lng: number;
  label?: string; // place name (tooltip subline)
  title?: string; // film title / spot name (tooltip headline)
  id?: string;
  kind?: "film" | "spot";
}

interface Props {
  pins?: MapPin[];
  interactive?: boolean; // clicks drop a lat/lng pin
  onPick?: (lat: number, lng: number) => void;
  onPinClick?: (pin: MapPin) => void;
  className?: string;
}

const SPOT_COLOR = "#4fc3a1";

// CARTO raster basemap — minimalist, free CDN, attribution required.
function rasterStyle(dark: boolean): maplibregl.StyleSpecification {
  const base = dark ? "dark_all" : "light_all";
  return {
    version: 8,
    sources: {
      carto: {
        type: "raster",
        tiles: ["a", "b", "c", "d"].map(
          (s) => `https://${s}.basemaps.cartocdn.com/${base}/{z}/{x}/{y}@2x.png`
        ),
        tileSize: 256,
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
      },
    },
    layers: [{ id: "carto", type: "raster", source: "carto" }],
  };
}

function makeMarkerEl(pin: MapPin, clickable: boolean): HTMLDivElement {
  // MapLibre positions the marker element with its own inline transform, so
  // any rotation must live on an INNER element or it gets overwritten.
  const el = document.createElement("div");
  el.style.width = "12px";
  el.style.height = "12px";
  el.style.cursor = clickable ? "pointer" : "default";
  const inner = document.createElement("div");
  inner.style.width = "100%";
  inner.style.height = "100%";
  inner.style.transition = "transform 120ms ease";
  if (pin.kind === "spot") {
    inner.style.background = SPOT_COLOR;
    inner.style.transform = "rotate(45deg) scale(0.86)";
    inner.style.borderRadius = "2.5px";
    inner.style.border = "1.5px solid rgb(var(--bg))";
    inner.style.boxShadow = "0 1px 4px rgb(0 0 0 / 0.45)";
  } else {
    inner.style.background = "rgb(var(--c-500))";
    inner.style.borderRadius = "50%";
    inner.style.border = "2px solid rgb(var(--bg))";
    inner.style.boxShadow = "0 0 0 4px rgb(var(--c-500) / 0.2), 0 1px 4px rgb(0 0 0 / 0.45)";
  }
  el.appendChild(inner);
  el.addEventListener("mouseenter", () => {
    inner.style.transform = pin.kind === "spot" ? "rotate(45deg) scale(1.25)" : "scale(1.3)";
  });
  el.addEventListener("mouseleave", () => {
    inner.style.transform = pin.kind === "spot" ? "rotate(45deg) scale(0.86)" : "scale(1)";
  });
  return el;
}

export function MapView({ pins = [], interactive = false, onPick, onPinClick, className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const readyRef = useRef(false);
  const mode = useTheme((s) => s.mode);
  // keep the latest callbacks without re-initialising the map
  const pickRef = useRef(onPick);
  pickRef.current = onPick;

  // init once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: rasterStyle(document.documentElement.getAttribute("data-theme") !== "light"),
      center: [19.5, 47.1], // Hungary — where the spots live
      zoom: 5.4,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false, visualizePitch: false }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }));
    map.on("load", () => {
      readyRef.current = true;
    });
    if (interactive) {
      map.getCanvas().style.cursor = "crosshair";
      map.on("click", (e) => pickRef.current?.(+e.lngLat.lat.toFixed(4), +e.lngLat.lng.toFixed(4)));
    }
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      readyRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // theme → swap basemap, keep the camera
  useEffect(() => {
    mapRef.current?.setStyle(rasterStyle(mode !== "light"));
  }, [mode]);

  // pins → markers (+ frame them on first display map)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    const bounds = new maplibregl.LngLatBounds();
    for (const p of pins) {
      const el = makeMarkerEl(p, !!onPinClick);
      if (onPinClick) el.addEventListener("click", (ev) => { ev.stopPropagation(); onPinClick(p); });
      // Instant styled hover popup (the native title tooltip is too slow).
      const tipTitle = p.title ?? (p.kind === "spot" ? "Shooting spot" : "Film");
      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 12,
        className: "rawby-popup",
      }).setHTML(
        `<div class="rp-title"><span class="rp-dot" style="background:${
          p.kind === "spot" ? SPOT_COLOR : "rgb(var(--c-500))"
        }"></span>${tipTitle.replace(/</g, "&lt;")}</div>${
          p.label ? `<div class="rp-sub">${p.label.replace(/</g, "&lt;")}</div>` : ""
        }`
      );
      el.addEventListener("mouseenter", () => popup.setLngLat([p.lng, p.lat]).addTo(map));
      el.addEventListener("mouseleave", () => popup.remove());
      const marker = new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map);
      markersRef.current.push(marker);
      bounds.extend([p.lng, p.lat]);
    }
    // Only auto-frame the read-only maps; picking maps keep the user's view.
    if (pins.length > 1 && !interactive && !readyRef.current) {
      const fit = () => map.fitBounds(bounds, { padding: 48, maxZoom: 8, duration: 0 });
      if (map.loaded()) fit();
      else map.once("load", fit);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pins, onPinClick, interactive]);

  return <div ref={containerRef} className={className} />;
}
