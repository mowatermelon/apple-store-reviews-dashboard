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
  logoUrl?: string;
  fileSizeBytes?: number;
  fileSizeMB?: number;
  releaseDate?: string;
  currentVersionReleaseDate?: string;
  formattedReleaseDate?: string;
  formattedUpdateDate?: string;
  daysOnStore?: number;
  yearsOnStore?: string;
}

// 格式化日期为 2021/3/31 15:00 格式
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}/${month}/${day} ${hours}:${minutes}`;
}

// 计算应用在架时长 - 使用更精确的算法
function calculateTimeOnStore(releaseDate: string): { days: number; formatted: string } {
  if (!releaseDate) return { days: 0, formatted: '未知' };
  
  // 将 ISO 格式转换为 YYYY/MM/DD HH:mm:ss 格式
  const date = new Date(releaseDate);
  const formattedDateString = formatDate(releaseDate) + ':00'; // 添加秒数
  
  return calculateDuration(formattedDateString);
}

// 精确的时长计算函数（基于外部提供的算法）
function calculateDuration(releasedDateString: string): { days: number; formatted: string } {
  if (!releasedDateString) return { days: 0, formatted: '' };
  
  // 解析发布时间 (格式: 2021/03/31 15:00:00)
  const dateStr = releasedDateString.split(' ')[0]; // 取日期部分
  const dateParts = dateStr.split('/'); // 分割 2021/03/31
  
  if (dateParts.length !== 3) return { days: 0, formatted: '' };
  
  const year = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]);
  const day = parseInt(dateParts[2]);
  
  // 验证解析结果
  if (isNaN(year) || isNaN(month) || isNaN(day)) return { days: 0, formatted: '' };
  
  const releaseDate = new Date(year, month - 1, day); // month是0-11
  const currentDate = new Date();
  
  // 计算时间差
  const diffTime = currentDate.getTime() - releaseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // 防止负数情况
  if (diffDays < 0) return { days: 0, formatted: '0 天' };
  
  // 计算年、月、日
  let years = 0;
  let months = 0;
  let days = diffDays;
  
  // 粗略计算年份（365天一年）
  if (days >= 365) {
    years = Math.floor(days / 365);
    days = days % 365;
  }
  
  // 粗略计算月份（30天一月）
  if (days >= 30) {
    months = Math.floor(days / 30);
    days = days % 30;
  }
  
  // 格式化输出
  let formatted = '';
  if (years > 0) {
    formatted = `${years} 年 ${months} 月 ${days} 天`;
  } else if (months > 0) {
    formatted = `${months} 月 ${days} 天`;
  } else {
    formatted = `${days} 天`;
  }
  
  return { days: diffDays, formatted };
}

// 字节转换为MB
function bytesToMB(bytes: number): number {
  return Math.round((bytes / (1024 * 1024)) * 100) / 100;
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

// 多国家评论收集策略 - 优化版
async function fetchAppReviewsEnhanced(appId: string, primaryCountry: string, targetCount: number = 500): Promise<ReviewData[]> {
  const allReviews: ReviewData[] = [];
  
  // 主要国家列表，优先收集更多评论
  const countries = [
    primaryCountry,
    'us', 'gb', 'ca', 'au', 'de', 'fr', 'jp', 'kr', 'cn', 'in', 'br', 'mx', 'es', 'it', 'nl', 'se', 'no', 'dk', 'fi'
  ].filter((country, index, arr) => arr.indexOf(country) === index); // 去重

  console.log(`开始从多个地区收集评论，目标: ${targetCount} 条`);

  for (const country of countries) {
    try {
      // 1. 优先国家：若是 primaryCountry，则先检查是否能独立满足需求
      const isPrimaryCountry = country === primaryCountry;
      console.log(`正在收集 ${country.toUpperCase()} 地区的评论${isPrimaryCountry ? '（优先国家）' : '（补充国家）'}...`);
      
      // 2. 对于每个国家，始终请求其可获取的最大评论数（最多500条）
      const countryReviews = await fetchCountryReviews(appId, country, 500);
      
      console.log(`${country.toUpperCase()} 地区收集到 ${countryReviews.length} 条评论`);
      
      // 添加国家标识并去重处理
      const reviewsWithCountry = countryReviews.map(review => ({
        ...review,
        country: country.toUpperCase()
      }));
      
      // 去除重复评论（基于作者和内容）
      const uniqueReviews = reviewsWithCountry.filter(newReview => 
        !allReviews.some(existingReview => 
          existingReview.author === newReview.author && 
          existingReview.content === newReview.content
        )
      );
      
      allReviews.push(...uniqueReviews);
      console.log(`${country.toUpperCase()} 地区新增 ${uniqueReviews.length} 条独特评论，总计: ${allReviews.length}`);
      
      // 3. 终止条件：检查累计评论总数是否 ≥ targetCount
      if (allReviews.length >= targetCount) {
        console.log(`✅ 已达到目标 ${targetCount} 条评论，停止收集后续国家数据`);
        break;
      }
      
      // 4. 若是优先国家且已满足需求，则不再请求其他国家
      if (isPrimaryCountry && allReviews.length >= targetCount) {
        console.log(`✅ 优先国家 ${primaryCountry.toUpperCase()} 已满足 ${targetCount} 条评论需求`);
        break;
      }
      
      // 添加延迟避免请求过快
      if (countries.indexOf(country) < countries.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
    } catch (error) {
      console.warn(`收集 ${country} 地区评论失败:`, error);
      continue;
    }
  }

  // 按日期排序，最新的在前
  allReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  console.log(`总共收集到 ${allReviews.length} 条评论，来自 ${new Set(allReviews.map(r => r.country)).size} 个地区`);
  
  // 如果收集到的评论超过目标数量，取最新的targetCount条
  if (allReviews.length > targetCount) {
    console.log(`评论数量 ${allReviews.length} 超过目标 ${targetCount}，取最新的 ${targetCount} 条`);
    return allReviews.slice(0, targetCount);
  }
  
  return allReviews;
}

// 单个国家评论收集 - 优化版：获取该国家可获取的最大评论数
async function fetchCountryReviews(appId: string, country: string, maxCount: number): Promise<ReviewData[]> {
  const reviews: ReviewData[] = [];
  let page = 1;
  const maxPages = Math.min(20, Math.ceil(maxCount / 25)); // 每页大约25条评论，最多查询20页

  console.log(`开始收集 ${country.toUpperCase()} 地区评论，目标获取该地区所有可用评论（最多 ${maxCount} 条）`);

  while (reviews.length < maxCount && page <= maxPages) {
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
          console.log(`${country.toUpperCase()} 地区第 ${page} 页未找到数据 (404)，该地区评论已收集完毕`);
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
        console.log(`${country.toUpperCase()} 第 ${page} 页无数据，该地区评论收集完毕`);
        break;
      }
      
      let pageNewReviews = 0;
      for (const entry of reviewEntries) {
        if (reviews.length >= maxCount) break;
        
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
          pageNewReviews++;
        }
      }
      
      console.log(`${country.toUpperCase()} 第 ${page} 页新增 ${pageNewReviews} 条独特评论`);
      
      page++;
      
      // 如果这页没有新的评论或评论数量很少，可能已经到底了
      if (pageNewReviews === 0 || reviewEntries.length < 10) {
        console.log(`${country.toUpperCase()} 地区评论已收集完毕，共 ${reviews.length} 条`);
        break;
      }
      
    } catch (error) {
      console.error(`收集 ${country} 第 ${page} 页时出错:`, error);
      page++;
    }
  }
  
  console.log(`✅ ${country.toUpperCase()} 地区最终收集到 ${reviews.length} 条评论`);
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
    
    const fileSizeBytes = app.fileSizeBytes ? parseInt(app.fileSizeBytes) : 0;
    const releaseDate = app.releaseDate;
    const currentVersionReleaseDate = app.currentVersionReleaseDate;
    const timeOnStore = releaseDate ? calculateTimeOnStore(releaseDate) : { days: 0, formatted: '未知' };
    
    return {
      name: app.trackName || 'Unknown App',
      developer: app.artistName || 'Unknown Developer',
      rating: app.averageUserRating || 0,
      ratingCount: app.userRatingCount || 0,
      logoUrl: app.artworkUrl512 || app.artworkUrl100 || app.artworkUrl60,
      fileSizeBytes,
      fileSizeMB: fileSizeBytes ? bytesToMB(fileSizeBytes) : 0,
      releaseDate,
      currentVersionReleaseDate,
      formattedReleaseDate: releaseDate ? formatDate(releaseDate) : '未知',
      formattedUpdateDate: currentVersionReleaseDate ? formatDate(currentVersionReleaseDate) : '未知',
      daysOnStore: timeOnStore.days,
      yearsOnStore: timeOnStore.formatted
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
    const [appInfo, allCollectedReviews] = await Promise.all([
      fetchAppInfo(appId, country),
      fetchAppReviewsEnhanced(appId, country, 500) // 使用增强版收集方法
    ]);
    
    if (!appInfo) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch app information' },
        { status: 404 }
      );
    }

    if (allCollectedReviews.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No reviews found for this app' },
        { status: 404 }
      );
    }

    // 记录实际收集到的总数
    const totalCollectedCount = allCollectedReviews.length;
    
    // 如果收集到超过500条，取最新的500条进行分析
    const reviewsForAnalysis = allCollectedReviews.slice(0, 500);
    
    console.log(`实际收集评论: ${totalCollectedCount} 条，用于分析: ${reviewsForAnalysis.length} 条`);
    
    // 文本分析
    const wordFrequency = processTextAnalysis(reviewsForAnalysis);
    
    // 简单情感分析（基于评分）
    const sentiment = {
      positive: reviewsForAnalysis.filter(r => r.rating >= 4).length,
      neutral: reviewsForAnalysis.filter(r => r.rating === 3).length,
      negative: reviewsForAnalysis.filter(r => r.rating <= 2).length
    };
    
    // 统计收集的地区信息（基于所有收集的评论）
    const countriesSet = new Set(allCollectedReviews.map(r => r.country));
    const countriesCollected = Array.from(countriesSet).filter(Boolean);
    
    const result = {
      appInfo,
      totalReviews: reviewsForAnalysis.length, // 用于分析的评论数
      analyzedReviews: reviewsForAnalysis.length, // 实际分析的评论数
      wordFrequency,
      sentiment,
      reviews: reviewsForAnalysis, // 返回用于分析的评论
      dataSourceInfo: {
        source: 'iTunes RSS Feed (Enhanced Multi-Region)',
        limitation: 'Recent reviews only, collected from multiple regions',
        totalAppReviews: appInfo.ratingCount,
        collectedReviews: totalCollectedCount, // 实际收集的总数
        countriesCollected,
        explanation: `通过多地区策略收集，实际从 ${countriesCollected.length} 个地区获取了 ${totalCollectedCount} 条评论${totalCollectedCount > 500 ? `，分析使用其中最新的 ${reviewsForAnalysis.length} 条` : ''}，相比单地区收集获得了更全面的用户反馈。`,
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