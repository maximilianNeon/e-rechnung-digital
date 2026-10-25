// Builds the Claude Desktop extension: one self-contained server file, no node_modules.
import { copyFile, writeFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const here = (path) => fileURLToPath(new URL(path, import.meta.url));
const patchedZugferd = here("../../node_modules/zugferd-ts/dist/index.js");

await build({
  entryPoints: [here("../src/index.ts")],
  outfile: here("server/index.js"),
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  // Some bundled CommonJS deps call require(); give the ESM bundle one.
  banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" },
  plugins: [
    {
      name: "patched-zugferd",
      setup(b) {
        b.onResolve({ filter: /^zugferd-ts$/ }, () => ({ path: patchedZugferd }));
      },
    },
  ],
  logLevel: "info",
});

const pkg = JSON.parse(await readFile(here("../package.json"), "utf8"));
const manifest = JSON.parse(await readFile(here("manifest.json"), "utf8"));
manifest.version = pkg.version;
await writeFile(here("manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
await copyFile(here("../../public/icon-512.png"), here("icon.png"));
