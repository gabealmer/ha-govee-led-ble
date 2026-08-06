meta:
  id: h6199_effect_upload
  title: Govee H6199 reassembled 0xA3 effect body (decode-only)
  endian: le
doc: |
  The definition of a lighting effect, sent to the H6199 over the 0xA3 multi-frame channel
  and reassembled before it reaches this grammar. It is what the light is given when the app
  applies a scene the light does not already hold, immediately before the 33 05 04 write
  that starts it; see h6199_command_write::scene_body, whose scene_class byte took its first
  reading from whether one of these had been sent, a reading since retracted.

  Modelled independently from the H617A effect grammars and importing nothing, per the
  charter. That is not ceremony here: this model's DIY uploads were previously believed to
  use 0xA1 "in place of 0xA3", and every H6199 upload captured has used 0xA3, so the shared
  reading was already wrong about this family once.

  THREE SHAPES SHARE THIS ENVELOPE, chosen by the kind byte. A catalogue or Workshop scene
  arrives as a count and a list of length-prefixed blocks. An effect built in the app's DIY
  editor arrives as parameters - family, variant, speed and a palette. The two shipped
  builtin-parameter scenes carry a third body kind whose interior remains unmodelled.

  Workshop controls now isolate both ends of a scene block, including selection, brightness,
  colour timing, movement and priority. The colour-dependent middle stays opaque because no
  H6199 capture has yet moved one of its fields alone.

  The committed corpus spans catalogue scenes, Workshop layers, all nineteen DIY styles,
  repeated builtin-parameter scenes and repeated AI applications. The grammar accounts for
  every byte while retaining opaque windows where the captures do not isolate structure.
seq:
  - id: header
    contents: [0x01]
    doc: '[CONFIRMED_LIVE] effect-body marker at body offset 0, captured as 0x01 in all thirty-two bodies'
  - id: chunk_count
    type: u1
    doc: |
      [CONFIRMED_LIVE] how many 17-byte transport chunks the body occupies, at body offset 1.
      Captured between 2 and 10, and in every case equal BOTH to the number of 0xA3 frames
      the phone actually sent and to the number of chunks the content needs, which is the
      used length divided by seventeen and rounded up. Two independent ways of arriving at
      the same number, across thirty-two bodies, is what names it.

      It is redundant with the transport, which is worth stating: the frame count is already
      knowable from the frames themselves, so this is the sender telling the light how much
      to expect rather than anything about the effect.
  - id: kind
    type: u1
    enum: body_kind
    doc: |
      [CONFIRMED_LIVE] which shape the rest of the body takes, at body offset 2. Captured as
      0x02 in all thirteen scene-shaped uploads and 0x04 in all nineteen from the DIY editor,
      and the two shapes are not variations on each other: a scene body continues with a
      block count and a list of length-prefixed blocks, a DIY body with four parameters and
      a palette.

      This byte was first modelled as an unnamed constant, correctly, because the only
      bodies then captured were scenes and it never moved. The note left on it said a body
      that is not a scene is what would separate a version from a body type. That capture
      was then taken, and it did.

      A THIRD VALUE, 0x01, arrived from the gallery's "Sweet" and "Halloween-A". Both were
      reapplied and produced byte-identical uploads. Their bodies have different lengths and
      internal values, but two non-adjustable catalogue samples cannot isolate their fields,
      so this grammar recognises the shape without copying another model's layout into it.
  - id: content
    type:
      switch-on: kind
      cases:
        'body_kind::builtin_parameters': unmodelled_content
        'body_kind::scene': scene_content
        'body_kind::diy': diy_content
    doc: '[CONFIRMED_LIVE] the effect definition from body offset 3, in the shape the kind byte selects'
enums:
  body_kind:
    0x01: builtin_parameters
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
  workshop_select_type:
    0x00: segment
    0x01: select_ic_continuously
    0x02: select_ic_randomly
