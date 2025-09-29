# App Store Reviews Dashboard

A modern dashboard for managing and analyzing customer reviews, built with Next.js and deployable on Vercel.

> **Multi-language Documentation**  
> 📖 [中文文档](README.cn.md) | [日本語](README.jp.md)

## Features

### 🎯 Core Features
- **App Store Review Analysis**: Input app links to automatically fetch and analyze user reviews
- **Multi-region Data Collection**: Support collecting review data from 20+ countries/regions worldwide
- **Intelligent Word Frequency Analysis**: Generate high-quality keyword word clouds and statistical charts
- **Sentiment Analysis**: Sentiment analysis based on ratings and keywords
- **Data Export**: Support CSV format export of complete analysis reports

### 📊 Advanced Analytics
- **Time Trend Analysis**: Changes in review count and ratings over time
- **Rating Distribution Analysis**: Star rating distribution and cross-country comparisons
- **User Behavior Analysis**: Review length distribution and user activity analysis
- **Version Analysis**: User feedback comparison across different app versions
- **Keyword Trends**: Keyword evolution and emerging topic discovery

### 🚀 Technical Features
- **Dual-mode API**: Standard mode + Enhanced multi-region collection mode
- **Real-time Data**: Direct access to latest reviews from iTunes RSS Feed
- **Responsive Design**: Perfect support for mobile and desktop devices
- **Dark Mode**: Support for automatic light/dark theme switching
- **Multi-language Support**: Intelligent processing of mixed Chinese and English review content

## Tech Stack

### Frontend Technologies
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts (based on D3.js)
- **Icons**: Lucide React
- **Word Cloud**: Custom D3-cloud implementation

### Backend Technologies
- **API**: Next.js API Routes
- **Data Source**: iTunes RSS Feed API
- **Text Analysis**: Custom lightweight text processing engine
- **Data Export**: CSV format support

### Deployment Platforms
- **Primary**: Vercel
- **Supported**: Any Node.js compatible cloud platform

## Project Structure

```
reviews-dashboard/
├── src/
│   ├── app/
│   │   ├── api/                    # API 路由
│   │   │   ├── analyze/            # 标准评论分析 API
│   │   │   │   └── route.ts
│   │   │   └── analyze-enhanced/   # 增强评论分析 API
│   │   │       └── route.ts
│   │   ├── globals.css             # 全局样式
│   │   ├── layout.tsx              # 根布局
│   │   └── page.tsx                # 主分析界面
│   ├── components/                 # React 组件
│   │   ├── WordCloud.tsx           # 词云组件
│   │   ├── WordFrequencyChart.tsx  # 词频图表
│   │   ├── SentimentChart.tsx      # 情感分析图表
│   │   ├── TimeTrendAnalysis.tsx   # 时间趋势分析
│   │   ├── RatingAnalysis.tsx      # 评分分析
│   │   ├── UserBehaviorAnalysis.tsx # 用户行为分析
│   │   ├── VersionAnalysis.tsx     # 版本分析
│   │   └── KeywordEvolution.tsx    # 关键词趋势
│   └── lib/                        # 工具库
│       ├── text-analysis.ts        # 文本分析工具
│       ├── advanced-analytics.ts   # 高级分析功能
│       ├── export.ts               # 数据导出功能
│       ├── utils.ts                # 通用工具
│       └── wordcloud-layout.ts     # 词云布局算法
├── public/                         # 静态资源
├── package.json                    # 项目依赖
├── next.config.js                  # Next.js 配置
├── tailwind.config.js              # Tailwind 配置
├── tsconfig.json                   # TypeScript 配置
├── vercel.json                     # Vercel 部署配置
└── README.md                       # 项目文档
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 2. Local Development

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### 3. Build Project

```bash
npm run build
npm run start
```

## API Documentation

### 1. Standard Review Analysis API

**Endpoint**: `POST /api/analyze`

**Description**: Analyze user reviews of specified App Store applications, generate word frequency statistics, sentiment analysis and other data.

**Request Parameters**:
```json
{
  "appUrl": "https://apps.apple.com/us/app/duolingo-language-lessons/id570060128"
}
```

**响应数据**:
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
      "explanation": "iTunes RSS Feed只能获取最新的评论数据，无法访问全部4,540,286条历史评论。"
    }
  }
}
```

### 2. Enhanced Review Analysis API ⭐Recommended

**Endpoint**: `POST /api/analyze-enhanced`

**Description**: Obtain more review data through multi-region collection strategy, providing more comprehensive analysis results.

**Request Parameters**:
```json
{
  "appUrl": "https://apps.apple.com/us/app/duolingo-language-lessons/id570060128"
}
```

**响应数据**:
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
      "explanation": "通过多地区策略收集，从 5 个地区获取了 500 条最新评论，相比单地区收集获得了更全面的用户反馈。",
      "enhancedFeatures": [
        "多地区评论收集",
        "重复评论去除", 
        "智能国家优先级",
        "更大样本量"
      ]
    }
  }
}
```

### API Feature Comparison

| Feature | Standard API | Enhanced API |
|---------|--------------|-------------|
| Collection Regions | Single region | Multi-region (up to 20) |
| Review Count | 200-300 | 500+ |
| Geographic Coverage | Limited | Global major markets |
| Data Diversity | Limited | Rich |
| Country Info | No | Includes source country |
| Processing Time | Faster | Slower but more comprehensive |
| Recommended For | Quick analysis | In-depth analysis |

### Error Response

```json
{
  "success": false,
  "error": "Invalid App Store URL format"
}
```

**Common Error Codes**:
- `400`: Invalid request parameters
- `404`: App or reviews not found
- `500`: Internal server error

### Usage Examples

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
    console.log('Analysis completed:', result.data);
    return result.data;
  } else {
    console.error('Analysis failed:', result.error);
    throw new Error(result.error);
  }
};

// Usage example
analyzeApp('https://apps.apple.com/us/app/duolingo-language-lessons/id570060128')
  .then(data => {
    console.log(`Collected ${data.totalReviews} reviews`);
    console.log(`From ${data.dataSourceInfo.countriesCollected?.length || 1} regions`);
  });
```

#### cURL
```bash
# 标准 API
curl -X POST https://your-domain.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"appUrl": "https://apps.apple.com/us/app/duolingo-language-lessons/id570060128"}'

# 增强 API  
curl -X POST https://your-domain.vercel.app/api/analyze-enhanced \
  -H "Content-Type: application/json" \
  -d '{"appUrl": "https://apps.apple.com/us/app/duolingo-language-lessons/id570060128"}'
```

### Supported App Store Link Formats

- `https://apps.apple.com/us/app/app-name/id123456789`
- `https://apps.apple.com/cn/app/app-name/id123456789`  
- `https://apps.apple.com/gb/app/app-name/id123456789`
- Supports all App Store regions worldwide

### Data Source Information

- **Data Source**: iTunes RSS Feed (Apple's official API)
- **Timeliness**: Review data from recent months to a year
- **Limitations**: Cannot access complete historical review data
- **Languages**: Supports multi-language review processing
- **Update Frequency**: Real-time access to latest data
## Contributing

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT License](LICENSE)

## Support

If you have any questions or suggestions, please create an [Issue](../../issues).