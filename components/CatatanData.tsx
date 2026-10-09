import { Info } from "lucide-react";
import Link from "next/link";

type Props = {
  catatan?: string[] | null;
  pakaiUjiTanah: boolean;
};

// Catatan dari BE + pengingat bahwa hasil bukan pengganti uji tanah.
export default function CatatanData({ catatan, pakaiUjiTanah }: Props) {
  const daftar = catatan ?? [];
  return (
    <div className="space-y-2">
      {daftar.length > 0 && (
        <div className="rounded-xl border border-[#E8A93C] bg-[#FFF8E8] p-3 text-xs text-forest-dark">
          <p className="mb-1 flex items-center gap-1.5 font-bold">
            <Info className="h-4 w-4 text-[#C98A1E]" /> Catatan data
          </p>
          <ul className="list-disc space-y-1 pl-5 leading-relaxed">
            {daftar.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl bg-cream p-3 text-xs leading-relaxed text-forest-dark/80">
        {pakaiUjiTanah ? (
          <>Data tanah memakai hasil uji tanah Anda. Iklim dan ketinggian tetap perkiraan per wilayah.</>
        ) : (
          <>
            Data tanah adalah perkiraan satelit per wilayah ±250 m, bukan hasil ukur di petak Anda. Hasil ini
            bukan pengganti uji tanah.{" "}
            <Link href="/analisis" className="font-semibold text-forest underline">
              Isi hasil uji tanah
            </Link>{" "}
            agar lebih akurat.
          </>
        )}
      </div>
    </div>
  );
}
