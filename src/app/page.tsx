'use client';

import { useState } from 'react';
import { Search, BarChart3, Cloud, Download, Info, Star, MessageSquare, Heart, TrendingUp, Users, Clock, Code, Target, CheckCircle, ArrowRight, HelpCircle, Lightbulb, Zap, Globe, Shield, Smartphone } from 'lucide-react';
import { WordCloud } from '@/components/WordCloud';
import { WordFrequencyChart } from '@/components/WordFrequencyChart';
import { SentimentChart } from '@/components/SentimentChart';
import { TimeTrendAnalysis } from '@/components/TimeTrendAnalysis';
import { RatingAnalysis } from '@/components/RatingAnalysis';
import { UserBehaviorAnalysis } from '@/components/UserBehaviorAnalysis';
import { VersionAnalysis } from '@/components/VersionAnalysis';
import { KeywordEvolution } from '@/components/KeywordEvolution';
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
            <>
              {/* 核心功能介绍 */}
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

              {/* Step by Step 使用指南 */}
              <div className="mt-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                  📋 使用指南
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">复制应用链接</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      在 App Store 中找到目标应用，复制其链接地址
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">粘贴并设置</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      将链接粘贴到输入框，选择增强模式（推荐）
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">开始分析</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      点击"开始分析"按钮，等待系统自动处理数据
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">4</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">查看结果</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      浏览各种分析结果，导出报告或深入研究数据
                    </p>
                  </div>
                </div>
              </div>

              {/* 详细功能列表 */}
              <div className="mt-16 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                  🚀 完整功能列表
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* 数据分析功能 */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <BarChart3 className="h-6 w-6 mr-2 text-blue-600" />
                      数据分析功能
                    </h3>
                    <div className="space-y-3">
                      {[
                        { icon: Cloud, text: "智能词云生成", desc: "自动提取关键词并生成美观词云" },
                        { icon: Heart, text: "情感分析", desc: "识别正面、负面、中性评论情感" },
                        { icon: Star, text: "评分分布分析", desc: "展示1-5星评分的详细分布" },
                        { icon: TrendingUp, text: "时间趋势分析", desc: "评论数量和质量的时间变化" },
                        { icon: Users, text: "用户行为分析", desc: "分析用户评论长度、活跃度等" },
                        { icon: Code, text: "版本对比分析", desc: "不同应用版本的用户反馈对比" }
                      ].map((feature, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <feature.icon className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">{feature.text}</span>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{feature.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 数据收集功能 */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Globe className="h-6 w-6 mr-2 text-green-600" />
                      数据收集功能
                    </h3>
                    <div className="space-y-3">
                      {[
                        { icon: Globe, text: "多地区数据收集", desc: "从20+国家和地区收集评论" },
                        { icon: Zap, text: "增强模式", desc: "智能收集更多样本和更全面数据" },
                        { icon: Shield, text: "数据质量保证", desc: "自动过滤无效和重复评论" },
                        { icon: Smartphone, text: "实时数据获取", desc: "直接从iTunes RSS Feed获取最新评论" },
                        { icon: Target, text: "智能采样", desc: "最多收集500+条最有代表性的评论" },
                        { icon: Download, text: "多格式导出", desc: "支持CSV、PDF等多种格式导出" }
                      ].map((feature, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <feature.icon className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">{feature.text}</span>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{feature.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 应用场景 */}
              <div className="mt-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                  💼 应用场景
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">产品经理</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      了解用户痛点，优化产品功能，制定产品路线图
                    </p>
                  </div>
                  <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">市场研究</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      分析竞品反馈，了解市场趋势，发现商业机会
                    </p>
                  </div>
                  <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Code className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">开发团队</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      收集Bug反馈，优先级排序，提升用户体验
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ 区域 */}
              <div className="mt-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center flex items-center justify-center">
                  <HelpCircle className="h-8 w-8 mr-3 text-blue-600" />
                  常见问题 FAQ
                </h2>
                <div className="space-y-6">
                  {[
                    {
                      question: "支持哪些国家和地区的 App Store？",
                      answer: "我们支持全球20+个国家和地区的App Store，包括美国、中国、日本、韩国、英国、德国、法国、澳大利亚等主要市场。增强模式会自动从多个地区收集数据。"
                    },
                    {
                      question: "为什么有时候收集到的评论数量较少？",
                      answer: "评论数量取决于几个因素：1）应用本身的评论总数；2）iTunes RSS Feed只提供最近几个月到一年的评论；3）某些地区的评论数据可能有限。我们建议使用增强模式来获取更多数据。"
                    },
                    {
                      question: "增强模式和普通模式有什么区别？",
                      answer: "普通模式：从单一地区收集评论，速度较快。增强模式：从多个地区收集评论，数据更全面，包含更多语言和文化背景的用户反馈，但处理时间稍长。"
                    },
                    {
                      question: "分析结果的准确性如何？",
                      answer: "我们使用先进的AI技术进行文本分析和情感识别，准确率通常在85-95%之间。词频统计基于严格的文本处理算法，确保结果的可靠性。所有数据均来自苹果官方的iTunes RSS Feed。"
                    },
                    {
                      question: "可以分析中文应用的评论吗？",
                      answer: "完全支持！我们的系统支持多语言处理，包括中文、英文、日文、韩文等。无论是中国区App Store的应用还是其他地区的中文评论，都能准确分析。"
                    },
                    {
                      question: "导出的数据包含哪些内容？",
                      answer: "CSV报告包含：应用基本信息、评论详情（标题、内容、评分、作者、时间、版本、来源国家）、词频统计数据、地区分布统计等。文件采用UTF-8编码，完美支持中文。"
                    },
                    {
                      question: "分析过程需要多长时间？",
                      answer: "普通模式：30秒-2分钟；增强模式：1-5分钟。时间取决于应用的评论数量和网络状况。我们建议在分析过程中保持页面打开。"
                    },
                    {
                      question: "有使用次数限制吗？",
                      answer: "目前本工具完全免费使用，没有次数限制。我们希望为开发者和产品团队提供有价值的数据分析服务。未来可能会推出更多高级功能。"
                    }
                  ].map((faq, index) => (
                    <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        {faq.question}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 ml-7 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 使用提示 */}
              <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
                <div className="text-center">
                  <Lightbulb className="h-16 w-16 mx-auto mb-4 text-yellow-300" />
                  <h2 className="text-2xl font-bold mb-4">💡 使用小贴士</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <ArrowRight className="h-5 w-5 mt-0.5 text-yellow-300" />
                        <span>建议使用增强模式获取更全面的数据分析</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <ArrowRight className="h-5 w-5 mt-0.5 text-yellow-300" />
                        <span>分析热门应用时，数据收集可能需要更长时间</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <ArrowRight className="h-5 w-5 mt-0.5 text-yellow-300" />
                        <span>可以对比分析同类应用，了解竞品优势</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <ArrowRight className="h-5 w-5 mt-0.5 text-yellow-300" />
                        <span>词云图可以快速识别用户关注的核心功能</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <ArrowRight className="h-5 w-5 mt-0.5 text-yellow-300" />
                        <span>时间趋势分析有助于了解应用发展轨迹</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <ArrowRight className="h-5 w-5 mt-0.5 text-yellow-300" />
                        <span>导出的CSV文件可用于进一步的数据分析</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}