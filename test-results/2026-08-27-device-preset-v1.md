# ChainOSC Device Preset互換テスト結果

このファイルをコピーし、ファイル名を`YYYY-MM-DD-device-preset-v1.md`へ変更して使用します。

結果記号:

- `PASS`: 期待結果を満たした
- `FAIL`: 期待結果を満たさなかった
- `N/A`: 製品の適用範囲外
- `BLOCKED`: 環境や機材が不足して実施できなかった

## 1. 実施情報

| 項目 | 内容 |
| --- | --- |
| 実施日 | 2026-08-27 |
| 実施者 | shimez |
| Device Preset仕様 | ChainOSC Device Preset JSON Format v1 |
| ChainOSCリポジトリ | commit: a0de563 |
| M5ChainOSC | version: 1.8.1 / commit: 8aedb80 |
| ChainOSCmini | version: 1.0.1 / commit: 2143799 |
| ChainOSCnano | version: 0.7.0 / commit: 6046402 |
| ChainOSCPad | version: 0.6.1 / commit: 64b8c3b |
| ChainOSC for Windows | version: 1.0.2 / commit: 1cf6ff0 |
| OSC受信環境 | Wireshark |
| 使用ブラウザー | Edge |
| Chainデバイス台帳 | `test-data/CHAIN_DEVICE_INVENTORY.md` |
| 使用デバイス管理ID | KEY-01、ENC-01、ANG-01、TOF-01、JOY-01 |
| 使用した本体入力 | ChainOSCmini本体Key、ChainOSCnano本体Key、ChainOSCPad内蔵Key |
| 初期設定バックアップ | 済 |
| 備考 |  |

## 2. 正常fixture

各欄には`PASS`、`FAIL`、`N/A`、`BLOCKED`を記入します。`PASS`には、インポート、画面反映、保存、再起動後の復元、OSC送信がすべて期待どおりであることを含みます。

| Fixture | M5ChainOSC | ChainOSCmini | ChainOSCnano | ChainOSCPad | Windows | 証跡／備考 |
| --- | --- | --- | --- | --- | --- | --- |
| `valid/key-press-release-types.json` | PASS | PASS | PASS | PASS | PASS |  |
| `valid/key-sequence-up-int.json` | PASS | PASS | PASS | PASS | PASS |  |
| `valid/key-sequence-down-float.json` | PASS | PASS | PASS | PASS | PASS |  |
| `valid/key-int32-boundaries.json` | PASS | PASS | PASS | PASS | PASS |  |
| `valid/key-float32-finite.json` | PASS | PASS | PASS | PASS | PASS |  |
| `valid/encoder.json` | PASS | PASS | PASS | PASS | N/A |  |
| `valid/angle.json` | PASS | PASS | PASS | N/A | N/A |  |
| `valid/tof.json` | PASS | PASS | PASS | N/A | N/A |  |
| `valid/joystick.json` | PASS | PASS | PASS | N/A | N/A |  |

Fixtureの基準ディレクトリは`test-data/device-presets/`です。

## 3. 相互インポートと再エクスポート

各経路で、設定値、OSC型、OSC値、送信順が一致することを確認します。UID、デバイス名、Windowsのホットキーなど、製品固有情報が不必要に上書きされないことも確認します。

| デバイス種類 | 経路 | 結果 | 再エクスポートJSON／証跡 | 備考 |
| --- | --- | --- | --- | --- |
| Key | M5ChainOSC → ChainOSCmini | PASS | 再エクスポートJSONをDIFF比較 |  |
| Key | ChainOSCmini → ChainOSCnano | PASS | 再エクスポートJSONをDIFF比較 |  |
| Key | ChainOSCnano → ChainOSCPad | PASS | 再エクスポートJSONをDIFF比較 |  |
| Key | ChainOSCPad → ChainOSC for Windows | PASS | 再エクスポートJSONをDIFF比較 |  |
| Key | ChainOSC for Windows → M5ChainOSC | PASS | 再エクスポートJSONをDIFF比較 |  |
| Encoder | M5ChainOSC → ChainOSCmini → ChainOSCnano → ChainOSCPad → M5ChainOSC | PASS | 各段階の再エクスポートJSONをDIFF比較 |  |
| Angle | M5ChainOSC → ChainOSCmini → ChainOSCnano → M5ChainOSC | PASS | 各段階の再エクスポートJSONをDIFF比較 |  |
| ToF | M5ChainOSC → ChainOSCmini → ChainOSCnano → M5ChainOSC | PASS | 各段階の再エクスポートJSONをDIFF比較 |  |
| Joystick | M5ChainOSC → ChainOSCmini → ChainOSCnano → M5ChainOSC | PASS | 各段階の再エクスポートJSONをDIFF比較 |  |

## 4. 異常fixture

`PASS`は、Importerがファイルを拒否し、既存設定、保存済み設定、OSC送信内容が変化しなかったことを示します。

