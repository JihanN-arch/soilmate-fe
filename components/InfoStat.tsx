type InfoStatProps = {
  label: string;
  value: string;
  unit?: string;
  tag?: string;
};

export default function InfoStat({
  label,
  value,
  unit,
  tag,
}: InfoStatProps) {
  return (
    <div className="rounded-xl bg-forest p-4 text-center text-white">
      <p className="text-xs font-bold uppercase text-sand">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold">
        {value}
        {unit && <span className="text-sm"> {unit}</span>}
      </p>

      {tag && (
        <span className="mt-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs">
          {tag}
        </span>
      )}
    </div>
  );
}