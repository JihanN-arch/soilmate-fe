"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { AlertTriangle, BarChart3, Calendar, CalendarDays, CheckCircle2, ChevronRight, Leaf, MessageSquare, Sprout } from "lucide-react";

import CircularGauge from "@/components/CircularGauge";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import KalenderTanam from "@/components/KalenderTanam";
import SectionCard from "@/components/SectionCard";
import EkonomiCard from "@/components/EkonomiCard";
import TanamSheet from "@/components/TanamSheet";
import FeedbackForm from "@/components/FeedbackForm";
import { useCropDetail } from "@/lib/useCropDetail";
import {
  Ekonomi,
  findStoredRekomendasi,
  getCropImage,
  getEkonomi,
  normalizeTrenHarga,
  RekomendasiItem,
  STORAGE_KEY_RESULT,
  TitikHarga,
} from "@/lib/api";
import { logEvent } from "@/lib/usability";
import { BULAN_PENDEK, namaBulanPanjang } from "@/lib/labels";

export default function DetailTanamanPage() {
  const router = useRouter();
  const params = useParams<{ rekomendasiId: string }>();
  const detail = useCropDetail(params.rekomendasiId);
  const [item, setItem] = useState<RekomendasiItem | null>(null);
  const [adaHasilSesi, setAdaHasilSesi] = useState(false);
  const [bulanAcuan, setBulanAcuan] = useState<number | null>(null);
  const [ekonomiFetch, setEkonomiFetch] = useState<{ ekonomi: Ekonomi; tren: TitikHarga[] } | null>(null);
  const [showTanam, setShowTanam] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const rawHasil = sessionStorage.getItem(STORAGE_KEY_RESULT);
    setAdaHasilSesi(Boolean(rawHasil));
    // bulan yang dipakai di tab "Cocok ditanam" (pilihan pengguna atau bulan berjalan)
    try {
      const singkat = JSON.parse(rawHasil || "null")?.recommendation?.rekomendasi_bulan_tanam?.bulan;
      const i = BULAN_PENDEK.findIndex((b) => b.toLowerCase() === String(singkat ?? "").toLowerCase().slice(0, 3));
      setBulanAcuan(i >= 0 ? i + 1 : new Date().getMonth() + 1);
    } catch {
      setBulanAcuan(new Date().getMonth() + 1);
    }
    logEvent("detail_dibuka", { rekomendasi_id: Number(params.rekomendasiId) });
  }, [params.rekomendasiId]);

  // Kalau endpoint detail belum menyertakan ekonomi, ambil dari /api/ekonomi/<slug>/
  useEffect(() => {
    if (!detail || detail.ekonomi !== undefined || detail.tren_harga !== undefined) return;
    const slug = detail.crop_slug ?? detail.slug ?? item?.crop_slug;
    if (slug) getEkonomi(slug).then(setEkonomiFetch).catch(() => {});
  }, [detail, item]);

  // Field baru (rincian skor, faktor pembatas, dst.) diambil dari hasil analisis tersimpan,
  // dengan cadangan dari ringkasan_rekomendasi di endpoint detail.
  useEffect(() => {
    setItem(findStoredRekomendasi(Number(params.rekomendasiId)));
  }, [params.rekomendasiId]);

  if (detail === undefined) return null;
  if (detail === null) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <section className="flex flex-1 items-center justify-center px-5 text-center text-forest-dark">
          <p>Data tanaman tidak ditemukan. Coba analisis ulang.</p>
        </section>
      </div>
    );
  }

  const ring = detail.ringkasan_rekomendasi;
  const skor = ring.skor_kesesuaian ?? item?.skor_kesesuaian;
  const kepercayaanLabel = ring.tingkat_kepercayaan ?? item?.tingkat_kepercayaan;
  const detailKepercayaan = ring.detail_kepercayaan ?? item?.detail_kepercayaan ?? null;
  const kepercayaanSkor = detailKepercayaan?.skor;
  const alasan = ring.alasan_rekomendasi ?? item?.alasan_rekomendasi ?? [];
  const pembatas = ring.faktor_pembatas ?? item?.faktor_pembatas ?? [];
  const rincian = ring.rincian_skor ?? item?.rincian_skor ?? undefined;
  const mulaiTanam = ring.mulai_tanam ?? item?.mulai_tanam ?? null;
  const musimMm = ring.musim_tanam_mm ?? item?.musim_tanam_mm ?? null;
  // Riwayat lama tidak menyimpan info tanam (keduanya null) → jangan tampilkan "tanaman tahunan"
  const adaInfoTanam = mulaiTanam != null || musimMm != null;
  const skorPerBulan = ring.skor_per_bulan ?? item?.skor_per_bulan ?? null;
  const sumberSkor = ring.sumber_skor ?? item?.sumber_skor;
  const diLuarRentang = Boolean(ring.di_luar_rentang_latih ?? item?.di_luar_rentang_latih);
  const alasanTurun = detailKepercayaan?.diturunkan_karena ?? [];
  const ekonomi = detail.ekonomi ?? item?.ekonomi ?? ekonomiFetch?.ekonomi ?? null;
  const tren = detail.tren_harga !== undefined ? normalizeTrenHarga(detail.tren_harga) : ekonomiFetch?.tren ?? [];
  const rekId = Number(params.rekomendasiId);

  const menuItems = [
    { label: "Cara budidaya", href: `/analisis/detail/${params.rekomendasiId}/budidaya` },
    { label: "Syarat Tumbuh", href: `/analisis/detail/${params.rekomendasiId}/syarat-tumbuh` },
    { label: "Manfaat", href: `/analisis/detail/${params.rekomendasiId}/manfaat` },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <section className="flex-1">
        <div className="px-4 py-3">
          <button
            onClick={() => router.push(adaHasilSesi ? "/analisis/hasil" : "/riwayat")}
            className="text-sm text-forest-dark hover:underline"
          >
            ← {adaHasilSesi ? "Kembali ke hasil analisis" : "Ke Lahan Saya"}
          </button>
        </div>

        <div className="relative h-44 w-full bg-gray-100">
          <Image src={getCropImage(detail.crop_slug ?? detail.nama)} alt={detail.nama} fill className="object-cover" />
        </div>

        <div className="px-4 py-5">
          <h1 className="font-display text-lg font-bold text-forest-dark">{detail.nama.toUpperCase()}</h1>
          <p className="mb-3 text-sm italic text-forest-dark/50">({detail.nama_latin})</p>
          <p className="text-sm leading-relaxed text-forest-dark/80">{detail.deskripsi}</p>

          <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 text-xs">
            <div className="flex items-center gap-1.5">
              <Leaf className="h-4 w-4 text-forest" />
              <div><p className="font-semibold text-forest-dark">Jenis Tanaman</p><p className="text-forest-dark/60">{detail.jenis_tanaman}</p></div>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-forest" />
              <div><p className="font-semibold text-forest-dark">Umur Panen</p><p className="text-forest-dark/60">{detail.umur_panen}</p></div>
            </div>
            <div className="flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-forest" />
              <div><p className="font-semibold text-forest-dark">Produktivitas Nasional</p><p className="text-forest-dark/60">{detail.produktivitas_tanaman}</p></div>
            </div>
          </div>
        </div>

        <div className="mx-4 mb-5">
          <button
            onClick={() => setShowTanam(true)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-forest py-3 text-sm font-semibold text-white hover:bg-forest-light"
          >
            <Sprout className="h-4 w-4" /> Saya menanam ini
          </button>
          <p className="mt-1.5 text-center text-[11px] text-forest-dark/60">
            Kondisi tanaman akan dipantau lewat satelit dan prakiraan cuaca.
          </p>
        </div>

        {/* Waktu tanam */}
        {(adaInfoTanam || skorPerBulan) && (
          <div className="mx-4 mb-5 flex gap-3 rounded-2xl border border-forest/20 bg-cream-light p-4">
            <CalendarDays className="h-6 w-6 shrink-0 text-forest" />
            <div className="min-w-0 flex-1 text-sm text-forest-dark">
              {mulaiTanam ? (
                <>
                  <p className="font-bold">Waktu tanam terbaik: mulai {namaBulanPanjang(mulaiTanam)}</p>
                  {musimMm != null && (
                    <p className="mt-0.5 text-xs text-forest-dark/70">
                      Perkiraan hujan selama masa tanam: {Math.round(musimMm).toLocaleString("id-ID")} mm
                    </p>
                  )}
                  {skorPerBulan && (
                    <div className="mt-3">
                      <p className="mb-1 text-xs font-semibold text-forest-dark/70">Kecocokan kalau mulai tanam di bulan…</p>
                      <KalenderTanam skor={skorPerBulan} bulanAcuan={bulanAcuan} />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="font-bold">Tanaman tahunan</p>
                  <p className="mt-0.5 text-xs text-forest-dark/70">
                    Waktu tanam tidak dihitung per bulan untuk tanaman ini.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        <div className="border-t border-gray-100">
          {menuItems.map((m) => (
            <button
              key={m.label}
              onClick={() => router.push(m.href)}
              className="flex w-full items-center justify-between border-b border-gray-100 px-4 py-3.5 text-left"
            >
              <div>
                <p className="text-sm font-semibold text-forest-dark">{m.label}</p>
                <p className="text-xs text-forest-dark/40">Klik untuk melihat</p>
              </div>
              <ChevronRight className="h-4 w-4 text-forest-dark/40" />
            </button>
          ))}
        </div>

        <div className="space-y-3 px-4 py-5">
          <h3 className="text-center font-display text-base font-bold text-forest-dark">Ringkasan Rekomendasi</h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-ringkasanCard p-3">
              <CircularGauge
                size={64}
                value={Math.round(skor * 100)}
                label="Skor Kesesuaian"
                sublabel={skor >= 0.8 ? "Sangat sesuai" : skor >= 0.6 ? "Cukup sesuai" : "Kurang sesuai"}
              />
            </div>
            <div className="rounded-2xl bg-ringkasanCard p-3">
              {kepercayaanSkor != null ? (
                <CircularGauge
                  size={64}
                  value={Math.round(kepercayaanSkor * 100)}
                  label="Tingkat Keyakinan"
                  sublabel={kepercayaanLabel ?? ""}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="font-display text-lg font-bold text-forest-dark">{kepercayaanLabel ?? "-"}</p>
                  <p className="text-xs font-semibold text-forest-dark">Tingkat Keyakinan</p>
                </div>
              )}
            </div>
          </div>

          {rincian && Object.keys(rincian).length > 0 && (
            <SectionCard title="Kecocokan per Faktor">
              <ScoreBreakdown rincian={rincian} />
            </SectionCard>
          )}

          {alasan.length > 0 && (
            <div className="rounded-2xl bg-[#EEF5E3] p-4 text-sm">
              <p className="mb-2 flex items-center gap-1.5 font-semibold text-forest-dark">
                <CheckCircle2 className="h-4 w-4 text-forest" /> Kelebihan lahan untuk tanaman ini
              </p>
              <ul className="list-disc space-y-1.5 pl-5 text-forest-dark/80">
                {alasan.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          )}

          {pembatas.length > 0 && (
            <div className="rounded-2xl bg-[#FFF1DC] p-4 text-sm">
              <p className="mb-2 flex items-center gap-1.5 font-semibold text-forest-dark">
                <AlertTriangle className="h-4 w-4 text-[#C98A1E]" /> Yang perlu diperhatikan
              </p>
              <ul className="list-disc space-y-1.5 pl-5 text-forest-dark/80">
                {pembatas.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          )}

          <EkonomiCard ekonomi={ekonomi} tren={tren} />

          {diLuarRentang && (
            <p className="flex gap-1.5 rounded-xl bg-[#FFF8E8] p-3 text-xs leading-relaxed text-forest-dark">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#C98A1E]" />
              Kondisi lahan ini jarang ada di data model, hasil kurang pasti.
            </p>
          )}

          {(detailKepercayaan || sumberSkor) && (
            <div className="space-y-1 text-center text-[11px] leading-relaxed text-forest-dark/60">
              <p>
                Tingkat keyakinan menunjukkan seberapa stabil skor ini kalau data lahan sedikit berubah.
                {sumberSkor === "ml"
                  ? " Skor kesesuaian sudah dikoreksi oleh model ML."
                  : sumberSkor === "hybrid"
                    ? " Skor kesesuaian gabungan dari syarat tumbuh dan model ML."
                    : sumberSkor === "aturan"
                      ? " Skor kesesuaian dihitung dari syarat tumbuh tanaman."
                      : ""}
              </p>
              {alasanTurun.length > 0 && (
                <p>
                  Keyakinan diturunkan
                  {detailKepercayaan?.tingkat_dasar ? ` dari ${detailKepercayaan.tingkat_dasar.toLowerCase()}` : ""} karena:{" "}
                  {alasanTurun.join("; ")}.
                </p>
              )}
            </div>
          )}
          <button
            onClick={() => setShowFeedback(true)}
            className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-forest py-2.5 text-sm font-semibold text-forest"
          >
            <MessageSquare className="h-4 w-4" /> Apakah rekomendasi ini membantu?
          </button>
        </div>
      </section>

      <TanamSheet open={showTanam} onClose={() => setShowTanam(false)} rekomendasiId={rekId} namaTanaman={detail.nama} />
      <FeedbackForm open={showFeedback} onClose={() => setShowFeedback(false)} jenis="rekomendasi" rekomendasiId={rekId} />
    </div>
  );
}
