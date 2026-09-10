# ChainOSC

ChainOSCは、M5Stack ChainデバイスやXIAOを利用したパッド型ハードウェア、WindowsのグローバルホットキーからOSC（Open Sound Control）メッセージを送信するシリーズです。ハードウェアやアプリが異なっても、ブラウザーまたは設定画面からOSCメッセージとその送信先を共通の考え方で設定し、VRChatなどOSCを受信できるアプリケーションで利用できます。

このプロジェクトのソフトウェア、Webサイト、ドキュメントは、OpenAI Codexとの協働により制作されています。

## ChainOSC Series

### M5ChainOSC

AtomS3RとM5Stack Chainデバイスを使用する、画面付きのハードウェア版です。Key、Encoder、Angle、ToF、Joystickに対応し、ブラウザーから設定できます。

- [Product portal](https://shimez.github.io/M5ChainOSC/)
- [GitHub repository](https://github.com/shimez/M5ChainOSC)

### ChainOSCmini

M5Stack Chain DualKeyを使用する小型ハードウェア版です。本体の2つのキーと、左右に接続したChainデバイスを扱えます。Key、Encoder、Angle、ToF、Joystickに対応します。

- [Product portal](https://shimez.github.io/ChainOSCmini/)
- [GitHub repository](https://github.com/shimez/ChainOSCmini)

### ChainOSCnano

M5NanoC6を使用する小型ハードウェア版です。本体ボタンと接続したChainデバイスを扱い、Key、Encoder、Angle、ToF、Joystickに対応します。

- [Product portal](https://shimez.github.io/ChainOSCnano/)
- [GitHub repository](https://github.com/shimez/ChainOSCnano)

### ChainOSCPad

XIAO ESP32シリーズと12キーのマトリクス、Encoderを組み合わせたパッド型ハードウェア版です。KeyとEncoderをブラウザーから設定できます。

- [Product portal](https://shimez.github.io/ChainOSCPad/)
- [GitHub repository](https://github.com/shimez/ChainOSCPad)

### ChainOSC for Windows

追加のハードウェアを必要とせず、Windowsの設定可能なグローバルホットキーからOSCメッセージを送信するアプリケーションです。Key設定と互換性のあるDevice Presetを扱えます。

- [Product portal](https://shimez.github.io/ChainOSC-for-Windows/)
- [GitHub repository](https://github.com/shimez/ChainOSC-for-Windows)

## Shared Features

製品ごとに対応する入力は異なりますが、シリーズでは次の考え方を共有しています。

- OSC送信先と入力動作を設定できる
- KeyのPress / ReleaseおよびSequenceによるOSC送信
- OSCのFloat、Int、String値（対応する入力・製品の範囲内）
- Device Preset JSONによるデバイス単位の設定のエクスポート／インポート
- Key用のDevice Preset v1を、M5ChainOSC、ChainOSCmini、ChainOSCnano、ChainOSCPad、ChainOSC for Windowsの5製品で共有
- Encoder用のDevice Preset v1を、M5ChainOSC、ChainOSCmini、ChainOSCnano、ChainOSCPadの4製品で共有
- Angle、ToF、Joystick用のDevice Preset v1を、M5ChainOSC、ChainOSCmini、ChainOSCnanoの3製品で共有

## Compatibility and Specifications

ChainOSCシリーズでは、製品間で設定を共有するためのDevice Preset形式や、互換性を保つための共通仕様・テスト資産を管理しています。以下は主に開発者向けの技術資料です。

### Device Preset v1

Device Preset v1は、Key、Encoder、Angle、ToF、Joystickのデバイス設定に使用されている形式です。対応するDevice Typeと製品の間で、設定をエクスポート／インポートできます。

KeyではDevice Preset v1がmaintained canonical formatです。Encoderではv1も使用されていますが、Device Preset v2が定義されており、現在のnormative targetはv2です。

詳細は[`DEVICE_PRESET_FORMAT_V1.md`](DEVICE_PRESET_FORMAT_V1.md)を参照してください。

### Device Preset v2

現在のDevice Preset v2のnormative targetはEncoderです。EncoderのAmount、Direction、Push設定と、v1からの移行方針を[`DEVICE_PRESET_FORMAT_V2.md`](DEVICE_PRESET_FORMAT_V2.md)で定義しています。

schemaVersionはデバイス種類ごとのformat contractを表します。シリーズ全体で同じ世代番号として扱うものではなく、すべてのデバイス種類が同時に同じschemaVersionへ移行する必要はありません。Angle、ToF、Joystickのv2仕様は現時点で未確定です。

### Import Error Registry

Device Preset Importerの共通Error Code、日英メッセージ、Context、検証優先順位は[`DEVICE_PRESET_ERROR_REGISTRY_V1.md`](DEVICE_PRESET_ERROR_REGISTRY_V1.md)で定義しています。

### JSON Schema and test assets

機械可読なJSON Schema、valid／invalid fixture、migration fixture、期待Error Code、runtime test vectorは、次のディレクトリで管理しています。

- [`schemas/`](schemas/)
- [`test-data/`](test-data/)

fixtureの検証スクリプトは[`scripts/validate_device_preset_v2_fixtures.mjs`](scripts/validate_device_preset_v2_fixtures.mjs)です。

### Series Compatibility Test

シリーズ共通の回帰試験、Device Preset互換性、保存容量、Wi-Fi復旧などの試験項目は[`SERIES_COMPATIBILITY_TEST.md`](SERIES_COMPATIBILITY_TEST.md)を参照してください。GPIO、画面、Chainポート、LED、タスクトレイなど製品固有の試験は各製品リポジトリの文書を使用します。

### WebUI Design Guidelines

WebUIの共通方針と、現在固定されているKey／Encoder UIの基準は[`ChainOSC_WEBUI_DESIGN_GUIDELINES_V1.md`](ChainOSC_WEBUI_DESIGN_GUIDELINES_V1.md)で管理しています。

状態は **Draft — Key / Encoder Fixed** です。Angle、ToF、Joystickの具体的なDevice UIは、このガイドラインで先行して定義していません。

## Series Portal

- [ChainOSC Series Portal](https://shimez.github.io/ChainOSC/)
- [ChainOSC Series Portal · English](https://shimez.github.io/ChainOSC/en/)
- [ChainOSCシリーズ紹介記事（note）](https://note.com/ctake_shimez/n/n826ad2d35229)

## Development

ChainOSCの共通仕様、fixture、テスト資産、各製品の実装とドキュメントは、仕様のSource of Truthを確認しながら段階的に整備しています。開発時は、共通仕様と製品固有仕様を区別し、historical documentsは当時の記録として保持して、現行仕様とは分けて扱います。

## Unofficial Projects and License

ChainOSCは個人が開発する非公式プロジェクトです。M5Stack Technology Co., Ltd.、VRChat Inc.またはその他の第三者との提携・承認を示すものではありません。

このポータルおよび共通ドキュメントは[MIT License](LICENSE)で提供します。各製品のソースコード、ファームウェア、アプリケーション、第三者ライセンスについては、それぞれのリポジトリにあるライセンス表記を確認してください。
