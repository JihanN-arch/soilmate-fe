type CircularGaugeProps = {
  value: number;
  label: string;
  sublabel: string;
  size?: number;
};

export default function CircularGauge({ value, label, sublabel, size = 80 }: CircularGaugeProps) {
  const radius = (size / 80) * 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center text-center gap-1">
      <svg width={size} height={size} viewBox="0 0 80 80" className="-rotate-90">
        <circle cx="40" cy="40" r={radius} stroke="#E7E2CC" strokeWidth="8" fill="none" />
        <circle
          cx="40" cy="40" r={radius}
          stroke="#629560" strokeWidth="8" fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        />
      </svg>
      <div>
        <p className="font-display text-lg font-bold text-forest-dark">{value}%</p>
        <p className="text-xs font-semibold text-forest-dark">{label}</p>
        <p className="text-[10px] text-forest-dark/70">{sublabel}</p>
      </div>
    </div>
  );
}