# ChainOSCシリーズ 入力中警告テスト

この文書は、ChainOSC Device Preset Import Error Registry v1の条件を基準に、Web UIまたはデスクトップUIへ手入力した値が保存前に検証されることを確認する共通手順です。

対象製品:

- M5ChainOSC
- ChainOSCmini
- ChainOSCnano
- ChainOSCPad
- ChainOSC for Windows

Device Preset JSONのインポート試験は[`test-data/device-presets/ERROR_FIXTURE_TESTING.md`](test-data/device-presets/ERROR_FIXTURE_TESTING.md)を使用します。本書はJSON Importerではなく、設定画面へ直接入力した値の警告を対象とします。

## 1. 合格条件

不正値を入力したとき、対象製品で次をすべて満たせば合格です。

1. 対象入力欄が赤枠と薄い赤背景で表示される。
2. 入力欄の直下に、原因または修正条件が分かる警告が表示される。
3. 日本語と英語で同じ原因と修正条件が示される。
4. 不正値を修正すると、赤枠と警告が消える。
5. 不正値が残った状態で「すべての設定を保存」を押しても保存されない。
6. 最初の不正入力欄へフォーカスまたはスクロールされる。
7. 再読み込みまたは再起動後に、最後に正常保存した設定が維持される。
8. 不正値によってOSC送信内容が変更されない。

警告文はRegistryの正規メッセージと完全な文字列一致でなくても構いません。ただし、同じ不正条件と修正方法を利用者が判断できる必要があります。

## 2. Registry v1との対応範囲

| Error Code | 手入力試験 | UIで確認する内容 |
| --- | --- | --- |
| `E_OSC_ADDRESS_INVALID` | 対象 | 空欄、先頭の`/`欠落、禁止文字 |
| `E_OSC_ADDRESS_TOO_LONG` | 条件付き | UTF-8で192バイト超過。入力長制限で超過不能なら未然防止を確認 |
| `E_OSC_VALUE_TOO_LONG` | 条件付き | UTF-8で128バイト超過。入力長制限で超過不能なら未然防止を確認 |
| `E_OSC_INT32_INVALID` | 対象 | 形式不正、int32アンダーフロー／オーバーフロー |
| `E_OSC_FLOAT32_INVALID` | 対象 | 形式不正、非有限値、float32アンダーフロー／オーバーフロー |
| `E_SEQUENCE_VALUE_INVALID` | 対象 | Start、End、Stepの空欄または有限値でない値 |
| `E_SEQUENCE_STEP_ZERO` | 対象 | `Step = 0` |
| `E_SEQUENCE_DIRECTION_INVALID` | 対象 | Start／EndとStepの符号が不一致 |
| `E_OSC_TYPE_INVALID` | 通常は対象外 | UIが選択肢をFloat／Int／Stringへ限定していることを確認 |
| `E_OSC_MESSAGE_COUNT_EXCEEDED` | 通常は対象外 | 9件目を追加できないことを確認 |
| その他の`E_PRESET_*` | 対象外 | ファイル、JSON構造、Importer、ストレージの試験で確認 |
| `E_SEQUENCE_REQUIRED_FIELD_MISSING` | 対象外 | JSON Field欠落のためImporter試験で確認 |

`maxlength`や追加ボタンの無効化により不正状態を作れない場合は、「警告なし」ではなく「UIで不正入力を未然に防止」として合格にできます。DOM編集などで制約を解除する試験は任意です。

## 3. 対象入力欄

各製品が対応する範囲だけを試験します。

| 製品 | Key／本体Key | Encoder Click | Joystick Click |
| --- | --- | --- | --- |
| M5ChainOSC | 対象 | 対象 | 対象 |
| ChainOSCmini | 対象 | 対象 | 対象 |
| ChainOSCnano | 対象 | 対象 | 対象 |
| ChainOSCPad | 対象 | 対象 | 非対応 |
| ChainOSC for Windows | 対象 | 非対応 | 非対応 |

各Clickについて、次の両方をKeyと同じ手順で確認します。

- 「押した時／離した時」のOSC Message
- 「Sequence」のOSC Address、Start、End、Step

## 4. 事前準備

1. 試験対象を起動し、設定画面を開きます。
2. 日本語を選択します。
3. Keyを1つ用意します。Chainデバイスを使う試験ではEncoderおよびJoystickを接続します。
4. 対象設定を正常値にして保存します。
5. 正常値の例を記録します。

```text
OSC Address: /chainosc/validation
Type: Int
Value: 1
Sequence Start: 0
Sequence End: 3
Sequence Step: 1
```

6. 正常値でOSCが送信されることを確認します。

