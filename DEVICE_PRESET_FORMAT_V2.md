# ChainOSC Device Preset JSON Format v2

この文書は、`ChainOSC-device-preset`、`schemaVersion: 2`の正規出力仕様を定義します。
v2 contractの対象はEncoderです。本文とJSON例はv2当時のcontractを保持します。現行4製品の新規ExportはKey／Encoder／Joystickがv3、Angle／ToFがv1です。現在の仕様は[`DEVICE_PRESET_FORMAT_V3.md`](DEVICE_PRESET_FORMAT_V3.md)を参照してください。v2 Encoder Presetは対応する現行Importerで引き続き利用できます。

## 位置づけ

- Device Presetは、ハードウェア固有の生値ではなく、ユーザーが期待する操作の意味を表します。
- v1の意味は[`DEVICE_PRESET_FORMAT_V1.md`](DEVICE_PRESET_FORMAT_V1.md)に残し、v2として再解釈しません。
- UID、Device Name、接続ポート、Chain上の位置、Windowsのホットキーなど、インポート先固有情報は含めません。
- JSONオブジェクト内のプロパティ順序と空白は意味を持ちません。
- 機械可読な定義は[`schemas/chainosc-device-preset-v2.schema.json`](schemas/chainosc-device-preset-v2.schema.json)です。
- 正規例、異常系、Migration例は[`test-data/device-presets-v2/`](test-data/device-presets-v2/)にあります。

### schemaVersion 2のcapability追加方針

Device Preset v2では、既存fieldおよび既存のvalidなv2 Presetの意味を変更しない範囲で、同一`schemaVersion`へ新しいcapabilityを追加する場合があります。新しいcapabilityを使用するv2 Presetは、そのcapabilityに対応していない古いfirmwareで安全にImport拒否される場合があります。未知の`pushMode`やfieldを別の意味へ読み替えたり、無視してImport成功としてはなりません。

| Importer | Preset | 結果 |
| --- | --- | --- |
| Rotation Reset対応前 | 既存v2 | Import可能 |
| Rotation Reset対応後 | 既存v2 | 同じ意味でImport可能 |
| Rotation Reset対応後 | Rotation Resetを使用するv2 | Import可能 |
| Rotation Reset対応前 | Rotation Resetを使用するv2 | 安全なImport拒否を許容 |

既存fieldの意味変更、既存v2 Presetを同じ意味で読めなくする変更、または同一JSONを世代間で異なる意味へ解釈する変更には、新しい`schemaVersion`を使用します。

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
| `pushMode` | Integer | 必須 | 必須 | 0: Press / Release、1: Sequence、2: Rotation Reset |
| `resetValue` | NumberまたはString | Mode依存 | Mode依存 | Rotation Resetで送信し、Amountではruntime positionも同期する値 |
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
JSON Integerでなければならず、fractional JSON Numberを含む型違反は
`E_PRESET_FIELD_TYPE_INVALID`で拒否します。JSON Integerとして有効な型であっても、
ポータブル仕様上の有効範囲`1..65535`を外れる0、負数または65535を超える値は
`E_PRESET_DEVICE_SETTING_INVALID`で拒否します。

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

Encoder Pushは回転モードと独立し、Device Preset v1 Keyと同じPress / ReleaseおよびSequenceモデルを
使用します。

- `pushMode = 0`: `press`と`release`を使用
- `pushMode = 1`: `sequence`を使用
- `pushMode = 2`: `resetValue`を使用するRotation Reset

`press`、`release`および`sequence`は、選択中の`pushMode`にかかわらず正規出力へ含め、
Device Preset v1 Keyと同じ型、件数、値域およびSequence方向のValidationを適用します。

Device Preset v2で押し込み操作を表す正式フィールド名は`pushMode`です。`clickMode`は
Device Preset v2のフィールドではなく、v2 Importerは受理しません。

#### Rotation Reset

Rotation ResetはPress eventでのみ発火し、Release eventではOSC送信またはruntime同期を行ってはなりません。Rotation Resetは`rotationAddress`へ`resetValue`を1回送信します。`press`、`release`、`sequence`は既存モードへ戻した場合の設定を保持するため正規出力へ含めますが、Rotation Reset中のruntimeでは使用しません。

`pushMode = 2`では`resetValue`を必須とします。`pushMode = 0`または`1`の正規出力へ`resetValue`を含めません。これにより既存v2 Presetは変更せずvalidなまま維持されます。

