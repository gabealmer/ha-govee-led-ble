# Govee LED BLE for Home Assistant

[![HACS][hacs-badge]][hacs-url]
[![GitHub Release][release-badge]][release-url]
[![Validate][validate-badge]][validate-url]
[![Home Assistant][ha-badge]][ha-url]

Local BLE control of supported Govee LED strips from Home Assistant, with no cloud dependency.

## Supported Devices

All models support on/off, brightness, RGB color, color temperature, and state readback.

- **H617A**: LED Strip · 83 scenes · 11 music modes
- **H6199**: DreamView T1 · 240 scenes · video and music modes · advanced controls

## Advanced Effect Studio prerelease

The prerelease Effect Studio stores its library, recovery drafts and durable deployment status in the local Home Assistant instance.  Administrators can browse native scenes, author effects and manage the shared library.  Other authenticated users have read-only access to scenes and understood saved effects; unknown opaque definitions remain administrator-only.

Live apply is enabled when an administrator opens Effect Studio.  Scene selections and device-affecting edits are sent over BLE as ephemeral previews, while Save remains an explicit library action.  Continuous controls are throttled and coalesced so only the newest pending state is written; readback verifies the latest settled preview without delaying further edits.  The Live apply toggle stops queued previews but does not restore the light's earlier state.

Live apply covers native and edited scenes, H617A Painted, Single and Multi effects, H6199 Palette DIY and Special DIY effects, advanced layered effects, music profiles, video profiles and Workshop uploads.  Workshop uploads do not have an evidenced activation command, so the editor reports the write without claiming visible activation.

Recovery drafts are private to their Home Assistant user.  Deployment status does not expose unsaved effect snapshots.  The editor refuses incompatible backend, schema, compiler or frontend asset versions.

Five reviewed H617A scene identities have capture-backed visual previews: four static observations and one directional sweep.  The generated runtime asset is derived from the [scene visual evidence catalogue](tools/ble/scene_visual_evidence.yaml), keyed only by SKU, scene ID and effect ID.  These are reviewed recorded captures with spatial lane calibration, not BLE protocol renderings.  Camera colour remains uncalibrated, and the editor presents each recording's limitations.  The other 78 pending profiles retain structural or opaque previews.

The device configuration link retains the stable editor route.  Installing a stable build uses `frontend/editor.js` and ignores prerelease Effect Studio storage.

### Development deployment

Use the isolated Home Assistant Container harness rather than changing the household Home Assistant instance.  It bind-mounts the current integration, automates the temporary BLE ownership handover, and restores the household config entry during teardown:

```bash
bash tools/harness/container.sh frontend strip  # optional live Vite module
bash tools/harness/container.sh up strip
bash tools/harness/container.sh status strip
bash tools/harness/container.sh restart strip   # reload Python changes
bash tools/harness/container.sh down strip
```

See the [container harness instructions](tools/harness/README.md#isolated-home-assistant-container) for local secrets, device opt-in, dry-run checks and live frontend loading.

## Version 6 migration

Version 6 replaces the custom frontend and parallel mode controls with Home Assistant's native light effect selector.
Effect families are configured from the integration options. H617A enables Scenes and Music by default, while H6199
enables Video by default.

Timers, saved custom effects, the active-mode sensor and the old mode services have been removed. Segment painting
remains available through the `paint_segments`, `set_segment_color` and `set_segment_brightness` entity services.

## Installation

### HACS (recommended)

1. Open **HACS** → three-dot menu → **Custom repositories**
2. Add `https://github.com/teh-hippo/ha-govee-led-ble` as **Integration**
3. Install **Govee LED BLE** and restart Home Assistant

### Manual

Copy `custom_components/ha_govee_led_ble/` into your HA `custom_components/` directory and restart.

## Configuration

The integration auto-discovers nearby supported devices.

To add manually in Home Assistant:

**Settings → Devices & Services → Add Integration → Govee LED BLE**

## Development

```bash
bash scripts/check.sh
```

Requires [uv](https://docs.astral.sh/uv/). Uses [Conventional Commits](https://www.conventionalcommits.org/).

## License

MIT

[hacs-badge]: https://img.shields.io/badge/HACS-Custom-41BDF5.svg
[hacs-url]: https://github.com/hacs/integration
[release-badge]: https://img.shields.io/github/v/release/teh-hippo/ha-govee-led-ble
[release-url]: https://github.com/teh-hippo/ha-govee-led-ble/releases
[validate-badge]: https://img.shields.io/github/actions/workflow/status/teh-hippo/ha-govee-led-ble/validate.yml?branch=master&label=validate
[validate-url]: https://github.com/teh-hippo/ha-govee-led-ble/actions/workflows/validate.yml
[ha-badge]: https://img.shields.io/badge/HA-2026.3%2B-blue.svg
[ha-url]: https://www.home-assistant.io
