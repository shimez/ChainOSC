# ChainOSC Device Preset JSON Format v3

この文書は現行4製品が出力するSequence対応Device Presetの正規contractを定義します。`schemaVersion`はPresetが使うJSON contractの世代であり、firmware versionでもDevice Typeごとの改版回数でもありません。全種類が全世代を経由する必要はありません。UID、Device Name、接続ポート、Windows hotkey等のインポート先固有情報はPresetに含めません。

## 現行Exportと世代

| Device Type | ID | 現行Export | 対応製品 |
| --- | ---: | ---: | --- |
| Encoder | 1 | v3 | M5ChainOSC / ChainOSCmini / ChainOSCnano / ChainOSCPad |
| Angle | 2 | v1 | M5ChainOSC / ChainOSCmini / ChainOSCnano |
| Key | 3 | v3 | M5ChainOSC / ChainOSCmini / ChainOSCnano / ChainOSCPad |
| Joystick | 4 | v3 | M5ChainOSC / ChainOSCmini / ChainOSCnano |
| ToF | 5 | v1 | M5ChainOSC / ChainOSCmini / ChainOSCnano |

Padが対応するDevice TypeはKey/Encoderだけです。Angle/ToFはv3を出力せず、[`DEVICE_PRESET_FORMAT_V1.md`](DEVICE_PRESET_FORMAT_V1.md)のv1形式を使います。

- **v1:** 基本Device Preset contract（Key/Encoder Legacy/Angle/Joystick/ToF）。
- **v2:** Encoder v2回転のAmount/DirectionとPushを表現するcapability。現行実装でv2を使う種類はEncoderですが、schema番号が「Encoder固有の版」を意味するわけではありません。Rotation Resetもv2へ追加されたcapabilityです。
- **v3:** SequenceのLoop/Ping-Pong選択を記録する`progressionMode`を追加。KeyとJoystickはv1→v3、Encoderはv1→v2→v3です。Encoder Legacy回転もEncoder v2回転もv3のPresetになります。

旧v1/v2ファイルは対応する現行Importerで読み込めます。v3はPing-Pong導入前のfirmwareでは通常未対応です。Preset importは全体設定のJSON importとは別です。

## Headerと共通値

```json
{
  "format": "ChainOSC-device-preset",
  "schemaVersion": 3,
  "deviceType": 3,
  "deviceTypeName": "Key"
}
```

`format`と`deviceTypeName`はJSON String、`schemaVersion`と`deviceType`はJSON Integerです。`deviceTypeName`は上表のIDに一致させます。この短縮header自体は有効なPresetではなく、対応する`key`、`encoder`または`joystick`オブジェクトが必要です。JSONのproperty順と空白に意味はありません。

OSC Typeは0=Float（有限なOSC float32）、1=Int（OSC int32）、2=String。OSC Addressは`/`で始まる192 UTF-8 bytes以下のStringで、空白および`# * , ? [ ] { }`を含めません。メッセージは`{"address":"/example","value":"1","type":1}`（`value`は128 UTF-8 bytes以下のString）。Press/Release合計8件以下。詳細なOSC値の検証とEncoder回転意味論は[`DEVICE_PRESET_FORMAT_V1.md`](DEVICE_PRESET_FORMAT_V1.md)と[`DEVICE_PRESET_FORMAT_V2.md`](DEVICE_PRESET_FORMAT_V2.md)を参照してください。

## Sequence v3

```json
{"address":"/example/sequence","type":1,"start":0,"end":3,"step":1,"progressionMode":1}
```

`address`、`type`、`start`、`end`、`step`は必須。`start`、`end`、`step`は有限なfloat32として表現できるJSON Number。`step`は0以外、StartからEndへ向かう符号を使用します。`start == end`は有効です。`progressionMode`は0=Loop、1=Ping-PongのJSON Integerです。存在する場合に0/1以外、文字列や範囲外の値はImporterが拒否します。**旧Presetでfieldが欠落した場合はLoop**として読み込みます。現行4製品のv3正規Exportは設定中のmodeを常に明示します。`mode`、`clickMode`または`pushMode`がPress/Release等でも、Sequence設定を持てる種類はv3でExportし、その`sequence` objectにmodeを含めます。

現在の位置`current`と折返し方向`direction`はruntime-onlyであり、Presetにも保存設定にも含めません。開始値は`start`、方向はForwardです。再起動・保存・Import・再接続のreset timingは製品固有です。

### Ping-Pongの送信順

押下ごとに現在値を一度送信し、次回値を計算します。端点を実際に送信し、同じ端点を連続して二重送信しません。端点に到達・通過する場合はその端点に正確にclampし、折り返します。行き過ぎた量（overshoot remainder）は繰り越しません。下降方向も対称です。

```text
Start=0, End=3, Step=1:  0 → 1 → 2 → 3 → 2 → 1 → 0 → …
Start=0, End=10, Step=3: 0 → 3 → 6 → 9 → 10 → 7 → 4 → 1 → 0 → …
Start=10, End=0, Step=-3: 10 → 7 → 4 → 1 → 0 → 3 → 6 → 9 → 10 → …
Start=0, End=10, Step=20: 0 → 10 → 0 → 10 → …
Start=End=5:           5 → 5 → 5 → …
```

