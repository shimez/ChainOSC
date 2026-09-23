# ChainOSCシリーズ共通テストデータ

このディレクトリには、`SERIES_COMPATIBILITY_TEST.md`で使用する製品非依存のデバイスプリセットと不正JSONを格納します。

## 正規出力fixture

`device-presets/canonical/`には、v1 contractのデバイス種類別fixtureがあります。現行ExporterではAngle／ToFがv1、Key／Encoder／Joystickがv3です。

- 仕様: [`../DEVICE_PRESET_FORMAT_V1.md`](../DEVICE_PRESET_FORMAT_V1.md)
- JSON Schema: [`../schemas/chainosc-device-preset-v1.schema.json`](../schemas/chainosc-device-preset-v1.schema.json)

Exporterを変更した場合は、出力が対応する**schema世代**のfixtureと同じ構造・型・意味を持つことを確認します。空白、数値の小数桁数、オブジェクトのプロパティ順序は比較対象外です。

## Device Preset v2開発データ

`device-presets-v2/`には、Encoder v2仕様に対するSchema fixture、v1 Migration例、
Encoder共通ランタイムテストベクトルがあります。旧Key v1のcanonical fixtureと
runtime vectorは`device-presets/`にあります。

- 仕様: [`../DEVICE_PRESET_FORMAT_V2.md`](../DEVICE_PRESET_FORMAT_V2.md)
- JSON Schema: [`../schemas/chainosc-device-preset-v2.schema.json`](../schemas/chainosc-device-preset-v2.schema.json)
- テストデータ: [`device-presets-v2/README.md`](device-presets-v2/README.md)

v2 fixtureはEncoder v2 contractの回帰基準です。現行ExporterのKey／Encoder／Joystickは次のv3 fixtureで確認します。

## Device Preset v3（現行Sequence-capable Export）

`device-presets-v3/`にKey、Encoder Legacy/v2、JoystickのLoop/Ping-Pong、旧mode欠落の互換例、不正値、および送信列を収録します。既存v1/v2 fixtureは旧schema互換の検証用に保持します。

- 仕様: [`../DEVICE_PRESET_FORMAT_V3.md`](../DEVICE_PRESET_FORMAT_V3.md)
- JSON Schema: [`../schemas/chainosc-device-preset-v3.schema.json`](../schemas/chainosc-device-preset-v3.schema.json)
- テストデータ: [`device-presets-v3/README.md`](device-presets-v3/README.md)
- 検証: `node scripts/validate_device_preset_v3_fixtures.mjs`

## 正常系プリセット

| ファイル | 主な用途 | 対応テスト |
| --- | --- | --- |
| `device-presets/valid/key-press-release-types.json` | Int／Float／String、Press／Release、合計6件 | SERIES-KEY-01、SERIES-PRESET-KEY-01／02 |
| `device-presets/valid/key-sequence-up-int.json` | 増加Sequence | SERIES-KEY-05 |
| `device-presets/valid/key-sequence-down-float.json` | 減少Sequence | SERIES-KEY-06 |
| `device-presets/valid/key-press-release-total-eight.json` | Press／Release合計8件の上限 | SERIES-JSON-02 |
| `device-presets/valid/key-sequence-start-equals-end.json` | StartとEndが同値のSequence | SERIES-KEY-05／06 |
| `device-presets/valid/key-sequence-unreachable-end.json` | Endへ到達しないSequence | SERIES-KEY-05 |
| `device-presets/valid/key-int32-boundaries.json` | OSC int32の最小値／最大値 | SERIES-JSON-02 |
| `device-presets/valid/key-float32-finite.json` | 有限なOSC float32境界付近 | SERIES-JSON-02 |
| `device-presets/valid/encoder.json` | Encoder Absolute、クリック | SERIES-PRESET-ENC-01 |
| `device-presets/valid/angle.json` | Angle 12-bit、Deadband | SERIES-PRESET-ANGLE-01 |
| `device-presets/valid/tof.json` | ToF最大距離、方向、出力範囲 | SERIES-PRESET-TOF-01 |
| `device-presets/valid/joystick.json` | Joystick X／Y、反転、クリック | SERIES-PRESET-JOY-01 |

正常系ファイルにはUID、デバイス名、ホットキーを含めていません。これらはv1旧互換試験の入力例です。現行Exporterからの再エクスポートはDevice Typeによってv3へ変わるため、旧fixtureとのschema番号の一致を要求せず、設定の意味を比較してください。

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

## Key v1 runtime vectors

`device-presets/key-runtime-vectors.json`は、Key v1の製品非依存なhistorical contractを検証します。Press／Releaseの順序と重複保持、SequenceのStart-first、到達可能なEnd、到達不能なEnd、`start == end`、cold start、invalid Import atomicity、および検出可能な送信失敗時の位置保持を対象とします。

Intの丸め、Stringの数値整形、WebUI Save／成功Import／browser reload／reconnect時のreset、内部epsilon、およびPress／Release途中失敗後の継続可否は製品差があるため、この共通vectorでは固定しません。
