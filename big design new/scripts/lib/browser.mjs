// Общие утилиты для проверочных скриптов (perf.mjs, shot.mjs):
// свой dev-сервер Vite на свободном порту + системный Chrome через puppeteer-core.
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { createServer, preview } from "vite";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const CHROME_PATHS = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].filter(Boolean);

// --key value / --flag → { key: "value", flag: true }
export function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i].replace(/^--/, "");
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) out[key] = true;
    else out[key] = argv[++i];
  }
  return out;
}

// prod: true — отдаём собранный dist (нужен `npm run build`). Для замеров производительности:
// dev-сервер собирает модули на лету, и это добавляет рывки, которых у посетителей не будет.
export async function startServer({ prod = false } = {}) {
  if (prod && !existsSync(path.join(ROOT, "dist/index.html"))) {
    throw new Error("Нет dist/ — сначала npm run build");
  }
  const server = prod
    ? await preview({ root: ROOT, logLevel: "silent", preview: { port: 5400, strictPort: false } })
    : await createServer({ root: ROOT, logLevel: "silent", server: { port: 5300, strictPort: false } });
  if (!prod) await server.listen();
  return {
    origin: server.resolvedUrls.local[0].replace(/\/$/, ""),
    close: () => (prod ? server.httpServer.close() : server.close()),
  };
}

// gpu: false — режим «Chrome без видеокарты»: WebGL нет, всё рисует процессор.
export async function launchBrowser({ gpu = true, width = 1920, height = 1080 } = {}) {
  const executablePath = CHROME_PATHS.find((p) => existsSync(p));
  if (!executablePath) throw new Error("Chrome не найден — укажи путь в CHROME_PATH");

  const gpuArgs = gpu
    ? ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"]
    : ["--disable-gpu", "--disable-software-rasterizer"];

  return puppeteer.launch({
    executablePath,
    headless: true,
    args: [...gpuArgs, "--autoplay-policy=no-user-gesture-required"],
    defaultViewport: { width, height },
    protocolTimeout: 180_000,
  });
}

// Закрыть Chrome и сервер, даже если вкладка упала и Chrome перестал отвечать.
export async function shutdown(browser, server) {
  const timeout = () => new Promise((resolve) => setTimeout(resolve, 5_000));
  await Promise.race([browser.close().catch(() => {}), timeout()]);
  browser.process()?.kill("SIGKILL");
  await Promise.race([server.close(), timeout()]);
}

export function collectConsole(page) {
  const logs = [];
  page.on("console", (m) => {
    if (["error", "warning"].includes(m.type())) logs.push(`[${m.type()}] ${m.text()}`);
  });
  page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));
  page.on("error", (e) => logs.push(`[ВКЛАДКА УПАЛА] ${e.message}`));
  page.on("requestfailed", (r) => logs.push(`[requestfailed] ${r.url()} ${r.failure()?.errorText}`));
  return logs;
}
