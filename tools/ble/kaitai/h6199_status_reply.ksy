meta:
  id: h6199_status_reply
  title: Govee H6199 "aa" status-reply envelope (decode-only)
  endian: le
doc: |
  H6199 light-to-phone status notification, modelled independently from the
  H617A status grammar. This root begins with the attributable iPhone capture
  h6199-aa40.pcap and deliberately imports no shared Govee types.

  Domains 0x06, 0x07, 0x20 and 0x21 are separated by bytes in one connect burst:
  firmware, hardware and two further version strings. Domain 0x14 is omitted
  because its captured body contains the real device address, which is rig
  identity and does not belong in a committed fixture.

  THE TWO EXTRA VERSIONS BELONG WITH THE HARDWARE ONE, which is more than the bytes
  alone say and less than a name. The app's Device Settings page shows a single
  "Hardware Version" row reading "3.02.01" and then "1.03.00/1.00.33", and those are
  exactly the 0x07, 0x20 and 0x21 replies captured seconds earlier, string for
  string. So the pair is hardware-related and is not a second firmware, which is the
  reading their position next to 0x06 would otherwise invite.

  They keep neutral names anyway. Being displayed together rules out what they are
  NOT; it does not say which component each one belongs to, and inventing that from a
  slash in a settings row would be exactly the kind of guess the neutral name exists
  to avoid. Settle it on a device whose parts have distinguishable versions.

  Opening that page put nothing on the wire, so it is a display of what the connect
  burst already fetched rather than a reason for the light to be asked anything.

  Domain 0x01 is modelled as well and is much the weakest of them, because its captured
  reply is byte-identical to the query that drew it. See power_body for what that leaves
  unsettled.
seq:
  - id: header
    contents: [0xaa]
    doc: '[CONFIRMED_LIVE] H6199 status header at frame offset 0'
  - id: domain
    type: u1
    enum: status_domain
    doc: '[CONFIRMED_LIVE] H6199 status register at frame offset 1'
  - id: body
    size: 17
    type:
      switch-on: domain
      cases:
        'status_domain::power': power_body
        'status_domain::firmware': version_body
        'status_domain::hardware': hardware_version_body
        'status_domain::subordinate_20': version_body
        'status_domain::subordinate_21': version_body
        'status_domain::colour_mode': colour_mode_body
    doc: '[CONFIRMED_LIVE] H6199 status body at frame offsets 2..18; unmatched registers remain raw'
  - id: checksum
    type: u1
    doc: '[CONFIRMED_LIVE] raw XOR checksum byte at frame offset 19; validated by the fixture runner'
enums:
  status_domain:
    0x01: power
    0x06: firmware
    0x07: hardware
    0x05: colour_mode
    0x20: subordinate_20
    0x21: subordinate_21
  mode_sel:
    0x00: video
    0x04: scene
    0x13: music
    0x15: static_colour
