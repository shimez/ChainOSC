# ChainOSC Device Preset Import Error Registry v1

この文書は、ChainOSCシリーズのDevice Preset Importerが返すエラーの意味、識別子、日本語・英語メッセージを定義します。

対象製品:

- M5ChainOSC
- ChainOSCmini
- ChainOSCnano
- ChainOSCPad
- ChainOSC for Windows

対象は`ChainOSC-device-preset`形式のインポートです。各製品固有の全体設定JSON、Wi-Fi、Chain通信、OSC送信、通常の設定保存に関するエラーはv1の対象外です。

## 位置づけ

- Error Codeは言語や製品に依存しない安定した識別子です。
- Error Codeは「何が不正か」を表し、Contextは「どこが不正か」を表します。
- Importerは検証に失敗したプリセットを拒否し、画面上の設定、保存済み設定、OSC送信内容を変更してはいけません。
- このRegistryはシリーズ共通の準拠目標です。Registry作成時点の各製品が、すべてのError Codeを表示または返却することを意味しません。
- 日本語と英語は同じ条件と修正方法を伝えます。画面サイズに応じた改行やタイトル・詳細の分割は許容します。
- 各製品は共通カタログJSONをファームウェアへ内蔵する必要はありません。必要なコードとメッセージだけを実装できます。

## Error Codeの互換性

- 公開済みError Codeの意味は変更しません。
- メッセージは、同じ意味と修正条件を保つ範囲で改善できます。
- 新しい原因を区別する必要がある場合は、新しいError Codeを追加します。
- 廃止したError Codeを別の意味で再利用しません。
- 複数の検証に失敗する場合、Importerは「共通の検証優先順位」で最初に検出したError Codeを返せます。

## 構造エラーの分類方針

### 識別ヘッダーは専用Error Codeを優先

`format`、`schemaVersion`、`deviceType`は、JSONの種類と互換性を判定する識別ヘッダーです。利用者へ同じ確認・修正を案内するため、項目の欠落、JSON型の不一致、未対応値を次の専用Error Codeへまとめます。

| 識別ヘッダーの状態 | Error Code |
| --- | --- |
| `format`がない、Stringではない、または値が未対応 | `E_PRESET_FORMAT_INVALID` |
| `schemaVersion`がない、Integerではない、または値が未対応 | `E_PRESET_SCHEMA_UNSUPPORTED` |
| `deviceType`がない、Integerではない、または値が未対応 | `E_PRESET_DEVICE_TYPE_UNSUPPORTED` |
| 対応する`deviceType`だがインポート先と不一致 | `E_PRESET_DEVICE_TYPE_MISMATCH` |

識別ヘッダーに対しては、`E_PRESET_REQUIRED_FIELD_MISSING`および`E_PRESET_FIELD_TYPE_INVALID`より上記の専用Error Codeを優先します。例えば、`schemaVersion`がStringの場合は`E_PRESET_FIELD_TYPE_INVALID`ではなく`E_PRESET_SCHEMA_UNSUPPORTED`です。

### デバイス設定ではgeneric structural errorを使用

識別ヘッダーの検証を通過した後、`key`、`encoder`、`press`、`sequence`などのデバイス設定を検証します。

- 必須のObject、Array、Fieldがない場合は`E_PRESET_REQUIRED_FIELD_MISSING`です。
- Fieldは存在するがJSON型が仕様と異なる場合は`E_PRESET_FIELD_TYPE_INVALID`です。
- Sequenceの必須項目がない場合は、より具体的な`E_SEQUENCE_REQUIRED_FIELD_MISSING`を優先します。
- OSC、Sequence、デバイス固有値に専用Error Codeがある場合は、その専用Error Codeを優先します。

## 共通の検証優先順位

同じJSONに複数の不正がある場合でも、各製品が同じError Codeを返せるよう、次の順序で検証します。

