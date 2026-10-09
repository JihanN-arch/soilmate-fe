"use client";

import { BULAN, BULAN_PENDEK } from "@/lib/labels";

type Props = {
  value: number | null; // 1-12
  onChange: (bulan: number | null) => void;
};

export default function BulanTanamPicker({ value, onChange }: Props) {
  const bulanIni = new Date().getMonth() + 1;

  return (
    <div>
      <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Bulan tanam">
        {BULAN_PENDEK.map((b, i) => {
          const n = i + 1;
          const aktif = value === n;
          return (
            <button
              key={b}
              type="button"
              role="radio"
              aria-checked={aktif}
              aria-label={BULAN[i]}
              onClick={() => onChange(aktif ? null : n)}
              className={`relative rounded-lg border py-2 text-sm font-semibold transition-colors ${
                aktif
                  ? "border-forest bg-forest text-white"
                  : "border-gray-300 bg-white text-forest-dark hover:border-forest"
              }`}
            >
              {b}
              {n === bulanIni && !aktif && (
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-moss" aria-hidden />
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-forest-dark/60">
        <span>
          {value ? `Dipilih: ${BULAN[value - 1]}` : "Belum dipilih. Boleh dikosongkan."}
        </span>
        {value !== bulanIni && (
          <button
            type="button"
            onClick={() => onChange(bulanIni)}
            className="font-semibold text-forest underline-offset-2 hover:underline"
          >
            Pakai bulan ini
          </button>
        )}
      </div>
    </div>
  );
}
