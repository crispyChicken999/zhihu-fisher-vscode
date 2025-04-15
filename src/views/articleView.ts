import * as vscode from "vscode";
import { ZhihuArticle, ZhihuHotItem, ZhihuService } from "../services/zhihuService";
import { HtmlRenderer } from "../utils/htmlRenderer";

/**
 * 文章视图状态接口
 */
export interface ArticleViewState {
  webviewPanel: vscode.WebviewPanel;
  article: ZhihuArticle;
  url: string;
  isLoading: boolean;
}

/**
 * 文章视图类 - 处理单个文章的显示、加载和交互
 */
export class ArticleView {
  private viewState: ArticleViewState;
  private zhihuService: ZhihuService;

  /**
   * 创建一个新的文章视图
   * @param item 知乎热榜项目
   * @param zhihuService 知乎服务
   */
  constructor(
    private readonly item: ZhihuHotItem,
    zhihuService: ZhihuService
  ) {
    this.zhihuService = zhihuService;

    // 创建并配置WebView面板
    const panel = vscode.window.createWebviewPanel(
      "zhihuArticle",
      `加载中: ${item.title}`,
      vscode.ViewColumn.Two,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(vscode.Uri.file(__dirname), "../../../media"),
        ],
      }
    );

    // 初始化文章状态
    this.viewState = {
      webviewPanel: panel,
      article: { title: item.title, content: "正在加载内容..." },
      url: item.url,
      isLoading: true,
    };

    // 在WebView中显示正在加载状态
    panel.webview.html = HtmlRenderer.getLoadingHtml(item.title);
    
    // 设置消息处理
    this.setupMessageHandling();
  }

  /**
   * 获取文章视图状态
   */
  public getState(): ArticleViewState {
    return this.viewState;
  }

  /**
   * 显示文章视图
   */
  public show(): void {
    this.viewState.webviewPanel.reveal();
  }

  /**
   * 加载文章内容
   */
  public async loadContent(): Promise<void> {
    try {
      // 已经加载过内容并且正在加载中，避免重复请求
      if (
        this.viewState.isLoading &&
        this.viewState.article.content !== "正在加载内容..."
      ) {
        return;
      }

      this.viewState.isLoading = true;

      // 获取配置中的无图片模式设置
      const config = vscode.workspace.getConfiguration("zhihu-fisher");
      const hideImages = config.get<boolean>("hideImages", false);

      // 显示状态栏加载提示
      const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
      );
      statusBarItem.text = `$(sync~spin) 加载文章: ${this.item.title}`;
      statusBarItem.show();

      try {
        console.log(`开始加载文章内容: ${this.item.url}`);
        // 获取文章内容
        const article = await this.zhihuService.getArticleContent(
          this.item.url,
          hideImages
        );

        // 更新状态
        this.viewState.article = article;
        this.viewState.isLoading = false;

        // 更新面板标题
        this.viewState.webviewPanel.title = article.title || this.item.title;

        // 更新内容
        this.updateContent();
        console.log(`成功加载并显示文章内容: ${article.title}`);
      } catch (error) {
        console.error("加载文章内容失败:", error);
        this.viewState.isLoading = false;

        // 显示错误信息
        this.viewState.article = {
          title: this.item.title,
          content: `加载文章内容失败: ${
            error instanceof Error ? error.message : String(error)
          }\n\n可能需要更新Cookie或者稍后再试。`,
        };

        this.updateContent();
      } finally {
        statusBarItem.dispose();
      }
    } catch (error) {
      this.viewState.isLoading = false;
      console.error("处理文章加载失败:", error);
      vscode.window.showErrorMessage(
        `加载文章内容时出错: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * 更新文章视图内容
   */
  public updateContent(): void {
    if (!this.viewState.webviewPanel) {
      return;
    }

    // 获取当前的图片显示设置
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const hideImages = config.get<boolean>("hideImages", false);

    this.viewState.webviewPanel.webview.html = HtmlRenderer.getArticleHtml(
      this.viewState.article,
      this.viewState.url,
      hideImages
    );
  }

  /**
   * 切换图片显示状态
   */
  public async toggleImageDisplay(): Promise<void> {
    // 获取当前配置
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const currentValue = config.get<boolean>("hideImages", false);

    // 切换值
    await config.update(
      "hideImages",
      !currentValue,
      vscode.ConfigurationTarget.Global
    );

    // 提示用户
    const statusText = !currentValue ? "已启用无图模式" : "已启用图片显示模式";
    vscode.window.showInformationMessage(statusText);

    // 重新加载文章内容（不触发网络请求，仅重新处理已获取的内容）
    this.updateContent();
  }

  /**
   * 设置WebView消息处理
   */
  private setupMessageHandling(): void {
    // 处理WebView关闭事件
    this.viewState.webviewPanel.onDidDispose(
      () => {
        // 通知外部调用者面板已关闭
        this.onDidDisposeCallback?.(this.item.id);
      },
      null,
      []
    );

    // 处理WebView消息
    this.viewState.webviewPanel.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case "requestContent":
          await this.loadContent();
          break;
        case "openInBrowser":
          // 如果提供了特定的URL（如作者页面），则打开该URL，否则打开文章URL
          if (message.url) {
            vscode.env.openExternal(vscode.Uri.parse(message.url));
          } else {
            vscode.env.openExternal(vscode.Uri.parse(this.item.url));
          }
          break;
        case "toggleImageDisplay":
          await this.toggleImageDisplay();
          break;
      }
    });
  }

  // 回调函数，用于通知视图管理器面板已关闭
  private onDidDisposeCallback?: (id: string) => void;

  /**
   * 设置面板关闭回调
   */
  public setOnDidDisposeCallback(callback: (id: string) => void): void {
    this.onDidDisposeCallback = callback;
  }
}