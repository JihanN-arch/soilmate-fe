"use client";

// Log usability ke /api/usability/log/.
// Semua event dikumpulkan dulu lalu dikirim per batch (tiap 5 detik / saat tab ditutup).
//
// PENTING: bentuk event di bawah (fungsi keFormatBE) belum dicocokkan dengan
// rekap_usability.py di BE. Kalau nama field berbeda, cukup ubah fungsi itu saja.

import { postUsabilityLog } from "@/lib/api";
import { getAnonymousId } from "@/lib/anonymousId";

const KEY_SESI = "nusa-crop-sesi-id";
const KEY_MODE_TES = "nusa-crop-mode-tes";
const KEY_TES_STATE = "nusa-crop-tes-state";

export type EventUsability = {
  event: string;
  tugas?: string | null;
  data?: Record<string, unknown>;
};

type EventLengkap = EventUsability & { waktu: string; halaman: string };

let antrian: EventLengkap[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let listenerTerpasang = false;

function sesiId(): string {
  let id = sessionStorage.getItem(KEY_SESI);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(KEY_SESI, id);
  }
  return id;
}

function keFormatBE(e: EventLengkap): Record<string, unknown> {
  const tes = getTesState();
  return {
    anonymous_id: getAnonymousId(),
    sesi_id: sesiId(),
    event: e.event,
    tugas: e.tugas ?? tes.tugasAktif?.id ?? null,
    peserta: modeTesAktif() ? tes.peserta || null : null,
    mode_tes: modeTesAktif(),
    halaman: e.halaman,
    waktu: e.waktu,
    data: e.data ?? {},
  };
}

export async function flushLog() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (!antrian.length) return;
  const kirim = antrian.map(keFormatBE);
  antrian = [];
  try {
    await postUsabilityLog(kirim);
  } catch {
    // Log tidak boleh mengganggu pengguna; abaikan kalau gagal.
  }
}

export function logEvent(event: string, data?: Record<string, unknown>, tugas?: string | null) {
  if (typeof window === "undefined") return;
  antrian.push({ event, data, tugas, waktu: new Date().toISOString(), halaman: window.location.pathname });

  if (!listenerTerpasang) {
    listenerTerpasang = true;
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flushLog();
    });
  }
  // event penting langsung dikirim, sisanya dikumpulkan
  if (event.startsWith("tugas_") || event === "sus") {
    flushLog();
  } else if (!timer) {
    timer = setTimeout(flushLog, 5000);
  }
}

// ============================================================
// Mode tes (untuk usability test 8-11 Okt)
// Aktifkan dengan membuka URL apa saja + ?tes=1, matikan dengan ?tes=0
// ============================================================

export type Tugas = { id: string; judul: string; instruksi: string };

export const DAFTAR_TUGAS: Tugas[] = [
  { id: "T1", judul: "Cari lokasi lahan", instruksi: "Temukan lahan di desa yang disebutkan fasilitator lalu tandai di peta." },
  { id: "T2", judul: "Analisis dengan uji tanah", instruksi: "Isi pH 5,5 dan tekstur lempung, pilih bulan tanam November, lalu jalankan analisis." },
  { id: "T3", judul: "Baca alasan rekomendasi", instruksi: "Sebutkan satu kelebihan dan satu hal yang perlu diperhatikan untuk tanaman peringkat 1." },
  { id: "T4", judul: "Tanaman untuk bulan tertentu", instruksi: "Temukan tanaman yang paling cocok ditanam pada bulan yang Anda pilih." },
  { id: "T5", judul: "Mulai pantau tanaman", instruksi: "Tandai bahwa Anda menanam salah satu tanaman, lalu buka halaman pemantauannya." },
  { id: "T6", judul: "Kirim masukan", instruksi: "Beri penilaian untuk rekomendasi yang Anda terima." },
];

export type HasilTugas = { id: string; berhasil: boolean | null; durasi_detik: number };

export type TesState = {
  peserta: string;
  tugasAktif: { id: string; mulai: number } | null;
  hasil: HasilTugas[];
  sus: number | null;
};

const TES_KOSONG: TesState = { peserta: "", tugasAktif: null, hasil: [], sus: null };

export function modeTesAktif(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY_MODE_TES) === "1";
}

export function setModeTes(aktif: boolean) {
  if (aktif) localStorage.setItem(KEY_MODE_TES, "1");
  else localStorage.removeItem(KEY_MODE_TES);
}

export function getTesState(): TesState {
  if (typeof window === "undefined") return TES_KOSONG;
  try {
    return { ...TES_KOSONG, ...JSON.parse(localStorage.getItem(KEY_TES_STATE) || "{}") };
  } catch {
    return TES_KOSONG;
  }
}

export function saveTesState(s: TesState) {
  localStorage.setItem(KEY_TES_STATE, JSON.stringify(s));
}

export function resetTesState() {
  localStorage.removeItem(KEY_TES_STATE);
  sessionStorage.removeItem(KEY_SESI); // peserta baru = sesi baru
}

// System Usability Scale, terjemahan Indonesia
export const PERTANYAAN_SUS = [
  "Saya rasa saya akan sering memakai aplikasi ini.",
  "Saya merasa aplikasi ini terlalu rumit.",
  "Saya merasa aplikasi ini mudah dipakai.",
  "Saya rasa saya butuh bantuan orang lain untuk bisa memakai aplikasi ini.",
  "Saya merasa fitur-fitur di aplikasi ini menyatu dengan baik.",
  "Saya merasa banyak hal yang tidak konsisten di aplikasi ini.",
  "Saya rasa kebanyakan orang akan cepat belajar memakai aplikasi ini.",
  "Saya merasa aplikasi ini merepotkan untuk dipakai.",
  "Saya merasa percaya diri memakai aplikasi ini.",
  "Saya perlu belajar banyak hal dulu sebelum bisa memakai aplikasi ini.",
];

export function hitungSus(jawaban: number[]): number {
  // jawaban 1-5; pertanyaan ganjil (indeks genap) positif, genap negatif
  const total = jawaban.reduce((acc, v, i) => acc + (i % 2 === 0 ? v - 1 : 5 - v), 0);
  return total * 2.5;
}
