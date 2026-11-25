// Absurd Micro-Startup Pitch-Off — entrypoint (Node 22, stdlib only).
// Reads the one-sentence pitch from one-line.txt, validates it against the
// bounty gate (1-200 chars, single line, no stray whitespace or control
// characters, ends with terminal punctuation), then writes it to
// /output/entry.txt for the sealed scorer. Also prints it for local runs.
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MAX_CHARS = 200;
const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR || "/output";

const raw = readFileSync(new URL("./one-line.txt", import.meta.url), "utf8");
const line = raw.replace(/\n$/, "");

// Each rule is [label, passes?]; every failing rule is reported, then we stop.
const rules: Array<[string, boolean]> = [
  ["empty line", line.length > 0],
  [`too long: ${[...line].length}/${MAX_CHARS} characters`, [...line].length <= MAX_CHARS],
  ["leading or trailing whitespace", line === line.trim()],
  ["carriage return found", !line.includes("\r")],
  ["more than one line", !line.includes("\n")],
  ["double space inside the line", !/\s{2,}/.test(line)],
  ["control character inside the line", !/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(line)],
  ["unbalanced double quotes", (line.match(/"/g) || []).length % 2 === 0],
  ["a pitch needs more than one word", /\s/.test(line)],
  ["must end with terminal punctuation", /[.!?]["']?$/.test(line)],
];

const failures = rules.filter(([, ok]) => !ok).map(([label]) => label);
if (failures.length > 0) {
  for (const f of failures) console.error(`FAIL: ${f}`);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, "entry.txt"), line + "\n");

console.log(line);
console.log(`OK: ${[...line].length}/${MAX_CHARS} characters, single line, pitch delivered.`);