1. ファイルが0バイトまたは本文が空か
2. ファイルサイズが上限以内か
3. JSON構文を解析できるか
4. ルートがJSON Objectであり、`format`が正しいか
5. `schemaVersion`に対応しているか
6. `deviceType`が対応するデバイス種類か
7. `deviceType`が選択したインポート先と一致するか
8. デバイス設定の必須項目とJSON型が正しいか
9. OSC Messageが正しいか
10. Sequenceが正しいか
11. デバイス固有の値と範囲が正しいか
12. 検証済み設定をストレージへ適用できるか

同じ段階に複数の不正がある場合は、JSON上または実装上の安定した順序で最初に検出したError Codeを返せます。fixtureの期待値は、ファイル名から推測せず[`expected-errors.json`](test-data/device-presets/expected-errors.json)で明示します。

## HTTP statusの位置づけ

- HTTP statusは、HTTP経由でImporterを実装する製品に対する推奨マッピングです。
- HTTP statusはError Codeの識別子や意味には含まれません。
- HTTPを使用しないChainOSC for Windowsなどの製品へ適用する必要はありません。
- 製品のAPI制約により別のstatusを使用しても、同じ拒否条件、設定不変性、Error Codeを満たせばRegistryへ準拠できます。

## 表示形式

推奨表示:

```text
プリセットをインポートできませんでした。
OSC Addressは「/」から始め、192バイト以内で指定してください。

Error: E_OSC_ADDRESS_INVALID
Context: Key / Press / Message 2 / address
```

一般利用者向け画面でError CodeやContextを常時表示することは必須ではありません。ただし、詳細表示、ログ、Issue報告のいずれかでError Codeを確認できることを推奨します。

タイトルの推奨値:

| 言語 | タイトル |
| --- | --- |
| 日本語 | プリセットをインポートできませんでした。 |
| English | The preset could not be imported. |

## Context

利用可能な情報だけを付加します。値そのもの、特に長大な文字列や機密情報をそのまま表示する必要はありません。

| Context field | 意味 | 例 |
| --- | --- | --- |
| `deviceType` | 対象デバイス種類 | `Key`、`Encoder` |
| `section` | 設定領域 | `press`、`release`、`sequence`、`range` |
| `messageIndex` | 1始まりのOSC Message番号 | `2` |
| `field` | 不正なJSON項目 | `address`、`value`、`step` |
| `expectedDeviceType` | インポート先が要求する種類 | `Key` |
| `actualDeviceType` | JSONに記録された種類 | `Encoder` |
| `limit` | 適用された上限 | `192 bytes`、`8 messages` |

## Registry

### ファイルとJSON構造

#### E_PRESET_FILE_EMPTY

- Condition: 選択されたプリセットファイルが0バイト、または本文が空です。
- Import result: Reject
- HTTP status: `400`（HTTP経由の場合）
- Japanese: プリセットファイルが空です。内容を含むDevice Preset JSONファイルを選択してください。
- English: The preset file is empty. Select a Device Preset JSON file that contains data.
- Action: 正しいプリセットファイルを選び直します。

#### E_PRESET_FILE_TOO_LARGE

- Condition: プリセットファイルが16 KiBを超えています。
- Import result: Reject
- HTTP status: `413`（HTTP経由の場合）
- Japanese: プリセットファイルが16 KiBを超えています。16 KiB以内のDevice Preset JSONファイルを選択してください。
- English: The preset file exceeds 16 KiB. Select a Device Preset JSON file no larger than 16 KiB.
- Context: `limit`
- Action: ファイルの種類と内容を確認します。

#### E_PRESET_JSON_MALFORMED

- Condition: JSON構文を解析できません。
- Import result: Reject
- HTTP status: `400`（HTTP経由の場合）
- Japanese: JSONの構文が正しくありません。括弧、引用符、カンマなどを確認してください。
- English: The JSON syntax is invalid. Check brackets, quotation marks, commas, and other JSON syntax.
- Action: JSONとして解析できるようにファイルを修正します。解析器の詳細は補足情報として追加できます。

#### E_PRESET_FORMAT_INVALID

