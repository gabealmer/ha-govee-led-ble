meta:
  id: h6199_effect_upload
  title: Govee H6199 reassembled 0xA3 effect body (decode-only)
  endian: le
doc: |
  The definition of a lighting effect, sent to the H6199 over the 0xA3 multi-frame channel
  and reassembled before it reaches this grammar. It is what the light is given when the app
  applies a scene the light does not already hold, immediately before the 33 05 04 write
  that starts it; see h6199_command_write::scene_body, whose kind byte is exactly the
  predictor of whether one of these was sent.

  Modelled independently from the H617A effect grammars and importing nothing, per the
  charter. That is not ceremony here: this model's DIY uploads were previously believed to
  use 0xA1 "in place of 0xA3", and every H6199 upload captured has used 0xA3, so the shared
  reading was already wrong about this family once.

  THE BODY IS A CONTAINER AND THIS GRAMMAR STOPS AT THAT BOUNDARY. Each block's interior is
  left opaque because no capture varies it under a known control: the eight bodies here were
  produced by applying eight different catalogue scenes, so every byte inside a block
  changed at once and nothing is isolated. The DIY editor, which lets an effect be built one
  parameter at a time, is where those bytes can be pinned, and until then naming them would
  be reading the H617A grammar into a model that has already broken it.

  Every field below is derived from eight captured bodies, taken 2026-08-04 by applying
  eight scenes from three of the app's categories. They span one to five blocks, block
  lengths 26 to 47, and reassembled lengths 51 to 170, and the structure accounts for every
  byte of all eight with nothing left over.
seq:
  - id: header
    contents: [0x01]
    doc: '[CONFIRMED_LIVE] effect-body marker at body offset 0, captured as 0x01 in all eight bodies'
  - id: chunk_count
    type: u1
    doc: |
      [CONFIRMED_LIVE] how many 17-byte transport chunks the body occupies, at body offset 1.
      Captured as 3, 3, 4, 6, 7, 7, 7 and 10, and in every case equal BOTH to the number of
      0xA3 frames the phone actually sent and to the number of chunks the content needs,
      which is the used length divided by seventeen and rounded up. Two independent ways of
      arriving at the same number across eight bodies spanning 3 to 10 is what names it.

      It is redundant with the transport, which is worth stating: the frame count is already
      knowable from the frames themselves, so this is the sender telling the light how much
      to expect rather than anything about the effect.
  - id: opaque_kind
    size: 1
    doc: |
      [CONFIRMED_LIVE] one byte at body offset 2, captured as 0x02 in all eight bodies and
      never seen to vary. Unnamed for that reason. A version or a body type are both
      plausible and neither is evidenced; a body that is not a scene, such as a DIY upload,
      is what would separate them.
  - id: block_count
    type: u1
    doc: |
      [CONFIRMED_LIVE] how many blocks follow, at body offset 3. Captured as 1, 1, 2, 2, 3,
      3, 4 and 5, and in every case exactly that many length-prefixed blocks are present and
      consume the body up to its padding. A count that predicts where the padding starts, in
      eight bodies of five different sizes, is not a coincidence of small numbers.
  - id: blocks
    type: block
    repeat: expr
    repeat-expr: block_count
    doc: '[CONFIRMED_LIVE] the effect definition, as block_count length-prefixed blocks starting at body offset 4'
  - id: padding
    size-eos: true
    doc: |
      [CONFIRMED_LIVE] zero padding out to the transport chunk boundary. Captured as 1 to 16
      bytes, always zero, in all eight bodies. Its length is whatever is left of the last
      seventeen-byte chunk, which is why the reassembled length is always a multiple of
      seventeen and cannot be used as the content length.
types:
  block:
    doc: |
      One element of the effect. Eight bodies hold nineteen blocks between them and every one
      is a length byte followed by exactly that many bytes.
    seq:
      - id: len
        type: u1
        doc: '[CONFIRMED_LIVE] the block length, not counting itself; captured between 26 and 47 across nineteen blocks'
      - id: opaque_body
        size: len
        doc: |
          [CONFIRMED_LIVE] the block contents, held opaque. Every byte of it moved between
          every pair of captured bodies, because each body came from applying a different
          catalogue scene, so nothing inside is isolated by a controlled comparison.

          There is visible regularity, and it is recorded here as a starting point rather
          than as fields: blocks frequently begin with three bytes, then a byte taking small
          values such as 0x01, 0x05, 0x0a and 0x0f, then a pair that is usually 02 01. Runs
          of RGB-looking triples appear later in most blocks. None of that is a measurement.

          Settle it in the DIY editor, where one parameter can be changed at a time. A
          previous survey there already isolated an effect family and variant to two adjacent
          bytes by applying five styles with one palette, which is the shape the experiment
          should take here.
