meta:
  id: h6199_wifi_result
  title: Govee H6199 "ee 11" Wi-Fi association result (decode-only)
  endian: be
doc: |
  The H6199's own report of how a Wi-Fi provisioning attempt ended, sent unprompted about
  eleven seconds after the a1 11 sequence it answers. Distinct from the a1 11 write-ack,
  which arrives within milliseconds and only says the frames were structurally accepted.

  This family was invisible to our decoder for weeks. Its frame allowlist named the headers
  we already understood, so 0xEE was dropped, and a provisioning capture decoded as a write
  that was acknowledged and never answered. That read as the device ignoring the request
  when it had in fact replied to say it failed, and the frame had been sitting in the
  captures the whole time. A filter keyed on what you already recognise hides exactly the
  traffic that would teach you something.

  Both status values have now been produced deliberately on our own hardware, which is what
  moves this from a guess to a reading: a network invented to be impossible gave 0x01, and
  credentials for a network that existed gave 0x00 with an independent observer confirming
  the light had joined it. Nothing here is inferred from the vendor app.
seq:
  - id: header
    contents: [0xee]
    doc: '[CONFIRMED_LIVE] H6199 device-initiated header at frame offset 0'
  - id: sub_opcode
    type: u1
    doc: '[CONFIRMED_LIVE] register the report concerns at frame offset 1, 0x11 being Wi-Fi provisioning, matching the register that was written'
  - id: status
    type: u1
    enum: outcome
    doc: |
      [CONFIRMED_LIVE] association outcome at frame offset 2. Captured as 0x01 after pushing
      a deliberately non-existent SSID, and as 0x00 after pushing working credentials.

      What 0x00 requires is NOT settled. The successful push was to a network that had a
      route to the internet at the time, so this does not yet distinguish "associated" from
      "associated and reached the cloud". Settle it by provisioning a network that exists but
      is deliberately unrouted, and reading this byte.
  - id: opaque_tail
    size: 16
    doc: '[CONFIRMED_LIVE] remaining bytes at frame offsets 3..18, captured as an opaque all-zero window in both the success and failure cases'
  - id: checksum
    type: u1
    doc: '[CONFIRMED_LIVE] raw XOR checksum byte at frame offset 19; validated by the fixture runner'
enums:
  outcome:
    0x00: connected
    0x01: not_connected
