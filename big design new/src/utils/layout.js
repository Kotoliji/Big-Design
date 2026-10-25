// Чистая логика раскладок слайдов — отдельно от компонентов, чтобы её можно было тестировать.

// Места карточек в волне галереи — какую ориентацию место ждёт ("v" вертикальная, "h" горизонтальная).
export const WAVE_SLOTS = ["h", "v", "v", "h", "v", "h"];

// Делим работы на волны поровну (16 → 6, 5, 5) и раскладываем по местам нужной ориентации.
// Не хватило вертикальных или горизонтальных — берём из другой стопки.
export function buildWaves(list, slots = WAVE_SLOTS) {
  if (!list.length) return [];
  const pools = {
    v: list.filter((w) => w.orientation === "v"),
    h: list.filter((w) => w.orientation !== "v"),
  };
  const count = Math.ceil(list.length / slots.length);
  const base = Math.floor(list.length / count);
  return Array.from({ length: count }, (_, n) => {
    const size = base + (n < list.length % count ? 1 : 0);
    return slots.slice(0, size).map((want) => {
      const pool = pools[want].length ? pools[want] : pools[want === "v" ? "h" : "v"];
      return pool.shift();
    });
  });
}

// Место элемента в ленте по кругу относительно активного: 0 — центр, ±1 — соседи и т. д.
// Считаем по кратчайшему пути: в ленте из 6 элемент «через 5 вправо» — это «1 влево».
export function ringOffset(index, active, length) {
  const m = (((index - active) % length) + length) % length;
  return m > length / 2 ? m - length : m;
}

// Номер по кругу: wrap(-1, 6) === 5, wrap(6, 6) === 0.
export function wrap(index, length) {
  return ((index % length) + length) % length;
}
