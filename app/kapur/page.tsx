"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight, ChevronRight, ClipboardEdit, Clock, FlaskConical, History, Info, Loader2, MapPin, RotateCcw,
} from "lucide-react";

import LuasLahanInput from "@/components/LuasLahanInput";
import SectionCard from "@/components/SectionCard";
import {
  ApiError,
  getRiwayatDetail,
  getRiwayatPage,
  namaRiwayat,
  PerubahanSkor,
  postSimulasiKapur,
  RecommendResponse,
  RiwayatItem,
  SimulasiKapurPayload,
  SimulasiKapurResponse,
  STORAGE_KEY_FORM,
  STORAGE_KEY_RESULT,
} from "@/lib/api";
import { getAnonymousId } from "@/lib/anonymousId";
import { rupiah, tanggal } from "@/lib/format";
import { labelTekstur, TEKSTUR_OPTIONS } from "@/lib/labels";
import { DEFAULT_M2_PER_BATA, keM2, SatuanLuas } from "@/lib/luas";
import { logEvent } from "@/lib/usability";

const JENIS_KAPUR = [
  { value: "dolomit", label: "Dolomit", ket: "Paling umum, juga menambah magnesium" },
  { value: "kalsit", label: "Kalsit (kapur pertanian)", ket: "Kapur karbonat biasa" },
  { value: "kapur_tohor", label: "Kapur tohor", ket: "Reaksi cepat, hati-hati saat menabur" },
] as const;

type Sumber = "pilih" | "analisis" | "manual";
type Status = "idle" | "loading" | "segera" | "ulang" | "error" | "ok";
type LahanTerpilih = { riwayatId: number; ph: number; nama: string; luasM2?: number };

const num = (s: string) => Number(s.replace(",", "."));

function normalPerubahan(p: SimulasiKapurResponse["perubahan_skor"]): PerubahanSkor[] {
  const arr = Array.isArray(p) ? p : Object.entries(p ?? {}).map(([id, v]) => ({ id, ...v }));
  return arr.map((x) => ({ ...x, selisih: x.selisih ?? x.sesudah - x.sebelum })).sort((a, b) => b.selisih - a.selisih);
}

