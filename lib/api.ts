const API_BASE = process.env.NEXT_PUBLIC_URL;

// ============================================================
// Tipe data (mengikuti README-API.md). Field baru dibuat opsional
// supaya data dari riwayat lama tetap bisa ditampilkan.
// ============================================================

export type SumberData =
  | "uji_tanah"
  | "api"
  | "cache"
  | "cache_kedaluwarsa"
  | "api_sekitar"
  | "tetangga"
  | "open_meteo_dem"
  | null;

export type KualitasData = { skor: number; label: string };

export type KondisiLahan = {
  status?: string;
  curah_hujan: number;
  curah_hujan_bulanan?: number[];
  suhu: number;
  et0?: number;
  elevasi: number;
  ph_tanah: number;
  nitrogen?: number;
  organic_carbon?: number;
  tekstur_kelas?: string | null;
  tekstur_tanah?: { sand: number; silt: number; clay: number };
  ndvi?: number | null;
  kesuburan_tanah: number;
  kemiringan?: number | null;
  ph_rentang?: [number, number] | null;
  sumber_data?: Record<string, SumberData> | null;
  kualitas_data?: KualitasData | null;
  catatan_data?: string[] | null;
  luas_lahan_m2?: number | null;
};

export type RincianSkor = Partial<
  Record<"ph" | "rainfall" | "temp" | "elevation" | "texture", number>
> &
  Record<string, number>;

export type DetailKepercayaan = {
  skor: number;
  kualitas_data?: number;
  ml_setuju?: boolean;
  peringkat_ml?: number;
  confidence_ml?: number | null; // untuk debugging, tidak ditampilkan
  tingkat_dasar?: string | null;
  diturunkan_karena?: string[] | null;
};

export type Rentang = { min: number; max: number };
export type AngkaAtauRentang = number | Rentang | null;

export type Ekonomi = {
  tersedia: boolean;
  status?: "lengkap" | "pendapatan_saja" | "belum_tersedia" | string;
  wilayah_harga?: string | null;
  harga_per_kg?: number | null;
  harga_produsen_per_kg?: number | null;
  produktivitas_kg_ha?: AngkaAtauRentang;
  produktivitas_ton_ha?: AngkaAtauRentang;
  estimasi_pendapatan_per_ha?: AngkaAtauRentang;
  estimasi_biaya_per_ha?: number | null;
  estimasi_keuntungan_per_ha?: AngkaAtauRentang;
  estimasi_pendapatan_lahan?: AngkaAtauRentang;
  estimasi_biaya_lahan?: number | null;
  estimasi_keuntungan_lahan?: AngkaAtauRentang;
  biaya_produksi_per_ha?: number | null;
  perubahan_harga_30_hari_persen?: number | null;
  luas_lahan_m2?: number | null;
  sumber_harga?: string | null;
  sumber_biaya?: string | null;
  tanggal_harga?: string | null;
  catatan?: string | string[] | null;
  [key: string]: unknown;
};

export type RekomendasiItem = {
  id: string; // slug, contoh: "kemiri" — dipakai untuk cari gambar
  nama: string;
  nama_latin: string;
  kesuburan_ideal: string;
  ph_ideal: string;
  elevasi_ideal: string;
  skor_kesesuaian: number;
  tingkat_kepercayaan?: string;
  alasan_rekomendasi?: string[];
  rekomendasi_id: number; // dipakai untuk fetch detail tanaman
  crop_slug?: string;
  jenis_tanaman?: string;
  faktor_pembatas?: string[] | null;
  mulai_tanam?: string | null;
  musim_tanam_mm?: number | null;
  rincian_skor?: RincianSkor | null;
  skor_per_bulan?: number[] | null; // 12 angka, indeks 0 = mulai tanam Januari; null untuk tanaman tahunan
  sumber_skor?: "aturan" | "hybrid" | "ml" | string;
  di_luar_rentang_latih?: boolean | null;
  detail_kepercayaan?: DetailKepercayaan | null;
  ekonomi?: Ekonomi | null;
};

