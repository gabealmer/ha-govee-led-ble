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

  TWO SHAPES SHARE THIS ENVELOPE, chosen by the kind byte. A catalogue scene arrives as a
  count and a list of length-prefixed blocks whose interior is left opaque. An effect built
  in the app's DIY editor arrives as parameters - family, variant, speed and a palette -
  every one of which is isolated, because the editor changes one thing at a time.

  The scene blocks stay opaque because no capture varies one under a known control: the
  eight scene bodies came from applying eight different catalogue scenes, so every byte
  inside a block moved at once. Naming them would mean reading the H617A grammar into a
  model that has already broken it once.

  Derived from twenty-one bodies captured 2026-08-04: eight scenes from three of the app's
  categories, and thirteen DIY uploads. The structure accounts for every byte of all
  twenty-one with nothing left over.
seq:
  - id: header
    contents: [0x01]
    doc: '[CONFIRMED_LIVE] effect-body marker at body offset 0, captured as 0x01 in all twenty-one bodies'
  - id: chunk_count
    type: u1
    doc: |
      [CONFIRMED_LIVE] how many 17-byte transport chunks the body occupies, at body offset 1.
      Captured between 2 and 10, and in every case equal BOTH to the number of 0xA3 frames
      the phone actually sent and to the number of chunks the content needs, which is the
      used length divided by seventeen and rounded up. Two independent ways of arriving at
      the same number, across twenty-one bodies, is what names it.

      It is redundant with the transport, which is worth stating: the frame count is already
      knowable from the frames themselves, so this is the sender telling the light how much
      to expect rather than anything about the effect.
  - id: kind
    type: u1
    enum: body_kind
    doc: |
      [CONFIRMED_LIVE] which shape the rest of the body takes, at body offset 2. Captured as
      0x02 in all eight catalogue-scene uploads and 0x04 in all thirteen DIY-editor uploads,
      and the two shapes are not variations on each other: a scene body continues with a
      block count and a list of length-prefixed blocks, a DIY body with four parameters and
      a palette.

      This byte was first modelled as an unnamed constant, correctly, because the only
      bodies then captured were scenes and it never moved. The note left on it said a body
      that is not a scene is what would separate a version from a body type. That capture
      was then taken, and it did.
  - id: content
    type:
      switch-on: kind
      cases:
        'body_kind::scene': scene_content
        'body_kind::diy': diy_content
    doc: '[CONFIRMED_LIVE] the effect definition from body offset 3, in the shape the kind byte selects'
enums:
  body_kind:
    0x02: scene
    0x04: diy
  effect_family:
    0x00: fade
    0x01: jumping
    0x02: twinkle
    0x03: marquee
    0x04: music
    0x08: chasing
    0x09: rainbow
    0x0a: crossing
