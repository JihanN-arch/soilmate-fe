"use client";

import { Info } from "lucide-react";
import Sparkline from "@/components/Sparkline";
import SectionCard from "@/components/SectionCard";
import type { AngkaAtauRentang, Ekonomi, TitikHarga } from "@/lib/api";
import { rupiah, rupiahRingkas, tanggal } from "@/lib/format";

type Nilai = { min: number; max: number } | null;

// BE mengirim angka tunggal atau rentang {min, max}; samakan jadi rentang
function rentang(v: AngkaAtauRentang | undefined): Nilai {
  if (typeof v === "number" && Number.isFinite(v)) return { min: v, max: v };
  if (v && typeof v === "object" && Number.isFinite(v.min) && Number.isFinite(v.max)) return v;
  return null;
}

function fmtRp(v: Nilai, ringkas = false): string {
  if (!v) return "-";
  const f = ringkas ? rupiahRingkas : rupiah;
  return v.min === v.max ? f(v.min) : `${f(v.min)} – ${f(v.max)}`;
}

function Baris({ label, nilai, tebal, biaya }: { label: string; nilai: Nilai; tebal?: boolean; biaya?: boolean }) {
  if (!nilai) return null;
  const negatif = nilai.max < 0;
  const sebagianRugi = nilai.min < 0 && nilai.max >= 0;
  return (
    <div className={`flex items-baseline justify-between gap-3 py-1.5 text-sm ${tebal ? "border-t border-forest/15 pt-2 font-bold" : ""}`}>
      <span className="shrink-0 text-forest-dark/80">{label}</span>
      <span className={`text-right ${tebal && negatif ? "text-alert" : "text-forest-dark"}`}>
        {biaya ? "−" : ""}
        {fmtRp(nilai)}
        {tebal && sebagianRugi && <span className="block text-[10px] font-normal text-[#8A5A00]">bisa rugi kalau panen rendah</span>}
      </span>
    </div>
  );
}

