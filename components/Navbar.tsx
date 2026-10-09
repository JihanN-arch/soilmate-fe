import Link from "next/link";
import { PlayCircle, History, ScanSearch } from "lucide-react";

type NavbarProps = {
  onRiwayatClick?: () => void;
};

export default function Navbar({ onRiwayatClick }: NavbarProps) {
  return (
    <header className="w-full bg-header">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="font-display text-sm font-bold tracking-wide text-cream-light">
            Soilmate
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <Link
            href="/#cara-pakai"
            className="flex items-center gap-1 rounded-full bg-cream-light px-2.5 py-1.5 text-[11px] font-semibold text-forest-dark"
          >
            <PlayCircle className="h-3.5 w-3.5" />
            Tutorial
          </Link>

          <button
            onClick={onRiwayatClick}
            className="flex items-center gap-1 rounded-full bg-cream-light px-2.5 py-1.5 text-[11px] font-semibold text-forest-dark"
          >
            <History className="h-3.5 w-3.5" />
            Riwayat
          </button>

          <Link
            href="/analisis"
            className="flex items-center gap-1 rounded-full bg-cream-light px-2.5 py-1.5 text-[11px] font-semibold text-forest-dark"
          >
            <ScanSearch className="h-3.5 w-3.5" />
            Analisis
          </Link>
        </div>
      </div>
    </header>
  );
}