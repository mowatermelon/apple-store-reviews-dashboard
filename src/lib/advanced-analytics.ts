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

export interface AppInfo {
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

// 公共工具函数

// 格式化日期为 2021/3/31 15:00 格式
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}/${month}/${day} ${hours}:${minutes}`;
}

// 精确的时长计算函数（基于外部提供的算法）
export function calculateDuration(releasedDateString: string): { days: number; formatted: string } {
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

// 计算应用在架时长 - 使用更精确的算法
export function calculateTimeOnStore(releaseDate: string): { days: number; formatted: string } {
  if (!releaseDate) return { days: 0, formatted: '未知' };
  
  // 将 ISO 格式转换为 YYYY/MM/DD HH:mm:ss 格式
  const formattedDateString = formatDate(releaseDate) + ':00'; // 添加秒数
  
  return calculateDuration(formattedDateString);
}

// 字节转换为MB
export function bytesToMB(bytes: number): number {
  return Math.round((bytes / (1024 * 1024)) * 100) / 100;
}

// 提取 App ID 和国家代码
export function parseAppStoreUrl(url: string): { appId: string; country: string } | null {
  const match = url.match(/https:\/\/apps\.apple\.com\/([a-z]{2})\/app\/[^\/]+\/id(\d+)/);
  if (!match) return null;
  
  return {
    country: match[1],
    appId: match[2]
  };
}

// 获取应用基本信息
export async function fetchAppInfo(appId: string, country: string): Promise<AppInfo | null> {
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

// 通用的单地区评论收集函数
export async function fetchAppReviews(appId: string, country: string, targetCount: number = 500): Promise<ReviewData[]> {
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

// 通用的文本分析函数
export function processBasicTextAnalysis(reviews: ReviewData[]): Array<{ word: string; count: number }> {
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

// 高级文本分析函数（使用外部分词工具）
export function processAdvancedTextAnalysis(reviews: ReviewData[]): Array<{ word: string; count: number }> {
  // 动态导入外部文本分析工具
  try {
    // 尝试使用更高级的分词工具
    const { analyzeWordFrequency } = require('@/lib/text-analysis');
    
    // 提取所有评论文本
    const texts = reviews.map(review => `${review.title} ${review.content}`);
    
    // 使用外部分词工具
    return analyzeWordFrequency(texts);
  } catch (error) {
    console.warn('高级文本分析工具不可用，降级使用基础分析:', error);
    // 如果外部工具不可用，降级使用基础分析
    return processBasicTextAnalysis(reviews);
  }
}

// 简单情感分析（基于评分）
export function analyzeSentimentByRating(reviews: ReviewData[]) {
  return {
    positive: reviews.filter(r => r.rating >= 4).length,
    neutral: reviews.filter(r => r.rating === 3).length,
    negative: reviews.filter(r => r.rating <= 2).length
  };
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

// 单个国家评论收集 - 优化版：获取该国家可获取的最大评论数
export async function fetchCountryReviews(appId: string, country: string, maxCount: number): Promise<ReviewData[]> {
  const reviews: ReviewData[] = [];
  let page = 1;
  const maxPages = Math.min(10, Math.ceil(maxCount / 50)); // 每页大约50条评论，最多查询10页

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