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
  const el = document.createElement("div");
  const spot = pin.kind === "spot";
  el.style.width = "14px";
  el.style.height = "14px";
  el.style.cursor = clickable ? "pointer" : "default";
  el.title = [pin.title, pin.label].filter(Boolean).join(" — ");
  if (spot) {
    el.style.background = SPOT_COLOR;
    el.style.transform = "rotate(45deg)";
    el.style.borderRadius = "3px";
    el.style.border = "1.5px solid rgb(var(--bg))";
    el.style.boxShadow = "0 1px 4px rgb(0 0 0 / 0.4)";
  } else {
    el.style.background = "rgb(var(--c-500))";
    el.style.borderRadius = "50%";
    el.style.border = "2px solid rgb(var(--bg))";
    el.style.boxShadow = "0 0 0 4px rgb(var(--c-500) / 0.2), 0 1px 4px rgb(0 0 0 / 0.4)";
  }
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
    map.addControl(new maplibregl.NavigationControl({ showCompass: false, visualizePitch: false }), "bottom-right");
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
