"""Unified entry point for the lossless type-1 and type-2 scene codecs.

Decoding turns catalogue parameters into canonical values; encoding rebuilds the exact
parameter bytes. Neither direction applies a scene, so this remains a preservation layer.
"""

from .layered_scene_decoder import (
    decode_catalogue_layered_scene as decode_catalogue_layered_scene,
)
from .layered_scene_decoder import (
    decode_layered_scene as decode_layered_scene,
)
from .layered_scene_decoder import (
    encode_layered_scene as encode_layered_scene,
)
from .palette_scene_decoder import (
    decode_catalogue_palette_scene as decode_catalogue_palette_scene,
)
from .palette_scene_decoder import (
    decode_palette_scene as decode_palette_scene,
)
from .palette_scene_decoder import (
    encode_palette_scene as encode_palette_scene,
)

__all__ = [
    "decode_catalogue_layered_scene",
    "decode_catalogue_palette_scene",
    "decode_layered_scene",
    "decode_palette_scene",
    "encode_layered_scene",
    "encode_palette_scene",
]
