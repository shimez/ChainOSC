# ChainOSC Device Preset JSON Format v2

この文書は、`ChainOSC-device-preset`、`schemaVersion: 2`の正規出力仕様を定義します。
現段階のv2はKeyとEncoderを対象とします。Angle、ToF、Joystickのv2仕様は未確定であり、
本書およびv2 Schemaへ先行して追加しません。

## 位置づけ

- Device Presetは、ハードウェア固有の生値ではなく、ユーザーが期待する操作の意味を表します。
- v1の意味は[`DEVICE_PRESET_FORMAT_V1.md`](DEVICE_PRESET_FORMAT_V1.md)に残し、v2として再解釈しません。
- UID、Device Name、接続ポート、Chain上の位置、Windowsのホットキーなど、インポート先固有情報は含めません。
- JSONオブジェクト内のプロパティ順序と空白は意味を持ちません。
- 機械可読な定義は[`schemas/chainosc-device-preset-v2.schema.json`](schemas/chainosc-device-preset-v2.schema.json)です。
- 正規例、異常系、Migration例は[`test-data/device-presets-v2/`](test-data/device-presets-v2/)にあります。

## 共通ルート

| 項目 | 型 | 値 |
| --- | --- | --- |
| `format` | String | `ChainOSC-device-preset` |
| `schemaVersion` | Integer | `2` |
| `deviceType` | Integer | 下表の値 |
| `deviceTypeName` | String | 下表の値 |

| デバイス | `deviceType` | `deviceTypeName` | 設定項目 |
| --- | ---: | --- | --- |
| Encoder | 1 | `Encoder` | `encoder` |
| Key | 3 | `Key` | `key` |

正規出力には、対応する設定項目以外のルート項目を追加しません。

## 共通値

OSC Address、OSC Message、Sequence、型番号、Int32、Float32およびUTF-8 byte上限は
v1と同じ意味を維持します。

| 値 | OSC型 |
| ---: | --- |
| 0 | Float（有限なOSC float32） |
| 1 | Int（OSC int32） |
| 2 | String |

- OSC Addressは`/`で始まり、UTF-8で192 bytes以下とします。
- OSC Messageの`value`はUTF-8で128 bytes以下とします。
- `press`と`release`の合計は8件以下とします。
- Sequenceの`step`は0ではなく、StartからEndへ進む方向でなければなりません。

## Key

KeyのPress / Release / Sequenceの意味はv1から変更しません。

```json
{
  "format": "ChainOSC-device-preset",
  "schemaVersion": 2,
  "deviceType": 3,
  "deviceTypeName": "Key",
  "key": {
    "mode": 0,
    "press": [{"address":"/example/key","value":"1","type":1}],
    "release": [{"address":"/example/key","value":"0","type":1}],
    "sequence": {"address":"/example/key/sequence","type":1,"start":0,"end":3,"step":1}
  }
}
```

## Encoder共通項目

Encoder設定は次の共通項目を持ちます。

| 項目 | 内容 |
| --- | --- |
| `rotationAddress` | 回転時のOSC Address |
| `rotationMode` | `amount`または`direction` |
| `outputType` | 0: Float、1: Int、2: String |
| `clickMode` | 0: Press / Release、1: Sequence |
| `press`、`release` | Encoder ClickのOSC Message配列 |
| `sequence` | Encoder ClickのSequence設定 |

選択していないモードの固有フィールドは含めません。Importerは黙って無視せず、
`E_PRESET_DEVICE_SETTING_INVALID`で拒否します。

## Rotation Amount Mode / 回転量モード

```json
{
  "rotationAddress": "/example/encoder",
  "rotationMode": "amount",
  "rangeSteps": 20,
  "wrap": true,
  "outputMin": 0.0,
  "outputMax": 1.0,
  "outputType": 0,
  "clickMode": 0,
  "press": [],
  "release": [],
  "sequence": {"address":"/example/encoder/sequence","type":1,"start":0,"end":3,"step":1}
}
```

### `rangeSteps`

`rangeSteps`はOutput MinからOutput Maxまで移動するために必要なEncoder Step数です。
JSON Integerで、ポータブル仕様上の有効範囲は`1..65535`です。

論理位置は両端を含む`0..rangeSteps`です。

