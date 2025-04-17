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
  private disposables: vscode.Disposable[] = [];
  private currentActiveWebviewPanel: vscode.WebviewPanel | undefined;

  private constructor() {
    this.zhihuService = new ZhihuService();
    
    this.disposables.push(
      vscode.window.onDidChangeActiveTextEditor(this.onDidChangeActiveTextEditor, this)
    );
  }

  // 处理活动编辑器变化事件
  private onDidChangeActiveTextEditor(editor: vscode.TextEditor | undefined): void {
    // 当活动编辑器变化时，我们需要检查当前的活动面板是否是我们的WebView面板
    const activePanel = this.findActiveWebviewPanel();
    
    if (activePanel) {
      // 如果有活动的WebView面板，找到对应的文章视图
      this.handleActivePanelChange(activePanel);
    }
  }

  // 查找当前活动的WebView面板
  private findActiveWebviewPanel(): vscode.WebviewPanel | undefined {
    // 由于VS Code API不直接提供获取当前活动WebView面板的方法，
    // 我们需要通过比较来确定当前活动的面板

    // 遍历所有文章视图，检查它们的面板是否活动
    for (const [id, view] of this.activeViews.entries()) {
      const panel = view.getState().webviewPanel;
      
      // 如果面板存在且可见，则认为它可能是活动面板
      if (panel && panel.visible) {
        // 如果当前没有记录的活动面板，或者这个面板不同于记录的活动面板
        if (!this.currentActiveWebviewPanel || this.currentActiveWebviewPanel !== panel) {
          console.log(`检测到WebView面板状态变化: ${panel.title}`);
          this.currentActiveWebviewPanel = panel;
          return panel;
        }
      }
    }

    return undefined;
  }

  // 处理面板激活变化
  private handleActivePanelChange(activePanel: vscode.WebviewPanel): void {
    // 遍历所有文章视图，查找匹配的面板
    for (const [id, view] of this.activeViews.entries()) {
      if (view.getState().webviewPanel === activePanel) {
        console.log(`找到匹配的文章视图: ${id}，准备同步浏览器标签页`);
        // 文章视图匹配，激活对应的 puppeteer 标签页
        view.activateBrowserTab(id).catch(error => {
          console.error("激活浏览器标签页失败:", error);
        });
        break;
      }
    }
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

      // 添加面板状态变化监听器
      const panel = articleView.getState().webviewPanel;
      panel.onDidChangeViewState(e => {
        if (e.webviewPanel.active) {
          console.log(`面板状态变化: ${panel.title} 变为活动状态`);
          this.currentActiveWebviewPanel = panel;
          this.handleActivePanelChange(panel);
        }
      });
    } catch (error) {
      vscode.window.showErrorMessage(`无法打开文章: ${error}`);
    }
  }

  /**
   * 释放资源
   */
  public dispose(): void {
    // 释放所有注册的事件监听器
    this.disposables.forEach(d => d.dispose());
    this.disposables = [];

    // 关闭所有活动视图
    this.activeViews.forEach(view => {
      try {
        view.getState().webviewPanel.dispose();
      } catch (e) {
        console.error("关闭视图失败:", e);
      }
    });
    this.activeViews.clear();
    this.currentActiveWebviewPanel = undefined;
  }
}
