"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, CheckCircle2, Loader2, MapPin, RefreshCw, Sprout, Trash2 } from "lucide-react";

import KesehatanBadge from "@/components/KesehatanBadge";
import SectionCard from "@/components/SectionCard";
import Sparkline from "@/components/Sparkline";
import CuacaPrakiraan from "@/components/CuacaPrakiraan";
import FeedbackForm from "@/components/FeedbackForm";
import Modal from "@/components/Modal";
import { deleteLahan, getCropImage, getLahan, getPrakiraan, Lahan, pantauLahan, patchLahan, Prakiraan } from "@/lib/api";
import { getAnonymousId } from "@/lib/anonymousId";
import { hariSejak, tanggal } from "@/lib/format";
import { logEvent } from "@/lib/usability";

function warnaPeringatan(tingkat?: string) {
  const t = (tingkat ?? "").toLowerCase();
  if (/tinggi|bahaya|kritis|berat/.test(t)) return "border-alert/40 bg-[#FBE7E4]";
  if (/rendah|info/.test(t)) return "border-gray-200 bg-gray-50";
  return "border-[#E8A93C] bg-[#FFF8E8]";
}

function LahanContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = Number(params.id);

  const [lahan, setLahan] = useState<Lahan | null | undefined>(undefined);
  const [cuaca, setCuaca] = useState<Prakiraan | null | undefined>(undefined);
  const [memantau, setMemantau] = useState(false);
  const [pesanPantau, setPesanPantau] = useState("");
  const [showPanen, setShowPanen] = useState(false);
  const [showGagal, setShowGagal] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHapus, setShowHapus] = useState(false);
  const baru = searchParams.get("baru") === "1";
  const sudahAda = searchParams.get("sudah_ada") === "1";

  const muat = useCallback(async () => {
    try {
      const l = await getLahan(id, getAnonymousId());
      setLahan(l);
      if (l.cuaca) setCuaca(l.cuaca);
      else if (l.lat != null && l.lon != null) getPrakiraan(l.lat, l.lon).then(setCuaca).catch(() => setCuaca(null));
      else setCuaca(null);
    } catch {
      setLahan(null);
    }
  }, [id]);

  useEffect(() => {
    muat();
    logEvent("lahan_dibuka", { lahan_id: id });
  }, [muat, id]);

  const perbarui = async () => {
    setMemantau(true);
    setPesanPantau("");
    try {
      await pantauLahan(id, getAnonymousId());
      await muat();
      setPesanPantau("Data diperbarui.");
    } catch (e) {
      setPesanPantau(e instanceof Error ? e.message : "Gagal memperbarui.");
    } finally {
      setMemantau(false);
    }
  };

  const ubahStatus = async (status: "panen" | "gagal") => {
    setShowPanen(false);
    setShowGagal(false);
    try {
      const l = await patchLahan(id, getAnonymousId(), { status });
      logEvent("lahan_status_diubah", { lahan_id: id, status });
      setLahan((prev) => (prev ? { ...prev, ...l, cuaca: prev.cuaca } : l));
      setShowFeedback(true);
    } catch (e) {
      setPesanPantau(e instanceof Error ? e.message : "Gagal menyimpan status.");
    }
  };

  const hapus = async () => {
    setShowHapus(false);
    try {
      await deleteLahan(id, getAnonymousId());
      router.push("/riwayat?tab=ditanam");
    } catch {
      setPesanPantau("Gagal menghapus. Coba lagi.");
    }
  };

  if (lahan === undefined)
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-forest-dark/60">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat lahan...
      </div>
    );
  if (lahan === null)
    return (
      <div className="px-5 py-16 text-center text-forest-dark">
        <p className="mb-4">Lahan tidak ditemukan.</p>
        <Link href="/riwayat?tab=ditanam" className="font-semibold text-forest underline">Kembali ke Lahan Saya</Link>
      </div>
    );

  const umur = lahan.hari_setelah_tanam ?? hariSejak(lahan.tanggal_tanam);
  const LABEL_STATUS: Record<string, string> = { panen: "Sudah panen", gagal: "Gagal panen", dihentikan: "Dihentikan" };
  const aktif = lahan.status === "aktif";
  const obs = lahan.observasi;
  const ndviTerakhir = obs.length ? obs[obs.length - 1] : null;

  return (
    <div className="flex min-h-screen flex-col bg-white pb-6">
      <div className="px-4 py-3">
        <Link href="/riwayat?tab=ditanam" className="text-sm text-forest-dark hover:underline">
          ← Lahan Saya
        </Link>
      </div>

      {sudahAda && (
        <div className="mx-4 mb-3 flex gap-2 rounded-xl bg-cream p-3 text-xs text-forest-dark">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-forest" />
          <span>Tanaman ini sudah tercatat sedang ditanam, jadi kami buka pemantauan yang sudah ada.</span>
        </div>
      )}

      {baru && (
        <div className="mx-4 mb-3 flex gap-2 rounded-xl bg-[#EEF5E3] p-3 text-xs text-forest-dark">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-forest" />
          <span>Tersimpan. Data satelit pertama sedang diambil; grafik akan terisi dalam beberapa hari.</span>
        </div>
      )}

      {/* Header */}
      <div className="mx-4 flex gap-3 rounded-2xl bg-forest-dark p-3 text-white">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white/20">
          <Image src={getCropImage(lahan.crop_slug ?? lahan.nama_tanaman)} alt={lahan.nama_tanaman} fill className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-lg font-bold">{lahan.nama_tanaman}</h1>
          {lahan.nama_lokasi && (
            <p className="flex items-center gap-1 truncate text-xs opacity-90">
              <MapPin className="h-3 w-3 shrink-0" /> {lahan.nama_lokasi}
            </p>
          )}
          <p className="mt-1 flex items-center gap-1 text-xs opacity-90">
            <CalendarDays className="h-3 w-3" /> Ditanam {tanggal(lahan.tanggal_tanam)}
            {umur != null && (umur >= 0 ? ` (${umur} hari)` : ` (${-umur} hari lagi)`)}
          </p>
          {!aktif && (
            <span className="mt-1 inline-block rounded-full bg-sand px-2 py-0.5 text-[10px] font-semibold text-forest-dark">
              {LABEL_STATUS[lahan.status] ?? lahan.status}
            </span>
          )}
        </div>
      </div>

      {/* Kesehatan */}
      <SectionCard title="Kondisi Tanaman" className="mx-4 mt-5">
        <div className="mb-3 flex justify-center">
          <KesehatanBadge kesehatan={lahan.kesehatan} />
        </div>

        {lahan.peringatan.length > 0 && (
          <ul className="mb-3 space-y-2">
            {lahan.peringatan.map((p, i) => (
              <li key={i} className={`rounded-xl border p-3 text-xs leading-relaxed text-forest-dark ${warnaPeringatan(p.tingkat)}`}>
                {p.pesan}
              </li>
            ))}
          </ul>
        )}

        {obs.length >= 2 ? (
          <>
            <div className="mb-1 flex items-baseline justify-between text-xs">
              <span className="font-semibold text-forest-dark/70">Kehijauan tanaman (NDVI)</span>
              {ndviTerakhir && <span className="text-forest-dark/60">terakhir {tanggal(ndviTerakhir.tanggal, { day: "numeric", month: "short" })}</span>}
            </div>
            <Sparkline
              data={obs.map((o) => ({ x: o.tanggal, y: o.ndvi }))}
              yMin={0}
              yMax={1}
              warna="#629560"
              formatX={(x) => tanggal(x, { day: "numeric", month: "short" })}
              label="Grafik kehijauan tanaman dari satelit"
              penanda={{ x: lahan.tanggal_tanam, label: "tanam" }}
            />
            <p className="mt-1 text-[11px] leading-relaxed text-forest-dark/60">
              Garis naik berarti tanaman makin hijau dan tumbuh. Titik sebelum garis &quot;tanam&quot; adalah kondisi lahan
              sebelum ditanam, sebagai pembanding. Penurunan tajam bisa berarti kekeringan, hama, atau sudah dipanen.
            </p>
          </>
        ) : (
          <p className="rounded-xl bg-cream p-3 text-xs leading-relaxed text-forest-dark/70">
            {obs.length === 1
              ? `Baru ada 1 data satelit (NDVI ${obs[0].ndvi.toFixed(2)}). Grafik muncul setelah ada 2 data.`
              : "Belum ada data satelit. Satelit melintas tiap beberapa hari dan bisa terhalang awan."}
          </p>
        )}

        {aktif && (
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-[11px] text-forest-dark/60">
              {lahan.terakhir_dipantau ? `Diperbarui ${tanggal(lahan.terakhir_dipantau, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}` : "Diperbarui otomatis setiap hari"}
            </span>
            <button
              onClick={perbarui}
              disabled={memantau}
              className="flex items-center gap-1 rounded-full border border-forest px-3 py-1.5 text-xs font-semibold text-forest disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${memantau ? "animate-spin" : ""}`} />
              {memantau ? "Memperbarui..." : "Perbarui sekarang"}
            </button>
          </div>
        )}
        {pesanPantau && <p className="mt-2 text-xs text-forest-dark/80" role="status">{pesanPantau}</p>}
      </SectionCard>

      {/* Cuaca */}
      {aktif && (
        <SectionCard title="Cuaca 14 Hari ke Depan" className="mx-4 mt-5">
          {cuaca === undefined ? (
            <p className="text-xs text-forest-dark/60">Memuat prakiraan...</p>
          ) : (
            <CuacaPrakiraan data={cuaca} />
          )}
        </SectionCard>
      )}

      {/* Aksi */}
      <section className="mx-4 mt-5 space-y-2">
        {aktif ? (
          <div className="flex gap-2">
            <button
              onClick={() => setShowPanen(true)}
              className="flex flex-[2] items-center justify-center gap-2 rounded-full bg-forest py-3 text-sm font-semibold text-white"
            >
              <Sprout className="h-4 w-4" /> Sudah panen
            </button>
            <button
              onClick={() => setShowGagal(true)}
              className="flex-1 rounded-full border-2 border-alert/60 py-3 text-sm font-semibold text-alert"
            >
              Gagal panen
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowFeedback(true)}
            className="w-full rounded-full bg-forest py-3 text-sm font-semibold text-white"
          >
            Ceritakan hasil panen
          </button>
        )}
        <button
          onClick={() => setShowHapus(true)}
          className="flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-xs font-semibold text-alert"
        >
          <Trash2 className="h-4 w-4" /> Hapus dari pantauan
        </button>
      </section>

      <Modal
        open={showPanen}
        onClose={() => setShowPanen(false)}
        title={`Tandai ${lahan.nama_tanaman} sudah panen?`}
        description="Pemantauan satelit dan cuaca untuk lahan ini akan dihentikan."
        onConfirm={() => ubahStatus("panen")}
      />
      <Modal
        open={showGagal}
        onClose={() => setShowGagal(false)}
        title={`Tandai ${lahan.nama_tanaman} gagal panen?`}
        description="Pemantauan dihentikan. Setelah ini Anda bisa bercerita apa yang terjadi, supaya rekomendasi berikutnya lebih baik."
        onConfirm={() => ubahStatus("gagal")}
      />
      <Modal
        open={showHapus}
        onClose={() => setShowHapus(false)}
        title="Hapus lahan ini dari pantauan?"
        description="Riwayat analisisnya tetap ada."
        onConfirm={hapus}
      />
      <FeedbackForm
        open={showFeedback}
        onClose={() => setShowFeedback(false)}
        jenis="hasil_panen"
        lahanId={lahan.id}
        rekomendasiId={lahan.rekomendasi_id ?? undefined}
        luasM2={lahan.luas_lahan_m2}
        hasilAwal={lahan.status === "gagal" ? "gagal" : undefined}
      />
    </div>
  );
}

export default function LahanDetailPage() {
  return (
    <Suspense fallback={null}>
      <LahanContent />
    </Suspense>
  );
}
