// Скриншот страницы в настоящем Chrome.
//
//   npm run shot -- --path "/?slide=1&freeze" --wait 10000 --out .shots/about.png
//   npm run shot -- --nogpu --width 390 --height 844
//
// --at 1500,4600,9000 — серия кадров по таймлайну (от начала загрузки) вместо одного.
import { mkdirSync } from "node:fs";
import path from "node:path";
import { ROOT, collectConsole, launchBrowser, parseArgs, shutdown, startServer } from "./lib/browser.mjs";

const args = parseArgs(process.argv.slice(2));
const pagePath = args.path ?? "/";
const out = path.resolve(ROOT, args.out ?? ".shots/shot.png");
const moments = String(args.at ?? args.wait ?? 8_000).split(",").map(Number);

mkdirSync(path.dirname(out), { recursive: true });

const server = await startServer({ prod: Boolean(args.prod) });
const browser = await launchBrowser({
  gpu: !args.nogpu,
  width: Number(args.width ?? 1920),
  height: Number(args.height ?? 1080),
});

try {
  const page = await browser.newPage();
  const logs = collectConsole(page);
  const t0 = Date.now();
  await page.goto(server.origin + pagePath, { waitUntil: "domcontentloaded" });

  for (const at of moments) {
    const left = at - (Date.now() - t0);
    if (left > 0) await new Promise((r) => setTimeout(r, left));
    const file = moments.length > 1 ? out.replace(/\.png$/, `_${at}.png`) : out;
    try {
      await page.screenshot({ path: file });
      console.log(path.relative(ROOT, file));
    } catch (e) {
      console.log(`${at} мс: снимок не удался — ${e.message}`);
    }
  }
  if (logs.length) console.log(logs.join("\n"));
} finally {
  await shutdown(browser, server);
}
process.exit(0);
