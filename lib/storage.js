// lib/storage.js
// Penyimpanan sementara di browser (localStorage) untuk menghubungkan
// antar halaman Langkah 1 -> 2 -> 3 tanpa backend dulu.

const FORM_KEY = "nusaCropForm";
const HISTORY_KEY = "nusaCropHistory";

export function saveFormData(data) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FORM_KEY, JSON.stringify(data));
}

export function getFormData() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(FORM_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearFormData() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(FORM_KEY);
}

export function addHistoryEntry(entry) {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(HISTORY_KEY);
  const list = raw ? JSON.parse(raw) : [];
  list.unshift(entry);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 20)));
}

export function getHistory() {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}