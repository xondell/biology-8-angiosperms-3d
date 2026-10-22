import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = fileURLToPath(new URL("../", import.meta.url));
process.chdir(root);
await fs.mkdir("build", { recursive: true });
await build({
  entryPoints: ["src/three/main.js"],
  outfile: "build/model-bundle.js",
  bundle: true,
  minify: true,
  format: "iife",
  target: ["es2020"],
  legalComments: "inline",
});
await import("../src/presentation.mjs");
