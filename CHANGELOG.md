# CHANGELOG


## v4.5.0 (2026-08-05)

### Bug Fixes

- Ignore a .venv symlink, not just a .venv directory
  ([`55e9d92`](https://github.com/teh-hippo/ha-govee-led-ble/commit/55e9d923a6c04ddce46ac3015eac08c98143a7f4))

- **ble**: Key the capture source guard on the connection, not the address
  ([`a691353`](https://github.com/teh-hippo/ha-govee-led-ble/commit/a6913535bc2f62cd0825e606517e4ab9e833cecd))

- **ble**: Stop analyse_capture reading a second connection as this one
  ([`137de6f`](https://github.com/teh-hippo/ha-govee-led-ble/commit/137de6f9a920f70f4f84a777b8cd19f2739a1efa))

- **ble**: Stop the decoder printing secrets and dropping replies
  ([`e9a221b`](https://github.com/teh-hippo/ha-govee-led-ble/commit/e9a221bc16548214afbf6fd8a28febcc5236150d))

- **coordinator**: Only name a scene readback for a model that owns the name
  ([`a4791aa`](https://github.com/teh-hippo/ha-govee-led-ble/commit/a4791aa3045138d990ef8e474e970b693becae22))

- **h6199**: Send this model's own scene frame, and offer only the scenes it holds
  ([`0946b4a`](https://github.com/teh-hippo/ha-govee-led-ble/commit/0946b4a3796faab54cb4dc13fd5e675fd1cb3e5b))

- **harness**: Finish the teardown when the entry has not loaded yet
  ([`ed1a973`](https://github.com/teh-hippo/ha-govee-led-ble/commit/ed1a973882a3f02e81b15592d755ecbb8602399c))

- **harness**: Rebuild a session's state from the device, not the shell
  ([`b871433`](https://github.com/teh-hippo/ha-govee-led-ble/commit/b8714332b0ef345a78dd53c14cb8c389a6ae4a60))

- **harness**: Scroll the container the screen actually has
  ([`eed1810`](https://github.com/teh-hippo/ha-govee-led-ble/commit/eed1810929c55fcf1c567b509a70af50dc7ba063))

- **kaitai**: Count the H6199 effect blocks and drop the DIY editor plan
  ([`27f4d0c`](https://github.com/teh-hippo/ha-govee-led-ble/commit/27f4d0c587da95299d2ec8c7809e0afc7556a3e7))

- **kaitai**: Name the scene byte for what it is, with three readings still open
  ([`0d8623a`](https://github.com/teh-hippo/ha-govee-led-ble/commit/0d8623a2dd78ba1ee05fed93daaf46488973bafb))

- **kaitai**: Reject an aggregate threshold that cannot fail
  ([`4831122`](https://github.com/teh-hippo/ha-govee-led-ble/commit/4831122b3ad6db42d666a3f5cfbb1ee24620d6b4))

- **kaitai**: Retire three H6199 write docs that later captures overtook
  ([`883c1f8`](https://github.com/teh-hippo/ha-govee-led-ble/commit/883c1f83e4d84dc1bb2b32c7db21ca1ba6dd3f25))

- **kaitai**: Retract an over-claimed reading and the numbers propping it up
  ([`7536b48`](https://github.com/teh-hippo/ha-govee-led-ble/commit/7536b486daea6ff0549fba13693b5c2876a0226b))

- **kaitai**: The H6199 power read-back is inferred, not confirmed
  ([`0439dc5`](https://github.com/teh-hippo/ha-govee-led-ble/commit/0439dc5ccc4e5cebdc4828bde47b42b50fbc23fe))

- **kaitai**: The scene byte reports provenance, not whether the light holds it
  ([`8adf25f`](https://github.com/teh-hippo/ha-govee-led-ble/commit/8adf25f895721c7f6cd29b5dd5aaa87bff55e845))

- **kaitai**: Two H6199 aggregates could not fail, and one had gone stale
  ([`57b209a`](https://github.com/teh-hippo/ha-govee-led-ble/commit/57b209abf098f42b545aa26e3378f7a531d39551))

- **mock**: Read a 33 a9 write on its selector instead of assuming white balance
  ([`c3941a6`](https://github.com/teh-hippo/ha-govee-led-ble/commit/c3941a660b1247cf6d2e820d4ed8da79163baeb2))

### Chores

- **deps**: Lock file maintenance
  ([`e7d5ed1`](https://github.com/teh-hippo/ha-govee-led-ble/commit/e7d5ed19e55d7d27d9b8be55ce3060715716eb2a))

- **deps**: Lock file maintenance
  ([`aaa22a5`](https://github.com/teh-hippo/ha-govee-led-ble/commit/aaa22a56576f632c36896c1edc14a5fc2a87fde7))

- **kaitai**: Correct clock timezone fields
  ([`7afbc91`](https://github.com/teh-hippo/ha-govee-led-ble/commit/7afbc91b5ab5fd9d86c375d795b31afa2d3e741d))

- **mise**: Own the zsign pin here rather than globally
  ([`0817118`](https://github.com/teh-hippo/ha-govee-led-ble/commit/08171187c910a33a5a2f5768f212d74e9d7030f7))

### Code Style

- **tests**: Format the teardown test that went in unformatted
  ([`decc12b`](https://github.com/teh-hippo/ha-govee-led-ble/commit/decc12ba44ca06e32e2c806cbaaef19d668b32e3))

### Documentation

- A capture source is a connection, not an address
  ([`de2af7b`](https://github.com/teh-hippo/ha-govee-led-ble/commit/de2af7b215030a04f65573bb2c020543e18b2337))

- **ble**: Capture with the DEVICE off IP, not just the phone
  ([`9d6dd7d`](https://github.com/teh-hippo/ha-govee-led-ble/commit/9d6dd7dfbead29f856b4de08f026488d7b82dfab))

- **harness**: Record the recipes found, and retire three wrong claims
  ([`d91029a`](https://github.com/teh-hippo/ha-govee-led-ble/commit/d91029a58d8a07e8c09fb0f9788ff8d26b486c3a))

- **kaitai**: The Workshop slot takes community effects too
  ([`ff3c0da`](https://github.com/teh-hippo/ha-govee-led-ble/commit/ff3c0daecd524445cd28471bc57fa1aecb8c817f))

### Features

- **ble**: Document the Wi-Fi provisioning wire, and give it an encoder
  ([`44ff5ce`](https://github.com/teh-hippo/ha-govee-led-ble/commit/44ff5ce1a1c977c78e9dc98392ea11d5ccad12f4))

- **h6199**: Let the model paint segments, which its own app writes
  ([`3429223`](https://github.com/teh-hippo/ha-govee-led-ble/commit/342922354f980d980147d0c5a23fbbd8a4308915))

- **h6199**: Make white balance, blank screen and the video percentages settable
  ([`1cd7390`](https://github.com/teh-hippo/ha-govee-led-ble/commit/1cd7390d0de1beab2c8292d73ae5e89471259fea))

- **harness**: Drive the app by name, and give the gesture loop a drag
  ([`fd9feb3`](https://github.com/teh-hippo/ha-govee-led-ble/commit/fd9feb3d1e043b326870b366fee8ed21f753eb71))

- **harness**: Own the phone natively on WSL, mount the DDI off USB/IP
  ([`5878413`](https://github.com/teh-hippo/ha-govee-led-ble/commit/5878413da11135b34110d561a27ec2ed63bb75e3))

- **kaitai**: Add H6199 capture baseline
  ([`47793db`](https://github.com/teh-hippo/ha-govee-led-ble/commit/47793db70d1955ec74268406f66ea6e192f944b1))

- **kaitai**: Document H6199 status queries
  ([`12058ea`](https://github.com/teh-hippo/ha-govee-led-ble/commit/12058eae24a2448abbadd19374fbffbdc6a90543))

- **kaitai**: Four live fields come out of the music body's opaque tail
  ([`d2a8ddd`](https://github.com/teh-hippo/ha-govee-led-ble/commit/d2a8dddedfcfa0095ba50c4243b8c582d6f6cae6))

- **kaitai**: Model the aa 05 reply, which this model does answer after all
  ([`1d3c095`](https://github.com/teh-hippo/ha-govee-led-ble/commit/1d3c095972583c8cde1a1f6d54e1e28bd54a83b7))

- **kaitai**: Model the H6199 effect upload as the container it is
  ([`b1263e6`](https://github.com/teh-hippo/ha-govee-led-ble/commit/b1263e67b0f2d910547346b031ee2f6d0950d405))

- **kaitai**: Model the H6199 phone-microphone music stream from its own bytes
  ([`3a50864`](https://github.com/teh-hippo/ha-govee-led-ble/commit/3a50864331c94d0fa4242c146b5ddc4e995b9e61))

- **kaitai**: Model the H6199 video sheet, and the registers behind it
  ([`fecb9a3`](https://github.com/teh-hippo/ha-govee-led-ble/commit/fecb9a3d6a083c768b066748f624c210a02b5e97))

- **kaitai**: Open the H6199 DIY effect body, and let it name the kind byte
  ([`1a94450`](https://github.com/teh-hippo/ha-govee-led-ble/commit/1a944502d375974b724dcc4ed7fb92bbffadb5b6))

- **kaitai**: Open two fields inside the H6199 scene block
  ([`693672b`](https://github.com/teh-hippo/ha-govee-led-ble/commit/693672b8496ba92e81c85ffa1db1714be5e283d8))

- **kaitai**: Settle the H6199 command register on captured bytes
  ([`b27a653`](https://github.com/teh-hippo/ha-govee-led-ble/commit/b27a6538bd73338cb56434ed18bdec2ccf9d4212))

- **kaitai**: Settle the H6199 music sensitivity against the vendor app
  ([`4ee3b37`](https://github.com/teh-hippo/ha-govee-led-ble/commit/4ee3b378177275788f74a3f7d02e45581308bdbb))

- **kaitai**: Settle three APK disagreements against the device
  ([`d26e1de`](https://github.com/teh-hippo/ha-govee-led-ble/commit/d26e1de24064c04e25957623e06d946a31aedd4f))

- **kaitai**: The scene class tracks the vendor's built-in list
  ([`aa135ef`](https://github.com/teh-hippo/ha-govee-led-ble/commit/aa135eff2365b636f37b26a7d2e42c1af6315ed3))

- **kaitai**: The scene classifier is a real field, and a third body shape exists
  ([`9a6fa1b`](https://github.com/teh-hippo/ha-govee-led-ble/commit/9a6fa1b476cd5587bd44f10c426c7d2133e52347))

- **kaitai**: Workshop applies a user effect as a scene into a fixed slot
  ([`24b1bc6`](https://github.com/teh-hippo/ha-govee-led-ble/commit/24b1bc6377df086677cbd9290b68401a06644db0))

- **protocol**: Encode the three H6199 registers the capture campaign proved
  ([`d4f1538`](https://github.com/teh-hippo/ha-govee-led-ble/commit/d4f1538b8c0ab46265512778fadef05ddb731453))

### Refactoring

- **kaitai**: Model the type-1 config byte instead of pinning it to 0x83
  ([`faf1322`](https://github.com/teh-hippo/ha-govee-led-ble/commit/faf13226bc911789af5d22509e1f43cb7bb805f4))

### Testing

- Catch a real identifier however it was disguised
  ([`f60aadf`](https://github.com/teh-hippo/ha-govee-led-ble/commit/f60aadf0f3a4c84b3412cf849f0aa232451efaf0))

- **kaitai**: Fixture the Effects Lab scene applies, and give the id a third high byte
  ([`2e05868`](https://github.com/teh-hippo/ha-govee-led-ble/commit/2e058689f616059ec67e1b81105fecffbefa86ff))


## v4.4.0 (2026-08-02)

### Bug Fixes

- **tools**: Refuse to send to a device nobody named
  ([`5a0256b`](https://github.com/teh-hippo/ha-govee-led-ble/commit/5a0256b8d50ad842e615cea5e684f0d2dbd56800))

### Features

- **kaitai**: Settle Fountain piece_num on the device, promoting it to confirmed
  ([`2253af7`](https://github.com/teh-hippo/ha-govee-led-ble/commit/2253af7bd54d25b769207f45c879870913e0da29))


## v4.3.2 (2026-08-02)

### Bug Fixes

- **kaitai**: Correct the type-1 palette_count values and describe the config byte
  ([`d6f609b`](https://github.com/teh-hippo/ha-govee-led-ble/commit/d6f609b26687fa6b61371187ab4aceccb23b1307))

- **kaitai**: Read the Fountain tail as segment arithmetic, not a direction pair
  ([`f986e9b`](https://github.com/teh-hippo/ha-govee-led-ble/commit/f986e9bc2ffdcdcc108ddaf63d906e8cb8917e0f))

- **kaitai**: Record the clock offset byte as a timezone, not a constant
  ([`09762ac`](https://github.com/teh-hippo/ha-govee-led-ble/commit/09762acc04b9d3e43c6d483fc82df6301996b686))

### Chores

- **deps**: Lock file maintenance
  ([`704c168`](https://github.com/teh-hippo/ha-govee-led-ble/commit/704c16838a4b7e28415f9ee478da660ed2e79503))

### Documentation

- **kaitai**: Name the vendor formats and warn about the version namespaces
  ([`1bfa613`](https://github.com/teh-hippo/ha-govee-led-ble/commit/1bfa613348427f12fc3f1938410063d589baf3f3))

### Testing

- Rename the terminator-form parity test to what it actually asserts
  ([`59b06e0`](https://github.com/teh-hippo/ha-govee-led-ble/commit/59b06e06f6ad728b58c1fb57d094afbf22583a79))


## v4.3.1 (2026-08-01)

### Bug Fixes

- Keep the StaticPathConfig import valid on Home Assistant 2026.8
  ([`df7e064`](https://github.com/teh-hippo/ha-govee-led-ble/commit/df7e0643c3ef3b5e193588e7f65b13718275149f))


## v4.3.0 (2026-07-31)

### Bug Fixes

- **harness**: Stop the teardown swallowing the capture verdict
  ([`833b1f8`](https://github.com/teh-hippo/ha-govee-led-ble/commit/833b1f8e90d5f47ebb8b2fecf35db1b453cf1ab1))

### Documentation

- Retire the empty third evidence tag
  ([`fdba053`](https://github.com/teh-hippo/ha-govee-led-ble/commit/fdba053f571c37c7f833959c2fa11a550b11e210))

### Features

- **harness**: Bind a capture to the light it is meant to be of
  ([`623060f`](https://github.com/teh-hippo/ha-govee-led-ble/commit/623060f3fcc03c6982ecee30c52258009e515f24))

- **kaitai**: Refuse a spec no fixture exercises
  ([`1ef362e`](https://github.com/teh-hippo/ha-govee-led-ble/commit/1ef362e6d2858e0841a9c3f4043dd417688e12fa))

- **tools**: Refuse a capture that could be two lights
  ([`70684dc`](https://github.com/teh-hippo/ha-govee-led-ble/commit/70684dc0a634147576ccb5dcdba6c81856d95739))


## v4.2.1 (2026-07-31)

### Bug Fixes

- **deps**: Clear the open security advisories
  ([`8039e01`](https://github.com/teh-hippo/ha-govee-led-ble/commit/8039e0141f8e6ee30fba9951063b8cc5ed50d331))

### Documentation

- **protocol**: Settle whether segment brightness duplicates opcode 0x04
  ([`c498ce9`](https://github.com/teh-hippo/ha-govee-led-ble/commit/c498ce96c383cf0a1d9139547f609bfc279237ca))


## v4.2.0 (2026-07-31)

### Bug Fixes

- **protocol**: Gate the video read-back on the model
  ([`ae445fb`](https://github.com/teh-hippo/ha-govee-led-ble/commit/ae445fba8e2f67352271dcdd1cf3b546d6b22daf))

- **protocol**: Stop reading a static colour the device never sends
  ([`3658da4`](https://github.com/teh-hippo/ha-govee-led-ble/commit/3658da43a788a36692086e0b7a13514739e969aa))

### Features

- **light**: Report a scene the build cannot name
  ([`b999c43`](https://github.com/teh-hippo/ha-govee-led-ble/commit/b999c4328f396e3038800553a857b1772eac385d))

### Refactoring

- **protocol**: Give the 33 05 15 layout one owner
  ([`170ab62`](https://github.com/teh-hippo/ha-govee-led-ble/commit/170ab62d9ffdaecde81c554f1768a02138216520))


## v4.1.0 (2026-07-31)

### Chores

- Remove three dead developer scripts
  ([`d151e3d`](https://github.com/teh-hippo/ha-govee-led-ble/commit/d151e3d170995981beb85337ea9f6d1240b662e4))

- **deps**: Update actions/checkout digest to 3d3c42e
  ([`f7fb9f6`](https://github.com/teh-hippo/ha-govee-led-ble/commit/f7fb9f65e6dc073dfeeefdc3b8dd84fed6f50305))

- **deps**: Update astral-sh/setup-uv action to v9
  ([`4377bdc`](https://github.com/teh-hippo/ha-govee-led-ble/commit/4377bdc2aadb5c03080540ef236c131014d188d3))

- **deps**: Update mcr.microsoft.com/devcontainers/python:3.14 docker digest to f04a1e9
  ([`1c20480`](https://github.com/teh-hippo/ha-govee-led-ble/commit/1c20480f97ad1b551b2619b49e7aba6e63c94cff))

- **release**: Retire the beta channel
  ([`348debe`](https://github.com/teh-hippo/ha-govee-led-ble/commit/348debe16dbe3dc14cbc599a52886fd28f3a5ace))

### Documentation

- Record the method the protocol work actually follows
  ([`b5d42aa`](https://github.com/teh-hippo/ha-govee-led-ble/commit/b5d42aa11a7ffde902d7c903fbc85c673d757634))

- **protocol**: Make Kaitai specs the source of truth and retire the prose
  ([`375b587`](https://github.com/teh-hippo/ha-govee-led-ble/commit/375b5878751edcdd17eac84db5d96c43f71b828b))

### Features

- **harness**: Drive the vendor app by element name to source captures
  ([`022b622`](https://github.com/teh-hippo/ha-govee-led-ble/commit/022b6225c23516deeca45176a9c2b8559f76f0b5))

- **protocol**: Correct the H617A encodings and widen the effect surface
  ([`a4cec97`](https://github.com/teh-hippo/ha-govee-led-ble/commit/a4cec9725086527c7180e31bbf90335688476dae))

- **tools**: Capture, replay and decode the wire directly
  ([`4bddcc6`](https://github.com/teh-hippo/ha-govee-led-ble/commit/4bddcc65d3a78fa577b26fb52f2275bb756354ef))


## v4.0.2 (2026-07-20)

### Bug Fixes

- **ble**: Correct H6199 and H617A BLE encodings for stable
  ([`03e8071`](https://github.com/teh-hippo/ha-govee-led-ble/commit/03e8071948373b7425615c06fd38fc8de387d8d8))

### Chores

- **deps**: Lock file maintenance
  ([`b7501b9`](https://github.com/teh-hippo/ha-govee-led-ble/commit/b7501b9e3de987227db5baae4a40d411c99d6945))

- **deps**: Update astral-sh/setup-uv action to v8.3.2
  ([`d0022c4`](https://github.com/teh-hippo/ha-govee-led-ble/commit/d0022c4bdc522928ec369261a7eb201a3ebbe8f0))

- **deps**: Update dependency typescript to v7
  ([`fb3f9c1`](https://github.com/teh-hippo/ha-govee-led-ble/commit/fb3f9c1a40c3cedaaae7813469a8e9e216437c15))

- **deps**: Update softprops/action-gh-release digest to 3d0d988
  ([`fa59a18`](https://github.com/teh-hippo/ha-govee-led-ble/commit/fa59a180648592282102fda9a502c44e1e4e571f))


## v4.0.1 (2026-07-11)

### Bug Fixes

- Recover stale BLE notification sessions
  ([`f1747f4`](https://github.com/teh-hippo/ha-govee-led-ble/commit/f1747f4354e9084c8d99d1eb8ca42ef2e93250f9))

### Chores

- **deps**: Update dependency vitest to v4
  ([`e5b33ed`](https://github.com/teh-hippo/ha-govee-led-ble/commit/e5b33ed5109de442499a16be428ff88329ce4cfa))


## v4.0.0 (2026-07-10)

### Chores

- **deps**: Update dependency vitest to v3.2.7
  ([`bd70be5`](https://github.com/teh-hippo/ha-govee-led-ble/commit/bd70be582830e33b6c3cf1baed02d4970c54e632))

### Features

- Fold music into the light effect list and remove the music Select
  ([`430da4d`](https://github.com/teh-hippo/ha-govee-led-ble/commit/430da4d33c239e037fa7913d46a711d6dd54ca3d))

### Breaking Changes

- Select.music_mode is removed. Choose a music mode from the light's effect list, or use the
  set_music_mode service. Automations and dashboards that referenced select.music_mode must be
  updated.


## v3.0.2 (2026-07-10)

### Bug Fixes

- Drop over-claimed H617A power-off-memory capability
  ([`4fe1713`](https://github.com/teh-hippo/ha-govee-led-ble/commit/4fe1713232fb68d1a1bda529c19d8a8cf1b15852))

- Keep colour-temp mode on read-back instead of dropping to RGB
  ([`848ca42`](https://github.com/teh-hippo/ha-govee-led-ble/commit/848ca4216bb8311ce8891268280c22546d16c43a))

### Chores

- **deps**: Update dependency typescript to v6
  ([`05d5a77`](https://github.com/teh-hippo/ha-govee-led-ble/commit/05d5a7782720800aaec78fef2748ca12595c0af6))

- **deps**: Update dependency vitest to v3 [security]
  ([`8081a92`](https://github.com/teh-hippo/ha-govee-led-ble/commit/8081a926145d2a704574f7ae9a123fe695145251))

### Documentation

- Promote H6199/H617A protocol findings from the 2026-07-10 capture
  ([`142f7f4`](https://github.com/teh-hippo/ha-govee-led-ble/commit/142f7f4757508fcd801d08be4682a3061a017857))


## v3.0.1 (2026-07-10)

### Bug Fixes

- Expose H6199 video mode in the light effect list
  ([`285bcf5`](https://github.com/teh-hippo/ha-govee-led-ble/commit/285bcf5f7ada572823534110e54f1745422d1271))

### Chores

- **deps**: Pin dependency typescript to 5.9.3
  ([`e4f4e10`](https://github.com/teh-hippo/ha-govee-led-ble/commit/e4f4e1006a2db74ddd6a4dca89776988b5699246))

- **deps**: Pin dependency vitest to 2.1.9 [security]
  ([`210eeac`](https://github.com/teh-hippo/ha-govee-led-ble/commit/210eeace96a1d61e4224f687520580328b02141f))


## v3.0.0 (2026-07-10)

### Chores

- Packaging, CI, and dev tooling
  ([`856ac24`](https://github.com/teh-hippo/ha-govee-led-ble/commit/856ac24c6daf644654a389e73bfb600be64da1d2))

- **deps**: Lock file maintenance
  ([`5b5044d`](https://github.com/teh-hippo/ha-govee-led-ble/commit/5b5044d01da72326fa73d84f7364855f530ecb7e))

- **deps**: Lock file maintenance
  ([`1d79b85`](https://github.com/teh-hippo/ha-govee-led-ble/commit/1d79b85ca4f0ebb10716f1335e33e27658284612))

- **deps**: Lock file maintenance
  ([`52a64af`](https://github.com/teh-hippo/ha-govee-led-ble/commit/52a64af2e4ac36eeff93eb3860563d4426d198f5))

- **deps**: Lock file maintenance
  ([`1580d8d`](https://github.com/teh-hippo/ha-govee-led-ble/commit/1580d8dfce161deb529b55e7b2ed2db44a7aa4ea))

- **deps**: Lock file maintenance
  ([`3f78a6e`](https://github.com/teh-hippo/ha-govee-led-ble/commit/3f78a6e956b03efac3caa4cfc4d6fb57125e3906))

- **deps**: Lock file maintenance
  ([`a15c11b`](https://github.com/teh-hippo/ha-govee-led-ble/commit/a15c11b49516a494efc2fad0c850d0e3d04b7bc6))

- **deps**: Update astral-sh/setup-uv action to v8.3.0
  ([`64db815`](https://github.com/teh-hippo/ha-govee-led-ble/commit/64db8158e7ab227f5b4497a2ddcfe8c5da0b9c68))

- **deps**: Update astral-sh/setup-uv action to v8.3.1
  ([`aec5bdd`](https://github.com/teh-hippo/ha-govee-led-ble/commit/aec5bdd1c1e42378dbfaf3ad3574c6dd119ea9e8))

- **deps**: Update python-semantic-release/python-semantic-release digest to 39dd205
  ([`68b3704`](https://github.com/teh-hippo/ha-govee-led-ble/commit/68b370450a738825cb7c0a758258605e68b726af))

### Continuous Integration

- Remove CodeQL advanced workflow in favour of default setup
  ([`b2a4177`](https://github.com/teh-hippo/ha-govee-led-ble/commit/b2a4177c69a1f8691a80cb35589cb3851687562a))

- **release**: Enable the segments beta channel
  ([`7a63463`](https://github.com/teh-hippo/ha-govee-led-ble/commit/7a634638f39bc8f222d9a2a90a00e658efa31e1e))

### Documentation

- H617A/H6199 BLE protocol reference and example dashboards
  ([`a9a0975`](https://github.com/teh-hippo/ha-govee-led-ble/commit/a9a09754c74a9cc8c85372a22b5446fa7e68f85a))

### Features

- Reshape the integration to the 3.0.0 entity surface
  ([`419643b`](https://github.com/teh-hippo/ha-govee-led-ble/commit/419643bb988acce130bb9f0711c340ca3d2ec58f))

### Testing

- Unit suite and mock-BLE device simulator
  ([`e18d11b`](https://github.com/teh-hippo/ha-govee-led-ble/commit/e18d11b9500065c4592415328a448d4c7a4b30df))

### Breaking Changes

- 3.0.0 reshapes the entity surface. light.effect_list no longer contains "music: *" or "video: *"
  (use select.music_mode; the old strings still work for one release with a deprecation repair, then
  are removed). "energic" is a deprecated alias for "energetic". switch.music_calm is replaced by
  select.music_style (H617A only). Video is service-only via ha_govee_led_ble.set_video_mode; the
  H6199 video param entities are removed. The experimental options flow is removed; timers,
  power-off memory, DIY and music parameters are now disabled-by-default entities. Re-point
  automations accordingly.


## v2.1.38 (2026-07-06)

### Build System

- **deps**: Pin hub reusable workflows to v2
  ([`e093718`](https://github.com/teh-hippo/ha-govee-led-ble/commit/e093718e8afcb4b8ed9c6f5adeb4a57fcb27b48e))

### Chores

- **deps**: Lock file maintenance
  ([`bfae328`](https://github.com/teh-hippo/ha-govee-led-ble/commit/bfae3280301330e7c2d8baf7498d4878e0912e9c))

- **deps**: Update actions/checkout action to v7
  ([`cff5f92`](https://github.com/teh-hippo/ha-govee-led-ble/commit/cff5f926628a4b75bfa1c9eb14b37f9f0efa2f8c))

- **deps**: Update actions/checkout digest to df4cb1c
  ([`f7febf0`](https://github.com/teh-hippo/ha-govee-led-ble/commit/f7febf0ced911445668e82133ced0d77696d8040))

- **deps**: Update astral-sh/setup-uv action to v8.2.0
  ([`7a86955`](https://github.com/teh-hippo/ha-govee-led-ble/commit/7a86955f8a5de0972137ce2c01ee7ae125d4be0b))

- **deps**: Update mcr.microsoft.com/devcontainers/python:3.14 docker digest to 1c3a630
  ([`66e7158`](https://github.com/teh-hippo/ha-govee-led-ble/commit/66e71583ac1fc088cc08981c380fef3ee6b6c1e3))

- **deps**: Update mcr.microsoft.com/devcontainers/python:3.14 docker digest to 66af9ee
  ([`82c86d9`](https://github.com/teh-hippo/ha-govee-led-ble/commit/82c86d91f9df14541604ba45b5b6705d3be31f00))

- **deps**: Update python-semantic-release/python-semantic-release digest to 37a30a7
  ([`ff07639`](https://github.com/teh-hippo/ha-govee-led-ble/commit/ff07639b45368772c1525e822e9788a1a6072421))

- **deps**: Update softprops/action-gh-release digest to 718ea10
  ([`2158b75`](https://github.com/teh-hippo/ha-govee-led-ble/commit/2158b75b1ef9a3623aea471665973445b92076ad))

- **deps**: Update teh-hippo/common-repo-configs digest to 564e27e
  ([`119c925`](https://github.com/teh-hippo/ha-govee-led-ble/commit/119c925aa65f278cb42f803a7425dae870478aad))

- **deps**: Update teh-hippo/common-repo-configs digest to b3d0a78
  ([`8185bd9`](https://github.com/teh-hippo/ha-govee-led-ble/commit/8185bd95516ae59d2cee4734bc940259c0c8e02e))

- **renovate**: Extend base preset directly (retire weekly slot)
  ([`4488813`](https://github.com/teh-hippo/ha-govee-led-ble/commit/4488813874123eb6eaeadd8b9865d8f9a4354c53))

### Continuous Integration

- Adopt shared CodeQL workflow
  ([`f062882`](https://github.com/teh-hippo/ha-govee-led-ble/commit/f06288281cea7fce6c3df3be50381150ea275833))

- Adopt uv sync --locked pattern
  ([`8fa135c`](https://github.com/teh-hippo/ha-govee-led-ble/commit/8fa135c258c99b1633aa8a65fbce0e92ee75a210))

- **release**: Commit uv.lock from build_command via assets
  ([`ec1dd68`](https://github.com/teh-hippo/ha-govee-led-ble/commit/ec1dd68a9a101d70e5f58682e672f61409c8ef1b))

- **validate**: Drop daily cron and Dependabot/Copilot branch push triggers
  ([`31a4a57`](https://github.com/teh-hippo/ha-govee-led-ble/commit/31a4a57fcf395c510f2fd013909b7c5dcbed3e78))

### Testing

- Add serialx[esphome] dev dependency for HA usb component
  ([`6b1dbaf`](https://github.com/teh-hippo/ha-govee-led-ble/commit/6b1dbaf7e835eaa76f755175b660a467d6a8ac4f))


## v2.1.37 (2026-05-26)

### Build System

- **deps**: Adopt shared Renovate preset
  ([`eb714d7`](https://github.com/teh-hippo/ha-govee-led-ble/commit/eb714d7dbb9d69424944e8c8a62e2d24fb519c55))

- **deps**: Bump idna in the uv group across 1 directory
  ([`7027754`](https://github.com/teh-hippo/ha-govee-led-ble/commit/7027754fbbe51cd2cb76839f511ddee457298f5b))


## v2.1.36 (2026-05-24)

### Build System

- **deps**: Update all non-major
  ([`319f5dc`](https://github.com/teh-hippo/ha-govee-led-ble/commit/319f5dc910cfaa072881f74e38c6a2d5f165b5b6))


## v2.1.35 (2026-05-17)

### Build System

- **deps**: Pin dependencies
  ([`74fb055`](https://github.com/teh-hippo/ha-govee-led-ble/commit/74fb05530b462acc442d54db736893ea0afbd0b7))


## v2.1.34 (2026-05-14)

### Build System

- **deps**: Bump urllib3 in the uv group across 1 directory
  ([`396924e`](https://github.com/teh-hippo/ha-govee-led-ble/commit/396924ea1dd0e9418026b1ecd777bee6759b54ec))

### Continuous Integration

- Stagger cron and pin floating action refs
  ([`bf60136`](https://github.com/teh-hippo/ha-govee-led-ble/commit/bf6013630c9401eb9f05ec5b1a5998cc40bf4faf))


## v2.1.33 (2026-05-04)

### Bug Fixes

- **deps**: Force PyJWT>=2.12.0 and pytest>=9.0.3 via uv overrides
  ([`3d0357a`](https://github.com/teh-hippo/ha-govee-led-ble/commit/3d0357a4ba16017f784e71ba3f6eff5d65a9d4c7))


## v2.1.32 (2026-05-04)

### Build System

- **renovate**: Group and auto-merge major updates
  ([`c1484e8`](https://github.com/teh-hippo/ha-govee-led-ble/commit/c1484e84c7c6b7e288340a3e3e6b1515cc7f7dd0))


## v2.1.31 (2026-05-04)

### Build System

- Drop redundant pytest/pytest-asyncio/coverage pins
  ([`804bfe5`](https://github.com/teh-hippo/ha-govee-led-ble/commit/804bfe5ccde32900138ea87abc7ec1234b92c9a3))


## v2.1.30 (2026-05-03)

### Build System

- **deps**: Upgrade
  ([`bd4048d`](https://github.com/teh-hippo/ha-govee-led-ble/commit/bd4048d9ef4b29ece4878ff37e6839acaee8eaea))


## v2.1.29 (2026-05-03)

### Build System

- **deps**: Upgrade
  ([`2894281`](https://github.com/teh-hippo/ha-govee-led-ble/commit/2894281d4f076fc27e6beda45abdc9f65f8e8ac3))


## v2.1.28 (2026-04-26)

### Build System

- **deps**: Update astral-sh/setup-uv action to v8
  ([`c7873af`](https://github.com/teh-hippo/ha-govee-led-ble/commit/c7873af06fbdc7c1506c1dc6257870f2e7a24224))

- **deps**: Upgrade
  ([`21f9ce1`](https://github.com/teh-hippo/ha-govee-led-ble/commit/21f9ce10c4a969c7a38b8281ecbdef8284f42eb3))


## v2.1.27 (2026-04-19)

### Build System

- **deps**: Upgrade
  ([`e40b569`](https://github.com/teh-hippo/ha-govee-led-ble/commit/e40b5698247449f38559676acdc77c61438920e8))


## v2.1.26 (2026-04-19)

### Build System

- **deps**: Upgrade
  ([`f18bca0`](https://github.com/teh-hippo/ha-govee-led-ble/commit/f18bca0520fff919ca8c48091edc2b5ec60911df))


## v2.1.25 (2026-04-14)

### Build System

- **deps**: Update dependency pytest to v9.0.3 [SECURITY]
  ([`804348f`](https://github.com/teh-hippo/ha-govee-led-ble/commit/804348f2b41895a2feca7eb7dcb0b794a896b76e))


## v2.1.24 (2026-04-12)

### Build System

- **deps**: Update softprops/action-gh-release action to v3
  ([`2559451`](https://github.com/teh-hippo/ha-govee-led-ble/commit/25594515315b793aa15df2259fe782de5ff9633c))

- **deps**: Upgrade
  ([`c4397f3`](https://github.com/teh-hippo/ha-govee-led-ble/commit/c4397f3836757db7bdf096eee53d8498a04cebe9))


## v2.1.23 (2026-04-05)

### Build System

- **deps**: Upgrade
  ([`b6e8cdb`](https://github.com/teh-hippo/ha-govee-led-ble/commit/b6e8cdb10a7a90c72cb30a76867fff1ab327f7d9))


## v2.1.22 (2026-04-05)

### Build System

- **deps**: Upgrade
  ([`f6e68c0`](https://github.com/teh-hippo/ha-govee-led-ble/commit/f6e68c03fec5b06cf55997317a08e2942c54b2f5))


## v2.1.21 (2026-04-05)

### Build System

- Update Renovate config for weekly grouped updates
  ([`83f30f5`](https://github.com/teh-hippo/ha-govee-led-ble/commit/83f30f56f8d53b2ed0ed52ba6527c12afa35404e))


## v2.1.20 (2026-03-30)

### Build System

- **deps**: Upgrade
  ([`cc748bc`](https://github.com/teh-hippo/ha-govee-led-ble/commit/cc748bcc2ed1875f52fc490fc792e79856b829f8))


## v2.1.19 (2026-03-30)

### Build System

- **deps**: Upgrade
  ([`16b09cd`](https://github.com/teh-hippo/ha-govee-led-ble/commit/16b09cdc00cc844f3e20366065f958b6a049af33))


## v2.1.18 (2026-03-30)

### Build System

- **deps**: Upgrade
  ([`564ff2b`](https://github.com/teh-hippo/ha-govee-led-ble/commit/564ff2b00a7b19a39542d1a5fc5143136bb9d7a8))


## v2.1.17 (2026-03-30)

### Build System

- **deps**: Upgrade
  ([`75f6aac`](https://github.com/teh-hippo/ha-govee-led-ble/commit/75f6aac1e4288713d1f42bc20cc89cfd7f26241d))

### Continuous Integration

- Enable global automerge and fix semantic-release patch_tags
  ([`eb16491`](https://github.com/teh-hippo/ha-govee-led-ble/commit/eb1649129607deebe7ee7a8026b949ab48d85cd1))


## v2.1.16 (2026-03-23)

### Bug Fixes

- **ci**: Pass RELEASE_TOKEN to checkout for git push auth
  ([`95c0a70`](https://github.com/teh-hippo/ha-govee-led-ble/commit/95c0a703d090d692e874830beb267470abe09b7f))

- **ci**: Use RELEASE_TOKEN for semantic-release push
  ([`3852ba9`](https://github.com/teh-hippo/ha-govee-led-ble/commit/3852ba97751cb408e444ce6fe8fc1c282625f902))

### Build System

- Loosen coverage version constraint
  ([`0cea2c2`](https://github.com/teh-hippo/ha-govee-led-ble/commit/0cea2c2346e9f14eaa99f863b267f040707fb749))

- Loosen dev dependency version constraints
  ([`f070cd3`](https://github.com/teh-hippo/ha-govee-led-ble/commit/f070cd3a12a8215dce374762c7977d0517228ef2))

- **deps**: Bump pyopenssl from 25.3.0 to 26.0.0
  ([`fa68d9b`](https://github.com/teh-hippo/ha-govee-led-ble/commit/fa68d9b22e27c3fa7f7b64a6fb8cd6e1a5dd61ff))

- **deps**: Update mcr.microsoft.com/devcontainers/python Docker tag to v3.14
  ([`f8fe564`](https://github.com/teh-hippo/ha-govee-led-ble/commit/f8fe564b83cfcae5f6396db745e47fc999705451))

- **deps**: Upgrade
  ([`5461bb9`](https://github.com/teh-hippo/ha-govee-led-ble/commit/5461bb9ec93168d40907d222376ed925687b869c))

- **deps**: Upgrade
  ([`ec20e52`](https://github.com/teh-hippo/ha-govee-led-ble/commit/ec20e522a98ddfec73f2402908a3eab3a10440b8))

- **deps**: Upgrade
  ([`c5fe710`](https://github.com/teh-hippo/ha-govee-led-ble/commit/c5fe7102ed69cf196aeb4c6ed4766c0e282836a2))

### Chores

- **deps**: Weekly lockfile update
  ([`cd103a2`](https://github.com/teh-hippo/ha-govee-led-ble/commit/cd103a24f68f008a0f45b4795f593cceb9544e2d))

- **deps**: Weekly lockfile update
  ([`aad70cf`](https://github.com/teh-hippo/ha-govee-led-ble/commit/aad70cf3d3fa07f28fd1547f038eb3c2317f7deb))

- **deps**: Weekly lockfile update
  ([`f4bc167`](https://github.com/teh-hippo/ha-govee-led-ble/commit/f4bc167809be76b651a3177203f61ac442f646b6))

- **deps**: Weekly lockfile update
  ([`e6080fd`](https://github.com/teh-hippo/ha-govee-led-ble/commit/e6080fda212bd0a9179aaa1c4ffb51e076eab7b8))

- **deps**: Weekly lockfile update
  ([`56a3952`](https://github.com/teh-hippo/ha-govee-led-ble/commit/56a39523a76a10bc2118c94ebd9689caead6913e))

### Continuous Integration

- Fix automerge config for all update types
  ([`f02ba3f`](https://github.com/teh-hippo/ha-govee-led-ble/commit/f02ba3fcd2ff4921743c730d2dc7ff07e1f30840))

- Fix build_command, remove lockfile-update workflow
  ([`06496f6`](https://github.com/teh-hippo/ha-govee-led-ble/commit/06496f6be262d7e458197d8505a88306a4f6c285))

- Migrate from Dependabot to Renovate
  ([`ee59536`](https://github.com/teh-hippo/ha-govee-led-ble/commit/ee59536de05c34b319a2248bc356c54020250b68))

- Standardise renovate.json with forkProcessing
  ([`3c79ee4`](https://github.com/teh-hippo/ha-govee-led-ble/commit/3c79ee4d74ac33aeb901d037eb6c0cc8b1513fb3))

- Stop cascade of lockfile/release chore commits
  ([`5526462`](https://github.com/teh-hippo/ha-govee-led-ble/commit/55264622d5e93b5a1b7df9ccceeb1e780cf7400a))


## v2.1.15 (2026-03-12)

### Build System

- Tighten requires-python to >=3.14.2 for HA 2026.3.1 compatibility
  ([`9e6c508`](https://github.com/teh-hippo/ha-govee-led-ble/commit/9e6c508d794654ed8cacc4befe6458b3edcadc00))

### Chores

- **deps**: Weekly lockfile update
  ([`c657c10`](https://github.com/teh-hippo/ha-govee-led-ble/commit/c657c1053ade30c69da53fa6b722ba4142fde67b))

- **deps**: Weekly lockfile update
  ([`d7ab1c2`](https://github.com/teh-hippo/ha-govee-led-ble/commit/d7ab1c2b480dd4c7e094f4c2fc555dbb29bc33be))


## v2.1.14 (2026-03-10)

### Build System

- **deps**: Bump peter-evans/create-pull-request from 7 to 8
  ([`184d860`](https://github.com/teh-hippo/ha-govee-led-ble/commit/184d86069f4675790145d51b740653aa5b00cff0))

### Chores

- **deps**: Weekly lockfile update
  ([`e98670b`](https://github.com/teh-hippo/ha-govee-led-ble/commit/e98670b5557dc5088d65f7c4c2944c0f3797293b))


## v2.1.13 (2026-03-10)

### Bug Fixes

- Correct HA version badge to match hacs.json (2026.3+)
  ([`7861361`](https://github.com/teh-hippo/ha-govee-led-ble/commit/78613611b84c6133792c748485d5d413a08094fd))

### Chores

- **deps**: Weekly lockfile update
  ([`739aa64`](https://github.com/teh-hippo/ha-govee-led-ble/commit/739aa64001f7fb5123d90c3760bc6500c193e21e))

- **deps**: Weekly lockfile update
  ([`56e0fdf`](https://github.com/teh-hippo/ha-govee-led-ble/commit/56e0fdf58151451f916fc899920a8818eaf6fcbc))


## v2.1.12 (2026-03-10)

### Bug Fixes

- Exit 1 on real CI failures, exit 0 on pending checks
  ([`cd402cf`](https://github.com/teh-hippo/ha-govee-led-ble/commit/cd402cfacaeb7c08c420e71ed0280237b1758573))


## v2.1.11 (2026-03-10)

### Bug Fixes

- Auto-merge exits cleanly when checks still running
  ([`fd306b7`](https://github.com/teh-hippo/ha-govee-led-ble/commit/fd306b7d9e3858e7b3a5ec5028931de3f03e0b78))

### Chores

- **deps**: Weekly lockfile update
  ([`766d6e0`](https://github.com/teh-hippo/ha-govee-led-ble/commit/766d6e04d36ace90b7393c5feeae1ebc3589a464))

### Continuous Integration

- Replace dependabot-automerge with smart auto-merge
  ([`eb33467`](https://github.com/teh-hippo/ha-govee-led-ble/commit/eb334671a4eeea38528ed4e504b87958d4e07485))


## v2.1.10 (2026-03-10)

### Build System

- **deps**: Bump the python-deps group across 1 directory with 2 updates
  ([`b9349ae`](https://github.com/teh-hippo/ha-govee-led-ble/commit/b9349aedbb0dcf45ac94becd2f20374c9d6720e8))


## v2.1.9 (2026-03-09)

### Bug Fixes

- Guard send_command and refresh against HA shutdown
  ([`8537c8c`](https://github.com/teh-hippo/ha-govee-led-ble/commit/8537c8c827265819158672b2a6f7df0125484614))

### Continuous Integration

- Replace Copilot-gated auto-merge with fastify action
  ([`937fa11`](https://github.com/teh-hippo/ha-govee-led-ble/commit/937fa11e26aa00c5e4eff1ce704221dcf169fd44))


## v2.1.8 (2026-03-07)

### Build System

- **deps**: Exclude coverage/pytest from Dependabot group
  ([`f083167`](https://github.com/teh-hippo/ha-govee-led-ble/commit/f083167b0991657586a05e61a25b8042bc5cdc2a))


## v2.1.7 (2026-03-05)

### Bug Fixes

- **security**: Override vulnerable pillow in dev lock
  ([`e10a089`](https://github.com/teh-hippo/ha-govee-led-ble/commit/e10a089b12bad6013cd853a97181085150603863))


## v2.1.6 (2026-03-05)

### Build System

- **deps**: Bump astral-sh/setup-uv from 6 to 7
  ([`11c720d`](https://github.com/teh-hippo/ha-govee-led-ble/commit/11c720ddcaab05f0adaad1612acb625a1ffbbf93))


## v2.1.5 (2026-03-05)

### Build System

- **deps**: Bump actions/checkout from 4 to 6
  ([#1](https://github.com/teh-hippo/ha-govee-led-ble/pull/1),
  [`8d2d34a`](https://github.com/teh-hippo/ha-govee-led-ble/commit/8d2d34a67487c46d4f3ad529f4f51c4992f8bb89))

- **deps**: Bump github/codeql-action from 3 to 4
  ([#2](https://github.com/teh-hippo/ha-govee-led-ble/pull/2),
  [`3e48145`](https://github.com/teh-hippo/ha-govee-led-ble/commit/3e48145f8ba31bebd33eb6be07ca61021b7c117a))


## v2.1.4 (2026-03-05)

### Build System

- Refresh test deps for python 3.14
  ([`1fdce7e`](https://github.com/teh-hippo/ha-govee-led-ble/commit/1fdce7ed9f70a2a30df6c20bdcde00807bb4cee1))

### Continuous Integration

- Harden dependabot and release flow
  ([`fe9416b`](https://github.com/teh-hippo/ha-govee-led-ble/commit/fe9416b645678232cae0ef70e3b10eb6ba0d1312))


## v2.1.3 (2026-03-05)

### Bug Fixes

- Scope major-update label creation to repository
  ([`163c3bb`](https://github.com/teh-hippo/ha-govee-led-ble/commit/163c3bb8d5204d182d8689a4781840d877a734ed))


## v2.1.2 (2026-03-05)

### Bug Fixes

- Bootstrap major-update label in dependabot workflow
  ([`be88331`](https://github.com/teh-hippo/ha-govee-led-ble/commit/be8833183fcce6bd8a51d1889439635d88748ed5))


## v2.1.1 (2026-03-05)

### Bug Fixes

- Correct Copilot reviewer login
  ([`76e8376`](https://github.com/teh-hippo/ha-govee-led-ble/commit/76e8376216870b52dc203b62ac92f62de739e6ab))


## v2.1.0 (2026-03-05)

### Documentation

- Simplify README, replace table with concise list
  ([`13bf628`](https://github.com/teh-hippo/ha-govee-led-ble/commit/13bf62893beb238212e3e546c86ca3d3765e905e))

### Features

- Add local brand assets and Python 3.14 support
  ([`d66495d`](https://github.com/teh-hippo/ha-govee-led-ble/commit/d66495dab6cfe75f2130e36234badd26a4adc910))


## v2.0.7 (2026-03-01)

### Bug Fixes

- Trigger patch release for H617A retention fix
  ([`d5ccddf`](https://github.com/teh-hippo/ha-govee-led-ble/commit/d5ccddfaee5397c81ac9130321b93ecfcfd1f2bb))


## v2.0.6 (2026-03-01)

### Bug Fixes

- Normalize config-flow addresses
  ([`0f7ef95`](https://github.com/teh-hippo/ha-govee-led-ble/commit/0f7ef959977185c08c9dd11fb34a9f038baf2888))

### Documentation

- Add copilot instructions for this repo
  ([`7f38c0c`](https://github.com/teh-hippo/ha-govee-led-ble/commit/7f38c0c7d14392461f59e8bc571f9b24a77d6848))

### Testing

- Improve uncovered edge coverage
  ([`a657b42`](https://github.com/teh-hippo/ha-govee-led-ble/commit/a657b42ec1332b0b59804185c8945bc75a2e9473))


## v2.0.5 (2026-03-01)

### Build System

- Cap pytest range for Dependabot resolver
  ([`2c0d257`](https://github.com/teh-hippo/ha-govee-led-ble/commit/2c0d2576483ec3c4c6bfd79d35aecf647537e4eb))

### Continuous Integration

- Ignore ruff in Dependabot uv updates
  ([`bb6e1d5`](https://github.com/teh-hippo/ha-govee-led-ble/commit/bb6e1d5c424950a92f1ec12d86f7fa2d604ba510))


## v2.0.4 (2026-03-01)

### Build System

- Constrain coverage for uv resolver stability
  ([`2d60db9`](https://github.com/teh-hippo/ha-govee-led-ble/commit/2d60db96d605eb0f7a3757f9acddf582fc58dfe0))

### Chores

- Bound python compatibility for lock resolution
  ([`de1bfea`](https://github.com/teh-hippo/ha-govee-led-ble/commit/de1bfea2fdc72741c7faa72780f9b052e0398788))

- Sync uv.lock project version
  ([`8882e30`](https://github.com/teh-hippo/ha-govee-led-ble/commit/8882e305875ab046364c8ea758dea87157c9f4ac))


## v2.0.3 (2026-02-28)

### Bug Fixes

- Normalize H617A effects and parse scene status
  ([`469742b`](https://github.com/teh-hippo/ha-govee-led-ble/commit/469742b617b23a5d38e7fb0201168c0a116c17c5))

### Continuous Integration

- Publish latest release alias
  ([`75cfd40`](https://github.com/teh-hippo/ha-govee-led-ble/commit/75cfd40fcdd0d7b2a0f17ae49e55663a5fc71e16))


## v2.0.2 (2026-02-26)

### Bug Fixes

- Restore white-balance number value
  ([`4202d66`](https://github.com/teh-hippo/ha-govee-led-ble/commit/4202d66a78744119322ef375242d2791c99265a7))

### Continuous Integration

- Update latest tag during release
  ([`d535fba`](https://github.com/teh-hippo/ha-govee-led-ble/commit/d535fbadcc08e47725c812f7eff253a5764f8bc0))


## v2.0.1 (2026-02-24)

### Bug Fixes

- **light**: Remove invalid ONOFF color mode
  ([`766bfa8`](https://github.com/teh-hippo/ha-govee-led-ble/commit/766bfa8897b4a178c292ab8d3676c7cdbee9e0f1))


## v2.0.0 (2026-02-23)

### Refactoring

- Remove static white balance number
  ([`2e16788`](https://github.com/teh-hippo/ha-govee-led-ble/commit/2e1678824f720d637dd5d7729d03286989f579a3))

### Breaking Changes

- The white_brightness number entity is no longer created; existing entities are cleaned up from the
  entity registry on startup.


## v1.13.0 (2026-02-23)

### Chores

- Support iOS .pklg captures
  ([`154f9e9`](https://github.com/teh-hippo/ha-govee-led-ble/commit/154f9e9a9cbec3d58e4ab4645113aea947f6fea4))

### Features

- Add DreamView white balance control
  ([`9ce743e`](https://github.com/teh-hippo/ha-govee-led-ble/commit/9ce743ec28f8e2d8540e889a38e6358b2b6bd225))


## v1.12.4 (2026-02-22)

### Bug Fixes

- Expose last AA05 in diagnostics
  ([`c3c5ce7`](https://github.com/teh-hippo/ha-govee-led-ble/commit/c3c5ce7ab2503d8f991d8bb72f173edf05d26859))

### Chores

- Add diagnostics AA05 extractor
  ([`3b7e799`](https://github.com/teh-hippo/ha-govee-led-ble/commit/3b7e7993128a32c5b722010baa07c9c9eec68d7f))

- Add packet trace tooling
  ([`ac7e7e2`](https://github.com/teh-hippo/ha-govee-led-ble/commit/ac7e7e2ca1d0e53fb8a9675e22d4795409b1909e))


## v1.12.3 (2026-02-22)

### Bug Fixes

- **h6199**: Treat white setting as balance, not brightness
  ([`8f1be35`](https://github.com/teh-hippo/ha-govee-led-ble/commit/8f1be357f96eec2248226612ba06e8bc91805ad3))


## v1.12.2 (2026-02-22)

### Bug Fixes

- **h6199**: Cleanup stale controls and apply updates reliably
  ([`e58f334`](https://github.com/teh-hippo/ha-govee-led-ble/commit/e58f3347fea987c1b06d2a87edc62227adf6f9fb))


## v1.12.1 (2026-02-22)

### Bug Fixes

- **h6199**: Make video saturation reapply deterministic
  ([`02d73c2`](https://github.com/teh-hippo/ha-govee-led-ble/commit/02d73c2ff00263c4453bf75c70d064f2b37532ad))

- **h6199**: Normalize white brightness payload semantics
  ([`1a186f6`](https://github.com/teh-hippo/ha-govee-led-ble/commit/1a186f696256e4c3e2fc1cc05084ec9210366ad4))

### Refactoring

- **h6199**: Remove duplicated video brightness control
  ([`a97c286`](https://github.com/teh-hippo/ha-govee-led-ble/commit/a97c28683c9c680fb38b00c3baff3ae874384e1d))


## v1.12.0 (2026-02-22)

### Features

- Expose model music control entities
  ([`397e81d`](https://github.com/teh-hippo/ha-govee-led-ble/commit/397e81deb6cd5d7bab335e92caba85f4bdfcdd4c))


## v1.11.0 (2026-02-22)

### Features

- Enable H617A music controls
  ([`3d3f416`](https://github.com/teh-hippo/ha-govee-led-ble/commit/3d3f416f1eb6258c582f9a26e79b76acda612aca))


## v1.10.0 (2026-02-22)

### Bug Fixes

- Finalize H6199 control updates
  ([`04f31b7`](https://github.com/teh-hippo/ha-govee-led-ble/commit/04f31b75a8ceae680a56b053fe8ae2a685e3fa72))

### Features

- Add H6199 calm rhythm controls
  ([`ba44736`](https://github.com/teh-hippo/ha-govee-led-ble/commit/ba44736ad2e24daf9b1c890347b436d217c74546))

- Expand H6199 parameter support
  ([`9638d48`](https://github.com/teh-hippo/ha-govee-led-ble/commit/9638d4813d966baaa3d5478bd79c8eefd92f51fa))


## v1.9.0 (2026-02-22)

### Features

- Enable H617A state reading
  ([`3c44554`](https://github.com/teh-hippo/ha-govee-led-ble/commit/3c44554bad36afa3bda9bc8b47c99e68cb5d60b4))


## v1.8.1 (2026-02-22)

### Bug Fixes

- Align HACS display naming metadata
  ([`b4e28a5`](https://github.com/teh-hippo/ha-govee-led-ble/commit/b4e28a5f92a29fb4906256324e8d96cd036065d2))

### Chores

- Align integration naming labels
  ([`7eefcbe`](https://github.com/teh-hippo/ha-govee-led-ble/commit/7eefcbe2d1b34f063c314d3936ee2cdd2b3f018b))

### Refactoring

- Simplify BLE source paths
  ([`60c619f`](https://github.com/teh-hippo/ha-govee-led-ble/commit/60c619fa19e6b8c559498f5cac74278db46cffea))

- Simplify H6199 controls and scene data
  ([`2a07250`](https://github.com/teh-hippo/ha-govee-led-ble/commit/2a07250cd0a892385832bf62d270c50a7e1077c9))

- Tighten core BLE source paths
  ([`bb6b54f`](https://github.com/teh-hippo/ha-govee-led-ble/commit/bb6b54f28ff11d0cfc1427660db6843cc655e1f6))


## v1.8.0 (2026-02-21)

### Features

- Rename integration to ha-govee-led-ble
  ([`53d9e89`](https://github.com/teh-hippo/ha-govee-led-ble/commit/53d9e89d6d76267d6434ee6ea8cd9d03a82f9e73))


## v1.7.1 (2026-02-21)

### Bug Fixes

- **ci**: Detect Copilot review outcome via body text, not review state
  ([`8ee8d76`](https://github.com/teh-hippo/ha-govee-led-ble/commit/8ee8d76d73c7e48f71f9cdf31b7162c999f4b5ce))

### Continuous Integration

- Add copilot/dependabot push triggers, concurrency, devcontainer, and auto-merge flow
  ([`7d89542`](https://github.com/teh-hippo/ha-govee-led-ble/commit/7d89542a8e5054762eedc6ac64b5f7cfd8a768a3))


## v1.7.0 (2026-02-19)

### Bug Fixes

- Add formatted runtime translations
  ([`c8e9539`](https://github.com/teh-hippo/ha-govee-led-ble/commit/c8e9539d4994424b494d4f0ae18806202bd6e1c9))

- Add service validation placeholders
  ([`8686ff6`](https://github.com/teh-hippo/ha-govee-led-ble/commit/8686ff62e2aefb8efb080b16bc2a36dab6b5e946))

- Keep optional name arg compatibility
  ([`57269ba`](https://github.com/teh-hippo/ha-govee-led-ble/commit/57269ba813538d48dbaaf743d3625a977111c886))

- Use translation keys for parameter entities
  ([`31acd51`](https://github.com/teh-hippo/ha-govee-led-ble/commit/31acd517618f7d279f5026a1f0b2e4e97ece4be9))

### Chores

- Refresh uv lockfile
  ([`a41dc69`](https://github.com/teh-hippo/ha-govee-led-ble/commit/a41dc6946fc57c8d79f30b773d314ef3f0b7ade8))

### Continuous Integration

- Minimal 4-line .gitignore
  ([`3f50c9b`](https://github.com/teh-hippo/ha-govee-led-ble/commit/3f50c9ba44310e1b220b0e60f6865e77cf4e24c1))

### Documentation

- Standardize section naming
  ([`2e11868`](https://github.com/teh-hippo/ha-govee-led-ble/commit/2e11868c2716b81b7fedf25eba517491bc8ef694))

- Standardize status badge set
  ([`c667bcc`](https://github.com/teh-hippo/ha-govee-led-ble/commit/c667bcccaf62087e6ac1a12c450111e36eb8a0a5))

### Features

- Add diagnostics endpoint
  ([`a245df0`](https://github.com/teh-hippo/ha-govee-led-ble/commit/a245df0493162577b3fe7104bd041b72fd144784))

- Add entity icon mappings
  ([`a7bd668`](https://github.com/teh-hippo/ha-govee-led-ble/commit/a7bd668c9535a59631923011258abe9fc4831684))

- Add quality scale declaration
  ([`ffb9749`](https://github.com/teh-hippo/ha-govee-led-ble/commit/ffb97498fb5d49bd3808b2cc948de4932f030bfa))

- Declare integration logger namespaces
  ([`a481ae6`](https://github.com/teh-hippo/ha-govee-led-ble/commit/a481ae6c7fff04094fdde5cfed7ea1b461a60077))

- Declare parallel updates for platforms
  ([`312790a`](https://github.com/teh-hippo/ha-govee-led-ble/commit/312790a2e88833fae5aea780e268a0dd39c9292a))

### Refactoring

- Add coverage config section
  ([`9dfa8eb`](https://github.com/teh-hippo/ha-govee-led-ble/commit/9dfa8ebad3c640b95d5c1a08a7df300f42526b3a))

- Drop redundant mypy warn_return_any
  ([`49cdce7`](https://github.com/teh-hippo/ha-govee-led-ble/commit/49cdce7320a7ad186a99b307ca19f69e06ba0504))

- Simplify hacs metadata
  ([`5aafe9e`](https://github.com/teh-hippo/ha-govee-led-ble/commit/5aafe9eb3e893af6b0572108e65d8abd23a847e1))


## v1.6.1 (2026-02-18)

### Bug Fixes

- Standardise CI tooling to uv, ruff, mypy strict; correct type annotations
  ([`73a0198`](https://github.com/teh-hippo/ha-govee-led-ble/commit/73a0198e146df2c0bbb7e391fe522405566574dc))

### Continuous Integration

- Standardise tooling — uv, ruff, mypy strict, PSR, dependabot
  ([`32a05dc`](https://github.com/teh-hippo/ha-govee-led-ble/commit/32a05dcfaec588ec245be4f8ebd724d181089005))


## v1.6.0 (2026-02-19)

### Refactoring

- Aggressive codebase reduction — 2864 to 1996 lines (30%)
  ([`5911c75`](https://github.com/teh-hippo/ha-govee-led-ble/commit/5911c757eaeb016719adccbdb516e75e8e6ebc38))


## v1.5.0 (2026-02-19)

### Refactoring

- Reduce codebase by 30% (4098→2864 lines)
  ([`77c11e3`](https://github.com/teh-hippo/ha-govee-led-ble/commit/77c11e3ca1ebc25624f5d999b91b71d17c5f3571))


## v1.4.1 (2026-02-19)

### Chores

- Add preflight script mirroring CI checks
  ([`6071c6c`](https://github.com/teh-hippo/ha-govee-led-ble/commit/6071c6c6519b7c8b491d9456c1049baa9404ada3))


## v1.4.0 (2026-02-19)

### Bug Fixes

- Ruff format + restore HACS continue-on-error until brands PR
  ([`9c605c8`](https://github.com/teh-hippo/ha-govee-led-ble/commit/9c605c81578e743e4338f067f71072c850bf7b0c))

### Continuous Integration

- Ignore HACS brands check until registered upstream
  ([`30d999f`](https://github.com/teh-hippo/ha-govee-led-ble/commit/30d999ff2ea0607f9376e4c707003dc0310c379b))

- Pass GITHUB_TOKEN to release action explicitly
  ([`06212d3`](https://github.com/teh-hippo/ha-govee-led-ble/commit/06212d3d7f722f33b1f453863ea7cec15029a220))

### Documentation

- Tighten README — badges, device table, release flow
  ([`a2c725c`](https://github.com/teh-hippo/ha-govee-led-ble/commit/a2c725c1e5bec915b68e5c1e560b67fb14e51c7f))

### Refactoring

- Comprehensive quality uplift across HA patterns, tests, and CI
  ([`152685d`](https://github.com/teh-hippo/ha-govee-led-ble/commit/152685df0b3f9e4c37787b47772a56895c17e105))


## v1.3.3 (2026-02-18)

### Chores

- Prefer managed Python 3.13
  ([`9240ca0`](https://github.com/teh-hippo/ha-govee-led-ble/commit/9240ca02c23cf2c879704d621d2c1db8a0adab27))


## v1.3.2 (2026-02-13)

### Features

- **h6199**: Add white brightness control
  ([`9085381`](https://github.com/teh-hippo/ha-govee-led-ble/commit/90853814a59b1e6833bad2bb0dd976eb076d5397))


## v1.3.1 (2026-02-13)

### Bug Fixes

- **ci**: Format code and release v1.3.1
  ([`668c9b1`](https://github.com/teh-hippo/ha-govee-led-ble/commit/668c9b153e939a893b048f75cefad50514234dc1))


## v1.3.0 (2026-02-13)

### Features

- **h6199**: Add per-effect helper UX and release v1.3.0
  ([`72e7019`](https://github.com/teh-hippo/ha-govee-led-ble/commit/72e7019303dcfcc983dac7c77854993067f5b0db))


## v1.2.1 (2026-02-13)

### Bug Fixes

- **ci**: Run dependabot updates daily
  ([`924b73c`](https://github.com/teh-hippo/ha-govee-led-ble/commit/924b73cb43110f88c6fad582e59e61c22d407e2d))


## v1.2.0 (2026-02-12)

### Refactoring

- Remove more dead code and redundant tests
  ([`fa7d449`](https://github.com/teh-hippo/ha-govee-led-ble/commit/fa7d44902bec3573ee08d1285822b3771e0448da))


## v1.1.0 (2026-02-12)

- Initial Release
