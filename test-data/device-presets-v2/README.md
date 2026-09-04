# ChainOSC Device Preset v2テストデータ

このディレクトリは、KeyおよびEncoderのDevice Preset v2共通テストデータです。

- `canonical/`: v2 Exporterの正規出力例
- `valid/`: 境界値や追加の正常系
- `invalid/`: Importerが拒否する異常系
- `expected-errors.json`: 異常系fixtureとRegistry v1 Error Codeの対応
- `migration/`: v1入力と期待するv2内部表現、または期待Error Code
- `encoder-runtime-vectors.json`: 製品非依存のEncoder演算・再接続テスト

Angle、ToF、Joystickのv2 fixtureは各仕様が確定するまで追加しません。v1 fixtureは
[`../device-presets/`](../device-presets/)に残します。

JSON Schemaによる構造検証に加え、UTF-8 byte数、Sequence、Float32、Migration、
OSC出力文字列などの意味検証を製品Importerと共通テストで実施してください。

