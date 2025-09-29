// 简化的类名合并函数，避免依赖问题
export function cn(...inputs: (string | undefined | null | boolean)[]) {
  return inputs
    .filter(Boolean)
    .join(' ')
    .trim();
}