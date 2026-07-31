meta:
  id: scene_type1_body
  title: Govee H617A reassembled type-1 (legacy) scene body (decode-only)
  endian: le
  imports:
    - govee_common
doc: |
  The reassembled 0xA3 multi-frame body for catalogue scene_type 1, the format
  scene_body.ksy deliberately fails closed on. On-wire layout:
    01 <linecount> 01 <marker> <step_count> <step>... <palette_count> <rgb>... <zero padding>
  Only type 1 belongs here; type 2 (rgbicv2) is scene_body.ksy and type 0 has no
  body at all (those nine scenes ship an empty param and are activated by code
  alone, so nothing is uploaded).
  Every field carries exactly one evidence tag in its doc. The vocabulary and what
  each tag claims are defined once in evidence_lint.py, which also enforces them;
  do not restate them here.

  THE LAYOUT RESTS ON A CATALOGUE DIFFERENTIAL, NOT ON A CAPTURE. No type-1 scene on
  any SKU is adjustable, so no capture on any device can isolate these fields by moving
  a control, and waiting for one would wait forever. A catalogue differential is not a
  weaker substitute for a capture here, it is the only instrument that can reach these
  bytes. That is also why every structural field below is [INFERRED] and cannot be
  promoted by device work.

  THE EVIDENCE THAT REMAINS IN-REPO. Two sources, both kept beside this spec. First,
  the captured Halloween 1173 upload, which is wire-true and pins one value per field.
  Second, eight type-1 catalogue params frozen from the keyless per-SKU
  light-effect-libraries endpoint (see fetch_effect_library.py), carried with the
  type-1 fixtures. Their whole job is breadth that no H617A param can supply: their
  palette_counts run 1 through 7.

  A LARGER CORPUS WAS REMOVED ON 2026-07-28. A frozen 27-SKU third-party archive
  previously backed the numbers here and let three of these fields carry
  CONFIRMED_LIVE. It was retired along with the sweep that read it, and those fields
  were downgraded in the same change rather than left resting on prose. What it showed
  is recorded in the individual field docs as observed history, explicitly not as
  reproducible evidence. Re-closing these fields properly needs a fresh catalogue
  differential or a device with adjustable type-1 scenes.

  THE FIXED-SELECTOR ALTERNATIVE IS STILL FALSIFIED. The earlier draft offered a rival
  reading that consumed both H617A params just as exactly: a FIXED 0x04 selector
  followed by exactly four rgb, with the step's trailing pair as two independent u1
  fields. It fitted only because palette_count happened to be 4 in both scenes. Across
  the eight retained type-1 params that byte takes SEVEN different values (1 to 7) and
    len(param) == 2 + 5*step_count + 1 + 3*palette_count
  holds for every one of them. A constant cannot take seven values, so the rival
  reading is dead and palette_count is a count. This argument survived the corpus
  removal intact, because it never needed the corpus.

  BYTE 0 IS A LAYOUT DISCRIMINATOR, NOT A MARKER. It was modelled as a fixed 0x83
  "because that is all two identical samples can support". The frozen scene_type == 1
  sweep shows it is not fixed: it takes 0x03, 0x83, 0x93 and 0x95, and its value selects
  the record layout above. 0x13 does NOT appear under the filter, so the earlier draft's
  0x13 group was type-2 record_count leakage, not a type-1 layout. Bit 0x80 is orthogonal
  to the layout: the 0x03 params and the 0x83 params both satisfy the same 5-byte-step
  arithmetic, so masking it off isolates the layout. The earlier draft's stronger claim
  that a scene ships byte-identical under 0x03 and 0x83 on different SKUs is NOT
  reproducible in this corpus, whose only 0x03 params are H6051 "Work" and "Rush" with
  no 0x83 twin, so treat it as unproven. See the marker field for why the guard stays
  pinned to 0x83 anyway.

  WHAT REMAINS OPEN. step::value is the one field the sweep did not settle. Its high
  byte is 0x00 in all 102 step records of this layout and all 81 of the 8-byte 0x93
  layout, so a u2le and two independent u1 bytes stay indistinguishable. No catalogue
  can break that tie; it needs a device that ships a step value above 255.

  THE ROUND-TRIP IS INTERNAL, NOT A CAPTURE. The fixtures frame the catalogue param
  with our own encoder and reassemble it with our own reader (see
  tests/test_protocol_wire_parity.py), so they prove self-consistency and exact
  consumption, not wire truth. The one genuine wire datum is below.

  CATALOGUE PARAM == BODY PAYLOAD HERE TOO. [CONFIRMED_LIVE 2026-07-23] A captured
  Halloween application uploaded a 51-byte A3 body, which is the 3-byte A3/type
  prefix plus this 45-byte param plus 3 bytes of chunk padding, so the frozen param
  is the payload for type 1 exactly as it is for type 2 (see scene_body.ksy). This is
  what connects the catalogue differential above to the wire: it confirms that the
  bytes the differential segments are the bytes H617A actually receives. What the
  capture alone cannot show is where the field boundaries inside those bytes fall,
  and no capture on this hardware ever will, because nothing varies them.

  THE FORMAT LOOKS MODEL-INDEPENDENT. [INFERRED] The two local catalogues corroborate
  at the byte level: H617A and H6199 ship byte-identical type-1 params (H617A 1173 /
  1170 against H6199 110 / 107). Cross-model generality beyond that pair was argued
  from the 27-SKU archive retired on 2026-07-28 and is no longer reproducible in-repo,
  so it stays an inference. All of this is evidence about vendor catalogue data, never
  about H6199 device behaviour, which stays out of scope here.
