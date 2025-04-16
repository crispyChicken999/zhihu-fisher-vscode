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
  // 回答ID列表
  answerIds: string[];
  // 当前正在查看的回答在列表中的索引
  currentAnswerIndex: number;
  // 问题ID
  questionId?: string;
  // 批量获取的回答列表
  batchAnswers?: ZhihuArticle[];
  // 加载的批次数
  batchCount?: number;
  // 每批加载的回答数量
  answersPerBatch?: number;
  // 是否还有更多回答可加载
  hasMoreAnswers?: boolean;
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

    // 获取配置中的每批回答数量
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const answersPerBatch = config.get<number>("answersPerBatch", 10);

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
      batchAnswers: [], // 初始化批量回答数组
      batchCount: 0, // 初始化批次计数
      answersPerBatch, // 每批加载的回答数量
      hasMoreAnswers: true, // 初始化是否有更多回答标志
    };

    // 在WebView中显示正在加载状态
    panel.webview.html = HtmlRenderer.getLoadingHtml(item.title);

    // 设置消息处理
    this.setupMessageHandling();

    // 设置面板关闭处理
    this.setupPanelCloseHandler();
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
   * 设置面板关闭处理
   */
  private setupPanelCloseHandler(): void {
    this.viewState.webviewPanel.onDidDispose(
      async () => {
        // 如果是问题页面，关闭对应的浏览器实例
        if (this.viewState.questionId) {
          try {
            console.log(`视图关闭，关闭问题 ${this.viewState.questionId} 的浏览器实例`);
            await this.zhihuService.closeBrowser(this.viewState.questionId);
          } catch (error) {
            console.error("关闭浏览器时出错:", error);
          }
        }
        
        // 通知外部调用者面板已关闭
        this.onDidDisposeCallback?.(this.item.id);
      },
      null,
      []
    );
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
        
        // 判断是否是问题URL且不包含回答ID
        if (this.viewState.questionId && !this.viewState.url.includes("/answer/")) {
          // 使用批量加载回答的新方法
          console.log(`使用批量加载回答方法加载问题 ${this.viewState.questionId} 的回答`);
          
          const batchResult = await this.zhihuService.getBatchAnswers(
            this.viewState.url,
            this.viewState.answersPerBatch,
            hideImages
          );
          
          // 更新状态
          this.viewState.batchAnswers = batchResult.answers;
          this.viewState.hasMoreAnswers = batchResult.hasMore;
          this.viewState.batchCount = 1;
          
          if (batchResult.answers.length > 0) {
            // 设置第一个回答为当前文章
            this.viewState.article = batchResult.answers[0];
            this.viewState.isLoading = false;
            
            // 提取并存储所有回答的ID
            this.viewState.answerIds = batchResult.answers.map(answer => {
              const answerIdMatch = answer.actualUrl?.match(/answer\/(\d+)/);
              return answerIdMatch ? answerIdMatch[1] : "";
            }).filter(id => id !== "");
            
            this.viewState.currentAnswerIndex = 0;
            
            // 如果有actualUrl，更新当前URL
            if (this.viewState.article.actualUrl) {
              this.viewState.url = this.viewState.article.actualUrl;
            }
            
            // 更新面板标题 - 使用截短的标题
            const shortArticleTitle =
              batchResult.questionTitle.length > 15
                ? `${batchResult.questionTitle.substring(0, 15)}...`
                : batchResult.questionTitle;
            this.viewState.webviewPanel.title = shortArticleTitle;
            
            console.log(`成功加载批量回答，共 ${batchResult.answers.length} 个回答`);
          } else {
            throw new Error("未获取到任何回答");
          }
        } else {
          // 使用原有方法获取单个回答
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
        }

        // 更新内容
        this.updateContent();
        console.log(`成功加载并显示文章内容: ${this.viewState.article.title}`);
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
        this.viewState.currentAnswerIndex < this.viewState.answerIds.length - 1 || 
        (this.viewState.hasMoreAnswers === true),
      questionId: this.viewState.questionId,
      totalLoaded: this.viewState.answerIds.length, // 总加载回答数
      currentIndex: this.viewState.currentAnswerIndex + 1, // 当前索引（用户友好，从1开始）
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
      
      // 如果下一个索引超过了当前批次的最后一个回答
      if (nextIndex >= this.viewState.answerIds.length) {
        // 需要从问题页面获取更多回答
        if (this.viewState.hasMoreAnswers) {
          await this.loadMoreBatchAnswers();
        } else {
          vscode.window.showInformationMessage("已经是最后一个回答了");
        }
      } else {
        // 已有缓存的下一个回答，直接从batchAnswers中获取
        if (this.viewState.batchAnswers && 
            nextIndex < this.viewState.batchAnswers.length) {
          
          // 从批量回答中获取
          this.viewState.article = this.viewState.batchAnswers[nextIndex];
          this.viewState.currentAnswerIndex = nextIndex;
          
          // 更新URL
          if (this.viewState.article.actualUrl) {
            this.viewState.url = this.viewState.article.actualUrl;
          }
          
          this.updateContent();
        } else {
          // 使用传统方式加载
          const nextAnswerId = this.viewState.answerIds[nextIndex];
          this.viewState.url = `https://www.zhihu.com/question/${this.viewState.questionId}/answer/${nextAnswerId}`;
          this.viewState.currentAnswerIndex = nextIndex;
          await this.loadContent();
        }
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
      
      // 如果有批量回答缓存
      if (this.viewState.batchAnswers && prevIndex >= 0) {
        // 从批量回答中获取
        this.viewState.article = this.viewState.batchAnswers[prevIndex];
        this.viewState.currentAnswerIndex = prevIndex;
        
        // 更新URL
        if (this.viewState.article.actualUrl) {
          this.viewState.url = this.viewState.article.actualUrl;
        }
        
        this.updateContent();
      } else {
        // 使用传统方式加载
        const prevAnswerId = this.viewState.answerIds[prevIndex];
        this.viewState.url = `https://www.zhihu.com/question/${this.viewState.questionId}/answer/${prevAnswerId}`;
        this.viewState.currentAnswerIndex = prevIndex;
        await this.loadContent();
      }
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
   * 加载更多批量回答
   */
  private async loadMoreBatchAnswers(): Promise<void> {
    if (!this.viewState.questionId) {
      return;
    }

    try {
      // 显示加载状态
      this.viewState.isLoading = true;
      this.viewState.article = {
        ...this.viewState.article,
        content: "正在加载更多回答..."
      };
      this.updateContent();

      // 获取配置中的无图片模式设置
      const config = vscode.workspace.getConfiguration("zhihu-fisher");
      const hideImages = config.get<boolean>("hideImages", false);

      console.log(`加载问题 ${this.viewState.questionId} 的更多回答`);
      
      // 加载更多回答
      const newAnswers = await this.zhihuService.loadMoreBatchAnswers(
        this.viewState.questionId,
        this.viewState.answersPerBatch,
        hideImages
      );
      
      this.viewState.isLoading = false;
      
      if (newAnswers && newAnswers.length > 0) {
        console.log(`成功加载 ${newAnswers.length} 个新回答`);
        
        // 更新批次计数
        this.viewState.batchCount = (this.viewState.batchCount || 0) + 1;
        
        // 添加新的回答ID
        const newIds = newAnswers.map(answer => {
          const answerIdMatch = answer.actualUrl?.match(/answer\/(\d+)/);
          return answerIdMatch ? answerIdMatch[1] : "";
        }).filter(id => id !== "");
        
        this.viewState.answerIds = [...this.viewState.answerIds, ...newIds];
        
        // 将新回答添加到批量回答数组
        if (this.viewState.batchAnswers) {
          this.viewState.batchAnswers = [...this.viewState.batchAnswers, ...newAnswers];
        } else {
          this.viewState.batchAnswers = newAnswers;
        }
        
        // 更新当前回答为新批次的第一个回答
        this.viewState.article = newAnswers[0];
        this.viewState.currentAnswerIndex = this.viewState.answerIds.length - newIds.length;
        
        // 更新URL
        if (this.viewState.article.actualUrl) {
          this.viewState.url = this.viewState.article.actualUrl;
        }
        
        // 检查是否还有更多回答
        // 这个状态在loadMoreBatchAnswers调用中已经更新了，不需要额外更新
        
        // 更新内容
        this.updateContent();
      } else {
        console.log("没有更多回答可加载");
        this.viewState.hasMoreAnswers = false;
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
   * 获取更多回答 - 已废弃，保留用于兼容性
   * @deprecated 请使用loadMoreBatchAnswers方法代替
   */
  private async fetchMoreAnswers(): Promise<void> {
    await this.loadMoreBatchAnswers();
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
