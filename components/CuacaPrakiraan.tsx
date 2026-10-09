"use client";

import { CloudDrizzle, CloudRain, CloudSun, Sun, AlertTriangle } from "lucide-react";
import type { Prakiraan } from "@/lib/api";

function Ikon({ hujan }: { hujan: number | null }) {
  if (hujan == null) return <CloudSun className="h-5 w-5 text-forest-dark/60" />;
  if (hujan >= 20) return <CloudRain className="h-5 w-5 text-[#3B6A9A]" />;
  if (hujan >= 1) return <CloudDrizzle className="h-5 w-5 text-[#5B86B0]" />;
  return <Sun className="h-5 w-5 text-[#D19A1F]" />;
}

function namaHari(iso: string, i: number) {
  if (i === 0) return "Hari ini";
  if (i === 1) return "Besok";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" });
}

export default function CuacaPrakiraan({ data, ringkas = false }: { data: Prakiraan | null; ringkas?: boolean }) {
  if (!data || data.harian.length === 0)
    return <p className="text-xs text-forest-dark/60">Prakiraan cuaca belum tersedia untuk lokasi ini.</p>;

  const hari = ringkas ? data.harian.slice(0, 7) : data.harian;
  const totalHujan7 = data.harian.slice(0, 7).reduce((a, d) => a + (d.hujan ?? 0), 0);

  return (
    <div>
      {data.saran.length > 0 && (
        <ul className="mb-3 space-y-2">
          {data.saran.map((s, i) => (
            <li key={i} className="flex gap-2 rounded-xl bg-[#FFF8E8] p-3 text-xs leading-relaxed text-forest-dark">
              <AlertTriangle className="h-4 w-4 shrink-0 text-[#C98A1E]" />
              <span>{s.pesan}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-2">
        {hari.map((d, i) => (
          <div key={d.tanggal || i} className="flex w-16 shrink-0 flex-col items-center gap-1 rounded-xl bg-cream px-1 py-2 text-center">
            <span className="text-[10px] font-semibold text-forest-dark/70">{namaHari(d.tanggal, i)}</span>
            <Ikon hujan={d.hujan} />
            <span className="text-[11px] font-bold text-forest-dark">{d.hujan != null ? `${Math.round(d.hujan)} mm` : "-"}</span>
            {(d.tmax != null || d.tmin != null) && (
              <span className="text-[10px] text-forest-dark/70">
                {d.tmax != null ? Math.round(d.tmax) : "-"}°/{d.tmin != null ? Math.round(d.tmin) : "-"}°
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="text-[11px] text-forest-dark/60">
        Total hujan 7 hari ke depan sekitar {Math.round(totalHujan7)} mm. Sumber: Open-Meteo.
      </p>
    </div>
  );
}
