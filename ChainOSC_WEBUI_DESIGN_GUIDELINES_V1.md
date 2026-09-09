# ChainOSC WebUI Design Guidelines v1

Status: Draft — Key / Encoder Fixed
Language: Japanese  
Initial Reference Implementation: ChainOSCPad Encoder WebUI

## 1. Purpose

本書は、ChainOSCシリーズのWebUIで人間による確認を経て受け入れられた視覚設計を記録し、以後の実装で意図しない再設計が行われることを防ぐためのDesign Guidelinesである。

本書は新しい画面を設計するための一般的なUIテンプレートではない。既に受け入れられた実装から観測できる規則を抽出したものであり、Device Preset、runtime、保存、validation、Migrationの製品semanticsを定義しない。

## 2. Scope

本版は次の3分類を扱う。

- **Common**: 現時点でシリーズ共通のUX/design原則として扱える規則
- **Key — Fixed**: ChainOSCPad Key WebUIで受け入れ済みの具体的な視覚・操作規則
- **Encoder — Fixed**: ChainOSCPad Encoder WebUIで受け入れ済みの具体的な視覚・操作規則
- **UNSPECIFIED**: 本版ではDevice固有UIが未確定の領域

KeyおよびEncoderはFixed Reference UIであるが、他のDeviceの万能テンプレートではない。

## 3. Normative Language

- **MUST / SHALL**: 必須。準拠実装は従わなければならない。
- **SHOULD**: 原則として従う。逸脱には具体的な理由が必要である。
- **MAY**: 任意。製品要件に応じて採用できる。
- **UNSPECIFIED**: 本書では未規定。既存のFixed UIから推測して決定してはならない。
- **Fixed**: 人間による評価を経て受け入れられ、明示的な変更要求なしに視覚的再設計をしてはならない状態。

本文中の「〜すること」「〜しなければならない」「〜してはならない」は、特記がない限りMUST / SHALL相当のnormative requirementとして扱う。

## 4. Design Philosophy

1. 情報、設定、操作の階層は、見出し、まとまり、余白、accentによって読み取れること。
2. 視覚上の装飾は、設定内容を理解するためのgroupingを支援し、製品semanticsを新たに暗示しないこと。
3. 永続化済み状態と未保存の編集状態は、ユーザーが誤認しないよう視覚的に区別すること。
4. ユーザー向け説明は、内部実装用語だけでなく、ユーザーが観測する動作を具体的に説明すること。
5. Shared design languageはshared WebUI source codeを要求しない。製品ごとに実装方式が異なっても、同じUX/design ruleへ準拠できる。

## 5. Common Rules

### 5.1 Visual Hierarchy

- ページ、Device、機能section、fieldの階層を見出しとspacingで明確にすること。
- labelは対応する入力欄と一体として読める位置に置くこと。
- 通常設定、注意、破壊的操作、未保存状態を同じ視覚強度で表示してはならない。

### 5.2 Sections and Cards

- `card`という語は、必ずしも影、角丸、浮いたsurfaceを意味しない。
- sectionの視覚表現は、情報のまとまりを示すために使用すること。
- Device固有sectionのaccent色や形状を、根拠なく全Deviceへ一般化してはならない。

### 5.3 Spacing

- 異なる情報階層の間には、同一group内の要素間より明確な余白を設けること。
- Device名の入力欄と、そのDeviceで最初の設定sectionを密着させてはならない。
- Fixed Device UIの具体的spacingは、そのDeviceのFixed規則を優先すること。

### 5.4 Typography

- section headingはfield labelより上位であることが視覚的に分かること。
- 補足説明や状態説明は入力値と誤認されない表現にすること。
- established product termsの表記を画面内で一貫させること。

### 5.5 Form Controls

- labelとcontrolの対応を明確にすること。
- 同一行の同格fieldは、原則として揃った幅と間隔で配置すること。
- narrow screenへの折り返し後も、意味上の順序を維持すること。

### 5.6 Actions and Buttons

- 通常保存、補助操作、キャンセル、Migration、破壊的操作は、役割を区別できる配置と視覚強度にすること。
- Migrationのような明示操作を通常Saveと誤認させてはならない。
- actionは、それが影響する状態説明または設定領域の近くに配置すること。

### 5.7 Status and Warning

