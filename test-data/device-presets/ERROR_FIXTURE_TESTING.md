# Device Preset Import Error fixtureの使用方法

| Error Code | fixture | 試験条件 |
| --- | --- | --- |
| `E_PRESET_DEVICE_TYPE_UNSUPPORTED` | `invalid/key-device-type-missing.json` | Keyへインポートし、`deviceType`の欠落として拒否されることを確認します。 |
| `E_PRESET_DEVICE_TYPE_UNSUPPORTED` | `invalid/key-device-type-string.json` | Keyへインポートし、`deviceType`がIntegerではないため拒否されることを確認します。 |
| `E_PRESET_DEVICE_TYPE_UNSUPPORTED` | `invalid/key-device-type-unsupported.json` | Keyへインポートし、未対応の`deviceType: 999`として拒否されることを確認します。 |
| `E_PRESET_DEVICE_TYPE_MISMATCH` | `invalid/encoder-device-type-mismatch-for-key.json` | **Keyへ**インポートし、対応済みEncoderプリセットとインポート先Keyの不一致として拒否されることを確認します。Encoderへインポートした場合は正常なプリセットとして受理されます。 |
| `E_PRESET_REQUIRED_FIELD_MISSING` | `invalid/root-device-type-name-missing.json` | Keyへインポートし、ルートの`deviceTypeName`欠落として拒否されることを確認します。 |
| `E_PRESET_REQUIRED_FIELD_MISSING` | `invalid/key-required-field-missing.json` | Keyへインポートし、Keyの`press`欠落として拒否されることを確認します。 |
| `E_PRESET_REQUIRED_FIELD_MISSING` | `invalid/key-message-required-field-missing.json` | Keyへインポートし、OSC Messageの`value`欠落として拒否されることを確認します。 |
| `E_PRESET_REQUIRED_FIELD_MISSING` | `invalid/encoder-required-field-missing.json` | Encoderへインポートし、`sendIncrement`欠落として拒否されることを確認します。 |
| `E_PRESET_REQUIRED_FIELD_MISSING` | `invalid/angle-required-field-missing.json` | Angleへインポートし、`use12bit`欠落として拒否されることを確認します。 |
| `E_PRESET_REQUIRED_FIELD_MISSING` | `invalid/angle-range-required-field-missing.json` | Angleへインポートし、Rangeの`outMax`欠落として拒否されることを確認します。 |
| `E_PRESET_REQUIRED_FIELD_MISSING` | `invalid/joystick-required-field-missing.json` | Joystickへインポートし、`invertY`欠落として拒否されることを確認します。 |
| `E_PRESET_REQUIRED_FIELD_MISSING` | `invalid/tof-required-field-missing.json` | ToFへインポートし、`nearValueHigh`欠落として拒否されることを確認します。 |
| `E_PRESET_FIELD_TYPE_INVALID` | `invalid/root-device-type-name-type-invalid.json` | Keyへインポートし、ルートの`deviceTypeName`がStringではないため拒否されることを確認します。 |
| `E_PRESET_FIELD_TYPE_INVALID` | `invalid/key-mode-type-invalid.json` | Keyへインポートし、`mode`がIntegerではないため拒否されることを確認します。 |
| `E_PRESET_FIELD_TYPE_INVALID` | `invalid/key-press-type-invalid.json` | Keyへインポートし、`press`がArrayではないため拒否されることを確認します。 |
| `E_PRESET_FIELD_TYPE_INVALID` | `invalid/key-message-value-type-invalid.json` | Keyへインポートし、OSC Messageの`value`がStringではないため拒否されることを確認します。 |
| `E_PRESET_FIELD_TYPE_INVALID` | `invalid/key-sequence-address-type-invalid.json` | Keyへインポートし、Sequenceの`address`がStringではないため拒否されることを確認します。 |
| `E_PRESET_FIELD_TYPE_INVALID` | `invalid/encoder-send-increment-type-invalid.json` | Encoderへインポートし、`sendIncrement`がBooleanではないため拒否されることを確認します。 |
| `E_PRESET_FIELD_TYPE_INVALID` | `invalid/angle-use12bit-type-invalid.json` | Angleへインポートし、`use12bit`がBooleanではないため拒否されることを確認します。 |
| `E_PRESET_FIELD_TYPE_INVALID` | `invalid/angle-range-outmax-type-invalid.json` | Angleへインポートし、Rangeの`outMax`がNumberではないため拒否されることを確認します。 |
| `E_PRESET_FIELD_TYPE_INVALID` | `invalid/joystick-invert-y-type-invalid.json` | Joystickへインポートし、`invertY`がBooleanではないため拒否されることを確認します。 |
| `E_PRESET_FIELD_TYPE_INVALID` | `invalid/tof-max-distance-type-invalid.json` | ToFへインポートし、`maxDistanceMm`がIntegerではないため拒否されることを確認します。 |
| `E_OSC_TYPE_INVALID` | `invalid/key-message-type-invalid.json` | Keyへインポートし、OSC Messageの未対応`type: 9`として拒否されることを確認します。 |
| `E_OSC_TYPE_INVALID` | `invalid/key-sequence-type-invalid.json` | Keyへインポートし、Sequenceの未対応`type: 9`として拒否されることを確認します。 |
| `E_OSC_TYPE_INVALID` | `invalid/encoder-range-type-invalid.json` | Encoderへインポートし、Rangeの未対応`type: 9`として拒否されることを確認します。 |
| `E_OSC_TYPE_INVALID` | `invalid/tof-range-string-type-invalid.json` | ToFへインポートし、数値出力で使用できないStringの`type: 2`として拒否されることを確認します。 |
| `E_PRESET_DEVICE_SETTING_INVALID` | `invalid/key-mode-out-of-range.json` | Keyへインポートし、`mode: 2`が許可範囲（0または1）外として拒否されることを確認します。 |
| `E_PRESET_DEVICE_SETTING_INVALID` | `invalid/encoder-click-mode-out-of-range.json` | Encoderへインポートし、`clickMode: 2`が許可範囲（0または1）外として拒否されることを確認します。 |
| `E_PRESET_DEVICE_SETTING_INVALID` | `invalid/encoder-number-out-of-range.json` | Encoderへインポートし、有限のfloat32へ変換できない`incrementScale`として拒否されることを確認します。 |
| `E_PRESET_DEVICE_SETTING_INVALID` | `invalid/angle-deadband-out-of-range.json` | Angleへインポートし、`deadband: 0`が許可範囲（1以上）外として拒否されることを確認します。 |
| `E_PRESET_DEVICE_SETTING_INVALID` | `invalid/joystick-deadband-out-of-range.json` | Joystickへインポートし、`deadband: 255`が許可範囲（1～254）外として拒否されることを確認します。 |
| `E_PRESET_DEVICE_SETTING_INVALID` | `invalid/joystick-click-mode-out-of-range.json` | Joystickへインポートし、`clickMode: 2`が許可範囲（0または1）外として拒否されることを確認します。 |
| `E_PRESET_DEVICE_SETTING_INVALID` | `invalid/tof-deadband-out-of-range.json` | ToFへインポートし、`deadband: 0`が許可範囲（1～2000）外として拒否されることを確認します。 |
| `E_PRESET_DEVICE_SETTING_INVALID` | `invalid/tof-max-distance-out-of-range.json` | ToFへインポートし、`maxDistanceMm: 30`が許可範囲（31～2000）外として拒否されることを確認します。 |

