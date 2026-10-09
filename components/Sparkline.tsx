// Grafik garis sederhana tanpa library (SVG), dipakai untuk tren harga dan NDVI.

type Titik = { x: string; y: number };

type Props = {
  data: Titik[];
  height?: number;
  formatY?: (v: number) => string;
  formatX?: (x: string) => string;
  warna?: string;
  yMin?: number;
  yMax?: number;
  label: string; // untuk pembaca layar
  penanda?: { x: string; label: string }; // garis vertikal, x dalam format yang sama dengan data (ISO date)
};

export default function Sparkline({
  data,
  height = 120,
  formatY = (v) => v.toFixed(2),
  formatX = (x) => x,
  warna = "#629560",
  yMin,
  yMax,
  label,
  penanda,
}: Props) {
  if (data.length < 2) return null;
  const W = 320;
  const H = height;
  const pad = { l: 4, r: 4, t: 18, b: 20 };
  const ys = data.map((d) => d.y);
  let lo = yMin ?? Math.min(...ys);
  let hi = yMax ?? Math.max(...ys);
  if (hi === lo) {
    hi += 1;
    lo -= 1;
  }
  const sx = (i: number) => pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r);
  const sy = (v: number) => pad.t + (1 - (v - lo) / (hi - lo)) * (H - pad.t - pad.b);
  const path = data.map((d, i) => `${i ? "L" : "M"}${sx(i).toFixed(1)},${sy(d.y).toFixed(1)}`).join(" ");
  const area = `${path} L${sx(data.length - 1)},${H - pad.b} L${sx(0)},${H - pad.b} Z`;
  const last = data[data.length - 1];
  const iMax = ys.indexOf(Math.max(...ys));
  const iMin = ys.indexOf(Math.min(...ys));

  // posisi penanda: interpolasi berdasarkan tanggal di antara titik data
  let xPenanda: number | null = null;
  if (penanda) {
    const t = (s: string) => new Date(s).getTime();
    const tp = t(penanda.x);
    const t0 = t(data[0].x), t1 = t(data[data.length - 1].x);
    if (Number.isFinite(tp) && Number.isFinite(t0) && t1 > t0 && tp >= t0 && tp <= t1) {
      // cari segmen tempat penanda berada
      for (let i = 0; i < data.length - 1; i++) {
        const a = t(data[i].x), b = t(data[i + 1].x);
        if (tp >= a && tp <= b) {
          xPenanda = sx(i) + (b > a ? (tp - a) / (b - a) : 0) * (sx(i + 1) - sx(i));
          break;
        }
      }
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={label}>
      {xPenanda !== null && (
        <g>
          <line x1={xPenanda} x2={xPenanda} y1={pad.t - 4} y2={H - pad.b} stroke="#172F2C" strokeDasharray="3 3" opacity={0.4} />
          <text x={xPenanda + 3} y={pad.t - 6} fontSize="10" fill="#172F2C" opacity={0.7}>{penanda!.label}</text>
        </g>
      )}
      <path d={area} fill={warna} opacity={0.08} />
      <path d={path} fill="none" stroke={warna} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {[iMax, iMin].map((i, k) =>
        i === data.length - 1 ? null : (
          <text
            key={k}
            x={Math.min(Math.max(sx(i), 24), W - 24)}
            y={k === 0 ? sy(data[i].y) - 6 : sy(data[i].y) + 13}
            textAnchor="middle"
            fontSize="10"
            fill="#172F2C"
            opacity={0.6}
          >
            {formatY(data[i].y)}
          </text>
        )
      )}
      <circle cx={sx(data.length - 1)} cy={sy(last.y)} r={3.5} fill={warna} />
      <text x={W - pad.r} y={Math.max(sy(last.y) - 8, 11)} textAnchor="end" fontSize="11" fontWeight="700" fill="#172F2C">
        {formatY(last.y)}
      </text>
      <text x={pad.l} y={H - 4} fontSize="10" fill="#172F2C" opacity={0.6}>
        {formatX(data[0].x)}
      </text>
      <text x={W - pad.r} y={H - 4} textAnchor="end" fontSize="10" fill="#172F2C" opacity={0.6}>
        {formatX(last.x)}
      </text>
    </svg>
  );
}