以降の各試験は、原則として1項目ずつ不正にし、確認後に正常値へ戻します。複数の不正を同時に入力すると、最初に表示される警告が製品ごとに異なる可能性があります。

## 5. OSC Address

Keyの「押した時」にOSC Messageを1件用意して実施します。その後、Keyの「離した時」、Encoder Click、Joystick Click、各SequenceのOSC Addressでも繰り返します。

### IV-ADDR-01 空欄

1. OSC Addressを空欄にします。
2. 入力欄からフォーカスを外します。
3. 赤枠と必須警告が表示されることを確認します。
4. 保存を押し、保存されないことを確認します。

期待条件: `E_OSC_ADDRESS_INVALID`

### IV-ADDR-02 先頭のスラッシュなし

入力値:

```text
chainosc/validation
```

期待条件: `E_OSC_ADDRESS_INVALID`

期待する案内: OSC Addressを`/`から始める必要があることが分かる。

### IV-ADDR-03 禁止文字

次の値を1つずつ試します。

```text
/chain osc
/chain#osc
/chain*osc
/chain,osc
/chain?osc
/chain[osc]
/chain{osc}
```

期待条件: `E_OSC_ADDRESS_INVALID`

期待する案内: 空白および`# * , ? [ ] { }`を使用できないことが分かる。

### IV-ADDR-04 UTF-8長制限

1. ASCII 192文字相当または日本語を含む192バイト以内のAddressを入力できることを確認します。
2. さらに文字を追加します。
3. 次のいずれかになることを確認します。
   - 192バイトを超える入力がUIで阻止または切り詰められる。
   - 入力欄が赤くなり、192バイト以内にする警告が表示される。

期待条件: `E_OSC_ADDRESS_TOO_LONG`またはUIによる未然防止。

## 6. OSC Int Value

OSC MessageのTypeを`Int`へ変更して実施します。

| Test ID | 入力値 | 期待結果 |
| --- | --- | --- |
| IV-INT-01 | 空欄 | 警告、保存不可 |
| IV-INT-02 | `1.5` | 10進整数ではないため警告、保存不可 |
| IV-INT-03 | `1e3` | 指数表記のため警告、保存不可 |
| IV-INT-04 | `abc` | 数値ではないため警告、保存不可 |
| IV-INT-05 | `-2147483649` | int32アンダーフローとして警告、保存不可 |
| IV-INT-06 | `2147483648` | int32オーバーフローとして警告、保存不可 |
| IV-INT-07 | `-2147483648` | 警告なし、保存可能 |
| IV-INT-08 | `2147483647` | 警告なし、保存可能 |

不正値の期待条件: `E_OSC_INT32_INVALID`

境界値を保存した場合は、OSCパケットがint32型で同じ値を送信することも確認します。

## 7. OSC Float Value

OSC MessageのTypeを`Float`へ変更して実施します。

| Test ID | 入力値 | 期待結果 |
| --- | --- | --- |
| IV-FLOAT-01 | 空欄 | 警告、保存不可 |
| IV-FLOAT-02 | `abc` | 10進数ではないため警告、保存不可 |
| IV-FLOAT-03 | `NaN` | 非有限値として警告、保存不可 |
| IV-FLOAT-04 | `Infinity` | 非有限値として警告、保存不可 |
| IV-FLOAT-05 | `3.4028236e38` | float32オーバーフローとして警告、保存不可 |
| IV-FLOAT-06 | `-3.4028236e38` | float32の負方向オーバーフローとして警告、保存不可 |
| IV-FLOAT-07 | `1e-46` | 0以外から0へ丸められるfloat32アンダーフローとして警告、保存不可 |
| IV-FLOAT-08 | `-1e-46` | 同上、警告、保存不可 |
| IV-FLOAT-09 | `3.4028235e38` | 警告なし、保存可能 |
| IV-FLOAT-10 | `1.401298464e-45` | 最小の正のfloat32サブノーマル値として警告なし、保存可能 |
| IV-FLOAT-11 | `0` | 警告なし、保存可能 |

不正値の期待条件: `E_OSC_FLOAT32_INVALID`

ここでいうアンダーフローは、符号付き最小値ではなく、絶対値が小さすぎてfloat32変換後に0になることを指します。

## 8. OSC ValueのUTF-8長制限

1. Typeを`String`へ変更します。
2. UTF-8で128バイト以内の値を入力できることを確認します。
3. さらに文字を追加します。
4. 次のいずれかになることを確認します。
   - 128バイトを超える入力がUIで阻止または切り詰められる。
   - 入力欄が赤くなり、128バイト以内にする警告が表示される。

期待条件: `E_OSC_VALUE_TOO_LONG`またはUIによる未然防止。

