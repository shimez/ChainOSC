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

## Encoder

Encoder Presetのルートは、次の4項目と`encoder`オブジェクトで構成します。

```json
{
  "format": "ChainOSC-device-preset",
  "schemaVersion": 2,
  "deviceType": 1,
  "deviceTypeName": "Encoder",
  "encoder": {}
}
```

Encoder v2の正式な回転モードは、次の2種類です。

- Rotation Amount Mode / 回転量モード: `rotationMode = "amount"`
- Rotation Direction Mode / 回転方向モード: `rotationMode = "direction"`

`encoder`オブジェクトは、選択したモードに応じて下表のフィールドだけを持ちます。

| 項目 | JSON型 | Amount | Direction | 意味 |
| --- | --- | :---: | :---: | --- |
| `rotationAddress` | String | 必須 | 必須 | 回転時に送信するOSC Address |
| `rotationMode` | String | 必須 | 必須 | `amount`または`direction` |
| `rangeSteps` | Integer | 必須 | 禁止 | 出力最小値から最大値までのEncoder Step数 |
| `wrap` | Boolean | 必須 | 禁止 | 範囲端で循環するか |
| `clockwiseIncreases` | Boolean | 必須 | 禁止 | 時計回りで論理値が増加するか |
| `outputMin` | Number | 必須 | 禁止 | 回転量出力の最小値 |
| `outputMax` | Number | 必須 | 禁止 | 回転量出力の最大値 |
| `clockwiseValue` | NumberまたはString | 禁止 | 必須 | 時計回りで送信する固定値 |
| `counterClockwiseValue` | NumberまたはString | 禁止 | 必須 | 反時計回りで送信する固定値 |
| `outputType` | Integer | 必須 | 必須 | 0: Float、1: Int、2: String |
| `pushMode` | Integer | 必須 | 必須 | 0: Press / Release、1: Sequence |
| `press` | Array | 必須 | 必須 | Encoder PushのPressメッセージ |
| `release` | Array | 必須 | 必須 | Encoder PushのReleaseメッセージ |
| `sequence` | Object | 必須 | 必須 | Encoder PushのSequence設定 |

選択していない回転モードの固有フィールドを含むPresetは、
`E_PRESET_DEVICE_SETTING_INVALID`で拒否します。未知のEncoder設定フィールドも同じく拒否し、
製品固有の既定値への置換や無視は行いません。

### Rotation Amount Mode / 回転量モード

回転量モードは、Encoder Stepを論理位置として累積し、その位置をOSC出力範囲へ
マッピングするモードです。物理Encoderの絶対位置を表すモードではありません。

正規形は次のとおりです。

```json
{
  "format": "ChainOSC-device-preset",
  "schemaVersion": 2,
  "deviceType": 1,
  "deviceTypeName": "Encoder",
  "encoder": {
    "rotationAddress": "/example/encoder/amount",
    "rotationMode": "amount",
    "rangeSteps": 20,
    "wrap": true,
    "clockwiseIncreases": true,
    "outputMin": 0.0,
    "outputMax": 1.0,
    "outputType": 0,
    "pushMode": 0,
    "press": [{"address":"/example/encoder/push","value":"1","type":1}],
    "release": [{"address":"/example/encoder/push","value":"0","type":1}],
    "sequence": {"address":"/example/encoder/sequence","type":1,"start":0,"end":3,"step":1}
  }
}
```

#### Encoder Stepと`rangeSteps`

Encoder Stepは、ハードウェア固有の入力処理が生成する論理的な回転単位です。
物理的なデテント、A/B相の状態遷移数、パルス数またはraw counterの単位との対応は
製品固有であり、Device Presetには含めません。

`rangeSteps`は`outputMin`から`outputMax`まで移動するために必要なEncoder Step数です。
JSON Integerで、ポータブル仕様上の有効範囲は`1..65535`です。0、負数、非整数または
65535を超える値は`E_PRESET_DEVICE_SETTING_INVALID`で拒否します。

