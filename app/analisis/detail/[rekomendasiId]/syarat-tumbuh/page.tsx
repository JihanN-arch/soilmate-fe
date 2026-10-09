
// "use client";

// import { useParams, useRouter } from "next/navigation";
// import { useState } from "react";
// import Image from "next/image";
// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";
// import RiwayatModal from "@/components/RiwayatModal";
// import { useCropDetail } from "@/lib/useCropDetail";

// export default function SyaratTumbuhPage() {
//   const [showRiwayat, setShowRiwayat] = useState(false);
//   const router = useRouter();
//   const params = useParams<{ id: string }>();
//   const crop = useCropDetail(params.id);

//   if (crop === undefined) return null;

//   if (crop === null) {
//     return (
//       <div className="flex min-h-screen flex-col bg-white">
//         <Navbar onRiwayatClick={() => setShowRiwayat(true)} />

//         <section className="flex flex-1 items-center justify-center px-4 py-6">
//           Data tanaman tidak ditemukan.
//         </section>

//         <Footer />

//         <RiwayatModal
//           open={showRiwayat}
//           onClose={() => setShowRiwayat(false)}
//         />
//       </div>
//     );
//   }

//   return (
//     <div className="flex min-h-screen flex-col bg-white">
//       <Navbar onRiwayatClick={() => setShowRiwayat(true)} />

//       <section className="flex-1 px-4 py-5">
//         <button
//           onClick={() => router.back()}
//           className="text-sm text-forest-dark hover:underline"
//         >
//           ← Kembali
//         </button>

//         <div className="relative mt-4 h-44 w-full bg-gray-100">
//           <Image
//             src={`/images/${crop.id}.png`}
//             alt={crop.nama}
//             fill
//             className="object-cover"
//           />
//         </div>

//         <h2 className="mt-5 font-display text-lg font-bold text-forest-dark">
//           Syarat Tumbuh
//         </h2>

//         <p className="mb-5 text-base font-semibold text-forest-dark">
//           {crop.nama}
//         </p>

//         <div className="space-y-3 text-sm text-forest-dark">
//           <p>
//             <span className="font-semibold">Kesuburan tanah :</span>{" "}
//             {crop.kesuburan_ideal}
//           </p>

//           <p>
//             <span className="font-semibold">Elevasi :</span>{" "}
//             {crop.elevasi_ideal}
//           </p>

//           <p>
//             <span className="font-semibold">pH tanah :</span>{" "}
//             {crop.ph_ideal}
//           </p>

//           <p>
//             <span className="font-semibold">Curah Hujan :</span>{" "}
//             Data belum tersedia
//           </p>
//         </div>
//       </section>

//       <Footer />

//       <RiwayatModal
//         open={showRiwayat}
//         onClose={() => setShowRiwayat(false)}
//       />
//     </div>
//   );
// }

"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

import { useCropDetail } from "@/lib/useCropDetail";
import { getCropImage } from "@/lib/api";

export default function SyaratTumbuhPage() {
  const router = useRouter();
  const params = useParams<{ rekomendasiId: string }>();
  const detail = useCropDetail(params.rekomendasiId);

  if (detail === undefined) return null;
  if (detail === null) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
      
        <section className="flex flex-1 items-center justify-center px-5 text-center text-forest-dark">
          <p>Data tanaman tidak ditemukan.</p>
        </section>
        
      </div>
    );
  }

  const { ph, elevasi, curah_hujan, kesuburan } = detail.syarat_tumbuh;

  return (
    <div className="flex min-h-screen flex-col bg-white">
     
      <section className="flex-1">
        <div className="px-4 py-3">
          <button onClick={() => router.back()} className="text-sm text-forest-dark hover:underline">
            ← Kembali
          </button>
        </div>
        <div className="relative h-44 w-full bg-gray-100">
          <Image src={getCropImage(detail.nama)} alt={detail.nama} fill className="object-cover" />
        </div>
        <div className="px-4 py-5">
          <h1 className="font-display text-lg font-bold text-forest-dark">Syarat Tumbuh</h1>
          <p className="mb-3 text-sm text-forest-dark/50">{detail.nama}</p>
          <ul className="list-disc space-y-1.5 pl-4 text-sm text-forest-dark/80">
            <li>Kesuburan tanah : {kesuburan}</li>
            <li>Elevasi : {elevasi.min} - {elevasi.max} mdpl</li>
            <li>pH tanah : {ph.min} - {ph.max}</li>
            <li>Curah Hujan : {curah_hujan.min} - {curah_hujan.max} mm/tahun</li>
          </ul>
        </div>
      </section>
   
    </div>
  );
}