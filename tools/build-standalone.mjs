/**
 * Inlines the ES modules that tools/reach-trials.html imports, producing a
 * single file that opens by double-click. Browsers refuse module imports over
 * file://, and the trainer needs to stay runnable without a dev server.
 *
 *   node tools/build-standalone.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(here, "reach-trials.html");
const OUT = resolve(here, "reach-trials.standalone.html");

const IMPORT = /^\s*import\s+\{([^}]*)\}\s+from\s+["']([^"']+)["'];?\s*$/gm;
const EXPORT = /^\s*export\s+(?=(const|function|let|class))/gm;

/** Depth-first inline of a module and everything it imports, each emitted once. */
function inline(path, seen = new Set()) {
  const abs = resolve(path);
  if (seen.has(abs)) return "";
  seen.add(abs);
  const src = readFileSync(abs, "utf8");
  const deps = [...src.matchAll(IMPORT)]
    .map(m => inline(resolve(dirname(abs), m[2]), seen))
    .join("\n");
  return deps + "\n" + src.replace(IMPORT, "").replace(EXPORT, "");
}

const page = readFileSync(SRC, "utf8");
const imports = [...page.matchAll(IMPORT)];
if (!imports.length) throw new Error("no module imports found in reach-trials.html");

const seen = new Set();
const bundled = imports.map(m => inline(resolve(dirname(SRC), m[2]), seen)).join("\n");

const out = page
  .replace('<script type="module">', "<script>\n/* --- inlined from src/ by tools/build-standalone.mjs — edit the modules, not this file --- */\n" + bundled + "\n/* --- end inlined --- */")
  .replace(IMPORT, "")
  .replace("<title>Gesture Glove — Reach Trials</title>", "<title>Gesture Glove — Reach Trials</title>\n<!-- GENERATED FILE. Source: tools/reach-trials.html + src/*.js -->");

writeFileSync(OUT, out);
console.log(`built ${OUT} (${(out.length/1024).toFixed(1)} KB, ${seen.size} modules inlined)`);
