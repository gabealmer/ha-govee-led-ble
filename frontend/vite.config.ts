import { readdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import {
  EDITOR_API_VERSION,
  EDITOR_ASSET_VERSION,
  EFFECT_COMPILER_VERSION,
  EFFECT_SCHEMA_VERSION,
} from "./src/contracts";

function editorManifest(): Plugin {
  const outputDirectory = resolve(
    import.meta.dirname,
    "../custom_components/ha_govee_led_ble/frontend",
  );
  return {
    name: "editor-manifest",
    buildStart() {
      for (const filename of readdirSync(outputDirectory)) {
        if (
          filename === "manifest.json" ||
          filename.startsWith("effect-studio-bootstrap.")
        ) {
          rmSync(resolve(outputDirectory, filename));
        }
      }
    },
    generateBundle(_options, bundle) {
      const entry = Object.values(bundle).find(
        (asset) => asset.type === "chunk" && asset.isEntry,
      );
      if (!entry || entry.type !== "chunk") {
        throw new Error("Editor bootstrap entry was not generated");
      }
      this.emitFile({
        type: "asset",
        fileName: "manifest.json",
        source: `${JSON.stringify({
          bootstrap: entry.fileName,
          asset_version: EDITOR_ASSET_VERSION,
          api_version: EDITOR_API_VERSION,
          effect_schema_version: EFFECT_SCHEMA_VERSION,
          compiler_version: EFFECT_COMPILER_VERSION,
        }, null, 2)}\n`,
      });
    },
  };
}

export default defineConfig({
  plugins: [editorManifest()],
  build: {
    outDir: resolve(
      import.meta.dirname,
      "../custom_components/ha_govee_led_ble/frontend",
    ),
    emptyOutDir: false,
    target: "es2022",
    rollupOptions: {
      input: resolve(import.meta.dirname, "src/panel.ts"),
      output: {
        entryFileNames: "effect-studio-bootstrap.[hash].js",
        chunkFileNames: "effect-studio.[hash].js",
        assetFileNames: "effect-studio.[hash][extname]",
      },
    },
  },
});
