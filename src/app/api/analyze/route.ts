import { NextRequest, NextResponse } from 'next/server';

interface ReviewData {
  id: string;
  title: string;
  content: string;
  rating: number;
  author: string;
  date: string;
  version?: string;
  country?: string; // 添加国家字段
}

interface AppInfo {
  name: string;
  developer: string;
  rating: number;
  ratingCount: number;
}

// 提取 App ID 和国家代码
function parseAppStoreUrl(url: string): { appId: string; country: string } | null {
  const match = url.match(/https:\/\/apps\.apple\.com\/([a-z]{2})\/app\/[^\/]+\/id(\d+)/);
  if (!match) return null;
  
  return {
    country: match[1],
    appId: match[2]
  };
}

// 获取应用评论数据
// 注意: iTunes RSS Feed 只提供最新的评论，不是全部历史评论
// 通常可以获取到最近几个月到一年的评论数据
async function fetchAppReviews(appId: string, country: string, targetCount: number = 500): Promise<ReviewData[]> {
  const reviews: ReviewData[] = [];
  let page = 1;
  const maxPages = 10; // 增加最大页数限制，尝试获取更多评论
  
  console.log(`开始从 ${country.toUpperCase()} 地区收集评论，目标: ${targetCount} 条`);
  
  while (reviews.length < targetCount && page <= maxPages) {
    try {
      const url = `https://itunes.apple.com/${country}/rss/customerreviews/page=${page}/id=${appId}/sortby=mostrecent/json`;
      console.log(`请求 ${country.toUpperCase()} 第 ${page} 页: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Failed to fetch page ${page}: ${response.status} - ${url}`);
        page++;
        continue;
      }
      
      console.log(`${country.toUpperCase()} 第 ${page} 页请求成功 (${response.status})`);
      
      const data = await response.json();
      const entries = data.feed?.entry || [];
      
      // 第一页的第一个条目通常是应用信息，需要跳过
      // 但有些情况下可能不包含应用信息，需要检查条目类型
      let reviewEntries = entries;
      if (page === 1 && entries.length > 0) {
        // 检查第一个条目是否是应用信息（通常没有 rating 字段）
        const firstEntry = entries[0];
        if (!firstEntry['im:rating']) {
          reviewEntries = entries.slice(1);
          console.log(`${country.toUpperCase()} 第 ${page} 页跳过应用信息条目，剩余 ${reviewEntries.length} 条评论数据`);
        } else {
          console.log(`${country.toUpperCase()} 第 ${page} 页未发现应用信息条目，使用全部 ${reviewEntries.length} 条数据`);
        }
      }
      
      console.log(`${country.toUpperCase()} 第 ${page} 页获取到 ${reviewEntries.length} 条评论数据`);
      
      if (reviewEntries.length === 0) {
        console.log(`${country.toUpperCase()} 第 ${page} 页无评论数据，停止收集`);
        break;
      }
      
      for (const entry of reviewEntries) {
        // 检查是否已达到目标数量
        if (reviews.length >= targetCount) break;
        
        reviews.push({
          id: entry.id?.label || `${appId}-${country}-${page}-${reviews.length}`,
          title: entry.title?.label || '',
          content: entry.content?.label || '',
          rating: parseInt(entry['im:rating']?.label || '0'),
          author: entry.author?.name?.label || 'Anonymous',
          date: entry.updated?.label || new Date().toISOString(),
          version: entry['im:version']?.label,
          country: country.toUpperCase() // 添加国家信息
        });
      }
      
      console.log(`Page ${page}: collected ${reviewEntries.length} reviews, total: ${reviews.length}`);
      page++;
      
      // 添加延迟避免请求过快
      if (page <= maxPages) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
      page++;
    }
  }
  
  console.log(`✅ ${country.toUpperCase()} 地区最终收集到 ${reviews.length} 条评论`);
  return reviews.slice(0, targetCount); // 确保不超过目标数量
}

