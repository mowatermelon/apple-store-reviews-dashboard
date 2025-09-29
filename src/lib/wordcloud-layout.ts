// 简单的词云布局算法工具函数
export interface WordPosition {
  word: string;
  count: number;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  color: string;
}

export function calculateWordCloudLayout(
  words: Array<{ word: string; count: number }>,
  containerWidth: number,
  containerHeight: number,
  maxWords: number = 40
): WordPosition[] {
  if (!containerWidth || !containerHeight || words.length === 0) {
    return [];
  }

  const sortedWords = words
    .sort((a, b) => b.count - a.count)
    .slice(0, maxWords);
  
  const maxCount = Math.max(...sortedWords.map(w => w.count));
  const minCount = Math.min(...sortedWords.map(w => w.count));
  
  const positions: WordPosition[] = [];
  const occupied: Array<{ x: number; y: number; width: number; height: number }> = [];
  
  // 计算字体大小
  const getFontSize = (count: number) => {
    const ratio = (count - minCount) / (maxCount - minCount || 1);
    const minSize = Math.max(12, containerWidth * 0.02);
    const maxSize = Math.max(28, containerWidth * 0.06);
    return minSize + ratio * (maxSize - minSize);
  };
  
  // 计算颜色
  const getColor = (count: number) => {
    const ratio = (count - minCount) / (maxCount - minCount || 1);
    const hue = 200 + ratio * 60;
    const saturation = 60 + ratio * 20;
    const lightness = 45 + Math.sin(ratio * Math.PI) * 10;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };
  
  // 估算文字尺寸（粗略计算）
  const getTextDimensions = (text: string, fontSize: number) => {
    const avgCharWidth = fontSize * 0.6; // 平均字符宽度
    const width = text.length * avgCharWidth + 16; // 加上padding
    const height = fontSize * 1.4 + 8; // 行高 + padding
    return { width, height };
  };
  
  // 检查位置是否与已有元素重叠
  const isPositionFree = (x: number, y: number, width: number, height: number) => {
    // 检查边界
    if (x < 0 || y < 0 || x + width > containerWidth || y + height > containerHeight) {
      return false;
    }
    
    // 检查与已有元素的重叠
    return !occupied.some(rect => 
      !(x > rect.x + rect.width || 
        x + width < rect.x || 
        y > rect.y + rect.height || 
        y + height < rect.y)
    );
  };
  
  // 螺旋搜索可用位置
  const findPosition = (width: number, height: number) => {
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    
    // 从中心开始螺旋搜索
    for (let radius = 0; radius < Math.max(containerWidth, containerHeight) / 2; radius += 20) {
      for (let angle = 0; angle < 360; angle += 30) {
        const x = centerX + radius * Math.cos(angle * Math.PI / 180) - width / 2;
        const y = centerY + radius * Math.sin(angle * Math.PI / 180) - height / 2;
        
        if (isPositionFree(x, y, width, height)) {
          return { x, y };
        }
      }
    }
    
    // 如果螺旋搜索失败，尝试网格搜索
    const step = 20;
    for (let y = 0; y <= containerHeight - height; y += step) {
      for (let x = 0; x <= containerWidth - width; x += step) {
        if (isPositionFree(x, y, width, height)) {
          return { x, y };
        }
      }
    }
    
    return null;
  };
  
  // 为每个词分配位置
  for (const word of sortedWords) {
    const fontSize = getFontSize(word.count);
    const { width, height } = getTextDimensions(word.word, fontSize);
    const position = findPosition(width, height);
    
    if (position) {
      const wordPosition: WordPosition = {
        word: word.word,
        count: word.count,
        x: position.x,
        y: position.y,
        width,
        height,
        fontSize,
        color: getColor(word.count)
      };
      
      positions.push(wordPosition);
      occupied.push({
        x: position.x,
        y: position.y,
        width,
        height
      });
    }
  }
  
  return positions;
}