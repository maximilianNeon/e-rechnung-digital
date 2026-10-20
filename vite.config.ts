import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ["events", "url", "buffer", "stream", "util", "string_decoder"],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
});