export default function EkonomiCard({ ekonomi, tren = [] }: { ekonomi?: Ekonomi | null; tren?: TitikHarga[] }) {
  const e = ekonomi ?? ({ tersedia: false } as Ekonomi);
  const tersedia = Boolean(e.tersedia);

  const harga = typeof e.harga_per_kg === "number" ? e.harga_per_kg : typeof e.harga_produsen_per_kg === "number" ? e.harga_produsen_per_kg : null;
  const prodTon = rentang(e.produktivitas_ton_ha) ?? (() => {
    const kg = rentang(e.produktivitas_kg_ha);
    return kg ? { min: kg.min / 1000, max: kg.max / 1000 } : null;
  })();
  const pendapatanHa = rentang(e.estimasi_pendapatan_per_ha);
  const biayaHa = rentang(e.estimasi_biaya_per_ha ?? e.biaya_produksi_per_ha);
  const untungHa = rentang(e.estimasi_keuntungan_per_ha);
  const pendapatanLahan = rentang(e.estimasi_pendapatan_lahan);
  const biayaLahan = rentang(e.estimasi_biaya_lahan);
  const untungLahan = rentang(e.estimasi_keuntungan_lahan);
  const adaLahan = Boolean(pendapatanLahan || biayaLahan || untungLahan);
  const luasM2 = typeof e.luas_lahan_m2 === "number" ? e.luas_lahan_m2 : null;
  const perubahan30 = typeof e.perubahan_harga_30_hari_persen === "number" ? e.perubahan_harga_30_hari_persen : null;
  const catatan = Array.isArray(e.catatan) ? e.catatan : typeof e.catatan === "string" ? [e.catatan] : [];

  const fmtTon = (v: Nilai) =>
    !v ? "-" : v.min === v.max
      ? `${v.min.toLocaleString("id-ID", { maximumFractionDigits: 1 })} ton/ha`
      : `${v.min.toLocaleString("id-ID", { maximumFractionDigits: 1 })}–${v.max.toLocaleString("id-ID", { maximumFractionDigits: 1 })} ton/ha`;

  return (
    <SectionCard title="Perkiraan Ekonomi">

      {(harga !== null || prodTon) && (
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-cream p-3">
            <p className="text-[11px] text-forest-dark/70">Harga di petani</p>
            <p className="font-display text-base font-bold text-forest-dark">{harga !== null ? `${rupiah(harga)}/kg` : "Belum tersedia"}</p>
            {perubahan30 !== null && (
              <p className={`text-[11px] font-semibold ${perubahan30 >= 0 ? "text-forest" : "text-alert"}`}>
                {perubahan30 >= 0 ? "Naik" : "Turun"} {Math.abs(perubahan30).toFixed(0)}% dalam 30 hari
              </p>
            )}
          </div>
          <div className="rounded-xl bg-cream p-3">
            <p className="text-[11px] text-forest-dark/70">Hasil panen rata-rata</p>
            <p className="font-display text-base font-bold text-forest-dark">{fmtTon(prodTon)}</p>
          </div>
        </div>
      )}

      {!tersedia ? (
        <div className="rounded-xl bg-cream p-4 text-center">
          <p className="text-sm font-semibold text-forest-dark">Perkiraan keuntungan belum tersedia</p>
          <p className="mt-1 text-xs leading-relaxed text-forest-dark/70">
            Harga atau biaya produksi tanaman ini belum masuk ke sistem. Kami tidak menampilkan angka sebelum datanya ada.
          </p>
        </div>
      ) : (
        <>
          {(pendapatanHa || untungHa) && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-forest-dark/60">Per hektar, per musim</p>
              <Baris label="Pendapatan" nilai={pendapatanHa} />
              <Baris label="Biaya produksi" nilai={biayaHa} biaya />
              <Baris label="Keuntungan" nilai={untungHa} tebal />
            </div>
          )}

          {adaLahan ? (
            <div className="mb-3 rounded-xl bg-[#EEF5E3] p-3">
              <p className="text-xs font-semibold text-forest-dark/70">
                Untuk lahan Anda{luasM2 ? ` (${Math.round(luasM2).toLocaleString("id-ID")} m²)` : ""}
              </p>
              <Baris label="Pendapatan" nilai={pendapatanLahan} />
              <Baris label="Biaya produksi" nilai={biayaLahan} biaya />
              <Baris label="Keuntungan" nilai={untungLahan} tebal />
            </div>
          ) : (
            untungHa && !luasM2 && (
              <p className="mb-3 text-xs text-forest-dark/60">Isi luas lahan di form analisis untuk melihat perkiraan lahan Anda.</p>
            )
          )}
        </>
      )}

      {tren.length >= 2 && (
        <div className="mb-2 mt-3">
          <p className="mb-1 text-xs font-semibold text-forest-dark/70">Harga 6 bulan terakhir</p>
          <Sparkline
            data={tren.map((t) => ({ x: t.tanggal, y: t.harga }))}
            formatY={(v) => rupiahRingkas(v)}
            formatX={(x) => tanggal(x, { month: "short", year: "2-digit" })}
            label="Grafik tren harga 6 bulan"
          />
        </div>
      )}

      <p className="mt-2 flex gap-1.5 text-[11px] leading-relaxed text-forest-dark/60">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          {catatan.length ? catatan.join(" ") : "Perkiraan kasar, bukan jaminan hasil. Harga saat panen bisa berbeda."}
          {e.sumber_harga && <> Harga: {e.sumber_harga}{e.tanggal_harga ? `, ${tanggal(e.tanggal_harga)}` : ""}.</>}
          {e.sumber_biaya && <> Biaya: {e.sumber_biaya}.</>}
        </span>
      </p>
    </SectionCard>
  );
}

// Dipakai chip di kartu hasil: "±Rp 8–12 jt/ha"
export function ringkasKeuntungan(e?: Ekonomi | null): string | null {
  if (!e?.tersedia) return null;
  const v = rentang(e.estimasi_keuntungan_per_ha);
  return v ? fmtRp(v, true) : null;
}