- persisted stateとunsaved candidateは識別可能でなければならない。
- warningは対象sectionとの位置関係が明確でなければならない。
- warningは、可能な限りユーザーから観測可能な違いと必要な対応を説明すること。

### 5.8 Responsive Behavior

- responsive layoutはfieldを隠したり、意味上の順序を変更したりしてはならない。
- multi-columnからsingle-columnへ変化する場合も、見出し、状態表示、warning、actionの関係を維持すること。
- Device固有breakpointをシリーズ共通値として推測してはならない。

### 5.9 User-facing Wording

- 内部データ構造名だけで説明を完結させず、ユーザーが実際の動作を想像できる表現を優先すること。
- semanticsが変化する可能性を示す場合は、変更前後のobservable behaviorを具体的に記述すること。
- warningを曖昧な「エラー」や「互換性がありません」だけで終わらせないこと。

### 5.10 Device Card Header

- Device card headerは、Device種別と製品全体で1から始まる連番を同一badgeに`[Type #N]`形式で表示すること。
- Device名はbadgeとは別の要素として表示すること。
- 連番はDevice種別ごとに再開始してはならない。

## 6. Encoder — Fixed Reference UI

### 6.1 Overall Structure

ChainOSCPad Encoder UIは、Device card内に次の順で構成する。

1. Device header、model/status badge、Device menu
2. Device identityおよびImport status
3. デバイス名
4. エンコーダー回転section
5. エンコーダープッシュsection

デバイス名の入力欄とエンコーダー回転sectionの間には **22 px** の上余白を設ける。

### 6.2 Section Treatment

エンコーダー回転とエンコーダープッシュは、浮いた角丸cardとして表現してはならない。

- outer border: なし
- corner radius: **0**
- background: transparent
- external top spacing: **14 px**
- left padding: **12 px**
- left accent width: **5 px**
- heading bottom margin: **14 px**

accentは視覚的groupingに使用する。現行Fixed色は次のとおりである。

- Encoder Rotation: `#fd7e14`（orange）
- Encoder Push: `#20c997`（green）

この2色から「全Deviceに固有色を割り当てる」というCommon ruleを導出してはならない。

### 6.3 Encoder Rotation — Shared Layout

Persisted V2およびV2 Migration Candidateの回転設定は、wide layoutで3-column gridを使用する。

- column: `repeat(3, minmax(0, 1fr))`
- gap: **18 px**
- OSCアドレス: full width、1行目
- モード: full width、2行目
- field alignment: 各columnの上端

OSCアドレスとモードは、HTML上の記述順に依存せず、この表示順を維持しなければならない。

### 6.4 Amount — Fixed

Amountのfield順序は次のとおりとする。

1. `最小値 | 最大値 | 最小値・最大値の先`
2. `範囲ステップ数 | 型 | 回転方向`

次のlabelおよび選択肢表示を、明示指示なしに変更してはならない。

- 最小値
- 最大値
- 最小値・最大値の先
- 範囲ステップ数
- 型
- 回転方向
- `🔄ループする`
- `🛑停止する`
- `↪️反時計回りで大きくなる`
- `↩️時計回りで大きくなる`

### 6.5 Direction — Fixed

Directionの3 fieldは次の順で横一列に配置する。

`↪️ 反時計回りの値 | ↩️ 時計回りの値 | 型`

- `↪️ 反時計回りの値`は既存のcounter-clockwise fieldに対応する。
- `↩️ 時計回りの値`は既存のclockwise fieldに対応する。
- 表示順変更によってfieldの意味や保存先を入れ替えてはならない。
- emoji、label、順序を明示指示なしに変更してはならない。

### 6.6 Encoder Push — Fixed

- Encoder PushはEncoder Rotationとは独立したsectionとして、その直後に配置する。
- sectionは **5 px** のgreen left accentと **12 px** のleft paddingを持つ。
- Push Modeは既存の`押した時／離した時`と`シーケンス`の表示条件を維持する。
- Sequence選択時の説明文は、入力controlではない補足テキストとして表示する。
- Sequence説明は次のobservable behaviorを示す。

  `開始値から増減量ずつ進み、終了値を超えると開始値へ戻ります。`

Pushのfield構成、表示条件、意味は本書では再定義しない。

