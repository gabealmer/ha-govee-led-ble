meta:
  id: h6199_status_query
  title: Govee H6199 "aa" status-query envelope (decode-only)
  endian: le
doc: |
  H6199 phone-to-light status queries from the attributable iPhone connect burst
  in h6199-aa40.pcap. This model is independent from both the H617A grammar and
  h6199_status_reply: a query and its reply share the register byte but do not
  necessarily share a body shape.

  The hardware query is the observed exception to the all-zero query body. It
  carries selector 0x03 at frame offset 2; firmware, power, identity and the two
  subordinate-version queries carry zero-filled body windows.
seq:
  - id: header
    contents: [0xaa]
    doc: '[CONFIRMED_LIVE] H6199 status-query header at frame offset 0'
  - id: domain
    type: u1
    enum: query_domain
    doc: '[CONFIRMED_LIVE] H6199 queried register at frame offset 1'
  - id: body
    size: 17
    type:
      switch-on: domain
      cases:
        'query_domain::power': zero_body
        'query_domain::firmware': zero_body
        'query_domain::hardware': hardware_query_body
        'query_domain::identity': zero_body
        'query_domain::subordinate_20': zero_body
        'query_domain::subordinate_21': zero_body
    doc: '[CONFIRMED_LIVE] H6199 query body at frame offsets 2..18, selected by the queried register'
  - id: checksum
    type: u1
    doc: '[CONFIRMED_LIVE] raw XOR checksum byte at frame offset 19; validated by the fixture runner'
enums:
  query_domain:
    0x01: power
    0x06: firmware
    0x07: hardware
    0x14: identity
    0x20: subordinate_20
    0x21: subordinate_21
types:
  zero_body:
    seq:
      - id: zeros
        type: u1
        valid: 0
        repeat: eos
        doc: '[CONFIRMED_LIVE] all-zero H6199 query body; grammar-enforced across the captured power, firmware, identity and subordinate-version queries'
  hardware_query_body:
    seq:
      - id: selector
        contents: [0x03]
        doc: '[CONFIRMED_LIVE] H6199 hardware-version query selector at frame offset 2'
      - id: zeros
        type: u1
        valid: 0
        repeat: eos
        doc: '[CONFIRMED_LIVE] all-zero remainder after the H6199 hardware query selector'
