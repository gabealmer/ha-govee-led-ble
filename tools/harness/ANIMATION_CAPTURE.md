# Animation capture

The harness records the [VDO.Ninja viewer](https://vdo.ninja/?view=7MdKzqF) through the existing direct and vendor-app ownership paths.  Before taking BLE ownership, it requires one playing `readyState` 4 video that advances and remains at 1280x720 for two seconds.

Keep real phone, Home Assistant and BLE identity only in the untracked file selected by `HARNESS_IDENTITY_FILE`.

## Set up the corpus

```bash
export HARNESS_IDENTITY_FILE=/workspaces/ha-govee-led-ble/tools/harness/devices.local.env
corpus=/mnt/shared/govee-led-ble/animation-captures/animation-campaign-v1

bash tools/harness/animation-capture.sh validate
bash tools/harness/animation-capture.sh init --corpus "$corpus"
bash tools/harness/animation-camera.sh open
bash tools/harness/animation-camera.sh validate
```

`campaign.json` is the immutable capture plan.  Completed effects are projected into the analyser-facing `manifest.json`.

Run these calibration targets first:

```bash
for target in calibration-black calibration-first-red calibration-last-blue calibration-all-white; do
  bash tools/harness/animation-capture.sh run-direct "$target" --corpus "$corpus" --device cupboard
done
```

They create `calibration/00-black.png`, `01-first-red.png`, `02-last-blue.png` and `03-all-white.png`.  If the framing changed, initialise a fresh corpus with the measured crop using `--crop x:y:width:height`.

## Pilot and direct targets

The exact 20-second Single Chasing pilot command is:

```bash
HARNESS_IDENTITY_FILE=/workspaces/ha-govee-led-ble/tools/harness/devices.local.env \
  bash tools/harness/animation-capture.sh run-direct \
  pilot-single-chasing-rgb-step-below-default \
  --corpus /mnt/shared/govee-led-ble/animation-captures/animation-campaign-v1 \
  --device cupboard
```

Use `run-direct <target>` for the remaining Type04 and native-gap targets.  Direct teardown restores DIY code 240, brightness 5 and power off before returning ownership to household Home Assistant.

## Vendor-app targets

Put the phone in Airplane Mode, turn Bluetooth back on, unlock it and close unrelated Govee device pages.

```bash
bash tools/harness/animation-capture.sh run-vendor special-diy-fade-baseline \
  --corpus "$corpus" --device cupboard
```

Configure the printed target without pressing Apply.  Return to the terminal, start the marked recording when prompted, press Apply, confirm the app result, then leave the rig untouched.  Each command owns one attributed HCI capture and restores household `light.turn_off`.

Special-DIY and Workshop parameter variations belong in `animation_capture_data/generate_manifests.py` after UI inspection.

## Music targets

Use the generated `stimulus/music-v1.wav`, one marked speaker position and one fixed volume for all 14 targets.  Keep the camera microphone enabled.

The 20-second sequence is:

1. 2 seconds silence.
2. 4 seconds 440 Hz.
3. 8 seconds of 120 BPM noise bursts.
4. 4 seconds of 100, 400, 1600 and 6400 Hz stepped tones.
5. 2 seconds silence.

```bash
bash tools/harness/animation-capture.sh record-music music-rhythm-dynamic \
  --corpus "$corpus" --device cupboard
```

When prompted, press Enter and start playback immediately.  Do not speak or move the speaker until playback ends.

## Resume and restore

```bash
bash tools/harness/animation-capture.sh status --corpus "$corpus"
bash tools/harness/animation-capture.sh resume --corpus "$corpus" --device cupboard --batch type04-single
bash tools/harness/animation-capture.sh restore --corpus "$corpus" --device cupboard
```

An interrupted attempt blocks resume until restore succeeds.  Do not start another target while either the device baseline or household ownership reports failure.

Raw WebM retains the source dimensions and rate.  Analysis WebM uses the calibrated crop at 30 fps; non-music clips have no audio and music clips retain mono audio.
