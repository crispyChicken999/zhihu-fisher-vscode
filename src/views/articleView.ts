import * as vscode from "vscode";
import {
  ZhihuArticle,
  ZhihuHotItem,
  ZhihuService,
} from "../services/zhihuService";
import { HtmlRenderer } from "../utils/htmlRenderer";

/**
 * 文章视图状态接口
 */
export interface ArticleViewState {
  webviewPanel: vscode.WebviewPanel;
  article: ZhihuArticle;
  url: string;
  isLoading: boolean;
  // 新增：当前问题的回答ID列表
  answerIds: string[];
  // 新增：当前正在查看的回答在列表中的索引
  currentAnswerIndex: number;
  // 新增：问题ID
  questionId?: string;
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
  constructor(private readonly item: ZhihuHotItem, zhihuService: ZhihuService) {
    this.zhihuService = zhihuService;

    // 提取问题ID（如果URL包含问题）
    let questionId: string | undefined;
    const questionMatch = item.url.match(/question\/(\d+)/);
    if (questionMatch && questionMatch[1]) {
      questionId = questionMatch[1];
    }

    // 为了避免文章标题过长，截取前15个字符
    const shortTitle =
      item.title.length > 15 ? `${item.title.substring(0, 15)}...` : item.title;

    // 创建并配置WebView面板
    const panel = vscode.window.createWebviewPanel(
      "zhihuArticle",
      `加载中: ${shortTitle}`,
      vscode.ViewColumn.Active, // 修改为在当前编辑组显示
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
      answerIds: [], // 初始化回答ID数组
      currentAnswerIndex: -1, // 初始化当前回答索引
      questionId, // 存储问题ID
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
    console.log('this.viewState: ', this.viewState);
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

      // 为了避免文章标题过长，截取前15个字符
      const shortTitle =
        this.item.title.length > 15
          ? `${this.item.title.substring(0, 15)}...`
          : this.item.title;

      statusBarItem.text = `$(sync~spin) 加载文章: ${shortTitle}`;
      statusBarItem.show();

      try {
        console.log(`开始加载文章内容: ${this.viewState.url}`);
        // 获取文章内容
        const article = await this.zhihuService.getArticleContent(
          this.viewState.url,
          hideImages
        );

        // 更新状态
        this.viewState.article = article;
        this.viewState.isLoading = false;

        // 更新面板标题 - 使用截短的标题
        const shortArticleTitle =
          article.title.length > 15
            ? `${article.title.substring(0, 15)}...`
            : article.title;
        this.viewState.webviewPanel.title = shortArticleTitle;

        // 如果是问题页面，从返回的实际URL中提取回答ID并添加到数组
        if (this.viewState.questionId && article.actualUrl) {
          const answerMatch = article.actualUrl.match(/answer\/(\d+)/);
          if (answerMatch && answerMatch[1]) {
            const answerId = answerMatch[1];

            // 如果是新的回答ID，更新回答ID数组和当前索引
            if (!this.viewState.answerIds.includes(answerId)) {
              this.viewState.answerIds.push(answerId);
              this.viewState.currentAnswerIndex =
                this.viewState.answerIds.length - 1;
            } else {
              // 如果已有此回答ID，更新当前索引
              this.viewState.currentAnswerIndex =
                this.viewState.answerIds.indexOf(answerId);
            }
          }
        }

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

    // 增加导航状态
    const navState = {
      hasPrevious: this.viewState.currentAnswerIndex > 0,
      hasNext:
        this.viewState.answerIds.length > 0 &&
        this.viewState.currentAnswerIndex < this.viewState.answerIds.length - 1,
      questionId: this.viewState.questionId,
    };

    this.viewState.webviewPanel.webview.html = HtmlRenderer.getArticleHtml(
      this.viewState.article,
      this.viewState.url,
      hideImages,
      navState
    );
  }

  /**
   * 加载下一个回答
   */
  public async loadNextAnswer(): Promise<void> {
    try {
      if (!this.viewState.questionId || this.viewState.isLoading) {
        return;
      }

      // 检查是否有下一个回答
      const nextIndex = this.viewState.currentAnswerIndex + 1;
      if (nextIndex < this.viewState.answerIds.length) {
        // 已有缓存的下一个回答ID
        const nextAnswerId = this.viewState.answerIds[nextIndex];
        this.viewState.url = `https://www.zhihu.com/question/${this.viewState.questionId}/answer/${nextAnswerId}`;
        this.viewState.currentAnswerIndex = nextIndex;
        await this.loadContent();
      } else {
        // 需要从页面获取更多回答
        await this.fetchMoreAnswers();
      }
    } catch (error) {
      console.error("加载下一个回答失败:", error);
      vscode.window.showErrorMessage(
        `无法加载下一个回答: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * 加载上一个回答
   */
  public async loadPreviousAnswer(): Promise<void> {
    try {
      if (
        !this.viewState.questionId ||
        this.viewState.isLoading ||
        this.viewState.currentAnswerIndex <= 0
      ) {
        return;
      }

      const prevIndex = this.viewState.currentAnswerIndex - 1;
      const prevAnswerId = this.viewState.answerIds[prevIndex];
      this.viewState.url = `https://www.zhihu.com/question/${this.viewState.questionId}/answer/${prevAnswerId}`;
      this.viewState.currentAnswerIndex = prevIndex;
      await this.loadContent();
    } catch (error) {
      console.error("加载上一个回答失败:", error);
      vscode.window.showErrorMessage(
        `无法加载上一个回答: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * 获取更多回答
   */
  private async fetchMoreAnswers(): Promise<void> {
    if (!this.viewState.questionId) {
      return;
    }

    try {
      // 显示加载状态
      this.viewState.isLoading = true;
      this.viewState.article.content = "正在加载更多回答...";
      this.updateContent();


      // 获取配置中的无图片模式设置
      const config = vscode.workspace.getConfiguration("zhihu-fisher");

      // 显示等待信息
      this.viewState.article.content = `正在加载更多回答，请稍候...\n`;
      this.updateContent();

      // 获取更多回答ID
      const nextAnswerId = await this.zhihuService.getMoreAnswersId(
        this.viewState.article.actualUrl as string
      );
      console.log('nextAnswerId: ', nextAnswerId);
      this.viewState.isLoading = false;
      if (nextAnswerId) {
        // 如果成功获取到了新的回答ID
        const newAnswerUrl = `https://www.zhihu.com/question/${this.viewState.questionId}/answer/${nextAnswerId}`;
        this.viewState.url = newAnswerUrl;

        // 加载新回答内容
        await this.loadContent();
      } else {
        // 如果没有更多回答
        vscode.window.showInformationMessage("没有更多回答了");
        this.updateContent();
      }
    } catch (error) {
      this.viewState.isLoading = false;
      console.error("获取更多回答失败:", error);
      vscode.window.showErrorMessage(
        `获取更多回答失败: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      this.updateContent();
    }
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
        case "loadNextAnswer":
          await this.loadNextAnswer();
          break;
        case "loadPreviousAnswer":
          await this.loadPreviousAnswer();
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