- Condition: ルートがJSON Objectではない、`format`がない、または対応するDevice Preset形式ではありません。
- Import result: Reject
- HTTP status: `400`（HTTP経由の場合）
- Japanese: 対応するChainOSC Device Presetではありません。`format`が`ChainOSC-device-preset`であることを確認してください。
- English: This is not a supported ChainOSC Device Preset. Confirm that `format` is `ChainOSC-device-preset`.
- Context: `field`
- Action: 全体設定JSONではなく、デバイス単位でエクスポートしたプリセットを選択します。

#### E_PRESET_SCHEMA_UNSUPPORTED

- Condition: `schemaVersion`がない、Integerではない、またはImporterが対応していません。
- Import result: Reject
- HTTP status: `400`（HTTP経由の場合）
- Japanese: プリセットの`schemaVersion`がないか、対応していません。対応するバージョンの製品からエクスポートしたプリセットを使用してください。
- English: The preset `schemaVersion` is missing or unsupported. Use a preset exported by a compatible product version.
- Context: `field`
- Action: 対応する製品バージョンとプリセットのSchema Versionを確認します。

#### E_PRESET_DEVICE_TYPE_UNSUPPORTED

- Condition: `deviceType`がない、Integerではない、またはChainOSCシリーズが対応していないデバイス種類です。
- Import result: Reject
- HTTP status: `400`（HTTP経由の場合）
- Japanese: プリセットのデバイス種類がないか、対応していません。対応するChainOSCデバイスのプリセットを使用してください。
- English: The preset device type is missing or unsupported. Use a preset for a supported ChainOSC device.
- Context: `actualDeviceType`、`field`
- Action: 正規Exporterから、対象製品が対応するデバイスのプリセットを再エクスポートします。

#### E_PRESET_DEVICE_TYPE_MISMATCH

- Condition: `deviceType`は対応するデバイス種類ですが、選択したインポート先のデバイス種類と一致しません。
- Import result: Reject
- HTTP status: `400`（HTTP経由の場合）
- Japanese: プリセットのデバイス種類がインポート先と一致しません。選択したデバイスと同じ種類のプリセットを使用してください。
- English: The preset device type does not match the import target. Select a preset for the same device type.
- Context: `expectedDeviceType`、`actualDeviceType`
- Action: KeyにはKey、EncoderにはEncoderなど、同じ種類のプリセットを選択します。

#### E_PRESET_REQUIRED_FIELD_MISSING

- Condition: デバイス設定に必須のObject、Array、またはFieldがありません。
- Import result: Reject
- HTTP status: `400`（HTTP経由の場合）
- Japanese: プリセットに必須項目がありません。Device Preset v1の必須項目を含むファイルを使用してください。
- English: A required preset field is missing. Use a file that contains all fields required by Device Preset v1.
- Context: `deviceType`、`section`、`field`
- Action: 正規Exporterからプリセットを再エクスポートします。

#### E_PRESET_FIELD_TYPE_INVALID

- Condition: Fieldは存在しますが、JSON型がDevice Preset v1と一致しません。
- Import result: Reject
- HTTP status: `400`（HTTP経由の場合）
- Japanese: プリセット項目の型が正しくありません。Device Preset v1で定義されたJSON型を使用してください。
- English: A preset field has an invalid JSON type. Use the JSON type defined by Device Preset v1.
- Context: `deviceType`、`section`、`field`
- Action: Schemaと正規Exporterの出力を確認します。

### OSC Message

#### E_OSC_ADDRESS_INVALID

- Condition: OSC Addressが空、`/`から始まらない、または空白、`#`、`*`、`,`、`?`、`[`、`]`、`{`、`}`を含みます。
- Import result: Reject
- HTTP status: `400`（HTTP経由の場合）
- Japanese: OSC Addressは「/」から始め、空白および`# * , ? [ ] { }`を含めないでください。
- English: OSC Address must start with `/` and must not contain whitespace or `# * , ? [ ] { }`.
- Context: `deviceType`、`section`、`messageIndex`、`field`
- Action: 有効なOSC Addressへ修正します。

