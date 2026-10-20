// Делает лёгкие версии видео: превью для колоды и галереи, веб-копии для просмотра работы целиком.
// Оригиналы НЕ трогаются — всё кладётся рядом, в отдельные папки.
//
// Запуск:  npm run previews
// Добавил новую работу в src/data/works.js — просто запусти ещё раз:
// готовые файлы пропускаются, пережимается только новое или изменённое.
// Пережать всё заново:  npm run previews -- --force

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import ffmpeg from "ffmpeg-static";
import { works } from "../src/data/works.js";
import { reviews } from "../src/data/reviews.js";

const PUBLIC = path.resolve("public");
const FORCE = process.argv.includes("--force");

// Сколько потоков даём кодеку. Без ограничения x264 на 4K-исходниках
// забирает столько памяти, что падает с "malloc failed".
const THREADS = "4";

/* ---------- 1. Превью карт колоды ---------- */

// Короткая сторона превью в пикселях. Кадр колоды ~340px, больше не нужно.
const SIZE = 400;
// Последняя карта стоит на экране дольше всех (медленно едет + лежит до заставки),
// поэтому ей разрешение побольше, иначе она заметно мылится.
const SIZE_LAST = 900;
// Сколько секунд берём от начала ролика. Карта на экране меньше секунды,
// видео зациклено — длинный хвост только занимает место.
const SECONDS = 4;

const PREVIEW_DIR = path.join(PUBLIC, "gallery_of_works_video", "preview");
mkdirSync(PREVIEW_DIR, { recursive: true });

works.forEach((w, index) => {
  const input = path.join(PUBLIC, w.video);
  const outVideo = path.join(PREVIEW_DIR, `${w.slug}.mp4`);
  const outPoster = path.join(PREVIEW_DIR, `${w.slug}.jpg`);
  const size = index === works.length - 1 ? SIZE_LAST : SIZE;

  if (!existsSync(input)) {
    console.warn(`пропуск ${w.slug}: нет файла ${w.video}`);
    return;
  }

  // Видео: короткая сторона = size, без звука, H.264,
  // +faststart — браузер начинает играть, не дожидаясь конца файла.
  encode(input, outVideo, [
    "-t", String(SECONDS),
    "-vf", `scale=${size}:${size}:force_original_aspect_ratio=increase,scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=30`,
    "-crf", "28", "-profile:v", "main", "-g", "30",
  ]);

  // Постер: первый кадр превью, маленький jpg вместо тяжёлого png.
  if (FORCE || !isFresh(outPoster, outVideo)) {
    run(["-y", "-i", outVideo, "-frames:v", "1", "-q:v", "4", outPoster]);
  }

  console.log(`карта: ${w.slug} (${size}px)`);
});

/* ---------- 2. Видео с девайсом в блоке "о нас" (запасной вариант 3D-телефона) ---------- */

// Тоже 4K-оригинал, а на экране занимает меньше половины ширины — 1920px с запасом.
const ABOUT_IN = path.join(PUBLIC, "description_video", "16_08.mp4");
const ABOUT_DIR = path.join(PUBLIC, "description_video", "web");
mkdirSync(ABOUT_DIR, { recursive: true });

encode(ABOUT_IN, path.join(ABOUT_DIR, "16_08_1080.mp4"), [
  "-vf", "scale=1920:-2", "-crf", "22", "-profile:v", "high",
]);

console.log("девайс: description_video/web/");

/* ---------- 3. Работа целиком в галерее (открытая карточка) ---------- */

// Часть оригиналов — 4K по 30–70 МБ: долго грузятся и тяжело декодируются, а на экране
// карточка не больше 1920px. Длинная сторона до 1920 (маленькие не растягиваем), звук оставляем.
const WEB_DIR = path.join(PUBLIC, "gallery_of_works_video", "web");
mkdirSync(WEB_DIR, { recursive: true });

works.forEach((w) => {
  const input = path.join(PUBLIC, w.video);
  if (!existsSync(input)) return; // уже предупредили выше
  encode(input, path.join(WEB_DIR, `${w.slug}.mp4`), [
    "-vf", "scale='min(1920,iw)':'min(1920,ih)':force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2",
    "-crf", "23", "-profile:v", "high",
  ], { audio: true });
  console.log(`работа: ${w.slug}`);
});

/* ---------- 4. Постеры видео-отзывов ---------- */

// Исходники — png по полмегабайта; на экране карточка не выше ~600px, хватает jpg.
const REVIEW_DIR = path.join(PUBLIC, "gallery_of_works_review", "web");
mkdirSync(REVIEW_DIR, { recursive: true });

reviews.forEach((r) => {
  const input = path.join(PUBLIC, r.poster);
  const output = path.join(REVIEW_DIR, `${r.slug}.jpg`);
  if (!existsSync(input)) return console.warn(`пропуск ${r.slug}: нет файла ${r.poster}`);
  if (FORCE || !isFresh(output, input)) run(["-y", "-i", input, "-vf", "scale=600:-2", "-q:v", "4", output]);
  console.log(`отзыв: ${r.slug}`);
});

/* ---------- помощники ---------- */

// Файл уже сделан и новее исходника — пережимать незачем.
function isFresh(out, input) {
  return existsSync(out) && statSync(out).mtimeMs > statSync(input).mtimeMs;
}

// Общие настройки H.264 для всех видео: yuv420p (играет везде), звук — только если попросили,
// +faststart — браузер начинает играть, не дожидаясь конца файла.
function encode(input, output, extra, { audio = false } = {}) {
  if (!FORCE && isFresh(output, input)) return;
  run([
    "-y", "-i", input,
    ...(audio ? ["-c:a", "aac", "-b:a", "128k"] : ["-an"]),
    ...extra,
    "-c:v", "libx264", "-preset", "slow", "-threads", THREADS,
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    output,
  ]);
}

function run(args) {
  const r = spawnSync(ffmpeg, ["-hide_banner", "-loglevel", "error", ...args], { stdio: "inherit" });
  if (r.status !== 0) throw new Error("ffmpeg упал на: " + args.join(" "));
}
