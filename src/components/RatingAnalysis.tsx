'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

interface CountryRatingData {
  country: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: RatingDistribution[];
}

interface RatingAnalysisProps {
  overallDistribution: RatingDistribution[];
  countryData?: CountryRatingData[];
}

const RATING_COLORS = {
  1: '#EF4444', // 红色
  2: '#F97316', // 橙色
  3: '#F59E0B', // 黄色
  4: '#10B981', // 绿色
  5: '#059669'  // 深绿色
};

export function RatingAnalysis({ overallDistribution, countryData }: RatingAnalysisProps) {
  // 准备饼图数据
  const pieData = overallDistribution.map(item => ({
    name: `${item.rating}星`,
    value: item.count,
    percentage: item.percentage,
    color: RATING_COLORS[item.rating as keyof typeof RATING_COLORS]
  }));

  // 准备柱状图数据
  const barData = overallDistribution.map(item => ({
    rating: `${item.rating}星`,
    count: item.count,
    percentage: item.percentage
  }));

  return (
    <div className="w-full space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">评分分布分析</h3>
      
      {/* 整体评分分布 - 双图展示 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 柱状图 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">星级分布柱状图</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="rating" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                          <p className="font-semibold">{data.rating}</p>
                          <p className="text-blue-600 dark:text-blue-400">
                            数量: {data.count}
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
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 饼图 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">星级分布饼图</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                          <p className="font-semibold">{data.name}</p>
                          <p style={{ color: data.color }}>
                            数量: {data.value} ({data.percentage.toFixed(1)}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 国家/地区对比分析 */}
      {countryData && countryData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">不同地区评分对比</h4>
          
          {/* 国家平均评分对比 */}
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={countryData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="country" fontSize={12} />
                <YAxis domain={[1, 5]} fontSize={12} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                          <p className="font-semibold">{data.country}</p>
                          <p className="text-blue-600 dark:text-blue-400">
                            平均评分: {data.averageRating.toFixed(2)}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            评论总数: {data.totalReviews}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="averageRating" 
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 国家详细分布表格 */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 font-medium">地区</th>
                  <th className="text-right py-2 px-3 font-medium">平均评分</th>
                  <th className="text-right py-2 px-3 font-medium">总评论数</th>
                  <th className="text-right py-2 px-3 font-medium">5星占比</th>
                  <th className="text-right py-2 px-3 font-medium">1星占比</th>
                </tr>
              </thead>
              <tbody>
                {countryData.map((country, index) => {
                  const fiveStarRatio = country.ratingDistribution.find(r => r.rating === 5)?.percentage || 0;
                  const oneStarRatio = country.ratingDistribution.find(r => r.rating === 1)?.percentage || 0;
                  
                  return (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 px-3 font-medium">{country.country}</td>
                      <td className="py-2 px-3 text-right">{country.averageRating.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right">{country.totalReviews.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right text-green-600">{fiveStarRatio.toFixed(1)}%</td>
                      <td className="py-2 px-3 text-right text-red-600">{oneStarRatio.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 评分统计摘要 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">评分统计摘要</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {overallDistribution.map((item) => (
            <div key={item.rating} className="text-center">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold"
                style={{ backgroundColor: RATING_COLORS[item.rating as keyof typeof RATING_COLORS] }}
              >
                {item.rating}★
              </div>
              <p className="text-sm font-medium">{item.count} 条</p>
              <p className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}