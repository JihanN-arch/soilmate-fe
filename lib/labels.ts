// Label tampilan yang dipakai di banyak halaman.

export const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
export const BULAN_PENDEK = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

// BE membalas singkatan ("Okt"); ubah jadi nama lengkap untuk tampilan.
export function namaBulanPanjang(singkat?: string | null): string {
  if (!singkat) return "";
  const i = BULAN_PENDEK.findIndex((b) => b.toLowerCase() === singkat.toLowerCase().slice(0, 3));
  return i >= 0 ? BULAN[i] : singkat;
}

// Value yang dikirim = kelas USDA (diterima BE), label = nama Indonesia.
export const TEKSTUR_OPTIONS: { value: string; label: string; hint: string }[] = [
  { value: "sand", label: "Pasir", hint: "Kasar, tidak bisa dikepal" },
  { value: "loamy sand", label: "Pasir berlempung", hint: "Kasar, mudah hancur saat dikepal" },
  { value: "sandy loam", label: "Lempung berpasir", hint: "Agak kasar, bisa dikepal tapi rapuh" },
  { value: "loam", label: "Lempung", hint: "Gembur, sedikit lengket" },
  { value: "silt loam", label: "Lempung berdebu", hint: "Halus seperti tepung saat kering" },
  { value: "silt", label: "Debu", hint: "Sangat halus, licin saat basah" },
  { value: "sandy clay loam", label: "Lempung liat berpasir", hint: "Lengket dan berpasir" },
  { value: "clay loam", label: "Lempung berliat", hint: "Lengket, bisa dipilin pendek" },
  { value: "silty clay loam", label: "Lempung liat berdebu", hint: "Lengket dan licin" },
  { value: "sandy clay", label: "Liat berpasir", hint: "Sangat lengket, terasa butir pasir" },
  { value: "silty clay", label: "Liat berdebu", hint: "Sangat lengket dan licin" },
  { value: "clay", label: "Liat", hint: "Sangat lengket, bisa dipilin panjang" },
];

export function labelTekstur(kelas?: string | null): string {
  if (!kelas) return "-";
  const opt = TEKSTUR_OPTIONS.find(
    (o) => o.value === kelas.toLowerCase() || o.label.toLowerCase() === kelas.toLowerCase()
  );
  return opt ? opt.label : kelas;
}

// Metode uji tanah. Pastikan nilainya sama dengan yang diterima BE.
export const METODE_UJI = [
  { value: "putk", label: "PUTK (Perangkat Uji Tanah Kering)" },
  { value: "lab", label: "Laboratorium" },
  { value: "ph_meter", label: "Alat ukur pH / soil tester" },
  { value: "lainnya", label: "Lainnya" },
];

// Asal data per parameter (sumber_data)
export function labelSumber(sumber?: string | null): string {
  switch (sumber) {
    case "uji_tanah": return "dari uji tanah Anda";
    case "api": return "data satelit/model";
    case "cache": return "data tersimpan";
    case "cache_kedaluwarsa": return "data lama (cadangan)";
    case "api_sekitar": return "dari titik ±280 m di sekitar";
    case "tetangga": return "dari wilayah terdekat";
    case "open_meteo_dem": return "model ketinggian";
    case null: return "tidak tersedia";
    default: return "";
  }
}

export function isSumberCadangan(sumber?: string | null): boolean {
  return sumber === "cache_kedaluwarsa" || sumber === "api_sekitar" || sumber === "tetangga";
}

// Nama sumber pada progres job
export const LABEL_PROGRES: Record<string, string> = {
  tanah: "Data tanah",
  soil: "Data tanah",
  soilgrids: "Data tanah",
  iklim: "Data iklim & hujan",
  cuaca: "Data iklim & hujan",
  climate: "Data iklim & hujan",
  elevasi: "Data ketinggian",
  elevation: "Data ketinggian",
  satelit: "Data satelit (vegetasi)",
  ndvi: "Data satelit (vegetasi)",
  gee: "Data satelit (vegetasi)",
  model: "Perhitungan rekomendasi",
  skor: "Perhitungan rekomendasi",
};

export function labelProgres(key: string): string {
  return LABEL_PROGRES[key.toLowerCase()] ?? key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

// Nama parameter pada rincian_skor
export const LABEL_RINCIAN: Record<string, string> = {
  ph: "Keasaman tanah (pH)",
  rainfall: "Curah hujan",
  temp: "Suhu",
  elevation: "Ketinggian",
  texture: "Tekstur tanah",
};

export function labelRincian(key: string): string {
  return LABEL_RINCIAN[key] ?? key;
}

export function kataSkor(nilai: number): string {
  if (nilai >= 0.8) return "Sangat cocok";
  if (nilai >= 0.5) return "Cukup";
  return "Kurang";
}
