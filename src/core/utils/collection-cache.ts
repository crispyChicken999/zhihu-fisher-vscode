/**
 * 收藏夹缓存管理器
 */
export class CollectionCacheManager {
  private static cache: {
    collections: any[];
    totalCount: number;
    timestamp: number;
    lastPage: number;
  } | null = null;

  // 缓存过期时间（30分钟）
  private static readonly CACHE_EXPIRY = 30 * 60 * 1000;

  /**
   * 获取缓存的收藏夹数据
   * @returns 缓存数据或null
   */
  public static getCachedCollections(): {
    collections: any[];
    totalCount: number;
    lastPage: number;
  } | null {
    if (!this.cache) {
      return null;
    }

    // 检查是否过期
    const now = Date.now();
    if (now - this.cache.timestamp > this.CACHE_EXPIRY) {
      console.log("收藏夹缓存已过期，清除缓存");
      this.cache = null;
      return null;
    }

    console.log(`使用缓存的收藏夹数据，共${this.cache.collections.length}个收藏夹`);
    return {
      collections: this.cache.collections,
      totalCount: this.cache.totalCount,
      lastPage: this.cache.lastPage
    };
  }

  /**
   * 设置收藏夹缓存
   * @param collections 收藏夹列表
   * @param totalCount 总数
   * @param lastPage 最后加载的页面
   */
  public static setCachedCollections(
    collections: any[],
    totalCount: number,
    lastPage: number
  ): void {
    this.cache = {
      collections: [...collections], // 深拷贝防止引用问题
      totalCount,
      timestamp: Date.now(),
      lastPage
    };
    console.log(`缓存收藏夹数据，共${collections.length}个收藏夹`);
  }

  /**
   * 清除收藏夹缓存
   */
  public static clearCache(): void {
    this.cache = null;
    console.log("清除收藏夹缓存");
  }

  /**
   * 获取缓存统计信息
   */
  public static getCacheStats(): {
    hasCachedData: boolean;
    collectionsCount: number;
    totalCount: number;
    timestamp: number;
    isExpired: boolean;
  } {
    if (!this.cache) {
      return {
        hasCachedData: false,
        collectionsCount: 0,
        totalCount: 0,
        timestamp: 0,
        isExpired: true
      };
    }

    const now = Date.now();
    const isExpired = now - this.cache.timestamp > this.CACHE_EXPIRY;

    return {
      hasCachedData: true,
      collectionsCount: this.cache.collections.length,
      totalCount: this.cache.totalCount,
      timestamp: this.cache.timestamp,
      isExpired
    };
  }
}