seq:
  - id: header
    type: govee_common::a3_header
    doc: '[CONFIRMED_LIVE] shared A3 body header 01 <linecount>'
  - id: scene_type
    type: u1
    valid:
      eq: 1
    doc: '[CONFIRMED_LIVE] A3 body type byte (frame offset 2); guard fails the grammar closed on anything but type 1, mirroring scene_body.ksy which guards for type 2. Wire-true from the captured Halloween upload.'
  - id: marker
    type: u1
    valid:
      eq: 0x83
    doc: '[INFERRED] layout discriminator rather than a fixed marker, but its meaning rests on vendor catalogue format, not on a capture this grammar round-trips, so it stays inferred. A multi-value marker is real: the type-1 fixtures kept alongside this spec show 0x83 carrying the 5-byte-step-plus-palette layout modelled here. Values 0x03, 0x93 and 0x95 were seen in a frozen cross-SKU corpus that was removed from the repo on 2026-07-28, so they are recorded here as observed history rather than as reproducible evidence: 0x93 indexed 8-byte steps with no palette section, 0x95 10-byte steps with no palette. All three came from a single SKU even then. The guard stays pinned to 0x83 because the grammar must fail closed on layouts it does not model.'
  - id: step_count
    type: u1
    doc: '[INFERRED] the number of steps that follow. DOWNGRADED 2026-07-28 from CONFIRMED_LIVE when the frozen cross-SKU corpus that carried it was removed from the repo: that tag rested on 37 catalogue params, and an analysis whose input is gone is prose, not evidence. What survives in-repo is the captured Halloween body, which pins this byte at 6 and consumes exactly, plus the eight catalogue params in the type-1 fixtures, whose step_counts are 1 and 2. Two live values cannot separate a count from a fixed field, and no type-1 scene on any SKU is adjustable, so no capture on this hardware can close it either. Closing it properly needs a fresh catalogue differential or a device with adjustable type-1 scenes.'
  - id: steps
    type: step
    repeat: expr
    repeat-expr: step_count
    doc: '[INFERRED] step_count fixed-width 5-byte steps. DOWNGRADED 2026-07-28 with step_count above: the width-1..16 solver that admitted 5 as the only fitting geometry ran over the frozen cross-SKU corpus, which is no longer in the repo. Width 5 still consumes the captured Halloween body and all eight type-1 fixtures with zero residue, so the geometry is not in doubt for what we hold; what is gone is the breadth that made it the ONLY admissible width.'
  - id: palette_count
    type: u1
    doc: '[INFERRED] the number of palette colours that follow. DOWNGRADED 2026-07-28 with the fields above when the frozen cross-SKU corpus left the repo. THE FALSIFICATION SURVIVES INTACT: the eight type-1 fixtures kept alongside this spec take palette_count 1, 2, 3, 4, 5, 6 and 7, each consuming exactly, and a constant cannot take seven values, so the rival reading of a fixed 0x04 selector stays dead. The tag drops to inferred not because the argument weakened but because its evidence is catalogue format rather than a device control being moved, and no type-1 scene on any SKU is adjustable, so no capture can promote it.'
  - id: palette
    type: govee_common::rgb
    repeat: expr
    repeat-expr: palette_count
    doc: '[CONFIRMED_LIVE] the effect palette, shared govee_common::rgb, palette_count entries. The length is variable, not fixed at four, and decodes to the colours the effects show: oranges for Halloween, pinks and purples for Sweet.'
  - id: padding
    type: u1
    valid: 0
    repeat: eos
    doc: '[CONFIRMED_LIVE] transport zero padding to the A3 chunk boundary; grammar-enforced all-zero. Wire-true from the captured Halloween upload, which padded 48 body bytes to 51.'
types:
  step:
    doc: |
      One 5-byte animation step: a colour and a 16-bit value. Halloween's six steps
      are #fff500 then five near-whites, each with value 5 except the last at 6;
      Sweet's single step is #ffb4ff with value 50.
    seq:
      - id: colour
        type: govee_common::rgb
        doc: '[CONFIRMED_LIVE] the step colour, shared govee_common::rgb'
      - id: value
        type: u2
        doc: '[INFERRED] 16-bit little-endian value at step offset 3; 5,5,5,5,5,6 across Halloween and 50 for Sweet, so it varies and is a real field. Duration or speed is the obvious reading and is NOT established, because no type-1 scene on any SKU is adjustable, so no control anywhere can be moved against it. THE SPLIT AMBIGUITY IS UNRESOLVED: the high byte is 0x00 in every step record we hold, so two independent u1 bytes fit identically. Modelled as u2le because every other multi-byte field in this family is little-endian (see status_reply::cm_scene.scene_id), so the 16-bit reading needs no unusual endianness; contrast status_reply::unit_count_body, which is modelled as two bytes precisely because its 16-bit reading would have to be big-endian. Only a device shipping a step value above 255 can decide it.'
