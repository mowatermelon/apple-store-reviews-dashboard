import { NextRequest, NextResponse } from 'next/server';
import { analyzeWordFrequency, analyzeSentiment } from '@/lib/text-analysis';

interface ReviewData {
  id: string;
  title: string;
  content: string;
  rating: number;
  author: string;
  date: string;
  version?: string;
  country?: string;
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

// 多国家评论收集策略
async function fetchAppReviewsEnhanced(appId: string, primaryCountry: string, targetCount: number = 500): Promise<ReviewData[]> {
  const allReviews: ReviewData[] = [];
  
  // 主要国家列表，优先收集更多评论
  const countries = [
    primaryCountry,
    'us', 'gb', 'ca', 'au', 'de', 'fr', 'jp', 'kr', 'cn', 'in', 'br', 'mx', 'es', 'it', 'nl', 'se', 'no', 'dk', 'fi'
  ].filter((country, index, arr) => arr.indexOf(country) === index); // 去重

  console.log(`开始从多个地区收集评论，目标: ${targetCount} 条`);

  for (const country of countries) {
    if (allReviews.length >= targetCount) break;
    
    try {
      const needCount = Math.min(200, targetCount - allReviews.length);
      console.log(`正在收集 ${country.toUpperCase()} 地区的评论（目标: ${needCount} 条）...`);
      const countryReviews = await fetchCountryReviews(appId, country, needCount);
      
      // 添加国家标识
      const reviewsWithCountry = countryReviews.map(review => ({
        ...review,
        country: country.toUpperCase()
      }));
      
      allReviews.push(...reviewsWithCountry);
      console.log(`${country.toUpperCase()} 地区收集到 ${countryReviews.length} 条评论，总计: ${allReviews.length}`);
      
      // 添加延迟避免请求过快
      if (countries.indexOf(country) < countries.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      console.warn(`收集 ${country} 地区评论失败:`, error);
      continue;
    }
  }

  // 按日期排序，最新的在前
  allReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  console.log(`总共收集到 ${allReviews.length} 条评论，来自 ${new Set(allReviews.map(r => r.country)).size} 个地区`);
  return allReviews.slice(0, targetCount);
}

// 单个国家评论收集
async function fetchCountryReviews(appId: string, country: string, targetCount: number): Promise<ReviewData[]> {
  const reviews: ReviewData[] = [];
  let page = 1;
  const maxPages = Math.min(10, Math.ceil(targetCount / 25)); // 每页大约25条评论

  while (reviews.length < targetCount && page <= maxPages) {
    try {
      const url = `https://itunes.apple.com/${country}/rss/customerreviews/page=${page}/id=${appId}/sortby=mostrecent/json`;
      console.log(`请求 ${country.toUpperCase()} 第 ${page} 页: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`${country.toUpperCase()} 地区第 ${page} 页未找到数据 (404)，停止收集`);
          break;
        }
        console.warn(`${country.toUpperCase()} 第 ${page} 页请求失败: ${response.status} - ${url}`);
        page++;
        continue;
      }
      
      console.log(`${country.toUpperCase()} 第 ${page} 页请求成功 (${response.status})`);
      
      const data = await response.json();
      const entries = data.feed?.entry || [];
      
      // 第一页的第一个条目通常是应用信息，需要跳过
      const reviewEntries = page === 1 ? entries.slice(1) : entries;
      
      console.log(`${country.toUpperCase()} 第 ${page} 页获取到 ${reviewEntries.length} 条原始数据`);
      
      if (reviewEntries.length === 0) {
        console.log(`${country.toUpperCase()} 第 ${page} 页无数据，停止收集`);
        break;
      }
      
      for (const entry of reviewEntries) {
        if (reviews.length >= targetCount) break;
        
        // 检查是否是重复评论（通过内容和作者判断）
        const isDuplicate = reviews.some(r => 
          r.author === entry.author?.name?.label && 
          r.content === entry.content?.label
        );
        
        if (!isDuplicate) {
          reviews.push({
            id: entry.id?.label || `${appId}-${country}-${page}-${reviews.length}`,
            title: entry.title?.label || '',
            content: entry.content?.label || '',
            rating: parseInt(entry['im:rating']?.label || '0'),
            author: entry.author?.name?.label || 'Anonymous',
            date: entry.updated?.label || new Date().toISOString(),
            version: entry['im:version']?.label
          });
        }
      }
      
      page++;
      
      // 如果这页没有新的评论，可能已经到底了
      if (reviewEntries.length < 10) {
        break;
      }
      
    } catch (error) {
      console.error(`收集 ${country} 第 ${page} 页时出错:`, error);
      page++;
    }
  }
  
  return reviews;
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
  // 提取所有评论文本
  const texts = reviews.map(review => `${review.title} ${review.content}`);
  
  // 使用我们自己的文本分析工具
  return analyzeWordFrequency(texts);
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
    
    // 解析URL获取应用ID和国家代码
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
      fetchAppReviewsEnhanced(appId, country, 500) // 使用增强版收集方法
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
      reviews: reviews,
      dataSourceInfo: {
        source: 'iTunes RSS Feed (Enhanced Multi-Region)',
        limitation: 'Recent reviews only, collected from multiple regions',
        totalAppReviews: appInfo.ratingCount,
        collectedReviews: reviews.length,
        countriesCollected,
        explanation: `通过多地区策略收集，从 ${countriesCollected.length} 个地区获取了 ${reviews.length} 条最新评论，相比单地区收集获得了更全面的用户反馈。`,
        enhancedFeatures: [
          '多地区评论收集',
          '重复评论去除',
          '智能国家优先级',
          '更大样本量'
        ]
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