import * as vscode from "vscode";
import { ZhihuArticle, ZhihuHotItem, ZhihuService } from "./zhihuService";
import { ArticleView } from "../views/articleView";

/**
 * 文章视图管理类 - 管理所有知乎文章视图
 */
export class ArticleViewManager {
  private static instance: ArticleViewManager;
  private zhihuService: ZhihuService;
  private activeViews: Map<string, ArticleView> = new Map();

  private constructor() {
    this.zhihuService = new ZhihuService();
  }

  /**
   * 获取ArticleViewManager单例
   */
  public static getInstance(): ArticleViewManager {
    if (!ArticleViewManager.instance) {
      ArticleViewManager.instance = new ArticleViewManager();
    }
    return ArticleViewManager.instance;
  }

  /**
   * 打开文章并显示
   * @param item 知乎热榜项
   */
  public async openArticle(item: ZhihuHotItem): Promise<void> {
    try {
      // 检查是否已经打开了这篇文章
      const existingView = this.activeViews.get(item.id);
      if (existingView) {
        // 如果已打开，激活对应的面板
        existingView.show();
        return;
      }

      // 创建新的文章视图
      const articleView = new ArticleView(item, this.zhihuService);

      // 设置视图关闭回调
      articleView.setOnDidDisposeCallback((id) => {
        this.activeViews.delete(id);
      });

      // 添加到活动视图管理
      this.activeViews.set(item.id, articleView);
    } catch (error) {
      vscode.window.showErrorMessage(`无法打开文章: ${error}`);
    }
  }
}