function KapurContent() {
  const searchParams = useSearchParams();
  const [sumber, setSumber] = useState<Sumber>("pilih");

  // Mode analisis
  const [lahan, setLahan] = useState<LahanTerpilih | null>(null);
  const [daftar, setDaftar] = useState<RiwayatItem[] | null>(null);
  const [errDaftar, setErrDaftar] = useState("");

  // Mode manual
  const [ph, setPh] = useState("");
  const [tekstur, setTekstur] = useState("");
  const [cOrg, setCOrg] = useState("");
  const [luas, setLuas] = useState({ nilai: "", satuan: "m2" as SatuanLuas, m2PerBata: String(DEFAULT_M2_PER_BATA) });
  const [lokasi, setLokasi] = useState<{ lat: number; lon: number } | null>(null);
  const [gps, setGps] = useState(false);

  // Bersama
  const [mode, setMode] = useState<"target" | "dosis">("target");
  const [targetPh, setTargetPh] = useState("6,5");
  const [dosis, setDosis] = useState("1");
  const [jenis, setJenis] = useState<SimulasiKapurPayload["jenis_kapur"]>("dolomit");
  const [status, setStatus] = useState<Status>("idle");
  const [pesan, setPesan] = useState("");
  const [hasil, setHasil] = useState<SimulasiKapurResponse | null>(null);

  // Dibuka dari halaman hasil (?riwayat=ID) → langsung pakai lahan itu
  useEffect(() => {
    const rid = Number(searchParams.get("riwayat"));
    if (!rid) return;
    setSumber("analisis");
    try {
      const res: RecommendResponse = JSON.parse(sessionStorage.getItem(STORAGE_KEY_RESULT) || "null");
      if (res?.recommendation.riwayat_id === rid) {
        const f = JSON.parse(sessionStorage.getItem(STORAGE_KEY_FORM) || "{}");
        setLahan({ riwayatId: rid, ph: res.recommendation.kondisi_lahan.ph_tanah, nama: f.nama_lokasi || "Lahan terakhir", luasM2: f.luas_lahan_m2 });
        return;
      }
    } catch {}
    getRiwayatDetail(rid, getAnonymousId())
      .then((r) => setLahan({ riwayatId: r.riwayat_id, ph: r.kondisi_lahan.ph_tanah, nama: r.nama_lokasi, luasM2: r.luas_lahan_m2 ?? undefined }))
      .catch(() => {});
  }, [searchParams]);

  // Muat daftar riwayat saat mode analisis dipilih tanpa lahan
  useEffect(() => {
    if (sumber !== "analisis" || lahan || daftar) return;
    getRiwayatPage(getAnonymousId(), 1)
      .then((d) => setDaftar(d.results))
      .catch(() => setErrDaftar("Gagal memuat riwayat analisis."));
  }, [sumber, lahan, daftar]);

  const [memuatLahan, setMemuatLahan] = useState<number | null>(null);
  const pilihRiwayat = async (r: RiwayatItem) => {
    const id = r.riwayat_id ?? r.id;
    if (typeof r.ph_tanah === "number") {
      setLahan({ riwayatId: id, ph: r.ph_tanah, nama: namaRiwayat(r), luasM2: r.luas_lahan_m2 ?? undefined });
      return;
    }
    setMemuatLahan(id);
    try {
      const d = await getRiwayatDetail(id, getAnonymousId());
      setLahan({ riwayatId: id, ph: d.kondisi_lahan.ph_tanah, nama: d.nama_lokasi, luasM2: d.luas_lahan_m2 ?? undefined });
    } catch (e) {
      setErrDaftar(e instanceof Error ? e.message : "Gagal membuka lahan.");
    } finally {
      setMemuatLahan(null);
    }
  };

  const pilihSumber = (s: Sumber) => {
    setSumber(s);
    setStatus("idle");
    setHasil(null);
    setPesan("");
    if (s !== "pilih") logEvent("kapur_pilih_sumber", { sumber: s });
  };

  const phAwal = sumber === "analisis" ? lahan?.ph ?? null : ph.trim() ? num(ph) : null;

  const ambilLokasi = () => {
    if (!navigator.geolocation) return;
    setGps(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLokasi({ lat: Number(p.coords.latitude.toFixed(5)), lon: Number(p.coords.longitude.toFixed(5)) });
        setGps(false);
      },
      () => setGps(false),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const gagal = (m: string) => {
    setPesan(m);
    setStatus("error");
  };

  const jalankan = async () => {
    const body: SimulasiKapurPayload = { anonymous_id: getAnonymousId(), jenis_kapur: jenis };

    if (sumber === "analisis") {
      if (!lahan) return gagal("Pilih lahan dulu.");
      body.riwayat_id = lahan.riwayatId;
      if (lahan.luasM2) body.luas_lahan_m2 = lahan.luasM2;
    } else {
      const p = num(ph);
      if (!ph.trim() || Number.isNaN(p) || p < 3 || p > 10) return gagal("Isi pH tanah (angka 3–10).");
      const c = cOrg.trim() ? num(cOrg) : null;
      if (c !== null && (Number.isNaN(c) || c < 0 || c > 60)) return gagal("C-organik harus angka persen (0–60).");
      body.uji_tanah = { ph: p, ...(tekstur ? { tekstur_kelas: tekstur } : {}), ...(c !== null ? { c_organik_persen: c } : {}) };
      if (luas.nilai.trim()) {
        const a = num(luas.nilai);
        if (!(a > 0)) return gagal("Luas lahan harus angka lebih dari 0.");
        body.luas_lahan_m2 = Math.round(keM2(a, luas.satuan, num(luas.m2PerBata) || DEFAULT_M2_PER_BATA));
      }
      if (lokasi) {
        body.lat = lokasi.lat;
        body.lon = lokasi.lon;
      }
    }

    if (mode === "target") {
      const t = num(targetPh);
      if (phAwal !== null && !(t > phAwal && t <= 8))
        return gagal(`Target pH harus lebih tinggi dari pH sekarang (${phAwal}) dan paling tinggi 8.`);
      body.target_ph = t;
    } else {
      const d = num(dosis);
      if (!(d > 0 && d <= 20)) return gagal("Dosis harus antara 0 dan 20 ton per hektar.");
      body.dosis_ton_ha = d;
    }

    setStatus("loading");
    setPesan("");
    try {
      const r = await postSimulasiKapur(body);
      setHasil(r);
      setStatus("ok");
      logEvent("simulasi_kapur", { sumber, mode, jenis, pakai_lokasi: Boolean(body.lat), mode_contoh: Boolean(r.mode_contoh) });
    } catch (e) {
      const st = e instanceof ApiError ? e.status : null;
      logEvent("simulasi_kapur_gagal", { sumber, status: st });
      if (st === 501) setStatus("segera");
      else if (st === 409) setStatus("ulang");
      else gagal(e instanceof Error ? e.message : "Simulasi gagal. Coba lagi.");
    }
  };

  const perubahan = hasil ? normalPerubahan(hasil.perubahan_skor) : [];
  const catatan = hasil?.catatan ? (Array.isArray(hasil.catatan) ? hasil.catatan : [hasil.catatan]) : [];
  const keb = hasil?.kebutuhan_kapur;
  const dml = hasil?.detail_ml ?? null;
  const angka = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
  const dosisMinimal = angka(dml?.dosis_penetral_al_ton_ha);
  const alAwal = angka(dml?.al_dd_awal);
  const alBaru = angka(dml?.al_dd_baru);
  const lamaEfek = angka(dml?.estimasi_lama_efek_tahun);
  const teksturDipakai = typeof dml?.tekstur_dipakai === "string" ? dml.tekstur_dipakai : null;
  const fmtDosis = (v: number) => v.toLocaleString("id-ID", { maximumFractionDigits: 2 });
  const luasDipakai = keb?.luas_lahan_m2 ?? null;
  const rgOk = (r?: { min: number; max: number } | null) =>
    r && Number.isFinite(r.min) && Number.isFinite(r.max) ? r : null;
  const fmtRg = (r: { min: number; max: number }, satuan = "") =>
    r.min === r.max ? `${rupiah(r.min)}${satuan}` : `${rupiah(r.min)} – ${rupiah(r.max)}${satuan}`;
  const hargaRg = rgOk(keb?.harga_per_kg_rentang);
  const biayaLahanRg = rgOk(keb?.perkiraan_biaya_rentang);
  const biayaHaRg = rgOk(keb?.perkiraan_biaya_per_ha_rentang);
  // cadangan untuk respons lama yang hanya punya satu angka
  const biayaTunggal = !biayaLahanRg && !biayaHaRg && keb?.perkiraan_biaya != null ? keb.perkiraan_biaya : null;
  const adaHarga = Boolean(hargaRg || biayaLahanRg || biayaHaRg || biayaTunggal != null);
  const namaJenis = JENIS_KAPUR.find((j) => j.value === jenis)?.label ?? "kapur ini";
  const kgLahan = (tonHa: number) =>
    luasDipakai ? `${Math.round(tonHa * 1000 * (luasDipakai / 10000)).toLocaleString("id-ID")} kg` : null;
  const modeContoh = Boolean(hasil?.mode_contoh || hasil?.detail_ml?.metode === "contoh");
  // Catatan "ANGKA CONTOH ..." sudah diwakili label di atas; sisanya (mis. asumsi tekstur) ditampilkan sebagai daftar
  const catatanLain = catatan.filter((c) => !/^\s*angka contoh/i.test(c));
  const inputCls = "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal text-forest-dark outline-none focus:border-forest";

  // ---------- Tampilan status khusus ----------
  const kartuStatus = (ikon: React.ReactNode, judul: string, isi: React.ReactNode, aksi: React.ReactNode, warna = "bg-cream") => (
    <div className={`rounded-2xl ${warna} p-6 text-center`}>
      {ikon}
      <p className="font-semibold text-forest-dark">{judul}</p>
      <div className="mt-1 text-xs leading-relaxed text-forest-dark/70">{isi}</div>
      <div className="mt-4">{aksi}</div>
    </div>
  );

  const kembaliKeForm = (
    <button onClick={() => setStatus("idle")} className="text-xs font-semibold text-forest underline">Kembali</button>
  );

  return (
    <div className="flex min-h-screen flex-col bg-white px-4 py-4">
      <h1 className="mb-1 flex items-center gap-2 font-display text-lg font-bold text-forest-dark">
        <FlaskConical className="h-5 w-5 text-forest" /> Simulasi pengapuran
      </h1>
      <p className="mb-4 text-xs leading-relaxed text-forest-dark/70">
        Perkirakan berapa kapur yang dibutuhkan dan bagaimana pH tanah berubah setelah dikapur.
      </p>

      {/* ---------- Langkah 1: pilih sumber data ---------- */}
      {sumber === "pilih" && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-forest-dark">Pakai data dari mana?</p>
          <button onClick={() => pilihSumber("analisis")} className="flex w-full items-center gap-3 rounded-2xl border-2 border-forest/30 p-4 text-left hover:border-forest">
            <History className="h-6 w-6 shrink-0 text-forest" />
            <span className="flex-1">
              <span className="block text-sm font-bold text-forest-dark">Dari lahan yang sudah dianalisis</span>
              <span className="block text-xs text-forest-dark/60">Pakai data tanah dan iklim lahan di riwayat. Bisa melihat tanaman apa yang jadi cocok.</span>
            </span>
            <ChevronRight className="h-4 w-4 text-forest-dark/40" />
          </button>
          <button onClick={() => pilihSumber("manual")} className="flex w-full items-center gap-3 rounded-2xl border-2 border-forest/30 p-4 text-left hover:border-forest">
            <ClipboardEdit className="h-6 w-6 shrink-0 text-forest" />
            <span className="flex-1">
              <span className="block text-sm font-bold text-forest-dark">Isi data tanah sendiri</span>
              <span className="block text-xs text-forest-dark/60">Cukup pH dari hasil uji tanah. Cocok kalau belum pernah analisis di Soilmate.</span>
            </span>
            <ChevronRight className="h-4 w-4 text-forest-dark/40" />
          </button>
        </div>
      )}

      {sumber !== "pilih" && status !== "ok" && (
        <button onClick={() => pilihSumber("pilih")} className="mb-3 self-start text-sm text-forest-dark hover:underline">
          ← Ganti sumber data
        </button>
      )}

      {/* ---------- Status khusus ---------- */}
      {status === "segera" &&
        kartuStatus(
          <Clock className="mx-auto mb-2 h-8 w-8 text-forest" />,
          "Segera hadir",
          "Model perhitungan pengapuran sedang disiapkan. Untuk sekarang, konsultasikan dosis kapur dengan penyuluh pertanian setempat.",
          kembaliKeForm
        )}
      {status === "ulang" &&
        kartuStatus(
          <RotateCcw className="mx-auto mb-2 h-8 w-8 text-[#C98A1E]" />,
          "Analisis ulang diperlukan",
          "Analisis ini dibuat sebelum fitur pengapuran ada, jadi datanya belum lengkap. Jalankan analisis lagi untuk lokasi yang sama, atau isi data tanah sendiri.",
          <div className="flex justify-center gap-2">
            <Link href="/analisis" className="rounded-full bg-forest px-5 py-2.5 text-xs font-semibold text-white">Analisis ulang</Link>
            <button onClick={() => pilihSumber("manual")} className="rounded-full border-2 border-forest px-5 py-2 text-xs font-semibold text-forest">Isi sendiri</button>
          </div>,
          "bg-[#FFF8E8]"
        )}

      {/* ---------- Hasil ---------- */}
      {status === "ok" && hasil && (
        <div className="space-y-4">
          {modeContoh && (
            <div className="flex gap-2 rounded-xl border border-[#E8A93C] bg-[#FFF8E8] p-3 text-xs text-forest-dark" role="note">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#C98A1E]" />
              <span>
                <b>Angka contoh, bukan hasil model.</b> Model pengapuran masih disiapkan; angka di bawah hanya untuk
                memperlihatkan cara kerja fitur ini. Jangan dipakai untuk membeli kapur.
              </span>
            </div>
          )}
          <SectionCard
            title="Hasil Simulasi"
            action={modeContoh ? <span className="rounded-full bg-sand px-2 py-0.5 text-[10px] font-bold text-forest-dark">CONTOH</span> : undefined}
            bodyClassName="space-y-4"
          >
            <div className="flex items-center justify-center gap-4 rounded-xl bg-[#3DA35D] p-4 text-white">
              <div className="text-center">
                <p className="text-[11px] opacity-90">pH sekarang</p>
                <p className="font-display text-2xl font-bold">{hasil.ph_awal}</p>
              </div>
              <ArrowRight className="h-6 w-6" />
              <div className="text-center">
                <p className="text-[11px] opacity-90">Perkiraan setelah dikapur</p>
                <p className="font-display text-2xl font-bold">{hasil.ph_baru}</p>
              </div>
            </div>

            {keb && (
              <div className="space-y-3 text-sm">
                {/* Dosis minimal: menetralkan aluminium. Ini yang paling penting untuk petani. */}
                {dosisMinimal != null && (
                  <div className="rounded-xl border-2 border-[#3DA35D] bg-[#EEF7F0] p-3">
                    <p className="text-xs font-semibold text-forest-dark/70">Kebutuhan minimal</p>
                    <p className="font-display text-2xl font-bold text-forest-dark">
                      {fmtDosis(dosisMinimal)} <span className="text-sm font-semibold">ton/ha</span>
                    </p>
                    {kgLahan(dosisMinimal) && (
                      <p className="text-xs text-forest-dark/80">= {kgLahan(dosisMinimal)} untuk lahan Anda</p>
                    )}
                    <p className="mt-1 text-xs leading-relaxed text-forest-dark/70">
                      Cukup untuk menetralkan aluminium yang meracuni akar. Mulai dari dosis ini kalau dana terbatas.
                    </p>
                    {hargaRg && (
                      <p className="mt-1 text-xs font-semibold text-forest-dark">
                        Perkiraan biaya:{" "}
                        {fmtRg({
                          min: dosisMinimal * 1000 * hargaRg.min * (luasDipakai ? luasDipakai / 10000 : 1),
                          max: dosisMinimal * 1000 * hargaRg.max * (luasDipakai ? luasDipakai / 10000 : 1),
                        })}
                        {luasDipakai ? " untuk lahan Anda" : " per hektar"}
                      </p>
                    )}
                  </div>
                )}

                <div className={dosisMinimal != null ? "rounded-xl border border-gray-200 p-3" : ""}>
                  <p className="text-xs font-semibold text-forest-dark/70">
                    {dosisMinimal != null ? `Untuk mencapai pH ${hasil.ph_baru}` : "Kebutuhan kapur"}
                  </p>
                  <div className="flex justify-between py-1"><span className="text-forest-dark/70">Dosis</span><b>{fmtDosis(keb.dosis_ton_ha)} ton/ha</b></div>
                  {keb.total_kg != null && (
                    <div className="flex justify-between py-1"><span className="text-forest-dark/70">Total untuk lahan Anda</span><b>{Math.round(keb.total_kg).toLocaleString("id-ID")} kg</b></div>
                  )}
                </div>

                {/* Perkiraan biaya (untuk dosis target) */}
                <div className="rounded-xl bg-cream p-3">
                  <p className="text-xs font-semibold text-forest-dark/70">Perkiraan biaya kapur</p>
                  {adaHarga ? (
                    <>
                      {biayaLahanRg && (
                        <div className="flex items-baseline justify-between gap-3 py-1">
                          <span className="shrink-0 text-forest-dark/70">Untuk lahan Anda</span>
                          <b className="text-right">{fmtRg(biayaLahanRg)}</b>
                        </div>
                      )}
                      {biayaHaRg && (
                        <div className="flex items-baseline justify-between gap-3 py-1">
                          <span className="shrink-0 text-forest-dark/70">Per hektar</span>
                          <b className="text-right">{fmtRg(biayaHaRg)}</b>
                        </div>
                      )}
                      {biayaTunggal != null && (
                        <div className="flex justify-between py-1"><span className="text-forest-dark/70">Perkiraan biaya</span><b>{rupiah(biayaTunggal)}</b></div>
                      )}
                      {!biayaLahanRg && biayaHaRg && (
                        <p className="text-[11px] text-forest-dark/60">Isi luas lahan untuk melihat biaya lahan Anda.</p>
                      )}
                      <p className="mt-1 text-[11px] leading-relaxed text-forest-dark/60">
                        {hargaRg && <>Harga {fmtRg(hargaRg, "/kg")}</>}
                        {keb.kemasan ? `${hargaRg ? ", " : ""}${keb.kemasan}` : ""}
                        {keb.tanggal_harga ? `, ${tanggal(keb.tanggal_harga, { month: "long", year: "numeric" })}` : ""}
                        {keb.sumber_harga ? `. Sumber: ${keb.sumber_harga}` : ""}
                        {(hargaRg || keb.kemasan || keb.sumber_harga) && "."} Untuk dosis target di atas; harga di toko tani bisa berbeda.
                      </p>
                    </>
                  ) : (
                    <p className="py-1 text-sm text-forest-dark/70">Harga {namaJenis.toLowerCase()} belum tersedia.</p>
                  )}
                </div>
                {keb.total_kg == null && <p className="text-xs text-forest-dark/60">Isi luas lahan untuk melihat total kebutuhan.</p>}

                {/* Detail tambahan dari model */}
                {(alAwal != null || lamaEfek != null || teksturDipakai) && (
                  <dl className="grid grid-cols-2 gap-2 text-xs">
                    {alAwal != null && (
                      <div className="rounded-lg bg-cream p-2">
                        <dt className="text-forest-dark/60">Aluminium tanah</dt>
                        <dd className="font-semibold text-forest-dark">
                          {fmtDosis(alAwal)}{alBaru != null ? ` → ${fmtDosis(alBaru)}` : ""} cmol/kg
                        </dd>
                      </div>
                    )}
                    {lamaEfek != null && (
                      <div className="rounded-lg bg-cream p-2">
                        <dt className="text-forest-dark/60">Efek kapur bertahan</dt>
                        <dd className="font-semibold text-forest-dark">sekitar {fmtDosis(lamaEfek)} tahun</dd>
                      </div>
                    )}
                    {teksturDipakai && (
                      <div className="col-span-2 rounded-lg bg-cream p-2">
                        <dt className="text-forest-dark/60">Tekstur tanah yang dipakai</dt>
                        <dd className="font-semibold text-forest-dark">
                          {labelTekstur(teksturDipakai)}
                          {sumber === "manual" && !tekstur && " (asumsi, karena tidak diisi)"}
                        </dd>
                      </div>
                    )}
                  </dl>
                )}
              </div>
            )}
          </SectionCard>

          {perubahan.length > 0 ? (
            <SectionCard title="Perubahan Kecocokan Tanaman">
              <ul className="divide-y divide-gray-100 text-sm">
                {perubahan.map((p) => (
                  <li key={p.crop_slug ?? p.id ?? p.nama} className="flex items-center justify-between py-2">
                    <span className="capitalize text-forest-dark">{p.nama ?? p.id}</span>
                    <span className="text-xs text-forest-dark/70">
                      {Math.round(p.sebelum * 100)}% → <b className="text-forest-dark">{Math.round(p.sesudah * 100)}%</b>{" "}
                      <span className={p.selisih > 0 ? "font-semibold text-forest" : p.selisih < 0 ? "font-semibold text-alert" : ""}>
                        ({p.selisih > 0 ? "+" : ""}{Math.round(p.selisih * 100)})
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          ) : (
            sumber === "manual" && (
              <p className="rounded-xl bg-cream p-3 text-xs leading-relaxed text-forest-dark/70">
                Perubahan kecocokan tanaman butuh data iklim lahan.{" "}
                {lokasi ? "Data iklim untuk lokasi ini belum bisa diambil (lihat catatan di bawah)." : "Tambahkan lokasi lahan, atau pakai lahan yang sudah dianalisis."}
              </p>
            )
          )}

          {catatanLain.length > 0 && (
            <SectionCard title="Catatan untuk Petani">
              <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-forest-dark/80">
                {catatanLain.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </SectionCard>
          )}

          <p className="flex gap-1.5 text-[11px] leading-relaxed text-forest-dark/60">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>Hasil simulasi adalah perkiraan. Uji tanah ulang 2–3 bulan setelah pengapuran untuk memastikan pH.</span>
          </p>

          <div className="flex gap-2">
            <button onClick={() => setStatus("idle")} className="flex-1 rounded-full border-2 border-forest py-3 text-sm font-semibold text-forest">Coba dosis lain</button>
            <button onClick={() => { setLahan(null); pilihSumber("pilih"); }} className="flex-1 rounded-full py-3 text-sm font-semibold text-forest-dark/70">Lahan lain</button>
          </div>
        </div>
      )}

      {/* ---------- Form ---------- */}
      {sumber !== "pilih" && (status === "idle" || status === "loading" || status === "error") && (
        <div className="space-y-4">
          {sumber === "analisis" ? (
            lahan ? (
              <div className="flex items-center gap-3 rounded-2xl bg-cream p-3">
                <MapPin className="h-5 w-5 shrink-0 text-forest" />
                <div className="flex-1 text-xs text-forest-dark">
                  <p className="font-bold">{lahan.nama}</p>
                  <p className="text-forest-dark/70">pH tanah {lahan.ph}</p>
                </div>
                <button onClick={() => setLahan(null)} className="text-xs font-semibold text-forest underline">Ganti</button>
              </div>
            ) : (
              <div>
                <p className="mb-2 text-sm font-semibold text-forest-dark">Pilih lahan</p>
                {daftar === null && !errDaftar && <p className="flex items-center gap-2 text-xs text-forest-dark/60"><Loader2 className="h-4 w-4 animate-spin" /> Memuat riwayat...</p>}
                {errDaftar && <p className="text-xs text-alert">{errDaftar}</p>}
                {daftar && daftar.length === 0 && (
                  <div className="rounded-2xl bg-cream p-4 text-center text-xs text-forest-dark/70">
                    Belum ada lahan yang dianalisis.{" "}
                    <Link href="/analisis" className="font-semibold text-forest underline">Analisis lahan</Link> atau{" "}
                    <button onClick={() => pilihSumber("manual")} className="font-semibold text-forest underline">isi data tanah sendiri</button>.
                  </div>
                )}
                <ul className="space-y-2">
                  {daftar?.map((r) => (
                    <li key={r.riwayat_id ?? r.id}>
                      <button
                        onClick={() => pilihRiwayat(r)}
                        disabled={memuatLahan !== null}
                        className="flex w-full items-center gap-3 rounded-xl border-2 border-gray-300 bg-white p-3 text-left shadow-sm transition-colors hover:border-[#3DA35D]"
                      >
                        <span className="flex-1 text-xs text-forest-dark">
                          <span className="block font-semibold">{namaRiwayat(r)}</span>
                          <span className="block text-forest-dark/60">
                            {memuatLahan === (r.riwayat_id ?? r.id) ? "Membuka..." : tanggal(r.dibuat_pada)}
                          </span>
                        </span>
                        {typeof r.ph_tanah === "number" && (
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${r.ph_tanah < 5.5 ? "bg-[#FFF1DC] text-[#8A5A00]" : "bg-gray-100 text-forest-dark/70"}`}>
                            pH {r.ph_tanah}
                          </span>
                        )}
                        <ChevronRight className="h-4 w-4 text-forest-dark/40" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          ) : (
            <div className="space-y-3 rounded-2xl border border-forest/20 bg-cream-light p-4">
              <label className="block text-xs font-bold text-forest-dark">
                pH tanah sekarang
                <input inputMode="decimal" placeholder="Contoh: 5,2" value={ph} onChange={(e) => setPh(e.target.value)} className={inputCls} />
              </label>
              <label className="block text-xs font-bold text-forest-dark">
                Tekstur tanah <span className="font-normal text-forest-dark/60">(opsional; kalau kosong dianggap tanah lempung)</span>
                <select value={tekstur} onChange={(e) => setTekstur(e.target.value)} className={inputCls}>
                  <option value="">Tidak tahu / lewati</option>
                  {TEKSTUR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>
              <label className="block text-xs font-bold text-forest-dark">
                C-organik (%) <span className="font-normal text-forest-dark/60">(opsional)</span>
                <input inputMode="decimal" placeholder="Contoh: 1,4" value={cOrg} onChange={(e) => setCOrg(e.target.value)} className={inputCls} />
              </label>
              <div>
                <p className="mb-1 text-xs font-bold text-forest-dark">Luas lahan <span className="font-normal text-forest-dark/60">(opsional)</span></p>
                <LuasLahanInput nilai={luas.nilai} satuan={luas.satuan} m2PerBata={luas.m2PerBata} onChange={setLuas} />
              </div>
              <div>
                <p className="mb-1 text-xs font-bold text-forest-dark">Lokasi lahan <span className="font-normal text-forest-dark/60">(opsional)</span></p>
                {lokasi ? (
                  <p className="flex items-center gap-2 text-xs text-forest-dark">
                    <MapPin className="h-4 w-4 text-forest" /> {lokasi.lat}, {lokasi.lon}
                    <button onClick={() => setLokasi(null)} className="font-semibold text-alert underline">Hapus</button>
                  </p>
                ) : (
                  <button onClick={ambilLokasi} disabled={gps} className="flex items-center gap-1.5 rounded-full border border-forest px-3 py-1.5 text-xs font-semibold text-forest disabled:opacity-60">
                    <MapPin className="h-3.5 w-3.5" /> {gps ? "Membaca lokasi..." : "Pakai lokasi saya sekarang"}
                  </button>
                )}
                <p className="mt-1 text-[11px] text-forest-dark/60">Dengan lokasi, sistem bisa memperkirakan tanaman apa yang jadi cocok.</p>
              </div>
            </div>
          )}

          {(sumber === "manual" || lahan) && (
            <>
              <div className="grid grid-cols-2 rounded-full bg-cream p-1 text-xs font-semibold">
                <button onClick={() => setMode("target")} aria-pressed={mode === "target"} className={`rounded-full py-2 ${mode === "target" ? "bg-[#3DA35D] text-white" : "text-forest-dark"}`}>Saya ingin pH...</button>
                <button onClick={() => setMode("dosis")} aria-pressed={mode === "dosis"} className={`rounded-full py-2 ${mode === "dosis" ? "bg-[#3DA35D] text-white" : "text-forest-dark"}`}>Saya punya kapur...</button>
              </div>

              {mode === "target" ? (
                <label className="block text-xs font-bold text-forest-dark">
                  Target pH
                  <input inputMode="decimal" value={targetPh} onChange={(e) => setTargetPh(e.target.value)} className={inputCls} />
                  <span className="mt-1 block font-normal text-forest-dark/60">Kebanyakan tanaman pangan tumbuh baik di pH 6–7.</span>
                </label>
              ) : (
                <label className="block text-xs font-bold text-forest-dark">
                  Dosis kapur (ton per hektar)
                  <input inputMode="decimal" value={dosis} onChange={(e) => setDosis(e.target.value)} className={inputCls} />
                  <span className="mt-1 block font-normal text-forest-dark/60">1 ton/ha sama dengan 100 kg per 1.000 m².</span>
                </label>
              )}

              <fieldset>
                <legend className="mb-1 text-xs font-bold text-forest-dark">Jenis kapur</legend>
                <div className="space-y-2">
                  {JENIS_KAPUR.map((j) => (
                    <label key={j.value} className={`flex cursor-pointer gap-2 rounded-xl border p-3 text-sm ${jenis === j.value ? "border-forest bg-forest/5" : "border-gray-200"}`}>
                      <input type="radio" name="jenis" checked={jenis === j.value} onChange={() => setJenis(j.value)} className="mt-1 accent-[#629560]" />
                      <span>
                        <span className="block font-semibold text-forest-dark">{j.label}</span>
                        <span className="block text-xs text-forest-dark/60">{j.ket}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {status === "error" && pesan && <p role="alert" className="text-sm font-semibold text-alert">{pesan}</p>}

              <button onClick={jalankan} disabled={status === "loading"} className="w-full rounded-full bg-forest py-3 text-sm font-semibold text-white disabled:opacity-60">
                {status === "loading" ? "Menghitung..." : "Hitung simulasi"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function KapurPage() {
  return (
    <Suspense fallback={null}>
      <KapurContent />
    </Suspense>
  );
}
