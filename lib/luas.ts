// Konversi satuan luas ke m². Bata/tumbak berbeda antar daerah,
// jadi angkanya bisa diubah pengguna (default 14 m²).

export type SatuanLuas = "m2" | "are" | "ha" | "bata";

export const SATUAN_LUAS: { value: SatuanLuas; label: string }[] = [
  { value: "m2", label: "m²" },
  { value: "are", label: "are" },
  { value: "ha", label: "hektar" },
  { value: "bata", label: "bata/tumbak" },
];

export const DEFAULT_M2_PER_BATA = 14;

export function keM2(nilai: number, satuan: SatuanLuas, m2PerBata = DEFAULT_M2_PER_BATA): number {
  switch (satuan) {
    case "ha": return nilai * 10000;
    case "are": return nilai * 100;
    case "bata": return nilai * m2PerBata;
    default: return nilai;
  }
}

export function formatM2(m2: number): string {
  if (m2 >= 10000) return `${(m2 / 10000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} ha`;
  return `${Math.round(m2).toLocaleString("id-ID")} m²`;
}
