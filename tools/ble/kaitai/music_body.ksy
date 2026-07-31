meta:
  id: music_body
  title: Govee H617A music-mode wire structures (decode-only)
  endian: le
  imports:
    - govee_common
doc: |
  Two related H617A music-mode wire structures, verified byte-exact against real
  captures (chiefly 20260716120000-h617a-music-walkthrough.pcap, plus count=7 and
  Day & Night variants from other captures). Captures are ground truth.

  RE-CAPTURE 2026-07-27 (h617a-music-recapture-2026-07-27). The three pcaps behind the
  original fixtures had been lost, leaving the whole grammar resting on transcribed hex
  with nothing left to re-read. A fresh 11-mode walkthrough was driven end to end to
  rebuild that evidence base. Four of the seven parameter-bearing bodies came back
  BYTE-IDENTICAL to the existing fixtures (Piano Keys keys=15/gradient on, Fountain,
  Day & Night, Shiny Dynamic), independently re-validating the lost-capture
  transcription; the other three landed on new parameter values and are now fixtures in
  their own right. All eleven modes in govee_common::music_mode were exercised and the
  capture contained ZERO unknown frame kinds.

  ROOT TYPE `music_body` = the reassembled 0xA3 "MultipleController4Music" 0x41 BODY
  (per-mode movement parameters). The host reassembles the 17-byte A3 chunks
  (frame bytes[2:19] concatenated); the A3 framing/terminator is transport, not
  modelled here. There is NO checksum inside the reassembled body. On-wire layout:
    01 <fragCount> 41 <MODE> <count> <RGB x count> <mode-specific tail> <zero pad>
  The mode-specific tail parameters sit immediately after the palette (RELATIVE to
  palette end, not at a fixed absolute offset): Shiny and Separation appear in
  captures with both count 5 and count 7, and the same tail bytes follow each
  palette (e.g. Shiny tail `05 64 0a` at offsets 20-22 when count 5, and at 26-28
  when count 7). The tail is field-decoded per mode (switch on mode) from the
  2026-07-21 live editor A/B(/C) sweep; bytes that stay constant across the sweep and
  whose meaning was not isolated stay INFERRED within each per-mode type.

  SUB-TYPE `mode_set_frame` = the full 20-byte `33 05 13` music mode-set FRAME. It
  IS a full frame, so byte[19] is the XOR of bytes[0..18], read opaque and validated
  host-side (Kaitai has no fold/reduce; the .kst runner applies it), exactly like
  colormode_readback.ksy. On-wire layout:
    33 05 13 <MODE> <SENS> <STYLE> <COUNT> <RGB x COUNT> <zero pad to 18> <xor>
  `13` is the music sub-command the current builder ships; an older protocol emits
  0x0c for the same frame (noted, not modelled — every captured frame is 0x13).

  MODE enum matches const.MUSIC_MODES / MUSIC_MODE_SLUGS. Cross-checked against the
  shipped encoders protocol.build_music_params_a3 (0x41 body) and
  protocol.build_music_mode_with_color (mode-set frame).

  Every field carries exactly one evidence tag in its doc. The vocabulary and what
  each tag claims are defined once in evidence_lint.py, which also enforces them;
  do not restate them here.