論理位置`logicalPosition`は、両端を含む`0..rangeSteps`の`rangeSteps + 1`段階です。
出力はfloat32演算として次の式で求めます。

```text
ratio = logicalPosition / rangeSteps
output = outputMin + ratio * (outputMax - outputMin)
```

#### `outputMin`、`outputMax`、`outputType`

`outputMin`と`outputMax`には、有限なfloat32として表現可能なJSON Numberを指定します。
次の順序を必須とします。

```text
outputMin < outputMax
```

同値または逆順の端点は`E_PRESET_DEVICE_SETTING_INVALID`で拒否します。出力の増加方向を
反転する目的で端点を逆順にしてはならず、`clockwiseIncreases`を使用します。

`outputMax - outputMin`の差および有効な全`logicalPosition`に対する規範的な
マッピング結果は、有限なfloat32でなければなりません。これを満たさない設定は
`E_PRESET_DEVICE_SETTING_INVALID`で拒否します。

マッピング結果は`outputType`に従って次のように送信します。

| `outputType` | 送信値 |
| ---: | --- |
| 0 | マッピング結果をOSC Float（float32）として送信 |
| 1 | マッピング結果を最も近い整数へ丸め、OSC Int（int32）として送信 |
| 2 | マッピング結果を固定小数点・小数点以下3桁のOSC Stringとして送信 |

Intの丸めは`lroundf`相当とし、ちょうど中間の値は0から遠ざかる方向へ丸めます。
すべてのマッピング結果を整数化した値がint32範囲に収まらない設定は
`E_PRESET_DEVICE_SETTING_INVALID`で拒否します。

Stringは末尾の0を保持します。丸め後の負のゼロは正規化します。
小数点以下3桁への変換は最も近い`0.001`へ丸め、ちょうど中間の場合は0から遠ざかる
方向へ丸めます。丸めは有限なfloat32のマッピング結果に対して行います。

```text
0       -> "0.000"
0.5     -> "0.500"
0.2574  -> "0.257"
-0.000  -> "0.000"
```

#### `clockwiseIncreases`

- `true`: 時計回りのEncoder Stepで`logicalPosition`が増加します。
- `false`: 反時計回りのEncoder Stepで`logicalPosition`が増加します。

入力処理が生成した符号付き`delta`に対し、次の式を適用します。1回の入力で複数Stepを
表す場合も、その大きさを保持します。

```text
amountDelta = clockwiseIncreases ? delta : -delta
logicalPosition = logicalPosition + amountDelta
```

#### `wrap`

`wrap = true`では、`0..rangeSteps`の`rangeSteps + 1`位置を循環させます。

```text
0 -> 1 -> ... -> rangeSteps -> 0
0 -> rangeSteps -> ... -> 1 -> 0
```

`wrap = false`では、加算後の位置を`0..rangeSteps`へclampします。範囲外の隠れた位置を
蓄積してはなりません。端点からさらに範囲外方向へのEncoder Stepも有効な入力イベント
として扱い、位置が変化しなくても同じ端点のOSC値を再送します。

#### `logicalPosition`

`logicalPosition`はvolatileなruntime stateであり、Device Presetおよび製品の永続設定へ
保存しません。次の場合は0へリセットします。

- ホストの起動または再起動
- 回転量モードへの変更
- Device Presetの適用
- `rotationMode`、`rangeSteps`、`wrap`、`clockwiseIncreases`、`outputMin`、
  `outputMax`または`outputType`による、現在有効な回転量の意味変更

リセット自体ではOSCを送信しません。実装はリセットを次のEncoder入力まで遅延できますが、
その場合も次のStepはリセット後の位置0へ新しい設定で適用します。

選択していないDirection Mode側の内部値だけが変化しても、回転量モードの
`logicalPosition`をリセットしてはなりません。

