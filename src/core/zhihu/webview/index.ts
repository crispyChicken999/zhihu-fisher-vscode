import { Store } from "../../stores";
import { LinkItem, WebViewItem, AnswerItem } from "../../types";
import * as vscode from "vscode";
import { HtmlRenderer } from "./html";
import { PuppeteerManager } from "../puppeteer";
import * as Puppeteer from "puppeteer";
import { marked } from "marked";

export class WebviewManager {
  private webview = null as unknown as WebViewItem;
  private disposables: vscode.Disposable[] = []; // 添加一个数组来存储所有的订阅

  constructor() {}

  // public watchVscodeWindowEvents() {
  //   // 添加活动编辑器变化事件监听
  //   const disposable = vscode.window.onDidChangeActiveTextEditor(
  //     this.onDidChangeActiveTextEditor,
  //     this
  //   );
  //   this.disposables.push(disposable);

  //   // 添加活动窗口变化事件监听
  //   const windowDisposable = vscode.window.onDidChangeWindowState(
  //     this.onDidChangeWindowState,
  //     this
  //   );
  //   this.disposables.push(windowDisposable);
  // }

  // 处理窗口状态变化事件
  // private async onDidChangeWindowState(e: vscode.WindowState): Promise<void> {
  //   if (e.focused) {
  //     await this.activateWebviewBrowserTab();
  //   }
  // }

  // 处理活动编辑器变化事件
  // private async onDidChangeActiveTextEditor(
  //   editor?: vscode.TextEditor
  // ): Promise<void> {
  //   await this.activateWebviewBrowserTab();
  // }

  // 提取出激活浏览器标签页的逻辑为单独的方法
  // private async activateWebviewBrowserTab(): Promise<void> {
  //   // 当活动编辑器变化时，我们需要检查当前的活动面板是否是我们的WebView面板
  //   let activeWebview: WebViewItem = null as unknown as WebViewItem;
  //   Store.webviewMap.forEach((view) => {
  //     if (view.webviewPanel.visible) {
  //       activeWebview = view;
  //     }
  //   });

  //   if (!activeWebview) {
  //     console.log("没有活动的WebView面板，无法激活浏览器标签页。");
  //     return;
  //   }

  //   const activePage = PuppeteerManager.getPageInstance(
  //     activeWebview.id
  //   ) as unknown as Puppeteer.Page;
  //   console.log(`找到问题 ${activeWebview.id} 的浏览器页面，正在激活到前台...`);
  //   try {
  //     await activePage?.bringToFront();
  //   } catch (error) {
  //     console.error(`激活问题 ${activeWebview.id} 的浏览器标签页失败:`, error);
  //   }
  // }

