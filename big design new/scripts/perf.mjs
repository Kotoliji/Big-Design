// Замер плавности анимаций в настоящем Chrome.
//
//   npm run perf                       — интро с видеокартой
//   npm run perf -- --nogpu            — интро без видеокарты
//   npm run perf -- --path "/?slide=1" --ms 6000
//   npm run perf -- --prod             — на собранной версии (после npm run build), как у посетителя
//   --resources                        — показать файлы, которые грузились дольше 150 мс
//
// Во время замера не запускай ничего тяжёлого параллельно (сборку, второй Chrome) — цифры поплывут.
//
// Пишет время каждого кадра (requestAnimationFrame) и делит запись на фазы:
// колода → заставка (от появления .finale) → после интро.
// Кадр дольше 50 мс глаз видит как рывок.
import { collectConsole, launchBrowser, parseArgs, shutdown, startServer } from "./lib/browser.mjs";

const args = parseArgs(process.argv.slice(2));
const pagePath = args.path ?? "/";
const durationMs = Number(args.ms ?? 10_000);
const gpu = !args.nogpu;

const JANK_MS = 50;
const BUDGET = { p95: 25, jank: 3 };

function recordFrames() {
  const frames = [];
  const marks = {};
  const longTasks = [];
  window.__perf = { frames, marks, longTasks };

  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) longTasks.push({ start: e.startTime, ms: e.duration });
  }).observe({ type: "longtask", buffered: true });

  const tick = (t) => {
    frames.push(t);
    if (marks.finale === undefined && document.querySelector(".finale")?.style.visibility === "visible") {
      marks.finale = t;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function summarize(name, frames) {
  if (frames.length < 2) return null;
  const deltas = frames.slice(1).map((t, i) => t - frames[i]).sort((a, b) => a - b);
  const span = frames.at(-1) - frames[0];
  const p95 = deltas[Math.floor(deltas.length * 0.95)];
  const jank = deltas.filter((d) => d > JANK_MS).length;
  const ok = p95 <= BUDGET.p95 && jank <= BUDGET.jank;
  return {
    phase: name,
    "fps": Math.round(((frames.length - 1) / span) * 1000),
    "p95, ms": +p95.toFixed(1),
    "max, ms": +deltas.at(-1).toFixed(1),
    [`>${JANK_MS}ms`]: jank,
    verdict: ok ? "ok" : "ЛАГ",
  };
}

const server = await startServer({ prod: Boolean(args.prod) });
const browser = await launchBrowser({ gpu });
let failed = false;

try {
  const page = await browser.newPage();
  const logs = collectConsole(page);
  await page.evaluateOnNewDocument(recordFrames);
  await page.goto(server.origin + pagePath, { waitUntil: "domcontentloaded" });
  await new Promise((r) => setTimeout(r, durationMs));

  const { frames, marks, longTasks } = await page.evaluate(() => window.__perf);
  const resources = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .filter((r) => /\.(glb|mp4|jpg|png|js)(\?|$)/.test(r.name) && r.duration > 150)
      .map((r) => ({ file: r.name.replace(location.origin, ""), start: r.startTime, end: r.responseEnd }))
  );
  const finale = marks.finale ?? Infinity;
  const finaleEnd = finale + 4_500; // blurIn + expand + unblur + гашение букв

  const rows = [
    summarize("колода", frames.filter((t) => t < finale)),
    summarize("заставка", frames.filter((t) => t >= finale && t < finaleEnd)),
    summarize("после", frames.filter((t) => t >= finaleEnd)),
  ].filter(Boolean);

  const mode = [gpu ? "с видеокартой" : "БЕЗ видеокарты", args.prod ? "prod" : "dev"].join(", ");
  console.log(`\n${pagePath}  ·  ${mode}  ·  ${durationMs} мс`);
  console.table(rows);
  const worst = frames
    .slice(1)
    .map((t, i) => ({ at: frames[i], ms: t - frames[i] }))
    .filter((f) => f.ms > JANK_MS)
    .sort((a, b) => b.ms - a.ms)
    .slice(0, 8);
  if (worst.length) {
    console.log("Худшие кадры:", worst.map((f) => `${Math.round(f.ms)}мс@${Math.round(f.at)}`).join(", "));
  }
  if (args.resources && resources.length) {
    console.log("Долгие загрузки:");
    resources.forEach((r) => console.log(`  ${Math.round(r.start)}→${Math.round(r.end)} мс  ${r.file}`));
  }
  if (longTasks.length) {
    const worstTasks = longTasks.sort((a, b) => b.ms - a.ms).slice(0, 5);
    console.log("Долгие задачи JS (топ-5):", worstTasks.map((l) => `${Math.round(l.ms)}мс@${Math.round(l.start)}`).join(", "));
  }
  const errors = logs.filter((l) => !/WebGL context|WebGLRenderer|X4122/.test(l));
  if (errors.length) console.log("Консоль:\n" + errors.join("\n"));
  failed = rows.some((r) => r.verdict !== "ok");
} finally {
  await shutdown(browser, server);
}

process.exit(failed ? 1 : 0);
