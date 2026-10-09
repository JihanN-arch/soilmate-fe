
// "use client";

// import { useParams, useRouter } from "next/navigation";
// import { useState } from "react";
// import Image from "next/image";
// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";
// import RiwayatModal from "@/components/RiwayatModal";
// import { useCropDetail } from "@/lib/useCropDetail";

// export default function CaraBudidayaPage() {
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
//           Cara Budidaya
//         </h2>

//         <p className="mb-5 text-base font-semibold text-forest-dark">
//           {crop.nama}
//         </p>

//         <p className="text-sm leading-relaxed text-forest-dark/80">
//           Informasi cara budidaya {crop.nama} secara detail belum tersedia dari server. Bagian ini
//           akan menjelaskan tahapan penanaman, perawatan, hingga panen {crop.nama} setelah data
//           lengkap tersedia dari backend.
//         </p>
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

export default function CaraBudidayaPage() {
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
          <h1 className="font-display text-lg font-bold text-forest-dark">Cara Budidaya</h1>
          <p className="mb-3 text-sm text-forest-dark/50">{detail.nama}</p>
          <p className="text-sm leading-relaxed text-forest-dark/80">{detail.cara_budidaya}</p>
        </div>
      </section>
     
    </div>
  );
}