export type RekomendasiBulanTanam = {
  bulan: string;
  daftar: RekomendasiItem[];
} | null;

export type RecommendResponse = {
  status: string;
  recommendation: {
    riwayat_id?: number;
    kondisi_lahan: KondisiLahan;
    rekomendasi: RekomendasiItem[];
    rekomendasi_bulan_tanam?: RekomendasiBulanTanam;
  };
};

export type UjiTanahPayload = {
  ph?: number | null;
  tekstur_kelas?: string | null;
  sand?: number | null;
  silt?: number | null;
  clay?: number | null;
  c_organik_persen?: number | null;
  nitrogen_persen?: number | null;
  metode?: string | null;
  tanggal_uji?: string | null;
};

export type AnalisisPayload = {
  lat: number;
  lon: number;
  nama_lokasi: string;
  anonymous_id: string;
  bulan_tanam?: number;
  luas_lahan_m2?: number;
  uji_tanah?: UjiTanahPayload;
};

export type StatusProgres = "menunggu" | "berjalan" | "selesai" | "cadangan" | "gagal";

export type JobStatus = {
  job_id?: string;
  status: "antri" | "berjalan" | "selesai" | "perlu_input" | "gagal";
  progres?: Record<string, StatusProgres>;
  hasil?: unknown;
  butuh_input?: string[];
  pesan?: string;
  message?: string;
  error?: string;
};

export type CropDetail = {
  nama: string;
  nama_latin: string;
  deskripsi: string;
  jenis_tanaman: string;
  umur_panen: string;
  produktivitas_tanaman: string;
  cara_budidaya: string;
  syarat_tumbuh: {
    ph: { min: number; max: number };
    elevasi: { min: number; max: number };
    curah_hujan: { min: number; max: number };
    kesuburan: string;
  };
  manfaat: string;
  ringkasan_rekomendasi: {
    skor_kesesuaian: number;
    tingkat_kepercayaan: string;
    alasan_rekomendasi: string[];
    faktor_pembatas?: string[] | null;
    mulai_tanam?: string | null;
    musim_tanam_mm?: number | null;
    rincian_skor?: RincianSkor | null;
    skor_per_bulan?: number[] | null;
    sumber_skor?: string;
    di_luar_rentang_latih?: boolean | null;
    detail_kepercayaan?: DetailKepercayaan | null;
  };
  ekonomi?: Ekonomi | null;
  tren_harga?: unknown;
  slug?: string;
  crop_slug?: string;
  rekomendasi_id?: number;
  riwayat_id?: number;
};

export type RiwayatItem = {
  id: number;
  riwayat_id?: number;
  anonymous_id: string;
  lat: number;
  lon: number;
  bulan_tanam?: number | null;
  luas_lahan_m2?: number | null;
  tekstur_kelas?: string | null;
  kualitas_data?: KualitasData | null;
  lahan_aktif?: { lahan_id: number; crop_slug: string; rekomendasi_id: number }[];
  nama_lokasi: string;
  nama_tampilan?: string;
  curah_hujan: number;
  ph_tanah: number;
  elevasi: number;
  ndvi?: number;
  suhu: number;
  kesuburan_tanah: number;
  dibuat_pada: string;
  rekomendasi: {
    id: number;
    rekomendasi_id?: number;
    crop_slug?: string;
    nama?: string;
    nama_tanaman: string;
    nama_latin: string;
    kesuburan_ideal: string;
    ph_ideal: string;
    elevasi_ideal: string;
    skor_kesesuaian: number;
    ranking: number;
    jenis_tanaman?: string;
  }[];
};

export type PaginatedRiwayat = {
  count: number;
  next: string | null;
  previous: string | null;
  results: RiwayatItem[];
};

// ============================================================
// Error yang membawa status HTTP + body, supaya halaman bisa
// membedakan 422 perlu_input, 429, 503, dst.
// ============================================================