#### E_OSC_ADDRESS_TOO_LONG

- Condition: OSC AddressのUTF-8表現が192バイトを超えています。
- Import result: Reject
- HTTP status: `400`（HTTP経由の場合）
- Japanese: OSC Addressが長すぎます。UTF-8で192バイト以内にしてください。
- English: OSC Address is too long. Keep it within 192 bytes in UTF-8.
- Context: `deviceType`、`section`、`messageIndex`、`field`、`limit`
- Action: OSC Addressを短くします。

#### E_OSC_VALUE_TOO_LONG

- Condition: OSC Value文字列のUTF-8表現が128バイトを超えています。
- Import result: Reject
- HTTP status: `400`（HTTP経由の場合）
- Japanese: OSC Valueが長すぎます。UTF-8で128バイト以内にしてください。
- English: OSC Value is too long. Keep it within 128 bytes in UTF-8.
- Context: `deviceType`、`section`、`messageIndex`、`field`、`limit`
- Action: OSC Valueを短くします。

#### E_OSC_TYPE_INVALID

- Condition: OSC Messageまたは出力範囲の`type`が、対象項目で許可されたFloat、Int、Stringに対応する値ではありません。
- Import result: Reject
- HTTP status: `400`（HTTP経由の場合）
- Japanese: OSC Typeが正しくありません。この項目で使用できるFloat、Int、Stringのいずれかを指定してください。
- English: OSC Type is invalid. Select Float, Int, or String as allowed for this field.
- Context: `deviceType`、`section`、`messageIndex`、`field`
- Action: 対象デバイスと項目で許可されるOSC Typeへ修正します。

#### E_OSC_INT32_INVALID

- Condition: IntのValueが10進整数として解析できない、またはOSC int32の範囲外です。
- Import result: Reject
- HTTP status: `400`（HTTP経由の場合）
- Japanese: Int値が正しくありません。`-2147483648`～`2147483647`の範囲の10進整数を指定してください。
- English: The Int value is invalid. Specify a decimal integer from `-2147483648` to `2147483647`.
- Context: `deviceType`、`section`、`messageIndex`、`field`
- Action: 小数、指数表記、文字列、int32範囲外の値を使用しないように修正します。

#### E_OSC_FLOAT32_INVALID

- Condition: FloatのValueが10進数として解析できない、非有限値、または有限のOSC float32へ変換できません。
- Import result: Reject
- HTTP status: `400`（HTTP経由の場合）
- Japanese: Float値が正しくありません。有限のOSC float32として表現できる10進数を指定してください。
- English: The Float value is invalid. Specify a decimal number representable as a finite OSC float32.
- Context: `deviceType`、`section`、`messageIndex`、`field`
- Action: `NaN`、`Infinity`、非数値文字列、float32範囲外の値を使用しないように修正します。

#### E_OSC_MESSAGE_COUNT_EXCEEDED

- Condition: PressとReleaseのOSC Messageが合計8件を超えています。
- Import result: Reject
- HTTP status: `400`（HTTP経由の場合）
- Japanese: PressとReleaseのOSCメッセージは、合計8件以内にしてください。
- English: Press and Release OSC messages must total 8 or fewer.
- Context: `deviceType`、`section`、`limit`
- Action: PressとReleaseを合わせて8件以内へ減らします。

### Sequence

#### E_SEQUENCE_REQUIRED_FIELD_MISSING

- Condition: Sequenceに`address`、`type`、`start`、`end`、`step`のいずれかがありません。
- Import result: Reject
- HTTP status: `400`（HTTP経由の場合）
- Japanese: Sequenceの必須項目がありません。`address`、`type`、`start`、`end`、`step`を指定してください。
- English: A required Sequence field is missing. Specify `address`, `type`, `start`, `end`, and `step`.
- Context: `deviceType`、`section`、`field`
- Action: 不足しているSequence項目を追加します。

#### E_SEQUENCE_VALUE_INVALID

