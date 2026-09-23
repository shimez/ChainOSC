# ChainOSC Device Presets

ChainOSCシリーズ対応製品で利用できる、デバイス単位の実用Preset例です。対応するDevice TypeのOSC設定を、製品間で共有または参考にできます。

このディレクトリはユーザー向けPresetライブラリです。Schema、validation、Importer、migration、runtimeを検証するfixtureは[`../test-data/`](../test-data/)にあり、役割が異なります。

## 対応形式と製品

収録Presetはすべて`format: ChainOSC-device-preset`です。`schemaVersion`はそのJSONが利用するcontractの世代であり、firmware versionでもDevice Typeの改版回数でもありません。v1/v2は引き続き有効な互換例です。現行4製品の新規ExportはKey／Encoder／Joystickがv3、Angle／ToFがv1です。Encoder v1 Presetは各製品の条件に従ってLegacy扱いまたは移行候補となり、一律にv2へ自動変換されるわけではありません。

| Device Type | 利用可能な製品 |
|---|---|
| Key v3（現行） | M5ChainOSC、ChainOSCmini、ChainOSCnano、ChainOSCPad |
| Key v1（互換） | M5ChainOSC、ChainOSCmini、ChainOSCnano、ChainOSCPad、ChainOSC for Windows |
| Encoder v3（現行Export）／v2（互換）／v1（Legacy互換） | M5ChainOSC、ChainOSCmini、ChainOSCnano、ChainOSCPad |
| Angle v1（現行） | M5ChainOSC、ChainOSCmini、ChainOSCnano |
| Joystick v3（現行Export）／v1（互換） | M5ChainOSC、ChainOSCmini、ChainOSCnano |
| ToF v1（現行、配布例なし） | M5ChainOSC、ChainOSCmini、ChainOSCnano |

## 使い方

1. 一覧から使用するJSONを選びます。
2. 対応する製品のWeb UIまたは設定画面を開きます。
3. 対象デバイスと同じDevice TypeのPreset Import機能を選びます。
4. JSONを読み込み、必要に応じてOSC Addressや値を調整します。

PresetにはUID、Device Name、接続ポートなどのインポート先固有情報は含まれません。Presetはデバイス単位の設定共有用であり、各製品の全体設定バックアップとは別の形式です。

## Preset一覧

### Key

- [Ping-Pong Parameter（v3・現行例）](key/key-vrchat-pingpong-parameter-v3.json) — `/avatar/parameters/ExampleLevel`を使用するアバター側のIntパラメーター名に合わせて変更してください。押すたびに`0,3,6,9,10,7,4,1,0,…`を送信します。
- [VRChat AFK Control（v1互換）](key/key-vrchat-afk-control.json)
- [VRChat Voice Control（v1互換）](key/key-vrchat-voice-control.json)
- [VRChat Camera Controls（v1互換）](key/key-vrchat-camera-controls.json)

### Encoder

- [VRChat Camera Zoom — Encoder v2 Amount mode（互換例）](encoder/encoder-vrchat-camera-zoom-v2.json)
- [VRChat Camera Zoom — Encoder v1（Legacy互換例）](encoder/encoder-vrchat-camera-zoom.json)

### Angle

- [VRChat Camera Zoom（v1・現行例）](angle/angle-vrchat-camera-zoom.json)

### Joystick

- [VRChat Move（v1互換）](joystick/joystick-vrchat-move.json)

現行v3の詳細は[`../DEVICE_PRESET_FORMAT_V3.md`](../DEVICE_PRESET_FORMAT_V3.md)、旧contractは[`../DEVICE_PRESET_FORMAT_V1.md`](../DEVICE_PRESET_FORMAT_V1.md)と[`../DEVICE_PRESET_FORMAT_V2.md`](../DEVICE_PRESET_FORMAT_V2.md)、検証資産は[`../schemas/`](../schemas/)と[`../SERIES_COMPATIBILITY_TEST.md`](../SERIES_COMPATIBILITY_TEST.md)を参照してください。
