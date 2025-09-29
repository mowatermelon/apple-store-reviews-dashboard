'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useState } from 'react';

interface KeywordTrendData {
  date: string;
  [keyword: string]: string | number;
}

interface NewKeywordData {
  keyword: string;
  firstAppeared: string;
  frequency: number;
  trend: 'rising' | 'stable' | 'declining';
}

interface KeywordEvolutionProps {
  trendData: KeywordTrendData[];
  newKeywords: NewKeywordData[];
  topKeywords: string[];
  title?: string;
}

export function KeywordEvolution({ 
  trendData, 
  newKeywords, 
  topKeywords, 
  title = "关键词演化趋势分析" 
}: KeywordEvolutionProps) {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(topKeywords.slice(0, 5));
  const [viewMode, setViewMode] = useState<'line' | 'area'>('line');

  if (!trendData || trendData.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">暂无关键词趋势数据</p>
      </div>
    );
  }

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword].slice(0, 8) // 最多显示8个关键词
    );
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('line')}
            className={`px-3 py-1 text-xs rounded ${
              viewMode === 'line' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            折线图
          </button>
          <button
            onClick={() => setViewMode('area')}
            className={`px-3 py-1 text-xs rounded ${
              viewMode === 'area' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            面积图
          </button>
        </div>
      </div>
      
      {/* 关键词选择器 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">选择关键词 (最多8个)</h4>
        <div className="flex flex-wrap gap-2">
          {topKeywords.map((keyword) => (
            <button
              key={keyword}
              onClick={() => toggleKeyword(keyword)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedKeywords.includes(keyword)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {keyword}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          当前选中: {selectedKeywords.length}/8 个关键词
        </p>
      </div>

      {/* 关键词趋势图 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">关键词频率时间趋势</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'line' ? (
              <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                          <p className="font-semibold">{formatDate(label)}</p>
                          {payload.map((entry, index) => (
                            <p key={index} style={{ color: entry.color }}>
                              {entry.dataKey}: {entry.value}次
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {selectedKeywords.map((keyword, index) => (
                  <Line
                    key={keyword}
                    type="monotone"
                    dataKey={keyword}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            ) : (
              <AreaChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                          <p className="font-semibold">{formatDate(label)}</p>
                          {payload.map((entry, index) => (
                            <p key={index} style={{ color: entry.color }}>
                              {entry.dataKey}: {entry.value}次
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {selectedKeywords.map((keyword, index) => (
                  <Area
                    key={keyword}
                    type="monotone"
                    dataKey={keyword}
                    stackId="1"
                    stroke={colors[index % colors.length]}
                    fill={colors[index % colors.length]}
                    fillOpacity={0.3}
                  />
                ))}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 新兴关键词发现 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">新兴关键词发现</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {newKeywords.slice(0, 9).map((item, index) => (
            <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-medium text-gray-900 dark:text-white">{item.keyword}</h5>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  item.trend === 'rising' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : item.trend === 'declining'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                }`}>
                  {item.trend === 'rising' ? '📈 上升' : item.trend === 'declining' ? '📉 下降' : '➡️ 稳定'}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                首次出现: {new Date(item.firstAppeared).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                当前频率: {item.frequency} 次
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 关键词热度排行 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">关键词热度变化排行</h4>
        <div className="space-y-3">
          {selectedKeywords.slice(0, 5).map((keyword, index) => {
            // 计算该关键词的总频率和趋势
            const totalFreq = trendData.reduce((sum, data) => sum + (Number(data[keyword]) || 0), 0);
            const recentData = trendData.slice(-7); // 最近7天
            const earlyData = trendData.slice(0, 7); // 早期7天
            const recentAvg = recentData.reduce((sum, data) => sum + (Number(data[keyword]) || 0), 0) / recentData.length;
            const earlyAvg = earlyData.reduce((sum, data) => sum + (Number(data[keyword]) || 0), 0) / earlyData.length;
            const trendDirection = recentAvg > earlyAvg ? 'up' : recentAvg < earlyAvg ? 'down' : 'stable';
            
            return (
              <div key={keyword} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: colors[selectedKeywords.indexOf(keyword) % colors.length] }}
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{keyword}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">总频率: {totalFreq}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center space-x-1 ${
                    trendDirection === 'up' ? 'text-green-600 dark:text-green-400' :
                    trendDirection === 'down' ? 'text-red-600 dark:text-red-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {trendDirection === 'up' ? '↗️' : trendDirection === 'down' ? '↘️' : '➡️'}
                    <span className="text-sm font-medium">
                      {Math.abs(recentAvg - earlyAvg).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 趋势分析总结 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">趋势分析总结</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {newKeywords.filter(k => k.trend === 'rising').length}
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-300">上升趋势关键词</p>
          </div>
          
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
              {newKeywords.filter(k => k.trend === 'declining').length}
            </div>
            <p className="text-sm text-red-800 dark:text-red-300">下降趋势关键词</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
              {newKeywords.length}
            </div>
            <p className="text-sm text-green-800 dark:text-green-300">新发现关键词总数</p>
          </div>
        </div>
      </div>
    </div>
  );
}