seq:
  - id: header
    type: govee_common::a3_header
    doc: '[CONFIRMED_LIVE] shared A3 body header 01 <linecount>; here linecount is the fragment count (body length == linecount * 17).'
  - id: command
    contents: [0x41]
    doc: '[CONFIRMED_LIVE] body offset 2, raw 0x41: MultipleController4Music command.'
  - id: mode
    type: u1
    enum: govee_common::music_mode
    doc: '[CONFIRMED_LIVE] body offset 3: raw music-mode selector (see govee_common::music_mode).'
  - id: count
    type: u1
    doc: '[CONFIRMED_LIVE] body offset 4: palette colour count; the RGB region is exactly count triples.'
  - id: palette
    type: govee_common::rgb
    repeat: expr
    repeat-expr: count
    doc: '[CONFIRMED_LIVE] body offsets 5..: count x RGB, byte-exact against captures.'
  - id: tail
    size: tail_len
    type:
      switch-on: mode
      cases:
        'govee_common::music_mode::bloom': bloom_tail
        'govee_common::music_mode::shiny': shiny_tail
        'govee_common::music_mode::separation': separation_tail
        'govee_common::music_mode::hopping': hopping_tail
        'govee_common::music_mode::piano_keys': piano_keys_tail
        'govee_common::music_mode::fountain': fountain_tail
        'govee_common::music_mode::day_and_night': day_and_night_tail
    doc: |
      [CONFIRMED_LIVE] per-mode movement-parameter region, immediately after the
      palette (offsets RELATIVE to palette end, not fixed absolute), sized by tail_len
      and field-decoded per mode below. The field meanings were live-confirmed by the
      2026-07-21 A/B(/C) editor sweep (see the per-mode tail types); the raw bytes also
      round-trip byte-exact, every tail field stated in spec/music_body_*.kst. Bytes that stay
      constant across the sweep and whose meaning was not isolated are tagged INFERRED
      within each per-mode type.
  - id: padding
    type: u1
    valid: 0
    repeat: eos
    doc: '[CONFIRMED_LIVE] transport zero padding to the A3 17-byte chunk boundary; grammar-enforced all-zero.'
instances:
  tail_len:
    value: >-
      mode == govee_common::music_mode::hopping ? 9 :
      mode == govee_common::music_mode::piano_keys ? 5 :
      mode == govee_common::music_mode::fountain ? 4 :
      mode == govee_common::music_mode::separation ? 3 :
      mode == govee_common::music_mode::shiny ? 3 :
      mode == govee_common::music_mode::day_and_night ? 3 : 2
    doc: |
      Per-mode opaque tail length in bytes (relative, counted from the end of the
      palette). Set to the largest parameter block observed for each mode across ALL
      available captures (not just one), because a single capture can leave trailing
      params zero and under-count the region (Day & Night looked like 2 bytes in the
      walkthrough but a later capture sets a third byte, so it is 3). Default 2 covers
      Bloom (offsets +0..+1). Only the seven param-bearing modes seen in captures are
      covered; the simpler modes (Energetic/Rhythm/Spectrum/Rolling) emit no 0x41 body.
      The region is sized from observation only, so a future capture could extend a length.
