# App Store レビュー分析ダッシュボード

Next.js で構築され、Vercel でデプロイ可能な、顧客レビューの管理と分析のためのモダンなダッシュボード。

> **多言語ドキュメント**  
> 📖 [English](README.md) | [中文文档](README.cn.md)

## 機能

### 🎯 コア機能
- **App Store レビュー分析**: アプリのリンクを入力して、ユーザーレビューを自動取得・分析
- **多地域データ収集**: 世界20カ国以上からのレビューデータ収集をサポート
- **インテリジェント単語頻度分析**: 高品質なキーワードワードクラウドと統計チャートを生成
- **感情分析**: 評価とキーワードに基づく感情傾向分析
- **データエクスポート**: 完全な分析レポートのCSV形式エクスポートをサポート

### 📊 高度な分析
- **時間トレンド分析**: レビュー数と評価の時間変化
- **評価分布分析**: 星評価の分布と国別比較
- **ユーザー行動分析**: レビュー長の分布とユーザー活動分析
- **バージョン分析**: 異なるアプリバージョンのユーザーフィードバック比較
- **キーワードトレンド**: キーワードの進化と新しいトピックの発見

### 🚀 技術的特徴
- **デュアルモードAPI**: 標準モード + 拡張多地域収集モード
- **リアルタイムデータ**: iTunes RSS Feedから最新レビューを直接取得
- **レスポンシブデザイン**: モバイルとデスクトップデバイスを完全サポート
- **ダークモード**: 明暗テーマの自動切り替えをサポート
- **多言語サポート**: 中国語と英語の混合レビューコンテンツのインテリジェント処理

## 技術スタック

### フロントエンド技術
- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **チャート**: Recharts (D3.js ベース)
- **アイコン**: Lucide React
- **ワードクラウド**: カスタム D3-cloud 実装

### バックエンド技術
- **API**: Next.js API Routes
- **データソース**: iTunes RSS Feed API
- **テキスト分析**: カスタム軽量テキスト処理エンジン
- **データエクスポート**: CSV 形式サポート

### デプロイプラットフォーム
- **プライマリ**: Vercel
- **サポート**: Node.js 互換のクラウドプラットフォーム

## プロジェクト構造

```
reviews-dashboard/
├── src/
│   ├── app/
│   │   ├── api/                    # API ルート
│   │   │   ├── analyze/            # 標準レビュー分析 API
│   │   │   │   └── route.ts
│   │   │   └── analyze-enhanced/   # 拡張レビュー分析 API
│   │   │       └── route.ts
│   │   ├── globals.css             # グローバルスタイル
│   │   ├── layout.tsx              # ルートレイアウト
│   │   └── page.tsx                # メイン分析インターフェース
│   ├── components/                 # React コンポーネント
│   │   ├── WordCloud.tsx           # ワードクラウドコンポーネント
│   │   ├── WordFrequencyChart.tsx  # 単語頻度チャート
│   │   ├── SentimentChart.tsx      # 感情分析チャート
│   │   ├── TimeTrendAnalysis.tsx   # 時間トレンド分析
│   │   ├── RatingAnalysis.tsx      # 評価分析
│   │   ├── UserBehaviorAnalysis.tsx # ユーザー行動分析
│   │   ├── VersionAnalysis.tsx     # バージョン分析
│   │   └── KeywordEvolution.tsx    # キーワードトレンド
│   └── lib/                        # ユーティリティライブラリ
│       ├── text-analysis.ts        # テキスト分析ツール
│       ├── advanced-analytics.ts   # 高度な分析機能
│       ├── export.ts               # データエクスポート機能
│       ├── utils.ts                # 一般ユーティリティ
│       └── wordcloud-layout.ts     # ワードクラウドレイアウトアルゴリズム
├── public/                         # 静的リソース
├── package.json                    # プロジェクト依存関係
├── next.config.js                  # Next.js 設定
├── tailwind.config.js              # Tailwind 設定
├── tsconfig.json                   # TypeScript 設定
├── vercel.json                     # Vercel デプロイ設定
└── README.md                       # プロジェクトドキュメント
```

## クイックスタート

### 1. 依存関係のインストール

```bash
npm install
# または
yarn install
# または
pnpm install
```

### 2. ローカル開発

