"use client";

import { useState } from "react";

import Image from "next/image";

import TutorialModal from "@/components/TutorialModal";

export default function HomePage() {
  const [showRiwayat, setShowRiwayat] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* HERO */}
      <section className="px-4 pt-4">
        <div className="relative min-h-[220px] overflow-hidden rounded-3xl bg-gradient-to-b from-[#172F2C] to-[#3DA35D] p-6">
          <h1 className="relative z-10 max-w-[60%] font-display text-2xl font-extrabold leading-tight text-white">
            Kenali Tanahmu, Tanam Lebih{" "}
            <span className="bg-forest px-1.5 text-white">Beragam</span>
          </h1>
          {/* <a 
              href="/analisis" 
              className="relative z-10 mt-4 inline-block rounded-full bg-cream-light px-5 py-2.5 text-sm font-semibold text-forest-dark" 
            > 
              Coba Sekarang ↗ 
               
            </a> */}

          <div className="relative z-10 mt-4 flex items-center gap-2">
            <a
              href="/analisis"
              className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-white px-4 py-2 text-xs font-semibold text-forest-dark shadow-sm"
            >
              Coba Sekarang
            </a>

            <button
              type="button"
              onClick={() => setShowTutorial(true)}
              className="inline-flex items-center whitespace-nowrap rounded-full border-2 border-forest-dark bg-transparent px-[14px] py-[6px] text-xs font-semibold text-forest-dark"
            >
              Video Tutorial
            </button>
          </div>

          <div className="pointer-events-none absolute -top-16 -right-4 h-72 w-72">
            <Image
              src="/images/hand.png"
              alt="Tangan menabur tanah"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </section>

      {/* CEK REKOMENDASI 3 LANGKAH */}
      <section id="cara-pakai" className="flex-1 px-4 py-6">
        <h2 className="mb-6 text-center font-display text-lg font-extrabold text-forest-dark">
          Cek Rekomendasi Lahanmu dalam 3 Langkah
        </h2>

        <div className="space-y-0">
          {[
            {
              number: "01",
              title: "Langkah 1: Lengkapi informasi lahan",
              desc: "Tentukan lokasi lahan, rencana bulan tanam, dan hasil uji tanah kalau ada.",
            },
            {
              number: "02",
              title: "Langkah 2: Analisis cerdas Soilmate",
              desc: "Tunggu algoritma kami memproses data satelit dan lingkungan.",
            },
            {
              number: "03",
              title: "Langkah 3: Terima rekomendasi",
              desc: "Lihat hasil analisis kondisi lahan Anda dan tanaman yang direkomendasikan.",
            },
          ].map((step, i, arr) => (
            <div key={step.number} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 shrink-0 rounded-full bg-[#172F2C] p-1 shadow-md">
                  <div className="h-full w-full rounded-full bg-[#629560] p-[3px]">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-forest-dark">
                      <span className="font-display text-xs font-bold text-white">
                        {step.number}
                      </span>
                    </div>
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <div
                    className="-my-1 w-1 flex-1 bg-[#172F2C]"
                    style={{ minHeight: "48px" }}
                  />
                )}
              </div>

              <div className="flex-1 rounded-2xl bg-white p-4 shadow-lg mb-5">
                <h4 className="mb-1 font-display text-sm font-bold text-forest-dark">
                  {step.title}
                </h4>
                <p className="text-xs leading-relaxed text-forest-dark/70">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 rounded-2xl border-l-4 border-forest bg-white p-4 shadow-md">
          <h3 className="mb-1 font-display text-sm font-bold text-forest-dark">
            Tentang hasil Soilmate
          </h3>
          <p className="text-xs leading-relaxed text-forest-dark/80">
            Soilmate menilai kecocokan tanaman berdasarkan data terbuka (citra
            satelit Sentinel-2, iklim, dan tanah) dan syarat tumbuh dari
            literatur pertanian. Hasilnya adalah perkiraan untuk membantu
            memilih tanaman. Untuk keputusan penting, lakukan uji tanah atau
            konsultasikan dengan penyuluh pertanian.
          </p>
        </div>
      </section>

      <TutorialModal
        open={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </div>
  );
}