types:
  scene_content:
    seq:
      - id: block_count
        type: u1
        doc: |
          [CONFIRMED_LIVE] how many blocks follow, at body offset 3. Captured as 1, 1, 2, 2,
          3, 3, 4 and 5, and in every case exactly that many length-prefixed blocks are
          present and consume the body up to its padding. A count that predicts where the
          padding starts, in eight bodies of five different sizes, is not a coincidence of
          small numbers.
      - id: blocks
        type: block
        repeat: expr
        repeat-expr: block_count
        doc: '[CONFIRMED_LIVE] the effect definition, as block_count length-prefixed blocks starting at body offset 4'
      - id: padding
        size-eos: true
        doc: |
          [CONFIRMED_LIVE] zero padding out to the transport chunk boundary. Captured as 1 to
          16 bytes, always zero, in all eight scene bodies. Its length is whatever is left of
          the last seventeen-byte chunk, which is why the reassembled length is always a
          multiple of seventeen and cannot be used as the content length.
  diy_content:
    doc: |
      An effect the user built in the app's DIY editor, sent as parameters rather than as
      compiled blocks. Every field here is isolated: the editor changes one thing at a time
      and thirteen uploads were taken that way, so consecutive pairs are controlled
      comparisons.
    seq:
      - id: family
        type: u1
        enum: effect_family
        doc: |
          [CONFIRMED_LIVE] the animation family, at body offset 3. Captured as 0 for the three
          Fade styles, 1 for the two Jumping, 2 for the three Twinkle, 3 for the three
          Marquee, 4 for Music, 8 for the two Chasing, 9 for the two Rainbow and 10 for
          Crossing, by tapping each style in the editor's live-apply list with the palette and
          speed untouched.

          THE NUMBERING HAS GAPS, at 5, 6 and 7, and every family either side of them is
          present. So this is an identifier from a list longer than one model's editor offers,
          not a dense index over what this editor draws.

          The names are the labels the iOS app prints. The vendor ANDROID app calls family 2
          "Blinking" where iOS says "Twinkle", so these record one vendor's vocabulary rather
          than a protocol fact. Every capture in this repository comes from the iOS app, which
          is why its labels are the ones used.
      - id: variant
        type: u1
        doc: |
          [CONFIRMED_LIVE] which style within the family, at body offset 4. NOT AN ORDINAL,
          which is the whole reason this field is worth a note: the numbers are 0, 1, 2 for
          Fade1..3 and 0, 1, 2 for Twinkle1..3, which invites reading it as a zero-based
          index, but Jumping1 and Jumping2 give 0 and 2, skipping 1, and Marquee1..3 give 3,
          4 and 5 rather than starting at zero.

          Later captures make it plainer still. Chasing1 and Chasing2 give 9 and 10, Rainbow1
          and Rainbow2 give the SAME 9 and 10, and Music1 gives 8. So the value is not unique
          across families either: what identifies a style is the pair, and the number alone
          means nothing without the family beside it.
      - id: speed
        type: u1
        doc: |
          [CONFIRMED_LIVE] animation speed, at body offset 5. Captured as 0x32 and then 0x5c
          by dragging the editor's Speed slider with nothing else touched, the two uploads
          differing at this byte alone.
      - id: palette_len
        type: u1
        doc: |
          [CONFIRMED_LIVE] how many palette bytes follow, at body offset 6. Captured as 21
          with the editor's seven default swatches and 18 after deleting one, three bytes per
          colour. Deleting a swatch moved this byte and removed exactly that colour's three
          bytes, which is what ties the count to the palette rather than to the body length.
      - id: palette
        type: rgb
        repeat: expr
        repeat-expr: palette_len / 3
        doc: '[CONFIRMED_LIVE] the colours the effect cycles, from body offset 7, in the order the editor draws them'
      - id: padding
        size-eos: true
        doc: |
          [CONFIRMED_LIVE] zero padding out to the transport chunk boundary, captured as
          between 6 and 18 bytes and always zero, across nineteen DIY uploads spanning eight
          families and three palette sizes.

          A CLAIM THAT THIS IS ALWAYS PADDING WOULD BE TOO STRONG. The vendor Android app has
          a DIY encoder that appends a SECOND length-prefixed block after the palette, for
          effects carrying a direction or sub-effect list, and this field would swallow it
          silently while still validating. No captured H6199 upload contains one: every style
          the editor offers was applied and all nineteen end with zeros. So the field is right
          for everything observed and the guard it lacks is recorded here rather than written
          against bytes nobody has seen. An effect exposing a direction control is what would
          settle it.
  rgb:
    seq:
      - id: red
        type: u1
        doc: '[CONFIRMED_LIVE] red channel; the editor default palette begins ff 00 00, which is the red swatch it draws first'
      - id: green
        type: u1
        doc: '[CONFIRMED_LIVE] green channel; the fourth swatch is 00 ff 00 and the app draws it green'
      - id: blue
        type: u1
        doc: '[CONFIRMED_LIVE] blue channel; the fifth swatch is 00 00 ff and the app draws it blue'
  block:
    doc: |
      One element of the effect. Eight bodies hold twenty-one blocks between them and every
      one is a length byte followed by exactly that many bytes.
    seq:
      - id: len
        type: u1
        doc: '[CONFIRMED_LIVE] the block length, not counting itself; captured between 26 and 47 across twenty-one blocks'
      - id: opaque_head
        size: 13
        doc: |
          [CONFIRMED_LIVE] the first thirteen bytes of the block, still unnamed. Every one of
          them moved between every pair of differently-authored effects, so nothing in here is
          isolated by a controlled comparison.
      - id: colour_change_speed
        size: 1
        if: len >= 15
        doc: |
          [CONFIRMED_LIVE] the layer's "Color Changing Speed", at block offset 13, scaled to
          0..255 rather than written as a percent. Captured 2026-08-05 by dragging that one
          slider in the Workshop effect editor and re-applying: the byte read 0x80 while the
          editor showed 50% and 0xea at 92%, which is 128 and 234 against the 128 and 235 a
          0..255 scaling predicts. The one-count difference is rounding at the app's end.

          NOTE THE SCALING, because it is not this model's habit. Brightness, saturation,
          softness and music sensitivity are all written as a direct percent elsewhere in this
          protocol; inside a workshop block this one is not.
      - id: retention_time
        size: 1
        if: len >= 15
        doc: |
          [CONFIRMED_LIVE] the layer's "Retention Time", at block offset 14, written directly.
          Captured in the same session by dragging only that slider: the byte read 0x14 while
          the editor showed 20 and 0xc3 when it showed 195, matching exactly. The app prints
          it as a bare number rather than a percentage, and the wire agrees.
      - id: opaque_tail
        size: len - 15
        if: len >= 15
        doc: |
          [CONFIRMED_LIVE] the rest of the block, still unnamed for the same reason as the
          head.

          THE TWO NAMED OFFSETS ARE ESTABLISHED ON ONE BLOCK SHAPE ONLY, a twenty-nine byte
          block from a single-layer effect. Blocks of 26, 32, 35, 38 and 47 bytes are also in
          the corpus and nothing yet shows their layout is the same, so a field found at 13
          and 14 here is positional and not proven general. Editing a multi-layer effect one
          slider at a time is what would extend it; the route is the same one that opened
          these two.