// 获取应用基本信息
async function fetchAppInfo(appId: string, country: string): Promise<AppInfo | null> {
  try {
    const url = `https://itunes.apple.com/lookup?id=${appId}&country=${country}`;
    const response = await fetch(url);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const app = data.results?.[0];
    
    if (!app) return null;
    
    return {
      name: app.trackName || 'Unknown App',
      developer: app.artistName || 'Unknown Developer',
      rating: app.averageUserRating || 0,
      ratingCount: app.userRatingCount || 0
    };
  } catch (error) {
    console.error('Error fetching app info:', error);
    return null;
  }
}

// 文本预处理和词频统计
function processTextAnalysis(reviews: ReviewData[]): Array<{ word: string; count: number }> {
  // 合并所有评论文本
  const allText = reviews
    .map(review => `${review.title} ${review.content}`)
    .join(' ')
    .toLowerCase();
  
  // 移除标点符号和数字
  const cleanText = allText.replace(/[^\w\s\u4e00-\u9fa5]/g, ' ');
  
  // 分词（这里简化处理，实际应该根据语言选择不同的分词器）
  const words = cleanText.split(/\s+/).filter(word => word.length > 1);
  
  // 定义停用词（英文）- 实际项目中应该更完整
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your',
    'his', 'her', 'its', 'our', 'their', 'app', 'very', 'good', 'great', 'nice', 'like', 'love',
    'really', 'just', 'get', 'use', 'using', 'used', 'make', 'makes', 'made', 'work', 'works',
    'working', 'time', 'way', 'need', 'want', 'see', 'know', 'think', 'go', 'going', 'come'
  ]);
  
  // 统计词频
  const wordCount = new Map<string, number>();
  
  for (const word of words) {
    if (stopWords.has(word) || word.length < 2) continue;
    
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  }
  
  // 转换为数组并排序
  return Array.from(wordCount.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 100); // 返回前 100 个高频词
}

export async function POST(request: NextRequest) {
  try {
    const { appUrl } = await request.json();
    
    if (!appUrl) {
      return NextResponse.json(
        { success: false, error: 'App URL is required' },
        { status: 400 }
      );
    }
    
    // 解析 URL
    const urlInfo = parseAppStoreUrl(appUrl);
    if (!urlInfo) {
      return NextResponse.json(
        { success: false, error: 'Invalid App Store URL format' },
        { status: 400 }
      );
    }
    
    const { appId, country } = urlInfo;
    
    // 并行获取应用信息和评论数据
    const [appInfo, reviews] = await Promise.all([
      fetchAppInfo(appId, country),
      fetchAppReviews(appId, country, 500) // 明确指定获取500条评论
    ]);
    
    if (!appInfo) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch app information' },
        { status: 404 }
      );
    }
    
    if (reviews.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No reviews found for this app' },
        { status: 404 }
      );
    }
    
    // 文本分析
    const wordFrequency = processTextAnalysis(reviews);
    
    // 简单情感分析（基于评分）
    const sentiment = {
      positive: reviews.filter(r => r.rating >= 4).length,
      neutral: reviews.filter(r => r.rating === 3).length,
      negative: reviews.filter(r => r.rating <= 2).length
    };
    
    // 统计收集的地区信息
    const countriesSet = new Set(reviews.map(r => r.country));
    const countriesCollected = Array.from(countriesSet).filter(Boolean);
    
    const result = {
      appInfo,
      totalReviews: reviews.length,
      analyzedReviews: reviews.length,
      wordFrequency,
      sentiment,
      reviews: reviews, // 返回所有评论数据用于导出
      dataSourceInfo: {
        source: 'iTunes RSS Feed',
        limitation: 'Only recent reviews available',
        totalAppReviews: appInfo.ratingCount,
        collectedReviews: reviews.length,
        countriesCollected, // 添加收集的国家信息
        explanation: `iTunes RSS Feed只能获取最新的评论数据，无法访问全部${appInfo.ratingCount.toLocaleString()}条历史评论。本次从 ${country.toUpperCase()} 地区收集了 ${reviews.length} 条评论。`
      }
    };
    
    return NextResponse.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during analysis' },
      { status: 500 }
    );
  }
}