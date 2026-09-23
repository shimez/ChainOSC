# Device Preset v3 fixtures

`valid/`にはKey、Encoder Legacy、Encoder v2 Amount/Direction、JoystickのLoop/Ping-Pongと、`progressionMode`が欠落した旧入力互換例を配置します。現行正規Exportではmodeは常に存在します。`invalid/`はv3正規Schemaに不適合な例です。`expected-errors.json`は既存Error Registryに基づくImporter期待code、または`schema-only`（firmwareの拒否を保証しない例）を記録します。Schema検証はHTTP実機Error Codeの自動検証ではありません。`runtime-vectors.json`はSequence送信順を記録します。

`compat/key-mode-decimal-notation.json`は字句上の`1.0`を保持する特殊例です。標準JSON SchemaとJavaScriptの`JSON.parse`は数値1.0と1を区別せず、`integer`型として受理する場合があります。一方、firmwareのArduinoJson `is<int>()`はパース時の数値型に依存します。`compat/angle-schema-three-noncanonical.json`はv3 JSON Schema上は非正規ですが、一部製品のImporterはv3を先に受理してからAngle形状を解析し得ます。いずれも全製品で拒否されるinvalid fixtureと混同せず、製品別Importer確認が必要な例として別管理します。

検証: `node scripts/validate_device_preset_v3_fixtures.mjs`。既存v1/v2資産の回帰検証: `node scripts/validate_device_preset_v2_fixtures.mjs`。
