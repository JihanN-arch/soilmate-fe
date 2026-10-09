"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Star } from "lucide-react";
import BottomSheet from "@/components/BottomSheet";
import { FeedbackPayload, postFeedback } from "@/lib/api";
import { getAnonymousId } from "@/lib/anonymousId";
import { logEvent } from "@/lib/usability";

type Jenis = FeedbackPayload["jenis"];

const JUDUL: Record<Jenis, string> = {
  rekomendasi: "Apakah rekomendasi ini membantu?",
  hasil_panen: "Bagaimana hasil panennya?",
  aplikasi: "Beri masukan untuk Soilmate",
};

const PILIHAN_HASIL: { value: NonNullable<FeedbackPayload["hasil"]>; label: string }[] = [
  { value: "baik", label: "Baik" },
  { value: "sedang", label: "Sedang" },
  { value: "buruk", label: "Kurang" },
  { value: "gagal", label: "Gagal panen" },
];

type Props = {
  open: boolean;
  onClose: () => void;
  jenis: Jenis;
  rekomendasiId?: number;
  lahanId?: number;
  luasM2?: number | null;
  hasilAwal?: FeedbackPayload["hasil"];
  onTerkirim?: () => void;
};

export default function FeedbackForm({ open, onClose, jenis, rekomendasiId, lahanId, luasM2, hasilAwal, onTerkirim }: Props) {
  const [rating, setRating] = useState(0);
  const [hasil, setHasil] = useState<FeedbackPayload["hasil"]>();
  const [kg, setKg] = useState("");
  const [luas, setLuas] = useState(luasM2 ? String(Math.round(luasM2)) : "");
  const [komentar, setKomentar] = useState("");
  const [kirim, setKirim] = useState<"idle" | "loading" | "ok">("idle");
  const [err, setErr] = useState("");

  // isi awal saat dibuka (misalnya "gagal" setelah lahan ditandai gagal panen)
  useEffect(() => {
    if (!open) return;
    if (hasilAwal) setHasil(hasilAwal);
    if (luasM2 && !luas) setLuas(String(Math.round(luasM2)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const tutup = () => {
    onClose();
    // reset setelah animasi tutup
    setTimeout(() => {
      setKirim("idle");
      setErr("");
    }, 200);
  };

  const submit = async () => {
    if (jenis === "hasil_panen" && !hasil) {
      setErr("Pilih bagaimana hasil panennya.");
      return;
    }
    if (jenis !== "hasil_panen" && rating === 0) {
      setErr("Pilih jumlah bintang dulu.");
      return;
    }
    const body: FeedbackPayload = { anonymous_id: getAnonymousId(), jenis };
    if (rekomendasiId) body.rekomendasi_id = rekomendasiId;
    if (lahanId) body.lahan_id = lahanId;
    if (rating) body.rating = rating;
    if (komentar.trim()) body.komentar = komentar.trim();
    if (jenis === "hasil_panen") {
      body.ditanam = true;
      body.hasil = hasil;
      const k = Number(kg.replace(",", "."));
      if (kg && k >= 0) body.hasil_panen_kg = k;
      const l = Number(luas.replace(",", "."));
      if (luas && l > 0) body.luas_lahan_m2 = l;
    }

    setKirim("loading");
    setErr("");
    try {
      await postFeedback(body);
      logEvent("feedback_dikirim", { jenis, rating: rating || null });
      setKirim("ok");
      onTerkirim?.();
    } catch (e) {
      setKirim("idle");
      setErr(e instanceof Error ? e.message : "Gagal mengirim. Coba lagi.");
    }
  };

  return (
    <BottomSheet open={open} onClose={tutup} title={JUDUL[jenis]}>
      {kirim === "ok" ? (
        <div className="py-6 text-center">
          <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-forest" />
          <p className="font-semibold text-forest-dark">Terima kasih, masukan Anda terkirim.</p>
          <p className="mt-1 text-xs text-forest-dark/70">Masukan ini dipakai untuk memperbaiki rekomendasi.</p>
          <button onClick={tutup} className="mt-5 rounded-full bg-forest px-8 py-2.5 text-sm font-semibold text-white">
            Tutup
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {jenis === "hasil_panen" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                {PILIHAN_HASIL.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setHasil(p.value)}
                    aria-pressed={hasil === p.value}
                    className={`rounded-xl border py-3 text-sm font-semibold ${
                      hasil === p.value ? "border-forest-dark bg-forest-dark text-white" : "border-gray-300 text-forest-dark"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-bold text-forest-dark">
                  Hasil panen (kg) <span className="font-normal text-forest-dark/60">opsional</span>
                  <input
                    inputMode="decimal"
                    value={kg}
                    onChange={(e) => setKg(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal outline-none focus:border-forest"
                  />
                </label>
                <label className="text-xs font-bold text-forest-dark">
                  Luas lahan (m²) <span className="font-normal text-forest-dark/60">opsional</span>
                  <input
                    inputMode="decimal"
                    value={luas}
                    onChange={(e) => setLuas(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal outline-none focus:border-forest"
                  />
                </label>
              </div>
            </>
          )}

          <div>
            <p className="mb-2 text-xs font-bold text-forest-dark">
              {jenis === "hasil_panen" ? "Seberapa tepat rekomendasi Soilmate?" : "Beri bintang"}
              {jenis === "hasil_panen" && <span className="font-normal text-forest-dark/60"> opsional</span>}
            </p>
            <div className="flex justify-center gap-2" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((v) => (
                <button key={v} role="radio" aria-checked={rating === v} aria-label={`${v} bintang`} onClick={() => setRating(v)}>
                  <Star className={`h-9 w-9 ${v <= rating ? "fill-[#E8A93C] text-[#E8A93C]" : "text-gray-300"}`} />
                </button>
              ))}
            </div>
          </div>

          <label className="block text-xs font-bold text-forest-dark">
            Cerita atau saran <span className="font-normal text-forest-dark/60">opsional</span>
            <textarea
              rows={3}
              value={komentar}
              onChange={(e) => setKomentar(e.target.value)}
              placeholder={jenis === "aplikasi" ? "Bagian mana yang membingungkan?" : "Tulis di sini"}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal outline-none focus:border-forest"
            />
          </label>

          {err && <p role="alert" className="text-sm font-semibold text-alert">{err}</p>}

          <button
            onClick={submit}
            disabled={kirim === "loading"}
            className="w-full rounded-full bg-forest py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {kirim === "loading" ? "Mengirim..." : "Kirim masukan"}
          </button>
        </div>
      )}
    </BottomSheet>
  );
}
