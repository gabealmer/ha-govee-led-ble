meta:
  id: h6199_status_reply
  title: Govee H6199 "aa" status-reply envelope (decode-only)
  endian: le
doc: |
  H6199 light-to-phone status notification, modelled independently from the
  H617A status grammar. This root begins with the attributable iPhone capture
  h6199-aa40.pcap and deliberately imports no shared Govee types.

  Domains 0x06, 0x07, 0x20 and 0x21 are separated by bytes in one connect burst:
  firmware, hardware and two subordinate version strings. Domain 0x14 is omitted
  because its captured body contains the real device address, which is rig
  identity and does not belong in a committed fixture.
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
    doc: '[CONFIRMED_LIVE] H6199 status body at frame offsets 2..18; unmatched registers remain raw'
  - id: checksum
    type: u1
    doc: '[CONFIRMED_LIVE] raw XOR checksum byte at frame offset 19; validated by the fixture runner'
enums:
  status_domain:
    0x01: power
    0x06: firmware
    0x07: hardware
    0x20: subordinate_20
    0x21: subordinate_21
types:
  power_body:
    seq:
      - id: is_on
        type: u1
        doc: '[CONFIRMED_LIVE] power state at frame offset 2; 0 is off in the paired app query and device-page observation'
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