Amount modeの`resetValue`は有限なJSON Numberです。次を満たさなければなりません。

```text
outputMin <= resetValue <= outputMax
```

両端を含み、範囲外値をclampしてはなりません。Floatは有限なOSC float32、Intは既存Amount Intと同じ`lroundf`相当の変換後にOSC int32、Stringは既存Amount Stringと同じ固定小数点・小数点以下3桁で送信します。Amount Stringでも任意文字列の`resetValue`は許可しません。

AmountではReset送信時にruntime positionも同期します。`p = (resetValue - outputMin) * rangeSteps / (outputMax - outputMin)`をbinary64で計算し、`abs(p - round(p)) <= min(0.25, 8 * 1.1920929e-7 * max(1, rangeSteps))`なら正規Grid上と判定して、対応する整数positionへ直接同期します。これ以外はGrid間の値としてruntime-onlyのpending状態に保持し、次のnon-zero Amount deltaで進行方向側のGridへ入り、残りのmulti-step deltaを失わず処理します。`clockwiseIncreases`はこの処理より前にdeltaへ適用し、その後は既存のwrapまたはclamp semanticsを適用します。pending状態はDevice Preset、LittleFSまたはbackupへ保存しません。

Direction modeではposition同期を行いません。Directionの`resetValue`は既存の`clockwiseValue`および`counterClockwiseValue`と同じ型・値域を使用します。Floatは有限なfloat32 Number、Intはint32 Integer、StringはUTF-8で128 bytes以下のStringです。

defensive validationに失敗した場合はOSCを送信せず、runtime stateも変更してはなりません。正常なResetでは、runtime stateは受信側の到達確認済み状態ではなく、ChainOSCが最後に指示した論理状態として更新します。

### Device Preset v1からのImportとMigration

Importerは入力をまずDevice Preset v1としてParse・Validationします。v1としてValidationに
失敗した入力はImport Errorとして拒否し、Legacy fallbackの対象にはしません。

v1として有効な設定は、v2へruntime semanticsを保持したまま変換できるかを判定します。

```text
valid Device Preset v1
        |
        +-- semantics-preserving v2 migration possible
        |       -> v2 model
        |
        +-- semantics-preserving v2 migration not possible
                -> Legacy model
```

Legacy modelへの取り込みはv1からv2へのMigrationではありません。v1の意味をv1のまま保持して
利用するためのImportです。Legacyとして取り込まれた設定は、明示的なv2移行操作が行われるまで
Legacy semanticsを維持します。

共通Migration test assetsでは結果を次の3種類で記録します。

| 結果 | 意味 |
| --- | --- |
| `v2-migration` | validなv1をruntime semanticsを保持したV2 modelとして取り込む |
| `legacy-import` | validなv1をLegacy modelとして取り込み、v1 runtime semanticsと設定内容を保持する |
| `import-error` | v1としてinvalidな入力を拒否する |

`legacy-import`はImport成功であり、Error Registryのエラーとして扱いません。

Migration成功またはLegacy Import成功だけを理由に永続設定を自動的に書き換えず、永続化は
通常の明示的な保存操作に従います。製品内部の永続形式は製品固有ですが、M5ChainOSCでは
Legacy設定をD1/D2系、v2設定をD3として扱います。

#### v1 Amountからv2 Amount

`sendIncrement = false`では、次を計算します。

```text
span = absoluteInputMax - absoluteInputMin
```

`span`が`1..65535`の整数であり、かつ変換後の設定がv2 Amount Validationを満たし、
v1のruntime semanticsをv2で保持できる場合に限りv2へMigrationします。変換候補は次のとおりです。

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

`absoluteInputMin`の開始オフセットはv2モデルには保持しません。非整数、0以下または65535を超える
`span`を丸めたり補正したりしてMigrationしてはなりません。また、変換後の`outputMin`、
`outputMax`および`outputType`がv2 Amount Validationを満たさない場合もMigrationしません。

v1 Wrap ONの半開区間`[absoluteInputMin, absoluteInputMax)`と、v2 Wrap ONの両端を含む
`0..rangeSteps`には端点動作の意味論差があります。このように変換によってruntime semanticsが
変化する有効なv1設定は、v2へMigrationせずLegacyとして取り込みます。

