"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, Search, X } from "lucide-react";
import { logEvent } from "@/lib/usability";

// Fix default marker icon yang suka error di Next.js/webpack
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export type FlyTarget = { lat: number; lng: number; zoom: number; key: number } | null;

type MapPickerProps = {
  lat: number | null;
  lng: number | null;
  onSelect: (lat: number, lng: number) => void;
  flyTo?: FlyTarget;
};

type HasilCari = { display_name: string; lat: string; lon: string; type?: string };

function ClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyController({ target }: { target: FlyTarget }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], target.zoom, { duration: 0.8 });
  }, [target, map]);
  return null;
}

export default function MapPicker({ lat, lng, onSelect, flyTo }: MapPickerProps) {
  const [layer, setLayer] = useState<"satelit" | "peta">("satelit");
  const [query, setQuery] = useState("");
  const [hasil, setHasil] = useState<HasilCari[] | null>(null);
  const [mencari, setMencari] = useState(false);
  const [errCari, setErrCari] = useState("");
  const [target, setTarget] = useState<FlyTarget>(null);
  const [petunjuk, setPetunjuk] = useState("");

  useEffect(() => {
    if (flyTo) setTarget(flyTo);
  }, [flyTo]);

  const adaTitik = lat !== null && lng !== null;
  const center: [number, number] = adaTitik ? [lat!, lng!] : [-2.5, 118];

  // Pencarian nama desa/kecamatan pakai Nominatim (OSM). Dipanggil saat tombol ditekan,
  // bukan per ketikan, supaya sesuai batas pemakaian Nominatim (maks. 1 request/detik).
  const cari = async () => {
    const q = query.trim();
    if (q.length < 3) {
      setErrCari("Ketik minimal 3 huruf, misalnya nama desa.");
      return;
    }
    setMencari(true);
    setErrCari("");
    setHasil(null);
    try {
      const url =
        "https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=id&limit=5&accept-language=id&q=" +
        encodeURIComponent(q);
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error();
      const data: HasilCari[] = await res.json();
      setHasil(data);
      logEvent("cari_lokasi", { jumlah_hasil: data.length });
      if (data.length === 0) setErrCari("Tempat tidak ditemukan. Coba tambahkan nama kecamatan atau kabupaten.");
    } catch {
      setErrCari("Pencarian gagal. Periksa internet lalu coba lagi.");
    } finally {
      setMencari(false);
    }
  };

  const pilihHasil = (h: HasilCari) => {
    setTarget({ lat: Number(h.lat), lng: Number(h.lon), zoom: 15, key: Date.now() });
    setHasil(null);
    setQuery(h.display_name.split(",")[0]);
    setPetunjuk("Sekarang ketuk letak lahan Anda di peta.");
    logEvent("hasil_cari_dipilih");
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          cari();
        }}
        className="relative mb-2 flex gap-2"
        role="search"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama desa atau kecamatan"
            aria-label="Cari nama desa atau kecamatan"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-8 text-sm text-forest-dark outline-none focus:border-forest"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setHasil(null);
                setErrCari("");
              }}
              aria-label="Hapus pencarian"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={mencari}
          className="flex items-center rounded-lg bg-forest px-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {mencari ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cari"}
        </button>

        {hasil && hasil.length > 0 && (
          <ul className="absolute left-0 right-0 top-full z-[1000] mt-1 max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
            {hasil.map((h, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => pilihHasil(h)}
                  className="block w-full px-3 py-2 text-left text-xs text-forest-dark hover:bg-forest/5"
                >
                  <span className="block font-semibold">{h.display_name.split(",")[0]}</span>
                  <span className="block truncate text-forest-dark/60">
                    {h.display_name.split(",").slice(1).join(",").trim()}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </form>
      {errCari && <p className="mb-2 text-xs text-alert">{errCari}</p>}

      <div className="relative">
        <MapContainer
          center={center}
          zoom={adaTitik ? 15 : 4}
          scrollWheelZoom={false}
          className="h-64 w-full rounded-xl"
        >
          {layer === "satelit" ? (
            <>
              <TileLayer
                key="esri-img"
                attribution="Citra &copy; Esri, Maxar, Earthstar Geographics"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
              />
              {/* label nama tempat di atas citra satelit */}
              <TileLayer
                key="esri-label"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
              />
            </>
          ) : (
            <TileLayer
              key="osm"
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}
          <ClickHandler
            onSelect={(a, b) => {
              setPetunjuk("");
              logEvent("peta_diketuk", { layer });
              onSelect(a, b);
            }}
          />
          <FlyController target={target} />
          {adaTitik && <Marker position={[lat!, lng!]} icon={markerIcon} />}
        </MapContainer>

        <div className="absolute right-2 top-2 z-[500] flex overflow-hidden rounded-lg border border-white/70 bg-white text-xs font-semibold shadow">
          {(["satelit", "peta"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLayer(l)}
              aria-pressed={layer === l}
              className={`px-3 py-1.5 ${layer === l ? "bg-forest-dark text-white" : "text-forest-dark"}`}
            >
              {l === "satelit" ? "Satelit" : "Peta"}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-2 text-xs text-forest-dark/70" aria-live="polite">
        {petunjuk ||
          (adaTitik
            ? `Titik lahan: ${lat!.toFixed(4)}, ${lng!.toFixed(4)}. Ketuk peta untuk memindahkan.`
            : "Ketuk peta tepat di lahan Anda.")}
      </p>
    </div>
  );
}
