const staticBase = new URL("./", import.meta.url);

async function loadEditor() {
  const manifestUrl = new URL("manifest.json", staticBase);
  manifestUrl.searchParams.set("cache", String(Date.now()));
  const response = await fetch(manifestUrl, {
    cache: "no-store",
    credentials: "same-origin",
  });
  if (!response.ok) {
    throw new Error(`Effect Studio manifest returned HTTP ${response.status}`);
  }
  const manifest = await response.json();
  const bootstrap = manifest?.bootstrap;
  if (
    typeof bootstrap !== "string" ||
    !/^effect-studio-bootstrap\.[A-Za-z0-9_-]+\.js$/.test(bootstrap)
  ) {
    throw new Error("Effect Studio manifest contains an invalid bootstrap asset");
  }
  await import(new URL(bootstrap, staticBase).href);
}

try {
  await loadEditor();
} catch (error) {
  console.error("Effect Studio failed to load.", error);
  if (!customElements.get("ha-govee-led-ble-editor")) {
    customElements.define(
      "ha-govee-led-ble-editor",
      class extends HTMLElement {
        connectedCallback() {
          this.render();
        }

        set panel(value) {
          this.panelConfig = value;
          this.render();
        }

        render() {
          if (!this.isConnected) {
            return;
          }
          const configurationPath =
            this.panelConfig?.config?.configuration_path ??
            "/config/integrations/integration/ha_govee_led_ble";
          this.innerHTML = `
            <style>
              :host { display: block; padding: 24px; }
              ha-card { margin: 0 auto; max-width: 640px; padding: 24px; }
              h1 { margin: 0 0 16px; font-size: 24px; }
              p { margin: 0 0 20px; line-height: 1.5; }
            </style>
            <ha-card>
              <h1>Effect Studio is unavailable</h1>
              <p>The development frontend could not be loaded. Refresh after the deployment completes.</p>
              <a href="${configurationPath}">Open integration configuration</a>
            </ha-card>
          `;
        }
      },
    );
  }
}
