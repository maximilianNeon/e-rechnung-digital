import { build } from "esbuild";

await build({
  entryPoints: ["src/index.ts"],
  outfile: "dist/index.js",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  // Runtime deps come from this package's node_modules, the shared lib is bundled in.
  packages: "external",
  logLevel: "info",
});
