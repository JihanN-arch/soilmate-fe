import { ShieldCheck } from "lucide-react";
import type { KualitasData } from "@/lib/api";

function warna(label: string) {
  const l = label.toLowerCase();
  if (l.startsWith("tinggi")) return "bg-[#DDEBC8] text-[#2F4A12] border-[#8FBC8F]";
  if (l.startsWith("sedang")) return "bg-[#FBF0C8] text-[#6B5200] border-[#E8D97A]";
  return "bg-[#F8DCD8] text-[#7A1F17] border-[#E89999]";
}

export default function KualitasDataBadge({
  kualitas,
  className = "",
}: {
  kualitas?: KualitasData | null;
  className?: string;
}) {
  if (!kualitas) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${warna(
        kualitas.label
      )} ${className}`}
      title={`Skor kualitas data ${Math.round(kualitas.skor * 100)}%`}
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      Kualitas data: {kualitas.label}
    </span>
  );
}
