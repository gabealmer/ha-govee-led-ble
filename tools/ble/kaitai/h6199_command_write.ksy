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
    type:
      switch-on: opcode
      cases:
        'command_op::clock': clock_body
    doc: '[CONFIRMED_LIVE] H6199 command body at frame offsets 2..18; unmatched registers remain raw'
  - id: checksum
    type: u1
    doc: '[CONFIRMED_LIVE] raw XOR checksum byte at frame offset 19; validated by the fixture runner'
enums:
  command_op:
    0x09: clock
types:
  clock_body:
    seq:
      - id: hour
        type: u1
        doc: '[INFERRED] apparent local hour; captured as 13 at 13:35 local time'
      - id: minute
        type: u1
        doc: '[INFERRED] apparent local minute; captured as 35 at 13:35 local time'
      - id: second
        type: u1
        doc: '[INFERRED] apparent local second; captured as 21'
      - id: weekday
        type: u1
        doc: '[INFERRED] apparent weekday; captured as 1 on Monday 2026-07-27'
      - id: flag1
        type: u1
        doc: '[INFERRED] unknown clock field captured as 1; no H6199 variation yet'
      - id: utc_offset_hours
        type: s1
        doc: '[INFERRED] apparent signed UTC-offset hour component; captured as +10 in Australia/Sydney'
      - id: utc_offset_minutes
        type: u1
        doc: '[INFERRED] apparent UTC-offset minute component; captured as 0 in Australia/Sydney'
      - id: opaque_tail
        size: 10
        doc: '[CONFIRMED_LIVE] remaining H6199 clock-body bytes, captured as an opaque all-zero window'
