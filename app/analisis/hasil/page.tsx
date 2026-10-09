"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import StepProgress from "@/components/StepProgress";
import Modal from "@/components/Modal";
import NdviScale from "@/components/NdviScale";
import RecommendationCard from "@/components/RecommendationCard";
import FilterTanaman, { Kategori } from "@/components/FilterTanaman";
import KualitasDataBadge from "@/components/KualitasDataBadge";
import CatatanData from "@/components/CatatanData";
import { ringkasKeuntungan } from "@/components/EkonomiCard";
import Link from "next/link";
import { ChevronRight, FlaskConical } from "lucide-react";
import { logEvent } from "@/lib/usability";
import {
  KondisiLahan,
  RecommendResponse,
  RekomendasiItem,
  STORAGE_KEY_FORM,
  STORAGE_KEY_RESULT,
} from "@/lib/api";
import {
  isSumberCadangan,
  labelSumber,
  labelTekstur,
  namaBulanPanjang,
} from "@/lib/labels";

type Tab = "semua" | "bulan";

function fmt(n: number | null | undefined, digit = 1) {
  if (n == null || Number.isNaN(n)) return "-";
  return Number(n).toLocaleString("id-ID", { maximumFractionDigits: digit });
}

function KondisiStat({
  label,
  nilai,
  satuan,
  badge,
  sumber,
  extra,
}: {
  label: string;
  nilai: string;
  satuan?: string;
  badge?: string;
  sumber?: string | null;
  extra?: string;
}) {
  const ket = sumber !== undefined ? labelSumber(sumber) : "";
  return (
    <div className="rounded-xl bg-[#3DA35D] p-3 text-white">
      <p className="text-[10px] font-semibold uppercase opacity-80">{label}</p>
      <p className="font-display text-lg font-bold">
        {nilai}{" "}
        {satuan && <span className="text-xs font-normal">{satuan}</span>}
      </p>
      {extra && <p className="text-[10px] opacity-80">{extra}</p>}
      {badge && (
        <span className="mt-1 inline-block rounded-full bg-sand px-2 py-0.5 text-[10px] font-semibold text-forest-dark">
          {badge}
        </span>
      )}
      {ket && (
        <p
          className={`mt-1 text-[10px] ${isSumberCadangan(sumber) ? "font-semibold text-sand" : "opacity-70"}`}
        >
          {ket}
        </p>
      )}
    </div>
  );
}

function badgePh(ph: number) {
  if (ph < 5.5) return "Masam";
  if (ph < 6.5) return "Agak masam";
  if (ph <= 7.5) return "Netral";
  return "Basa";
}

function KondisiGrid({ k }: { k: KondisiLahan }) {
  const s = k.sumber_data ?? {};
  // key sumber_data bisa "ph" atau "tanah"; cari yang tersedia
  const src = (...keys: string[]) => {
    for (const key of keys) if (key in s) return s[key];
    return undefined;
  };

  return (
    <div className="grid grid-cols-2 gap-3 ">
      <KondisiStat
        label="pH Tanah"
        nilai={fmt(k.ph_tanah)}
        badge={k.ph_tanah != null ? badgePh(k.ph_tanah) : undefined}
        sumber={src("ph", "tanah")}
        extra={
          k.ph_rentang
            ? `kisaran ${fmt(k.ph_rentang[0])}–${fmt(k.ph_rentang[1])}`
            : undefined
        }
      />
      {k.tekstur_kelas !== undefined && (
        <KondisiStat
          label="Tekstur Tanah"
          nilai={labelTekstur(k.tekstur_kelas)}
          sumber={src("tekstur", "tanah")}
        />
      )}
      <KondisiStat
        label="Curah Hujan"
        nilai={fmt(k.curah_hujan, 0)}
        satuan="mm/tahun"
        badge={
          k.curah_hujan < 1000
            ? "Kering"
            : k.curah_hujan > 3000
              ? "Sangat basah"
              : "Cukup"
        }
        sumber={src("iklim", "curah_hujan")}
      />
      <KondisiStat
        label="Suhu Rata-rata"
        nilai={fmt(k.suhu)}
        satuan="°C"
        sumber={src("iklim", "suhu")}
      />
      <KondisiStat
        label="Ketinggian"
        nilai={fmt(k.elevasi, 0)}
        satuan="mdpl"
        sumber={src("elevasi")}
        extra={
          k.kemiringan != null ? `kemiringan ${fmt(k.kemiringan)}°` : undefined
        }
      />
      <KondisiStat
        label="Kondisi Vegetasi (NDVI)"
        nilai={k.ndvi != null ? k.ndvi.toFixed(2) : "-"}
        badge={
          k.ndvi == null
            ? "Tidak tersedia"
            : k.ndvi > 0.6
              ? "Subur"
              : k.ndvi > 0.2
                ? "Sedang"
                : "Marginal"
        }
        sumber={src("ndvi", "satelit")}
      />
    </div>
  );
}

function HasilContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showResetModal, setShowResetModal] = useState(false);
  const [data, setData] = useState<RecommendResponse | null>(null);
  const [kategori, setKategori] = useState<Kategori>("Semua kategori");
  const [tab, setTab] = useState<Tab>("semua");

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY_RESULT);
    if (!raw) {
      router.push("/analisis");
      return;
    }
    const d: RecommendResponse = JSON.parse(raw);
    setData(d);
    logEvent("hasil_tampil", {
      riwayat_id: d.recommendation.riwayat_id ?? null,
      dari_riwayat: Boolean(searchParams.get("riwayat")),
      teratas: d.recommendation.rekomendasi[0]?.id ?? null,
    });
  }, [router, searchParams]);

  if (!data) return null;
  const { kondisi_lahan, rekomendasi, rekomendasi_bulan_tanam } =
    data.recommendation;
  const bulanLabel = namaBulanPanjang(rekomendasi_bulan_tanam?.bulan);
  // BE memakai bulan berjalan kalau pengguna tidak memilih bulan tanam
  const bulanDipilihPengguna = (() => {
    try {
      return (
        Boolean(
          JSON.parse(sessionStorage.getItem(STORAGE_KEY_FORM) || "{}")
            .bulan_tanam,
        ) || Boolean(searchParams.get("riwayat"))
      );
    } catch {
      return false;
    }
  })();
  const adaTabBulan = Boolean(rekomendasi_bulan_tanam?.daftar?.length);
  const daftar: RekomendasiItem[] =
    tab === "bulan" && adaTabBulan
      ? rekomendasi_bulan_tanam!.daftar
      : rekomendasi;

  const filtered =
    kategori === "Semua kategori"
      ? daftar
      : daftar.filter((r) => r.jenis_tanaman === kategori);

  const s = kondisi_lahan.sumber_data ?? {};
  const pakaiUjiTanah = Object.values(s).includes("uji_tanah");

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <StepProgress step={3} label="Langkah 3: Terima Rekomendasi" />

      <section className="flex-1 px-4 py-4">
        <button
          onClick={() => setShowResetModal(true)}
          className="mb-3 text-sm text-forest-dark hover:underline"
        >
          ← Ubah data lahan
        </button>

        {/* Kondisi lahan */}
        <div className="rounded-t-2xl bg-forest px-4 py-3 text-center">
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white">
            Lingkungan Lahan Terdeteksi
          </h3>
        </div>
        <div className="space-y-3 rounded-b-2xl bg-white p-4 shadow-lg">
          {kondisi_lahan.kualitas_data && (
            <div className="flex justify-center">
              <KualitasDataBadge kualitas={kondisi_lahan.kualitas_data} />
            </div>
          )}
          <KondisiGrid k={kondisi_lahan} />
          <NdviScale />
          <CatatanData
            catatan={kondisi_lahan.catatan_data}
            pakaiUjiTanah={pakaiUjiTanah}
          />

          {data.recommendation.riwayat_id &&
            kondisi_lahan.ph_tanah != null &&
            kondisi_lahan.ph_tanah < 6.5 && (
              <Link
                href={`/kapur?riwayat=${data.recommendation.riwayat_id}`}
                onClick={() => logEvent("kapur_dibuka")}
                className="flex items-center gap-3 rounded-xl border border-forest/30 p-3 text-left"
              >
                <FlaskConical className="h-5 w-5 shrink-0 text-forest" />
                <span className="flex-1 text-xs text-forest-dark">
                  <span className="block font-semibold">
                    Tanah agak masam? Coba simulasi pengapuran
                  </span>
                  <span className="block text-forest-dark/60">
                    Lihat tanaman apa yang jadi cocok setelah diberi kapur.
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 text-forest-dark/40" />
              </Link>
            )}
        </div>

        {/* Rekomendasi */}
        <div className="mt-8 rounded-t-2xl bg-forest px-4 py-3 text-center">
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white">
            Rekomendasi Tanaman
          </h3>
        </div>
        <div className="rounded-b-2xl bg-white p-4 shadow-lg">
          {adaTabBulan && (
            <div
              className="mb-4 grid grid-cols-2 rounded-full bg-cream p-1 text-xs font-semibold"
              role="tablist"
            >
              <button
                role="tab"
                aria-selected={tab === "semua"}
                onClick={() => setTab("semua")}
                className={`rounded-full py-2 ${tab === "semua" ? "bg-forest text-white" : "text-forest-dark"}`}
              >
                Paling cocok
              </button>
              <button
                role="tab"
                aria-selected={tab === "bulan"}
                onClick={() => setTab("bulan")}
                className={`rounded-full py-2 ${tab === "bulan" ? "bg-forest text-white" : "text-forest-dark"}`}
              >
                {bulanDipilihPengguna
                  ? `Cocok ditanam ${bulanLabel}`
                  : "Cocok ditanam sekarang"}
              </button>
            </div>
          )}

          {tab === "bulan" && adaTabBulan && (
            <p className="mb-3 text-xs leading-relaxed text-forest-dark/70">
              Urutan tanaman kalau mulai ditanam bulan {bulanLabel}
              {bulanDipilihPengguna ? "" : " (bulan ini)"}, memperhitungkan
              hujan selama masa tanam.
              {!bulanDipilihPengguna &&
                " Pilih bulan tanam di form kalau rencananya berbeda."}
            </p>
          )}

          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs text-forest-dark/70">
              Menampilkan{" "}
              <span className="font-bold text-forest-dark">
                {filtered.length}
              </span>{" "}
              dari{" "}
              <span className="font-bold text-forest-dark">
                {daftar.length}
              </span>{" "}
              tanaman
            </p>
            <FilterTanaman value={kategori} onChange={setKategori} />
          </div>

          <div className="space-y-3">
            {filtered.map((r, i) => (
              <RecommendationCard
                key={`${tab}-${r.rekomendasi_id ?? r.id}`}
                rank={i + 1}
                name={r.nama}
                note={[
                  r.jenis_tanaman,
                  r.kesuburan_ideal,
                  r.ph_ideal && `pH ${r.ph_ideal}`,
                ]
                  .filter((x) => x && x !== "-")
                  .join(" | ")}
                score={Math.round(r.skor_kesesuaian * 100)}
                mulaiTanam={r.mulai_tanam}
                jumlahPembatas={r.faktor_pembatas?.length ?? 0}
                kepercayaan={r.tingkat_kepercayaan}
                untungPerHa={ringkasKeuntungan(r.ekonomi)}
                onClick={() =>
                  router.push(`/analisis/detail/${r.rekomendasi_id}`)
                }
              />
            ))}
            {filtered.length === 0 && (
              <p className="py-4 text-center text-xs text-forest-dark/60">
                Tidak ada tanaman kategori ini. Pilih kategori lain.
              </p>
            )}
          </div>
        </div>
      </section>

      <Modal
        open={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Kembali ke form untuk mengubah data lahan?"
        onConfirm={() => router.push("/analisis")}
      />
    </div>
  );
}

export default function HasilPage() {
  return (
    <Suspense fallback={null}>
      <HasilContent />
    </Suspense>
  );
}
