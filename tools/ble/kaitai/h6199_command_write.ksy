meta:
  id: h6199_command_write
  title: Govee H6199 "33" command-write envelope (decode-only)
  endian: le
doc: |
  H6199 phone-to-light control write, modelled independently from the H617A
  command grammar. This root begins with the attributable iPhone capture
  h6199-aa40.pcap and deliberately imports no shared Govee types.

  The first captured H6199 write is the connect-time clock sync. Its field names
  are kept inferred until H6199 captures vary them independently; the byte
  positions and 20-byte envelope are capture-backed.

  TWO OPCODES ARE PROVEN ABSENT on this model, which is worth stating here
  because both are present in the vendor app for other SKUs and so will be found
  again by anyone reading it. 0x46 is the app's "reset device network", whose own
  confirm dialog string is str_clear_wifi, and 0x17 is the older provisioning-mode
  toggle. Neither is offered for the H6199 in the app, and neither is implemented
  by its firmware: measured 2026-08-04 over direct BLE, in single connections in
  which 0x01 and 0x04 both acknowledged either side of them and 0x46, 0x17 01 and
  0x17 00 drew nothing at all. That is the same control this project used to
  retire 0x41 on the H617A, and it is the reason there is no BLE route to clear
  this device's stored Wi-Fi credentials.
seq:
  - id: header
    contents: [0x33]
    doc: '[CONFIRMED_LIVE] H6199 command header at frame offset 0'
  - id: opcode
    type: u1
    enum: command_op
    doc: '[CONFIRMED_LIVE] H6199 command register at frame offset 1'
  - id: body
    size: 17
    doc: '[CONFIRMED_LIVE] H6199 command body at frame offsets 2..18; unmatched registers remain raw'
    type:
      switch-on: opcode
      cases:
        'command_op::power': power_body
        'command_op::brightness': brightness_body
        'command_op::mode': mode_body
        'command_op::schedule': schedule_body
        'command_op::clock': clock_body
  - id: checksum
    type: u1
    doc: '[CONFIRMED_LIVE] raw XOR checksum byte at frame offset 19; validated by the fixture runner'
enums:
  command_op:
    0x01: power
    0x04: brightness
    0x05: mode
    0x09: clock
    0x23: schedule
  mode_sel:
    0x15: static_colour
    0x13: music
  music_mode:
    0x03: rhythm
    0x04: spectrum
    0x05: energetic
    0x06: rolling
