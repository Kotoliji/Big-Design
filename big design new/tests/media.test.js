import { describe, expect, it } from "vitest";
import { formatTime, progressOf, timeAt } from "../src/utils/media.js";

const rect = { left: 100, width: 200 };

describe("timeAt — время под указателем на полосе перемотки", () => {
  it("середина полосы — середина ролика", () => {
    expect(timeAt(200, rect, 60)).toBe(30);
  });

  it("края полосы — начало и конец", () => {
    expect(timeAt(100, rect, 60)).toBe(0);
    expect(timeAt(300, rect, 60)).toBe(60);
  });

  it("мимо полосы — к ближайшему краю", () => {
    expect(timeAt(-50, rect, 60)).toBe(0);
    expect(timeAt(999, rect, 60)).toBe(60);
  });

  it("длительность ещё неизвестна (NaN/0) — 0, а не NaN", () => {
    expect(timeAt(200, rect, NaN)).toBe(0);
    expect(timeAt(200, rect, 0)).toBe(0);
  });

  it("полоса нулевой ширины — 0", () => {
    expect(timeAt(200, { left: 100, width: 0 }, 60)).toBe(0);
  });
});

describe("progressOf", () => {
  it("доля просмотренного", () => {
    expect(progressOf(15, 60)).toBe(0.25);
  });

  it("не выходит за 0..1 и не ломается без длительности", () => {
    expect(progressOf(90, 60)).toBe(1);
    expect(progressOf(-1, 60)).toBe(0);
    expect(progressOf(10, NaN)).toBe(0);
  });
});

describe("formatTime", () => {
  it("минуты и секунды с ведущим нулём", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(5)).toBe("0:05");
    expect(formatTime(83.9)).toBe("1:23");
    expect(formatTime(332)).toBe("5:32");
  });

  it("мусор на входе — 0:00", () => {
    expect(formatTime(NaN)).toBe("0:00");
    expect(formatTime(-3)).toBe("0:00");
  });
});
