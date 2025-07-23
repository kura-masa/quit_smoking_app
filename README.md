# 禁煙チャレンジ - 30日間で新しい自分に

ゲーミフィケーション要素を取り入れた、楽しい雰囲気の禁煙サポートWebアプリケーションです。ユーザーは30日間の禁煙目標を設定し、失敗した場合は自身のTwitterアカウントに「失敗報告」が自動投稿されるという社会的プレッシャーを利用して、禁煙継続のモチベーションを維持します。

## 🎯 主な機能

### ✨ コア機能
- **Twitter認証**: ワンクリックでサインアップ・ログイン
- **30日間チャレンジ**: 明確な目標設定で禁煙を習慣化
- **ペナルティ設定**: 失敗時の恥ずかしいツイート内容を事前設定
- **自動リマインダー**: 毎日午前8時に進捗ツイートを自動投稿
- **自動失敗判定**: 翌日午前4時までに報告がない場合、ペナルティツイートを実行

### 🎮 ゲーミフィケーション要素
- **進捗カレンダー**: 30日間の成功・失敗を視覚的に表示
- **バッジシステム**: 継続日数に応じてブロンズ・シルバー・ゴールド・チャンピオンバッジを獲得
- **アニメーション**: 成功報告時の紙吹雪エフェクトや楽しいインタラクション
- **統計表示**: 継続日数、成功率、獲得バッジ数をリアルタイム表示

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 14 (App Router) + TypeScript
- **スタイリング**: Tailwind CSS + Framer Motion
- **バックエンド**: Firebase
  - Authentication (Twitter認証)
  - Firestore (データベース)
  - Functions (自動投稿・バッチ処理)
  - Hosting (Webアプリホスティング)
- **外部API**: Twitter API v2

## 🚀 セットアップ

### 1. 前提条件
- Node.js 18以上
- Firebase CLI
- Twitter Developer Account

### 2. プロジェクトのクローン
```bash
git clone <repository-url>
cd quit-smoking-challenge
npm install
```

### 3. Firebase設定
```bash
# Firebase CLIをインストール（未インストールの場合）
npm install -g firebase-tools

# Firebaseにログイン
firebase login

# Firebaseプロジェクトを初期化
firebase init
```

### 4. 環境変数の設定
`.env.local.example`を参考に`.env.local`を作成し、以下の値を設定：

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Firebase Functions設定
```bash
cd functions
npm install

# Twitter API設定
firebase functions:config:set twitter.api_key="your_twitter_api_key"
firebase functions:config:set twitter.api_secret="your_twitter_api_secret"
firebase functions:config:set app.url="https://your-app-domain.com"
```

### 6. Twitter Developer設定
1. [Twitter Developer Portal](https://developer.twitter.com/)でアプリを作成
2. OAuth 1.0a設定を有効化
3. Callback URLを設定: `https://your-project.firebaseapp.com/__/auth/handler`
4. Read and Write権限を設定

### 7. 開発サーバー起動
```bash
# フロントエンド
npm run dev

# Firebase Functions（別ターミナル）
cd functions
npm run serve
```

## 📱 使い方

### 1. チャレンジ開始
1. Twitterアカウントでログイン
2. 「チャレンジを開始する」ボタンをクリック
3. 失敗時に投稿される実名を設定
4. 投稿内容を確認してチャレンジ開始

### 2. 日々の報告
1. 毎朝8時にリマインダーツイートが自動投稿される
2. ツイート内のリンクから成功報告ページにアクセス
3. 「今日の禁煙も成功！」ボタンをクリックして報告

### 3. 継続とゴール
- 30日間連続で成功報告を行うとチャレンジ完了
- 報告を忘れると自動的にペナルティツイートが投稿される
- ダッシュボードで進捗とバッジを確認

## 🏗️ アーキテクチャ

### データベース構造
```
users/
  {userId}/
    - uid: string
    - twitterId: string
    - screenName: string
    - displayName: string
    - profileImageUrl: string
    - accessToken: string (暗号化推奨)
    - accessTokenSecret: string (暗号化推奨)
    - createdAt: timestamp

challenges/
  {challengeId}/
    - userId: string
    - realName: string
    - startDate: timestamp
    - status: 'active' | 'completed' | 'failed'
    - currentDay: number
    - createdAt: timestamp
    - completedAt?: timestamp
    - failedAt?: timestamp

successLogs/
  {challengeId}_{YYYY-MM-DD}/
    - challengeId: string
    - date: string (YYYY-MM-DD)
    - reportedAt: timestamp
```

### Firebase Functions
- `sendDailyReminder`: 毎日午前8時に進捗ツイート送信
- `checkFailuresAndExecutePenalty`: 毎日午前4時に失敗判定とペナルティ実行

## 🔒 セキュリティ

- Firestore Security Rulesでデータアクセスを制限
- Twitter OAuth トークンの安全な保存
- ユーザーは自分のデータのみアクセス可能
- CSRF攻撃対策

## 🚀 デプロイ

### 1. ビルド
```bash
npm run build
npm run export
```

### 2. Firebase Deploy
```bash
# Functions
firebase deploy --only functions

# Hosting
firebase deploy --only hosting

# 全体
firebase deploy
```

## 📈 今後の拡張予定

- [ ] 画像・動画投稿機能
- [ ] 友達とのチャレンジ共有
- [ ] より詳細な統計とグラフ
- [ ] カスタムバッジシステム
- [ ] プッシュ通知
- [ ] 多言語対応

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🙏 謝辞

- [Firebase](https://firebase.google.com/) - バックエンドサービス
- [Next.js](https://nextjs.org/) - Reactフレームワーク
- [Tailwind CSS](https://tailwindcss.com/) - CSSフレームワーク
- [Framer Motion](https://www.framer.com/motion/) - アニメーションライブラリ
- [Lucide React](https://lucide.dev/) - アイコンライブラリ

---

健康的な生活への第一歩を、楽しく継続できるようサポートします！ 🚭✨