同一ランタイム中に同じ論理Encoderが一時切断または通信断から復帰した場合は、
`logicalPosition`を維持します。Chain Encoderの同一性は12-byte UIDで判定し、接続ポート、
Chain上の位置またはランタイムDevice IDでは判定しません。異なるUIDは別のEncoderとして
0から開始します。ChainOSCPadの内蔵Encoderは製品内の固定logical identityを使用します。

### Rotation Direction Mode / 回転方向モード

回転方向モードは、検出した回転方向に対応する固定値を1回送信するモードです。
`delta`の大きさを送信回数または値の倍率に使用しません。

```text
delta > 0 -> clockwiseValueを1回送信
delta < 0 -> counterClockwiseValueを1回送信
delta = 0 -> 送信なし
```

正規形は次のとおりです。

```json
{
  "format": "ChainOSC-device-preset",
  "schemaVersion": 2,
  "deviceType": 1,
  "deviceTypeName": "Encoder",
  "encoder": {
    "rotationAddress": "/example/encoder/direction",
    "rotationMode": "direction",
    "clockwiseValue": 1,
    "counterClockwiseValue": -1,
    "outputType": 1,
    "pushMode": 0,
    "press": [],
    "release": [],
    "sequence": {"address":"/example/encoder/sequence","type":1,"start":0,"end":3,"step":1}
  }
}
```

`clockwiseValue`と`counterClockwiseValue`は対称である必要はありません。JSON型と値域は
`outputType`に一致させます。

| `outputType` | JSON型と制約 |
| ---: | --- |
| 0 | 有限なOSC float32として表現可能なNumber |
| 1 | `-2147483648..2147483647`のInteger |
| 2 | UTF-8で128 bytes以下のString |

Stringは数値文字列に限定せず、任意の有効なOSC String値を許可します。

### raw absolute counterとdelta baseline

Chain Encoderのraw absolute counterは、`logicalPosition`ではなく`delta`生成用の入力です。
切断、通信断、トポロジー変更または再初期化により連続性を保証できなくなった後の最初の
正常値は、新しいbaselineとして保存します。そのサンプルでは`delta`を生成せず、OSCも
送信しません。

同じUIDのEncoderでは、baselineの再初期化によって回転量モードの`logicalPosition`を
リセットしません。次の正常値から、新しいbaselineとの差分を使用します。

### Encoder Push / エンコーダープッシュ

Encoder Pushは回転モードと独立し、Keyと同じPress / ReleaseおよびSequenceモデルを
使用します。

- `pushMode = 0`: `press`と`release`を使用
- `pushMode = 1`: `sequence`を使用

`press`、`release`および`sequence`は、選択中の`pushMode`にかかわらず正規出力へ含め、
Keyと同じ型、件数、値域およびSequence方向のValidationを適用します。

Device Preset v2で押し込み操作を表す正式フィールド名は`pushMode`です。`clickMode`は
Device Preset v2のフィールドではなく、v2 Importerは受理しません。

### Device Preset v1からのMigration

Importerは入力をまずDevice Preset v1としてParse・Validationし、成功した設定だけを
メモリ上のv2モデルへ変換します。Migration成功だけを理由に永続設定を自動的に
書き換えず、永続化は通常の明示的な保存操作に従います。

#### v1 Amountからv2 Amount

`sendIncrement = false`では、次を計算します。

```text
span = absoluteInputMax - absoluteInputMin
```

`span`が`1..65535`の整数の場合に限り、次のように変換します。

```text
rotationMode = "amount"
rangeSteps = span
wrap = v1 wrapAround（省略時はtrue）
clockwiseIncreases = true
outputMin = v1 range.outMin
outputMax = v1 range.outMax
outputType = v1 range.type
logicalPosition = 0
```

`absoluteInputMin`の開始オフセットは保持しません。非整数、0以下または65535を超える
`span`を丸めたり補正したりせず、`E_PRESET_DEVICE_SETTING_INVALID`で拒否します。
変換後の`outputMin`、`outputMax`および`outputType`もv2の回転量Validationを満たす必要が
あります。