したがって、v1として有効だがv2へ意味を保持してMigrationできないこと自体を
`E_PRESET_DEVICE_SETTING_INVALID`の理由としてはなりません。`E_PRESET_DEVICE_SETTING_INVALID`は、
入力そのものがv1として不正な場合など、Error Registryに従うImport Errorに使用します。

#### v1 Incrementからv2 Direction

`sendIncrement = true`では、v1のruntime semanticsをv2 Directionで保持できる場合に限り
v2へMigrationします。1 Encoder Step相当の変換候補は次のとおりです。

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
v2 Directionでは再現できません。このようなruntime semanticsの差が生じる設定は、
1 Step相当値だけを近似的に移してv2 Migration成功とはせず、Legacyとして取り込みます。

#### v1 Encoder Push

回転設定をv2へMigrationする場合、押し込み操作の意味は変更せず、フィールド名を次のように
変換します。

```text
v1 clickMode -> v2 pushMode
v1 press     -> v2 press
v1 release   -> v2 release
v1 sequence  -> v2 sequence
```

Legacyとして取り込む場合は、`clickMode`を含むv1 Push semanticsをLegacy modelとして保持します。

#### Legacy Importと明示的なv2移行

Legacyとして取り込まれた設定は、その後の通常編集・通常保存だけでは暗黙にv2へ昇格しません。
製品がv2移行UIを提供する場合は、`v2設定へ移行する`等の明示的なユーザー操作として扱います。
ページ表示、Legacyフィールドの編集、通常保存、Import、Export、reload、rebootまたは再接続を
契機として移行を開始してはなりません。

この明示的な移行は、Device Preset v1 Import時のMigration分類とは別の処理です。Import時には
引き続き、runtime semanticsを保持できるvalidなv1だけを`v2-migration`とし、それ以外のvalidな
v1を`legacy-import`として扱います。後から明示的な移行が可能であることを理由に、Import時の
`legacy-import`を`v2-migration`へ再分類してはなりません。

##### 編集可能なV2 Migration candidate

ユーザーが明示的に移行を要求した場合、製品は編集可能なV2 Migration candidateを生成できます。
candidateは提案されたV2設定であり、永続設定でもMigration成功結果でもありません。

candidateの生成では、意味を正確に移せる値を保持し、必要に応じて決定的な候補値を提示できます。
ただし、runtime semanticsを一意に保持できないフィールドまたは挙動はユーザーによる確認または
再定義が必要であることを示さなければなりません。non-losslessなcandidateを、元のLegacy設定と
動作上同一であるかのように扱ってはなりません。

candidateの生成、表示または編集だけを理由に、次の状態を変更してはなりません。

- 永続化されたLegacy設定
- 永続model discriminator
- 現在有効なLegacy runtime設定
- 永続ストレージ
- Migration要求前から存在するruntime state

candidateは永続modelとして保存せず、原則としてvolatileな状態として扱います。validなV2
candidateが明示的に保存され、その保存と製品既定のreadback確認が成功するまで、永続modelは
Legacyのままです。

##### Save、Cancelおよび失敗時の状態遷移

明示的な移行の状態遷移は次のとおりです。

```text
LEGACY_PERSISTED
  |
  | explicit migration action
  v
V2_CANDIDATE
  |
  +-- Cancel
  |     -> LEGACY_PERSISTED
  |
  +-- ValidationまたはSave失敗
  |     -> LEGACY_PERSISTED
  |     -> candidateは修正のため表示を維持してよい
  |
  +-- 明示的なSave成功
        -> V2_PERSISTED
```

Cancel、Validation失敗、ストレージ書き込み失敗またはreadback失敗によってLegacy modelをV2へ
昇格させてはなりません。Migrationは、validなV2 candidateの明示的なSaveが成功したときだけ
完了します。失敗時は製品既定のtransactional persistence保証に従います。

##### Non-losslessな明示的移行

runtime semanticsを保持した自動変換ができないLegacy設定も、明示的な移行フローへ入ることが
できます。製品は、変換不能であることだけを理由に移行操作そのものを拒否する代わりに、編集可能な
V2 candidateを提示できます。ただし、意味が変化する箇所をユーザーが理解し、Save前に確認または
再定義できる情報を提供しなければなりません。

代表的なsemantic mismatchには次が含まれます。