export class ApiError extends Error {
  status: number;
  body: any;
  constructor(message: string, status: number, body: any) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export class PerluInputError extends Error {
  butuhInput: string[];
  constructor(butuhInput: string[]) {
    super("Data tanah untuk lokasi ini tidak tersedia. Isi hasil uji tanah dulu.");
    this.butuhInput = butuhInput;
  }
}

function pesanError(status: number, body: any): string {
  if (typeof body?.pesan === "string" && body.pesan) return body.pesan;
  if (status === 429) return "Terlalu banyak permintaan. Tunggu sekitar 1 menit lalu coba lagi.";
  if (status === 503) return "Data iklim atau ketinggian untuk lokasi ini sedang tidak tersedia. Coba lagi nanti.";
  if (status === 404) return "Data tidak ditemukan.";
  return `Permintaan gagal (status ${status}). Coba lagi.`;
}

async function apiFetch(path: string, options?: RequestInit) {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
}

async function readJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// ============================================================
// Helper umum
// ============================================================

// Ubah nama tanaman jadi slug buat nyari file gambar, contoh: "Kacang Panjang" -> "kacangpanjang"
export function slugify(nama: string): string {
  return nama.toLowerCase().replace(/[\s_]+/g, "");
}

export function getCropImage(nama: string): string {
  return `/images/${slugify(nama)}.png`;
}

// Samain bentuk data dari /recommend/ ATAU dari nested rekomendasi di /riwayat/
// (field namanya beda dikit: nama vs nama_tanaman, rekomendasi_id vs id)
export function normalizeRekomendasi(raw: any): RekomendasiItem {
  const nama = raw.nama ?? raw.nama_tanaman;
  return {
    ...raw,
    id: raw.crop_slug ?? slugify(nama),
    nama,
    rekomendasi_id: raw.rekomendasi_id ?? raw.id,
  };
}

// Hasil job bisa berbentuk {status, recommendation} atau langsung {kondisi_lahan, ...}
export function normalizeHasil(hasil: any): RecommendResponse {
  if (hasil?.recommendation) return hasil as RecommendResponse;
  return { status: "success", recommendation: hasil };
}

// ============================================================
// Rekomendasi
// ============================================================

// Endpoint sinkron lama. Dipakai sebagai cadangan kalau /analisis/ tidak ada.
export async function postAnalisisLahan(payload: AnalisisPayload): Promise<RecommendResponse> {
  const res = await apiFetch("/api/recommend/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await readJson(res);

  if (res.status === 422 && data?.status === "perlu_input") {
    throw new PerluInputError(data.butuh_input ?? ["ph", "tekstur_kelas"]);
  }
  if (!res.ok || data?.status === "error") {
    throw new ApiError(pesanError(res.status, data), res.status, data);
  }
  return data;
}

// Endpoint asinkron: balas 202 {job_id}
export async function startAnalisisJob(payload: AnalisisPayload): Promise<string> {
  const res = await apiFetch("/api/analisis/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await readJson(res);

  if (res.status === 422 && data?.status === "perlu_input") {
    throw new PerluInputError(data.butuh_input ?? ["ph", "tekstur_kelas"]);
  }
  if (!res.ok || !data?.job_id) {
    throw new ApiError(pesanError(res.status, data), res.status, data);
  }
  return String(data.job_id);
}

export async function getAnalisisJob(jobId: string, anonymousId: string): Promise<JobStatus> {
  const res = await apiFetch(
    `/api/analisis/${jobId}/?anonymous_id=${encodeURIComponent(anonymousId)}`
  );
  const data = await readJson(res);

  // 422 bisa juga datang dari polling
  if (res.status === 422 && data?.status === "perlu_input") {
    return { status: "perlu_input", butuh_input: data.butuh_input };
  }
  if (!res.ok) {
    throw new ApiError(pesanError(res.status, data), res.status, data);
  }
  return data;
}

export async function getCropDetail(
  rekomendasiId: number,
  anonymousId: string
): Promise<CropDetail> {
  const res = await apiFetch(
    `/api/rekomendasi/${rekomendasiId}/detail/?anonymous_id=${encodeURIComponent(anonymousId)}`
  );
  if (!res.ok) {
    throw new Error("Rekomendasi tidak ditemukan");
  }
  return res.json();
}

// ============================================================
// Riwayat
// ============================================================

export async function getRiwayatPage(
  anonymousId: string,
  page: number = 1
): Promise<PaginatedRiwayat> {
  const res = await apiFetch(`/api/riwayat/?anonymous_id=${anonymousId}&page=${page}`);
  if (!res.ok) throw new Error("Gagal memuat riwayat");
  return res.json();
}

export type RiwayatDetail = RecommendResponse["recommendation"] & {
  riwayat_id: number;
  nama_lokasi: string;
  lat: number;
  lon: number;
  bulan_tanam?: number | null;
  luas_lahan_m2?: number | null;
  dibuat_pada: string;
};

// Bentuknya sama dengan objek `recommendation` hasil analisis (+ meta lokasi)
export async function getRiwayatDetail(riwayatId: number, anonymousId: string): Promise<RiwayatDetail> {
  const res = await apiFetch(
    `/api/riwayat/${riwayatId}/detail/?anonymous_id=${encodeURIComponent(anonymousId)}`
  );
  const data = await readJson(res);
  if (!res.ok) throw new ApiError(pesanError(res.status, data), res.status, data);
  return {
    ...data,
    rekomendasi: (data.rekomendasi ?? []).map(normalizeRekomendasi),
    rekomendasi_bulan_tanam: data.rekomendasi_bulan_tanam
      ? { ...data.rekomendasi_bulan_tanam, daftar: data.rekomendasi_bulan_tanam.daftar.map(normalizeRekomendasi) }
      : null,
  };
}

export function riwayatDetailToResponse(d: RiwayatDetail): RecommendResponse {
  return { status: "success", recommendation: d };
}

// Nama yang ditampilkan untuk item riwayat (nama_tampilan lama atau nama_lokasi baru)
export function namaRiwayat(item: RiwayatItem): string {
  return item.nama_tampilan || item.nama_lokasi || `Lahan ${item.riwayat_id ?? item.id}`;
}

export async function deleteRiwayat(riwayatId: number, anonymousId: string) {
  const res = await apiFetch(`/api/riwayat/${riwayatId}/?anonymous_id=${anonymousId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Gagal menghapus riwayat");
}


// ============================================================
// Kunci sessionStorage
// ============================================================

export const STORAGE_KEY_FORM = "nusa-crop-form-payload"; // payload yang dikirim ke BE
export const STORAGE_KEY_FORM_UI = "nusa-crop-form-ui"; // state form (satuan luas, dsb.)
export const STORAGE_KEY_RESULT = "nusa-crop-result";
export const STORAGE_KEY_JOB = "nusa-crop-job-id";
export const STORAGE_KEY_PERLU_INPUT = "nusa-crop-perlu-input";

// Cari 1 item rekomendasi di hasil tersimpan (daftar utama atau daftar bulan tanam)
export function findStoredRekomendasi(rekomendasiId: number): RekomendasiItem | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY_RESULT);
  if (!raw) return null;
  try {
    const data: RecommendResponse = JSON.parse(raw);
    const semua = [
      ...(data.recommendation.rekomendasi ?? []),
      ...(data.recommendation.rekomendasi_bulan_tanam?.daftar ?? []),
    ];
    return semua.find((r) => Number(r.rekomendasi_id) === rekomendasiId) ?? null;
  } catch {
    return null;
  }
}

// ============================================================
// Ekonomi
// ============================================================

export type TitikHarga = { tanggal: string; harga: number };

// tren_harga bisa berupa array langsung atau {data: [...]}; field harga bisa harga / harga_per_kg
export function normalizeTrenHarga(raw: any): TitikHarga[] {
  const arr = Array.isArray(raw) ? raw : raw?.data ?? raw?.seri ?? raw?.harian ?? [];
  if (!Array.isArray(arr)) return [];
  return arr
    .map((d: any) => ({
      tanggal: String(d.tanggal ?? d.date ?? ""),
      harga: Number(d.harga_per_kg ?? d.harga ?? d.nilai),
    }))
    .filter((d) => d.tanggal && Number.isFinite(d.harga))
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
}

export async function getEkonomi(slug: string): Promise<{ ekonomi: Ekonomi; tren: TitikHarga[] }> {
  const res = await apiFetch(`/api/ekonomi/${encodeURIComponent(slug)}/`);
  if (!res.ok) throw new Error("Gagal memuat data ekonomi");
  const data = await res.json();
  return { ekonomi: data.ekonomi ?? data, tren: normalizeTrenHarga(data.tren_harga) };
}

// ============================================================
// Cuaca
// ============================================================

export type HariCuaca = {
  tanggal: string;
  hujan: number | null;
  peluang: number | null;
  tmax: number | null;
  tmin: number | null;
};

export type SaranCuaca = { jenis?: string; tingkat?: string; pesan: string };

export type Prakiraan = { harian: HariCuaca[]; saran: SaranCuaca[] };

const angkaAtauNull = (...v: any[]) => {
  for (const x of v) if (x !== undefined && x !== null && Number.isFinite(Number(x))) return Number(x);
  return null;
};

export function normalizePrakiraan(raw: any): Prakiraan | null {
  if (!raw) return null;
  const arr = Array.isArray(raw)
    ? raw
    : raw.harian ?? raw.prakiraan ?? raw.daily ?? raw.hari ?? raw.data ?? [];
  const harian: HariCuaca[] = (Array.isArray(arr) ? arr : []).map((d: any) => ({
    tanggal: String(d.tanggal ?? d.date ?? d.time ?? ""),
    hujan: angkaAtauNull(d.hujan_mm, d.curah_hujan, d.hujan, d.precipitation_sum, d.precipitation),
    peluang: angkaAtauNull(d.peluang_hujan, d.precipitation_probability_max, d.peluang),
    tmax: angkaAtauNull(d.suhu_maks, d.suhu_max, d.tmax, d.temperature_2m_max),
    tmin: angkaAtauNull(d.suhu_min, d.tmin, d.temperature_2m_min),
  }));
  const saranRaw = Array.isArray(raw) ? [] : raw.saran ?? [];
  const saran: SaranCuaca[] = (Array.isArray(saranRaw) ? saranRaw : [saranRaw])
    .map((s: any) => (typeof s === "string" ? { pesan: s } : { ...s, pesan: s.pesan ?? s.teks ?? s.judul ?? "" }))
    .filter((s: SaranCuaca) => s.pesan);
  return { harian, saran };
}

export async function getPrakiraan(lat: number, lon: number): Promise<Prakiraan | null> {
  const res = await apiFetch(`/api/cuaca/prakiraan/?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error("Gagal memuat prakiraan cuaca");
  return normalizePrakiraan(await res.json());
}

// ============================================================
// Lahan yang ditanam (monitoring)
// ============================================================

export type Kesehatan = "belum_cukup_data" | "baik" | "perlu_dicek" | string;
export type Peringatan = { jenis: string; tingkat?: string; pesan: string };
export type ObservasiNdvi = { tanggal: string; ndvi: number };

export type Lahan = {
  id: number;
  nama_tanaman: string;
  crop_slug?: string;
  nama_lokasi?: string;
  lat?: number;
  lon?: number;
  tanggal_tanam: string;
  status: string;
  kesehatan?: Kesehatan;
  peringatan: Peringatan[];
  rekomendasi_id?: number | null;
  observasi: ObservasiNdvi[];
  cuaca?: Prakiraan | null;
  terakhir_dipantau?: string | null;
  hari_setelah_tanam?: number | null;
  luas_lahan_m2?: number | null;
  raw: any;
};

export function normalizeLahan(r: any): Lahan {
  const crop = r.crop;
  const nama =
    r.nama_tanaman ?? r.crop_nama ?? (typeof crop === "object" ? crop?.nama : undefined) ?? (typeof crop === "string" ? crop : "Tanaman");
  const obs = (r.observasi ?? r.observasi_ndvi ?? [])
    .map((o: any) => ({ tanggal: String(o.tanggal ?? o.date ?? ""), ndvi: Number(o.ndvi ?? o.nilai) }))
    .filter((o: ObservasiNdvi) => o.tanggal && Number.isFinite(o.ndvi))
    .sort((a: ObservasiNdvi, b: ObservasiNdvi) => a.tanggal.localeCompare(b.tanggal));
  return {
    id: Number(r.id),
    nama_tanaman: String(nama).replace(/^\w/, (c) => c.toUpperCase()),
    crop_slug: r.crop_slug ?? (typeof crop === "object" ? crop?.slug : typeof crop === "string" ? crop : undefined),
    nama_lokasi: r.nama_lokasi ?? r.riwayat_nama ?? r.lokasi,
    lat: r.lat != null ? Number(r.lat) : undefined,
    lon: r.lon != null ? Number(r.lon) : undefined,
    tanggal_tanam: String(r.tanggal_tanam ?? ""),
    status: String(r.status ?? "aktif"),
    kesehatan: r.kesehatan,
    peringatan: Array.isArray(r.peringatan) ? r.peringatan : [],
    rekomendasi_id: r.rekomendasi_id ?? (typeof r.rekomendasi === "number" ? r.rekomendasi : r.rekomendasi?.id) ?? null,
    observasi: obs,
    cuaca: r.cuaca ? normalizePrakiraan(r.cuaca) : null,
    terakhir_dipantau: r.terakhir_dipantau ?? r.diperbarui_pada ?? r.updated_at ?? null,
    hari_setelah_tanam: typeof r.hari_setelah_tanam === "number" ? r.hari_setelah_tanam : null,
    luas_lahan_m2: typeof r.luas_lahan_m2 === "number" ? r.luas_lahan_m2 : null,
    raw: r,
  };
}

export async function postLahan(body: {
  anonymous_id: string;
  rekomendasi_id: number;
  tanggal_tanam: string;
}): Promise<Lahan> {
  const res = await apiFetch("/api/lahan/", { method: "POST", body: JSON.stringify(body) });
  const data = await readJson(res);
  if (!res.ok) throw new ApiError(pesanError(res.status, data), res.status, data);
  return normalizeLahan(data.lahan ?? data);
}

export async function getLahanList(anonymousId: string, status?: string): Promise<Lahan[]> {
  const q = `anonymous_id=${encodeURIComponent(anonymousId)}${status ? `&status=${status}` : ""}`;
  const res = await apiFetch(`/api/lahan/?${q}`);
  if (!res.ok) throw new Error("Gagal memuat daftar lahan");
  const data = await res.json();
  const arr = Array.isArray(data) ? data : data.results ?? data.lahan ?? [];
  return arr.map(normalizeLahan);
}

export async function getLahan(id: number, anonymousId: string): Promise<Lahan> {
  const res = await apiFetch(`/api/lahan/${id}/?anonymous_id=${encodeURIComponent(anonymousId)}`);
  if (!res.ok) throw new Error("Lahan tidak ditemukan");
  return normalizeLahan(await res.json());
}

export async function patchLahan(id: number, anonymousId: string, body: Record<string, unknown>): Promise<Lahan> {
  const res = await apiFetch(`/api/lahan/${id}/?anonymous_id=${encodeURIComponent(anonymousId)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  const data = await readJson(res);
  if (!res.ok) throw new ApiError(pesanError(res.status, data), res.status, data);
  return normalizeLahan(data);
}

export async function deleteLahan(id: number, anonymousId: string) {
  const res = await apiFetch(`/api/lahan/${id}/?anonymous_id=${encodeURIComponent(anonymousId)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Gagal menghapus lahan");
}

export async function pantauLahan(id: number, anonymousId: string): Promise<void> {
  const res = await apiFetch(`/api/lahan/${id}/pantau/`, {
    method: "POST",
    body: JSON.stringify({ anonymous_id: anonymousId }),
  });
  const data = await readJson(res);
  if (!res.ok) throw new ApiError(pesanError(res.status, data), res.status, data);
}

// ============================================================
// Feedback
// ============================================================

export type FeedbackPayload = {
  anonymous_id: string;
  jenis: "rekomendasi" | "hasil_panen" | "aplikasi";
  rekomendasi_id?: number;
  lahan_id?: number;
  ditanam?: boolean;
  hasil?: "baik" | "sedang" | "buruk" | "gagal";
  hasil_panen_kg?: number;
  luas_lahan_m2?: number;
  rating?: number;
  komentar?: string;
};

export async function postFeedback(body: FeedbackPayload) {
  const res = await apiFetch("/api/feedback/", { method: "POST", body: JSON.stringify(body) });
  const data = await readJson(res);
  if (!res.ok) throw new ApiError(pesanError(res.status, data), res.status, data);
  return data;
}

// ============================================================
// Simulasi pengapuran
// ============================================================

export type SimulasiKapurPayload = {
  anonymous_id: string;
  // Mode 1: dari lahan yang sudah dianalisis
  riwayat_id?: number;
  // Mode 2: input sendiri (butuh dukungan BE, lihat catatan serah terima)
  uji_tanah?: UjiTanahPayload;
  lat?: number;
  lon?: number;
  dosis_ton_ha?: number;
  target_ph?: number;
  jenis_kapur?: "dolomit" | "kalsit" | "kapur_tohor";
  luas_lahan_m2?: number;
};

export type PerubahanSkor = { id?: string; crop_slug?: string; nama?: string; sebelum: number; sesudah: number; selisih: number };

export type SimulasiKapurResponse = {
  ph_awal: number;
  ph_baru: number;
  kebutuhan_kapur: {
    dosis_ton_ha: number;
    luas_lahan_m2?: number | null;
    total_kg?: number | null;
    harga_per_kg?: number | null; // lama, untuk kompatibilitas
    perkiraan_biaya?: number | null; // lama, untuk kompatibilitas
    harga_per_kg_rentang?: { min: number; max: number } | null;
    perkiraan_biaya_rentang?: { min: number; max: number } | null; // untuk luas lahan pengguna
    perkiraan_biaya_per_ha_rentang?: { min: number; max: number } | null;
    sumber_harga?: string | null;
    tanggal_harga?: string | null;
    kemasan?: string | null;
  };
  perubahan_skor: PerubahanSkor[] | Record<string, Omit<PerubahanSkor, "id">>;
  rekomendasi_baru?: RekomendasiItem[];
  detail_ml?: {
    metode?: string;
    dosis_penetral_al_ton_ha?: number | null; // kebutuhan MINIMAL untuk menetralkan aluminium
    al_dd_awal?: number | null;
    al_dd_baru?: number | null;
    estimasi_lama_efek_tahun?: number | null;
    tekstur_dipakai?: string | null;
    [key: string]: unknown;
  } | null;
  mode_contoh?: boolean; // true = angka contoh dari BE, bukan hasil model
  catatan?: string[] | string;
};

export async function postSimulasiKapur(body: SimulasiKapurPayload): Promise<SimulasiKapurResponse> {
  const res = await apiFetch("/api/simulasi/kapur/", { method: "POST", body: JSON.stringify(body) });
  const data = await readJson(res);
  if (!res.ok) throw new ApiError(pesanError(res.status, data), res.status, data);
  return data;
}

// ============================================================
// Log usability
// ============================================================

export async function postUsabilityLog(events: Record<string, unknown>[]) {
  if (!events.length) return;
  await fetch(`${API_BASE}/api/usability/log/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(events.length === 1 ? events[0] : events),
    keepalive: true, // tetap terkirim walau halaman ditutup
  });
}
