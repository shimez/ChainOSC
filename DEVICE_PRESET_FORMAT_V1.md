# ChainOSC Device Preset JSON Format v1

この文書は、ChainOSCシリーズの現行Exporterが生成する`ChainOSC-device-preset`、`schemaVersion: 1`の正規出力仕様を定義します。

## 位置づけ

- 本仕様は**現行Exporterが新規に出力するJSON**を定義します。
- Importerは、公開済みバージョンとの互換性維持のため、本仕様より緩い入力や旧`M5ChainOSC-device-preset`を受け入れる場合があります。
- Importerが受け入れることは、そのJSONがv1の正規出力であることを意味しません。
- プリセットはデバイス単体の動作設定です。UID、Device Name、組み込みデバイス識別子、Windowsのホットキーなど、インポート先固有の情報は含めません。
- JSONオブジェクト内のプロパティ順序と空白は意味を持ちません。

機械可読な構造定義は[`schemas/chainosc-device-preset-v1.schema.json`](schemas/chainosc-device-preset-v1.schema.json)、正規例は[`test-data/device-presets/canonical/`](test-data/device-presets/canonical/)にあります。

## 共通ルート

すべてのプリセットは次の4項目と、デバイス種類に対応する設定オブジェクトを持ちます。

| 項目 | 型 | 値 |
| --- | --- | --- |
| `format` | String | `ChainOSC-device-preset` |
| `schemaVersion` | Integer | `1` |
| `deviceType` | Integer | 下表の値 |
| `deviceTypeName` | String | 下表の値 |

| デバイス | `deviceType` | `deviceTypeName` | 設定項目 |
| --- | ---: | --- | --- |
| Encoder | 1 | `Encoder` | `encoder` |
| Angle | 2 | `Angle` | `angle` |
| Key | 3 | `Key` | `key` |
| Joystick | 4 | `Joystick` | `joystick` |
| ToF | 5 | `ToF` | `tof` |

正規出力には、対応する設定項目以外のルート項目を追加しません。

## 共通の値

### OSC型

| 値 | OSC型 |
| ---: | --- |
| 0 | Float |
| 1 | Int |
| 2 | String |

ToFの`range.type`はFloatまたはIntだけなので、0または1です。

### OSC Address

- JSON Stringです。
- `/`で始めます。
- UTF-8で192 bytes以下です。
- 空白、`#`、`*`、`,`、`?`、`[`、`]`、`{`、`}`を含めません。

### OSC Message

```json
{"address":"/example","value":"1","type":1}
```

- `address`: OSC Address
- `value`: UTF-8で128 bytes以下のString
- `type`: 0、1、2
- FloatとIntの`value`は、それぞれの型として変換可能な10進文字列です。

### Range

```json
{"outMin":0.0,"outMax":1.0,"type":0}
```

`outMin`と`outMax`は有限のJSON Numberです。

### Sequence

```json
{"address":"/example/sequence","type":1,"start":0,"end":3,"step":1}
```

- `address`: OSC Address
- `type`: 0、1、2
- `start`、`end`、`step`: 有限のJSON Number
- `step`は0ではありません。
- `start < end`の場合、`step > 0`です。
- `start > end`の場合、`step < 0`です。
- `start == end`の場合も`step`は0以外です。

`press`と`release`はそれぞれOSC Messageの配列です。両配列の合計は8件以下です。

## Key

`key`は次の項目をすべて持ちます。

| 項目 | 型 | 内容 |
| --- | --- | --- |
| `mode` | Integer | 0: Press / Release、1: Sequence |
| `press` | Array | 押した時のOSC Message |
| `release` | Array | 離した時のOSC Message |
| `sequence` | Object | Sequence設定 |

モードにかかわらず、Exporterは`press`、`release`、`sequence`をすべて出力します。

## Encoder

`encoder`は次の項目をすべて持ちます。

- `rotationAddress`: OSC Address
- `sendIncrement`: Boolean
- `absoluteInputMin`: Number
- `absoluteInputMax`: Number
- `incrementScale`: Number
- `range`: Range
- `clickMode`: 0または1
- `press`、`release`: Encoder ClickのOSC Message配列（合計8件以下）
- `sequence`: Encoder ClickのSequence設定

## Angle

`angle`は次の項目をすべて持ちます。

- `address`: OSC Address
- `use12bit`: Boolean
- `deadband`: 1以上のInteger
- `range`: Range

## ToF

`tof`は次の項目をすべて持ちます。

- `address`: OSC Address
- `deadband`: 1～2000のInteger
- `maxDistanceMm`: 31～2000のInteger
- `nearValueHigh`: Boolean
- `range`: Range。`type`は0または1

## Joystick

`joystick`は次の項目をすべて持ちます。

- `xAddress`、`yAddress`: OSC Address
- `deadband`: 1～254のInteger
- `invertX`、`invertY`: Boolean
- `range`: Range
- `clickMode`: 0または1
- `press`、`release`: Joystick ClickのOSC Message配列（合計8件以下）
- `sequence`: Joystick ClickのSequence設定

## JSON Schemaで完全には表現しない条件

JSON Schema Draft 2020-12の標準キーワードだけでは、次を正確に表現できません。

- UTF-8でのbyte数（`maxLength`はbyte数ではありません）
- `press`と`release`を合計した8件上限
- Sequenceの`start`、`end`、`step`間の大小関係
- OSC Messageの`type`に応じた`value`文字列の数値変換

Schemaには対応する`x-chainosc-*`注釈を付けています。製品のImporterとシリーズ共通テストでは、これらの意味検証も実施します。

## 変更方針

- v1の正規出力へ任意項目を追加する場合でも、5製品のExporter、Schema、fixture、共通テストを同時に更新します。
- 必須項目の削除、型変更、意味変更など、既存の正規v1ファイルを壊す変更は新しい`schemaVersion`で行います。
- Importerの後方互換処理は各製品の互換性方針で管理し、この正規出力仕様へ混在させません。
