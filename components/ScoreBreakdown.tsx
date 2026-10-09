import type { RincianSkor } from "@/lib/api";
import { kataSkor, labelRincian } from "@/lib/labels";

const URUTAN = ["ph", "texture", "rainfall", "temp", "elevation"];

function warnaBar(v: number) {
  if (v >= 0.8) return "bg-forest";
  if (v >= 0.5) return "bg-[#C9A83A]";
  return "bg-alert";
}

export default function ScoreBreakdown({ rincian }: { rincian?: RincianSkor }) {
  if (!rincian || Object.keys(rincian).length === 0) return null;
  const keys = Object.keys(rincian).sort((a, b) => {
    const ia = URUTAN.indexOf(a), ib = URUTAN.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });

  return (
    <ul className="space-y-3">
      {keys.map((k) => {
        const v = Math.max(0, Math.min(1, Number(rincian[k]) || 0));
        return (
          <li key={k}>
            <div className="mb-1 flex items-baseline justify-between text-xs">
              <span className="font-semibold text-forest-dark">{labelRincian(k)}</span>
              <span className="text-forest-dark/70">
                {kataSkor(v)} <b className="text-forest-dark">({Math.round(v * 100)}%)</b>
              </span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-forest-dark/10"
              role="meter"
              aria-valuenow={Math.round(v * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={labelRincian(k)}
            >
              <div className={`h-full rounded-full ${warnaBar(v)}`} style={{ width: `${v * 100}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