  /** 在vscode编辑器中打开页面（新建一个窗口） */
  async openWebview(item: LinkItem): Promise<void> {
    console.log(`开始获取文章内容: ${item.url}`);

    // 检查是否已经打开了这篇文章
    const existingView = Store.webviewMap.get(item.id);
    if (existingView) {
      // 如果已打开，激活对应的面板
      existingView.webviewPanel.reveal();
      return;
    }

    // 获取短标题
    const shortTitle = this.getShortTitle(item.title);

    // 创建并配置WebView面板
    const panel = vscode.window.createWebviewPanel(
      "zhihuArticle",
      `加载中: ${shortTitle}`,
      vscode.ViewColumn.Active, // 修改为在当前编辑组显示
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          // vscode.Uri.joinPath(vscode.Uri.file(__dirname), "../../../media"),
        ],
      }
    );

    // 获取配置中的每批回答数量
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const limitPerBatch = config.get<number>("answersPerBatch", 10);

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
      batchConfig: {
        beforeLoadCount: 0,
        afterLoadCount: 0,
        limitPerBatch,
        isLoadingBatch: false,
      },
      isLoading: false,
      isLoaded: false,
    };

    // 将WebView项存储到Store中
    Store.webviewMap.set(item.id, this.webview);

    // 在WebView中显示正在加载状态
    panel.webview.html = HtmlRenderer.getLoadingHtml(item.title, item.excerpt);

    // 设置消息处理
    this.setupMessageHandling();

    // 设置面板关闭处理
    this.setupPanelCloseHandler();
  }

  /** 更新内容显示 */
  private updateWebview(): void {
    // 更新WebView内容
    this.webview.webviewPanel.webview.html = HtmlRenderer.getArticleHtml(
      this.webview.id
    );
  }

  /** 从URL中爬取数据 */
  private async crawlingURLData(): Promise<void> {
    try {
      // 已经加载过内容并且正在加载中，避免重复请求
      if (this.webview.isLoading) {
        return;
      }

      this.webview.isLoading = true;

      // 显示状态栏加载提示
      const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
      );
      const shortTitle = this.getShortTitle(this.webview.article.title);
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

      // 到这一步，页面加载完成，开始处理内容
      console.log("页面加载完成，开始读取页面...");
      this.webview.isLoading = false;
      this.webview.webviewPanel.title = shortTitle; // 更新面板标题

      // 全部回答的总数量
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

      // 初始化批次加载参数
      this.webview.batchConfig.beforeLoadCount =
        this.webview.batchConfig.afterLoadCount =
          this.webview.article.answerList.length;
      await this.parseAllAnswers(page); // 解析页面中的全部回答

      await this.loadMoreAnswers(page); // 加载更多回答
    } catch (error) {
      this.webview.isLoading = false;
      console.error("加载内容时出错:", error);
      throw new Error("加载内容时出错:" + error);
    }
  }

  /** 加载上一个回答 */
  public async loadPreviousAnswer(): Promise<void> {
    try {
      if (this.webview.article.currentAnswerIndex > 0) {
        this.webview.article.currentAnswerIndex -= 1;

        // 更新webview内容
        this.updateWebview();
      } else {
        console.log("没有更多的回答可以加载了！");
      }
    } catch (error) {
      console.error("加载上一个回答时出错:", error);
      vscode.window.showErrorMessage("加载上一个回答时出错:" + error);
    }
  }

  /** 加载下一个回答 */
  public async loadNextAnswer(): Promise<void> {
    try {
      if (
        this.webview.article.currentAnswerIndex <
        this.webview.article.answerList.length - 1
      ) {
        this.webview.article.currentAnswerIndex += 1;
        // 更新WebView内容
        this.updateWebview();

        // 这里的逻辑是：如果当前回答索引大于等于当前批次已加载回答数量-5，则加载更多回答
        if (
          this.webview.article.currentAnswerIndex >=
          this.webview.article.loadedAnswerCount - 5
        ) {
          if (this.webview.batchConfig.isLoadingBatch) {
            console.log("批次正在加载中，跳过...");
            return;
          }

          const page = PuppeteerManager.getPageInstance(this.webview.id);

          // 初始化批次加载参数
          this.webview.batchConfig.beforeLoadCount =
            this.webview.batchConfig.afterLoadCount =
              this.webview.article.answerList.length;
          this.webview.batchConfig.isLoadingBatch = true; // 设置为正在加载批次
          this.updateWebview(); // 更新WebView内容
          await this.loadMoreAnswers(page);
        }
      } else {
        console.log("没有更多的回答可以加载了！");
      }
    } catch (error) {
      console.error("加载下一个回答时出错:", error);
      vscode.window.showErrorMessage("加载下一个回答时出错:" + error);
    }
  }

  /** 从页面中解析全部的回答 */
  private async parseAllAnswers(page: Puppeteer.Page): Promise<void> {
    if (this.webview.article.isLoading) {
      console.log("正在解析回答中，请稍候...");
      return;
    }

    try {
      this.webview.article.isLoading = true;
      this.updateWebview(); // 更新WebView内容

      console.log("开始解析回答列表...");

      // 解析回答列表 @todo 可能有问题，因为获取完了以后就删除了元素，导致了scrollHeight发生了变化，那么滚动加载更多可能无法生效
      const answerList = await page.evaluate(() => {
        // 处理页面内容，获取回答列表
        const answerElements = document.querySelectorAll(
          ".QuestionAnswers-answers .List-item"
        );
        const list: AnswerItem[] = [];

        answerElements.forEach((element, index) => {
          try {
            // 获取回答元素 <div class="ContentItem AnswerItem">...</div>
            const answerElement = element.querySelector(
              ".ContentItem.AnswerItem"
            );

            // 获取问题ID
            const questionId = location.href.split("/").pop() as string;

            // 获取回答ID
            const answerId =
              answerElement?.getAttribute("name") || `answer-${index}`;
            const authorElement = element.querySelector(
              ".ContentItem-meta .AuthorInfo"
            );

            // 获取作者名称 authorElement 里面有 <meta itemprop="name" content="手抓饼熊">
            const authorName = authorElement
              ?.querySelector("meta[itemprop='name']")
              ?.getAttribute("content");

            // 获取作者头像 <meta itemprop="image" content="https://picx.zhimg.com/v2-b5492c22926d93ed35bb69751bd40003_l.jpg?source=1def8aca">
            const authorAvatar = authorElement
              ?.querySelector("meta[itemprop='image']")
              ?.getAttribute("content");

            // 获取作者URL <meta itemprop="url" content="https://www.zhihu.com/people/tongsanpang">
            const authorUrl = authorElement
              ?.querySelector("meta[itemprop='url']")
              ?.getAttribute("content");

            // 获取作者ID https://www.zhihu.com/people/tongsanpang 拿people后面的部分
            const authorId = authorUrl?.split("/").pop() || "";

            // 获取作者粉丝数 <meta itemprop="zhihu:followerCount" content="4987">
            const followersCount = authorElement
              ?.querySelector("meta[itemprop='zhihu:followerCount']")
              ?.getAttribute("content");

            // 获取作者签名 < class="AuthorInfo-badgeText">手抓饼熊</>
            const authorSignature = authorElement?.querySelector(
              ".AuthorInfo-badgeText"
            )?.textContent;

            // 获取回答点赞数 answerElement <meta itemprop="upvoteCount" content="648">
            const likeCount = element
              .querySelector("meta[itemprop='upvoteCount']")
              ?.getAttribute("content");

            // 获取回答评论数 <meta itemprop="commentCount" content="11">
            const commentCount = element
              .querySelector("meta[itemprop='commentCount']")
              ?.getAttribute("content");

            // 获取回答发布时间 <meta itemprop="dateCreated" content="2024-06-21T03:27:48.000Z">
            const publishTime = element
              .querySelector("meta[itemprop='dateCreated']")
              ?.getAttribute("content");

            // 获取回答更新时间 <meta itemprop="dateModified" content="2024-06-21T03:27:48.000Z">
            const updateTime = element
              .querySelector("meta[itemprop='dateModified']")
              ?.getAttribute("content");

            // 获取回答内容 answerElement 里面的.RichContent 的 <div class="RichContent-inner">...</div>
            const contentElement = element.querySelector(
              ".RichContent .RichContent-inner"
            );

            // 获取内容的HTML字符串
            const contentHtml = contentElement?.innerHTML || "";

            list.push({
              id: answerId,
              url: `https://www.zhihu.com/question/${questionId}/answer/${answerId}`,
              author: {
                id: authorId || "",
                name: authorName || "",
                url: authorUrl || "",
                signature: authorSignature || "",
                avatar: authorAvatar || "",
                followersCount: parseInt(followersCount || "0", 10) || 0,
              },
              likeCount: parseInt(likeCount || "0", 10) || 0,
              commentCount: parseInt(commentCount || "0", 10) || 0,
              publishTime: publishTime
                ? new Date(publishTime).toLocaleString("zh-CN", {
                    timeZone: "Asia/Shanghai",
                  })
                : "",
              updateTime: updateTime
                ? new Date(updateTime).toLocaleString("zh-CN", {
                    timeZone: "Asia/Shanghai",
                  })
                : "",
              content: contentHtml,
            });

            // 把这个元素从页面中删除，避免获后续获取回答元素时重复
            // element.remove();
          } catch (error) {
            console.error("解析回答时出错:", error);
            throw new Error("解析回答时出错:" + error);
          }
        });

        return list;
      });

      answerList.forEach((item) => {
        // 解析markdown格式的内容，因为evaluate时在浏览器环境中，并不存在我们import的这个库，所以需要出来再parse
        item.content = marked.parse(item.content) as string;
      });

      this.webview.article.answerList = [...answerList];
      this.webview.article.isLoading = false;

      // 更新批次加载数量参数，便于中断循环
      this.webview.batchConfig.afterLoadCount = answerList.length || 0;

      this.webview.article.loadedAnswerCount =
        this.webview.article.answerList.length;
      this.webview.article.loadComplete =
        this.webview.article.answerList.length >=
        this.webview.article.totalAnswerCount;

      this.updateWebview(); // 更新WebView内容
    } catch (error) {
      console.error("解析内容时出错:", error);
      throw new Error("解析内容时出错:" + error);
    }
  }

  /** 获取足够数量的回答，看看够不够不够则模拟滚动到页面底部加载更多 */
  private async loadMoreAnswers(page: Puppeteer.Page): Promise<void> {
    if (this.webview.article.loadComplete) {
      console.log("全部回答已加载完成，停止加载更多。");
      return;
    }

    console.log(
      `当前批次已加载：${
        this.webview.batchConfig.afterLoadCount -
        this.webview.batchConfig.beforeLoadCount
      }，批次数量限制为：${this.webview.batchConfig.limitPerBatch}`
    );

    // 模拟滚动到底部加载更多回答
    await PuppeteerManager.simulateHumanScroll(page);
    await PuppeteerManager.delay(1000);

    // 重新解析回答列表
    await this.parseAllAnswers(page);

    const beforeLoadCount = this.webview.batchConfig.beforeLoadCount; // 加载前的回答数量
    const afterLoadCount = this.webview.batchConfig.afterLoadCount; // 加载后的回答数量
    const limitPerBatch = this.webview.batchConfig.limitPerBatch; // 每批加载的回答数量

    // 如果加载的回答数量超过了配置的每批数量，则停止加载更多
    if (afterLoadCount - beforeLoadCount >= limitPerBatch) {
      console.log(
        `加载了 ${
          afterLoadCount - beforeLoadCount
        } 新个回答，达到每批 ${limitPerBatch} 个回答的限制， 总共已加载${
          this.webview.article.loadedAnswerCount
        }，停止加载更多`
      );
      this.webview.batchConfig.isLoadingBatch = false; // 设置为批次加载完成
      this.updateWebview(); // 更新WebView内容
      return;
    }

    await this.loadMoreAnswers(page); // 递归调用加载更多回答
  }

  /** 获取短标题，避免文章标题过长，截取前15个字符 */
  private getShortTitle(title: string): string {
    return title.length > 15 ? `${title.substring(0, 15)}...` : title;
  }

  /** 切换图片显示 */
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
    this.updateWebview();
  }

  /** 设置WebView消息处理 */
  private setupMessageHandling(): void {
    // 处理WebView消息
    this.webview.webviewPanel.webview.onDidReceiveMessage(async (message) => {
      // console.log(
      //   `接收到WebView Command: ${JSON.stringify(message)}，即将开始处理...`
      // );
      switch (message.command) {
        case "requestContent":
          await this.crawlingURLData();
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

        case "loadPreviousAnswer":
          await this.loadPreviousAnswer();
          break;
        case "loadNextAnswer":
          await this.loadNextAnswer();
          break;
      }
    });
  }

  /** 设置面板关闭处理 */
  private setupPanelCloseHandler(): void {
    this.webview.webviewPanel.onDidDispose(
      async () => {
        // 如果是问题页面，关闭对应的浏览器实例
        if (this.webview.id) {
          try {
            console.log(`视图关闭，关闭问题 ${this.webview.id} 的浏览器标签页`);
            await PuppeteerManager.closePage(this.webview.id);
            Store.webviewMap.delete(this.webview.id); // 删除对应的WebView项
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

  /** 回调函数，用于通知视图管理器面板已关闭 */
  private onDidDisposeCallback?: (id: string) => void;

  /** 设置面板关闭回调 */
  public setOnDidDisposeCallback(callback: (id: string) => void): void {
    this.onDidDisposeCallback = callback;
  }
}
