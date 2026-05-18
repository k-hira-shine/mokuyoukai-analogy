# 引き継ぎドキュメント

前の会話: [木曜会エピソードDB プラン設計](85e4e3e0-50ee-4ecb-9bd8-c43985c31bc5)

---

## プロジェクトの本質（必読）

木曜会（Fincsで運営されるAIコミュニティ）の投稿を、X・YouTubeの**発信エピソード素材**として蓄積・活用するための個人ツール。

- 作る人：自分（木曜会の一般参加者、運営ではない）
- 見る人：自分 ＋ ビジネスパートナー（URLを知っている人のみ）
- 目的：「こういう人がいた」というエピソードをコンテンツに使う
- 統計・エビデンスより**刺さるエピソード**を重視
- 一般公開はしない

---

## 現在の状態

- プランファイル: `.cursor/plans/chat_knowledge_page_729e17b7.plan.md`
- ワークスペース: `/Users/kz5/Cursor/YouTube/mokuyoukai-analogy🕳️/`（空）
- スキーマ：22件の実投稿で検証済み・**確定**
- 保存方式：**Firebase Firestore** にブラウザから直接保存。追加・編集・閲覧をブラウザ上で完結させる
- 未着手：コーディング全体

---

## 確定スキーマ

### ジャンル①: AI活用事例のシェア（2.3チャンネル）

```json
{
  "id": "string（必須・uuid等の一意なID）",
  "author": "string（必須）",
  "date": "YYYY-MM-DD（必須）",
  "title": "string（必須・なければAI生成）",
  "title_generated": "boolean（必須・trueなら要確認フラグ）",
  "tools": ["string配列（必須）"],
  "post_type": "how_to | product | progress | knowledge（必須）",
  "summary": "string 1〜2文（必須・事実ベースの要約）",
  "message": "string（必須・AIが生成する抽象的なメッセージ・発信フックに直接使えるレベル）",
  "background": "string | null",
  "steps": ["string配列 | null"],
  "result": "string | null",
  "key_point": "string | null",
  "impression": "string | null",
  "unsolved": "string | null",
  "resources": [{"label": "string", "url": "string"}],
  "genre": "1（必須・ジャンル①を示す）",
  "tags": ["string配列（必須）"],
  "status": "draft | published（必須）"
}
```

`post_type` の定義:
- `how_to`: 手順を踏んで作った過程の報告（アルカ、アリ、おかだまなど）
- `product`: 完成したものの機能紹介（藤井、Kiryu、Nissyなど）
- `progress`: 作業中の途中報告（宮内など）
- `knowledge`: 学んだ知識・ノウハウのまとめ（このみん×2など）

### ジャンル②: AIで自分の状況はこう変わった！（2.4チャンネル）

```json
{
  "id": "string（必須・uuid等の一意なID）",
  "author": "string（必須）",
  "date": "YYYY-MM-DD（必須）",
  "title": "string（必須・なければAI生成）",
  "title_generated": "boolean（必須・trueなら要確認フラグ）",
  "message": "string（必須・AIが生成する抽象的なメッセージ・発信フックに直接使えるレベル）",
  "tools": ["string配列 | null"],
  "before": "string | null",
  "after": "string（必須）",
  "trigger": "string | null",
  "key_action": "string | null",
  "impact": "string | null",
  "impression": "string | null",
  "period": "string | null（例: '約1年', '5日間', '10日間'）",
  "scale": "small | big（必須）",
  "resources": [{"label": "string", "url": "string"}],
  "genre": "2（必須・ジャンル②を示す）",
  "tags": ["string配列（必須）"],
  "status": "draft | published（必須）"
}
```

`scale` の判定基準:
- `big`: キャリア変化・昇給・社外への影響・アプリ公開・受賞など
- `small`: 一歩前進・習慣化・小さな気づき・進行中

---

## 技術スタック

