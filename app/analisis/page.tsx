"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, MapPin } from "lucide-react";

import Modal from "@/components/Modal";
import BulanTanamPicker from "@/components/BulanTanamPicker";
import LuasLahanInput from "@/components/LuasLahanInput";
import UjiTanahForm, {
  UJI_TANAH_KOSONG,
  UjiTanahState,
  ujiTanahKePayload,
  ujiTanahTerisi,
  validasiUjiTanah,
} from "@/components/UjiTanahForm";
import type { FlyTarget } from "@/components/MapPicker";

import { getAnonymousId } from "@/lib/anonymousId";
import {
  AnalisisPayload,
  STORAGE_KEY_FORM,
  STORAGE_KEY_FORM_UI,
  STORAGE_KEY_JOB,
  STORAGE_KEY_PERLU_INPUT,
} from "@/lib/api";
import { DEFAULT_M2_PER_BATA, keM2, SatuanLuas } from "@/lib/luas";
import { logEvent } from "@/lib/usability";

const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-xl bg-cream text-sm italic text-forest-dark/50">
      Memuat peta...
    </div>
  ),
});

function isInIndonesia(lat: number, lon: number): boolean {
  return lat >= -11 && lat <= 6 && lon >= 95 && lon <= 141;
}

// State form yang disimpan di sessionStorage supaya bisa diisi ulang otomatis
// (misalnya setelah BE minta data uji tanah lewat 422 perlu_input).
type FormUI = {
  lat: number | null;
  lng: number | null;
  namaLokasi: string;
  bulanTanam: number | null;
  luas: { nilai: string; satuan: SatuanLuas; m2PerBata: string };
  ujiTanah: UjiTanahState;
};

const LUAS_KOSONG = {
  nilai: "",
  satuan: "m2" as SatuanLuas,
  m2PerBata: String(DEFAULT_M2_PER_BATA),
};

function AnalisisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ujiTanahRef = useRef<HTMLDivElement>(null);

  const [showResetModal, setShowResetModal] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [flyTo, setFlyTo] = useState<FlyTarget>(null);
  const [namaLokasi, setNamaLokasi] = useState("");
  const [bulanTanam, setBulanTanam] = useState<number | null>(null);
  const [luas, setLuas] = useState(LUAS_KOSONG);
  const [ujiTanah, setUjiTanah] = useState<UjiTanahState>(UJI_TANAH_KOSONG);
  const [ujiTanahOpen, setUjiTanahOpen] = useState(false);
  const [butuhInput, setButuhInput] = useState<string[]>([]);
  const [formError, setFormError] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);

  // Pulihkan isian sebelumnya + tangani perlu_input
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY_FORM_UI);
      if (raw) {
        const f: FormUI = JSON.parse(raw);
        setLat(f.lat);
        setLng(f.lng);
        if (f.lat !== null && f.lng !== null)
          setFlyTo({ lat: f.lat, lng: f.lng, zoom: 15, key: Date.now() });
        setNamaLokasi(f.namaLokasi ?? "");
        setBulanTanam(f.bulanTanam ?? null);
        setLuas(f.luas ?? LUAS_KOSONG);
        setUjiTanah({ ...UJI_TANAH_KOSONG, ...(f.ujiTanah ?? {}) });
        if (
          f.ujiTanah &&
          ujiTanahTerisi({ ...UJI_TANAH_KOSONG, ...f.ujiTanah })
        )
          setUjiTanahOpen(true);
      }
    } catch {
      /* abaikan data rusak */
    }

    if (searchParams.get("perlu_input")) {
      const butuh = JSON.parse(
        sessionStorage.getItem(STORAGE_KEY_PERLU_INPUT) || "[]",
      );
      setButuhInput(butuh.length ? butuh : ["ph", "tekstur_kelas"]);
      setUjiTanahOpen(true);
      setTimeout(
        () =>
          ujiTanahRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        300,
      );
    }
  }, [searchParams]);

  const handleMapSelect = (newLat: number, newLng: number) => {
    setLat(Number(newLat.toFixed(5)));
    setLng(Number(newLng.toFixed(5)));
    setFormError("");
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setFormError(
        "Perangkat ini tidak mendukung lokasi otomatis. Ketuk peta saja.",
      );
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleMapSelect(pos.coords.latitude, pos.coords.longitude);
        logEvent("lokasi_gps_dipakai");
        setFlyTo({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          zoom: 17,
          key: Date.now(),
        });
        setGeoLoading(false);
      },
      () => {
        setFormError(
          "Lokasi tidak bisa dibaca. Izinkan akses lokasi di browser, atau ketuk peta.",
        );
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const handleSubmit = () => {
    const gagalValidasi = (pesan: string) => {
      setFormError(pesan);
      logEvent("form_tidak_valid", { pesan });
    };
    if (lat === null || lng === null) {
      gagalValidasi(
        "Tentukan lokasi lahan dulu: ketuk peta, cari nama desa, atau pakai lokasi sekarang.",
      );
      return;
    }
    if (!isInIndonesia(lat, lng)) {
      gagalValidasi(
        "Lokasi berada di luar Indonesia. Pilih lokasi di dalam Indonesia.",
      );
      return;
    }
    if (!namaLokasi.trim()) {
      gagalValidasi('Beri nama lahan ini, misalnya "Sawah Pak Budi".');
      return;
    }

    let luasM2: number | undefined;
    if (luas.nilai.trim()) {
      const angka = Number(luas.nilai.replace(",", "."));
      const perBata =
        Number(luas.m2PerBata.replace(",", ".")) || DEFAULT_M2_PER_BATA;
      if (!(angka > 0)) {
        gagalValidasi("Luas lahan harus angka lebih dari 0.");
        return;
      }
      luasM2 = Math.round(keM2(angka, luas.satuan, perBata));
    }

    const errUji = validasiUjiTanah(ujiTanah);
    if (errUji) {
      setUjiTanahOpen(true);
      gagalValidasi(errUji);
      return;
    }

    if (butuhInput.length) {
      const p = ujiTanahKePayload(ujiTanah);
      const adaPh = p?.ph != null;
      const adaTekstur = Boolean(p?.tekstur_kelas || p?.sand != null);
      if (!adaPh && !adaTekstur) {
        gagalValidasi(
          "Data tanah lokasi ini tidak tersedia. Isi pH atau tekstur tanah agar analisis bisa jalan.",
        );
        return;
      }
    }
    setFormError("");

    const payload: AnalisisPayload = {
      lat,
      lon: lng,
      nama_lokasi: namaLokasi.trim(),
      anonymous_id: getAnonymousId(),
      ...(bulanTanam ? { bulan_tanam: bulanTanam } : {}),
      ...(luasM2 ? { luas_lahan_m2: luasM2 } : {}),
    };
    const uji = ujiTanahKePayload(ujiTanah);
    if (uji) payload.uji_tanah = uji;

    const ui: FormUI = { lat, lng, namaLokasi, bulanTanam, luas, ujiTanah };
    sessionStorage.setItem(STORAGE_KEY_FORM_UI, JSON.stringify(ui));
    sessionStorage.setItem(STORAGE_KEY_FORM, JSON.stringify(payload));
    sessionStorage.removeItem(STORAGE_KEY_JOB);
    sessionStorage.removeItem(STORAGE_KEY_PERLU_INPUT);
    logEvent("analisis_dikirim", {
      pakai_uji_tanah: Boolean(uji),
      pakai_bulan_tanam: Boolean(bulanTanam),
      pakai_luas: Boolean(luasM2),
      setelah_perlu_input: butuhInput.length > 0,
    });
    router.push("/analisis/loading");
  };

  const confirmReset = () => {
    setLat(null);
    setLng(null);
    setNamaLokasi("");
    setBulanTanam(null);
    setLuas(LUAS_KOSONG);
    setUjiTanah(UJI_TANAH_KOSONG);
    setButuhInput([]);
    setFormError("");
    sessionStorage.removeItem(STORAGE_KEY_FORM_UI);
    sessionStorage.removeItem(STORAGE_KEY_PERLU_INPUT);
    setShowResetModal(false);
    router.replace("/analisis");
  };

  const labelCls = "mb-1 block text-xs font-bold text-forest-dark";
  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-forest-dark outline-none focus:border-forest";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <section className="flex-1 px-4 py-4">
        <h2 className="mb-4 text-center font-display text-base font-bold text-forest-dark">
          Langkah 1: Masukkan Data
        </h2>
        <div className="mx-auto mb-4 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-forest-dark/20">
          <div className="h-full w-1/3 rounded-full bg-forest" />
        </div>

        {butuhInput.length > 0 && (
          <div className="mb-4 flex gap-3 rounded-2xl border border-[#E8A93C] bg-[#FFF8E8] p-3 text-xs text-forest-dark">
            <AlertTriangle className="h-5 w-5 shrink-0 text-[#C98A1E]" />
            <p>
              <b>Data tanah untuk lokasi ini tidak tersedia</b> dari satelit
              maupun wilayah sekitarnya. Isi pH atau tekstur tanah di bagian
              &quot;Punya hasil uji tanah?&quot;, lalu kirim lagi.
            </p>
          </div>
        )}

        <div className="space-y-5 rounded-3xl border-2 border-forest bg-white p-5">
          {/* 1. Lokasi */}
          <div>
            <h3 className="mb-2 text-sm font-bold text-forest-dark">
              Di mana lahan Anda?
            </h3>
            <MapPicker
              lat={lat}
              lng={lng}
              onSelect={handleMapSelect}
              flyTo={flyTo}
            />

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={geoLoading}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-forest py-3 text-sm font-semibold text-white hover:bg-forest-light disabled:opacity-60"
            >
              <MapPin className="h-4 w-4" />
              {geoLoading ? "Membaca lokasi..." : "Pakai lokasi saya sekarang"}
            </button>

            <div className="mt-4">
              <p className="mb-2 text-xs text-forest-dark/70">
                Atau isi koordinat langsung (otomatis terisi saat Anda mengetuk
                peta):
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls} htmlFor="in-lat">
                    Lintang (latitude)
                  </label>
                  <input
                    id="in-lat"
                    type="number"
                    inputMode="decimal"
                    step="any"
                    placeholder="-6.0288"
                    value={lat ?? ""}
                    onChange={(e) =>
                      setLat(
                        e.target.value === "" ? null : Number(e.target.value),
                      )
                    }
                    onBlur={() =>
                      lat !== null &&
                      lng !== null &&
                      setFlyTo({ lat, lng, zoom: 15, key: Date.now() })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="in-lng">
                    Bujur (longitude)
                  </label>
                  <input
                    id="in-lng"
                    type="number"
                    inputMode="decimal"
                    step="any"
                    placeholder="106.4856"
                    value={lng ?? ""}
                    onChange={(e) =>
                      setLng(
                        e.target.value === "" ? null : Number(e.target.value),
                      )
                    }
                    onBlur={() =>
                      lat !== null &&
                      lng !== null &&
                      setFlyTo({ lat, lng, zoom: 15, key: Date.now() })
                    }
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Nama */}
          <div>
            <label className={labelCls} htmlFor="in-nama">
              Nama lahan
            </label>
            <input
              id="in-nama"
              type="text"
              placeholder="Contoh: Sawah Pak Budi"
              value={namaLokasi}
              onChange={(e) => setNamaLokasi(e.target.value)}
              className={inputCls}
            />
          </div>

          {/* 3. Bulan tanam */}
          <div>
            <p className={labelCls}>
              Rencana bulan tanam{" "}
              <span className="font-normal text-forest-dark/60">
                (opsional)
              </span>
            </p>
            <BulanTanamPicker value={bulanTanam} onChange={setBulanTanam} />
          </div>

          {/* 4. Luas */}
          <div>
            <p className={labelCls}>
              Luas lahan{" "}
              <span className="font-normal text-forest-dark/60">
                (opsional)
              </span>
            </p>
            <LuasLahanInput
              nilai={luas.nilai}
              satuan={luas.satuan}
              m2PerBata={luas.m2PerBata}
              onChange={setLuas}
            />
          </div>

          {/* 5. Uji tanah */}
          <div ref={ujiTanahRef} className="scroll-mt-4">
            <UjiTanahForm
              open={ujiTanahOpen}
              onToggle={() => setUjiTanahOpen((o) => !o)}
              value={ujiTanah}
              onChange={setUjiTanah}
              butuhInput={butuhInput}
            />
          </div>

          {formError && (
            <p role="alert" className="text-sm font-semibold text-alert">
              {formError}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="flex-1 rounded-full border-2 border-forest py-3 text-sm font-semibold text-forest hover:bg-forest/5"
            >
              Kosongkan
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 rounded-full bg-forest py-3 text-sm font-semibold text-white hover:bg-forest-light"
            >
              Analisis lahan
            </button>
          </div>
        </div>
      </section>

      <Modal
        open={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Kosongkan semua data yang diisi?"
        onConfirm={confirmReset}
      />
    </div>
  );
}

export default function AnalisisPage() {
  return (
    <Suspense fallback={null}>
      <AnalisisContent />
    </Suspense>
  );
}
