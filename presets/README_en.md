# ChainOSC Device Presets

Reusable, user-facing preset examples for ChainOSC products. Presets contain device-level OSC settings that can be shared or adapted across products supporting the same Device Type.

This directory is a user preset library. Schema, validation, importer, migration, and runtime fixtures are kept separately under [`../test-data/device-presets/`](../test-data/device-presets/).

## Format and product support

All included presets use `format: ChainOSC-device-preset` and `schemaVersion: 1`. The Encoder preset is also a v1 preset; it is not automatically converted to Encoder v2.

| Device Type | Supported products |
|---|---|
| Key v1 | M5ChainOSC, ChainOSCmini, ChainOSCnano, ChainOSCPad, ChainOSC for Windows |
| Encoder v1 | M5ChainOSC, ChainOSCmini, ChainOSCnano, ChainOSCPad |
| Angle v1 | M5ChainOSC, ChainOSCmini, ChainOSCnano |
| Joystick v1 | M5ChainOSC, ChainOSCmini, ChainOSCnano |

## How to use

1. Choose a JSON file from the list.
2. Open the Web UI or settings screen of a supported product.
3. Use the preset import function for a device of the same Device Type.
4. Adjust OSC addresses or values as needed.

Presets do not contain a UID, Device Name, connection port, or other target-specific information. They share device settings and are separate from each product's complete settings backup.

## Presets

### Key

- [VRChat AFK Control](key/key-vrchat-afk-control.json)
- [VRChat Voice Control](key/key-vrchat-voice-control.json)
- [VRChat Camera Controls](key/key-vrchat-camera-controls.json)

### Encoder

- [VRChat Camera Zoom](encoder/encoder-vrchat-camera-zoom.json)

### Angle

- [VRChat Camera Zoom](angle/angle-vrchat-camera-zoom.json)

### Joystick

- [VRChat Move](joystick/joystick-vrchat-move.json)

For detailed format and compatibility rules, see [`../DEVICE_PRESET_FORMAT_V1.md`](../DEVICE_PRESET_FORMAT_V1.md), [`../DEVICE_PRESET_FORMAT_V2.md`](../DEVICE_PRESET_FORMAT_V2.md), [`../schemas/`](../schemas/), and [`../SERIES_COMPATIBILITY_TEST.md`](../SERIES_COMPATIBILITY_TEST.md).
