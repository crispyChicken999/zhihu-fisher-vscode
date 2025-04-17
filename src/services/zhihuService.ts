import { CookieManager } from "./cookieManager";
import { HotListService } from "./hotListService";
import { ArticleService } from "./articleService";
import { ZhihuHotItem, ZhihuArticle } from "./types";

// 定义进度回调函数类型
interface ProgressCallback {
  (
    article: ZhihuArticle,
    count: number,
    total: number,
    isLoading?: boolean
  ): void;
}

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
  async getArticleContent(
    url: string,
    hideImages: boolean
  ): Promise<ZhihuArticle> {
    return this.articleService.getArticleContent(url, hideImages);
  }

  /**
   * 批量获取问题的回答
   * @param questionUrl 问题URL
   * @param maxCount 最大获取回答数量，默认为10
   * @param hideImages 是否隐藏图片
   * @param progressCallback 进度回调函数，用于实时更新UI
   */
  async getBatchAnswers(
    questionUrl: string,
    maxCount: number = 10,
    hideImages: boolean = false,
    progressCallback?: ProgressCallback
  ) {
    console.log(
      `[ZhihuService] 调用 getBatchAnswers: ${questionUrl}, maxCount=${maxCount}`
    );
    return this.articleService.getBatchAnswers(
      questionUrl,
      maxCount,
      hideImages,
      progressCallback
    );
  }

  /**
   * 获取更多批量回答
   * @param questionId 问题ID
   * @param maxCount 最大获取回答数量，默认为10
   * @param hideImages 是否隐藏图片
   * @param progressCallback 进度回调函数，用于实时更新UI
   */
  async loadMoreBatchAnswers(
    questionId: string,
    maxCount: number = 10,
    hideImages: boolean = false,
    progressCallback?: ProgressCallback
  ): Promise<ZhihuArticle[]> {
    return this.articleService.loadMoreBatchAnswers(
      questionId,
      maxCount,
      hideImages,
      progressCallback
    );
  }

  /**
   * 设置当前查看的回答索引，并自动加载下一批次
   * @param questionId 问题ID
   * @param index 当前查看的索引
   * @param hideImages 是否隐藏图片
   * @param progressCallback 进度回调函数，用于实时更新UI
   * @param options 可选配置参数，包含滚动尝试次数等
   */
  async setCurrentViewingIndex(
    questionId: string,
    index: number,
    hideImages: boolean = false,
    progressCallback?: ProgressCallback,
    options?: { scrollAttempts?: number }
  ): Promise<boolean> {
    return this.articleService.setCurrentViewingIndex(
      questionId,
      index,
      hideImages,
      progressCallback,
      options
    );
  }

  /**
   * 关闭问题的浏览器实例
   * @param questionId 问题ID
   */
  async closeBrowserPage(questionId: string): Promise<void> {
    return this.articleService.closeBrowserPage(questionId);
  }
}

// 导出所有类型定义
export * from "./types";
