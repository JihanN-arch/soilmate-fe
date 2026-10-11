import { AlertTriangle, CalendarClock, HeartPulse, Satellite } from "lucide-react";

// Label singkat per status. Untuk penjelasan lengkap, tampilkan `pesan_status` dari BE di dekat badge ini.
export default function KesehatanBadge({ kesehatan }: { kesehatan?: string }) {
  const base = "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold";
  if (kesehatan === "baik")
    return (
      <span className={`${base} bg-[#DDEBC8] text-[#2F4A12]`}>
        <HeartPulse className="h-3.5 w-3.5" /> Tumbuh baik
      </span>
    );
  if (kesehatan === "perlu_dicek")
    return (
      <span className={`${base} bg-[#FFF1DC] text-[#8A5A00]`}>
        <AlertTriangle className="h-3.5 w-3.5" /> Perlu dicek
      </span>
    );
  if (kesehatan === "dijadwalkan")
    return (
      <span className={`${base} bg-[#E6EEF7] text-[#2B4A6B]`}>
        <CalendarClock className="h-3.5 w-3.5" /> Dijadwalkan
      </span>
    );
  return (
    <span className={`${base} bg-gray-100 text-forest-dark/70`}>
      <Satellite className="h-3.5 w-3.5" /> Menunggu data satelit
    </span>
  );
}