types:
  bloom_tail:
    doc: 'Bloom (0x30) tail (2 bytes). Editor = Sensitivity + Dynamic/Calm + colour.'
    seq:
      - id: fixed0
        type: u1
        valid: 0x0a
        doc: '[CONFIRMED_LIVE] +0, reads 0x0a in BOTH Bloom bodies held (spec/music_body_bloom.kst and music_body_bloom_dynamic.kst) and stayed 0x0a while style_companion moved Calm 0x14 -> Dynamic 0x50, so it is independent of the style control. TWO OBSERVATIONS, NOT A SWEEP: the earlier sweep captures this constant was originally derived from are no longer in the archive, so the fixtures are now the whole evidence base. RE-CONFIRMED IN AN INDEPENDENT SESSION 2026-07-30: re-driving the Bloom tile nine days later uploaded a body byte-identical to music_body_bloom_dynamic.bin, so the fixtures are reproducible rather than an artefact of one sitting. Grammar-enforced, which pins the value and claims no meaning; a capture that moves it will fail to parse rather than pass unnoticed.'
      - id: style_companion
        type: u1
        doc: '[CONFIRMED_LIVE] +1, style companion: Dynamic 0x50 / Calm 0x14 (A/B/A 2026-07-21)'
  shiny_tail:
    doc: 'Shiny (0x31) tail (3 bytes). Style companion then a constant byte.'
    seq:
      - id: style_companion
        size: 2
        doc: '[CONFIRMED_LIVE] +0..+1, style companion: Dynamic 05 64 / Calm 14 46'
      - id: fixed2
        type: u1
        valid: 0x0a
        doc: '[CONFIRMED_LIVE] +2, reads 0x0a in all THREE Shiny bodies held and stayed 0x0a while style_companion moved Calm 14 46 -> Dynamic 05 64, so it is independent of the style control. RE-CONFIRMED IN AN INDEPENDENT SESSION 2026-07-30: re-driving the Shiny tile nine days later uploaded a body byte-identical to music_body_shiny_dynamic.bin. Grammar-enforced value, no meaning claimed.'
  separation_tail:
    doc: |
      Separation (0x32) tail (3 bytes). Editor = Sensitivity + point + gradient + colour.
      EXTERNALLY CORROBORATED, BYTE FOR BYTE. [CONFIRMED_LIVE 2026-07-29] An unrelated
      project (ib0b/RGB-PC, src/models/Strip.js) hardcodes a two-frame A3 upload whose
      reassembled body is byte-identical to our separation_count7 fixture across all 29
      bytes, palette and tail alike: 01 02 41 32 07, the same seven-colour rainbow, then
      03 00 61. Both of its frame checksums verify, so those are real wire bytes rather
      than invented ones. The model is not stated there and per the repo rule that makes
      this a LEAD rather than evidence about the H617A; what it does establish is that the
      app ships this exact default body on more than one device, which is why the palette
      and tail we captured are a vendor default rather than something our own session
      happened to produce. The project attaches no meaning to 03 00 61, so it corroborates
      the bytes and nothing about what they do.
    seq:
      - id: point
        type: u1
        doc: '[CONFIRMED_LIVE] +0, separation point 1..5 (swept 1/2/5 live 2026-07-21)'
      - id: gradient
        type: u1
        doc: '[CONFIRMED_LIVE] +1, gradient 0/1'
      - id: companion
        type: u1
        doc: '[CONFIRMED_LIVE] +2, gradient-coupled companion 0x5e (gradient on) / 0x61 (off), point-independent'
  hopping_tail:
    doc: 'Hopping (0x33) tail (9 bytes). Editor = Sensitivity + bg colour + rel-brightness + palette.'
    seq:
      - id: background
        type: govee_common::rgb
        doc: '[CONFIRMED_LIVE] +0..+2, background colour RGB'
      - id: rel_brightness
        type: u1
        doc: '[CONFIRMED_LIVE] +3, relative brightness as a direct % capped at 0x32=50% (49%->0x31, 50%->0x32)'
      - id: fixed
        contents: [0x62, 0x01, 0x03, 0x02, 0x06]
        doc: '[CONFIRMED_LIVE] +4..+8, reads 62 01 03 02 06 in BOTH Hopping bodies held, which differ in rel_brightness (0x31 and the 0x32 cap), so that control does not move it. Two observations, not a sweep. RE-CONFIRMED IN AN INDEPENDENT SESSION 2026-07-30: re-driving the Hopping tile nine days later uploaded a body byte-identical to music_body_hopping_rb50.bin. Grammar-enforced value, no meaning claimed.'
  piano_keys_tail:
    doc: 'Piano Keys (0x34) tail (5 bytes). Editor = Sensitivity + key count + gradient + palette.'
    seq:
      - id: gradient
        type: u1
        doc: '[CONFIRMED_LIVE] +0, gradient 0/1 (undocumented control found live 2026-07-21)'
      - id: key_count
        type: u1
        doc: '[CONFIRMED_LIVE] +1, raw key count, range 8..15, even and odd both settable (8->0x08, 9->0x09, 15->0x0f; re-confirmed live 2026-07-23 via the per-tile pencil-badge editor)'
      - id: fixed
        contents: [0x0a, 0x04]
        doc: '[CONFIRMED_LIVE] +2..+3, reads 0a 04 in all THREE Piano Keys bodies held, which span key_count 8 and 15 and gradient on and off, so it tracks neither control. RE-CONFIRMED IN AN INDEPENDENT SESSION 2026-07-30: re-driving the Piano Keys tile nine days later uploaded a body byte-identical to music_body_piano_keys_k15_grad1.bin. Grammar-enforced value, no meaning claimed.'
      - id: derived_half
        type: u1
        doc: >
          [CONFIRMED_LIVE] +4 = key_count // 2, byte-exact across keys 8->4, 9->4 and
          15->7 (live 2026-07-23). Derived from the key count (it moves together with
          +1, so it is not an independent control), but the relationship is confirmed.
  fountain_tail:
    doc: 'Fountain (0x35) tail (4 bytes). Editor = Sensitivity + direction + colour.'
    seq:
      - id: direction_lo
        type: u1
        doc: '[CONFIRMED_LIVE] +0, direction byte A: CW 0x00 / CCW 0x02 / Two-way 0x01 (A/B/C 2026-07-21)'
      - id: fixed1
        type: u1
        valid: 0x01
        doc: '[CONFIRMED_LIVE] +1, reads 0x01 in the ONE Fountain body held, plus a second identical body in s2-music.pcap. RE-CAPTURED 2026-07-30 AS THIS DOC ASKED FOR: a fresh app session nine days later re-drove the Fountain tile and uploaded a body BYTE-IDENTICAL to music_body_fountain.bin, so the value no longer rests on a single session. WHAT THAT DOES NOT DO IS SWEEP THE DIRECTION CONTROL: the re-capture applied the mode at its existing setting, so the older claim that this byte is unchanged across all three direction settings remains unsupported by anything in tree. Sweep direction in the editor to settle that. If a direction change moves the byte the parse will fail loudly, which is why pinning it stays defensible.'
      - id: direction_hi
        type: u1
        doc: '[CONFIRMED_LIVE] +2, direction byte B: CW/CCW 0x05 / Two-way 0x03'
      - id: companion
        type: u1
        doc: '[INFERRED] +3, 0x50 in captures and re-confirmed 2026-07-27 (matches the Dynamic style companion seen elsewhere, including bloom_dynamic on the same day); Fountain exposes no style control, so nothing has yet moved it and its meaning is not isolated'
  day_and_night_tail:
    doc: 'Day and Night (0x37) tail (3 bytes). Editor = Sensitivity + seg count + speed + gradient + palette.'
    seq:
      - id: segment_count
        type: u1
        doc: '[CONFIRMED_LIVE] +0, segment count 1..7 (captured 2)'
      - id: speed
        type: u1
        doc: '[CONFIRMED_LIVE] +1, speed (0x01 min .. 0x2c at ~90%)'
      - id: gradient
        type: u1
        doc: '[CONFIRMED_LIVE] +2, gradient 0/1 (undocumented control found live 2026-07-21)'
  mode_set_frame:
    doc: |
      Full 20-byte `33 05 13` music mode-set frame. byte[19] is the XOR of
      bytes[0..18], opaque here and validated host-side by the .kst runner.
    seq:
      - id: header
        contents: [0x33]
        doc: '[CONFIRMED_LIVE] frame offset 0, raw 0x33: command header.'
      - id: domain
        contents: [0x05]
        doc: '[CONFIRMED_LIVE] frame offset 1, raw 0x05: colour-mode domain.'
      - id: sub
        contents: [0x13]
        doc: '[CONFIRMED_LIVE] frame offset 2, raw 0x13: music sub-command (older protocol uses 0x0c; not seen live).'
      - id: mode
        type: u1
        enum: govee_common::music_mode
        doc: '[CONFIRMED_LIVE] frame offset 3: raw music-mode selector (see govee_common::music_mode).'
      - id: sensitivity
        type: u1
        doc: '[CONFIRMED_LIVE] frame offset 4: mic sensitivity 0..99 (raw); captures span 0x00/0x2f/0x32/0x63, and 2026-07-27 isolated it with a single-byte A/B on Rolling (0x63 -> 0x32, every other byte identical).'
      - id: style
        type: u1
        doc: '[CONFIRMED_LIVE] frame offset 5: raw byte; Dynamic 0x00 / Calm 0x01 is the Rhythm-only interpretation (other modes repurpose it, see protocol.parse_color_mode_response).'
      - id: count
        type: u1
        valid:
          max: 4
        doc: '[CONFIRMED_LIVE] frame offset 6: manual colour count AND auto-colour flag (0x00 = auto on, no RGB). Bounded to max 4 (the 12-byte RGB region) so the padding repeat-expr cannot go negative.'
      - id: colors
        type: govee_common::rgb
        repeat: expr
        repeat-expr: count
        doc: '[CONFIRMED_LIVE] frame offsets 7..: count x manual RGB; captures show count 0 or 1.'
      - id: padding
        type: u1
        valid: 0
        repeat: expr
        repeat-expr: 12 - count * 3
        doc: '[CONFIRMED_LIVE] zero padding from after the RGB region up to byte 18; grammar-enforced all-zero.'
      - id: checksum
        type: u1
        doc: '[CONFIRMED_LIVE] frame offset 19: raw XOR of bytes[0..18]; opaque here, validated host-side.'
