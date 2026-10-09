// export default function Footer() {
//   return (
//     <footer className="w-full bg-footer">
//       <div className="flex flex-wrap items-center justify-center gap-2 px-4 py-3 text-xs font-medium text-forest-dark">
//         <span>Diversifikasi Pangan</span>
//         <span>☀</span>
//         <span>Soilmate</span>
//         <span>☀</span>
//         <span>Diversifikasi Pangan</span>
//       </div>
//     </footer>
//   );
// }

import { Sun } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-footer">
      <div className="flex flex-wrap items-center justify-center gap-2 px-4 py-3 text-xs font-medium text-forest-dark">
        <span>Diversifikasi Pangan</span>

        <Sun className="h-3 w-3 shrink-0" strokeWidth={2} />

        <span>Soilmate</span>

     
      </div>
    </footer>
  );
}