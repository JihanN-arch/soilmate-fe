// lib/cropData.js
// Data dummy — nanti tinggal ganti isi function getAnalysisResult()
// dengan fetch ke API/model asli kamu.

export const CROPS = {
  sorgum: {
    slug: "sorgum",
    nama: "Sorgum",
    latin: "Sorghum bicolor",
    skor: 90,
    keyakinan: 82,
    tag: "Tanah kekeringan | pH 5.0-8.5 | dataran menengah",
    jenis: "Pangan",
    umurPanen: "6-12 bulan",
    potensiHasil: "20-30 ton/ha",
    deskripsi:
      "Sorgum adalah tanaman pangan yang toleran terhadap kondisi lahan kering dan marginal. Tanaman ini mampu tumbuh pada tanah dengan kesuburan rendah serta memiliki kebutuhan air yang relatif rendah, menjadikannya pilihan tepat untuk daerah dengan curah hujan terbatas.",
    caraBudidaya: [
      "Olah tanah sedalam 15-20 cm lalu buat bedengan agar drainase lancar.",
      "Tanam benih dengan jarak tanam 70 x 20 cm, 2-3 biji per lubang.",
      "Beri pupuk dasar berupa kompos atau pupuk kandang sebelum tanam.",
      "Lakukan penyiangan pada usia 2-3 minggu dan 6 minggu setelah tanam.",
      "Panen saat biji sudah keras dan kadar air sekitar 20-25%.",
    ],
    syaratTumbuh: [
      "Curah hujan ideal 300-800 mm per musim tanam.",
      "pH tanah optimal antara 5.0-8.5, toleran tanah agak masam.",
      "Cocok di dataran rendah hingga menengah (0-800 mdpl).",
      "Membutuhkan sinar matahari penuh sepanjang hari.",
    ],
    manfaat: [
      "Sumber pangan alternatif pengganti beras dan jagung.",
      "Batang dan daun dapat dimanfaatkan sebagai pakan ternak.",
      "Tahan kekeringan sehingga menekan risiko gagal panen.",
      "Dapat diolah menjadi tepung, bioetanol, hingga pemanis alami.",
    ],
    alasan: [
      "Kondisi kering — curah hujan lahan Anda (340 mm/tahun) sesuai toleransi tanaman.",
      "pH tanah masam (5.2) masih dalam batas yang bisa ditoleransi.",
      "Cocok untuk lahan dengan tingkat kesuburan rendah.",
    ],
  },
  singkong: {
    slug: "singkong",
    nama: "Singkong",
    latin: "Manihot esculenta",
    skor: 78,
    keyakinan: 74,
    tag: "Tanah kering | pH 4.5-8.0 | dataran rendah",
    jenis: "Pangan",
    umurPanen: "8-10 bulan",
    potensiHasil: "15-25 ton/ha",
    deskripsi:
      "Singkong dikenal sangat adaptif terhadap tanah marginal dan minim perawatan. Umbinya menjadi sumber karbohidrat penting dan tanaman ini relatif tahan terhadap kekeringan jangka panjang.",
    caraBudidaya: [
      "Gunakan stek batang sepanjang 20-25 cm dari indukan sehat.",
      "Tanam pada bedengan dengan jarak 100 x 80 cm.",
      "Bersihkan gulma secara rutin pada 3 bulan pertama.",
      "Panen dilakukan setelah 8-10 bulan atau saat daun mulai menguning.",
    ],
    syaratTumbuh: [
      "Curah hujan 500-1500 mm per tahun.",
      "pH tanah 4.5-8.0, toleran tanah masam.",
      "Tumbuh baik di dataran rendah sampai 1000 mdpl.",
    ],
    manfaat: [
      "Bahan pangan pokok dan bahan baku tepung tapioka.",
      "Daun muda dapat dikonsumsi sebagai sayuran.",
      "Toleran kekeringan sehingga risiko gagal panen rendah.",
    ],
    alasan: [
      "Sangat toleran terhadap kondisi lahan kering seperti lahan Anda.",
      "Tidak menuntut kesuburan tanah tinggi.",
      "Perawatan minim, cocok untuk lahan dengan akses terbatas.",
    ],
  },
  jagung: {
    slug: "jagung",
    nama: "Jagung",
    latin: "Zea mays",
    skor: 55,
    keyakinan: 61,
    tag: "Tanah kekeringan | pH 5.5-7.5 | dataran menengah",
    jenis: "Pangan",
    umurPanen: "3-4 bulan",
    potensiHasil: "5-9 ton/ha",
    deskripsi:
      "Jagung cukup fleksibel terhadap jenis tanah namun lebih sensitif terhadap kekurangan air dibanding sorgum, sehingga potensi hasilnya di lahan kering sedikit lebih rendah.",
    caraBudidaya: [
      "Tanam benih pada kedalaman 3-5 cm, jarak tanam 70 x 20 cm.",
      "Pemupukan bertahap pada usia 7, 30, dan 45 hari setelah tanam.",
      "Pastikan pengairan tercukupi pada fase pembungaan.",
      "Panen saat kelobot mengering dan biji keras.",
    ],
    syaratTumbuh: [
      "Curah hujan ideal 600-1200 mm per musim tanam.",
      "pH tanah 5.5-7.5.",
      "Cocok di dataran rendah hingga menengah.",
    ],
    manfaat: [
      "Sumber pangan dan pakan ternak utama.",
      "Dapat diolah menjadi berbagai produk turunan pangan.",
    ],
    alasan: [
      "Masih dapat tumbuh pada kondisi lahan Anda meski bukan pilihan optimal.",
      "Membutuhkan pengairan tambahan pada musim kering panjang.",
    ],
  },
};

export const CROP_LIST_ORDER = ["sorgum", "singkong", "jagung"];

// Simulasi hasil deteksi kondisi lingkungan — ganti dengan hasil API asli.
export function getAnalysisResult() {
  return {
    kondisi: {
      curahHujan: { nilai: "340 mm/tahun", tag: "Kering" },
      phTanah: { nilai: "5.2", tag: "Masam" },
      elevasi: { nilai: "780 mdpl" },
      ndvi: { nilai: "0.31", tag: "Rendah" },
    },
    rekomendasi: CROP_LIST_ORDER.map((slug) => CROPS[slug]),
  };
}