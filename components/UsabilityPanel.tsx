"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { CheckCircle2, ClipboardList, Play, SkipForward, X, XCircle } from "lucide-react";
import {
  DAFTAR_TUGAS,
  getTesState,
  hitungSus,
  logEvent,
  modeTesAktif,
  PERTANYAAN_SUS,
  resetTesState,
  saveTesState,
  setModeTes,
  TesState,
} from "@/lib/usability";

// Panel untuk fasilitator usability test. Hanya muncul kalau mode tes aktif (?tes=1).
export default function UsabilityPanel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [aktif, setAktif] = useState(false);
  const [buka, setBuka] = useState(false);
  const [state, setState] = useState<TesState>(getTesState());
  const [layar, setLayar] = useState<"tugas" | "sus">("tugas");
  const [jawaban, setJawaban] = useState<number[]>(Array(10).fill(0));
  const [detik, setDetik] = useState(0);

  // Aktif/nonaktif lewat query ?tes=1 / ?tes=0
  useEffect(() => {
    const q = searchParams.get("tes");
    if (q === "1") setModeTes(true);
    if (q === "0") setModeTes(false);
    setAktif(modeTesAktif());
    setState(getTesState());
  }, [searchParams]);

  // Catat setiap perpindahan halaman
  useEffect(() => {
    logEvent("halaman_dibuka", { path: pathname });
  }, [pathname]);

  // Timer tugas aktif
  useEffect(() => {
    if (!state.tugasAktif) return;
    const t = setInterval(() => setDetik(Math.round((Date.now() - state.tugasAktif!.mulai) / 1000)), 1000);
    return () => clearInterval(t);
  }, [state.tugasAktif]);

  if (!aktif) return null;

  const update = (s: TesState) => {
    setState(s);
    saveTesState(s);
  };

  const mulai = (id: string) => {
    if (!state.peserta.trim()) {
      alert("Isi kode peserta dulu, misalnya P01.");
      return;
    }
    update({ ...state, tugasAktif: { id, mulai: Date.now() } });
    setDetik(0);
    logEvent("tugas_mulai", {}, id);
    setBuka(false);
  };

  const akhiri = (berhasil: boolean | null) => {
    if (!state.tugasAktif) return;
    const durasi = Math.round((Date.now() - state.tugasAktif.mulai) / 1000);
    const id = state.tugasAktif.id;
    logEvent("tugas_selesai", { berhasil, durasi_detik: durasi, dilewati: berhasil === null }, id);
    update({
      ...state,
      tugasAktif: null,
      hasil: [...state.hasil.filter((h) => h.id !== id), { id, berhasil, durasi_detik: durasi }],
    });
  };

  const kirimSus = () => {
    if (jawaban.some((j) => j === 0)) {
      alert("Semua pertanyaan perlu dijawab.");
      return;
    }
    const skor = hitungSus(jawaban);
    logEvent("sus", { jawaban, skor });
    update({ ...state, sus: skor });
    setLayar("tugas");
  };

  const pesertaBaru = () => {
    if (!confirm("Mulai peserta baru? Catatan peserta ini di layar akan dihapus (log di server tetap ada).")) return;
    resetTesState();
    setState(getTesState());
    setJawaban(Array(10).fill(0));
  };

  const tugasAktif = DAFTAR_TUGAS.find((t) => t.id === state.tugasAktif?.id);
  const berhasilCount = state.hasil.filter((h) => h.berhasil).length;

  return (
    <>
      {/* Bar tugas aktif, tidak menutupi konten utama */}
      {tugasAktif ? (
        <div className="fixed bottom-[60px] left-0 right-0 z-[45] mx-auto flex w-full max-w-[420px] items-center gap-2 bg-forest-dark px-3 py-2 text-xs text-white">
          <span className="flex-1 truncate">
            <b>{tugasAktif.id}</b> {tugasAktif.judul}{" "}
            <span className="opacity-70">({detik} dtk)</span>
          </span>
          <button onClick={() => akhiri(true)} aria-label="Berhasil" className="rounded bg-[#5E8C3A] p-1.5">
            <CheckCircle2 className="h-4 w-4" />
          </button>
          <button onClick={() => akhiri(false)} aria-label="Gagal" className="rounded bg-alert p-1.5">
            <XCircle className="h-4 w-4" />
          </button>
          <button onClick={() => akhiri(null)} aria-label="Lewati" className="rounded bg-white/20 p-1.5">
            <SkipForward className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setBuka(true)}
          className="fixed bottom-[72px] right-[max(12px,calc(50%-198px))] z-[45] flex items-center gap-1 rounded-full bg-forest-dark px-3 py-2 text-xs font-semibold text-white shadow-lg"
        >
          <ClipboardList className="h-4 w-4" /> Tes
        </button>
      )}

      {buka && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40">
          <div className="max-h-[85dvh] w-full max-w-[420px] overflow-y-auto rounded-t-2xl bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-forest-dark">
                {layar === "tugas" ? "Mode tes usability" : "Kuesioner SUS"}
              </h2>
              <button onClick={() => setBuka(false)} aria-label="Tutup">
                <X className="h-5 w-5 text-forest-dark" />
              </button>
            </div>

            {layar === "tugas" ? (
              <>
                <label className="mb-3 block text-xs font-bold text-forest-dark">
                  Kode peserta
                  <input
                    value={state.peserta}
                    onChange={(e) => update({ ...state, peserta: e.target.value })}
                    placeholder="P01"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal outline-none focus:border-forest"
                  />
                </label>

                <ul className="space-y-2">
                  {DAFTAR_TUGAS.map((t) => {
                    const h = state.hasil.find((x) => x.id === t.id);
                    return (
                      <li key={t.id} className="rounded-xl border border-gray-200 p-3">
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-forest-dark">
                              {t.id}. {t.judul}
                            </p>
                            <p className="text-xs text-forest-dark/70">{t.instruksi}</p>
                            {h && (
                              <p className={`mt-1 text-xs font-semibold ${h.berhasil ? "text-forest" : h.berhasil === false ? "text-alert" : "text-forest-dark/50"}`}>
                                {h.berhasil ? "Berhasil" : h.berhasil === false ? "Gagal" : "Dilewati"} dalam {h.durasi_detik} detik
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => mulai(t.id)}
                            className="flex shrink-0 items-center gap-1 rounded-full bg-forest px-3 py-1.5 text-xs font-semibold text-white"
                          >
                            <Play className="h-3 w-3" /> {h ? "Ulang" : "Mulai"}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-4 rounded-xl bg-cream p-3 text-xs text-forest-dark">
                  Berhasil {berhasilCount} dari {state.hasil.length} tugas dikerjakan.
                  {state.sus != null && <> Skor SUS: <b>{state.sus}</b></>}
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setLayar("sus")}
                    className="flex-1 rounded-full bg-forest py-2.5 text-xs font-semibold text-white"
                  >
                    Isi kuesioner SUS
                  </button>
                  <button
                    onClick={pesertaBaru}
                    className="flex-1 rounded-full border-2 border-forest py-2.5 text-xs font-semibold text-forest"
                  >
                    Peserta baru
                  </button>
                </div>
                <p className="mt-3 text-center text-[11px] text-forest-dark/50">Matikan mode tes: buka URL dengan ?tes=0</p>
              </>
            ) : (
              <>
                <p className="mb-3 text-xs text-forest-dark/70">1 = sangat tidak setuju, 5 = sangat setuju</p>
                <ol className="space-y-3">
                  {PERTANYAAN_SUS.map((q, i) => (
                    <li key={i}>
                      <p className="mb-1.5 text-sm text-forest-dark">
                        {i + 1}. {q}
                      </p>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <button
                            key={v}
                            onClick={() => setJawaban((j) => j.map((x, k) => (k === i ? v : x)))}
                            aria-pressed={jawaban[i] === v}
                            className={`rounded-lg border py-2 text-sm font-semibold ${
                              jawaban[i] === v ? "border-forest-dark bg-forest-dark text-white" : "border-gray-300 text-forest-dark"
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => setLayar("tugas")} className="flex-1 rounded-full border-2 border-forest py-2.5 text-xs font-semibold text-forest">
                    Kembali
                  </button>
                  <button onClick={kirimSus} className="flex-1 rounded-full bg-forest py-2.5 text-xs font-semibold text-white">
                    Simpan jawaban
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
