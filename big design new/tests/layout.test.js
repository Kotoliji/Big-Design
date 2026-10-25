import { describe, expect, it } from "vitest";
import { buildWaves, ringOffset, wrap, WAVE_SLOTS } from "../src/utils/layout.js";
import { works } from "../src/data/works.js";

const fake = (v, h) => [
  ...Array.from({ length: v }, (_, i) => ({ slug: `v${i}`, orientation: "v" })),
  ...Array.from({ length: h }, (_, i) => ({ slug: `h${i}`, orientation: "h" })),
];

describe("buildWaves", () => {
  it("делит 16 работ на волны 6, 5, 5", () => {
    expect(buildWaves(works).map((w) => w.length)).toEqual([6, 5, 5]);
  });

  it("каждая работа попадает ровно в одну волну", () => {
    const slugs = buildWaves(works).flat().map((w) => w.slug);
    expect(slugs).toHaveLength(works.length);
    expect(new Set(slugs).size).toBe(works.length);
  });

  it("не портит исходный список", () => {
    const list = fake(3, 3);
    const copy = [...list];
    buildWaves(list);
    expect(list).toEqual(copy);
  });

  it("ставит работу нужной ориентации, пока такие есть", () => {
    const [wave] = buildWaves(fake(6, 6));
    wave.forEach((work, slot) => expect(work.orientation).toBe(WAVE_SLOTS[slot]));
  });

  it("берёт работу другой ориентации, когда нужной не осталось", () => {
    const waves = buildWaves(fake(0, 6));
    expect(waves.flat().every(Boolean)).toBe(true);
    expect(waves.flat()).toHaveLength(6);
  });

  it("пустой список — пустые волны", () => {
    expect(buildWaves([])).toEqual([]);
  });

  it("меньше одной волны — одна неполная волна", () => {
    expect(buildWaves(fake(1, 2)).map((w) => w.length)).toEqual([3]);
  });
});

describe("ringOffset", () => {
  it("центр — 0, соседи — ±1", () => {
    expect(ringOffset(2, 2, 6)).toBe(0);
    expect(ringOffset(3, 2, 6)).toBe(1);
    expect(ringOffset(1, 2, 6)).toBe(-1);
  });

  it("считает по кратчайшему пути через край ленты", () => {
    expect(ringOffset(5, 0, 6)).toBe(-1);
    expect(ringOffset(0, 5, 6)).toBe(1);
    expect(ringOffset(4, 0, 6)).toBe(-2);
  });

  it("смещения ленты из 6 — от -2 до 3, все разные", () => {
    const offsets = [0, 1, 2, 3, 4, 5].map((i) => ringOffset(i, 0, 6));
    expect(new Set(offsets).size).toBe(6);
    expect(Math.min(...offsets)).toBe(-2);
    expect(Math.max(...offsets)).toBe(3);
  });
});

describe("wrap", () => {
  it("заворачивает номер по кругу в обе стороны", () => {
    expect(wrap(-1, 6)).toBe(5);
    expect(wrap(6, 6)).toBe(0);
    expect(wrap(13, 6)).toBe(1);
    expect(wrap(3, 6)).toBe(3);
  });
});