- Condition: `start`、`end`、`step`がJSON Numberではない、または有限値ではありません。
- Import result: Reject
- HTTP status: `400`（HTTP経由の場合）
- Japanese: Sequenceの数値が正しくありません。Start、End、Stepには有限の数値を指定してください。
- English: A Sequence number is invalid. Specify finite numbers for Start, End, and Step.
- Context: `deviceType`、`section`、`field`
- Action: `NaN`、`Infinity`、文字列などを使用せず、有限のJSON Numberへ修正します。

#### E_SEQUENCE_STEP_ZERO

- Condition: `step == 0`です。
- Import result: Reject; automatic correction is not allowed
- HTTP status: `400`（HTTP経由の場合）
- Japanese: SequenceのStepには0を指定できません。StartからEndへ進む0以外の値を指定してください。
- English: Sequence Step must not be zero. Specify a non-zero value that moves from Start toward End.
- Context: `deviceType`、`section`、`field`
- Action: Stepを0以外にします。

#### E_SEQUENCE_DIRECTION_INVALID

- Condition: `start < end`で`step <= 0`、または`start > end`で`step >= 0`です。
- Import result: Reject; automatic correction is not allowed
- HTTP status: `400`（HTTP経由の場合）
- Japanese: Sequenceの進行方向が正しくありません。StartがEndより小さい場合は正のStep、大きい場合は負のStepを指定してください。
- English: Sequence direction is invalid. Use a positive Step when Start is below End and a negative Step when Start is above End.
- Context: `deviceType`、`section`、`field`
- Action: StartとEndの大小関係に合わせてStepの符号を修正します。

### デバイス固有設定と適用

#### E_PRESET_DEVICE_SETTING_INVALID

- Condition: Encoder、Angle、ToF、Joystickなどのデバイス固有値が、Device Preset v1で許可された型または範囲を満たしません。
- Import result: Reject
- HTTP status: `400`（HTTP経由の場合）
- Japanese: デバイス設定値が正しくありません。対象デバイスで使用できる値の範囲と型を確認してください。
- English: A device setting is invalid. Check the allowed value range and type for the target device.
- Context: `deviceType`、`section`、`field`、`limit`
- Action: Error ContextとDevice Preset v1を参照して値を修正します。共通して区別する必要が生じた条件は、将来のRegistryで専用Error Codeへ分離できます。

#### E_PRESET_STORAGE_WRITE_FAILED

- Condition: 検証済みプリセットをストレージへ保存できませんでした。
- Import result: Fail without partially applying the candidate settings
- HTTP status: `507`（HTTP経由の場合）
- Japanese: プリセットをストレージへ書き込めませんでした。既存の設定は変更されていません。空き容量を確認してから再試行してください。
- English: The preset could not be written to storage. Existing settings were not changed. Check available storage and try again.
- Context: `deviceType`
- Action: ストレージ状態を確認します。既存設定を維持できなかった可能性がある場合は、このメッセージを使用せず製品固有の重大エラーとして扱います。

## Fixtureの期待Error Code

機械可読な対応表は[`test-data/device-presets/expected-errors.json`](test-data/device-presets/expected-errors.json)を正本とします。

