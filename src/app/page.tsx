'use client';

import { useState } from 'react';
import { Search, BarChart3, Cloud, Download, Info, Star, MessageSquare, Heart, TrendingUp, Users, Clock, Code, Target } from 'lucide-react';
import { WordCloud } from '@/components/WordCloud';
import { WordFrequencyChart } from '@/components/WordFrequencyChart';
import { SentimentChart } from '@/components/SentimentChart';
import { TimeTrendAnalysis } from '@/components/TimeTrendAnalysis';
import { RatingAnalysis } from '@/components/RatingAnalysis';
import { UserBehaviorAnalysis } from '@/components/UserBehaviorAnalysis';
import { VersionAnalysis } from '@/components/VersionAnalysis';
import { KeywordEvolution } from '@/components/KeywordEvolution';
import ClientOnlyPWA from '@/components/ClientOnlyPWA';
import { downloadCSV } from '@/lib/export';
import { generateMockAnalysisData } from '@/lib/advanced-analytics';

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

interface AnalysisResult {
  appInfo: AppInfo;
  totalReviews: number;
  analyzedReviews: number;
  wordFrequency: Array<{ word: string; count: number }>;
  reviews: ReviewData[];
  sentiment?: {
    positive: number;
    negative: number;
    neutral: number;
  };
  dataSourceInfo?: {
    source: string;
    limitation: string;
    totalAppReviews: number;
    collectedReviews: number;
    explanation: string;
    countriesCollected?: string[];
    enhancedFeatures?: string[];
  };
}

