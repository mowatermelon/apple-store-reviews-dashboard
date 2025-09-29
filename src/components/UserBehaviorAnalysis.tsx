'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

interface UserBehaviorData {
  reviewLengthDistribution: Array<{
    lengthRange: string;
    count: number;
    averageRating: number;
  }>;
  userActivity: Array<{
    userType: string;
    count: number;
    percentage: number;
  }>;
  ratingVsLength: Array<{
    rating: number;
    averageLength: number;
    count: number;
  }>;
}

interface UserBehaviorAnalysisProps {
  data: UserBehaviorData;
}

export function UserBehaviorAnalysis({ data }: UserBehaviorAnalysisProps) {
  if (!data) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">暂无用户行为数据</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">用户行为模式分析</h3>
      
      {/* 评论字数分布 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">评论字数分布</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.reviewLengthDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="lengthRange" 
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
                        <p className="font-semibold">{data.lengthRange} 字</p>
                        <p className="text-blue-600 dark:text-blue-400">
                          评论数量: {data.count}
                        </p>
                        <p className="text-green-600 dark:text-green-400">
                          平均评分: {data.averageRating.toFixed(1)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="count" 
                fill="#8B5CF6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* 字数分布洞察 */}
        <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <h5 className="font-medium text-purple-800 dark:text-purple-300 mb-2">📊 分析洞察</h5>
          <div className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
            {data.reviewLengthDistribution.map((item, index) => {
              if (item.averageRating < 3) {
                return (
                  <p key={index}>• {item.lengthRange}字的评论平均评分较低({item.averageRating.toFixed(1)}分)，可能多为负面反馈</p>
                );
              }
              return null;
            }).filter(Boolean)}
          </div>
        </div>
      </div>

      {/* 用户活跃度分析 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">用户活跃度分布</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 用户类型分布图 */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.userActivity} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="userType" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                          <p className="font-semibold">{data.userType}</p>
                          <p className="text-blue-600 dark:text-blue-400">
                            用户数: {data.count}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            占比: {data.percentage.toFixed(1)}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#F59E0B"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 用户活跃度统计 */}
          <div className="space-y-3">
            {data.userActivity.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.userType}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.count} 位用户</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {item.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 评分与评论长度关系 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">评分与评论长度关系</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={data.ratingVsLength} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="rating" 
                type="number" 
                domain={[1, 5]}
                fontSize={12}
                name="评分"
              />
              <YAxis 
                dataKey="averageLength" 
                type="number"
                fontSize={12}
                name="平均字数"
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                        <p className="font-semibold">{data.rating}星评论</p>
                        <p className="text-blue-600 dark:text-blue-400">
                          平均字数: {Math.round(data.averageLength)}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          评论数量: {data.count}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter 
                dataKey="count" 
                fill="#EF4444"
                fillOpacity={0.7}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        
        {/* 关系分析洞察 */}
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <h5 className="font-medium text-red-800 dark:text-red-300 mb-2">🔍 关系洞察</h5>
          <div className="text-sm text-red-700 dark:text-red-400 space-y-1">
            <p>• 散点图展示了不同评分下的平均评论长度</p>
            <p>• 散点大小表示该评分下的评论数量</p>
            {data.ratingVsLength.find(item => item.rating <= 2 && item.averageLength > 100) && (
              <p>• 低分评论往往字数较多，用户会详细描述问题</p>
            )}
            {data.ratingVsLength.find(item => item.rating >= 4 && item.averageLength < 50) && (
              <p>• 高分评论通常较为简洁，多为简单的赞美</p>
            )}
          </div>
        </div>
      </div>

      {/* 行为模式总结 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">行为模式总结</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {data.userActivity.find(u => u.userType === '单次评论用户')?.percentage.toFixed(0) || 'N/A'}%
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-300">单次评论用户占比</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
              {data.reviewLengthDistribution.reduce((acc, curr) => acc + curr.count, 0)}
            </div>
            <p className="text-sm text-green-800 dark:text-green-300">总评论数</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {Math.round(data.reviewLengthDistribution.reduce((acc, curr, idx) => {
                const midpoint = idx * 25 + 12.5; // 假设区间是25字一组
                return acc + (curr.count * midpoint);
              }, 0) / data.reviewLengthDistribution.reduce((acc, curr) => acc + curr.count, 0))}
            </div>
            <p className="text-sm text-purple-800 dark:text-purple-300">平均评论字数</p>
          </div>
        </div>
      </div>
    </div>
  );
}