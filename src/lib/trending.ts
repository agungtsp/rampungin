export function trendingScore(
  likeCount: number,
  copyCount: number,
  generateCount = 0,
): number {
  return likeCount * 2 + copyCount + generateCount;
}
