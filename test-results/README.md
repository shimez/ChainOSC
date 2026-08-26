# ChainOSCシリーズ共通テスト結果

このディレクトリには、[`SERIES_COMPATIBILITY_TEST.md`](../SERIES_COMPATIBILITY_TEST.md)に基づくシリーズ横断テストの結果を保存します。

Device Preset互換テストでは、[`DEVICE_PRESET_RESULT_TEMPLATE.md`](DEVICE_PRESET_RESULT_TEMPLATE.md)をコピーして使用します。

## 結果ファイルの作成

PowerShellで次を実行すると、指定した名前でテンプレートをコピーし、実施日、各製品のバージョン、コミットIDを自動記入します。

```powershell
cd C:\Users\ctake\OneDrive\ChainOSC
.\scripts\new_device_preset_test_result.ps1 -Name 2026-08-27-device-preset-v1
```

`.md`は省略できます。既存ファイルを置き換える場合だけ`-Force`を指定します。

```powershell
.\scripts\new_device_preset_test_result.ps1 -Name 2026-08-27-device-preset-v1.md -Force
```

既定では、現在のOneDrive構成にある次のリポジトリを参照します。

- `Arduino\M5ChainOSC`
- `Arduino\ChainOSCmini`
- `Arduino\ChainOSCnano`
- `Arduino\ChainOSCPad`
- `ChainOSC-for-Windows`

別の場所にcloneしている場合は、対応する`-M5ChainOSCPath`、`-ChainOSCminiPath`、`-ChainOSCnanoPath`、`-ChainOSCPadPath`、`-ChainOSCWindowsPath`を指定できます。

未コミット変更があるリポジトリは、コミットIDの後ろに`+ local changes`と記録されます。

## ファイル名

```text
YYYY-MM-DD-device-preset-v1.md
```

同日に複数の組み合わせを試験する場合は、末尾に識別子を追加します。

```text
YYYY-MM-DD-device-preset-v1-release-candidate.md
```

## 記録方針

- 製品名だけでなく、バージョンと可能ならコミットIDを記録する
- 使用したfixtureはリポジトリ内の相対パスで記録する
- `PASS`、`FAIL`、`N/A`、`BLOCKED`のいずれかを使用する
- `FAIL`には再現手順、実際の表示、設定が変化したかどうかを記録する
- シリアルログやパケットキャプチャが大きい場合は、IssueやRelease artifactへのリンクを記録する
- 再エクスポートしたJSONを保存する場合は、認証情報や個人情報が含まれていないことを確認する
- テスト完了後もテンプレート自体は変更せず、実施結果を別ファイルとして追加する

## リリースとの関係

互換形式、Importer、Exporter、OSC値検証を変更したリリースでは、該当する結果ファイルをリリース判断の根拠として残します。変更のないパッチリリースでは、影響範囲に対応する行だけを再試験しても構いません。