## Legacy Type移行

| fixture | 試験条件 |
| --- | --- |
| `valid/legacy-key-sequence-type-migration.json` | Keyへインポートし、旧形式の範囲外Sequence TypeがFloatへ移行され、設定が保存されることを確認します。 |
| `valid/legacy-tof-string-type-migration.json` | ToFへインポートし、旧形式のString出力TypeがFloatへ移行され、設定が保存されることを確認します。 |
| `E_PRESET_FILE_TOO_LARGE` | `invalid/key-file-too-large.json` | そのままインポートします。ファイルは16 KiBを超えています。JSON解析より前にサイズ超過として拒否されることを確認します。 |
| `E_OSC_ADDRESS_INVALID` | `invalid/key-address-without-slash.json` | Keyへインポートし、先頭が`/`でないOSC Addressとして拒否されることを確認します。 |
| `E_SEQUENCE_REQUIRED_FIELD_MISSING` | `invalid/key-sequence-required-field-missing.json` | Keyへインポートし、Sequenceの`step`欠落として拒否されることを確認します。 |
| `E_SEQUENCE_VALUE_INVALID` | `invalid/key-sequence-value-invalid.json` | Keyへインポートし、有限のfloat32に変換できない`step`として拒否されることを確認します。 |
| `E_PRESET_STORAGE_WRITE_FAILED` | `valid/key-storage-write-candidate.json` | このJSONは正常です。ストレージを満杯、読み取り専用、未マウントなど書き込み不能な状態にしてからKeyへインポートし、検証通過後の保存失敗として確認します。通常状態でこのJSONを読み込むと成功するのが正しい動作です。 |

## 共通確認

エラー時は、画面上の設定、保存済み設定、再起動後の設定、OSC送信内容が変更されていないことも確認します。

`E_PRESET_STORAGE_WRITE_FAILED`はJSONの内容だけでは発生させられません。確実に自動試験する場合は、Importerのストレージ書き込み処理をテストビルドで失敗させるfault injectionを使用してください。