- Legacy Amount WrapとV2の両端を含むWrapの端点動作
- V2に直接対応しない`absoluteInputMin` / `absoluteInputMax`の入力オフセット
- 整数`rangeSteps`へ正確に移せないfractional span
- `delta * incrementScale`へ依存するLegacy Incrementと、固定方向値を送るV2 Direction
- 丸めまたはclampにより出力結果が変化する設定

明示的な移行でも、丸め、clamp、端点意味の変更、既定値への置換などによってsemantic mismatchを
隠してはなりません。candidateの値は次の区分で扱います。

1. 意味を正確に移せる値は自動的にコピーしてよい。
2. 決定的で有用な候補値を導出できる場合は、losslessでないことを明示したうえで提示してよい。
3. 意味が一意に決まらない値は、ユーザーによる確認または再定義を求める。
4. validなV2設定の構築に情報が不足する場合は、Save前に必要な値の入力を求める。

OSC Address、互換性のあるOutput Type、Encoder Push、Press / ReleaseおよびSequenceなどは、
意味が変わらない範囲で正確に移せる値の候補です。これらの例は、すべてのLegacy設定に対して
無条件に正確な移行を保証するものではありません。

##### Migration UIとnavigation

Migration UIは通常のV2 editorを再利用できますが、永続化されたLegacy設定と未保存のV2
candidateを明確に区別し、意味が変わるフィールドには確認または編集が必要であることを示します。
元のLegacy設定はSave成功まで変更されないことをユーザーへ示すべきです。専用の複数step wizardは
必須ではありません。

Migration開始要求は、ページのrefreshや直接navigationによって意図せず再実行されてはなりません。
query parameterをMigration開始のcommandとして使用する場合は、安全なredirectまたは状態遷移に
よって処理後に消費します。Save成功後またはCancel後にはMigration専用のnavigation stateを消去し、
rebootによって未保存candidateをV2へ昇格させてはなりません。

##### 明示的移行中のExport

未保存のMigration candidateは、永続化されたDevice Preset modelではありません。通常Exportは
常に永続modelを対象とします。

```text
persisted Legacy -> Device Preset v1
persisted V2     -> Device Preset v2
```

candidateのpreviewまたはExportは別機能であり、本仕様では定義しません。

##### 明示的移行のConformance要件

明示的なLegacy-to-V2 Migrationに対応する製品は、少なくとも次を確認します。

1. Legacy設定の通常保存がLegacy modelを維持する。
2. 明示的なユーザー操作によってのみMigrationが開始する。
3. candidate生成だけではV2を永続化しない。
4. Cancel後もLegacy設定が変更されない。
5. invalidなcandidateのSaveではV2へ昇格しない。
6. validなcandidateの明示的なSave成功によってV2を永続化する。
7. non-losslessなcaseをlosslessとして表示しない。
8. 既存のV2編集および保存動作へ影響しない。

既存のv1 Migration fixturesはImport時の分類を検証する資産であり、明示的な移行が後から可能で
あることを理由に再分類しません。特に既存の`legacy-import` caseは、Device Preset v1 Import時には
引き続き`legacy-import`です。

正式公開されていない開発途中のv2フィールド、旧draftまたは内部保存形式はMigration対象に
含めません。この方針の導入だけを理由に、一時的なv2 alias、fallback fieldまたはv2-to-v2
Migration layerを追加してはなりません。

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
| `x-chainosc-pressReleaseMaxItems` | Encoder Push内の`press.length + release.length`が8以下であることをImporterが検証する |
| `x-chainosc-stepMustMoveTowardEnd` | Sequenceの`step`が0ではなく、`start`から`end`へ進む方向であることをImporterが検証する |
| `x-chainosc-amountOutputValid` | `outputMin < outputMax`、float32マッピングの有限性、およびInt出力を丸めた結果がint32範囲内であることをImporterが検証する |
| `x-chainosc-amountStringFormat` | Amount String出力を小数点以下3桁で生成し、`-0.000`を`0.000`へ正規化するruntime／Exporterの規範を示す |

`messageArray.maxItems = 8`は各配列単独の上限も表しますが、`press`と`release`を別々に
8件まで許すものではありません。Importerは`x-chainosc-pressReleaseMaxItems`に従い、
両配列の合計を必ず検証します。

JSON Schemaだけでは、これらのsemantic validation、Migration演算またはruntime出力変換を
完全には検証できません。製品のImporterはSchemaの構造検証とsemantic validationの両方を
実施し、共通fixtureおよびテストベクトルで結果を確認します。
