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

## Scope, non-goals, and expert tools

The supported product scope is local BLE control of H617A and H6199 through Home Assistant.  The purpose of the persistent H617A [`0xa3` gradual-change register](https://github.com/teh-hippo/ha-govee-led-ble/issues/131) remains a known protocol unknown.  H617A does not advertise gradual-change support, so the integration preserves the raw boolean and exposes no user-facing behaviour for it.

Wi-Fi provisioning is an expert recovery and investigation tool, not a Home Assistant integration surface.  The guarded workflow is documented under [Writing Wi-Fi credentials to a device](tools/harness/README.md#writing-wi-fi-credentials-to-a-device).  [Home Assistant-integrated provisioning](https://github.com/teh-hippo/ha-govee-led-ble/issues/210) is tracked separately as future work.

The following are intentional non-goals for this integration:

- on-device timers;
- manufacturer-style animated scene previews;
- phone-microphone music-stream injection;
- firmware or OTA updates.

The retained music-stream schema is decode-only evidence support.  It does not provide injection or playback control.

Native H6199 camera calibration is unavailable from the current local interfaces.  The completed [camera-calibration investigation](https://github.com/teh-hippo/ha-govee-led-ble/issues/136) found that the required geometry exchange remains behind the manufacturer's trusted network service.

Cross-SKU evidence, additional device models, Home Assistant quality-scale work, and restart-free integration updates are separate future programmes.  They do not define H617A/H6199 completion.

The final [UX completion evidence matrix](docs/completion-evidence.md) records issue dispositions, cleanup metrics, retained tests and tooling, public-contract parity, and release qualification.

## Advanced Effect Studio prerelease

The prerelease Effect Studio stores the current saved-effect library and durable deployment status in the local Home Assistant instance.  Administrators can browse native scenes, author effects and manage the shared library.  Other authenticated users have read-only access to scenes and understood saved effects; unknown opaque definitions remain administrator-only.

Live apply is enabled when an administrator opens Effect Studio.  Scene selections and device-affecting edits are sent over BLE as ephemeral previews, while Save remains an explicit library action.  Continuous controls are throttled and coalesced so only the newest pending state is written; readback verifies the latest settled preview without delaying further edits.  The Live apply toggle stops queued previews but does not restore the light's earlier state.

Live apply covers native and edited scenes, H617A Painted, Single and Multi effects, H6199 Palette DIY and Special DIY effects, advanced layered effects, music profiles, video profiles and Workshop uploads.

H6199 video saturation, capture area, sound effects, softness, white balance, relative brightness and blank-screen behaviour are edited together in the Effect Studio Video profile.  Saved video profiles provide the automation surface through the standard light effect selector; these interdependent frame settings are not duplicated as standalone entities.

Saved effects overwrite their stable identity after a stale-write check and are deleted permanently.  Deployment status retains content-free source metadata and does not retain unsaved effect bodies.  The editor refuses incompatible backend, schema, compiler or frontend asset versions.

Compatible saved effects also appear by their user-defined names in the standard Home Assistant light effect selector.  Names are unique and cannot reuse native scene, music, video or `off` labels.  Renaming removes the old selector name immediately, so name-based automations must use the new name; deleting removes the selector option.  The `ha_govee_led_ble.apply_custom_effect` action remains stable across renames because it targets the saved effect UUID, and fails after permanent deletion.

Committed native-scene edits become the selected device's default after Live apply completes successfully.  Home Assistant effect selection and automations that select the native scene replay that complete stored scene body, including its speed.  Use **Reset to catalogue** in Effect Studio to apply the catalogue body and default speed before removing the device-specific default.  Type 0 scenes remain selector-only and do not store editable defaults.

### Upgrade and automation migration

- Effect Studio stores only the current saved-effect definition.  Revision history, recovery drafts and restore actions are removed.
- Deleting a saved effect is permanent.  Deployment diagnostics retain content-free metadata only.
- The standalone H617A scene-speed entity is removed.  Edit scene speed in Effect Studio, or apply a native scene atomically through the light effect selector.
- Compatible saved effects appear in the standard light effect selector by name.  Rename updates that selector immediately; UUID-based `ha_govee_led_ble.apply_custom_effect` automations remain stable across renames.
- HACS installs release assets from `ha_govee_led_ble.zip`; default-branch installation is hidden.  Manual installations should extract the same ZIP into `custom_components/ha_govee_led_ble`.

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

Timers, the active-mode sensor and the old mode services were removed.  Segment painting remains available through the `paint_segments`, `set_segment_color` and `set_segment_brightness` entity services.

## Installation

### HACS (recommended)

1. Open **HACS** → three-dot menu → **Custom repositories**
2. Add `https://github.com/teh-hippo/ha-govee-led-ble` as **Integration**
3. Enable **Show beta versions** for the repository when installing a prerelease.
4. Install **Govee LED BLE** and restart Home Assistant.

### Manual

Download `ha_govee_led_ble.zip` from the GitHub release, extract it into `config/custom_components/ha_govee_led_ble/`, and restart Home Assistant.  A source checkout does not contain generated runtime modules; developers building from source must run `make package` and install the resulting ZIP.

## Configuration

The integration auto-discovers nearby supported devices.

To add manually in Home Assistant:

**Settings → Devices & Services → Add Integration → Govee LED BLE**

## Development

```bash
make build
make check
make package
```

`bash scripts/check.sh` remains an alias for `make check`.  The build requires the Node.js version in `.node-version`, locked Python dependencies through [uv](https://docs.astral.sh/uv/), and Kaitai Struct Compiler 0.11.  [mise](https://mise.jdx.dev/) can install the pinned tools, but Make calls the standard tools directly.  `make package` writes the deterministic HACS archive and SHA-256 to `dist/`; byte identity is guaranteed for the pinned CI toolchain.

The production frontend has two generated outputs: `effect-studio-bootstrap.js` and `manifest.json`.  Home Assistant serves them without cache headers, while `editor-loader.js` validates the manifest and retains the stable fallback module.

The project uses [Conventional Commits](https://www.conventionalcommits.org/).

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
