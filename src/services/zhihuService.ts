import { CookieManager } from './cookieManager';
import { HotListService } from './hotListService';
import { ArticleService } from './articleService';
import { ZhihuHotItem, ZhihuArticle } from './types';

/**
 * 知乎服务主类 - 整合各子服务
 */
export class ZhihuService {
  private cookieManager: CookieManager;
  private hotListService: HotListService;
  private articleService: ArticleService;

  constructor() {
    this.cookieManager = new CookieManager();
    this.hotListService = new HotListService(this.cookieManager);
    this.articleService = new ArticleService(this.cookieManager);
  }

  // Cookie 相关方法
  async setCookie(): Promise<boolean> {
    return this.cookieManager.setCookie();
  }

  clearCookie(): void {
    this.cookieManager.clearCookie();
  }

  // 获取热榜
  async getHotList(): Promise<ZhihuHotItem[]> {
    return this.hotListService.getHotList();
  }

  // 获取文章内容
  async getArticleContent(url: string, hideImages: boolean): Promise<ZhihuArticle> {
    return this.articleService.getArticleContent(url, hideImages);
  }
}

// 导出所有类型定义
export * from './types';
