// // Generate ID unik random sekali doang, terus simpen di localStorage
// // biar tiap kali user buka app lagi, ID-nya tetap sama (bukan generate baru terus)

// const STORAGE_KEY = "nusa-crop-anonymous-id";

// export function getAnonymousId(): string {
//   if (typeof window === "undefined") return ""; // guard buat server-side render

//   let id = localStorage.getItem(STORAGE_KEY);

//   if (!id) {
//     id = crypto.randomUUID(); // built-in browser, hasilnya kayak "a1b2c3d4-..."
//     localStorage.setItem(STORAGE_KEY, id);
//   }

//   return id;
// }
const STORAGE_KEY = "nusa-crop-anonymous-id";

export function getAnonymousId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}