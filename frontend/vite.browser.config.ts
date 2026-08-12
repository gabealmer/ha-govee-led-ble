import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  root: resolve(import.meta.dirname, "tests/harness"),
  server: {
    fs: {
      allow: [import.meta.dirname],
    },
  },
});