| 項目 | 決定内容 |
|---|---|
| ホスティング | GitHub Pages（画面を置く場所。URL自体は公開URLとして扱う） |
| データ保存 | Firebase Firestore（ブラウザから直接保存・編集・取得） |
| 認証 | Firebase Auth（Googleログイン。自分は読書き、ビジネスパートナーは閲覧のみ、それ以外はアクセス不可） |
| AI抽出 | Gemini 2.5 Flash API（Google AI Studioで無料取得） |
| フロントエンド | 静的HTML + Tailwind CSS CDN（インストール不要） |
| APIキー管理 | Gemini APIキーはブラウザのlocalStorageに保存（GitHubには上げない）。Firebase設定値は公開前提で扱い、Firestoreルールで保護する |
| 初期の保存運用 | `admin.html` から Firestore に保存。CursorでJSON反映する手作業は不要 |

---

## ファイル構成（作るべきもの）

```
mokuyoukai-analogy🕳️/
├── index.html           ← エピソード閲覧（自分＋ビジネスパートナー）
├── content.html         ← コンテンツ保管庫（生成した発信内容を蓄積）
├── admin.html           ← 管理ツール（自分だけが使う。Firestoreルールで書き込みは自分のみに制限）
├── firebase-config.js   ← Firebase接続設定（APIキーは秘密情報ではないが、Firestoreルールで保護する）
└── .cursor/
    └── docs/
        └── handoff.md（このファイル）
        └── project-overview.md（作成予定）
```

---

## 管理ツール（admin.html）の設計

### キュー（一時保管箱）方式

**日中**：
1. Fincsで投稿を見つける → テキストをコピー
2. admin.htmlの貼り付けエリアに貼る → 「キューに追加」
3. localStorageに一時保存（AI処理はしない）

**1日の終わり**：
4. 「まとめて処理」ボタン → Geminiが全件を一括処理
   - ジャンル自動判定（①か②か）
   - 全フィールド自動抽出
   - **今日の発信ネタ提案を生成**（下記参照）
5. 結果を確認・修正（`title_generated: true` は要確認）
6. 「保存」→ Firestore の `episodes` / `contents` コレクションに直接保存
7. 閲覧ページ・コンテンツ保管庫に即反映

注意:
- GitHub Pages は画面配信用、Firestore はデータ保存用として役割を分ける
- Firebase Auth と Firestore セキュリティルールで、自分とビジネスパートナー以外がデータを読めない状態にする
- 書き込み（エピソード追加・編集）は自分だけ。ビジネスパートナーは閲覧のみ
- GitHub APIでcommitする方式は、トークン管理リスクがあるため採用しない

### Firestoreのデータ構成

Firestore は Firebase のデータベース。データベースとは、投稿や生成コンテンツを保存して検索できる箱。

| コレクション | 用途 |
|---|---|
| `episodes` | ジャンル①・②のエピソードを保存。`genre` フィールドで分類 |
| `contents` | X投稿草稿・YouTube台本・日次提案を保存 |
| `settings` | 許可ユーザーや表示設定など、必要になったら保存 |

### 発信ネタ提案（Geminiが生成）

処理完了後に、新着エピソードの中から「X・YouTubeで刺さりそうな角度」を提案する。

出力イメージ:
```
今日の一押しエピソード（ジャンル②）
▶ 井ノ口さんの「慶良間ダイビング予報アプリ」
発信角度: 「AIで作るのは便利なものじゃなくていい。大切な人の課題を形にすることがいちばん刺さる」
X向け: 土日2日で友人のために作った話をそのまま投稿
YouTube向け: 非エンジニアがAPI連携まで2日でやり切った過程
```

---

## 発信コンテンツ生成機能（閲覧ページ or 管理ツールに搭載）

「ランダム提案」に加えて、**特定のエピソードを選んでコンテンツ原稿を生成する**機能。

### 操作フロー

1. 閲覧ページ（index.html）でエピソードカードを選択
2. 「コンテンツを生成」ボタン → 生成対象を選ぶ
3. Geminiが原稿を生成 → 画面に表示
4. 編集してコピー → X・YouTube用に使う

