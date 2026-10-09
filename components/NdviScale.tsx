// export default function NdviScale() {
//   return (
//     <div className="mt-4">
//       <p className="mb-2 text-center text-xs font-bold uppercase tracking-wide text-forest-dark">
//         NDVI
//       </p>

//       <div
//         className="h-6 w-full rounded-full"
//         style={{
//           background:
//             "linear-gradient(to right, #B5342A, #D98C3A, #E8D45A, #7FA050, #629560)",
//         }}
//       />

//       <div className="mt-1 flex justify-between text-center">
//         <div className="flex-1">
//           <p className="text-xs font-semibold text-forest-dark">&lt;0.2</p>
//           <p className="text-xs text-forest-dark/70">Marginal</p>
//         </div>
//         <div className="flex-1">
//           <p className="text-xs font-semibold text-forest-dark">0.2 - 0.5</p>
//           <p className="text-xs text-forest-dark/70">Sedang</p>
//         </div>
//         <div className="flex-1 text-right">
//           <p className="text-xs font-semibold text-forest-dark">&gt;0.6</p>
//           <p className="text-xs text-forest-dark/70">Subur</p>
//         </div>
//       </div>
//     </div>
//   );
// }

export default function NdviScale() {
  return (
    <div>
      <h3 className="mt-4 mb-2 text-center font-display text-base font-bold text-forest-dark">
         Skor Kondisi Vegetasi (NDVI)
      </h3>

      <div
        className="h-6 w-full rounded-full"
        style={{
          background:
            "linear-gradient(to right, #B5342A, #D98C3A, #E8D45A, #7FA050, #629560)",
        }}
      />

      <div className="mt-1 flex text-center">
        <div className="flex-1">
          <p className="text-xs font-semibold text-forest-dark">&lt;0.2</p>
          <p className="text-xs text-forest-dark/70">Marginal</p>
        </div>

        <div className="flex-1">
          <p className="text-xs font-semibold text-forest-dark">0.2 - 0.5</p>
          <p className="text-xs text-forest-dark/70">Sedang</p>
        </div>

        <div className="flex-1">
          <p className="text-xs font-semibold text-forest-dark">&gt;0.6</p>
          <p className="text-xs text-forest-dark/70">Subur</p>
        </div>
      </div>
    </div>
  );
}