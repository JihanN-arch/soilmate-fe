"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Satellite } from "lucide-react";
import BottomSheet from "@/components/BottomSheet";
import { ApiError, postLahan } from "@/lib/api";
import { getAnonymousId } from "@/lib/anonymousId";
import { hariIniISO } from "@/lib/format";
import { logEvent } from "@/lib/usability";

export default function TanamSheet({
  open,
  onClose,
  rekomendasiId,
  namaTanaman,
}: {
  open: boolean;
  onClose: () => void;
  rekomendasiId: number;
  namaTanaman: string;
}) {
  const router = useRouter();
  const [tgl, setTgl] = useState(hariIniISO());
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const simpan = async () => {
    if (!tgl) {
      setErr("Pilih tanggal tanam.");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      const lahan = await postLahan({
        anonymous_id: getAnonymousId(),
        rekomendasi_id: rekomendasiId,
        tanggal_tanam: tgl,
      });
      logEvent("tanam_disimpan", {
        rekomendasi_id: rekomendasiId,
        lahan_id: lahan.id,
      });
      router.push(`/lahan/${lahan.id}?baru=1`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 409 && e.body?.lahan_id) {
        logEvent("tanam_sudah_ada", {
          rekomendasi_id: rekomendasiId,
          lahan_id: e.body.lahan_id,
        });
        router.push(`/lahan/${e.body.lahan_id}?sudah_ada=1`);
        return;
      }
      setErr(e instanceof Error ? e.message : "Gagal menyimpan. Coba lagi.");
      setLoading(false);
    }
  };

  // batas: 1 tahun ke belakang sampai 3 bulan ke depan
  const maxD = new Date();
  maxD.setMonth(maxD.getMonth() + 3);
  const minD = new Date();
  minD.setFullYear(minD.getFullYear() - 1);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={`Saya menanam ${namaTanaman}`}
    >
      <div className="space-y-4">
        <div className="flex gap-3 rounded-xl bg-cream p-3 text-xs leading-relaxed text-forest-dark/80">
          <Satellite className="h-5 w-5 shrink-0 text-forest" />
          <p>
            Setelah disimpan, Soilmate memantau kehijauan tanaman lewat satelit
            dan prakiraan cuaca di lahan ini. Anda bisa membukanya kapan saja di
            menu <b>Lahan Saya</b>.
          </p>
        </div>

        <label className="block text-xs font-bold text-forest-dark">
          Tanggal tanam
          <input
            type="date"
            value={tgl}
            min={minD.toISOString().slice(0, 10)}
            max={maxD.toISOString().slice(0, 10)}
            onChange={(e) => setTgl(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal outline-none focus:border-forest"
          />
          <span className="mt-1 block font-normal text-forest-dark/60">
            Belum menanam? Pilih tanggal rencana tanam.
          </span>
        </label>

        {err && (
          <p role="alert" className="text-sm font-semibold text-alert">
            {err}
          </p>
        )}

        <button
          onClick={simpan}
          disabled={loading}
          className="w-full rounded-full bg-[#567156] py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : "Simpan dan mulai pantau"}
        </button>
      </div>
    </BottomSheet>
  );
}
