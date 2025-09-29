'use client';

import { cn } from '@/lib/utils'
import { useEffect, useRef, useState, useMemo } from 'react';
import { calculateWordCloudLayout, type WordPosition } from '@/lib/wordcloud-layout';

interface WordCloudProps {
  data: Array<{ word: string; count: number }>;
  className?: string;
}

export function WordCloud({ data, className }: WordCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isLayoutMode, setIsLayoutMode] = useState(true);

  // 监听容器大小变化
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const padding = 48; // 24px padding on each side
        setContainerSize({ 
          width: Math.max(200, rect.width - padding), 
          height: Math.max(200, rect.height - padding) 
        });
      }
    };

    // 延迟执行以确保DOM完全渲染
    const timer = setTimeout(updateSize, 100);
    
    window.addEventListener('resize', updateSize);
    return () => {
      window.removeEventListener('resize', updateSize);
      clearTimeout(timer);
    };
  }, []);

  // 计算词云布局
  const wordPositions = useMemo(() => {
    if (containerSize.width === 0 || containerSize.height === 0 || data.length === 0) {
      return [];
    }
    
    return calculateWordCloudLayout(data, containerSize.width, containerSize.height, 35);
  }, [data, containerSize]);

  // 简单布局的样式计算
  const getSimpleWordStyle = (count: number, index: number) => {
    const maxCount = Math.max(...data.map(item => item.count));
    const minCount = Math.min(...data.map(item => item.count));
    const ratio = (count - minCount) / (maxCount - minCount || 1);
    
    // 根据容器大小动态调整字体大小
    const containerFactor = Math.min(containerSize.width, containerSize.height) / 300;
    const baseFontSize = Math.max(12, 14 * containerFactor);
    const maxFontSize = Math.max(20, 28 * containerFactor);
    const fontSize = baseFontSize + ratio * (maxFontSize - baseFontSize);
    
    // 颜色渐变
    const hue = 200 + ratio * 60 + (index % 3) * 10; // 添加一些变化
    const saturation = 60 + ratio * 20;
    const lightness = 45 + Math.sin(ratio * Math.PI) * 10;
    
    return {
      fontSize: `${Math.round(fontSize)}px`,
      color: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
      fontWeight: Math.min(700, 400 + ratio * 300)
    };
  };

  if (data.length === 0) {
    return (
      <div className={cn("relative w-full h-full flex items-center justify-center", className)}>
        <p className="text-gray-400 dark:text-gray-600 text-lg">
          暂无关键词数据
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn("relative w-full h-full overflow-hidden", className)}
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg" />
      
      {/* 布局切换按钮 */}
      <button
        onClick={() => setIsLayoutMode(!isLayoutMode)}
        className="absolute top-2 right-2 z-20 px-2 py-1 text-xs bg-white/80 dark:bg-gray-800/80 rounded hover:bg-white dark:hover:bg-gray-800 transition-colors"
        title={isLayoutMode ? "切换到流式布局" : "切换到智能布局"}
      >
        {isLayoutMode ? "流式" : "智能"}
      </button>
      
      {/* 词云内容 */}
      {!isLayoutMode && wordPositions.length > 0 ? (
        // 使用绝对定位的智能布局
        <div className="relative w-full h-full p-6">
          {wordPositions.map((pos, index) => (
            <span
              key={`${pos.word}-${index}`}
              className="absolute transition-all duration-300 hover:scale-110 hover:z-10 cursor-pointer select-none px-1 py-0.5 rounded hover:bg-white/60 dark:hover:bg-gray-800/60"
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                fontSize: `${pos.fontSize}px`,
                color: pos.color,
                fontWeight: Math.min(700, 400 + (pos.count / Math.max(...data.map(d => d.count))) * 300),
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                transform: 'translate(-50%, -50%)'
              }}
              title={`${pos.word}: ${pos.count} 次出现`}
            >
              {pos.word}
            </span>
          ))}
        </div>
      ) : (
        // 回退到简单的flex布局
        <div className="relative z-10 w-full h-full p-4 overflow-hidden">
          <div className="flex flex-wrap justify-center items-center content-start gap-1 w-full h-full">
            {data
              .sort((a, b) => b.count - a.count)
              .slice(0, 35)
              .map((item, index) => {
                const style = getSimpleWordStyle(item.count, index);
                const isImportant = index < 5; // 前5个是重要词汇
                
                return (
                  <span
                    key={`${item.word}-${index}`}
                    className={cn(
                      "inline-block px-2 py-1 rounded-md transition-all duration-200",
                      "hover:bg-white/80 dark:hover:bg-gray-800/80 hover:shadow-sm",
                      "cursor-pointer select-none",
                      "text-center leading-tight",
                      // 重要词汇给更多空间
                      isImportant ? "mx-1 my-1" : "mx-0.5 my-0.5"
                    )}
                    style={{
                      ...style,
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      // 动态最大宽度，确保不溢出
                      maxWidth: `${Math.min(200, containerSize.width * 0.3)}px`,
                      wordBreak: 'break-word',
                      hyphens: 'auto'
                    }}
                    title={`${item.word}: ${item.count} 次出现 (排名: ${index + 1})`}
                  >
                    {item.word}
                  </span>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}