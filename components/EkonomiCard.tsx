"use client";

import { AlertTriangle, Info } from "lucide-react";
import Sparkline from "@/components/Sparkline";
import SectionCard from "@/components/SectionCard";
import type { AngkaAtauRentang, Ekonomi, TitikHarga } from "@/lib/api";
import { rupiah, rupiahRingkas, tanggal } from "@/lib/format";

type Nilai = { min: number; max: number } | null;
export type StatusEkonomi = "lengkap" | "pendapatan_saja" | "belum_tersedia";

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

// Status dari BE; cadangan untuk data lama yang hanya punya `tersedia`
export function statusEkonomi(e?: Ekonomi | null): StatusEkonomi {
  const s = e?.status;
  if (s === "lengkap" || s === "pendapatan_saja" || s === "belum_tersedia") return s;
  if (!e?.tersedia) return "belum_tersedia";
  return rentang(e.estimasi_keuntungan_per_ha) ? "lengkap" : "pendapatan_saja";
}

// Pakai versi _lahan kalau ada (pengguna mengisi luas), kalau tidak pakai _per_ha
function pilih(e: Ekonomi, dasar: "pendapatan" | "biaya" | "keuntungan") {
  const lahan = rentang(e[`estimasi_${dasar}_lahan`] as AngkaAtauRentang);
  if (lahan) return { nilai: lahan, untukLahan: true };
  return { nilai: rentang(e[`estimasi_${dasar}_per_ha`] as AngkaAtauRentang), untukLahan: false };
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

const bulanTahun = (iso?: string | null) => (iso ? tanggal(iso, { month: "long", year: "numeric" }) : null);

export default function EkonomiCard({ ekonomi, tren = [] }: { ekonomi?: Ekonomi | null; tren?: TitikHarga[] }) {
  const e = ekonomi ?? ({ tersedia: false } as Ekonomi);
  const status = statusEkonomi(ekonomi);

  const harga = typeof e.harga_per_kg === "number" ? e.harga_per_kg : null;
  const pendapatan = pilih(e, "pendapatan");
  const biaya = pilih(e, "biaya");
  const keuntungan = pilih(e, "keuntungan");
  const untukLahan = pendapatan.untukLahan || keuntungan.untukLahan;
  const luasM2 = typeof e.luas_lahan_m2 === "number" ? e.luas_lahan_m2 : null;
  const judulPeriode = untukLahan
    ? `Untuk lahan Anda${luasM2 ? ` (${Math.round(luasM2).toLocaleString("id-ID")} m²)` : ""}, per musim`
    : "Per hektar, per musim";

  const wilayah = typeof e.wilayah_harga === "string" ? e.wilayah_harga : null;
  const tglHarga = bulanTahun(e.tanggal_harga);
  const catatan = Array.isArray(e.catatan) ? e.catatan : typeof e.catatan === "string" ? [e.catatan] : [];

  return (
    <SectionCard title="Perkiraan Ekonomi">
      {status === "belum_tersedia" ? (
        <div className="rounded-xl bg-cream p-4 text-center">
          <p className="text-sm font-semibold text-forest-dark">Data harga belum tersedia</p>
          <p className="mt-1 text-xs leading-relaxed text-forest-dark/70">
            Harga dan biaya produksi tanaman ini belum ada di sumber data resmi, jadi kami tidak menampilkan angka.
          </p>
        </div>
      ) : (
        <>
          {/* Harga */}
          {harga !== null && (
            <div className="mb-3 rounded-xl bg-cream p-3">
              <p className="text-[11px] text-forest-dark/70">Harga di petani</p>
              <p className="font-display text-lg font-bold text-forest-dark">{rupiah(harga)}/kg</p>
              {(tglHarga || wilayah) && (
                <p className="text-[11px] text-forest-dark/60">{[tglHarga, wilayah].filter(Boolean).join(" · ")}</p>
              )}
            </div>
          )}

          {status === "lengkap" ? (
            <div className="mb-3">
              <p className="text-xs font-semibold text-forest-dark/60">{judulPeriode}</p>
              <Baris label="Pendapatan" nilai={pendapatan.nilai} />
              <Baris label="Biaya produksi" nilai={biaya.nilai} biaya />
              <Baris label="Perkiraan keuntungan" nilai={keuntungan.nilai} tebal />
            </div>
          ) : (
            /* pendapatan_saja: jangan sampai terbaca sebagai keuntungan */
            <div className="mb-3 rounded-xl border-2 border-[#E8A93C] bg-[#FFF8E8] p-3">
              <p className="text-xs font-semibold text-forest-dark/70">{judulPeriode}</p>
              <div className="mt-1 flex items-baseline justify-between gap-3 text-sm">
                <span className="shrink-0 font-semibold text-forest-dark">Pendapatan kotor</span>
                <span className="text-right font-bold text-forest-dark">{fmtRp(pendapatan.nilai)}</span>
              </div>
              <p className="mt-2 flex gap-1.5 text-xs font-semibold leading-relaxed text-[#8A5A00]">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                Pendapatan kotor, belum dikurangi biaya produksi. Ini bukan keuntungan; biaya bibit, pupuk, obat,
                dan tenaga kerja belum dihitung.
              </p>
            </div>
          )}

          {!untukLahan && !luasM2 && (
            <p className="mb-3 text-xs text-forest-dark/60">Isi luas lahan di form analisis untuk melihat perkiraan lahan Anda.</p>
          )}

          {/* Tren harga: grafik hanya kalau ada minimal 2 titik */}
          {tren.length >= 2 && (
            <div className="mb-2">
              <p className="mb-1 text-xs font-semibold text-forest-dark/70">Harga nasional per bulan</p>
              <Sparkline
                data={tren.map((t) => ({ x: t.tanggal, y: t.harga }))}
                formatY={(v) => rupiahRingkas(v)}
                formatX={(x) => tanggal(x, { month: "short", year: "2-digit" })}
                label="Grafik tren harga nasional per bulan"
              />
            </div>
          )}
        </>
      )}

      {/* Sumber & catatan */}
      <div className="mt-3 flex gap-1.5 border-t border-gray-100 pt-3 text-[11px] leading-relaxed text-forest-dark/60">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <div className="space-y-1">
          {status !== "belum_tersedia" && (e.sumber_harga || harga !== null) && (
            <p>
              Harga{harga !== null ? ` ${rupiah(harga)}/kg` : ""}
              {tglHarga ? `, ${tglHarga}` : ""}
              {wilayah ? `, ${wilayah}` : ""}
              {e.sumber_harga ? `. Sumber: ${e.sumber_harga}` : ""}.
            </p>
          )}
          {catatan.length > 0 ? (
            catatan.map((c, i) => <p key={i}>{c}</p>)
          ) : (
            <p>Perkiraan kasar, bukan jaminan hasil. Harga saat panen bisa berbeda.</p>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

// Chip di kartu hasil: HANYA untuk status "lengkap" (keuntungan bersih).
// Pendapatan kotor sengaja tidak ditampilkan di chip supaya tidak terbaca sebagai untung.
export function ringkasKeuntungan(e?: Ekonomi | null): string | null {
  if (!e || statusEkonomi(e) !== "lengkap") return null;
  // chip pakai per ha supaya bisa dibandingkan antar tanaman
  const perHa = rentang(e.estimasi_keuntungan_per_ha);
  return perHa ? fmtRp(perHa, true) : null;
}
