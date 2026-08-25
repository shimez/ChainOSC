# ChainOSCシリーズ共通テストデータ

このディレクトリには、`SERIES_COMPATIBILITY_TEST.md`で使用する製品非依存のデバイスプリセットと不正JSONを格納します。

## 正規出力fixture

`device-presets/canonical/`には、現行Exporterが生成する`ChainOSC Device Preset JSON Format v1`のデバイス種類別fixtureがあります。

- 仕様: [`../DEVICE_PRESET_FORMAT_V1.md`](../DEVICE_PRESET_FORMAT_V1.md)
- JSON Schema: [`../schemas/chainosc-device-preset-v1.schema.json`](../schemas/chainosc-device-preset-v1.schema.json)

Exporterを変更した場合は、出力が対応するcanonical fixtureと同じ構造・型・意味を持つことを確認します。空白、数値の小数桁数、オブジェクトのプロパティ順序は比較対象外です。

## 正常系プリセット

| ファイル | 主な用途 | 対応テスト |
| --- | --- | --- |
| `device-presets/valid/key-press-release-types.json` | Int／Float／String、Press／Release、合計6件 | SERIES-KEY-01、SERIES-PRESET-KEY-01／02 |
| `device-presets/valid/key-sequence-up-int.json` | 増加Sequence | SERIES-KEY-05 |
| `device-presets/valid/key-sequence-down-float.json` | 減少Sequence | SERIES-KEY-06 |
| `device-presets/valid/key-int32-boundaries.json` | OSC int32の最小値／最大値 | SERIES-JSON-02 |
| `device-presets/valid/key-float32-finite.json` | 有限なOSC float32境界付近 | SERIES-JSON-02 |
| `device-presets/valid/encoder.json` | Encoder Absolute、クリック | SERIES-PRESET-ENC-01 |
| `device-presets/valid/angle.json` | Angle 12-bit、Deadband | SERIES-PRESET-ANGLE-01 |
| `device-presets/valid/tof.json` | ToF最大距離、方向、出力範囲 | SERIES-PRESET-TOF-01 |
| `device-presets/valid/joystick.json` | Joystick X／Y、反転、クリック | SERIES-PRESET-JOY-01 |

正常系ファイルにはUID、デバイス名、ホットキーを含めていません。各製品へ順番にインポートし、再エクスポートしたファイルを次の製品へ渡してください。

## 異常系プリセット

| ファイル | 期待する拒否理由 | 対応テスト |
| --- | --- | --- |
| `device-presets/invalid/empty.json` | 空ファイル | SERIES-JSON-01 |
| `device-presets/invalid/malformed.json` | JSON構文エラー | SERIES-JSON-01 |
| `device-presets/invalid/wrong-format.json` | 異なるformat | SERIES-JSON-01 |
| `device-presets/invalid/unsupported-schema.json` | 未対応schemaVersion | SERIES-JSON-01 |
| `device-presets/invalid/key-address-without-slash.json` | OSC Addressが`/`で始まらない | SERIES-JSON-02 |
| `device-presets/invalid/key-address-too-long.json` | OSC Addressが192 bytesを超える | SERIES-JSON-02 |
| `device-presets/invalid/key-value-too-long.json` | Valueが128 bytesを超える | SERIES-JSON-02 |
| `device-presets/invalid/key-invalid-int.json` | Intとして不正なValue | SERIES-JSON-02 |
| `device-presets/invalid/key-int32-underflow.json` | OSC int32の下限未満 | SERIES-JSON-02 |
| `device-presets/invalid/key-int32-overflow.json` | OSC int32の上限超過 | SERIES-JSON-02 |
| `device-presets/invalid/key-float32-nan.json` | FloatのNaN | SERIES-JSON-02 |
| `device-presets/invalid/key-float32-infinity.json` | FloatのInfinity | SERIES-JSON-02 |
| `device-presets/invalid/key-float32-overflow.json` | float32変換時にInfinityとなる値 | SERIES-JSON-02 |
| `device-presets/invalid/key-nine-messages.json` | Press／Release合計9件 | SERIES-JSON-02 |
| `device-presets/invalid/key-sequence-zero-step.json` | Sequence Stepが0 | SERIES-JSON-02 |
| `device-presets/invalid/key-sequence-wrong-direction.json` | Sequenceの方向とStepが不整合 | SERIES-JSON-02 |

異常系ファイルを読み込む前に既存設定をエクスポートし、拒否後に画面表示、保存済み設定、OSC送信内容が変化していないことを確認します。

## 製品固有の容量テストデータ

全体設定JSONは製品名、組み込みデバイス、保存形式が異なるため共通化しません。

- ChainOSCmini: `test-data/json-import/`と`scripts/generate_json_stress_samples.py`
- ChainOSCnano: `test-data/storage-limit/`と`scripts/generate_storage_limit_samples.py`
- M5ChainOSC: 実機からエクスポートした全体設定と、公開済み旧バージョンのバックアップを使用

境界値や保存形式を変更した場合は、対象製品側の生成スクリプトとテストデータを更新してください。