| Fixture | M5ChainOSC | ChainOSCmini | ChainOSCnano | ChainOSCPad | Windows | 表示された理由／備考 |
| --- | --- | --- | --- | --- | --- | --- |
| `invalid/empty.json` | PASS | PASS | PASS | PASS | PASS |  |
| `invalid/malformed.json` | PASS | PASS | PASS | PASS | PASS |  |
| `invalid/wrong-format.json` | PASS | PASS | PASS | PASS | PASS |  |
| `invalid/unsupported-schema.json` | PASS | PASS | PASS | PASS | PASS |  |
| `invalid/key-address-without-slash.json` | PASS | PASS | PASS | PASS | PASS |  |
| `invalid/key-address-too-long.json` | PASS | PASS | PASS | PASS | PASS |  |
| `invalid/key-value-too-long.json` | PASS | PASS | PASS | PASS | FAIL | DP-01: Windowsでは拒否されず既存設定が上書きされた |
| `invalid/key-invalid-int.json` | PASS | PASS | PASS | PASS | PASS |  |
| `invalid/key-int32-underflow.json` | PASS | PASS | PASS | PASS | PASS |  |
| `invalid/key-int32-overflow.json` | PASS | PASS | PASS | PASS | PASS |  |
| `invalid/key-float32-nan.json` | PASS | PASS | PASS | PASS | PASS |  |
| `invalid/key-float32-infinity.json` | PASS | PASS | PASS | PASS | PASS |  |
| `invalid/key-float32-overflow.json` | PASS | PASS | PASS | PASS | PASS |  |
| `invalid/key-nine-messages.json` | PASS | PASS | PASS | PASS | PASS |  |
| `invalid/key-sequence-zero-step.json` | FAIL | FAIL | FAIL | PASS | PASS | DP-02: M5／mini／nanoではStep=0が自動補正され既存設定が上書きされた |
| `invalid/key-sequence-wrong-direction.json` | FAIL | FAIL | FAIL | PASS | FAIL | DP-03: M5／mini／nano／Windowsでは方向不整合が自動補正され既存設定が上書きされた |

## 5. 詳細確認

正常fixtureで確認した項目にチェックします。

- [x] インポート直後に画面へ反映された
- [x] 保存後に設定が維持された
- [x] 再起動後に設定が維持された
- [x] 抜き差し後に同じUIDの設定が復元された
- [x] OSC Addressが一致した
- [x] OSC Type Tagが一致した
- [x] OSC値が一致した
- [x] 複数メッセージの送信順が一致した
- [x] Sequenceの送信順と周回が一致した
- [x] 再エクスポートしたJSONがv1 Schemaに適合した
- [x] 製品固有情報が不必要に上書きされなかった

異常fixtureで確認した項目にチェックします。

- [ ] 全製品が不正fixtureを拒否した
- [ ] 拒否理由を利用者が確認できた
- [ ] 既存の画面設定が変化しなかった
- [ ] 保存済み設定が変化しなかった
- [ ] 再起動後も既存設定が維持された
- [ ] OSC送信内容が変化しなかった
異常fixtureは全製品で実施済み。DP-01〜DP-03により、上記のシリーズ全体条件は未達。

## 6. 不一致・不具合

不一致がない場合は「なし」と記入します。

| ID／Issue | 製品とバージョン | Fixture／経路 | 実際の結果 | 期待結果 | 対応方針 |
| --- | --- | --- | --- | --- | --- |
| DP-01 | ChainOSC for Windows 1.0.2 | `invalid/key-value-too-long.json` | インポートが拒否されず、既存のKey設定がfixtureの内容で上書きされた。 | 値の長さ超過としてインポートを拒否し、画面上および保存済みの既存設定を変更しない。 | Windows版の文字列長検証をDevice Preset仕様と照合し、Importerへ検証を追加する。修正後に同fixtureで回帰テストする。 |
| DP-02 | M5ChainOSC 1.8.1<br>ChainOSCmini 1.0.1<br>ChainOSCnano 0.7.0 | `invalid/key-sequence-zero-step.json` | インポートが拒否されず、既存のKey設定がStepの値が自動補正されたSequence設定で上書きされた。 | `Step = 0`を不正なSequenceとして拒否し、画面上および保存済みの既存設定を変更しない。 | 3製品のSequence検証を共通仕様と照合し、ゼロStepを拒否する。修正後に3製品で回帰テストする。 |
| DP-03 | M5ChainOSC 1.8.1<br>ChainOSCmini 1.0.1<br>ChainOSCnano 0.7.0<br>ChainOSC for Windows 1.0.2 | `invalid/key-sequence-wrong-direction.json` | インポートが拒否されず、Stepの符号が自動補正されたSequence設定で既存設定が上書きされた。 | Start、End、Stepの方向不整合としてインポートを拒否し、画面上および保存済みの既存設定を変更しない。 | 4製品のSequence整合性検証を共通仕様へ合わせる。修正後に同fixtureで回帰テストする。 |

## 7. 結果サマリー

| 項目 | 結果 | 備考 |
| --- | --- | --- |
| 正常fixture | PASS | 9 fixtureについて、全適用製品で画面反映、保存、復元、OSC送信を確認 |
| Key相互互換 | PASS | M5 → mini → nano → Pad → Windows → M5の各経路で一致 |
| Chainデバイス相互互換 | PASS | Encoder、Angle、ToF、Joystickの全対象経路で一致 |
| 異常fixture | FAIL | 16 fixture中、3 fixtureで製品別の不一致あり。DP-01〜DP-03参照 |
| 再起動／抜き差し後の復元 | PASS | 正常fixtureでは設定復元を確認 |
| OSC送信結果 | PASS（正常系）／FAIL（異常系） | 正常fixtureは一致。不正設定を受理した製品ではDP-01〜DP-03の影響あり |

```text
未解決事項:
DP-01: ChainOSC for Windowsが長すぎる値を拒否しない
DP-02: M5ChainOSC、ChainOSCmini、ChainOSCnanoがSequenceのStep=0を拒否しない
DP-03: M5ChainOSC、ChainOSCmini、ChainOSCnano、ChainOSC for WindowsがSequenceの方向不整合を拒否しない

リリース可否: 条件付き可

判定理由:
正常fixture、製品間インポート、再エクスポート、OSC送信はすべて期待どおりだった。
一方、不正fixtureのうち3件で製品間の検証動作に不一致があり、不正設定によって既存設定が上書きされた。
通常のExporterが生成する正規JSONの互換性には問題ないが、次回リリースまでにDP-01〜DP-03を修正し、回帰テストする。
```
