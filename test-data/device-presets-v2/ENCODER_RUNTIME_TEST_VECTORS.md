# Encoder v2共通ランタイムテストベクトル

[`encoder-runtime-vectors.json`](encoder-runtime-vectors.json)は、M5ChainOSC、ChainOSCmini、
ChainOSCnano、ChainOSCPadが同じEncoder v2意味論を持つことを確認するための正本です。

## 実行方法

各製品の純粋なEncoder演算へ、各caseの`settings`、`initialState`、`events`を順番に渡し、
イベントごとの状態とOSC送信結果が`expected`へ一致することを確認します。

- Floatは`numericTolerance`以内で比較します。
- Stringは完全一致で比較します。
- `send:false`ではOSCパケットを生成しません。
- `logicalPosition`、`rawBaseline`、`baselineValid`も期待状態へ含めます。
- `continuityLost`はraw counterの連続性喪失を示し、論理位置を消去しません。
- `replaceIdentity`は異なる論理Encoderへの交換を示します。

製品固有のGPIO、UART、Chain APIはテストベクトルへ含めません。物理入力を`delta`または
`rawSample`へ変換する部分は製品側の別テスト対象です。

