import { NextRequest, NextResponse } from 'next/server';
import { 
  parseAppStoreUrl, 
  fetchAppInfo,
  fetchAppReviews,
  processAdvancedTextAnalysis,
  analyzeSentimentByRating
} from '@/lib/advanced-analytics';

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
      fetchAppReviews(appId, country, 500) // 明确指定获取 500 条评论
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
    
    // 高级文本分析（与增强版保持一致）
    const wordFrequency = processAdvancedTextAnalysis(reviews);
    
    // 简单情感分析（基于评分）
    const sentiment = analyzeSentimentByRating(reviews);
    
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