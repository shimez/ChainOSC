# ChainOSCシリーズ共通回帰テスト

この文書は、ChainOSCシリーズで共通する仕様の互換性と回帰動作を確認するためのテスト仕様です。

製品固有のGPIO、画面、LED、Chainポート、タスクトレイなどの試験は、各製品リポジトリのテスト文書を併用してください。

## 対象製品

- M5ChainOSC
- ChainOSCmini
- ChainOSCnano
- ChainOSCPad
- ChainOSC for Windows

## 適用範囲

| 項目 | M5ChainOSC | ChainOSCmini | ChainOSCnano | ChainOSCPad | Windows |
| --- | --- | --- | --- | --- | --- |
| Key Press / Release | 対象 | 対象 | 対象 | 対象 | 対象 |
| Key Sequence | 対象 | 対象 | 対象 | 対象 | 対象 |
| Keyプリセット互換 | 対象 | 対象 | 対象 | 対象 | 対象 |
| Encoder | 対象 | 対象 | 対象 | 対象 | 対象外 |
| Angle | 対象 | 対象 | 対象 | 対象外 | 対象外 |
| ToF | 対象 | 対象 | 対象 | 対象外 | 対象外 |
| Joystick | 対象 | 対象 | 対象 | 対象外 | 対象外 |
| Wi-Fi／Web UI | 対象 | 対象 | 対象 | 対象 | 対象外 |
| 全体設定JSON | 製品固有形式 | 製品固有形式 | 製品固有形式 | 製品固有形式 | 製品固有形式 |

全体設定JSONは製品間互換ではありません。デバイス単位の`ChainOSC-device-preset`だけを互換対象とします。

デバイスプリセットの現行Exporter正規出力は[`DEVICE_PRESET_FORMAT_V1.md`](DEVICE_PRESET_FORMAT_V1.md)で定義し、[`schemas/chainosc-device-preset-v1.schema.json`](schemas/chainosc-device-preset-v1.schema.json)とcanonical fixtureを基準に確認します。Importerの旧形式対応は、この正規出力仕様とは分けて扱います。

## テスト結果の記録

実施結果は[`test-results/`](test-results/)へ保存します。Device Preset互換テストでは、[`test-results/DEVICE_PRESET_RESULT_TEMPLATE.md`](test-results/DEVICE_PRESET_RESULT_TEMPLATE.md)をコピーして使用してください。

推奨ファイル名:

```text
test-results/YYYY-MM-DD-device-preset-v1.md
```

テスト開始時に次を記録します。

```text
実施日:
実施者:
M5ChainOSC:
ChainOSCmini:
ChainOSCnano:
ChainOSCPad:
ChainOSC for Windows:
OSC受信環境:
使用ブラウザー:
使用したChainデバイスとUID:
備考:
```

結果には次の記号を使用します。

- `PASS`: 期待結果を満たした
- `FAIL`: 期待結果を満たさなかった
- `N/A`: 製品の適用範囲外
- `BLOCKED`: 環境や機材が不足して実施できなかった

`FAIL`と`BLOCKED`には、対象バージョン、再現手順、ログ、使用JSONを記録します。

## 事前条件

- 各製品へテスト対象ビルドを書き込む、またはインストールする
- ハードウェア製品は2.4 GHz帯の信頼できるローカルネットワークへ接続する
- OSC受信側でAddress、型、値、受信順を確認できるようにする
- テスト前に各製品の全体設定JSONをバックアップする
- プリセット試験用として、同じ種類のデバイスを可能なら2台用意する
- シリアルログが必要な試験では115200 bpsで記録する
- 共通JSON試験では`test-data/README.md`に記載したフィクスチャを使用する

## 1. 基本スモークテスト

### SERIES-SMOKE-01 起動

1. 製品を起動します。
2. 設定画面を開きます。
3. OSC送信先を確認します。

期待結果:

- 異常終了や再起動を繰り返さない
- 設定画面を表示できる
- 保存済み設定が復元される
- 製品名とバージョンを確認できる

### SERIES-SMOKE-02 OSC送信

1. Keyを1回押して離します。
2. OSC受信側を確認します。

期待結果:

- 押した時と離した時のメッセージが各1回送信される
- Address、型、値が設定と一致する
- 同じイベントが重複送信されない

## 2. Key共通仕様

以下は5製品すべてで実施します。

### SERIES-KEY-01 Press / Release

1. KeyをPress / Releaseモードにします。
2. 押した時に`Int`、`Float`、`String`を設定します。
3. 離した時にも別の`Int`、`Float`、`String`を設定します。
4. Keyを押して離します。

期待結果:

- 各メッセージが設定順に送信される
- OSC型と値が設定どおりである
- 押している間に離した時のメッセージが送信されない

