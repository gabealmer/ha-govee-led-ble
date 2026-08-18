# UX completion evidence

This matrix reconciles the UX completion programme against the final remediation work.  A row is complete only when the repository, GitHub issue, automated evidence, physical evidence, or an explicit non-goal records its disposition.

## Programme findings

| Audit finding | Status | Durable evidence |
| --- | --- | --- |
| Original issue #165 | Complete | [Issue #165](https://github.com/teh-hippo/ha-govee-led-ble/issues/165) is closed.  Layered scenes decode into canonical, raw-preserving content and round-trip through Kaitai-owned structures. |
| Open-issue triage | Corrected | Current open issues are classified below.  Current-model issues #112, #125, #130, #131 and #166 are closed with evidence. |
| Explicit exclusions | Corrected | [README scope and non-goals](../README.md#scope-non-goals-and-expert-tools) records expert, future, unavailable, and intentional non-goal boundaries. |
| One-off tooling | Corrected | Completed protocol probes were removed.  [Harness tool ownership](../tools/harness/README.md#tool-ownership) maps every retained utility family to a supported workflow. |
| Repository cleanup depth | Complete | Four behaviour-preserving passes and an independent residual audit removed dead APIs, duplicate validation, compatibility façades, stale constants, unused dependencies, completed probes, test-only production code, and historical narration. |
| Frontend decomposition | Complete | `panel.ts` is 1,268 lines, `scene-browser.ts` is 587 lines, and `advanced-effect-editor.ts` is 830 lines.  Rendering and event translation remain in components; persistence, concurrency, transitions, preview scheduling, and mutation ownership moved to focused controllers/models. |
| Test reduction | Corrected with range waiver | The final suite contains 1,052 Python cases and 19,570 lines.  Coverage-context analysis found only the redundant groups listed below; the remaining excess protects distinct critical branches. |
| Source reduction figures | Corrected | [`scripts/report_source_size.py`](../scripts/report_source_size.py) provides one fixed category definition for arbitrary Git refs. |
| Public contract parity | Complete | [`scripts/report_public_contracts.py`](../scripts/report_public_contracts.py) reports static public contracts.  The signed cleanup baseline and validated remediation implementation match for platforms, services, WebSocket commands, storage, diagnostics, translations, legacy entity suffixes, and scene catalogues. |
| Release qualification | Pending release step only | The remediation implementation passes the authoritative gate, deterministic local package comparison, isolated production-package UX checks, and physical state restoration.  Exact-SHA `v6.5.0-rc.16` publication, HACS qualification, and household upgrade remain. |

## Open issue matrix

| Issue | Disposition | Blocks H617A/H6199 completion |
| --- | --- | --- |
| [#129: Fountain body from a larger device](https://github.com/teh-hippo/ha-govee-led-ble/issues/129) | Cross-hardware evidence request. | No |
| [#148: H7025 music cross-validation](https://github.com/teh-hippo/ha-govee-led-ble/issues/148) | Cross-SKU evidence and potential model contribution. | No |
| [#115: H6102](https://github.com/teh-hippo/ha-govee-led-ble/issues/115), [#117: H6125](https://github.com/teh-hippo/ha-govee-led-ble/issues/117) | Additional-model future programme. | No |
| [#96: quality-scale tracking](https://github.com/teh-hippo/ha-govee-led-ble/issues/96) | `7.0.0` quality tracking; all applicable in-repository rules are complete. | No |
| [#210: Home Assistant Wi-Fi provisioning](https://github.com/teh-hippo/ha-govee-led-ble/issues/210) | Future administrator-only integration.  The existing expert CLI workflow remains supported. | No |

## Closed completion-audit issues

| Issue | Result |
| --- | --- |
| [#131](https://github.com/teh-hippo/ha-govee-led-ble/issues/131) | APK analysis identifies `0xa3` as the gradual-colour-change switch and classifies H617A goods type 73 as unsupported.  Six paired false/true comparisons across native scenes, segment paint, and immediate static colour changes showed no visible difference; read-back and final restoration were verified. |
| [#92](https://github.com/teh-hippo/ha-govee-led-ble/issues/92), [#93](https://github.com/teh-hippo/ha-govee-led-ble/issues/93), [#94](https://github.com/teh-hippo/ha-govee-led-ble/issues/94), [#95](https://github.com/teh-hippo/ha-govee-led-ble/issues/95) | The full quality inventory, strict production typing, packaged `py.typed`, manual pre-configuration BLE validation, and core-submission disposition are complete. |
| [#138](https://github.com/teh-hippo/ha-govee-led-ble/issues/138) | HACS integration updates require a Home Assistant restart; an integration-local Python hot loader is unsupported and was not added. |
| [#112: Kelvin retention](https://github.com/teh-hippo/ha-govee-led-ble/issues/112) | H617A and H6199 retained 4000 K through explicit BLE refresh from static mode.  H6199 query-backed segment colour matched the Kelvin companion. |
| [#125: H617A layout-1 scene](https://github.com/teh-hippo/ha-govee-led-ble/issues/125) | The crafted `0x93` body was acknowledged but did not replace normal Halloween rendering.  H617A support is rejected rather than inferred from the parser. |
| [#130: Fountain speed](https://github.com/teh-hippo/ha-govee-led-ble/issues/130) | A controlled `0x10`/`0x50` comparison showed slower/faster motion and return to baseline.  Kaitai records the field as speed without inferring extreme-value scaling. |
| [#166: packed applied area](https://github.com/teh-hippo/ha-govee-led-ble/issues/166) | The low nibble is area index; the high nibble is width in tenths; encoded width zero is the app sentinel for width ten.  Raw `0x00` and `0xA0` remain byte-distinct. |

## Explicit exclusions

| Capability | Disposition |
| --- | --- |
| Wi-Fi provisioning | Expert tool only.  Home Assistant integration is future issue #210. |
| On-device timers | Intentional non-goal. |
| Manufacturer-style animated previews | Intentional non-goal. |
| Camera calibration | Investigated and unavailable from current local trust/interfaces.  [Issue #136](https://github.com/teh-hippo/ha-govee-led-ble/issues/136) records the result. |
| Phone-microphone music injection | Intentional non-goal.  The retained schema is decode-only capture support. |
| OTA and firmware updates | Intentional non-goal. |

## Source metrics

Run:

```bash
uv run python scripts/report_source_size.py \
  ux-baseline-d040dcb \
  ux-cleanup-baseline-db5d951 \
  HEAD \
  --working-generated
```

The evidence-ready remediation tree at `174f2f9ce190` reports:

| Category | Original baseline `d040dcb` | Cleanup baseline `db5d951` | Remediation tree `174f2f9` |
| --- | ---: | ---: | ---: |
| Tracked total | 199,029 | 80,448 | 79,772 |
| Handwritten backend | 16,285 | 16,376 | 16,159 |
| Frontend source, including committed loader/fallback | 15,644 | 16,607 | 15,654 |
| Python tests | 23,018 | 19,619 | 19,570 |
| Frontend tests | 82,450 | 3,616 | 4,162 |
| Non-Kaitai tools | 16,754 | 9,839 | 9,663 |
| Build scripts and workflows | 280 | 753 | 1,037 |
| KSY | 1,652 | 1,692 | 1,692 |
| Documentation | 474 | 442 | 442 |
| Tracked generated output | 11,683 | 0 | 0 |
| Ignored generated protocol output | not applicable | not generated for the report | 7,925 |
| Ignored generated frontend output | not applicable | not generated for the report | 3,929 |

The original frontend-test count includes the removed generated browser fixture.  The remediation frontend-test increase from the cleanup baseline is direct model/controller coverage added for the decomposed components.

## Test reduction evidence

### Removed groups and retained protection

| Removed group | Retained protection |
| --- | --- |
| Source-text assertions for `down.sh` WDA teardown, WSL userspace selection, and cleanup ordering | Stub-driven `test_harness_wsl_usbip.py`, `test_harness_wda_daemon.py`, and `test_harness_teardown.py` execute the relevant paths. |
| Repeated `down.sh` invocations | Consolidated tests retain capture verdict, ownership ordering, delayed-entry, polling, and final error assertions. |
| Duplicate experimental-option migration case | `test_migrate_bumps_version_and_strips_experimental` covers removal and unrelated-option retention. |
| Layered re-export identity loop | Compiler and canonical-value tests cross the same boundary.  The shared validation exception identity remains directly asserted. |
| Duplicate malformed/truncated palette parser functions | One parametrised parser-rejection test retains all six payloads. |
| Fourteen catalogue-data scene-type cases | One table assertion plus representative scene-type-prefix tests retain the decision. |
| Vacuous signal-name assertion | Runtime use of `signal.SIGKILL` already fails directly on a misspelt symbol. |

The cleanup-failure restoration path remains directly tested: failed WDA/HID cleanup must still restore the Home Assistant entry before returning failure.

### Critical coverage before and after

| Module | Before | After | Missing lines before/after | Missing branches before/after |
| --- | ---: | ---: | ---: | ---: |
| `generated_protocol_adapter.py` | 99% | 99% | 6 / 6 | 3 / 3 |
| `effect_storage.py` | 87% | 87% | 16 / 16 | 12 / 12 |
| `effect_migration.py` | 72% | 72% | 23 / 23 | 17 / 17 |
| `effect_deployments.py` | 86% | 86% | 54 / 54 | 30 / 30 |
| `coordinator.py` | 86% | 86% | 90 / 90 | 69 / 69 |
| `effect_preview.py` | 88% | 88% | 49 / 49 | 41 / 41 |
| `effect_runtime.py` | 91% | 91% | 29 / 29 | 24 / 24 |
| `effect_websocket.py` | 45% | 45% | 227 / 227 | 30 / 30 |
| `tools/harness/container_ha.py` | 65% | 65% | 101 / 101 | 44 / 44 |
| `tools/harness/effect_studio_home_assistant.py` | 76% | 76% | 12 / 12 | 2 / 2 |
| `tools/harness/wda.py` | 33% | 33% | 232 / 232 | 95 / 95 |
| `tools/harness/ha_entry.py` | 49% | 49% | 79 / 79 | 34 / 34 |
| `tools/harness/local_package.py` | 79% | 79% | 8 / 8 | 2 / 2 |

Bash ownership and restoration branches are covered through subprocess-based stub rigs rather than Python line coverage.

### Retained-suite justification

| Subsystem | Why the cases remain |
| --- | --- |
| Coordinator | BLE ordering, optimistic windows, stale replies, client replacement, reconnect, keep-alive, and lock ownership. |
| Preview and durable runtime | Coalescing, cooldown, cancellation, shutdown, confirmation confidence, recovery, and partial-write handling. |
| Storage and migrations | Stable `6.4.x` plus `6.5.0-rc.1` through `rc.15` migration, atomicity, rollback, corruption, hard deletion, and bounded retention. |
| Protocol and scene codecs | Captured byte structures, generated-parser rejection, round-trip encoding, raw unknown preservation, and model activation. |
| WebSocket and services | Authentication, administrator-only mutation, schemas, stable UUID actions, and boundary error mapping. |
| Harness ownership | Household-to-isolated handover, uncertain container state, USB/WDA teardown, restoration ordering, and secret safety. |
| Capture tools | One-capture-one-light attribution, mixed/unattributed refusal, pcap/pcapng timestamps, and safe labels. |
| Build and packaging | Generated-output freshness, deterministic ZIP metadata, and runtime contents. |

## Residual ownership ledger

| Subsystem | Owner | Retained candidate | Why retained |
| --- | --- | --- | --- |
| Production runtime | `effect_preview.py` | Preview manager beside durable deployment engine | Preview coalescing/cancellation and durable recovery/audit have different state and safety contracts. |
| Product contracts | `effect_contracts.py` | Release capability contract | Drives frontend workflow availability and diagnostics. |
| Frontend boundary | `validation.ts` and focused validators | Backend response validation | Protects versioned API compatibility and malformed payload handling. |
| Compatibility | Storage migration modules | Stable and prerelease store migrations | Required for stable `6.4.x` and published `rc.1` through `rc.15` upgrades. |
| Compatibility | Catalogue legacy payload view | Legacy WebSocket response shape | Public contract retained until a separately approved API-version removal. |
| Tests | Critical subsystem suites listed above | Safety-heavy case count | Coverage-context analysis shows distinct branches rather than duplicate parametrisation. |
| Tools | `tools/harness/README.md` ownership groups | Capture, direct BLE, isolated HA, local package, Wi-Fi, WDA and host wrappers | Each belongs to a named supported workflow.  One-off probes are absent. |
| Scripts/workflows | Make, generation, package, exact-SHA release and reporting scripts | Reproducible build/release/evidence flow | Required for clean source checkout, deterministic assets, release safety, and auditable metrics. |
| Documentation | README, harness README, repository instructions, this matrix | Scope, safety and completion evidence | These are the durable operator and maintainer sources for supported behaviour and boundaries. |

## Validation matrix

| Validation | Result |
| --- | --- |
| Authoritative repository gate | Passed after remediation and again after UX corrections. |
| Python suite | 1,052 cases after restoring the cleanup-failure safety test. |
| Frontend suite | 85 DOM-free Node cases after the scene-copy cancellation and live-administrator corrections. |
| Critical coverage | No line or branch regression in the listed modules. |
| Deterministic package | The final `6.5.0rc16` source produces SHA-256 `286b3440e61a933de2a50a7333eff0d4d4cda2c83930d87bc1744bf1d6a08da7`; the post-commit gate repeats the clean-build comparison. |
| Package paths | The only cleanup-baseline path removed is dead `effect_scene_codec.py`. |
| H617A production-package UX | Sidebar/deep link, one-device selector rule, off-state root opening, active scene opening, dirty marker, scene-copy cancel, save/overwrite/stale conflict/delete, All scenes, native reset, standard Home Assistant replay, Advanced and Music surfaces, live-apply status, read-only presentation, desktop pane bounds, and mobile zero-overflow navigation passed. |
| H6199 production-package UX | Video Movie/Game profiles, saturation, white balance, relative brightness, blank screen, sound effects, Special DIY, Advanced, and read-only presentation passed. |
| Household restoration | Cupboard off.  Dream TV off with captured Video settings intact.  Zac's current state was not changed. |

## Remaining release work

The remaining work is release-only:

1. Run final conformance and functional-parity review findings to closure.
2. Set source version `6.5.0rc16` as the last source change.
3. Validate the exact final SHA without publication and compare local, CI, and exact-SHA ZIPs.
4. Publish `v6.5.0-rc.16`.
5. Qualify the public asset through disposable HACS.
6. Upgrade household Home Assistant and verify all three entries plus captured light states.
