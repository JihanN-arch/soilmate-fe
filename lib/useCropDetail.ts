"use client";

import { useEffect, useState } from "react";
import { CropDetail, getCropDetail } from "@/lib/api";
import { getAnonymousId } from "@/lib/anonymousId";

// undefined = masih loading, null = tidak ditemukan.
// BE sekarang mengirim semua field lewat endpoint detail, jadi halaman ini
// bisa dibuka di tab baru tanpa hasil analisis di sessionStorage.
export function useCropDetail(rekomendasiId: string) {
  const [detail, setDetail] = useState<CropDetail | null | undefined>(undefined);

  useEffect(() => {
    getCropDetail(Number(rekomendasiId), getAnonymousId())
      .then((data) => setDetail(data))
      .catch(() => setDetail(null));
  }, [rekomendasiId]);

  return detail;
}
