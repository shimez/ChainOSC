# ChainOSC Device Presets

ChainOSCシリーズ対応製品で利用できる、デバイス単位の実用Preset例です。対応するDevice TypeのOSC設定を、製品間で共有または参考にできます。

このディレクトリはユーザー向けPresetライブラリです。Schema、validation、Importer、migration、runtimeを検証するfixtureは[`../test-data/device-presets/`](../test-data/device-presets/)にあり、役割が異なります。

## 対応形式と製品

収録Presetはすべて`format: ChainOSC-device-preset`、`schemaVersion: 1`です。Encoderの収録Presetもv1形式であり、Encoder v2へ自動変換されません。

| Device Type | 利用可能な製品 |
|---|---|
| Key v1 | M5ChainOSC、ChainOSCmini、ChainOSCnano、ChainOSCPad、ChainOSC for Windows |
| Encoder v1 | M5ChainOSC、ChainOSCmini、ChainOSCnano、ChainOSCPad |
| Angle v1 | M5ChainOSC、ChainOSCmini、ChainOSCnano |
| Joystick v1 | M5ChainOSC、ChainOSCmini、ChainOSCnano |

## 使い方

1. 一覧から使用するJSONを選びます。
2. 対応する製品のWeb UIまたは設定画面を開きます。
3. 対象デバイスと同じDevice TypeのPreset Import機能を選びます。
4. JSONを読み込み、必要に応じてOSC Addressや値を調整します。

PresetにはUID、Device Name、接続ポートなどのインポート先固有情報は含まれません。Presetはデバイス単位の設定共有用であり、各製品の全体設定バックアップとは別の形式です。

## Preset一覧

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

Device Presetの詳細な仕様は、[`../DEVICE_PRESET_FORMAT_V1.md`](../DEVICE_PRESET_FORMAT_V1.md)、[`../DEVICE_PRESET_FORMAT_V2.md`](../DEVICE_PRESET_FORMAT_V2.md)、[`../schemas/`](../schemas/)および[`../SERIES_COMPATIBILITY_TEST.md`](../SERIES_COMPATIBILITY_TEST.md)を参照してください。
