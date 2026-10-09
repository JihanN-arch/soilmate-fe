"use client";

import { ChevronDown, FlaskConical } from "lucide-react";
import { METODE_UJI, TEKSTUR_OPTIONS } from "@/lib/labels";
import type { UjiTanahPayload } from "@/lib/api";

export type UjiTanahState = {
  ph: string;
  tekstur_kelas: string;
  pakaiPersen: boolean;
  sand: string;
  silt: string;
  clay: string;
  c_organik_persen: string;
  metode: string;
  tanggal_uji: string;
};

export const UJI_TANAH_KOSONG: UjiTanahState = {
  ph: "",
  tekstur_kelas: "",
  pakaiPersen: false,
  sand: "",
  silt: "",
  clay: "",
  c_organik_persen: "",
  metode: "",
  tanggal_uji: "",
};

const num = (s: string) => (s.trim() === "" ? null : Number(s.replace(",", ".")));

export function ujiTanahTerisi(s: UjiTanahState): boolean {
  return Boolean(
    s.ph.trim() ||
      s.tekstur_kelas ||
      (s.pakaiPersen && (s.sand || s.silt || s.clay)) ||
      s.c_organik_persen.trim()
  );
}

// Kembalikan pesan error, atau null kalau valid.
export function validasiUjiTanah(s: UjiTanahState): string | null {
  if (!ujiTanahTerisi(s)) return null;
  const ph = num(s.ph);
  if (ph !== null && (Number.isNaN(ph) || ph < 3 || ph > 10)) return "pH tanah harus angka antara 3 dan 10.";

  if (s.pakaiPersen) {
    const vals = [num(s.sand), num(s.silt), num(s.clay)];
    const terisi = vals.filter((v) => v !== null);
    if (terisi.length > 0 && terisi.length < 3) return "Isi ketiga persen: pasir, debu, dan liat.";
    if (terisi.length === 3) {
      if (vals.some((v) => Number.isNaN(v) || (v as number) < 0)) return "Persen pasir/debu/liat harus angka.";
      const total = (vals as number[]).reduce((a, b) => a + b, 0);
      if (Math.abs(total - 100) > 2) return `Jumlah pasir + debu + liat harus 100% (sekarang ${total}%).`;
    }
  }

  const tekstur = s.pakaiPersen ? num(s.sand) !== null : Boolean(s.tekstur_kelas);
  if (ph === null && !tekstur) return "Isi minimal pH atau tekstur tanah.";

  const c = num(s.c_organik_persen);
  if (c !== null && (Number.isNaN(c) || c < 0 || c > 60)) return "C-organik harus angka persen (0–60).";
  return null;
}

export function ujiTanahKePayload(s: UjiTanahState): UjiTanahPayload | undefined {
  if (!ujiTanahTerisi(s)) return undefined;
  const p: UjiTanahPayload = {};
  if (s.ph.trim()) p.ph = num(s.ph);
  if (s.pakaiPersen) {
    if (s.sand && s.silt && s.clay) {
      p.sand = num(s.sand);
      p.silt = num(s.silt);
      p.clay = num(s.clay);
    }
  } else if (s.tekstur_kelas) {
    p.tekstur_kelas = s.tekstur_kelas;
  }
  if (s.c_organik_persen.trim()) p.c_organik_persen = num(s.c_organik_persen);
  if (s.metode) p.metode = s.metode;
  if (s.tanggal_uji) p.tanggal_uji = s.tanggal_uji;
  return p;
}

type Props = {
  open: boolean;
  onToggle: () => void;
  value: UjiTanahState;
  onChange: (v: UjiTanahState) => void;
  butuhInput?: string[]; // dari 422 perlu_input: field disorot
};

const inputCls =
  "w-full rounded-lg border px-3 py-2 text-sm text-forest-dark outline-none focus:border-forest";