### 生成対象の選択肢

| 選択肢 | 出力内容 |
|---|---|
| X投稿（1ポスト） | 140〜280字のツイート原稿。フック＋エピソード＋メッセージの構成 |
| Xスレッド（3〜5投稿） | 連投形式。詳細なビフォーアフターや手順を展開 |
| YouTube台本（構成のみ） | タイトル案・サムネイル案・3分割構成（つかみ・本題・まとめ） |

### Geminiへのプロンプト設計メモ

- エピソードのJSONデータをそのまま渡す（`summary`, `before`, `after`, `impression` などを使う）
- 投稿者名は匿名化するかそのまま使うか選べるようにする
- コンテンツのトーン指定（例: 「共感系」「驚き系」「背中を押す系」）を選択肢で渡す
- 生成後に「再生成」「トーン変更」ができると使いやすい

---

## Geminiへの抽出プロンプト設計メモ

- 投稿の書き方がバラバラ（◎形式・【】形式・自由文）でもMeaning-basedで抽出する
- タイトルがなければ内容から1行で生成し `title_generated: true` を付ける
- コミュニティ内の固有表現・内輪ワードは平易な言葉に言い換えて `summary` に入れる
- 学びや助言がある場合は `impression` の末尾に含める
- `scale` は投稿者が「小さな成果」「地味な話」などと言っていれば `small`、キャリア変化・社外影響があれば `big`
- 投稿者名は表示時に匿名化できるようにする。共有URLが転送される可能性を前提に、必要なら `author` を伏せて発信用の表現へ置き換える

---

## コンテンツ保管庫（content.html）

生成した発信コンテンツと日次提案を蓄積・閲覧するページ。

### 保存されるコンテンツの種類

| 種類 | 説明 |
|---|---|
| X投稿草稿 | エピソードから生成したツイート・スレッド原稿 |
| YouTube台本 | タイトル案・構成・概要 |
| 日次提案 | 毎日の処理時にGeminiが生成した「今日の刺さるエピソード提案」 |

### `contents` コレクションのデータ構造

```json
{
  "id": "uuid",
  "created_at": "YYYY-MM-DD",
  "type": "x_post | x_thread | youtube | daily_suggestion",
  "source_episode_id": "元エピソードのID（null可）",
  "content": "生成された本文",
  "tone": "共感系 | 驚き系 | 背中を押す系",
  "status": "draft | used | archived"
}
```

`status` の使い方:
- `draft`: 生成したが未使用
- `used`: 実際に投稿した
- `archived`: 使わないが消したくない

### ページの表示

- 日付順・`type` 別に並べて閲覧
- `status` で絞り込み（未使用だけ見る、など）
- 「使用済みにする」ボタンで管理
- 元エピソードへのリンク付き

---

## コスト

- **ホスティング（GitHub Pages）**: 無料
- **Firebase（Spark プラン）**: 無料。主な制限は 1GiB ストレージ、日 50,000 読み取り、日 20,000 書き込み。この用途なら十分
- **Gemini 2.5 Flash API**: 無料枠あり（日 1,500 リクエスト / 100万トークン）。通常運用では少量の投稿処理を想定。超過時は従量課金

---

## Todoリスト（残り）

- [ ] Firebase プロジェクト作成・Firestore 有効化・Firebase Auth 設定
- [ ] Firestore セキュリティルール（自分＋ビジネスパートナーだけ許可）
- [ ] `firebase-config.js` 作成
- [ ] `index.html`（エピソード閲覧：検索・フィルター・カード表示・コンテンツ生成ボタン）
- [ ] `content.html`（コンテンツ保管庫：生成した発信内容・日次提案の蓄積）
- [ ] `admin.html`（管理ツール：キュー・Gemini処理・発信提案・Firestore保存）
- [ ] GitHub Pages 設定
- [ ] `project-overview.md` 作成
