// 高级数据分析工具函数

export interface ReviewData {
  id: string;
  title: string;
  content: string;
  rating: number;
  author: string;
  date: string;
  version?: string;
  country?: string;
}

// 时间趋势分析
export function analyzeTimeTrends(reviews: ReviewData[]) {
  // 按日期分组
  const dateGroups: { [date: string]: ReviewData[] } = {};
  
  reviews.forEach(review => {
    const date = new Date(review.date).toISOString().split('T')[0];
    if (!dateGroups[date]) {
      dateGroups[date] = [];
    }
    dateGroups[date].push(review);
  });

  // 生成时间序列数据
  const timeSeriesData = Object.entries(dateGroups)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, dayReviews]) => ({
      date,
      reviewCount: dayReviews.length,
      averageRating: dayReviews.reduce((sum, r) => sum + r.rating, 0) / dayReviews.length,
      positiveCount: dayReviews.filter(r => r.rating >= 4).length,
      negativeCount: dayReviews.filter(r => r.rating <= 2).length
    }));

  return timeSeriesData;
}

// 评分分布分析
export function analyzeRatingDistribution(reviews: ReviewData[]) {
  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  reviews.forEach(review => {
    ratingCounts[review.rating as keyof typeof ratingCounts]++;
  });

  const total = reviews.length;
  const distribution = Object.entries(ratingCounts).map(([rating, count]) => ({
    rating: parseInt(rating),
    count,
    percentage: (count / total) * 100
  }));

  return distribution;
}

// 国家/地区分析
export function analyzeByCountry(reviews: ReviewData[]) {
  const countryGroups: { [country: string]: ReviewData[] } = {};
  
  reviews.forEach(review => {
    const country = review.country || 'Unknown';
    if (!countryGroups[country]) {
      countryGroups[country] = [];
    }
    countryGroups[country].push(review);
  });

  const countryData = Object.entries(countryGroups).map(([country, countryReviews]) => ({
    country,
    averageRating: countryReviews.reduce((sum, r) => sum + r.rating, 0) / countryReviews.length,
    totalReviews: countryReviews.length,
    ratingDistribution: analyzeRatingDistribution(countryReviews)
  }));

  return countryData.sort((a, b) => b.totalReviews - a.totalReviews);
}

// 用户行为分析
export function analyzeUserBehavior(reviews: ReviewData[]) {
  // 评论长度分布
  const lengthRanges = [
    { range: '0-25', min: 0, max: 25 },
    { range: '26-50', min: 26, max: 50 },
    { range: '51-100', min: 51, max: 100 },
    { range: '101-200', min: 101, max: 200 },
    { range: '201+', min: 201, max: Infinity }
  ];

  const reviewLengthDistribution = lengthRanges.map(({ range, min, max }) => {
    const reviewsInRange = reviews.filter(r => {
      const length = (r.title + ' ' + r.content).length;
      return length >= min && length <= max;
    });
    
    return {
      lengthRange: range,
      count: reviewsInRange.length,
      averageRating: reviewsInRange.length > 0 
        ? reviewsInRange.reduce((sum, r) => sum + r.rating, 0) / reviewsInRange.length 
        : 0
    };
  });

  // 用户活跃度分析
  const userCounts: { [author: string]: number } = {};
  reviews.forEach(review => {
    userCounts[review.author] = (userCounts[review.author] || 0) + 1;
  });

  const singleReviewUsers = Object.values(userCounts).filter(count => count === 1).length;
  const multipleReviewUsers = Object.values(userCounts).filter(count => count > 1).length;
  const totalUsers = Object.keys(userCounts).length;

  const userActivity = [
    {
      userType: '单次评论用户',
      count: singleReviewUsers,
      percentage: (singleReviewUsers / totalUsers) * 100
    },
    {
      userType: '多次评论用户',
      count: multipleReviewUsers,
      percentage: (multipleReviewUsers / totalUsers) * 100
    }
  ];

  // 评分与评论长度关系
  const ratingLengthMap: { [rating: number]: number[] } = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  reviews.forEach(review => {
    const length = (review.title + ' ' + review.content).length;
    ratingLengthMap[review.rating].push(length);
  });

  const ratingVsLength = Object.entries(ratingLengthMap).map(([rating, lengths]) => ({
    rating: parseInt(rating),
    averageLength: lengths.length > 0 ? lengths.reduce((sum, len) => sum + len, 0) / lengths.length : 0,
    count: lengths.length
  }));

  return {
    reviewLengthDistribution,
    userActivity,
    ratingVsLength
  };
}

