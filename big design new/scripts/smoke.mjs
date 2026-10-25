// Сквозная проверка сайта в настоящем Chrome: проходит слайды, как посетитель, и проверяет
// то, что ломается чаще всего. Падает (код 1) при первой же ошибке — годится перед пушем.
//
//   npm run smoke            — на dev-сервере
//   npm run smoke -- --prod  — на собранной версии (после npm run build)
import { collectConsole, launchBrowser, parseArgs, shutdown, startServer } from "./lib/browser.mjs";

const args = parseArgs(process.argv.slice(2));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];

function check(name, ok, info = "") {
  results.push({ name, ok });
  console.log(`${ok ? "OK  " : "FAIL"} ${name}${info ? `  (${info})` : ""}`);
}

const server = await startServer({ prod: Boolean(args.prod) });
const browser = await launchBrowser({ width: 1600, height: 900 });

try {
  const page = await browser.newPage();
  const logs = collectConsole(page);
  const open = async (slide, ms) => {
    await page.goto(`${server.origin}/?slide=${slide}`, { waitUntil: "domcontentloaded" });
    await wait(ms);
  };
  const visibleSlide = () =>
    page.evaluate(() => [...document.querySelectorAll(".screen")].findIndex((s) => getComputedStyle(s).visibility === "visible"));
  const center = (sel) =>
    page.evaluate((sel) => {
      const r = document.querySelector(sel)?.getBoundingClientRect();
      return r && { x: r.left + r.width / 2, y: r.top + r.height / 2, left: r.left, width: r.width };
    }, sel);
  // Кликнуть по полосе перемотки на доле share и вернуть, куда реально перемоталось видео.
  const seekTo = async (scrubSel, videoSel, share) => {
    await page.waitForFunction((v) => document.querySelector(v)?.duration > 0, { timeout: 15_000 }, videoSel);
    const bar = await center(scrubSel);
    await page.mouse.click(bar.left + bar.width * share, bar.y);
    await wait(150);
    return page.evaluate((v) => {
      const video = document.querySelector(v);
      return video.currentTime / video.duration;
    }, videoSel);
  };

  /* ---------- 1. Навигация колесом по всем слайдам ---------- */
  await open(1, 9000);
  await page.mouse.move(300, 820);
  const route = [];
  for (let i = 0; i < 10; i++) {
    await page.mouse.wheel({ deltaY: 120 });
    await wait(2600);
    route.push(await visibleSlide());
  }
  // телефон в центр (1) → нырок в галерею (2) → ещё 2 волны (минимум три шага на 2) → 3 → 4 → 5.
  // Шаги каждые 2.6 с — быстрее, чем слайды успевают проявиться: так ловится «проскакивание».
  // Шаг, пришедший во время появления слайда, придерживается — поэтому лишние повторы допустимы.
  const order = route.filter((s, i) => s !== route[i - 1]).join(",");
  const onGallery = route.filter((s) => s === 2).length;
  check("колесо проходит все слайды, ничего не проскакивая", order === "1,2,3,4,5" && onGallery >= 3, route.join(","));

  /* ---------- 2. Галерея: панель под окном не прыгает, перемотка работает ---------- */
  await open(2, 4500);
  const main = await center(".card.slot-0 .card-media");
  await page.mouse.click(main.x, main.y);
  await wait(1200);
  const widths = new Set();
  const ratios = new Set();
  for (let i = 0; i < 6; i++) {
    const w = await page.evaluate(() => document.querySelector(".viewer-bar").getBoundingClientRect().width);
    widths.add(Math.round(w));
    ratios.add(await page.evaluate(() => getComputedStyle(document.querySelector(".viewer")).getPropertyValue("--ratio")));
    await page.keyboard.press("ArrowRight");
    await wait(500);
  }
  check("панель кнопок одной ширины у вертикальных и горизонтальных работ", widths.size === 1 && ratios.size > 1, [...widths].join(","));
  const share = await seekTo(".viewer-scrub", ".viewer-frame video", 0.75);
  check("перемотка в галерее: клик на 75% ставит видео на ~75%", Math.abs(share - 0.75) < 0.05, share.toFixed(2));
  await page.keyboard.press("Escape");
  await wait(900);
  check("Esc закрывает просмотр", await page.evaluate(() => getComputedStyle(document.querySelector(".viewer")).display === "none"));

  /* ---------- 3. Отзывы: перемотка появляется со звуком и работает ---------- */
  await open(3, 4500);
  check("без звука перемотки нет", !(await page.$(".review-scrub")));
  const card = await center(".reviews .card.is-center");
  await page.mouse.click(card.x, card.y - 100);
  await wait(800);
  check("со звуком появляется перемотка", Boolean(await page.$(".review-scrub")));
  const reviewShare = await seekTo(".review-scrub", ".reviews .card.is-center video", 0.5);
  check("перемотка отзыва: клик на 50% ставит видео на ~50%", Math.abs(reviewShare - 0.5) < 0.05, reviewShare.toFixed(2));
  check(
    "клик по перемотке не ставит отзыв на паузу",
    await page.evaluate(() => !document.querySelector(".reviews .card.is-center video").paused)
  );

  /* ---------- 4. Экосистема: ссылка на Telegram ---------- */
  await open(4, 3000);
  const tg = await page.$eval('.eco a[href="https://t.me/BBigDesign"]', (a) => ({ target: a.target, text: a.textContent.trim() })).catch(() => null);
  check("в экосистеме есть ссылка на t.me/BBigDesign в новой вкладке", tg?.target === "_blank", tg?.text);

  /* ---------- 5. Консоль ---------- */
  // ERR_ABORTED — это мы сами обрываем загрузку убранных видео, так и задумано.
  const errors = logs.filter((l) => !l.includes("ERR_ABORTED"));
  check("в консоли нет ошибок", errors.length === 0, errors.slice(0, 3).join(" | "));
} finally {
  await shutdown(browser, server);
}

const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} проверок прошли`);
process.exit(failed ? 1 : 0);
