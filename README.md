# ChainOSC

このプロジェクトのソフトウェア、Webサイト、ドキュメントは、OpenAI Codexとの協働により制作されています。

This project's software, website, and documentation are created in collaboration with OpenAI Codex.

## Device Preset JSON

ChainOSCシリーズ共通の現行Exporter正規出力は、[`ChainOSC Device Preset JSON Format v1`](DEVICE_PRESET_FORMAT_V1.md)として文書化しています。開発中のKey／Encoder v2仕様は[`ChainOSC Device Preset JSON Format v2`](DEVICE_PRESET_FORMAT_V2.md)で定義し、製品実装が完了するまでは現行Exporter仕様と区別します。Importerのエラー意味と表示内容は、[`ChainOSC Device Preset Import Error Registry v1`](DEVICE_PRESET_ERROR_REGISTRY_V1.md)で定義します。機械可読なJSON Schema、fixture、期待Error Codeも同じリポジトリで管理します。

ChainOSC is a family of open-source OSC controllers for M5Stack Chain devices
and Windows global hotkeys.

ChainOSCシリーズでは、操作するハードウェアやアプリが変わっても、共通した設定方法でOSCメッセージを送信できます。

## Series portal

- [ChainOSC Series Portal](https://shimez.github.io/ChainOSC/)
- [ChainOSC Series Portal · English](https://shimez.github.io/ChainOSC/en/)
- [ChainOSCシリーズ紹介記事（note）](https://note.com/ctake_shimez/n/n826ad2d35229)

## Products

### M5ChainOSC

The standard hardware version for AtomS3R and M5Stack Chain devices. It provides
an on-device display, browser-based configuration, and support for Key,
Encoder, Angle, ToF, and Joystick devices.

- [Product portal](https://shimez.github.io/M5ChainOSC/)
- [GitHub repository](https://github.com/shimez/M5ChainOSC)

### ChainOSCmini

A compact hardware version running on M5Stack Chain DualKey. It uses the two
built-in keys and supports Chain devices connected to both sides.

- [Product portal](https://shimez.github.io/ChainOSCmini/)
- [GitHub repository](https://github.com/shimez/ChainOSCmini)

### ChainOSC for Windows

A portable Windows application that sends OSC from configurable global
hotkeys. No additional hardware is required.

- [Product portal](https://shimez.github.io/ChainOSC-for-Windows/)
- [GitHub repository](https://github.com/shimez/ChainOSC-for-Windows)

## Shared features

- Send multiple OSC messages from a single Key operation
- Press / Release and Sequence modes
- Share compatible Key presets across M5ChainOSC, ChainOSCmini, and ChainOSC for Windows
- Export and import JSON settings

Shared presets are available from [M5ChainOSC Device Presets](https://github.com/shimez/M5ChainOSC/tree/main/presets).

## Unofficial projects

The ChainOSC projects are independently developed, unofficial projects. They
are not official products of M5Stack Technology Co., Ltd., VRChat Inc., or
their affiliates, and do not indicate affiliation or endorsement.

## License

This portal is licensed under the [MIT License](LICENSE). Each ChainOSC product
is distributed under the license and third-party notices found in its own
repository.