| Fixture | Expected Error Code |
| --- | --- |
| `invalid/empty.json` | `E_PRESET_FORMAT_INVALID` |
| `invalid/malformed.json` | `E_PRESET_JSON_MALFORMED` |
| `invalid/wrong-format.json` | `E_PRESET_FORMAT_INVALID` |
| `invalid/unsupported-schema.json` | `E_PRESET_SCHEMA_UNSUPPORTED` |
| `invalid/key-address-without-slash.json` | `E_OSC_ADDRESS_INVALID` |
| `invalid/key-address-too-long.json` | `E_OSC_ADDRESS_TOO_LONG` |
| `invalid/key-value-too-long.json` | `E_OSC_VALUE_TOO_LONG` |
| `invalid/key-invalid-int.json` | `E_OSC_INT32_INVALID` |
| `invalid/key-int32-underflow.json` | `E_OSC_INT32_INVALID` |
| `invalid/key-int32-overflow.json` | `E_OSC_INT32_INVALID` |
| `invalid/key-float32-nan.json` | `E_OSC_FLOAT32_INVALID` |
| `invalid/key-float32-infinity.json` | `E_OSC_FLOAT32_INVALID` |
| `invalid/key-float32-overflow.json` | `E_OSC_FLOAT32_INVALID` |
| `invalid/key-nine-messages.json` | `E_OSC_MESSAGE_COUNT_EXCEEDED` |
| `invalid/key-sequence-zero-step.json` | `E_SEQUENCE_STEP_ZERO` |
| `invalid/key-sequence-wrong-direction.json` | `E_SEQUENCE_DIRECTION_INVALID` |

`invalid/empty.json`は0バイトのファイルではなく空のJSON Object（`{}`）であるため、`E_PRESET_FILE_EMPTY`ではなく`E_PRESET_FORMAT_INVALID`です。

## UIとログの要件

- UIは少なくとも日本語または英語の正規メッセージと同じ原因・修正条件を表示します。
- 利用者が確認できる詳細表示またはログにError Codeを残すことを推奨します。
- Contextがある場合、エラー箇所を特定できる形で表示します。
- JSON解析器の低水準なメッセージは、`E_PRESET_JSON_MALFORMED`の正規メッセージに補足できます。
- 入力された長大なOSC Value、ファイル全文、認証情報をエラーへそのまま出力しません。
- Error CodeをHTTP本文へ含める形式は製品ごとに実装できますが、既存UIを壊さないよう段階的に導入します。

## テスト要件

Importerの回帰テストでは、各invalid fixtureについて次を確認します。

1. インポートが拒否される。
2. 画面上の設定が変化しない。
3. 保存済み設定が変化しない。
4. 再起動後も既存設定が維持される。
5. OSC送信内容が変化しない。
6. Registryに対応したError Codeが返る、またはログで確認できる。
7. 日本語と英語が同じ原因と修正方法を伝える。

## 現行実装から採用した表現

Registryの日本語メッセージは、作成時点の5製品を比較し、情報量が多い表現を統合しました。

- OSC Addressの開始文字と192バイト上限: ChainOSCmini、ChainOSCnano
- OSC Addressの禁止文字: M5ChainOSC、ChainOSCmini、ChainOSCnano
- Int32の10進整数条件と正確な範囲: ChainOSC for Windows
- Float32の有限値・変換可能性: ChainOSC for Windows
- PressとReleaseの合計8件上限: M5ChainOSC、ChainOSCmini、ChainOSCnano
- Sequenceの必須項目と有限値: M5ChainOSC、ChainOSCmini、ChainOSCnano、ChainOSCPad
- Sequenceの非ゼロStepと進行方向: ChainOSCPadおよびDevice Preset v1仕様
- format、schemaVersion、ファイルサイズ、ストレージ失敗: M5ChainOSC、ChainOSCmini、ChainOSCnano、ChainOSCPad

既存製品の短いメッセージをそのまま正本にはせず、複数製品に存在する上限、条件、修正方法を欠落なく組み合わせています。

## 導入手順

1. 各製品の検証関数が、自由形式文字列だけでなくError Codeを返せるようにします。
2. DP-01を`E_OSC_VALUE_TOO_LONG`としてChainOSC for Windowsで修正します。
3. DP-02を`E_SEQUENCE_STEP_ZERO`としてM5ChainOSC、ChainOSCmini、ChainOSCnanoで修正します。
4. DP-03を`E_SEQUENCE_DIRECTION_INVALID`としてM5ChainOSC、ChainOSCmini、ChainOSCnano、ChainOSC for Windowsで修正します。
5. ChainOSCPadを含む全製品でinvalid fixtureと期待Error Codeを再確認します。
6. 正常なSequence、Int32、Float32のfixtureも回帰確認します。
