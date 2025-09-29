# App Store 评论分析仪表板

一个用于管理和分析客户评论的现代化仪表板，基于 Next.js 构建，支持 Vercel 部署。

> **多语言文档**  
> 📖 [English](README.md) | [日本語](README.jp.md)

## 功能特性

### 🎯 核心功能
- **App Store 评论分析**: 输入应用链接，自动获取并分析用户评论
- **多地区数据收集**: 支持从全球20+个国家/地区收集评论数据
- **智能词频分析**: 生成高质量的关键词词云和统计图表
- **情感分析**: 基于评分和关键词的情感倾向分析
- **数据导出**: 支持 CSV 格式导出完整分析报告

### 📊 高级分析
- **时间趋势分析**: 评论数量、评分随时间的变化趋势
- **评分分布分析**: 星级分布和不同国家对比
- **用户行为分析**: 评论长度分布、用户活跃度分析
- **版本分析**: 不同应用版本的用户反馈对比
- **关键词趋势**: 关键词演化和新兴话题发现

### 🚀 技术特性
- **双模式 API**: 标准模式 + 增强多地区收集模式
- **实时数据**: 直接从 iTunes RSS Feed 获取最新评论
- **响应式设计**: 完美支持移动端和桌面端
- **深色模式**: 支持明暗主题自动切换
- **多语言支持**: 智能处理中英文混合评论内容

## 技术栈

### 前端技术
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **图表**: Recharts (基于 D3.js)
- **图标**: Lucide React
- **词云**: 自定义 D3-cloud 实现

### 后端技术
- **API**: Next.js API Routes
- **数据源**: iTunes RSS Feed API
- **文本分析**: 自研轻量级文本处理引擎
- **数据导出**: CSV 格式支持

### 部署平台
- **主要部署**: Vercel
- **支持平台**: 任何支持 Node.js 的云平台

## 项目结构

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

## 快速开始

### 1. 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 2. 本地开发

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

### 3. 构建项目

```bash
npm run build
npm run start
```

## API 接口

### 1. 标准评论分析 API

**接口地址**: `POST /api/analyze`

**功能描述**: 分析指定 App Store 应用的用户评论，生成词频统计、情感分析等数据。

**请求参数**:
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

### 2. 增强评论分析 API ⭐推荐

**接口地址**: `POST /api/analyze-enhanced`

**功能描述**: 通过多地区收集策略获取更多评论数据，提供更全面的分析结果。

**请求参数**:
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

### API 特性对比

| 特性 | 标准 API | 增强 API |
|------|----------|----------|
| 收集地区 | 单一地区 | 多地区（最多20个） |
| 评论数量 | 200-300条 | 500+条 |
| 地域覆盖 | 局限性 | 全球主要市场 |
| 数据多样性 | 有限 | 丰富 |
| 国家信息 | 无 | 包含来源国家 |
| 处理时间 | 较快 | 稍慢但更全面 |
| 推荐场景 | 快速分析 | 深度分析 |

### 错误响应

```json
{
  "success": false,
  "error": "Invalid App Store URL format"
}
```

**常见错误码**:
- `400`: 请求参数错误
- `404`: 应用或评论未找到  
- `500`: 服务器内部错误

### 使用示例

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
    console.log('分析完成:', result.data);
    return result.data;
  } else {
    console.error('分析失败:', result.error);
    throw new Error(result.error);
  }
};

// 使用示例
analyzeApp('https://apps.apple.com/us/app/duolingo-language-lessons/id570060128')
  .then(data => {
    console.log(`收集到 ${data.totalReviews} 条评论`);
    console.log(`来自 ${data.dataSourceInfo.countriesCollected?.length || 1} 个地区`);
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

### 支持的应用商店链接格式

- `https://apps.apple.com/us/app/app-name/id123456789`
- `https://apps.apple.com/cn/app/app-name/id123456789`  
- `https://apps.apple.com/gb/app/app-name/id123456789`
- 支持全球所有 App Store 地区

### 数据来源说明

- **数据源**: iTunes RSS Feed (苹果官方接口)
- **时效性**: 最近几个月到一年的评论数据
- **限制**: 无法获取全部历史评论数据
- **语言**: 支持多语言评论处理
- **更新频率**: 实时获取最新数据

## Vercel 部署

### 方法一: 从 Git 仓库部署

1. 将代码推送到 GitHub/GitLab/Bitbucket
2. 在 [Vercel Dashboard](https://vercel.com/dashboard) 中导入项目
3. Vercel 会自动检测 Next.js 项目并进行部署

### 方法二: 使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署项目
vercel

# 部署到生产环境
vercel --prod
```

### 环境变量设置

在 Vercel Dashboard 的项目设置中添加环境变量：

- `NODE_ENV`: production
- 其他 API 密钥或数据库连接字符串（根据需要）

## 贡献指南

1. Fork 这个仓库
2. 创建你的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 许可证

[MIT License](LICENSE)

## 支持

如果你有任何问题或建议，请创建一个 [Issue](../../issues)。