v1 Wrap ONの半開区間`[absoluteInputMin, absoluteInputMax)`と、v2 Wrap ONの両端を含む
`0..rangeSteps`には端点動作の意味論差があります。

#### v1 Incrementからv2 Direction

`sendIncrement = true`では、v1の1 Encoder Step相当値を次のように変換します。

```text
rotationMode = "direction"
clockwiseValue = clamp(+incrementScale, range.outMin, range.outMax)
counterClockwiseValue = clamp(-incrementScale, range.outMin, range.outMax)
outputType = v1 range.type
```

- Float: JSON Number
- Int: v1と同じ`lroundf`相当の整数化を行ったJSON Integer
- String: v1と同じ固定小数点・小数点以下3桁のJSON String。負のゼロは`0.000`へ正規化

v1が`delta * incrementScale`を使用する場合の`|delta| >= 2`の出力は、固定値を1回送る
v2 Directionでは再現しません。このMigrationはv1の1 Step相当値を移すもので、完全な
runtime動作互換ではありません。

#### v1 Encoder Push

押し込み操作の意味は変更せず、フィールド名を次のように変換します。

```text
v1 clickMode -> v2 pushMode
v1 press     -> v2 press
v1 release   -> v2 release
v1 sequence  -> v2 sequence
```

正式公開されていない開発途中のv2フィールド、旧draftまたは内部保存形式はMigration対象に
含めません。

## ValidationとImport原則

Import失敗時は、現在の設定、保存済み設定、UI状態、OSC動作を変更しません。
Error Codeの意味と検証優先順位は
[`DEVICE_PRESET_ERROR_REGISTRY_V1.md`](DEVICE_PRESET_ERROR_REGISTRY_V1.md)に従います。

標準のJSON Schema Draft 2020-12 Validationは、JSON型、必須フィールド、列挙値、
個別配列の件数および数値の基本範囲を検証します。`x-chainosc-*`は標準JSON Schemaの
検証キーワードではなく、ChainOSC Importerが追加で実施しなければならないsemantic
validation、または規範的な出力変換を示す注釈です。Importerは未知の注釈として無視して
Validationを完了してはなりません。

現在のv2 Schemaにある注釈と責務は次のとおりです。

| 注釈 | 責務 |
| --- | --- |
| `x-chainosc-maxUtf8Bytes` | JSON StringをUTF-8へ符号化したbyte数が指定上限以下であることをImporterが検証する |
| `x-chainosc-finiteFloat32` | JSON Numberが有限なfloat32へ変換でき、変換結果がNaNまたはInfinityにならないことをImporterが検証する |
| `x-chainosc-valueMustMatchType` | OSC MessageのString `value`が`type`に応じて有効なfloat32、int32またはStringであることをImporterが検証する |
| `x-chainosc-pressReleaseMaxItems` | 同じKeyまたはEncoder Push内の`press.length + release.length`が8以下であることをImporterが検証する |
| `x-chainosc-stepMustMoveTowardEnd` | Sequenceの`step`が0ではなく、`start`から`end`へ進む方向であることをImporterが検証する |
| `x-chainosc-amountOutputValid` | `outputMin < outputMax`、float32マッピングの有限性、およびInt出力を丸めた結果がint32範囲内であることをImporterが検証する |
| `x-chainosc-amountStringFormat` | Amount String出力を小数点以下3桁で生成し、`-0.000`を`0.000`へ正規化するruntime／Exporterの規範を示す |

`messageArray.maxItems = 8`は各配列単独の上限も表しますが、`press`と`release`を別々に
8件まで許すものではありません。Importerは`x-chainosc-pressReleaseMaxItems`に従い、
両配列の合計を必ず検証します。

JSON Schemaだけでは、これらのsemantic validation、Migration演算またはruntime出力変換を
完全には検証できません。製品のImporterはSchemaの構造検証とsemantic validationの両方を
実施し、共通fixtureおよびテストベクトルで結果を確認します。
