"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ChevronRight, Search, Sprout } from "lucide-react";
import KesehatanBadge from "@/components/KesehatanBadge";
import { getAnonymousId } from "@/lib/anonymousId";
import {
  getCropImage,
  getLahanList,
  getRiwayatPage,
  Lahan,
  getRiwayatDetail,
  namaRiwayat,
  riwayatDetailToResponse,
  RiwayatItem,
  STORAGE_KEY_RESULT,
} from "@/lib/api";
import { hariSejak, tanggal } from "@/lib/format";

type Tab = "semua" | "ditanam";

function RiwayatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(
    searchParams.get("tab") === "ditanam" ? "ditanam" : "semua",
  );

  const [items, setItems] = useState<RiwayatItem[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const observerRef = useRef<HTMLDivElement>(null);

  const [lahan, setLahan] = useState<Lahan[] | null>(null);
  const [errLahan, setErrLahan] = useState("");
  const [membuka, setMembuka] = useState<number | null>(null);

  const loadPage = useCallback((pageNum: number) => {
    setLoading(true);
    getRiwayatPage(getAnonymousId(), pageNum)
      .then((data) => {
        setItems((prev) =>
          pageNum === 1 ? data.results : [...prev, ...data.results],
        );
        setHasNext(data.next !== null);
      })
      .catch(() => {
        setError(
          "Gagal memuat riwayat. Periksa koneksi lalu buka lagi halaman ini.",
        );
        setHasNext(false); // hentikan infinite scroll supaya tidak terus meminta halaman berikutnya
      })
      .finally(() => {
        setLoading(false);
        setInitialLoading(false);
      });
  }, []);

  useEffect(() => {
    loadPage(1);
    getLahanList(getAnonymousId(), "aktif")
      .then(setLahan)
      .catch(() => {
        setLahan([]);
        setErrLahan("Gagal memuat lahan yang sedang ditanam.");
      });
  }, [loadPage]);

  useEffect(() => {
    if (tab !== "semua" || !observerRef.current || !hasNext || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          loadPage(nextPage);
        }
      },
      { threshold: 1.0 },
    );
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasNext, loading, page, loadPage, tab]);

  const gantiTab = (t: Tab) => {
    setTab(t);
    router.replace(t === "ditanam" ? "/riwayat?tab=ditanam" : "/riwayat", {
      scroll: false,
    });
  };

  // nama tanaman yang sedang ditanam per riwayat (dari lahan_aktif BE)
  const namaDitanam = (item: RiwayatItem): string[] =>
    (item.lahan_aktif ?? []).map((la) => {
      const r = item.rekomendasi.find(
        (x) => Number(x.rekomendasi_id ?? x.id) === la.rekomendasi_id,
      );
      return r?.nama ?? r?.nama_tanaman ?? la.crop_slug.replace(/_/g, " ");
    });

  const q = search.toLowerCase();
  const filtered = items.filter((item) =>
    namaRiwayat(item).toLowerCase().includes(q),
  );
  const lahanFiltered = (lahan ?? []).filter(
    (l) =>
      l.nama_tanaman.toLowerCase().includes(q) ||
      (l.nama_lokasi ?? "").toLowerCase().includes(q),
  );

  // Ambil detail lengkap (bentuk sama dengan hasil analisis) sebelum membuka halaman hasil
  const handleItemClick = async (item: RiwayatItem) => {
    const id = item.riwayat_id ?? item.id;
    setMembuka(id);
    setError("");
    try {
      const detail = await getRiwayatDetail(id, getAnonymousId());
      sessionStorage.setItem(
        STORAGE_KEY_RESULT,
        JSON.stringify(riwayatDetailToResponse(detail)),
      );
      router.push(`/analisis/hasil?riwayat=${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal membuka riwayat.");
      setMembuka(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white px-4 py-4">
      <h1 className="mb-4 text-center font-display text-lg font-bold text-forest-dark">
        Lahan Saya
      </h1>

      <div
        className="mb-3 grid grid-cols-2 rounded-full bg-cream p-1 text-xs font-semibold"
        role="tablist"
      >
        <button
          role="tab"
          aria-selected={tab === "semua"}
          onClick={() => gantiTab("semua")}
          className={`rounded-full py-2 ${tab === "semua" ? "bg-[#629460] text-white" : "text-forest-dark"}`}
        >
          Riwayat analisis
        </button>
        <button
          role="tab"
          aria-selected={tab === "ditanam"}
          onClick={() => gantiTab("ditanam")}
          className={`rounded-full py-2 ${tab === "ditanam" ? "bg-[#629460] text-white" : "text-forest-dark"}`}
        >
          Sedang ditanam{lahan && lahan.length > 0 ? ` (${lahan.length})` : ""}
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={
            tab === "semua" ? "Cari nama lahan" : "Cari tanaman atau lahan"
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-forest-dark outline-none focus:border-forest"
        />
      </div>

      {tab === "semua" ? (
        <>
          {initialLoading && (
            <p className="text-center text-sm text-forest-dark/50">Memuat...</p>
          )}
          {error && <p className="text-center text-sm text-alert">{error}</p>}
          {!initialLoading && !error && filtered.length === 0 && (
            <p className="text-center text-sm text-forest-dark/50">
              {search
                ? "Tidak ada riwayat yang cocok."
                : "Belum ada riwayat. Mulai dari menu Analisis."}
            </p>
          )}

          <div className="space-y-3 pb-4">
            {filtered.map((item, i) => {
              const ditanam = namaDitanam(item);
              const id = item.riwayat_id ?? item.id;
              return (
                <button
                  key={id}
                  onClick={() => handleItemClick(item)}
                  disabled={membuka !== null}
                  className={`flex w-full items-stretch overflow-hidden rounded-2xl bg-white shadow-md ${membuka === id ? "opacity-60" : ""}`}
                >
                  <span
                    className={`flex w-10 shrink-0 items-center justify-center font-display text-lg font-bold text-white ${
                      ditanam.length ? "bg-[#172F2C]" : "bg-[#629460]"
                    }`}
                  >
                    {ditanam.length ? <Sprout className="h-5 w-5" /> : i + 1}
                  </span>
                  <span className="flex flex-1 items-center gap-2 px-3 py-3">
                    <span className="flex-1 text-left text-xs text-forest-dark">
                      <span className="block font-semibold">
                        {namaRiwayat(item)}
                      </span>
                      {item.rekomendasi[0] && (
                        <span className="block text-forest-dark/60">
                          Teratas:{" "}
                          {item.rekomendasi[0].nama ??
                            item.rekomendasi[0].nama_tanaman}{" "}
                          (
                          {Math.round(
                            item.rekomendasi[0].skor_kesesuaian * 100,
                          )}
                          %)
                        </span>
                      )}
                      <span className="block text-forest-dark/60">
                        {membuka === id
                          ? "Membuka..."
                          : tanggal(item.dibuat_pada)}
                      </span>
                      {ditanam.length > 0 && (
                        <span className="mt-1 inline-block rounded-full bg-[#DDEBC8] px-2 py-0.5 text-[10px] font-semibold capitalize text-[#2F4A12]">
                          Sedang ditanam: {ditanam.join(", ")}
                        </span>
                      )}
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-forest-dark/40" />
                  </span>
                </button>
              );
            })}
          </div>

          {hasNext && !search && (
            <div
              ref={observerRef}
              className="py-4 text-center text-xs text-forest-dark/40"
            >
              {loading ? "Memuat lebih banyak..." : ""}
            </div>
          )}
        </>
      ) : (
        <>
          {lahan === null && (
            <p className="text-center text-sm text-forest-dark/50">Memuat...</p>
          )}
          {errLahan && (
            <p className="text-center text-sm text-alert">{errLahan}</p>
          )}
          {lahan !== null && !errLahan && lahanFiltered.length === 0 && (
            <div className="rounded-2xl bg-cream p-5 text-center">
              <Sprout className="mx-auto mb-2 h-8 w-8 text-forest" />
              <p className="text-sm font-semibold text-forest-dark">
                {search
                  ? "Tidak ada yang cocok."
                  : "Belum ada tanaman yang dipantau"}
              </p>
              {!search && (
                <p className="mt-1 text-xs leading-relaxed text-forest-dark/70">
                  Buka hasil analisis, pilih tanaman, lalu ketuk{" "}
                  <b>Saya menanam ini</b>. Kondisinya akan dipantau lewat
                  satelit dan prakiraan cuaca.
                </p>
              )}
            </div>
          )}

          <div className="space-y-3 pb-4">
            {lahanFiltered.map((l) => {
              const umur = hariSejak(l.tanggal_tanam);
              return (
                <button
                  key={l.id}
                  onClick={() => router.push(`/lahan/${l.id}`)}
                  className="flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-gray-200 border-l-[6px] border-l-[#3DA35D] bg-white p-2 text-left shadow-md"
                >
                  <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    <Image
                      src={getCropImage(l.crop_slug ?? l.nama_tanaman)}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </span>
                  <span className="min-w-0 flex-1 text-xs text-forest-dark">
                    <span className="block font-display text-sm font-bold">
                      {l.nama_tanaman}
                    </span>
                    {l.nama_lokasi && (
                      <span className="block truncate text-forest-dark/60">
                        {l.nama_lokasi}
                      </span>
                    )}
                    <span className="block text-forest-dark/60">
                      {umur != null && umur >= 0
                        ? `Hari ke-${umur + 1}`
                        : `Rencana tanam ${tanggal(l.tanggal_tanam)}`}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-1.5">
                      <KesehatanBadge kesehatan={l.kesehatan} />
                      {l.peringatan.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8A5A00]">
                          <AlertTriangle className="h-3.5 w-3.5" />{" "}
                          {l.peringatan.length} peringatan
                        </span>
                      )}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-forest-dark/40" />
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function RiwayatPage() {
  return (
    <Suspense fallback={null}>
      <RiwayatContent />
    </Suspense>
  );
}