export default function Home() {
  const [appUrl, setAppUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [activeAnalysisTab, setActiveAnalysisTab] = useState('overview');
  const [useEnhancedAPI, setUseEnhancedAPI] = useState(true);

  const handleAnalyze = async () => {
    if (!appUrl.trim()) {
      setError('请输入有效的 App Store 链接');
      return;
    }

    // 验证 URL 格式
    const appStoreUrlPattern = /https:\/\/apps\.apple\.com\/[a-z]{2}\/app\/[^\/]+\/id(\d+)/;
    if (!appStoreUrlPattern.test(appUrl)) {
      setError('请输入有效的苹果应用商店链接，例如: https://apps.apple.com/us/app/answer-ai-your-ai-tutor/id6446047896');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const apiEndpoint = useEnhancedAPI ? '/api/analyze-enhanced' : '/api/analyze';
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appUrl }),
      });

      const data = await response.json();

      if (data.success) {
        setAnalysisResult(data.data);
      } else {
        setError(data.error || '分析失败，请稍后重试');
      }
    } catch (err) {
      setError('网络错误，请检查连接后重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!analysisResult) return;
    
    downloadCSV({
      wordFrequency: analysisResult.wordFrequency,
      appInfo: analysisResult.appInfo,
      reviews: analysisResult.reviews
    }, analysisResult.appInfo.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-'));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 头部标题 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              App Store 评论分析工具
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              输入苹果应用商店链接，即可获取应用评论并生成词云、统计图表等可视化分析结果
            </p>
          </div>

          {/* 输入区域 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex flex-col space-y-4">
              <label htmlFor="appUrl" className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                应用商店链接
              </label>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    id="appUrl"
                    type="url"
                    value={appUrl}
                    onChange={(e) => setAppUrl(e.target.value)}
                    placeholder="https://apps.apple.com/us/app/answer-ai-your-ai-tutor/id6446047896"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={isAnalyzing}
                  />
                  
                  {/* 增强模式选择 */}
                  <div className="mt-3 flex items-center space-x-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={useEnhancedAPI}
                        onChange={(e) => setUseEnhancedAPI(e.target.checked)}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        disabled={isAnalyzing}
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        增强模式 
                        <span className="ml-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                          推荐
                        </span>
                      </span>
                    </label>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      多地区收集，获取更多评论数据
                    </div>
                  </div>
                  
                  {error && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                  )}
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>分析中...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5" />
                      <span>开始分析</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 使用说明 */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-medium mb-1">使用说明：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>支持全球各地区 App Store 链接（US、CN、PH 等）</li>
                    <li><strong>增强模式</strong>：从多个地区自动收集评论，获取更多样本</li>
                    <li>智能分析最有用的评论数据（最多 500+ 条）</li>
                    <li>生成词云图、统计图表和深度分析报告</li>
                    <li>支持多语言文本处理（英文、中文、日文等）</li>
                    <li>提供时间趋势、用户行为、版本分析等高级功能</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 分析结果区域 */}
          {analysisResult && (
            <div className="space-y-8">
              {/* 应用基本信息 */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Info className="h-6 w-6 mr-2" />
                  应用信息
                </h2>
                
                {/* 应用logo和基本信息 */}
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                  {/* 应用Logo */}
                  {analysisResult.appInfo.logoUrl && (
                    <div className="flex-shrink-0">
                      <img 
                        src={analysisResult.appInfo.logoUrl} 
                        alt={`${analysisResult.appInfo.name} Logo`}
                        className="w-24 h-24 md:w-32 md:h-32 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600"
                      />
                    </div>
                  )}
                  
                  {/* 基本信息 */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">应用名称</h3>
                      <p className="text-gray-600 dark:text-gray-300">{analysisResult.appInfo.name}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">开发者</h3>
                      <p className="text-gray-600 dark:text-gray-300">{analysisResult.appInfo.developer}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <Star className="h-5 w-5 mr-1 text-yellow-500" />
                        平均评分
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {analysisResult.appInfo.rating}/5.0 ({analysisResult.appInfo.ratingCount.toLocaleString()} 评价)
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <MessageSquare className="h-5 w-5 mr-1" />
                        分析评论
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        已获取 {analysisResult.analyzedReviews} 条
                      </p>
                      {analysisResult.dataSourceInfo?.collectedReviews && 
                       analysisResult.dataSourceInfo.collectedReviews !== analysisResult.analyzedReviews && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          * 实际收集 {analysisResult.dataSourceInfo.collectedReviews} 条，分析使用 {analysisResult.analyzedReviews} 条最新评论
                        </p>
                      )}
                      {analysisResult.analyzedReviews < 500 && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          * 该应用可用评论少于500条
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* 详细信息网格 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {analysisResult.appInfo.fileSizeMB && (
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">应用大小</h3>
                      <p className="text-gray-600 dark:text-gray-300">{analysisResult.appInfo.fileSizeMB} MB</p>
                    </div>
                  )}
                  {analysisResult.appInfo.formattedReleaseDate && (
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">上架时间</h3>
                      <p className="text-gray-600 dark:text-gray-300">{analysisResult.appInfo.formattedReleaseDate}</p>
                    </div>
                  )}
                  {analysisResult.appInfo.formattedUpdateDate && (
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">更新时间</h3>
                      <p className="text-gray-600 dark:text-gray-300">{analysisResult.appInfo.formattedUpdateDate}</p>
                    </div>
                  )}
                  {analysisResult.appInfo.yearsOnStore && (
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center justify-center">
                        <Clock className="h-5 w-5 mr-1" />
                        在架时长
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">{analysisResult.appInfo.yearsOnStore}</p>
                    </div>
                  )}
                </div>
                
                {/* 数据来源说明 */}
                {analysisResult.dataSourceInfo && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start space-x-2">
                      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-800 dark:text-blue-300 mb-2">数据来源说明</p>
                        <div className="text-blue-700 dark:text-blue-300 space-y-1">
                          <p>📊 <strong>总评论数：</strong>{analysisResult.dataSourceInfo.totalAppReviews.toLocaleString()} 条（应用发布以来的全部评论）</p>
                          <p>🔍 <strong>实际收集：</strong>{analysisResult.dataSourceInfo.collectedReviews} 条（从多地区收集的评论总数）</p>
                          <p>🎯 <strong>本次分析：</strong>{analysisResult.analyzedReviews} 条（{
                            analysisResult.dataSourceInfo.collectedReviews > analysisResult.analyzedReviews 
                              ? `从 ${analysisResult.dataSourceInfo.collectedReviews} 条中选取的最新评论`
                              : '全部收集的评论'
                          }）</p>
                          
                          {analysisResult.dataSourceInfo.countriesCollected && analysisResult.dataSourceInfo.countriesCollected.length > 1 && (() => {
                            // 统计各国评论数量
                            const countryStats: { [country: string]: number } = {};
                            analysisResult.reviews.forEach(review => {
                              const country = review.country || '未知';
                              countryStats[country] = (countryStats[country] || 0) + 1;
                            });
                            
                            const sortedCountries = Object.entries(countryStats)
                              .sort(([, a], [, b]) => b - a)
                              .slice(0, 5); // 只显示前5个地区
                            
                            return (
                              <div>
                                <p>🌍 <strong>收集地区：</strong>{analysisResult.dataSourceInfo.countriesCollected.length} 个地区</p>
                                <div className="mt-1 text-xs">
                                  <span className="font-medium">主要来源：</span>
                                  {sortedCountries.map(([country, count], index) => (
                                    <span key={country} className="ml-1">
                                      {country}({count}条){index < sortedCountries.length - 1 ? ', ' : ''}
                                    </span>
                                  ))}
                                  {Object.keys(countryStats).length > 5 && (
                                    <span className="ml-1 text-gray-500">等</span>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                          
                          <p>💡 <strong>说明：</strong>{analysisResult.dataSourceInfo.explanation}</p>
                          
                          {analysisResult.dataSourceInfo.enhancedFeatures && (
                            <div className="mt-2">
                              <p className="text-sm font-medium mb-1">✨ 增强功能：</p>
                              <div className="flex flex-wrap gap-1">
                                {analysisResult.dataSourceInfo.enhancedFeatures.map((feature, index) => (
                                  <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded">
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <p className="text-xs mt-2 opacity-75">
                            iTunes RSS Feed 是苹果官方提供的评论数据接口，但仅提供最近几个月到一年的评论数据，无法获取全部历史评论。
                            {analysisResult.dataSourceInfo.countriesCollected && analysisResult.dataSourceInfo.countriesCollected.length > 1 && 
                              '增强模式通过多地区收集策略获取了更全面的用户反馈。'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 分析标签页导航 */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <nav className="flex space-x-8 px-8 pt-8 pb-4" aria-label="Tabs">
                    {[
                      { id: 'overview', name: '总览', icon: Cloud },
                      { id: 'trends', name: '时间趋势', icon: TrendingUp },
                      { id: 'ratings', name: '评分分析', icon: Star },
                      { id: 'users', name: '用户行为', icon: Users },
                      { id: 'versions', name: '版本分析', icon: Code },
                      { id: 'keywords', name: '关键词趋势', icon: Target }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveAnalysisTab(tab.id)}
                        className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                          activeAnalysisTab === tab.id
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                      >
                        <tab.icon className="h-5 w-5 mr-2" />
                        {tab.name}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-8">
                  {/* 总览标签页 */}
                  {activeAnalysisTab === 'overview' && (
                    <div className="space-y-8">
                      {/* 可视化结果 */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* 词云图 */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                            <Cloud className="h-5 w-5 mr-2" />
                            关键词词云
                          </h3>
                          <div className="h-80 w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden relative">
                            <WordCloud data={analysisResult.wordFrequency} className="w-full h-full" />
                          </div>
                        </div>

                        {/* 高频词统计 */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                            <BarChart3 className="h-5 w-5 mr-2" />
                            Top 20 高频词
                          </h3>
                          <div className="h-80 bg-white dark:bg-gray-800 rounded-lg p-4">
                            <WordFrequencyChart data={analysisResult.wordFrequency} />
                          </div>
                        </div>
                      </div>

                      {/* 情感分析 */}
                      {analysisResult.sentiment && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                            <Heart className="h-5 w-5 mr-2" />
                            评论情感分布
                          </h3>
                          <div className="flex justify-center">
                            <SentimentChart sentiment={analysisResult.sentiment} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 时间趋势分析 */}
                  {activeAnalysisTab === 'trends' && (
                    <TimeTrendAnalysis data={generateMockAnalysisData(analysisResult.reviews).timeTrends} />
                  )}

                  {/* 评分分析 */}
                  {activeAnalysisTab === 'ratings' && (
                    <RatingAnalysis 
                      overallDistribution={generateMockAnalysisData(analysisResult.reviews).ratingDistribution}
                      countryData={generateMockAnalysisData(analysisResult.reviews).countryAnalysis}
                    />
                  )}

                  {/* 用户行为分析 */}
                  {activeAnalysisTab === 'users' && (
                    <UserBehaviorAnalysis data={generateMockAnalysisData(analysisResult.reviews).userBehavior} />
                  )}

                  {/* 版本分析 */}
                  {activeAnalysisTab === 'versions' && (
                    <VersionAnalysis versionData={generateMockAnalysisData(analysisResult.reviews).versionAnalysis} />
                  )}

                  {/* 关键词趋势 */}
                  {activeAnalysisTab === 'keywords' && (() => {
                    const analysisData = generateMockAnalysisData(analysisResult.reviews);
                    return (
                      <KeywordEvolution 
                        trendData={analysisData.keywordTrends.trendData}
                        newKeywords={analysisData.keywordTrends.newKeywords}
                        topKeywords={analysisData.keywordTrends.topKeywords}
                      />
                    );
                  })()}
                </div>
              </div>

              {/* 导出功能 */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Download className="h-6 w-6 mr-2" />
                  导出数据
                </h2>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={handleDownloadCSV}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center space-x-2"
                    >
                      <Download className="h-5 w-5" />
                      <span>下载完整报告 ({analysisResult.reviews.length} 条评论)</span>
                    </button>
                    <button
                      disabled
                      className="px-6 py-3 bg-gray-400 text-white font-semibold rounded-lg cursor-not-allowed flex items-center space-x-2"
                    >
                      <Download className="h-5 w-5" />
                      <span>下载 PDF 报告 (即将推出)</span>
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>📊 完整报告包含：应用信息、地区分布统计、词频统计、评论详情（含来源国家）</p>
                    <p>🌍 新增功能：评论来源国家/地区信息，支持多地区数据对比分析</p>
                    <p>💡 文件采用 UTF-8 编码，支持中文显示，可用 Excel 或 Numbers 打开</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 功能特性 */}
          {!analysisResult && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
                <Cloud className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">智能词云</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  自动生成美观的词云图，直观展示评论中的高频关键词
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
                <BarChart3 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">数据统计</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  提供详细的词频统计和可视化图表，帮助深入了解用户反馈
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
                <Download className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">报告导出</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  支持导出 CSV 和 PDF 格式的分析报告，便于保存和分享
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* PWA 安装提示 */}
      <ClientOnlyPWA />
    </main>
  );
}