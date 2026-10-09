import { CircleHelp, HeartPulse, AlertTriangle } from "lucide-react";

export default function KesehatanBadge({ kesehatan }: { kesehatan?: string }) {
  if (kesehatan === "baik")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#DDEBC8] px-2.5 py-1 text-[11px] font-semibold text-[#2F4A12]">
        <HeartPulse className="h-3.5 w-3.5" /> Tumbuh baik
      </span>
    );
  if (kesehatan === "perlu_dicek")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF1DC] px-2.5 py-1 text-[11px] font-semibold text-[#8A5A00]">
        <AlertTriangle className="h-3.5 w-3.5" /> Perlu dicek
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-forest-dark/70">
      <CircleHelp className="h-3.5 w-3.5" /> Data belum cukup
    </span>
  );
}
