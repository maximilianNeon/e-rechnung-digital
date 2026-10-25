import { fileURLToPath } from "node:url";
import { build } from "esbuild";

// zugferd-ts is bundled from the site's node_modules, which carries the
// namespace fix in ../patches. Everything else stays a runtime dependency.
const patchedZugferd = fileURLToPath(
  new URL("../node_modules/zugferd-ts/dist/index.js", import.meta.url),
);

await build({
  entryPoints: ["src/index.ts"],
  outfile: "dist/index.js",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  external: ["@modelcontextprotocol/sdk", "zod", "pdf-lib", "happy-dom", "xmlbuilder2"],
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