日本語は1文字が複数バイトになるため、文字数ではなくUTF-8バイト数で判定されることを確認します。

## 9. Sequence

対象のKeyまたはClick Modeを「Sequence」へ変更します。

### IV-SEQ-01 空欄・非有限値

Start、End、Stepについて、1欄ずつ次を試します。

- 空欄
- UIが許可する場合は`NaN`
- UIが許可する場合は`Infinity`
- `1e999`

期待条件: `E_SEQUENCE_VALUE_INVALID`

期待する動作: 対象欄または関連するStep欄が赤くなり、有限の数値を入力する案内が表示され、保存されない。

### IV-SEQ-02 Stepが0

```text
Start: 0
End:   3
Step:  0
```

期待条件: `E_SEQUENCE_STEP_ZERO`

期待する案内: Stepに0を指定できないことが分かる。

### IV-SEQ-03 正方向に対する負のStep

```text
Start: 0
End:   3
Step: -1
```

期待条件: `E_SEQUENCE_DIRECTION_INVALID`

### IV-SEQ-04 負方向に対する正のStep

```text
Start: 3
End:   0
Step:  1
```

期待条件: `E_SEQUENCE_DIRECTION_INVALID`

### IV-SEQ-05 正常な正方向

```text
Start: 0
End:   3
Step:  1
```

期待結果: 警告なし、保存可能。操作ごとに`0, 1, 2, 3, 0`と進む。

### IV-SEQ-06 正常な負方向

```text
Start: 3
End:   0
Step: -1
```

期待結果: 警告なし、保存可能。操作ごとに`3, 2, 1, 0, 3`と進む。

## 10. 件数とType選択肢

### IV-MSG-01 OSC Message上限

1. PressとReleaseを合わせて8件にします。
2. 9件目の追加を試します。
3. 追加ボタンが無効、または9件目が追加されないことを確認します。

期待条件: `E_OSC_MESSAGE_COUNT_EXCEEDED`の未然防止。

### IV-TYPE-01 OSC Type選択肢

1. 通常のOSC MessageでType一覧を開きます。
2. Float、Int、String以外を選択できないことを確認します。
3. 数値出力専用項目では、その項目が対応するTypeだけを選択できることを確認します。

期待条件: `E_OSC_TYPE_INVALID`の未然防止。

## 11. 保存抑止と設定不変性

各不正条件から少なくとも1件を選び、次を確認します。

1. 正常な設定Aを保存します。
2. OSC送信内容が設定Aと一致することを確認します。
3. 不正値を入力します。
4. 「すべての設定を保存」を押します。
5. 保存完了表示が出ないことを確認します。
6. ページを再読み込みします。必要に応じて本体またはアプリも再起動します。
7. 設定Aが復元されることを確認します。
8. OSC送信内容が設定Aのままであることを確認します。

## 12. 言語試験

1. IV-ADDR-03、IV-INT-06、IV-FLOAT-05、IV-SEQ-02、IV-SEQ-03を日本語で実施します。
2. 言語をEnglishへ変更し、同じ入力値で再実施します。
3. 両言語で原因と修正条件が同じであることを確認します。
4. 言語変更後も古い言語の警告が残らないことを確認します。

## 13. 結果記録

製品ごとに次の表をコピーして記録します。非対応のデバイス欄は`N/A`とします。

| 製品 | version / commit | Key | Encoder Click | Joystick Click | 日本語／英語 | 保存抑止 | 結果 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| M5ChainOSC |  |  |  |  |  |  |  |
| ChainOSCmini |  |  |  |  |  |  |  |
| ChainOSCnano |  |  |  |  |  |  |  |
| ChainOSCPad |  |  |  | N/A |  |  |  |
| ChainOSC for Windows |  |  | N/A | N/A |  |  |  |

不具合は次の形式で記録します。

```text
ID: IV-INT-06
製品: ChainOSCmini
version / commit:
対象: Encoder Click / Press / Message 1 / Value
言語: 日本語
入力値: 2147483648
期待結果: 赤枠、int32範囲の警告、保存不可
実際の結果:
保存済み設定への影響:
OSC送信への影響:
証跡: スクリーンショット、シリアルログ、デバッグログなど
```

## 14. 実施頻度

- 入力検証ロジックまたはWeb UIを変更したとき: 対応する項目を全製品で実施
- 新しいChainデバイスまたはClick入力を追加したとき: 対象デバイスで第5～11章を実施
- Release候補版: 第5～12章の共通回帰試験を実施
- 文言だけの変更: 対応項目の日英表示と保存抑止を実施

ImporterのRegistry準拠試験と本書の入力中警告試験は目的が異なるため、片方の結果で他方を省略しません。
