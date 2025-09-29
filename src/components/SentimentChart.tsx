'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface SentimentChartProps {
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

const COLORS = {
  positive: '#10B981', // green
  neutral: '#F59E0B',  // yellow
  negative: '#EF4444'  // red
};

export function SentimentChart({ sentiment }: SentimentChartProps) {
  const data = [
    { name: '积极', value: sentiment.positive, color: COLORS.positive },
    { name: '中性', value: sentiment.neutral, color: COLORS.neutral },
    { name: '消极', value: sentiment.negative, color: COLORS.negative },
  ].filter(item => item.value > 0);

  const total = sentiment.positive + sentiment.neutral + sentiment.negative;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value, percent }: any) => 
              `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            content={({ active, payload }: any) => {
              if (active && payload && payload.length) {
                const data = payload[0];
                const percent = ((data.value / total) * 100).toFixed(1);
                return (
                  <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                    <p className="font-semibold">{data.name}评价</p>
                    <p style={{ color: data.payload.color }}>
                      数量: {data.value} ({percent}%)
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* 统计信息 */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          总评论数: {total} 条
        </p>
      </div>
    </div>
  );
}