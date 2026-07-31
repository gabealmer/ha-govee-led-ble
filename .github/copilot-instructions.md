# Copilot instructions for `ha-govee-led-ble`

## Build, lint, and test commands

- Full local preflight (matches CI):  
  `bash scripts/check.sh`
- Completion gate: after making changes, `bash scripts/check.sh` must pass; if it fails, fix the issue and rerun until it passes, then capture any durable repo-specific lesson in these instructions.
- Run a single test:  
  `uv run pytest tests/test_protocol.py::test_parse -q`

`check.sh` owns the stage list and the exact flags. Do not restate them here: a second copy drifts silently, and the version that lived here had already lost the `--no-sync` the script uses.

## High-level architecture

- This is a Home Assistant custom integration (`domain: ha_govee_led_ble`) for local BLE control of supported Govee models (currently H617A and H6199).
- `config_flow.py` handles discovery/manual setup, infers model from BLE local name, and creates config entries keyed by device address.
- `__init__.py` creates one `GoveeBLECoordinator` per config entry, performs first refresh, removes legacy entities, and forwards setup to the platforms listed in its `PLATFORMS` constant.
- The coordinator is split across `coordinator*.py`: BLE connect/reconnect lifecycle, notification subscription, keep-alive/state queries, optimistic state fields, and bounded raw packet logging for diagnostics.
- `protocol.py` is the single source of truth for BLE packet encoding/decoding (20-byte packets with XOR checksum), including query packets and parsing of color-mode status payloads.
- `light.py` is the primary control surface, with the custom services in `light_services.py`.
- `h6199_controls.py` contains shared advanced control entities for Number/Select/Switch; `number.py`, `select.py`, and `switch.py` are thin entry-point wrappers.
- `scenes.py` stores and decodes the H617A scene catalog used by light effect selection.

Name a module here only when something else in this file depends on knowing it exists. A full inventory rots: the last one still listed four platforms after there were seven.

## Key repository conventions

- Model capabilities are declared in `const.py` via `ModelProfile` fields (`supports_video_mode`, `supports_diy`, `static_readback_echoes_color`, etc.); new model behavior should be wired through a profile field first, then entity setup. Some capabilities are derived rather than declared (`supports_segments`, `supports_music_mode`, `custom_effect_kinds` are properties), so check before trying to set one.
- Prefer root-cause refactoring over band-aid fixes; when behavior crosses layers, update shared paths instead of patching a single call site.
- Treat changes holistically across capabilities, protocol encode/decode, coordinator state handling, entity/service wiring, diagnostics, and tests so behavior stays consistent.
- Advanced entities are capability-gated at setup time (see `h6199_controls.py`), so unsupported controls are not created for a model.
- Keep BLE packet construction/parsing centralized in `protocol.py`; do not hardcode packet bytes in entity/coordinator code.
- State writes are optimistic but guarded:
  - `light.py` uses `_rollback()` snapshots plus `_refresh_with_retry()` verification for state-readable models.
  - `h6199_controls.py` uses `_set_with_rollback()` around reapply callbacks.
- Effect names are normalized (`_normalize_effect_name`) before lookup/comparison; preserve this normalization path when adding new effects/services.
- `scripts/check.sh` is treated as the authoritative local validation flow and should stay aligned with `.github/workflows/validate.yml`.

## Protocol documentation: source of truth

The reverse-engineered wire protocol has one canonical hierarchy. Higher wins on any disagreement:

1. **Captures** are ground truth (`tools/ble/govee-capture.sh`, decoded with `tools/ble/decode_govee.py`).
2. **`custom_components/ha_govee_led_ble/protocol.py`** owns encoders and algorithms (XOR, gamma, percent scaling, A3 fragmentation). Treat it as a fallible oracle: wire bytes win.
3. **The Kaitai specs in `tools/ble/kaitai/*.ksy`** own decoded wire STRUCTURE: field offsets, layouts, enums and their evidence.
4. **The frozen `tools/ble/catalogues/*.json`** own scene/effect catalogue data.

There is no prose tier. `docs/` holds no protocol content at all: the retired references duplicated the specs and shipped real errors. If a wire fact is not in a `.ksy`, it is not documented.

Rules that follow from this:

- NEVER restate field layouts, byte offsets or enum values outside a `.ksy`. Reference the owning type or field instead (e.g. "see `govee_common::diy_selector`").
- Every `.ksy` field carries exactly one evidence tag in its doc: `[CONFIRMED_LIVE]` or `[INFERRED]`. `evidence_lint.py` runs inside `scripts/check.sh` and fails if any field is untagged. Promote a tag only with a capture that isolates the field.
- A field you cannot evidence is deleted, not weakly labelled. There used to be a third tag, `[INHERITED]`, for bytes modelled from the write side with no read-direction capture; it emptied out because this rule kept winning, and the gate now rejects it by name. Removing a field loses nothing, since the bytes stay in an unnamed window.
- A tag may never outlive its support. If the evidence a tag rests on is removed, downgrade the tag in the same change. `evidence_lint.py` checks that a tag exists, not that it is honest.
- Only the H617A is modelled, and a second model's spec starts from bytes, never from `protocol.py`. The H6199 has beliefs in the integration and no captured bytes, so it has no spec: writing one from the encoder and checking captures against it afterwards is the integration validating itself. `kst_runner.check_every_spec_is_exercised` makes that mechanical rather than a rule to remember, by hard-erroring on any `.ksy` outside the transitive import closure of the fixtured specs. So an `h6199_*.ksy` cannot be committed before an H6199 fixture reads it, and its first field is written from a capture. Name new-model specs `h6199_*`, do not import `govee_common` into them (it is proven on H617A captures only, and its own charter is proven sameness rather than convenience), and do not pre-create a shared `h6199_common` either. Nothing learned about either model may be used to infer the other's behaviour.
- An unproven belief about a model lives in `const.py` as a self-falsifying `ModelProfile` field, not as a spec field. `static_readback_echoes_color` is the template: a name that states the claim, a comment saying where it came from and what settles it. That keeps `.ksy` free of fields nobody has observed while the belief stays visible and testable.
- The verification backlog is not a file in this repo. Open questions belong in the `doc:` of the field they concern.
- Fixtures are data, not code. Each case is a `tools/ble/kaitai/spec/*.kst` file naming its bytes in `src/*.bin`, and the corpus is committed, so the gate checks the same fixtures on a fresh clone as it does locally. Never point a fixture at the capture mount.
- Claims that span fixtures go in `spec/_aggregates.yaml`: value spreads (`distinct_at_least`, `count_at_least`) and pairwise differentials (`differs_at`, `differs_within`, `equal_at`). A differential is the half of an isolation proof that says nothing ELSE moved, and it is the half a per-field port silently drops.
- The runner hard-errors rather than skipping: an assert it cannot evaluate, a fixture no case reads, a spec no fixture exercises, an aggregate matching no case, or a differential between identical fixtures. Keep it that way; a suite that quietly skips is worse than one that is absent.
- Encoder parity belongs in `tests/test_protocol_wire_parity.py`, which reads the same `src/*.bin`. It must not import a generated Kaitai parser: those are build products compiled by the separate CI Kaitai job, so such a test passes locally and fails in the test job.
- After editing any `.ksy`, recompile before trusting the fixtures: the generated `*.py` parsers are gitignored build products and go stale silently.
  `node tools/ble/kaitai/compile.js tools/ble/kaitai/<spec>.ksy`
  then `uv run --no-sync python tools/ble/kaitai/kst_runner.py`.
