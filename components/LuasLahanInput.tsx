"use client";

import { DEFAULT_M2_PER_BATA, formatM2, keM2, SATUAN_LUAS, SatuanLuas } from "@/lib/luas";

type Props = {
  nilai: string;
  satuan: SatuanLuas;
  m2PerBata: string;
  onChange: (next: { nilai: string; satuan: SatuanLuas; m2PerBata: string }) => void;
};

export default function LuasLahanInput({ nilai, satuan, m2PerBata, onChange }: Props) {
  const angka = Number(nilai.replace(",", "."));
  const perBata = Number(m2PerBata.replace(",", ".")) || DEFAULT_M2_PER_BATA;
  const m2 = nilai && angka > 0 ? keM2(angka, satuan, perBata) : null;

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="decimal"
          placeholder="Contoh: 2500"
          value={nilai}
          onChange={(e) => onChange({ nilai: e.target.value, satuan, m2PerBata })}
          className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-forest-dark outline-none focus:border-forest"
          aria-label="Luas lahan"
        />
        <select
          value={satuan}
          onChange={(e) => onChange({ nilai, satuan: e.target.value as SatuanLuas, m2PerBata })}
          className="w-32 rounded-lg border border-gray-300 px-2 py-2 text-sm text-forest-dark outline-none focus:border-forest"
          aria-label="Satuan luas"
        >
          {SATUAN_LUAS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {satuan === "bata" && (
        <label className="mt-2 flex items-center gap-2 text-xs text-forest-dark/70">
          1 bata/tumbak di daerah saya =
          <input
            type="text"
            inputMode="decimal"
            value={m2PerBata}
            onChange={(e) => onChange({ nilai, satuan, m2PerBata: e.target.value })}
            className="w-16 rounded-md border border-gray-300 px-2 py-1 text-center text-sm text-forest-dark outline-none focus:border-forest"
          />
          m²
        </label>
      )}

      {m2 !== null && satuan !== "m2" && (
        <p className="mt-1 text-xs text-forest-dark/60">
          = {Math.round(m2).toLocaleString("id-ID")} m²{satuan === "bata" && m2 >= 10000 ? ` (${formatM2(m2)})` : ""}
        </p>
      )}
    </div>
  );
}