// 版本分析
export function analyzeVersions(reviews: ReviewData[]) {
  const versionGroups: { [version: string]: ReviewData[] } = {};
  
  reviews.forEach(review => {
    const version = review.version || 'Unknown';
    if (!versionGroups[version]) {
      versionGroups[version] = [];
    }
    versionGroups[version].push(review);
  });

  const versionData = Object.entries(versionGroups)
    .filter(([version]) => version !== 'Unknown')
    .map(([version, versionReviews]) => {
      // 获取该版本的第一个评论日期作为发布日期
      const releaseDates = versionReviews.map(r => new Date(r.date));
      const releaseDate = new Date(Math.min(...releaseDates.map(d => d.getTime())));

      // 分析该版本的主要问题
      const negativeReviews = versionReviews.filter(r => r.rating <= 2);
      const topIssues = extractTopIssues(negativeReviews);

      return {
        version,
        averageRating: versionReviews.reduce((sum, r) => sum + r.rating, 0) / versionReviews.length,
        reviewCount: versionReviews.length,
        releaseDate: releaseDate.toISOString(),
        positiveCount: versionReviews.filter(r => r.rating >= 4).length,
        negativeCount: versionReviews.filter(r => r.rating <= 2).length,
        topIssues
      };
    })
    .sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());

  return versionData;
}

// 关键词趋势分析
export function analyzeKeywordTrends(reviews: ReviewData[], wordFrequency: Array<{ word: string; count: number }>) {
  const topKeywords = wordFrequency.slice(0, 15).map(w => w.word);
  
  // 按日期分组并统计每个关键词的频率
  const dateGroups: { [date: string]: ReviewData[] } = {};
  reviews.forEach(review => {
    const date = new Date(review.date).toISOString().split('T')[0];
    if (!dateGroups[date]) {
      dateGroups[date] = [];
    }
    dateGroups[date].push(review);
  });

  const trendData = Object.entries(dateGroups)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, dayReviews]) => {
      const dayData: any = { date };
      
      topKeywords.forEach(keyword => {
        dayData[keyword] = dayReviews.reduce((count, review) => {
          const text = (review.title + ' ' + review.content).toLowerCase();
          return count + (text.includes(keyword.toLowerCase()) ? 1 : 0);
        }, 0);
      });
      
      return dayData;
    });

  // 新关键词发现（模拟数据）
  const recentReviews = reviews.filter(r => {
    const reviewDate = new Date(r.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return reviewDate >= thirtyDaysAgo;
  });

  const newKeywords = topKeywords.slice(5, 15).map(keyword => ({
    keyword,
    firstAppeared: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    frequency: Math.floor(Math.random() * 50) + 10,
    trend: ['rising', 'stable', 'declining'][Math.floor(Math.random() * 3)] as 'rising' | 'stable' | 'declining'
  }));

  return {
    trendData,
    newKeywords,
    topKeywords
  };
}

// 提取主要问题
function extractTopIssues(negativeReviews: ReviewData[]): string[] {
  const commonIssues = ['crash', 'bug', 'slow', 'loading', 'error', 'freeze', 'glitch', 'problem'];
  const issueCounts: { [issue: string]: number } = {};

  negativeReviews.forEach(review => {
    const text = (review.title + ' ' + review.content).toLowerCase();
    commonIssues.forEach(issue => {
      if (text.includes(issue)) {
        issueCounts[issue] = (issueCounts[issue] || 0) + 1;
      }
    });
  });

  return Object.entries(issueCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([issue]) => issue);
}

// 生成模拟演示数据（用于开发测试）
export function generateMockAnalysisData(reviews: ReviewData[]) {
  return {
    timeTrends: analyzeTimeTrends(reviews),
    ratingDistribution: analyzeRatingDistribution(reviews),
    countryAnalysis: analyzeByCountry(reviews),
    userBehavior: analyzeUserBehavior(reviews),
    versionAnalysis: analyzeVersions(reviews),
    keywordTrends: analyzeKeywordTrends(reviews, [
      { word: 'great', count: 45 },
      { word: 'good', count: 38 },
      { word: 'helpful', count: 32 },
      { word: 'easy', count: 28 },
      { word: 'love', count: 25 },
      { word: 'useful', count: 22 },
      { word: 'amazing', count: 20 },
      { word: 'perfect', count: 18 },
      { word: 'excellent', count: 15 },
      { word: 'recommend', count: 12 }
    ])
  };
}