```text
ratio = logicalPosition / rangeSteps
output = outputMin + ratio * (outputMax - outputMin)
```

`outputMin > outputMax`を許可します。この場合は出力方向が反転します。

### `wrap`

- `true`: `rangeSteps + 1`個の位置を循環します。`... 19 -> 20 -> 0 ...`
- `false`: `0..rangeSteps`へclampし、範囲外の隠れた位置を蓄積しません。

1回の更新で複数ステップのdeltaを受け取った場合、Amount Modeは大きさを保持して
`logicalPosition += delta`とします。

### runtime state

`logicalPosition`はPresetにもLittleFSにも保存しないvolatileなruntime stateです。

- ホスト起動、Amount Modeへの変更、Preset適用、`rangeSteps`等の意味変更: `0`へリセット
- リセット自体ではOSCを送信しない
- 同一ランタイム中に同じ12-byte UIDのChain Encoderが復帰: 位置を維持
- 異なるUID: 新しい論理Encoderとして0から開始
- ChainOSCPadの内蔵Encoder: 製品内の固定logical identityを使用

Amount Modeで`outputType = 2`の場合、結果を固定小数点・小数点以下3桁へ変換します。
末尾の0を保持し、`-0.000`は`0.000`へ正規化します。

## Rotation Direction Mode / 回転方向モード

Direction Modeはdeltaの大きさを使用せず、符号に対応する固定値を1回送信します。

```text
delta > 0 -> clockwiseValue
delta < 0 -> counterClockwiseValue
delta = 0 -> 送信なし
```

Float、Int、Stringでは値のJSON型を次のように一致させます。

```json
{"rotationMode":"direction","clockwiseValue":0.1,"counterClockwiseValue":-0.1,"outputType":0}
```

```json
{"rotationMode":"direction","clockwiseValue":1,"counterClockwiseValue":-1,"outputType":1}
```

```json
{"rotationMode":"direction","clockwiseValue":"next","counterClockwiseValue":"prev","outputType":2}
```

Stringは数値文字列に限定せず、UTF-8で128 bytes以下の任意のOSC String値を許可します。

## raw absolute counter

Chain Encoderのraw absolute counterは論理位置ではなくdelta生成用入力です。
切断、通信断、トポロジー変更などで連続性を保証できなくなった後の最初の正常値は
新しいbaselineとして保存し、そのサンプルではdeltaもOSCも生成しません。
同じUIDならAmount Modeの`logicalPosition`は維持します。

## v1からv2へのMigration

v1としてParse・Validationした後、メモリ上のv2モデルへ変換します。Migration成功だけを
理由に永続設定を書き換えず、通常の明示的な保存操作まで永続化しません。

### v1 Amount

```text
sendIncrement = false
span = absoluteInputMax - absoluteInputMin
```

`span`が`1..65535`の整数なら、`rotationMode = "amount"`、`rangeSteps = span`、
`logicalPosition = 0`へ変換します。開始オフセットは保持しません。
正の整数でない場合や65535を超える場合は補正せず、
`E_PRESET_DEVICE_SETTING_INVALID`で拒否します。

v1 Wrap ONの半開区間と、v2 Wrap ONの両端を含む区間には意味論差があります。

### v1 Increment

```text
sendIncrement = true
clockwiseValue = clamp(+incrementScale, outputMin, outputMax)
counterClockwiseValue = clamp(-incrementScale, outputMin, outputMax)
```

これはv1の1ステップ相当値です。v1の`|delta| >= 2`の出力は再現しないため、完全互換ではありません。

- Float: JSON Number
- Int: v1と同じ`lroundf`相当の整数化を行ったJSON Integer
- String: v1と同じ固定小数点・小数点以下3桁のJSON String（負のゼロは正規化）

## ValidationとImport原則

Import失敗時は、現在の設定、保存済み設定、UI状態、OSC動作を変更しません。
Error Codeの意味と検証優先順位は
[`DEVICE_PRESET_ERROR_REGISTRY_V1.md`](DEVICE_PRESET_ERROR_REGISTRY_V1.md)に従います。

JSON Schemaだけでは、UTF-8 byte数、Press／Release合計件数、Sequenceの方向、
Float32表現可能性、Migration演算を完全には検証できません。Schemaの`x-chainosc-*`注釈と
共通fixture／テストベクトルをあわせて使用します。

