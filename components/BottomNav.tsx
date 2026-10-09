"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp, FlaskConical, Search, Sprout } from "lucide-react";

const ITEM =
  "flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-transform active:scale-90";

export default function BottomNav() {
  const pathname = usePathname();
  const aktif = {
    lahan: pathname.startsWith("/riwayat") || pathname.startsWith("/lahan"),
    kapur: pathname.startsWith("/kapur"),
    analisis: pathname.startsWith("/analisis"),
  };
  const warna = (on: boolean) => (on ? "text-forest-dark" : "text-gray-500");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 mx-auto flex w-full max-w-[420px] border-t border-t-gray-400 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.12)]">
      <Link
        href="/#cara-pakai"
        className={`${ITEM} text-gray-500 active:text-forest-dark`}
      >
        <CircleHelp className="h-5 w-5" />
        <span className="text-[11px] font-semibold">Cara Pakai</span>
      </Link>

      <Link
        href="/riwayat"
        className={`${ITEM} ${warna(aktif.lahan)}`}
        aria-current={aktif.lahan ? "page" : undefined}
      >
        <Sprout className="h-5 w-5" />
        <span className="text-[11px] font-semibold">Lahan Saya</span>
      </Link>

      <Link
        href="/kapur"
        className={`${ITEM} ${warna(aktif.kapur)}`}
        aria-current={aktif.kapur ? "page" : undefined}
      >
        <FlaskConical className="h-5 w-5" />
        <span className="text-[11px] font-semibold">Kapur</span>
      </Link>

      <Link
        href="/analisis"
        className={`${ITEM} ${warna(aktif.analisis)}`}
        aria-current={aktif.analisis ? "page" : undefined}
      >
        <Search className="h-5 w-5" />
        <span className="text-[11px] font-semibold">Analisis</span>
      </Link>
    </nav>
  );
}
