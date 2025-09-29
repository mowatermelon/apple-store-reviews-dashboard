import { NextRequest, NextResponse } from 'next/server';
import { 
  ReviewData, 
  parseAppStoreUrl, 
  fetchAppInfo,
  analyzeSentimentByRating,
  fetchCountryReviews,
  processAdvancedTextAnalysis
} from '@/lib/advanced-analytics';

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
  
  return allReviews;
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
    const reviewsForAnalysis = allCollectedReviews;
    
    console.log(`实际收集评论: ${totalCollectedCount} 条`);
    
    // 高级文本分析（使用更精确的外部分词工具）
    const wordFrequency = processAdvancedTextAnalysis(reviewsForAnalysis);
    
    // 简单情感分析（基于评分）
    const sentiment = analyzeSentimentByRating(reviewsForAnalysis);
    
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
        explanation: `通过多地区策略收集，实际从 ${countriesCollected.length} 个地区获取了 ${totalCollectedCount} 条评论，相比单地区收集获得了更全面的用户反馈。`,
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