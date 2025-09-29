'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';

interface VersionData {
  version: string;
  averageRating: number;
  reviewCount: number;
  releaseDate: string;
  positiveCount: number;
  negativeCount: number;
  topIssues: string[];
}

interface VersionAnalysisProps {
  versionData: VersionData[];
  title?: string;
}

export function VersionAnalysis({ versionData, title = "版本关联分析" }: VersionAnalysisProps) {
  if (!versionData || versionData.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">暂无版本分析数据</p>
      </div>
    );
  }

  // 按版本排序
  const sortedVersions = [...versionData].sort((a, b) => 
    new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
  );

  // 计算版本间的变化
  const versionChanges = sortedVersions.map((version, index) => {
    if (index === 0) return { ...version, ratingChange: 0, reviewChange: 0 };
    
    const prevVersion = sortedVersions[index - 1];
    return {
      ...version,
      ratingChange: version.averageRating - prevVersion.averageRating,
      reviewChange: version.reviewCount - prevVersion.reviewCount
    };
  });

  return (
    <div className="w-full space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      
      {/* 版本评分趋势 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">版本评分变化趋势</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sortedVersions} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="version" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                domain={[1, 5]}
                fontSize={12}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                        <p className="font-semibold">版本 {label}</p>
                        <p className="text-blue-600 dark:text-blue-400">
                          平均评分: {data.averageRating.toFixed(2)}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          评论数: {data.reviewCount}
                        </p>
                        <p className="text-xs text-gray-500">
                          发布: {new Date(data.releaseDate).toLocaleDateString()}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="averageRating" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 版本评论数量对比 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">版本评论数量对比</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedVersions} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="version" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                        <p className="font-semibold">版本 {data.version}</p>
                        <p className="text-blue-600 dark:text-blue-400">
                          评论数: {data.reviewCount}
                        </p>
                        <p className="text-green-600 dark:text-green-400">
                          积极: {data.positiveCount}
                        </p>
                        <p className="text-red-600 dark:text-red-400">
                          消极: {data.negativeCount}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="positiveCount" stackId="a" fill="#10B981" name="积极评论" />
              <Bar dataKey="negativeCount" stackId="a" fill="#EF4444" name="消极评论" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 版本变化洞察 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">版本更新影响分析</h4>
        <div className="space-y-4">
          {versionChanges.slice(1).map((version, index) => (
            <div key={version.version} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h5 className="font-semibold text-lg">版本 {version.version}</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    发布时间: {new Date(version.releaseDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    version.ratingChange > 0 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : version.ratingChange < 0 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {version.ratingChange > 0 ? '↗' : version.ratingChange < 0 ? '↘' : '→'} 
                    {version.ratingChange.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {version.averageRating.toFixed(1)}
                  </div>
                  <p className="text-xs text-blue-800 dark:text-blue-300">平均评分</p>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">
                    {version.positiveCount}
                  </div>
                  <p className="text-xs text-green-800 dark:text-green-300">积极评论</p>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded">
                  <div className="text-xl font-bold text-red-600 dark:text-red-400">
                    {version.negativeCount}
                  </div>
                  <p className="text-xs text-red-800 dark:text-red-300">消极评论</p>
                </div>
              </div>

              {/* 主要问题 */}
              {version.topIssues && version.topIssues.length > 0 && (
                <div>
                  <h6 className="font-medium text-sm mb-2">主要问题反馈:</h6>
                  <div className="flex flex-wrap gap-2">
                    {version.topIssues.map((issue, issueIndex) => (
                      <span 
                        key={issueIndex}
                        className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-xs rounded"
                      >
                        {issue}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 版本总结统计 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">版本表现总结</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-3 font-medium">版本</th>
                <th className="text-right py-2 px-3 font-medium">发布日期</th>
                <th className="text-right py-2 px-3 font-medium">平均评分</th>
                <th className="text-right py-2 px-3 font-medium">评论总数</th>
                <th className="text-right py-2 px-3 font-medium">积极率</th>
                <th className="text-right py-2 px-3 font-medium">评分变化</th>
              </tr>
            </thead>
            <tbody>
              {versionChanges.map((version, index) => {
                const positiveRate = ((version.positiveCount / version.reviewCount) * 100);
                return (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-3 font-medium">{version.version}</td>
                    <td className="py-2 px-3 text-right text-xs">
                      {new Date(version.releaseDate).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3 text-right font-medium">
                      {version.averageRating.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right">{version.reviewCount}</td>
                    <td className="py-2 px-3 text-right text-green-600 dark:text-green-400">
                      {positiveRate.toFixed(1)}%
                    </td>
                    <td className={`py-2 px-3 text-right font-medium ${
                      version.ratingChange > 0 
                        ? 'text-green-600 dark:text-green-400'
                        : version.ratingChange < 0 
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {index === 0 ? '--' : (version.ratingChange > 0 ? '+' : '') + version.ratingChange.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}