### SERIES-KEY-02 メッセージ件数

1. PressとReleaseの合計を8件にします。
2. 9件目を追加します。
3. 保存して再起動します。

期待結果:

- 合計8件まで設定できる
- 9件目は追加できない、または保存時に拒否される
- 8件の内容と順序が再起動後も維持される

### SERIES-KEY-03 追加・削除・並べ替え

1. メッセージを複数追加します。
2. 順序を変更します。
3. 1件削除して保存します。
4. Keyを操作し、再起動後にも再度操作します。

期待結果:

- 画面の並びと送信順が一致する
- 削除したメッセージは送信されない
- 保存後と再起動後で結果が変わらない

### SERIES-KEY-04 0件

1. 押した時または離した時のメッセージを0件にします。
2. Keyを操作します。

期待結果:

- 0件にしたイベントではOSCを送信しない
- 反対側のイベント設定には影響しない

### SERIES-KEY-05 Sequence増加

設定値:

```text
Start = 0
End   = 3
Step  = 1
Type  = Int
```

期待結果:

- 押すたびに`0 → 1 → 2 → 3 → 0`の順で送信される
- 離した時には送信せず、値も進まない
- 再起動後はStartから始まる

### SERIES-KEY-06 Sequence減少

設定値:

```text
Start = 3
End   = 0
Step  = -1
Type  = Float
```

期待結果:

- 押すたびに`3 → 2 → 1 → 0 → 3`の順で送信される
- Floatとして送信される
- 不正な方向のStepや0のStepは保存またはインポート時に拒否される

### SERIES-KEY-07 未保存表示と保存

1. Key設定を変更します。
2. 未保存表示を確認します。
3. 設定を保存します。

期待結果:

- 変更後に未保存であることを確認できる
- 保存後に未保存表示が消える
- 保存操作によって意図しないページ遷移や設定消失が起きない

## 3. Keyプリセット相互互換

### SERIES-PRESET-KEY-01 エクスポート構造

各製品からKeyプリセットをエクスポートします。

期待結果:

- `format`が`ChainOSC-device-preset`である
- 対応する`schemaVersion`を含む
- `deviceType`がKeyを示す
- UID、ローカルのデバイス名、Windowsのホットキーを含まない
- Press / Release、Sequence、OSC型と値を保持する
- v1 JSON Schemaに適合し、canonical Key fixtureと同じ必須項目と型を持つ

### SERIES-PRESET-KEY-02 相互インポート

次の経路を順に確認します。

```text
M5ChainOSC → ChainOSCmini
ChainOSCmini → ChainOSCnano
ChainOSCnano → ChainOSCPad
ChainOSCPad → ChainOSC for Windows
ChainOSC for Windows → M5ChainOSC
```

期待結果:

- 各製品でインポートできる
- インポート直後に画面へ反映される
- 保存後と再起動後に設定が維持される
- 各製品固有のUID、名前、ホットキーを不必要に上書きしない
- OSC送信結果が元の製品と一致する

## 4. Chainデバイスプリセット互換

EncoderはM5ChainOSC、ChainOSCmini、ChainOSCnano、ChainOSCPadで実施します。Angle、ToF、JoystickはM5ChainOSC、ChainOSCmini、ChainOSCnanoで実施します。

各デバイス種類について、次の経路を確認します。

```text
M5ChainOSC → ChainOSCmini → ChainOSCnano → M5ChainOSC
```

EncoderだけはChainOSCPadを含む次の経路で確認します。

```text
M5ChainOSC → ChainOSCmini → ChainOSCnano → ChainOSCPad → M5ChainOSC
```

### SERIES-PRESET-ENC-01 Encoder

確認項目:

- Absolute／Increment
- Absolute Input Min／Max
- Increment Scale
- Out Min／Max
- Float／Int／String
- クリックのPress / Release、Sequence、合計8件
- 再起動、抜き差し後の復元

### SERIES-PRESET-ANGLE-01 Angle

確認項目:

- 8-bit／12-bit
- Deadband
- Out Min／Max
- Float／Int／String
- 再起動、抜き差し後の復元

### SERIES-PRESET-TOF-01 ToF

確認項目:

- Maximum Distance
- Deadband
- 近づけると値が大きくなる／小さくなる
- Out Min／Max
- Float／Int
- 有効範囲外でOSC送信を停止する
- 再起動、抜き差し後の復元

### SERIES-PRESET-JOY-01 Joystick

確認項目:

- X／Y OSC Address
- Deadband
- Invert X／Invert Y
- Out Min／Max
- Float／Int／String
- クリックのPress / Release、Sequence、合計8件
- 再起動、抜き差し後の復元

期待結果は全デバイス共通です。

