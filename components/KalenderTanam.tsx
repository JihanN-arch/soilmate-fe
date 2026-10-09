import { BULAN, BULAN_PENDEK } from "@/lib/labels";

function warna(v: number) {
  if (v >= 0.8) return "bg-forest";
  if (v >= 0.5) return "bg-[#C9A83A]";
  return "bg-alert/70";
}

// Kalender tanam dari skor_per_bulan (indeks 0 = mulai tanam Januari).
// `bulanAcuan` (1-12) diberi tanda, misalnya bulan yang dipilih pengguna.
export default function KalenderTanam({ skor, bulanAcuan }: { skor?: number[] | null; bulanAcuan?: number | null }) {
  if (!skor || skor.length !== 12 || skor.some((v) => typeof v !== "number")) return null;

  const max = Math.max(...skor);
  // bulan "terbaik" = yang skornya hampir sama dengan maksimum
  const terbaik = skor.map((v, i) => (v >= max - 0.02 ? i : -1)).filter((i) => i >= 0);
  const namaTerbaik =
    terbaik.length >= 6 ? "hampir sepanjang tahun" : terbaik.map((i) => BULAN[i]).join(", ");

  return (
    <div>
      <div className="flex h-24 items-end gap-1" role="img" aria-label={`Kecocokan per bulan mulai tanam. Paling cocok: ${namaTerbaik}`}>
        {skor.map((v, i) => {
          const pct = Math.max(0, Math.min(1, v));
          const acuan = bulanAcuan === i + 1;
          return (
            <div key={i} className="flex h-full flex-1 flex-col items-center justify-end">
              <div
                className={`w-full rounded-t ${warna(pct)} ${terbaik.includes(i) ? "" : "opacity-60"}`}
                style={{ height: `${Math.max(pct * 100, 4)}%` }}
                title={`${BULAN[i]}: ${Math.round(pct * 100)}%`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex gap-1">
        {BULAN_PENDEK.map((b, i) => (
          <span
            key={b}
            className={`flex-1 text-center text-[9px] ${
              bulanAcuan === i + 1 ? "rounded bg-forest-dark font-bold text-white" : terbaik.includes(i) ? "font-bold text-forest-dark" : "text-forest-dark/60"
            }`}
          >
            {b}
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs text-forest-dark/80">
        Paling cocok mulai tanam: <b className="text-forest-dark">{namaTerbaik}</b>
        {bulanAcuan && !terbaik.includes(bulanAcuan - 1) && (
          <> Bulan {BULAN[bulanAcuan - 1]} kecocokannya {Math.round(skor[bulanAcuan - 1] * 100)}%.</>
        )}
      </p>
    </div>
  );
}