types:
  colour_mode_body:
    doc: |
      What the light says it is currently showing. This is the read side of the 0x05 mode
      register, and it answers a question the integration had been assuming: the H6199 DOES
      reply to an aa 05 query. Four replies were captured across four sessions, one per mode.

      MODELLED SEPARATELY FROM THE WRITE BODIES RATHER THAN IMPORTED, even though both are
      this same model and an import would be allowed. The two are not the same shape: the
      write's scene body carries a byte saying whether a definition was uploaded first, and
      the reply does not echo it, which makes sense because that byte is about the transfer
      and not about what is on the strip. Importing would assert a sameness these bytes
      contradict, and would then be wrong silently rather than loudly.

      Read-side fields are named only where a write in the SAME session pins them. Where the
      layout merely resembles the write, the doc says so.
    seq:
      - id: mode
        type: u1
        enum: mode_sel
        doc: |
          [CONFIRMED_LIVE] which mode the light reports, at frame offset 2. Captured as 0x15
          static colour, 0x13 music, 0x00 video and 0x04 scene, in four sessions in which the
          app had put the light into exactly that mode. It is the same set of values the
          write side selects on, which is the device confirming that enum from the other
          direction rather than us reading our own encoder back.
      - id: detail
        size: 16
        doc: '[CONFIRMED_LIVE] the mode payload at frame offsets 3..18; modes without an isolated body remain raw'
        type:
          switch-on: mode
          cases:
            'mode_sel::music': music_state
            'mode_sel::scene': scene_state
  music_state:
    seq:
      - id: mode
        type: u1
        doc: |
          [CONFIRMED_LIVE] the music mode, at frame offset 3, captured as 0x05. The write that
          set it in the same session carried 0x05 in the same position for the tile the app
          labels Energic, so the reply echoes the selection rather than reporting an index of
          its own.
      - id: sensitivity
        type: u1
        doc: |
          [CONFIRMED_LIVE] the music sensitivity, at frame offset 4, captured as 0x63. The
          same session's write carried 0x63 after the slider was left at maximum.

          This is the read-back the write-side doc once proposed as the way to settle that
          byte, and it arrives from a genuinely independent direction: the light is reporting
          the value, not our encoder repeating it. The two agree.
      - id: opaque_gap
        size: 3
        doc: '[CONFIRMED_LIVE] three bytes at frame offsets 5..7, captured as zero'
      - id: opaque_flag
        size: 1
        doc: |
          [CONFIRMED_LIVE] one byte at frame offset 8, captured as 0xff. It has no counterpart
          in the write, which carries zero there, so it is something the light reports rather
          than something it was told. Unnamed because one sample cannot distinguish a flag
          from a constant.
      - id: opaque_tail
        size: 10
        doc: '[CONFIRMED_LIVE] remaining bytes at frame offsets 9..18, captured as an opaque all-zero window'
  scene_state:
    seq:
      - id: scene_id
        type: u2le
        doc: |
          [CONFIRMED_LIVE] the scene the light reports, at frame offsets 3..4, in the same
          two-byte little-endian form the write uses. Captured as 0x2715, which is exactly
          the id the app had written moments earlier in the same session.

          THE WRITE'S THIRD BYTE IS NOT ECHOED. That write carried a 2 in the next position,
          meaning a definition had just been uploaded; the reply carries 0 there. So the byte
          describes the transfer rather than the state, which is what the write-side spec
          argues from the upload correlation and what this reply independently supports.
      - id: opaque_tail
        size: 14
        doc: '[CONFIRMED_LIVE] remaining bytes at frame offsets 5..18, captured as an opaque all-zero window'
  power_body:
    seq:
      - id: is_on
        type: u1
        doc: |
          [INFERRED] power state at frame offset 2, captured as 0 while the device page
          showed the light off.

          NOTHING CAPTURED SEPARATES THIS REPLY FROM AN ECHO OF THE QUERY. The checksum is
          the XOR of bytes 0..18, so an all-zero body and a bare repeat of the aa 01 query
          serialise to the same twenty bytes, and h6199_status_power_off holds byte for byte
          what h6199_query_power sent. Nothing but 0 has ever been seen here either, so
          reading this byte as stored power state is the write side's name carried across
          rather than something measured on a reply. Settle it by turning the light on,
          reading aa 01 back and seeing whether the byte follows.
      - id: opaque_tail
        size: 16
        doc: '[CONFIRMED_LIVE] remaining H6199 power-reply bytes, captured as an opaque all-zero window'
  version_body:
    seq:
      - id: text
        type: strz
        encoding: ASCII
        doc: '[CONFIRMED_LIVE] NUL-terminated H6199 version string'
      - id: opaque_tail
        size-eos: true
        doc: '[CONFIRMED_LIVE] remaining bytes after the H6199 version string, captured as an opaque all-zero window'
  hardware_version_body:
    seq:
      - id: prefix
        contents: [0x03]
        doc: '[CONFIRMED_LIVE] H6199 hardware-version selector prefix at frame offset 2'
      - id: text
        type: strz
        encoding: ASCII
        doc: '[CONFIRMED_LIVE] NUL-terminated H6199 hardware version string'
      - id: opaque_tail
        size-eos: true
        doc: '[CONFIRMED_LIVE] remaining bytes after the H6199 hardware version, captured as an opaque all-zero window'
