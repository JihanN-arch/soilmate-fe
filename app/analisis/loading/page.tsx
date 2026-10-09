"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Circle, Loader2, X } from "lucide-react";

import StepProgress from "@/components/StepProgress";
import Modal from "@/components/Modal";

import {
  AnalisisPayload,
  ApiError,
  getAnalisisJob,
  JobStatus,
  normalizeHasil,
  PerluInputError,
  postAnalisisLahan,
  RecommendResponse,
  startAnalisisJob,
  StatusProgres,
  STORAGE_KEY_FORM,
  STORAGE_KEY_JOB,
  STORAGE_KEY_PERLU_INPUT,
  STORAGE_KEY_RESULT,
} from "@/lib/api";
import { labelProgres } from "@/lib/labels";
import { logEvent } from "@/lib/usability";

const POLL_MS = 1500;
const BATAS_WAKTU_MS = 3 * 60 * 1000;

// Ditampilkan sebelum BE mengirim progres pertama
const PROGRES_AWAL: Record<string, StatusProgres> = {
  tanah: "menunggu",
  iklim: "menunggu",
  elevasi: "menunggu",
  satelit: "menunggu",
  model: "menunggu",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function IkonProgres({ s }: { s: StatusProgres }) {
  switch (s) {
    case "selesai":
      return <Check className="h-4 w-4 text-white" />;
    case "berjalan":
      return <Loader2 className="h-4 w-4 animate-spin text-white" />;
    case "cadangan":
      return <AlertTriangle className="h-4 w-4 text-sand" />;
    case "gagal":
      return <X className="h-4 w-4 text-[#FFB4A8]" />;
    default:
      return <Circle className="h-4 w-4 text-white/50" />;
  }
}

const KET_PROGRES: Partial<Record<StatusProgres, string>> = {
  cadangan: "pakai data cadangan",
  gagal: "tidak tersedia",
  berjalan: "mengambil...",
};

export default function LoadingPage() {
  const router = useRouter();
  const [progres, setProgres] = useState<Record<string, StatusProgres>>(PROGRES_AWAL);
  const [statusJob, setStatusJob] = useState<JobStatus["status"]>("antri");
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const started = useRef(false);
  const aktif = useRef(true);

  useEffect(() => {
    aktif.current = true;
    if (started.current) return;
    started.current = true;

    const raw = sessionStorage.getItem(STORAGE_KEY_FORM);
    if (!raw) {
      router.push("/analisis");
      return;
    }
    const payload: AnalisisPayload = JSON.parse(raw);

    const t0 = Date.now();
    const selesai = (data: RecommendResponse) => {
      logEvent("analisis_selesai", {
        durasi_detik: Math.round((Date.now() - t0) / 1000),
        kualitas_data: data.recommendation.kondisi_lahan.kualitas_data?.label ?? null,
      });
      sessionStorage.setItem(STORAGE_KEY_RESULT, JSON.stringify(data));
      sessionStorage.removeItem(STORAGE_KEY_JOB);
      setTimeout(() => router.push("/analisis/hasil"), 600);
    };

    const perluInput = (butuh: string[]) => {
      logEvent("perlu_input", { butuh_input: butuh });
      sessionStorage.setItem(STORAGE_KEY_PERLU_INPUT, JSON.stringify(butuh));
      sessionStorage.removeItem(STORAGE_KEY_JOB);
      router.replace("/analisis?perlu_input=1");
    };

    const gagal = (msg: string) => {
      logEvent("analisis_gagal", { pesan: msg });
      sessionStorage.removeItem(STORAGE_KEY_JOB);
      setErrorMessage(msg);
      setShowError(true);
    };

    const jalankan = async () => {
      try {
        // Lanjutkan job yang sama kalau halaman di-refresh
        let jobId = sessionStorage.getItem(STORAGE_KEY_JOB);
        if (!jobId) {
          try {
            jobId = await startAnalisisJob(payload);
            sessionStorage.setItem(STORAGE_KEY_JOB, jobId);
          } catch (e) {
            // Endpoint asinkron belum ada di server ini → pakai endpoint lama
            if (e instanceof ApiError && (e.status === 404 || e.status === 405)) {
              const data = await postAnalisisLahan(payload);
              setProgres((p) => Object.fromEntries(Object.keys(p).map((k) => [k, "selesai"])));
              selesai(data);
              return;
            }
            throw e;
          }
        }

        const mulai = Date.now();
        while (aktif.current) {
          const job = await getAnalisisJob(jobId, payload.anonymous_id);
          if (!aktif.current) return;
          setStatusJob(job.status);
          if (job.progres && Object.keys(job.progres).length) setProgres(job.progres);

          if (job.status === "selesai") {
            if (!job.hasil) throw new Error("Analisis selesai tapi hasilnya kosong. Coba lagi.");
            selesai(normalizeHasil(job.hasil));
            return;
          }
          if (job.status === "perlu_input") {
            perluInput(job.butuh_input ?? ["ph", "tekstur_kelas"]);
            return;
          }
          if (job.status === "gagal") {
            gagal(
              job.pesan ||
                job.message ||
                job.error ||
                "Data iklim atau ketinggian untuk lokasi ini tidak tersedia. Coba lagi beberapa saat lagi."
            );
            return;
          }
          if (Date.now() - mulai > BATAS_WAKTU_MS) {
            gagal("Analisis terlalu lama. Server mungkin sedang sibuk; coba lagi beberapa saat lagi.");
            return;
          }
          await sleep(POLL_MS);
        }
      } catch (err) {
        if (!aktif.current) return;
        if (err instanceof PerluInputError) {
          perluInput(err.butuhInput);
          return;
        }
        console.error("Gagal analisis:", err);
        gagal(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui.");
      }
    };

    jalankan();
    return () => {
      aktif.current = false;
    };
  }, [router]);

  const entries = Object.entries(progres);
  const adaCadangan = entries.some(([, s]) => s === "cadangan");
  const judul =
    statusJob === "antri" ? "Menunggu giliran..." : statusJob === "selesai" ? "Selesai!" : "Menganalisis lahan Anda...";

  const coba = () => {
    sessionStorage.removeItem(STORAGE_KEY_JOB);
    window.location.reload();
  };

  return (
    <div className="flex h-full min-h-full flex-col bg-white">
      <StepProgress step={2} label="Langkah 2: Analisis Cerdas Soilmate" />
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-sm rounded-2xl bg-loadingCard p-8 text-center text-white">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white">
            {statusJob === "selesai" ? (
              <Check className="h-7 w-7 text-loadingCard" />
            ) : (
              <Loader2 className="h-7 w-7 animate-spin text-loadingCard" />
            )}
          </div>
          <h2 className="mb-5 font-display text-base font-bold" aria-live="polite">
            {judul}
          </h2>
          <ul className="mx-auto max-w-xs space-y-2.5 text-left">
            {entries.map(([k, s]) => (
              <li key={k} className="flex items-center gap-2 text-sm">
                <IkonProgres s={s} />
                <span className={s === "menunggu" ? "text-white/70" : ""}>{labelProgres(k)}</span>
                {KET_PROGRES[s] && (
                  <span className={`ml-auto text-[11px] ${s === "cadangan" ? "text-sand" : "text-white/70"}`}>
                    {KET_PROGRES[s]}
                  </span>
                )}
              </li>
            ))}
          </ul>
          {adaCadangan && (
            <p className="mt-5 rounded-lg bg-white/15 px-3 py-2 text-left text-xs leading-relaxed">
              Sebagian sumber data sedang tidak bisa diakses, jadi dipakai data tersimpan atau dari wilayah
              terdekat. Keterangannya ada di halaman hasil.
            </p>
          )}
          <p className="mt-5 text-xs text-white/70">Biasanya 10–60 detik.</p>
        </div>
      </section>

      <Modal
        open={showError}
        onClose={() => router.push("/analisis")}
        variant="error"
        title="Gagal Memuat Data Lahan"
        description={
          errorMessage ||
          "Koneksi ke server data satelit atau cuaca sedang terganggu. Periksa koneksi internet Anda atau coba beberapa saat lagi."
        }
        onConfirm={coba}
      />
    </div>
  );
}
