// 轻量级文本处理工具，替代 natural 库以避免 Next.js 兼容性问题

export interface WordFrequency {
  word: string;
  count: number;
}

// 简单的词频统计函数
export function analyzeWordFrequency(texts: string[]): WordFrequency[] {
  // 合并所有文本
  const allText = texts.join(' ').toLowerCase();
  
  // 移除标点符号和数字，保留中文字符
  const cleanText = allText.replace(/[^\w\s\u4e00-\u9fff]/g, ' ');
  
  // 分词（简化处理）
  const words = cleanText.split(/\s+/).filter(word => word.length > 1);
  
  // 停用词列表（英文和中文）
  const stopWords = new Set([
    // 英文停用词
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your',
    'his', 'her', 'its', 'our', 'their', 'very', 'good', 'great', 'nice', 'like', 'love',
    'really', 'just', 'get', 'use', 'using', 'used', 'make', 'makes', 'made', 'work', 'works',
    'working', 'time', 'way', 'need', 'want', 'see', 'know', 'think', 'go', 'going', 'come',
    'app', 'application', 'review', 'rating', 'star', 'stars', 'one', 'two', 'three', 'four', 'five',
    '1', '2', '3', '4', '5', 'first', 'second', 'third', 'last', 'next', 'back', 'best', 'better',
    'much', 'more', 'most', 'many', 'lot', 'lots', 'some', 'any', 'all', 'every', 'each', 'other',
    'same', 'different', 'new', 'old', 'right', 'wrong', 'long', 'short', 'big', 'small', 'high', 'low',
    'easy', 'hard', 'fast', 'slow', 'free', 'pay', 'paid', 'buy', 'bought', 'find', 'found', 'try', 'tried',
    
    // 中文停用词
    '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去',
    '你', '会', '着', '没有', '看', '好', '自己', '这', '那', '里', '下', '来', '个', '出', '为', '用', '对', '可以',
    '应用', '软件', '程序', '评价', '评论', '星', '分', '非常', '还是', '比较', '觉得', '感觉', '挺', '蛮', '太',
    '真的', '确实', '但是', '不过', '只是', '就是', '这个', '那个', '什么', '怎么', '这样', '那样', '如果', '因为'
  ]);
  
  // 统计词频
  const wordCount = new Map<string, number>();
  
  for (const word of words) {
    if (stopWords.has(word) || word.length < 2) continue;
    
    // 过滤纯数字
    if (/^\d+$/.test(word)) continue;
    
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  }
  
  // 转换为数组并排序
  return Array.from(wordCount.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 100); // 返回前 100 个高频词
}

// 简单的情感分析（基于关键词）
export function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const positiveWords = [
    // 英文积极词汇
    'good', 'great', 'excellent', 'amazing', 'awesome', 'fantastic', 'wonderful', 'perfect',
    'love', 'like', 'enjoy', 'helpful', 'useful', 'easy', 'simple', 'fast', 'quick', 'smooth',
    'beautiful', 'nice', 'cool', 'fun', 'interesting', 'recommend', 'impressive', 'satisfied',
    
    // 中文积极词汇
    '好', '很好', '不错', '棒', '赞', '优秀', '完美', '满意', '喜欢', '爱', '推荐', '有用', '方便', '简单',
    '快', '顺畅', '流畅', '漂亮', '美观', '清晰', '准确', '实用', '贴心', '人性化', '智能', '高效'
  ];
  
  const negativeWords = [
    // 英文消极词汇
    'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'dislike', 'annoying', 'frustrating',
    'slow', 'crash', 'bug', 'error', 'problem', 'issue', 'broken', 'useless', 'waste', 'disappointed',
    'confusing', 'complicated', 'difficult', 'hard', 'expensive', 'poor', 'stupid', 'sucks',
    
    // 中文消极词汇
    '差', '糟糕', '垃圾', '烂', '讨厌', '失望', '问题', '错误', '卡', '慢', '崩溃', '闪退', '无用', '浪费',
    '复杂', '困难', '麻烦', '贵', '坑', '骗', '假', '欺骗', '不好用', '不方便', '不准确', '不满意'
  ];
  
  const lowerText = text.toLowerCase();
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) {
      positiveScore++;
    }
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) {
      negativeScore++;
    }
  });
  
  if (positiveScore > negativeScore) {
    return 'positive';
  } else if (negativeScore > positiveScore) {
    return 'negative';
  } else {
    return 'neutral';
  }
}

// 文本清理函数
export function cleanText(text: string): string {
  return text
    .replace(/[^\w\s\u4e00-\u9fff]/g, ' ') // 移除标点符号，保留中文
    .replace(/\s+/g, ' ') // 合并多个空格
    .trim();
}

// 语言检测（简化版）
export function detectLanguage(text: string): 'zh' | 'en' | 'mixed' {
  const chineseChars = text.match(/[\u4e00-\u9fff]/g) || [];
  const englishChars = text.match(/[a-zA-Z]/g) || [];
  
  const chineseRatio = chineseChars.length / text.length;
  const englishRatio = englishChars.length / text.length;
  
  if (chineseRatio > 0.3) {
    return 'zh';
  } else if (englishRatio > 0.3) {
    return 'en';
  } else {
    return 'mixed';
  }
}