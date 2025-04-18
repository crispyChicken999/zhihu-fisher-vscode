import { Store } from "../../stores";
import { LinkItem, WebViewItem } from "../../types";
import * as vscode from "vscode";
import { HtmlRenderer } from "./html";
import { PuppeteerManager } from "../puppeteer";

export class WebviewManager {
  webview = null as unknown as WebViewItem;

  async openWebview(item: LinkItem): Promise<void> {
    console.log(`开始获取文章内容: ${item.url}`);

    // 检查是否已经打开了这篇文章
    const existingView = Store.webviewMap.get(item.id);
    if (existingView) {
      // 如果已打开，激活对应的面板
      existingView.webviewPanel.reveal();
      return;
    }

    // 获取配置中的每批回答数量
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    // const answersPerBatch = config.get<number>("answersPerBatch", 10);

    // 避免文章标题过长，截取前15个字符
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
    this.webview = {
      id: item.id,
      url: item.url,
      webviewPanel: panel,
      article: {
        title: item.title,
        excerpt: item.excerpt,
        answerList: [],
        currentAnswerIndex: 0,
        loadedAnswerCount: 0,
        totalAnswerCount: 0,
        loadComplete: false,
        isLoading: false,
      },
      isLoading: true,
      isLoaded: false,
    };
    Store.webviewMap.set(item.id, this.webview); // 将WebView项存储到Map中

    // 在WebView中显示正在加载状态
    panel.webview.html = HtmlRenderer.getLoadingHtml(item.title, item.excerpt);

    // 设置消息处理
    this.setupMessageHandling();

    // 设置面板关闭处理
    this.setupPanelCloseHandler();
  }

  /**
   * 设置WebView消息处理
   */
  private setupMessageHandling(): void {
    // 处理WebView消息
    this.webview.webviewPanel.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case "requestContent":
          await this.loadContent();
          break;
        case "openInBrowser":
          // 如果提供了特定的URL（如作者页面），则打开该URL，否则打开文章URL
          if (message.url) {
            vscode.env.openExternal(vscode.Uri.parse(message.url));
          } else {
            vscode.env.openExternal(vscode.Uri.parse(this.webview.url));
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

  /**
   * 加载文章内容
   */
  private async loadContent(): Promise<void> {
    try {
      // 已经加载过内容并且正在加载中，避免重复请求
      if (this.webview.isLoading) {
        return;
      }

      this.webview.isLoading = true;
      // 获取配置中的无图片模式设置
      const config = vscode.workspace.getConfiguration("zhihu-fisher");
      const hideImages = config.get<boolean>("hideImages", false);
      const answersPerBatch = config.get<number>("answersPerBatch", 10);

      // 显示状态栏加载提示
      const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
      );

      // 为了避免文章标题过长，截取前15个字符
      const shortTitle =
        this.webview.article.title.length > 15
          ? `${this.webview.article.title.substring(0, 15)}...`
          : this.webview.article.title;

      statusBarItem.text = `$(sync~spin) 加载文章: ${shortTitle}`;
      statusBarItem.show();

      // 关键步骤！
      // 这里使用 Puppeteer来获取文章内容
      const page = await PuppeteerManager.createPage();
      PuppeteerManager.setPageInstance(this.webview.id, page); // 设置页面实例

      // 前往页面
      await page.goto(this.webview.url, {
        waitUntil: "networkidle0",
        timeout: 30000, // 30秒超时
      });

      console.log("页面加载完成，等待内容稳定...");
      await PuppeteerManager.simulateHumanScroll(page);
      await PuppeteerManager.delay(1000);

      // 拿全部回答的总数量
      const totalAnswerCount = await page.evaluate(() => {
        const answerElements = document.querySelector(
          ".List-header .List-headerText span"
        );
        // 2,437 个回答， 需要去掉逗号、空格和汉字
        const count = answerElements?.textContent?.replace(/[^\d]/g, "");
        return parseInt(count || "0", 10);
      });
      this.webview.article.totalAnswerCount = totalAnswerCount;
      console.log(`总回答数量: ${totalAnswerCount}`);

      // 看看已加载的回答的数量是否达到批次
      const loadedAnswerCount = await page.evaluate(() => {
        const answerElements = document.querySelectorAll(".List-item");
        return answerElements.length;
      });
      /**
       * @todo 这个时breaker条件，没达到的话就要一直往下滚动
       * 也许是返回一个promise 然后await一下，传入page
       */
      if (loadedAnswerCount >= answersPerBatch) {
      }
      this.webview.article.loadedAnswerCount = loadedAnswerCount;
      console.log(`已加载回答数量: ${loadedAnswerCount}`);

      // 拿够回答的数量后，开始解析数据
      
    } catch (error) {
    } finally {
    }
  }

  /**
   * 切换图片显示
   */
  private async toggleImageDisplay(): Promise<void> {
    // 获取当前配置
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const currentValue = config.get<boolean>("hideImages", false);

    // 切换值
    await config.update(
      "hideImages",
      !currentValue,
      vscode.ConfigurationTarget.Global
    );

    // 重新加载文章内容（不触发网络请求，仅重新处理已获取的内容）
    this.updateContent();
  }

  /**
   * 设置面板关闭处理
   */
  private setupPanelCloseHandler(): void {
    this.webview.webviewPanel.onDidDispose(
      async () => {
        // 如果是问题页面，关闭对应的浏览器实例
        if (this.webview.id) {
          try {
            console.log(`视图关闭，关闭问题 ${this.webview.id} 的浏览器标签页`);
            await PuppeteerManager.closePage(this.webview.id);
          } catch (error) {
            console.error("关闭浏览器时出错:", error);
          }
        }

        // 通知外部调用者面板已关闭
        this.onDidDisposeCallback?.(this.webview.id);
      },
      null,
      []
    );
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