```bash
npm run dev
# または
yarn dev
# または
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて結果を確認してください。

### 3. プロジェクトのビルド

```bash
npm run build
npm run start
```

## API ドキュメント

### 1. 標準レビュー分析 API

**エンドポイント**: `POST /api/analyze`

**説明**: 指定された App Store アプリケーションのユーザーレビューを分析し、単語頻度統計、感情分析などのデータを生成します。

**リクエストパラメータ**:
```json
{
  "appUrl": "https://apps.apple.com/us/app/duolingo-language-lessons/id570060128"
}
```

**レスポンスデータ**:
```json
{
  "success": true,
  "data": {
    "appInfo": {
      "name": "Duolingo - Language Lessons",
      "developer": "Duolingo",
      "rating": 4.72993,
      "ratingCount": 4540286
    },
    "totalReviews": 499,
    "analyzedReviews": 499,
    "wordFrequency": [
      { "word": "great", "count": 45 },
      { "word": "helpful", "count": 32 }
    ],
    "sentiment": {
      "positive": 320,
      "neutral": 89,
      "negative": 90
    },
    "reviews": [
      {
        "id": "570060128-1-0",
        "title": "Amazing app!",
        "content": "Really helps with learning Spanish",
        "rating": 5,
        "author": "John123",
        "date": "2025-09-28T10:30:00Z",
        "version": "8.9.0"
      }
    ],
    "dataSourceInfo": {
      "source": "iTunes RSS Feed",
      "limitation": "Only recent reviews available",
      "totalAppReviews": 4540286,
      "collectedReviews": 499,
      "explanation": "iTunes RSS Feedは最新のレビューデータのみを取得でき、全4,540,286件の履歴レビューにはアクセスできません。"
    }
  }
}
```

### 2. 拡張レビュー分析 API ⭐推奨

**エンドポイント**: `POST /api/analyze-enhanced`

**説明**: 多地域収集戦略を通じてより多くのレビューデータを取得し、より包括的な分析結果を提供します。

**リクエストパラメータ**:
```json
{
  "appUrl": "https://apps.apple.com/us/app/duolingo-language-lessons/id570060128"
}
```

**レスポンスデータ**:
```json
{
  "success": true,
  "data": {
    "appInfo": {
      "name": "Duolingo - Language Lessons",
      "developer": "Duolingo",
      "rating": 4.72993,
      "ratingCount": 4540286
    },
    "totalReviews": 500,
    "analyzedReviews": 500,
    "wordFrequency": [
      { "word": "great", "count": 67 },
      { "word": "helpful", "count": 45 }
    ],
    "sentiment": {
      "positive": 340,
      "neutral": 85,
      "negative": 75
    },
    "reviews": [
      {
        "id": "570060128-us-1-0",
        "title": "Amazing app!",
        "content": "Really helps with learning Spanish",
        "rating": 5,
        "author": "John123",
        "date": "2025-09-28T10:30:00Z",
        "version": "8.9.0",
        "country": "US"
      }
    ],
    "dataSourceInfo": {
      "source": "iTunes RSS Feed (Enhanced Multi-Region)",
      "limitation": "Recent reviews only, collected from multiple regions",
      "totalAppReviews": 4540286,
      "collectedReviews": 500,
      "countriesCollected": ["US", "GB", "CA", "AU", "DE"],
      "explanation": "多地域戦略を通じて、5つの地域から500件の最新レビューを収集し、単一地域の収集と比較してより包括的なユーザーフィードバックを得ました。",
      "enhancedFeatures": [
        "多地域レビュー収集",
        "重複レビュー除去", 
        "インテリジェント国優先度",
        "より大きなサンプルサイズ"
      ]
    }
  }
}
```

### API 機能比較

| 機能 | 標準 API | 拡張 API |
|------|----------|----------|
| 収集地域 | 単一地域 | 多地域（最大20） |
| レビュー数 | 200-300件 | 500+件 |
| 地理的カバレッジ | 限定的 | グローバル主要市場 |
| データ多様性 | 限定的 | 豊富 |
| 国情報 | なし | ソース国を含む |
| 処理時間 | 高速 | やや遅いがより包括的 |
| 推奨用途 | 迅速な分析 | 詳細な分析 |

### エラーレスポンス

```json
{
  "success": false,
  "error": "Invalid App Store URL format"
}
```

**一般的なエラーコード**:
- `400`: 無効なリクエストパラメータ
- `404`: アプリまたはレビューが見つからない
- `500`: 内部サーバーエラー

### 使用例

#### JavaScript/TypeScript
```javascript
const analyzeApp = async (appUrl, useEnhanced = true) => {
  const endpoint = useEnhanced ? '/api/analyze-enhanced' : '/api/analyze';
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ appUrl }),
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('分析完了:', result.data);
    return result.data;
  } else {
    console.error('分析失敗:', result.error);
    throw new Error(result.error);
  }
};

// 使用例
analyzeApp('https://apps.apple.com/us/app/duolingo-language-lessons/id570060128')
  .then(data => {
    console.log(`${data.totalReviews}件のレビューを収集`);
    console.log(`${data.dataSourceInfo.countriesCollected?.length || 1}地域から`);
  });
```

#### cURL
```bash
# 標準 API
curl -X POST https://your-domain.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"appUrl": "https://apps.apple.com/us/app/duolingo-language-lessons/id570060128"}'

# 拡張 API  
curl -X POST https://your-domain.vercel.app/api/analyze-enhanced \
  -H "Content-Type: application/json" \
  -d '{"appUrl": "https://apps.apple.com/us/app/duolingo-language-lessons/id570060128"}'
```

### サポートされる App Store リンク形式

- `https://apps.apple.com/us/app/app-name/id123456789`
- `https://apps.apple.com/cn/app/app-name/id123456789`  
- `https://apps.apple.com/gb/app/app-name/id123456789`
- 世界中のすべての App Store 地域をサポート

### データソース情報

- **データソース**: iTunes RSS Feed（Apple の公式 API）
- **時間性**: 最近数ヶ月から1年のレビューデータ
- **制限**: 完全な履歴レビューデータにはアクセス不可
- **言語**: 多言語レビュー処理をサポート
- **更新頻度**: 最新データへのリアルタイムアクセス

## Vercel デプロイ

### 方法1: Git リポジトリからのデプロイ

1. コードを GitHub/GitLab/Bitbucket にプッシュ
2. [Vercel Dashboard](https://vercel.com/dashboard) でプロジェクトをインポート
3. Vercel が自動的に Next.js プロジェクトを検出してデプロイ

### 方法2: Vercel CLI の使用

```bash
# Vercel CLI をインストール
npm i -g vercel

# Vercel にログイン
vercel login

# プロジェクトをデプロイ
vercel

# 本番環境にデプロイ
vercel --prod
```

### 環境変数の設定

Vercel Dashboard のプロジェクト設定で環境変数を追加：

- `NODE_ENV`: production
- その他の API キーやデータベース接続文字列（必要に応じて）

## 貢献

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを開く

## ライセンス

[MIT License](LICENSE)

## サポート

質問や提案がある場合は、[Issue](../../issues) を作成してください。