### 6.7 Persisted Legacy — Fixed

- Encoder headerには、Legacyであることを示すbadgeを表示する。
- Legacy badgeは `background: #fff1d6`、`color: #8a5200` とする。
- Legacy UIはLegacyのfieldを表示し、V2 fieldへ見せかけてはならない。
- `旧形式のエンコーダー設定` blockは、`エンコーダー回転` headingの直下に **14 px** の上余白を挟んで配置する。
- blockは `14 px 16 px` のpadding、`1 px solid #f0c36a` のborder、`9 px` のcorner radius、`#fff9e8` のbackgroundを持つ。
- 通常SaveでLegacyを維持する旨の補足表示を含める。
- `v2設定へ移行する` actionは、このLegacy blockの最下部に配置する。
- Migration actionの上に横罫線を表示してはならない。
- Migration action areaは **14 px** の上余白と上paddingを持つ。

### 6.8 Persisted V2 — Fixed

- Encoder headerにはV2であることを示すbadgeを表示する。
- V2 badgeは `background: #dff5e6`、`color: #176b39` とする。
- Persisted V2では通常のV2 editorを表示し、Migration Candidate用warningやCancel actionを表示してはならない。

### 6.9 Editable V2 Migration Candidate — Fixed

- Encoder headerには、persisted V2と区別できる`v2 candidate` badgeを表示する。
- candidate badgeは `background: #e7e2ff`、`color: #5135a8` とする。
- `v2形式への移行に関する注意事項` blockは、`エンコーダー回転` headingの直下に **14 px** の上余白を挟んで配置する。
- warning blockはLegacy status blockと同じpadding、border、corner radius、backgroundを使用する。
- semantic-difference warningは箇条書きとして表示し、見出しとの関係を保つ。
- confirmation checkboxはlabelと横並びにし、入力controlを通常のfull-width inputとして伸長してはならない。
- `旧形式の設定へ戻る`はcandidate block内の補助actionとして表示する。
- `旧形式の設定へ戻る`はgray (`#64748b`) のbutton treatmentを使用し、primary SaveやMigration開始actionと区別する。
- 未保存candidateをpersisted V2と誤認させる表現を使用してはならない。

現在Fixedされた主要warning文は、内部変換方式ではなくobservable behaviorを説明する。特にLegacy Wrapの差は次のように表示する。

`旧形式のループでは最大値を送信せず最小値に戻りますが、v2では最大値を送信してから最小値に戻ります（動作が変わります）`

Legacy offsetについては次のように表示する。

`旧形式の絶対値入力オフセットはv2回転量では表現されません`

### 6.10 Action Hierarchy

- 通常の`すべての設定を保存`は既存のpage-level Save actionを維持する。
- `v2設定へ移行する`はLegacy status block内の明示的なactionとする。
- `旧形式の設定へ戻る`はcandidate block内のCancel相当の補助actionとする。
- Migration開始actionとCancel actionを、通常Saveと同一の位置・役割として表示してはならない。
- actionの配置規則はUI上の役割だけを規定し、Migration成立条件や永続化semanticsを定義しない。

### 6.11 Responsive Layout

Encoder固有gridのbreakpointは **800 px** とする。

viewport widthが800 px以下の場合:

- V2 Rotation gridは3-columnから1-columnへ変更する。
- Legacy gridは3-columnから1-columnへ変更する。
- full-width指定fieldも通常のsingle columnとして表示する。
- fieldの意味上の順序、label、emoji、status/warning/actionの関係を維持する。

800 pxを超える場合は、6.3から6.5および6.7で規定したwide layoutを使用する。

### 6.12 Interaction and Scroll Behavior

- `v2設定へ移行する`または`旧形式の設定へ戻る`による画面切替後は、`エンコーダー回転`と直下のLegacy/V2 Migration表示がviewport内に入る位置へ自動scrollする。
- 明示的なMigration Save成功後に通常V2表示へ切り替わる場合も、同じ位置へ自動scrollする。
- scroll要求は一度だけ消費し、通常のpage loadで繰り返してはならない。
- scroll実装のために、Migration commandを再実行可能なURL queryとして残してはならない。
- scroll behaviorは視覚的navigationの規則であり、Migrationの製品semanticsを変更してはならない。

## 7. Key — Fixed Reference UI

