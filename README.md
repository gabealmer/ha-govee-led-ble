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

The prerelease Effect Studio stores its library, recovery drafts and deployment status in the local Home Assistant instance.  Administrators can browse native scenes, author effects and manage the shared library.  Other authenticated users have read-only access to scenes and understood saved effects; unknown opaque definitions remain administrator-only.

H617A Painted, Single and Multi effects can be applied locally over BLE.  Advanced layered effects are limited to editing, preview and save operations.  H6199 custom-effect writes are unavailable.

Recovery drafts are private to their Home Assistant user.  Deployment status does not expose unsaved effect snapshots.  The editor refuses incompatible backend, schema, compiler or frontend asset versions.

The device configuration link retains the stable editor route.  Installing a stable build uses `frontend/editor.js` and ignores prerelease Effect Studio storage.

### Development deployment

The pushed `ux` branch can be installed through HACS without creating a release:

```bash
bash tools/harness/deploy-dev.sh frontend
```

After the stable frontend loader has been activated once, frontend deployments need only a
browser refresh. Python integration changes still require:

```bash
bash tools/harness/deploy-dev.sh backend
```

followed by a Home Assistant restart. The command refuses dirty or unpushed worktrees and
verifies the manifest-selected bundle served by Home Assistant.

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
