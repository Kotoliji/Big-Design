// Время ролика под точкой полосы перемотки: x — координата указателя, rect — прямоугольник полосы.
// Мимо полосы — к ближайшему краю; пока длительность неизвестна (метаданные не загрузились) — 0.
export function timeAt(x, rect, duration) {
  if (!(duration > 0) || !(rect.width > 0)) return 0;
  const share = Math.min(1, Math.max(0, (x - rect.left) / rect.width));
  return share * duration;
}

// Доля просмотренного 0..1 — для полосы перемотки.
export function progressOf(time, duration) {
  if (!(duration > 0)) return 0;
  return Math.min(1, Math.max(0, time / duration));
}

// 83 → "1:23"
export function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
