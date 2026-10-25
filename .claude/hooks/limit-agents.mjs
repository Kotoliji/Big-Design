// Лимит агентов: не больше MAX запусков инструмента Agent за одну сессию Claude Code.
// Счётчик — файл во временной папке, свой на каждую сессию.
// Сбросить вручную: удалить %TEMP%\claude-agents-<id сессии>.txt
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const MAX = 2;

const input = JSON.parse(readFileSync(0, "utf8") || "{}");
const session = String(input.session_id || "unknown").replace(/[^\w-]/g, "");
const counter = path.join(tmpdir(), `claude-agents-${session}.txt`);

let used = 0;
try {
  used = Number(readFileSync(counter, "utf8")) || 0;
} catch {
  // файла нет — в этой сессии агентов ещё не было
}

if (used >= MAX) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: `Лимит агентов: ${MAX} за сессию уже использованы. Делай работу сам, без агентов.`,
      },
    })
  );
} else {
  writeFileSync(counter, String(used + 1));
}