types:
  unmodelled_content:
    doc: |
      The builtin-parameter body shape, held whole. Sweet and Halloween-A are the complete
      shipped H6199 type-1 catalogue set and have different lengths, but neither is adjustable.
      Their repeat applications are byte-identical, so no controlled comparison can isolate
      an interior field without importing another model's grammar.
    seq:
      - id: opaque_body
        size-eos: true
        doc: '[CONFIRMED_LIVE] the entire body after the kind byte, captured from both shipped samples and their byte-identical repeats'
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
          and Rainbow2 give the SAME 9 and 10, and           Music1 gives 8, Music2 gives 6 and Music3 gives 7. So the value is not unique
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
          between 6 and 18 bytes and always zero, across twenty-two DIY uploads spanning all
          nineteen styles, eight families and three palette sizes.

          A CLAIM THAT THIS IS ALWAYS PADDING WOULD BE TOO STRONG. The vendor Android app has
          a DIY encoder that appends a SECOND length-prefixed block after the palette, for
          effects carrying a direction or sub-effect list, and this field would swallow it
          silently while still validating. No captured H6199 upload contains one: Music2 and
          Music3 complete the editor's style list, and Music3 was also applied after shortening
          its palette. Every resulting tail is zero. So the field is right for everything this
          editor exposes, while a future firmware or editor surface could still add structure.
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
      One element of the effect. Thirteen scene-shaped bodies hold 30 blocks between
      them and every one is a length byte followed by exactly that many bytes.
    seq:
      - id: len
        type: u1
        doc: '[CONFIRMED_LIVE] the block length, not counting itself; captured between 26 and 47 across 30 blocks'
      - id: applied_area
        type: u1
        doc: |
          [CONFIRMED_LIVE] the layer's Applied Area byte at block offset 0, still raw. Captured
          as 0x40 for the selected window in the controlled Workshop chain; its internal
          encoding has not yet been isolated on H6199.
      - id: select_type
        type: u1
        enum: workshop_select_type
        doc: |
          [CONFIRMED_LIVE] the Workshop "Select Type" at block offset 1. With both displayed
          counts held at 2, switching Segment to Select IC Continuously moved this byte alone
          from 0 to 1. Select IC Randomly then carried 2.
      - id: select_upper
        type: u1
        doc: |
          [CONFIRMED_LIVE] selection parameter at block offset 2. It is zero for Segment and
          continuous selection and reads 2 while the random selector shows Maximum ICs 2.
          The maximum itself has not yet been varied under an otherwise fixed random setup,
          so the byte keeps a structural rather than semantic name.
      - id: select_count_or_minimum
        type: u1
        doc: |
          [CONFIRMED_LIVE] selection parameter at block offset 3. It follows Number of Segment
          and Number of IC directly, and under Select IC Randomly moving Minimum IC from 1 to 2
          moved this byte alone from 1 to 2.
      - id: opaque_head_tail
        size: 3
        doc: |
          [CONFIRMED_LIVE] block offsets 4 through 6, still unnamed. No single H6199 control
          has isolated these three bytes.
      - id: brightness_scope_low
        size: 1
        if: len >= 15
        doc: |
          [CONFIRMED_LIVE] the bottom of the layer's "Brightness Scope" range, at block offset
          7, scaled to 0..255. Captured 2026-08-05 by dragging that range slider's lower handle
          alone: the byte went from 0 to 0x5b while the editor's label went from 0% to 35%,
          and 91 of 255 is 35.7%.
      - id: opaque_gap
        size: 1
        doc: |
          [CONFIRMED_LIVE] one byte at block offset 8, unnamed. The Brightness Scope control
          has an upper handle which would sit naturally here, but no capture ever moved it:
          the drag was refused and the label stayed at 100%.

          IT IS NOT CONSTANT, and a doc here once said it was. It reads 0x00, 0x01, 0x02 and
          0x03 across the committed corpus, which was true when that sentence was written and
          contradicted it. "No controlled comparison moved it" and "it never varies" are
          different claims, and only the first one is ours to make: every one of those values
          came from a differently-authored effect, so the spread says nothing about what
          drives it.
      - id: brightness_change_speed
        size: 1
        if: len >= 15
        doc: |
          [CONFIRMED_LIVE] the layer's "Brightness Changing Speed", at block offset 9, scaled to
          0..255. Captured by dragging that slider alone: 0x80 at 50% became 0xed, and 237 of
          255 is 93%.
      - id: retention_time_brightest
        size: 1
        if: len >= 15
        doc: |
          [CONFIRMED_LIVE] the layer's "Retention Time of the Brightest Light", at block offset
          10, written directly. Captured by dragging that slider alone, 20 becoming 154, which
          is what the editor then displayed.
      - id: retention_time_darkest
        size: 1
        if: len >= 15
        doc: |
          [CONFIRMED_LIVE] the layer's "Retention Time of the Darkest Light", at block offset
          11, written directly. Captured the same way, 20 becoming 195.

          THE TWO RETENTION TIMES SIT TOGETHER AND ARE WRITTEN DIRECTLY, while the two speeds
          around them are scaled to 0..255. Both conventions appear inside one block, so
          neither can be assumed for a byte that has not been driven.
      - id: distribution_direction
        type: u1
        doc: |
          [CONFIRMED_LIVE] packed Distribution Method and general Direction at block offset 12.
          With Based on Number of IC held constant, changing Backward to Forward moved 0x81
          to 0x01. With Forward held constant, changing the method moved this byte alone:
          Unified Colour 0, Based on Number of IC 1, Based on Segment 2. Bit 0x80 therefore
          means Backward and the remaining value selects the distribution method.
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
      - id: opaque_middle
        size: len - 22
        if: len >= 22
        doc: |
          [CONFIRMED_LIVE] the part of the block between the fixed head and the fixed trailer,
          still unnamed for the same reason as the head. Its length is whatever is left over,
          which is what makes the block's two ends addressable while its middle is not.
      - id: selected_movement
        type: u1
        if: len >= 22
        doc: |
          [CONFIRMED_LIVE] packed selected-area movement byte at block offset len - 7. Bit
          0x10 enables movement. The direction values are Forward 0, Forward and Backward 1,
          Backward 2 and Backward and Forward 3. Bit 0x04 independently enables "Enter and
          Exit Effect": toggling it off moved 0x14 to 0x10 alone while the displayed direction
          remained Forward. The former "fifth direction" was this separate switch.
      - id: selected_movement_interval
        size: 1
        if: len >= 22
        doc: |
          [CONFIRMED_LIVE] the "Moving Interval" belonging to the selected-area movement, at
          block offset len - 6, written directly. Read as 0x00 against an editor showing 0,
          and 0x01 in the sibling block whose editor showed 1.
      - id: selected_movement_speed
        size: 1
        if: len >= 22
        doc: |
          [CONFIRMED_LIVE] the "Moving Speed" belonging to the selected-area movement, at block
          offset len - 5, scaled to 0..255. Read as 0x80 against an editor showing 50%, which
          is 128 of 255.
      - id: overall_movement
        size: 1
        if: len >= 22
        doc: |
          [CONFIRMED_LIVE] the layer's "Overall Moving Effect", packed as an enable flag and a
          direction, at block offset len - 4. Captured by turning that one switch on, which
          moved this byte 0x00 -> 0x10 alone, and then by changing only its direction from
          "Forward" to "Backward and Forward", which moved it 0x10 -> 0x13. So 0x10 is the
          enable bit and the low nibble is the direction's index into the picker: Forward 0,
          Backward 1, Forward and Backward 2, Backward and Forward 3.

          THIS IS THE BYTE THE BLOCK'S TWO ENDS WERE FOUND FROM. Its position is quoted from
          the END of the block because that is where it is fixed: a 26-byte block carries it
          at 22 and a 29-byte block at 25, and both were read against their own editor page in
          one capture.
      - id: overall_movement_interval
        size: 1
        if: len >= 22
        doc: |
          [CONFIRMED_LIVE] the "Moving Interval" belonging to the overall movement, at block
          offset len - 3, written directly. Read as 0x00 where the editor showed 0 and 0x01
          where it showed 1, in two blocks of different lengths in the same body.
      - id: overall_movement_speed
        size: 1
        if: len >= 22
        doc: |
          [CONFIRMED_LIVE] the "Moving Speed" belonging to the overall movement, at block
          offset len - 2, scaled to 0..255. Captured by dragging that one slider: 0x80 at 50%
          became 0xf2 at 95%, and 242 of 255 is 94.9%. The sibling block read 0xb7 against an
          editor showing 72%, and 183 of 255 is 71.8%.
      - id: layer_priority
        size: 1
        if: len >= 22
        doc: |
          [CONFIRMED_LIVE] the layer's "Effect Layer Priority" level, at the LAST byte of the
          block, written directly as the 1..5 the editor shows. Captured by choosing 3, which
          moved this byte 0x00 -> 0x03 and nothing else; the sibling block read 0x01 against
          an editor showing 1.

          TURNING THE SWITCH ON WROTE NOTHING. The probe that enabled "Effect Layer Priority"
          without choosing a level produced a byte-identical body, so this byte carries the
          level and there is no separate enable bit for it. That is worth keeping: a switch
          that does not reach the wire until a second control is touched is the kind of thing
          a write-side model invents an enable flag for.
    instances:
      distribution_method:
        value: 'distribution_direction & 0x7f'
        doc: '[CONFIRMED_LIVE] Distribution Method value: 0 Unified Colour, 1 Based on Number of IC, 2 Based on Segment'
      direction_is_backward:
        value: '(distribution_direction & 0x80) != 0'
        doc: '[CONFIRMED_LIVE] general Direction is Backward when bit 0x80 is set and Forward when clear'
      selected_movement_enabled:
        value: '(selected_movement & 0x10) != 0'
        doc: '[CONFIRMED_LIVE] selected-area movement is enabled when bit 0x10 is set'
      selected_enter_exit_enabled:
        value: '(selected_movement & 0x04) != 0'
        doc: '[CONFIRMED_LIVE] Enter and Exit Effect is enabled when bit 0x04 is set'
      selected_direction:
        value: 'selected_movement & 0x03'
        doc: '[CONFIRMED_LIVE] selected-area direction value: 0 Forward, 1 Forward and Backward, 2 Backward, 3 Backward and Forward'