### 7.1 Overall Structure

- Device header、Device identityおよびImport status、デバイス名、Key設定の順序を維持すること。
- Key設定では`Press / Release`と`Sequence`の既存表示条件および意味を変更してはならない。
- OSC message editorは、OSC Address、Value、Type、Delete actionの対応が明確であること。

### 7.2 Responsive Behavior

- viewportが **800 px以下** の場合、Key設定fieldは意味上の順序を保ったsingle-columnへ折り返すこと。
- wide layoutでは同格fieldを既存の複数column配置で表示すること。
- intermediate widthではOSC message editorを自然に折り返し、Delete actionを2段目右端へ配置すること。
- Desktop、intermediate、Mobileのいずれでも、Device cardまたは入力欄に水平overflowを発生させてはならない。

## 8. Unspecified Device UIs

次のDevice固有layoutは本版では **UNSPECIFIED** である。

### 8.1 Angle

Device-specific layout: UNSPECIFIED

### 8.2 ToF

Device-specific layout: UNSPECIFIED

### 8.3 Joystick

Device-specific layout: UNSPECIFIED

### 8.4 Other Devices

本書でFixedと明記されていないDevice-specific UIはUNSPECIFIEDである。

**UNSPECIFIEDなDevice UIをKeyまたはEncoder layoutから機械的に導出してはならない。** Joystickを同じ3-columnにする、Angleへ同じaccent色を割り当てる、といった決定は本書から導出できない。

## 9. Fixed UI Change Policy

**Existing Fixed UI SHALL NOT be visually redesigned unless explicitly requested.**

明示的な要求なしに、Fixed UIへ次の変更を加えてはならない。

- fieldの並べ替え
- card/section構造の変更
- spacingの変更
- visual hierarchyの変更
- labelまたはemojiの変更
- 新しいvisual styleへの置換
- responsive behaviorの再設計
- `modernize`、`cleanup`、共通化だけを理由とした再設計
- Encoder固有layoutの他Deviceへの一般化

新しい要件がFixed ruleと衝突する場合、実装者は黙って再設計せず、衝突する規則と必要な判断を報告しなければならない。

## 10. Guidelines Evolution Policy

Device固有UIは次の順序で本書へ追加する。

```text
Implementation
     ↓
Real-device / browser evaluation
     ↓
Human acceptance
     ↓
Device UI FIXED
     ↓
Guidelines updated
     ↓
Independent review
     ↓
Guidelines revision FROZEN
```

Device固有の具体的なvisual ruleをCommonへ昇格するのは、原則として複数の受け入れ済み実装などから共有Design Languageである根拠が得られた場合とする。単一Deviceの具体的なlayout、spacing、color、field arrangement等の採用だけを理由にCommon化してはならない。

KeyおよびEncoder固有UIはHuman acceptanceを完了し、Fixed Reference UIとして確定している。本Guidelines v1全体は、UNSPECIFIEDなDevice UIを今後追加・評価するため、Draftとして継続する。

## 11. Reference Implementation

- Product: ChainOSCPad
- Area: Key / Encoder WebUI
- Repository: `shimez/ChainOSCPad`
- Branch: `main`
- Reference Implementation commit: `d2012e18b3c31859e535775ce67d45228f4041e8`
- Physical E2E verification commit: `84db40c03fa77cd4cce5a78ce29d27de49af3d1b`
- Relevant source: `src/network_manager.cpp`
- Verification date: 2026-09-09

Reference Implementation commitは、受け入れ済みのFixed Key / Encoder WebUI、P6 Legacy WebUI／explicit Migration実装、およびPhysical E2E中に受け入れられたwording refinementを含む確定済み実装を指す。

Physical E2E verification commitは、上記Reference Implementationに対して実施したreal-device / browser evaluationの結果およびPASS evidenceを記録したcommitであり、Reference Implementationそのものではない。

## 12. Deliberately Not Specified

本書は次を定義しない。

- Device Preset v1/v2のformatまたはMigration classification
- LegacyからV2へのpromotion成立条件
- Encoder runtime semantics
- 保存transactionまたは永続化形式
- Import/Export behavior
- validation semantics
- Angle、ToF、JoystickのDevice固有layout
- 共通frontend framework、共通UI library、またはshared source-code architecture
