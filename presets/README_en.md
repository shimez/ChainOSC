# ChainOSC Device Presets

Reusable, user-facing preset examples for ChainOSC products. Presets contain device-level OSC settings that can be shared or adapted across products supporting the same Device Type.

This directory is a user preset library. Schema, validation, importer, migration, and runtime fixtures are kept separately under [`../test-data/`](../test-data/).

## Format and product support

All included presets use `format: ChainOSC-device-preset`. `schemaVersion` identifies the JSON contract, not the firmware version or the number of revisions of a Device Type. v1/v2 files remain usable compatibility examples. Current exports from the four firmware products use v3 for Key, Encoder, and Joystick, and v1 for Angle and ToF. An Encoder v1 import can stay Legacy or become a migration candidate depending on the product and settings; it is not uniformly converted to v2.

| Device Type | Supported products |
|---|---|
| Key v3 (current) | M5ChainOSC, ChainOSCmini, ChainOSCnano, ChainOSCPad |
| Key v1 (compatibility) | M5ChainOSC, ChainOSCmini, ChainOSCnano, ChainOSCPad, ChainOSC for Windows |
| Encoder v3 (current export) / v2 (compatibility) / v1 (Legacy compatibility) | M5ChainOSC, ChainOSCmini, ChainOSCnano, ChainOSCPad |
| Angle v1 (current) | M5ChainOSC, ChainOSCmini, ChainOSCnano |
| Joystick v3 (current export) / v1 (compatibility) | M5ChainOSC, ChainOSCmini, ChainOSCnano |
| ToF v1 (current; no distributed example) | M5ChainOSC, ChainOSCmini, ChainOSCnano |

## How to use

1. Choose a JSON file from the list.
2. Open the Web UI or settings screen of a supported product.
3. Use the preset import function for a device of the same Device Type.
4. Adjust OSC addresses or values as needed.

Presets do not contain a UID, Device Name, connection port, or other target-specific information. They share device settings and are separate from each product's complete settings backup.

## Presets

### Key

- [Ping-Pong Parameter (v3 current example)](key/key-vrchat-pingpong-parameter-v3.json) — replace `/avatar/parameters/ExampleLevel` with your avatar's Int parameter name. Each press sends `0,3,6,9,10,7,4,1,0,…`.
- [VRChat AFK Control (v1 compatibility)](key/key-vrchat-afk-control.json)
- [VRChat Voice Control (v1 compatibility)](key/key-vrchat-voice-control.json)
- [VRChat Camera Controls (v1 compatibility)](key/key-vrchat-camera-controls.json)

### Encoder

- [VRChat Camera Zoom — Encoder v2 Amount mode (compatibility)](encoder/encoder-vrchat-camera-zoom-v2.json)
- [VRChat Camera Zoom — Encoder v1 (Legacy compatibility)](encoder/encoder-vrchat-camera-zoom.json)

### Angle

- [VRChat Camera Zoom (v1 current)](angle/angle-vrchat-camera-zoom.json)

### Joystick

- [VRChat Move (v1 compatibility)](joystick/joystick-vrchat-move.json)

For the current contract see [`../DEVICE_PRESET_FORMAT_V3.md`](../DEVICE_PRESET_FORMAT_V3.md). Historical contracts are [`../DEVICE_PRESET_FORMAT_V1.md`](../DEVICE_PRESET_FORMAT_V1.md) and [`../DEVICE_PRESET_FORMAT_V2.md`](../DEVICE_PRESET_FORMAT_V2.md). Validation assets and compatibility tests are under [`../schemas/`](../schemas/) and [`../SERIES_COMPATIBILITY_TEST.md`](../SERIES_COMPATIBILITY_TEST.md).