types:
  power_body:
    seq:
      - id: is_on
        type: u1
        doc: '[CONFIRMED_LIVE] H6199 power state at frame offset 2; captured as 1 turning the light on and 0 turning it off from the same device page minutes apart'
      - id: opaque_tail
        size: 16
        doc: '[CONFIRMED_LIVE] remaining H6199 power-body bytes, captured as an opaque all-zero window'
  brightness_body:
    seq:
      - id: percent
        type: u1
        doc: |
          [CONFIRMED_LIVE] H6199 brightness at frame offset 2, as a direct 0..100 percent
          rather than a 0..255 level. Captured 2026-08-03 in one session as 0x64, 0x33 and
          0x03 for a slider the app rendered as 100%, 51% and 3%, with nothing else touched
          between the three; each byte equals the displayed percent exactly, which no 0..255
          scaling reproduces.
      - id: opaque_tail
        size: 16
        doc: '[CONFIRMED_LIVE] remaining H6199 brightness-body bytes, captured as an opaque all-zero window'
  mode_body:
    seq:
      - id: sub_mode
        type: u1
        enum: mode_sel
        doc: |
          [CONFIRMED_LIVE] H6199 lighting-mode selector at frame offset 2. Register 0x05 is
          not a colour command: it multiplexes several modes on this byte, and only the
          static-colour case carries RGB.

          This was previously modelled as the first byte of an opaque 15 01 head, correctly,
          because every capture then held it constant and a value that never varies cannot be
          told apart from padding. Captures on 2026-08-04 varied it: 0x15 on a static-colour
          write, 0x13 selecting a music mode, 0x04 applying a saved DIY as a scene and 0x0a
          on the DIY editor's live apply, all from the same device page in the same sessions.
          Only the two with a modelled payload are named in mode_sel; the scene and DIY
          values are observed but their bodies are not yet isolated, so they stay unnamed
          rather than guessed.
      - id: detail
        size: 16
        doc: '[CONFIRMED_LIVE] H6199 mode payload at frame offsets 3..18; modes without an isolated body remain raw'
        type:
          switch-on: sub_mode
          cases:
            'mode_sel::static_colour': static_colour_body
            'mode_sel::music': music_body
  music_body:
    seq:
      - id: mode
        type: u1
        enum: music_mode
        doc: |
          [CONFIRMED_LIVE] H6199 music mode at frame offset 3. Captured 2026-08-04 by tapping
          each of the app's four mode tiles in one session with the sensitivity slider and
          the sound-pickup toggle untouched, so the four frames differ in this byte alone.
          Energic, Rhythm, Spectrum and Rolling gave 0x05, 0x03, 0x04 and 0x06; re-tapping
          the first reproduced its frame byte for byte, so the write carries no sequence or
          timestamp.

          The app labels the first mode "Energic". The integration's slug is "energetic" and
          the two denote the same 0x05.
      - id: sensitivity
        type: u1
        doc: |
          [INFERRED] H6199 music sensitivity at frame offset 4. Captured as 0x63, decimal 99,
          on every music write in a session whose slider sat at maximum, and the integration
          builds the same byte from a 0..100 percent. NOT isolated: the app renders the
          slider as an XCUIElementTypeImage, which the name-driven harness cannot drag, so
          no capture yet varies it. Settle it by writing two sensitivities from our own radio
          and reading back aa 05, whose reply echoes this byte.
      - id: opaque_tail
        size: 14
        doc: '[CONFIRMED_LIVE] remaining H6199 music-body bytes at frame offsets 5..18, captured as an opaque all-zero window across all four modes'
  static_colour_body:
    seq:
      - id: opaque_head
        size: 1
        doc: |
          [CONFIRMED_LIVE] one H6199 static-colour byte at frame offset 3, captured as 0x01 on
          every static-colour write and never seen to vary. Unnamed because no capture
          isolates it. It is at least NOT a whole-strip flag, which was the obvious guess:
          writes addressing one segment carry the same value as writes addressing all
          fifteen, so whatever selects the scope is the mask below and not this byte.
      - id: red
        type: u1
        doc: '[CONFIRMED_LIVE] H6199 red channel at frame offset 4; captured as 0xff for the Basic Colors red swatch and 0x00 for green and blue, in one session with nothing else touched'
      - id: green
        type: u1
        doc: '[CONFIRMED_LIVE] H6199 green channel at frame offset 5; captured as 0xff for the green swatch alone in the same session'
      - id: blue
        type: u1
        doc: '[CONFIRMED_LIVE] H6199 blue channel at frame offset 6; captured as 0xff for the blue swatch alone in the same session'
      - id: opaque_gap
        size: 5
        doc: '[CONFIRMED_LIVE] H6199 colour-body bytes at frame offsets 7..11, captured as an opaque all-zero window across whole-strip and single-segment writes alike'
      - id: segment_mask
        type: u2
        doc: |
          [CONFIRMED_LIVE] H6199 segment selection at frame offsets 12..13, little-endian,
          bit 0 being the segment the app draws first. Captured 2026-08-03 by colouring one
          segment red, then a different segment the same red, then both together: 0x0001,
          0x0004, then 0x0005. The third write is what makes it a bitfield rather than an
          index or a count, because 0x0005 is the OR of the other two and no ordinal
          encoding produces it. A whole-strip write carries 0x7fff, fifteen bits set, which
          matches the fifteen segments the app draws.
      - id: opaque_tail
        size: 5
        doc: '[CONFIRMED_LIVE] remaining H6199 colour-body bytes at frame offsets 14..18, captured as an opaque all-zero window'
  clock_body:
    seq:
      - id: hour
        type: u1
        doc: '[CONFIRMED_LIVE] local hour; captured as 13 at 13:35 and as 9 at 09:54 in separate sessions'
      - id: minute
        type: u1
        doc: '[CONFIRMED_LIVE] local minute; captured as 35 and as 54 in those same two sessions'
      - id: second
        type: u1
        doc: '[CONFIRMED_LIVE] local second; captured as 21 and as 44, moving independently of the fields either side'
      - id: weekday
        type: u1
        doc: |
          [CONFIRMED_LIVE] ISO weekday, Monday being 1. Captured as 1 on Monday 2026-07-27
          and as 2 on Tuesday 2026-08-04. One sample could not tell a weekday from any other
          small constant; the second, on a known different day, is what names it.
      - id: flag1
        type: u1
        doc: '[INFERRED] unknown clock field, captured as 1 in both sessions and so still not distinguishable from a constant'
      - id: utc_offset_hours
        type: s1
        doc: |
          [INFERRED] apparent signed UTC-offset hour component; captured as +10 in
          Australia/Sydney both times. Still inferred rather than confirmed because both
          captures were taken in the same zone, so nothing has yet moved this byte. A
          capture with the phone on a different offset would settle it.
      - id: utc_offset_minutes
        type: u1
        doc: '[INFERRED] apparent UTC-offset minute component; captured as 0 in Australia/Sydney, unvaried for the same reason as the hours field'
      - id: opaque_tail
        size: 10
        doc: '[CONFIRMED_LIVE] remaining H6199 clock-body bytes, captured as an opaque all-zero window'
  schedule_body:
    seq:
      - id: slot
        type: u1
        doc: |
          [CONFIRMED_LIVE] which of the four schedule slots this write addresses, counting
          from zero. Captured as 0 and 1 by enabling the app's first and second timer rows
          with nothing else changed between them, which is what separates a slot index from
          a flag that happened to be zero.
      - id: flags
        type: u1
        doc: |
          [CONFIRMED_LIVE] schedule flags. Bit 0x80 marks the slot enabled and is set in
          every captured write, including the two that carried no time at all. Bit 0x01 is
          the action the slot performs: the byte read 0x80 while the app showed "Off" and
          0x81 after the same slot was switched to "On". The remaining bits have never been
          seen set and are deliberately not named.
      - id: hour
        type: u1
        doc: '[CONFIRMED_LIVE] hour the slot fires; captured as 0 for an untouched slot and 7 after setting 7:30'
      - id: minute
        type: u1
        doc: '[CONFIRMED_LIVE] minute the slot fires; captured as 0 and then 30 (0x1e) from the same edit'
      - id: repeat_mask
        type: u1
        doc: |
          [CONFIRMED_LIVE] repeat days, as 0x80 plus one bit per weekday from Monday at 0x01.
          Captured as 0x80 with no days chosen and 0x95 after choosing Monday, Wednesday and
          Friday, which is 0x80 | 0x01 | 0x04 | 0x10. That value matters: 0x80 on its own
          looks like a "fire once" flag, and 0x95 is the reading that rules it out by naming
          three days while keeping the same high bit.
      - id: opaque_tail
        size: 12
        doc: '[CONFIRMED_LIVE] remaining H6199 schedule-body bytes, captured as an opaque all-zero window'
