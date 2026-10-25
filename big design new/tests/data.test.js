// Данные сайта ссылаются на файлы в public/ — проверяем, что все они на месте
// (иначе на проде пустая карточка или 404 видео). Лёгкие версии делает `npm run previews`.
import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { works } from "../src/data/works.js";
import { reviews } from "../src/data/reviews.js";

const PUBLIC = path.resolve(__dirname, "../public");
const missing = (urls) => urls.filter((url) => url && !existsSync(path.join(PUBLIC, decodeURI(url))));

describe("works", () => {
  it("у каждой работы уникальный slug и ориентация v/h", () => {
    expect(new Set(works.map((w) => w.slug)).size).toBe(works.length);
    works.forEach((w) => expect(["v", "h"]).toContain(w.orientation));
  });

  it("все превью, постеры и веб-версии видео существуют", () => {
    expect(missing(works.flatMap((w) => [w.previewVideo, w.previewPoster, w.webVideo]))).toEqual([]);
  });
});

describe("reviews", () => {
  it("у каждого отзыва есть имя и уникальный slug", () => {
    expect(new Set(reviews.map((r) => r.slug)).size).toBe(reviews.length);
    reviews.forEach((r) => expect(r.name).toBeTruthy());
  });

  it("все видео и постеры отзывов существуют", () => {
    expect(missing(reviews.flatMap((r) => [r.video, r.posterWeb]))).toEqual([]);
  });
});
