'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WordFrequencyChartProps {
  data: Array<{ word: string; count: number }>;
  maxItems?: number;
}

export function WordFrequencyChart({ data, maxItems = 20 }: WordFrequencyChartProps) {
  const chartData = data.slice(0, maxItems).map(item => ({
    word: item.word.length > 10 ? item.word.substring(0, 10) + '...' : item.word,
    count: item.count,
    fullWord: item.word
  }));

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="word" 
            angle={-45}
            textAnchor="end"
            height={80}
            fontSize={12}
            interval={0}
          />
          <YAxis fontSize={12} />
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                    <p className="font-semibold">{data.fullWord}</p>
                    <p className="text-blue-600 dark:text-blue-400">
                      出现次数: {data.count}
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
            className="hover:opacity-80 transition-opacity"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}