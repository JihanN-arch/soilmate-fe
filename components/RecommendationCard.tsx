import { AlertTriangle, CalendarDays, ChevronRight, Coins } from "lucide-react";

type RecommendationCardProps = {
  rank: number;
  name: string;
  latin?: string;
  note: string;
  score: number;
  mulaiTanam?: string | null;
  jumlahPembatas?: number;
  kepercayaan?: string;
  untungPerHa?: string | null; // sudah diformat, contoh "Rp 8 jt – Rp 12 jt"
  onClick?: () => void;
};

function rankColor(rank: number) {
  if (rank === 1) return "bg-rank1";
  if (rank === 2) return "bg-rank2";
  if (rank === 3) return "bg-rank3";
  if (rank === 4) return "bg-rank4";
  return "bg-rank5";
}

export default function RecommendationCard({
  rank,
  name,
  note,
  score,
  mulaiTanam,
  jumlahPembatas = 0,
  kepercayaan,
  untungPerHa,
  onClick,
}: RecommendationCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-stretch overflow-hidden rounded-2xl bg-white shadow-md transition-transform hover:scale-[1.01]"
    >
      <span
        className={`flex w-12 shrink-0 items-center justify-center ${rankColor(rank)} font-display text-lg font-bold text-forest-dark`}
      >
        {rank}
      </span>

      <span className="flex-1 p-3 text-left">
        <span className="flex items-start justify-between gap-2">
          <span className="font-display text-sm font-bold text-forest-dark">{name}</span>
          <ChevronRight className="h-4 w-4 shrink-0 text-forest-dark/50" />
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-forest-dark/60">{note}</span>

        {(mulaiTanam || jumlahPembatas > 0 || kepercayaan || untungPerHa != null) && (
          <span className="mt-1.5 flex flex-wrap gap-1.5">
            {mulaiTanam && (
              <span className="inline-flex items-center gap-1 rounded-full bg-cream px-2 py-0.5 text-[10px] font-semibold text-forest-dark">
                <CalendarDays className="h-3 w-3" /> Tanam terbaik: {mulaiTanam}
              </span>
            )}
            {jumlahPembatas > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF1DC] px-2 py-0.5 text-[10px] font-semibold text-[#8A5A00]">
                <AlertTriangle className="h-3 w-3" /> {jumlahPembatas} hal perlu diperhatikan
              </span>
            )}
            {untungPerHa != null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF5E3] px-2 py-0.5 text-[10px] font-semibold text-[#2F4A12]">
                <Coins className="h-3 w-3" /> Untung {untungPerHa}/ha
              </span>
            )}
            {kepercayaan && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-forest-dark/70">
                Keyakinan {kepercayaan.toLowerCase()}
              </span>
            )}
          </span>
        )}

        <span className="mt-2 flex items-center gap-2">
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-forest-dark/15">
            <span className="block h-full rounded-full bg-forest" style={{ width: `${score}%` }} />
          </span>
          <span className="shrink-0 font-display text-base font-bold text-forest-dark">{score}%</span>
        </span>
      </span>
    </button>
  );
}
