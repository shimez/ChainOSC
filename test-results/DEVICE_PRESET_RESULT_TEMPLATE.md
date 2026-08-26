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
| 実施日 | YYYY-MM-DD |
| 実施者 |  |
| Device Preset仕様 | ChainOSC Device Preset JSON Format v1 |
| ChainOSCリポジトリ | commit: |
| M5ChainOSC | version: / commit: |
| ChainOSCmini | version: / commit: |
| ChainOSCnano | version: / commit: |
| ChainOSCPad | version: / commit: |
| ChainOSC for Windows | version: / commit: |
| OSC受信環境 |  |
| 使用ブラウザー |  |
| Chainデバイス台帳 | `test-data/CHAIN_DEVICE_INVENTORY.md` |
| 使用デバイス管理ID |  |
| 使用した本体入力 |  |
| 初期設定バックアップ | 済／未実施 |
| 備考 |  |

## 2. 正常fixture

各欄には`PASS`、`FAIL`、`N/A`、`BLOCKED`を記入します。`PASS`には、インポート、画面反映、保存、再起動後の復元、OSC送信がすべて期待どおりであることを含みます。

| Fixture | M5ChainOSC | ChainOSCmini | ChainOSCnano | ChainOSCPad | Windows | 証跡／備考 |
| --- | --- | --- | --- | --- | --- | --- |
| `valid/key-press-release-types.json` |  |  |  |  |  |  |
| `valid/key-sequence-up-int.json` |  |  |  |  |  |  |
| `valid/key-sequence-down-float.json` |  |  |  |  |  |  |
| `valid/key-int32-boundaries.json` |  |  |  |  |  |  |
| `valid/key-float32-finite.json` |  |  |  |  |  |  |
| `valid/encoder.json` |  |  |  |  | N/A |  |
| `valid/angle.json` |  |  |  | N/A | N/A |  |
| `valid/tof.json` |  |  |  | N/A | N/A |  |
| `valid/joystick.json` |  |  |  | N/A | N/A |  |

Fixtureの基準ディレクトリは`test-data/device-presets/`です。

## 3. 相互インポートと再エクスポート

各経路で、設定値、OSC型、OSC値、送信順が一致することを確認します。UID、デバイス名、Windowsのホットキーなど、製品固有情報が不必要に上書きされないことも確認します。

| デバイス種類 | 経路 | 結果 | 再エクスポートJSON／証跡 | 備考 |
| --- | --- | --- | --- | --- |
| Key | M5ChainOSC → ChainOSCmini |  |  |  |
| Key | ChainOSCmini → ChainOSCnano |  |  |  |
| Key | ChainOSCnano → ChainOSCPad |  |  |  |
| Key | ChainOSCPad → ChainOSC for Windows |  |  |  |
| Key | ChainOSC for Windows → M5ChainOSC |  |  |  |
| Encoder | M5ChainOSC → ChainOSCmini → ChainOSCnano → ChainOSCPad → M5ChainOSC |  |  |  |
| Angle | M5ChainOSC → ChainOSCmini → ChainOSCnano → M5ChainOSC |  |  |  |
| ToF | M5ChainOSC → ChainOSCmini → ChainOSCnano → M5ChainOSC |  |  |  |
| Joystick | M5ChainOSC → ChainOSCmini → ChainOSCnano → M5ChainOSC |  |  |  |

## 4. 異常fixture

`PASS`は、Importerがファイルを拒否し、既存設定、保存済み設定、OSC送信内容が変化しなかったことを示します。

| Fixture | M5ChainOSC | ChainOSCmini | ChainOSCnano | ChainOSCPad | Windows | 表示された理由／備考 |
| --- | --- | --- | --- | --- | --- | --- |
| `invalid/empty.json` |  |  |  |  |  |  |
| `invalid/malformed.json` |  |  |  |  |  |  |
| `invalid/wrong-format.json` |  |  |  |  |  |  |
| `invalid/unsupported-schema.json` |  |  |  |  |  |  |
| `invalid/key-address-without-slash.json` |  |  |  |  |  |  |
| `invalid/key-address-too-long.json` |  |  |  |  |  |  |
| `invalid/key-value-too-long.json` |  |  |  |  |  |  |
| `invalid/key-invalid-int.json` |  |  |  |  |  |  |
| `invalid/key-int32-underflow.json` |  |  |  |  |  |  |
| `invalid/key-int32-overflow.json` |  |  |  |  |  |  |
| `invalid/key-float32-nan.json` |  |  |  |  |  |  |
| `invalid/key-float32-infinity.json` |  |  |  |  |  |  |
| `invalid/key-float32-overflow.json` |  |  |  |  |  |  |
| `invalid/key-nine-messages.json` |  |  |  |  |  |  |
| `invalid/key-sequence-zero-step.json` |  |  |  |  |  |  |
| `invalid/key-sequence-wrong-direction.json` |  |  |  |  |  |  |

## 5. 詳細確認

正常fixtureで確認した項目にチェックします。

- [ ] インポート直後に画面へ反映された
- [ ] 保存後に設定が維持された
- [ ] 再起動後に設定が維持された
- [ ] 抜き差し後に同じUIDの設定が復元された
- [ ] OSC Addressが一致した
- [ ] OSC Type Tagが一致した
- [ ] OSC値が一致した
- [ ] 複数メッセージの送信順が一致した
- [ ] Sequenceの送信順と周回が一致した
- [ ] 再エクスポートしたJSONがv1 Schemaに適合した
- [ ] 製品固有情報が不必要に上書きされなかった

異常fixtureで確認した項目にチェックします。

- [ ] 全製品が不正fixtureを拒否した
- [ ] 拒否理由を利用者が確認できた
- [ ] 既存の画面設定が変化しなかった
- [ ] 保存済み設定が変化しなかった
- [ ] 再起動後も既存設定が維持された
- [ ] OSC送信内容が変化しなかった

## 6. 不一致・不具合

不一致がない場合は「なし」と記入します。

| ID／Issue | 製品とバージョン | Fixture／経路 | 実際の結果 | 期待結果 | 対応方針 |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |

## 7. 結果サマリー

| 項目 | 結果 | 備考 |
| --- | --- | --- |
| 正常fixture |  |  |
| Key相互互換 |  |  |
| Chainデバイス相互互換 |  |  |
| 異常fixture |  |  |
| 再起動／抜き差し後の復元 |  |  |
| OSC送信結果 |  |  |

```text
未解決事項:

リリース可否: 可／条件付き可／不可

判定理由:
```