Loop (`progressionMode=0`)は旧来の進行規則を維持します。例えばStart=0、End=10、Step=3は`0 → 3 → 6 → 9 → 0 → …`で、Ping-Pongの端点clampをLoopへ適用しません。OSC Float/Int/Stringへの変換も既存製品の扱いを変更しません。

## Device Type別JSON形状

以下は完全な構造例です。個別の値域・rotation semanticsはv1/v2仕様、機械可読なフィールド制約は[`schemas/chainosc-device-preset-v3.schema.json`](schemas/chainosc-device-preset-v3.schema.json)を参照してください。

### Key (ID 3)

```json
{
  "format":"ChainOSC-device-preset","schemaVersion":3,"deviceType":3,"deviceTypeName":"Key",
  "key":{"mode":1,"press":[],"release":[],"sequence":{"address":"/example/key","type":1,"start":0,"end":3,"step":1,"progressionMode":1}}
}
```

`key.mode`は0=Press/Release、1=Sequence。`press`/`release`および`sequence`はmodeにかかわらず存在します。

### Encoder (ID 1): Legacy rotation shape

```json
{
  "format":"ChainOSC-device-preset","schemaVersion":3,"deviceType":1,"deviceTypeName":"Encoder",
  "encoder":{"rotationAddress":"/example/encoder/rotation","sendIncrement":false,"wrapAround":false,"absoluteInputMin":0,"absoluteInputMax":20,"incrementScale":0.05,"range":{"outMin":0,"outMax":1,"type":0},"clickMode":1,"press":[],"release":[],"sequence":{"address":"/example/encoder/push","type":1,"start":0,"end":3,"step":1,"progressionMode":1}}
}
```

Legacy形状の`sendIncrement`、`absoluteInputMin/Max`、`incrementScale`、`range`、`clickMode`はv1と同じ意味です。`wrapAround`はオプションです。v3というヘッダーだけでrotation modelがv2に変わるわけではありません。

### Encoder (ID 1): v2 Amount / Direction rotation shapes

```json
{
  "format":"ChainOSC-device-preset","schemaVersion":3,"deviceType":1,"deviceTypeName":"Encoder",
  "encoder":{"rotationAddress":"/example/encoder/rotation","rotationMode":"amount","rangeSteps":20,"wrap":false,"clockwiseIncreases":true,"outputMin":0,"outputMax":1,"outputType":0,"pushMode":1,"press":[],"release":[],"sequence":{"address":"/example/encoder/push","type":1,"start":0,"end":3,"step":1,"progressionMode":1}}
}
```

```json
{
  "format":"ChainOSC-device-preset","schemaVersion":3,"deviceType":1,"deviceTypeName":"Encoder",
  "encoder":{"rotationAddress":"/example/encoder/rotation","rotationMode":"direction","clockwiseValue":1,"counterClockwiseValue":-1,"outputType":1,"pushMode":0,"press":[],"release":[],"sequence":{"address":"/example/encoder/push","type":1,"start":0,"end":3,"step":1,"progressionMode":0}}
}
```

`rotationMode`があるv3 Encoderはv2回転形状で解釈します。Amountの`rangeSteps`/`wrap`/`clockwiseIncreases`/`outputMin`/`outputMax`と、Directionの`clockwiseValue`/`counterClockwiseValue`は互いに排他的です。`outputType`は0/1/2。Directionの値はそれぞれNumber/Integer/Stringとして型を合わせます。`pushMode`は0=Press/Release、1=Sequence、2=Rotation Reset。2の場合のみ`resetValue`を設定します（Amountなら範囲内のNumber、Directionなら`outputType`と一致する型）。v2仕様の検証を維持し、Sequenceにv3 fieldを追加します。

### Joystick (ID 4)

```json
{
  "format":"ChainOSC-device-preset","schemaVersion":3,"deviceType":4,"deviceTypeName":"Joystick",
  "joystick":{"xAddress":"/example/x","yAddress":"/example/y","deadband":3,"invertX":false,"invertY":true,"range":{"outMin":-1,"outMax":1,"type":0},"clickMode":1,"press":[],"release":[],"sequence":{"address":"/example/joystick/click","type":0,"start":0,"end":10,"step":3,"progressionMode":1}}
}
```

Joystick Clickの`clickMode`は0=Press/Release、1=Sequenceです。PadにはJoystick presetのImport先がありません。Angle/ToF用のv3 JSON例は定義しません。

## Import互換性と検証資産

現行4製品ではv1（対応Type）、v2（Encoder）、v3（Sequence-capableな対応Type）を受理します。v1/v2のSequenceに`progressionMode`がない場合はLoopです。新しいv3は旧firmwareに無理に読み込ませず、対応firmwareを使ってください。例と境界条件は[`test-data/device-presets-v3/`](test-data/device-presets-v3/)、シリーズの試験項目は[`SERIES_COMPATIBILITY_TEST.md`](SERIES_COMPATIBILITY_TEST.md)を参照してください。
