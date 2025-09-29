'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TimeSeriesData {
  date: string;
  reviewCount: number;
  averageRating: number;
  positiveCount: number;
  negativeCount: number;
}

interface TimeTrendAnalysisProps {
  data: TimeSeriesData[];
  title?: string;
}

export function TimeTrendAnalysis({ data, title = "时间趋势分析" }: TimeTrendAnalysisProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">暂无时间趋势数据</p>
      </div>
    );
  }

  // 格式化日期显示
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="w-full space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      
      {/* 评论数量趋势 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">评论数量变化</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                        <p className="text-blue-600 dark:text-blue-400">
                          评论数量: {payload[0].value}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="reviewCount" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 平均评分趋势 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">平均评分变化</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                fontSize={12}
              />
              <YAxis 
                domain={[1, 5]}
                fontSize={12}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                        <p className="font-semibold">{formatDate(label)}</p>
                        <p className="text-green-600 dark:text-green-400">
                          平均评分: {Number(payload[0].value).toFixed(1)}
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
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 情感趋势 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">情感趋势对比</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                            {entry.name}: {entry.value}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="positiveCount" 
                stroke="#10B981" 
                strokeWidth={2}
                name="积极评论"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="negativeCount" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="消极评论"
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}