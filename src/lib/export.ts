export interface ExportData {
  wordFrequency: Array<{ word: string; count: number }>;
  reviews?: Array<{
    id: string;
    title: string;
    content: string;
    rating: number;
    author: string;
    date: string;
    version?: string;
    country?: string;
  }>;
  appInfo: {
    name: string;
    developer: string;
    rating: number;
    ratingCount: number;
  };
}

export function downloadCSV(data: ExportData, filename: string = 'app-reviews-analysis') {
  // 创建应用基本信息
  const appInfoSection = [
    ['=== 应用基本信息 ==='],
    ['应用名称', data.appInfo.name],
    ['开发者', data.appInfo.developer],
    ['平均评分', data.appInfo.rating.toString()],
    ['评价总数', data.appInfo.ratingCount.toString()],
    ['分析时间', new Date().toLocaleString('zh-CN')],
    ['']
  ];

  // 创建词频统计信息
  const wordFrequencySection = [
    ['=== 高频词汇统计 (Top 50) ==='],
    ['排名', '关键词', '出现次数', '占比'],
    ...data.wordFrequency.slice(0, 50).map((item, index) => {
      const totalWords = data.wordFrequency.reduce((sum, w) => sum + w.count, 0);
      const percentage = ((item.count / totalWords) * 100).toFixed(2);
      return [(index + 1).toString(), item.word, item.count.toString(), percentage + '%'];
    }),
    ['']
  ];

  // 创建国家分布统计
  let countryStatsSection: string[][] = [];
  if (data.reviews && data.reviews.length > 0) {
    const countryStats: { [country: string]: number } = {};
    data.reviews.forEach(review => {
      const country = review.country || '未知';
      countryStats[country] = (countryStats[country] || 0) + 1;
    });
    
    const sortedCountries = Object.entries(countryStats)
      .sort(([, a], [, b]) => b - a);
    
    if (sortedCountries.length > 1) {
      countryStatsSection = [
        ['=== 评论来源地区分布 ==='],
        ['国家/地区', '评论数量', '占比'],
        ...sortedCountries.map(([country, count]) => {
          const percentage = ((count / data.reviews!.length) * 100).toFixed(1);
          return [country, count.toString(), percentage + '%'];
        }),
        ['']
      ];
    }
  }

  // 创建评论详细数据
  let reviewsSection: string[][] = [];
  if (data.reviews && data.reviews.length > 0) {
    reviewsSection = [
      [`=== 评论详细数据 (共 ${data.reviews.length} 条) ===`],
      ['序号', '评论标题', '评论内容', '评分', '作者', '发布日期', '版本', '来源国家'],
      ...data.reviews.map((review, index) => [
        (index + 1).toString(),
        review.title || '无标题',
        review.content.replace(/"/g, '""').replace(/\n/g, ' '), // 处理换行和引号
        review.rating.toString(),
        review.author || '匿名',
        new Date(review.date).toLocaleString('zh-CN'),
        review.version || '未知',
        review.country || '未知'
      ])
    ];
  }

  // 合并所有部分
  const allSections = [
    ...appInfoSection,
    ...countryStatsSection,
    ...wordFrequencySection,
    ...reviewsSection
  ];

  // 转换为 CSV 格式
  const csvContent = allSections
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  // 添加 BOM 以支持中文
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // 创建下载链接
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}