- UIDとデバイス名を含まない
- 同じ種類のデバイスへインポートできる
- 異なる種類のデバイスへのインポートは拒否される
- エクスポート元とインポート先で設定値とOSC送信結果が一致する

## 5. JSON入力検証

### SERIES-JSON-01 不正ファイル

次を全製品で確認します。

- 空ファイル
- JSONとして破損したファイル
- 異なる`format`
- 未対応の`schemaVersion`
- 全体設定JSONをデバイスプリセットとして選択
- デバイスプリセットを全体設定として選択

期待結果:

- 理由を示すエラーが表示される
- 既存設定が変更されない
- 再起動後も既存設定が維持される

### SERIES-JSON-02 不正なKey設定

次を含むプリセットを試します。

- `/`で始まらないOSC Address
- 上限を超えるAddressまたはValue
- 不正なInt／Float
- OSC int32の下限未満／上限超過
- FloatのNaN、Infinity、float32変換時のオーバーフロー
- PressとReleaseの合計9件以上
- SequenceのStart／End／Stepの不整合

期待結果:

- 全製品で拒否される
- 可能な限り原因が同等の内容で表示される
- 一部だけが保存されることはない
- Intは`-2147483648`～`2147483647`を受け入れ、その範囲外を拒否する
- Floatは有限なfloat32として送信でき、非有限値を拒否する

### SERIES-JSON-03 容量境界

ハードウェア製品では、32 KiB以下の有効な全体設定JSONと、32 KiBを超えるJSONを確認します。

期待結果:

- 上限内の有効JSONをインポートできる
- 上限超過ファイルは設定を変更せず拒否される
- エラー後もWeb UIとOSC送信が継続する

## 6. Wi-Fi切断と復旧

この章はハードウェア4製品で実施します。

### SERIES-WIFI-01 起動時に保存済みAPが停止

1. 保存済みAPを停止した状態で起動します。
2. 接続タイムアウトまで待ちます。

期待結果:

- 接続タイムアウト後にAP Modeへ移行する
- セットアップSSIDへ接続できる
- キャプティブポータルまたは`192.168.4.1`で設定できる

### SERIES-WIFI-02 接続後にAPを停止

1. 通常接続後にAPを停止します。
2. 切断中にKeyを操作します。
3. Sequenceを複数回押します。
4. APを復旧します。

期待結果:

- Reconnecting状態になり、AP Modeへ移行しない
- 切断中はOSCを送信しない
- 切断中はSequenceの値が進まない
- 再起動せず自動再接続する
- 復旧後は切断前の次のSequence値から再開する

### SERIES-WIFI-03 Wi-Fi設定削除

期待結果:

- 確認後にWi-Fi認証情報だけが削除される
- 再起動後にAP Modeへ戻る
- OSC送信先とデバイス設定は保持される

## 7. UID、抜き差し、保存済みデバイス

この章はChainデバイスを接続するM5ChainOSC、ChainOSCmini、ChainOSCnanoで実施します。

### SERIES-DEVICE-01 UID復元

1. 複数デバイスへ異なる設定を保存します。
2. 抜き差し、接続順変更を行います。
3. miniでは左右のポート間も移動します。

期待結果:

- UIDごとの設定が復元される
- 接続順やデバイスIDへ誤って設定が移らない
- 接続中と未接続を区別できる

### SERIES-DEVICE-02 保存済み設定の削除

1. デバイスを取り外します。
2. 未接続の保存済み設定を削除します。
3. 同じデバイスを再接続します。

期待結果:

- 接続中デバイスには削除操作を表示しない
- 未接続設定だけを削除できる
- 再接続後は初期設定になる
- 他のUIDの設定へ影響しない

### SERIES-DEVICE-03 Identify Device

期待結果:

- 選択したデバイスだけが10秒間オレンジになる
- 複数デバイス接続時に別のデバイスが点灯しない
- 10秒後に通常の状態色へ戻る

## 8. 全体設定バックアップ

全体設定JSONは製品固有形式のため、同一製品内だけで確認します。

### SERIES-BACKUP-01 ラウンドトリップ

1. 全体設定をエクスポートします。
2. 複数の設定を変更します。
3. エクスポートしたファイルをインポートします。
4. 再起動します。

期待結果:

- OSC送信先、UI言語、デバイス設定が復元される
- Wi-FiのSSIDとパスワードをJSONへ含めない
- 再起動後も復元結果が維持される
- インポート件数または結果を利用者が確認できる

### SERIES-BACKUP-02 旧バージョンからの移行

後方互換性を変更した製品で実施します。

1. 公開済み旧バージョンで設定とJSONを作成します。
2. 新バージョンへ更新します。
3. 自動読込と旧JSONインポートを確認します。
4. 編集して新形式で保存します。
5. 再起動します。

期待結果:

