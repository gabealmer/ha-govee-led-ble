"""AES-128-GCM v2 encrypted BLE transport for newer Govee devices (H3001 etc.).

Port of homebridge-govee lib/utils/ble-crypto.js (commit 5372fbd).

Wire format on 00010203-0405-0607-0809-0a0b0c0d2b11 (write) and ...2b10 (notify):

  handshake request   e7 11 01 | iv(12) | tagLen(1) | GCM{ txIvKey(8) }
  handshake response  e7 11 00 | iv(12) |            GCM{ rxIvKey(8) ++ devInfo(11) }

  deviceKey = AES-128-ECB-encrypt(KEY_DEVICE, devInfo padded to 16)

  data frame          counter(4, big endian) | GCM{ 20-byte Govee frame }
"""
from __future__ import annotations

import os
import struct

from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

KEY_HANDSHAKE = bytes.fromhex("fc03783c7c42cb83e202a1643648aff6")
KEY_DEVICE = bytes.fromhex("ae028b630bae6ecc4bff1b249e22f955")

TAG_LEN = 12

HDR_MAGIC0 = 0xE7
HDR_MAGIC1 = 0x11
HDR_SUB_REQUEST = 0x01
HDR_STATUS_OK = 0x00


def is_handshake_frame(data: bytes) -> bool:
    """True if data is an e711 handshake frame rather than a data frame."""
    return len(data) >= 3 and data[0] == HDR_MAGIC0 and data[1] == HDR_MAGIC1


def _gcm_seal(key: bytes, iv: bytes, aad: bytes, plaintext: bytes) -> bytes:
    encryptor = Cipher(algorithms.AES(key), modes.GCM(iv)).encryptor()
    encryptor.authenticate_additional_data(aad)
    return encryptor.update(plaintext) + encryptor.finalize() + encryptor.tag[:TAG_LEN]


def _gcm_open(key: bytes, iv: bytes, blob: bytes, aad: bytes) -> bytes:
    ciphertext, tag = blob[:-TAG_LEN], blob[-TAG_LEN:]
    decryptor = Cipher(algorithms.AES(key), modes.GCM(iv, tag=tag, min_tag_length=TAG_LEN)).decryptor()
    decryptor.authenticate_additional_data(aad)
    return decryptor.update(ciphertext) + decryptor.finalize()


def build_handshake(tx_iv_key: bytes | None = None, iv: bytes | None = None) -> tuple[bytes, bytes]:
    """Build the handshake to write first on every new connection.

    Returns (frame, tx_iv_key).
    """
    tx_iv_key = tx_iv_key or os.urandom(8)
    iv = iv or os.urandom(12)
    frame = bytearray(36)
    frame[0] = HDR_MAGIC0
    frame[1] = HDR_MAGIC1
    frame[2] = HDR_SUB_REQUEST
    frame[3:15] = iv
    frame[15] = TAG_LEN
    frame[16:] = _gcm_seal(KEY_HANDSHAKE, iv, bytes(frame[0:16]), tx_iv_key)
    return bytes(frame), tx_iv_key


def parse_handshake_response(frame: bytes) -> dict:
    """Parse the light's handshake reply.

    Returns {"rx_iv_key", "dev_info", "sku", "mac"}.
    """
    if not is_handshake_frame(frame):
        raise ValueError(f"not an e711 response: {frame[:4].hex()}")
    if frame[2] != HDR_STATUS_OK:
        raise ValueError(f"handshake rejected, status 0x{frame[2]:02x}")
    blob = _gcm_open(KEY_HANDSHAKE, frame[3:15], frame[15:], frame[0:15])
    if len(blob) != 19:
        raise ValueError(f"expected a 19-byte handshake blob, got {len(blob)}")
    rx_iv_key, dev_info = blob[:8], blob[8:]
    return {
        "rx_iv_key": rx_iv_key,
        "dev_info": dev_info,
        "sku": dev_info[:5].decode("ascii"),
        "mac": ":".join(f"{b:02x}" for b in dev_info[5:11][::-1]),
    }


def _derive_device_key(dev_info: bytes) -> bytes:
    """deviceKey = AES-128-ECB-encrypt(KEY_DEVICE, devInfo padded to 16)."""
    block = dev_info + bytes(16 - len(dev_info))
    encryptor = Cipher(algorithms.AES(KEY_DEVICE), modes.ECB()).encryptor()
    return encryptor.update(block) + encryptor.finalize()


class V2Session:
    """Per-connection session, wrapping outgoing/incoming 20-byte frames."""

    def __init__(self, tx_iv_key: bytes, dev_info: bytes, rx_iv_key: bytes | None = None) -> None:
        self.tx_iv_key = tx_iv_key
        self.device_key = _derive_device_key(dev_info)
        self.rx_iv_key = rx_iv_key
        self.tx_counter = 1
        self.rx_counter = 1

    def seal(self, frame20: bytes, counter: int | None = None) -> bytes:
        """Wrap a plain 20-byte Govee frame for writing."""
        counter = self.tx_counter if counter is None else counter
        ctr = struct.pack(">I", counter & 0xFFFFFFFF)
        out = ctr + _gcm_seal(self.device_key, self.tx_iv_key + ctr, ctr, frame20)
        if counter == self.tx_counter:
            self.tx_counter += 1
        return out

    def open(self, data: bytes) -> bytes:
        """Unwrap a 36-byte frame pushed by the light (RX direction)."""
        if self.rx_iv_key is None:
            raise ValueError("no rx_iv_key: build the session from the handshake reply")
        ctr = data[:4]
        plain = _gcm_open(self.device_key, self.rx_iv_key + ctr, data[4:], ctr)
        counter = struct.unpack(">I", ctr)[0]
        if counter >= self.rx_counter:
            self.rx_counter = counter + 1
        return plain