export default function UjiTanahForm({ open, onToggle, value, onChange, butuhInput = [] }: Props) {
  const set = (patch: Partial<UjiTanahState>) => onChange({ ...value, ...patch });
  const sorot = (f: string) => butuhInput.includes(f);
  const terisi = ujiTanahTerisi(value);
  const teksturTerpilih = TEKSTUR_OPTIONS.find((o) => o.value === value.tekstur_kelas);

  return (
    <div
      className={`rounded-2xl border-2 ${
        butuhInput.length ? "border-[#E8A93C] bg-[#FFF8E8]" : "border-forest/30 bg-cream-light"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <FlaskConical className="h-5 w-5 shrink-0 text-forest" />
        <span className="flex-1">
          <span className="block text-sm font-bold text-forest-dark">
            Punya hasil uji tanah?{" "}
            <span className="font-normal text-forest-dark/60">(opsional)</span>
          </span>
          <span className="block text-xs text-forest-dark/60">
            {terisi ? "Sudah diisi. Hasil akan lebih akurat." : "Hasil lebih akurat kalau diisi."}
          </span>
        </span>
        <ChevronDown className={`h-5 w-5 text-forest-dark/60 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="space-y-4 border-t border-forest/15 px-4 pb-4 pt-3">
          <p className="text-xs leading-relaxed text-forest-dark/70">
            Isi minimal <b>pH</b> atau <b>tekstur tanah</b>. Kalau keduanya diisi, sistem memakai data Anda
            dan tidak memakai perkiraan satelit.
          </p>

          <div>
            <label htmlFor="ut-ph" className="mb-1 block text-xs font-bold text-forest-dark">
              pH tanah {sorot("ph") && <span className="text-alert">• dibutuhkan</span>}
            </label>
            <input
              id="ut-ph"
              type="text"
              inputMode="decimal"
              placeholder="Contoh: 5,8"
              value={value.ph}
              onChange={(e) => set({ ph: e.target.value })}
              className={`${inputCls} ${sorot("ph") && !value.ph ? "border-[#E8A93C]" : "border-gray-300"}`}
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="ut-tekstur" className="block text-xs font-bold text-forest-dark">
                Tekstur tanah {sorot("tekstur_kelas") && <span className="text-alert">• dibutuhkan</span>}
              </label>
              <button
                type="button"
                onClick={() => set({ pakaiPersen: !value.pakaiPersen })}
                className="text-xs font-semibold text-forest underline-offset-2 hover:underline"
              >
                {value.pakaiPersen ? "Pilih nama tekstur" : "Saya punya angka persen"}
              </button>
            </div>

            {!value.pakaiPersen ? (
              <>
                <select
                  id="ut-tekstur"
                  value={value.tekstur_kelas}
                  onChange={(e) => set({ tekstur_kelas: e.target.value })}
                  className={`${inputCls} ${
                    sorot("tekstur_kelas") && !value.tekstur_kelas ? "border-[#E8A93C]" : "border-gray-300"
                  }`}
                >
                  <option value="">Tidak tahu / lewati</option>
                  {TEKSTUR_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {teksturTerpilih && (
                  <p className="mt-1 text-xs text-forest-dark/60">Ciri: {teksturTerpilih.hint}</p>
                )}
              </>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {([
                  ["sand", "Pasir %"],
                  ["silt", "Debu %"],
                  ["clay", "Liat %"],
                ] as const).map(([k, label]) => (
                  <label key={k} className="text-xs text-forest-dark/70">
                    {label}
                    <input
                      type="text"
                      inputMode="decimal"
                      value={value[k]}
                      onChange={(e) => set({ [k]: e.target.value } as Partial<UjiTanahState>)}
                      className={`${inputCls} mt-1 border-gray-300`}
                    />
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="ut-corg" className="mb-1 block text-xs font-bold text-forest-dark">
              C-organik (%)
            </label>
            <input
              id="ut-corg"
              type="text"
              inputMode="decimal"
              placeholder="Contoh: 1,4"
              value={value.c_organik_persen}
              onChange={(e) => set({ c_organik_persen: e.target.value })}
              className={`${inputCls} border-gray-300`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ut-metode" className="mb-1 block text-xs font-bold text-forest-dark">
                Cara uji
              </label>
              <select
                id="ut-metode"
                value={value.metode}
                onChange={(e) => set({ metode: e.target.value })}
                className={`${inputCls} border-gray-300`}
              >
                <option value="">Pilih</option>
                {METODE_UJI.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ut-tgl" className="mb-1 block text-xs font-bold text-forest-dark">
                Tanggal uji
              </label>
              <input
                id="ut-tgl"
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                value={value.tanggal_uji}
                onChange={(e) => set({ tanggal_uji: e.target.value })}
                className={`${inputCls} border-gray-300`}
              />
            </div>
          </div>

          {terisi && (
            <button
              type="button"
              onClick={() => onChange(UJI_TANAH_KOSONG)}
              className="text-xs font-semibold text-alert underline-offset-2 hover:underline"
            >
              Hapus data uji tanah
            </button>
          )}
        </div>
      )}
    </div>
  );
}