- 公開済み旧バージョンの設定を失わない
- 新形式への保存後も全設定を復元できる
- 移行失敗時に既存設定を破壊しない

## 9. 保存容量と耐久性

保存容量はデバイス種類と文字列長で変化するため、単純な台数だけを全製品共通の保証上限にはしません。

### SERIES-STORAGE-M5-01 M5ChainOSC

- 40件の全体設定JSONをインポート、再保存、再起動後に復元する
- 上限超過JSONを拒否し、既存設定を維持する
- 保存、削除、再登録を繰り返してNVS残量と再起動の有無を確認する
- 公開済み旧保存形式からの移行を確認する

### SERIES-STORAGE-MINI-01 ChainOSCmini

- 実際に利用する複数種類・複数台の設定を一括保存する
- 全体設定のエクスポート、削除、再インポートを繰り返す
- 操作前後で空きHeapが継続的に減少しないことを確認する

### SERIES-STORAGE-NANO-01 ChainOSCnano

- 現時点で確認済みの基準負荷として20件を保存、再保存、再起動後に復元する
- 20件状態で全体設定をエクスポートし、再インポートする
- 20件状態でOSC送信とWeb UIを継続利用する
- 最大文字列・複数メッセージ・デバイス種類を混在させた境界試験は、別途試験データを固定して実施する

20件は現在の確認済み基準負荷であり、すべての設定内容に対する保証上限とは定義しません。

### SERIES-STORAGE-PAD-01 ChainOSCPad

- Key 1～12とEncoderへ最大8メッセージを含む設定を保存する
- 全体設定のエクスポート、変更、再インポート、再起動後の復元を確認する
- XIAO ESP32S3とXIAO ESP32C6の両方でLittleFSへの保存と読み戻しを確認する
- 保存中断や不正JSONの後も、既存設定を維持する

### SERIES-STRESS-01 連続動作

ハードウェア製品で次を実施します。

- Web UIを繰り返し開く
- JSONのエクスポート／インポートを繰り返す
- Chainデバイスを繰り返し抜き差しする
- Wi-Fi切断／復旧を繰り返す
- Keyと各センサーを継続操作する
- 数時間以上連続稼働する

期待結果:

- 意図しない再起動が発生しない
- Web UIの応答が時間経過で悪化し続けない
- 空きHeapが単調に減少し続けない
- 設定、UID対応、OSC送信が壊れない

## 10. Chain通信レイテンシー計測

この章は診断ビルドで実施する計測項目です。現時点では共通の合否閾値を定めません。

記録対象:

```text
Key read:      average / maximum / timeout count
Encoder read:  average / maximum / timeout count
Angle read:    average / maximum / timeout count
ToF read:      average / maximum / timeout count
Joystick read: average / maximum / timeout count
Main loop:     average / maximum
```

次の状態を分けて記録します。

- 正常接続
- デバイス取り外し直後
- 複数デバイス接続
- 応答しないデバイスが存在する状態
- ToFを含む状態と含まない状態

計測結果から実用上の問題が確認された場合だけ、ポーリング間隔、ラウンドロビン化、タイムアウト値の変更を検討します。

## 11. 製品固有テストへの参照

- M5ChainOSC: 画面表示、画面回転、OSC送信表示、NVS移行を追加確認する
- ChainOSCmini: DualKey本体キー、左右Chainポート、右側Joystick軸補正を追加確認する
- ChainOSCnano: M5NanoC6本体ボタン、4 MB Flash、PSRAMなし、本体LEDを追加確認する
- ChainOSCPad: 12キーのマトリクス、Encoder、XIAO ESP32S3／ESP32C6、LittleFS保存を追加確認する
- ChainOSC for Windows: グローバルホットキー、重複検証、タスクトレイ、サインイン時起動、単一起動を追加確認する

mini、nano、Padについては、それぞれのリポジトリにあるテスト文書も実施します。

## 12. リリース判定の目安

### パッチリリース

- 基本スモークテスト
- 変更箇所に対応する共通テスト
- 変更製品の固有テスト
- 互換形式を変更した場合は相互インポート

### マイナー／メジャーリリース

- 適用可能な共通テスト一式
- 変更製品の固有テスト一式
- 全体設定のラウンドトリップ
- 公開済み旧バージョンからの更新試験
- 保存形式変更時は容量・移行試験
- Web Installerまたは配布バイナリによる最終確認

## 13. 結果サマリー

```text
基本スモーク:
Key共通仕様:
Keyプリセット互換:
Chainデバイスプリセット互換:
JSON入力検証:
Wi-Fi切断と復旧:
UIDと保存済みデバイス:
全体設定バックアップ:
保存容量と耐久性:
製品固有テスト:

未解決事項:
リリース可否:
```
