import { marked } from "marked";
import * as vscode from "vscode";
import { Store } from "../../stores";
import { HtmlRenderer } from "./html";
import * as Puppeteer from "puppeteer";
import { CookieManager } from "../cookie";
import { PuppeteerManager } from "../puppeteer";
import { CommentsManager } from "./components/comments";
import { LinkItem, WebViewItem, AnswerItem } from "../../types";

export class WebviewManager {
  /** 在vscode编辑器中打开页面（新建一个窗口） */
  static async openWebview(item: LinkItem): Promise<void> {
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
        localResourceRoots: [],
      }
    );

    // 获取配置中的每批回答数量
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const limitPerBatch = config.get<number>("answersPerBatch", 10);

    const webviewItem: WebViewItem = {
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
    Store.webviewMap.set(item.id, webviewItem);

    // 在WebView中显示正在加载状态
    panel.webview.html = HtmlRenderer.getLoadingHtml(item.title, item.excerpt);

    // 设置消息处理
    this.setupMessageHandling(item.id);

    // 设置面板关闭处理
    this.setupPanelCloseHandler(item.id);

    // 设置视图状态变化处理（监听标签页切换）
    this.setupViewStateChangeHandler(item.id);
  }

  /** 更新内容显示 */
  private static updateWebview(webviewId: string): void {
    const webviewItem = Store.webviewMap.get(webviewId);
    if (!webviewItem) {
      return;
    }

    // 更新WebView内容
    webviewItem.webviewPanel.webview.html =
      HtmlRenderer.getArticleHtml(webviewId);
  }

  /** 从URL中爬取数据 */
  private static async crawlingURLData(webviewId: string): Promise<void> {
    const webviewItem = Store.webviewMap.get(webviewId);
    if (!webviewItem) {
      return;
    }

    try {
      // 已经加载过内容并且正在加载中，避免重复请求
      if (webviewItem.isLoading) {
        return;
      }

      webviewItem.isLoading = true;

      // 显示状态栏加载提示
      const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
      );
      const shortTitle = this.getShortTitle(webviewItem.article.title);
      statusBarItem.text = `$(sync~spin) 加载文章: ${shortTitle}`;
      statusBarItem.show();

      // 保存状态栏项目的引用
      Store.statusBarMap.set(webviewId, statusBarItem);

      // 关键步骤！
      // 这里使用 Puppeteer来获取文章内容
      const page = await PuppeteerManager.createPage();
      PuppeteerManager.setPageInstance(webviewId, page); // 设置页面实例

      // 前往页面
      await page.goto(webviewItem.url, {
        waitUntil: "networkidle0",
        timeout: 60000, // 60秒超时
      });

      // 到这一步，页面加载完成，开始处理内容
      console.log("页面加载完成，开始读取页面...");
      webviewItem.isLoading = false;
      webviewItem.webviewPanel.title = shortTitle; // 更新面板标题

      const isCookieExpired = await CookieManager.checkIfPageHasLoginElement(
        page
      );
      if (isCookieExpired) {
        console.log("Cookie过期，请重新登录！");
        webviewItem.webviewPanel.webview.html =
          HtmlRenderer.getCookieExpiredHtml();
        return;
      }

      // 隐藏状态栏加载提示
      this.hideStatusBarItem(webviewId);

      // 全部回答的总数量
      const totalAnswerCount = await page.evaluate(() => {
        const answerElements = document.querySelector(
          ".List-header .List-headerText span"
        );
        // 2,437 个回答， 需要去掉逗号、空格和汉字
        const count = answerElements?.textContent?.replace(/[^\d]/g, "");
        return parseInt(count || "0", 10);
      });
      webviewItem.article.totalAnswerCount = totalAnswerCount;
      console.log(`总回答数量: ${totalAnswerCount}`);

      // 初始化批次加载参数
      webviewItem.batchConfig.beforeLoadCount =
        webviewItem.batchConfig.afterLoadCount =
          webviewItem.article.answerList.length;
      await this.parseAllAnswers(webviewId, page); // 解析页面中的全部回答

      await this.loadMoreAnswers(webviewId, page); // 加载更多回答
    } catch (error) {
      const webviewItem = Store.webviewMap.get(webviewId);
      if (webviewItem) {
        webviewItem.isLoading = false;
      }

      // 隐藏状态栏加载提示，即使出错也应该隐藏
      this.hideStatusBarItem(webviewId);

      console.error("加载内容时出错:", error);
      throw new Error("加载内容时出错:" + error);
    }
  }

  /** 隐藏状态栏项目 */
  private static hideStatusBarItem(webviewId: string): void {
    const statusBarItem = Store.statusBarMap.get(webviewId);
    if (statusBarItem) {
      statusBarItem.hide();
      statusBarItem.dispose();
      Store.statusBarMap.delete(webviewId);
    }
  }

  /** 加载上一个回答 */
  public static async loadPreviousAnswer(webviewId: string): Promise<void> {
    const webviewItem = Store.webviewMap.get(webviewId);
    if (!webviewItem) {
      return;
    }

    try {
      if (webviewItem.article.currentAnswerIndex > 0) {
        webviewItem.article.currentAnswerIndex -= 1;

        // 更新webview内容
        this.updateWebview(webviewId);
      } else {
        console.log("没有更多的回答可以加载了！");
      }
    } catch (error) {
      console.error("加载上一个回答时出错:", error);
      vscode.window.showErrorMessage("加载上一个回答时出错:" + error);
    }
  }

  /** 加载下一个回答 */
  public static async loadNextAnswer(webviewId: string): Promise<void> {
    const webviewItem = Store.webviewMap.get(webviewId);
    if (!webviewItem) {
      return;
    }

    try {
      if (
        webviewItem.article.currentAnswerIndex <
        webviewItem.article.answerList.length - 1
      ) {
        webviewItem.article.currentAnswerIndex += 1;
        // 更新WebView内容
        this.updateWebview(webviewId);

        // 这里的逻辑是：如果当前回答索引大于等于当前批次已加载回答数量-5，则加载更多回答
        if (
          webviewItem.article.currentAnswerIndex >=
          webviewItem.article.loadedAnswerCount - 5
        ) {
          if (webviewItem.batchConfig.isLoadingBatch) {
            console.log("批次正在加载中，跳过...");
            return;
          }

          // 检查页面是否还存在，避免在获取页面实例前就已经被关闭了
          // 这种情况可能发生在用户点击加载下一条回答后立即关闭了页面
          if (!Store.webviewMap.has(webviewId)) {
            console.log("页面已关闭，取消加载更多回答");
            return;
          }

          const page = PuppeteerManager.getPageInstance(webviewId);
          if (!page) {
            console.log("无法获取页面实例，取消加载更多回答");
            return;
          }

          // 初始化批次加载参数
          webviewItem.batchConfig.beforeLoadCount =
            webviewItem.batchConfig.afterLoadCount =
              webviewItem.article.answerList.length;
          webviewItem.batchConfig.isLoadingBatch = true; // 设置为正在加载批次
          this.updateWebview(webviewId); // 更新WebView内容

          // 再次检查页面是否存在
          if (Store.webviewMap.has(webviewId)) {
            await this.loadMoreAnswers(webviewId, page);
          } else {
            console.log("页面已关闭，中断加载更多回答");
          }
        }
      } else {
        console.log("没有更多的回答可以加载了！");
      }
    } catch (error) {
      console.error("加载下一个回答时出错:", error);
      // 不显示错误消息，如果是因为页面关闭导致的错误
      if (Store.webviewMap.has(webviewId)) {
        vscode.window.showErrorMessage("加载下一个回答时出错:" + error);
      } else {
        console.log("页面已关闭，忽略加载错误");
      }
    }
  }

  /** 跳转到指定回答 */
  public static async jumpToAnswer(
    webviewId: string,
    answerIndex: number
  ): Promise<void> {
    const webviewItem = Store.webviewMap.get(webviewId);
    if (!webviewItem) {
      return;
    }

    try {
      // 检查索引是否有效
      if (
        answerIndex >= 0 &&
        answerIndex < webviewItem.article.loadedAnswerCount
      ) {
        // 设置当前回答索引
        webviewItem.article.currentAnswerIndex = answerIndex;

        // 更新webview内容
        this.updateWebview(webviewId);

        // 如果当前回答索引接近已加载回答的末尾，预加载更多回答
        if (
          answerIndex >= webviewItem.article.loadedAnswerCount - 5 &&
          !webviewItem.article.loadComplete &&
          !webviewItem.batchConfig.isLoadingBatch
        ) {
          console.log("当前回答接近末尾，尝试加载更多回答");

          // 检查页面实例是否存在
          const page = PuppeteerManager.getPageInstance(webviewId);
          if (page) {
            // 初始化批次加载参数
            webviewItem.batchConfig.beforeLoadCount =
              webviewItem.batchConfig.afterLoadCount =
                webviewItem.article.answerList.length;
            webviewItem.batchConfig.isLoadingBatch = true; // 设置为正在加载批次
            this.updateWebview(webviewId); // 更新WebView内容

            // 加载更多回答
            await this.loadMoreAnswers(webviewId, page);
          }
        }
      } else {
        console.log(`无效的回答索引: ${answerIndex}`);
      }
    } catch (error) {
      console.error("跳转到指定回答时出错:", error);
      if (Store.webviewMap.has(webviewId)) {
        vscode.window.showErrorMessage("跳转到指定回答时出错:" + error);
      }
    }
  }

  /** 从页面中解析全部的回答 */
  private static async parseAllAnswers(
    webviewId: string,
    page: Puppeteer.Page
  ): Promise<void> {
    const webviewItem = Store.webviewMap.get(webviewId);
    if (!webviewItem) {
      return;
    }

    if (webviewItem.article.isLoading) {
      console.log("正在解析回答中，请稍候...");
      return;
    }

    try {
      webviewItem.article.isLoading = true;
      this.updateWebview(webviewId); // 更新WebView内容

      console.log("开始解析回答列表...");

      // 解析回答列表
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
              commentList: [],
              commentStatus: "collapsed", // 默认收起评论
              commentPaging: {
                current: 0,
                limit: 20,
                is_end: false,
                is_start: true,
                next: null,
                previous: null,
                totals: 0,
                loadedTotals: 0,
              },
              updateTime: updateTime
                ? new Date(updateTime).toLocaleString("zh-CN", {
                    timeZone: "Asia/Shanghai",
                  })
                : "",
              content: contentHtml,
            });
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

        // 找到当前已加载的回答
        const existingAnswer = webviewItem.article.answerList.find(
          (v) => v.id === item.id
        );

        // 如果当前回答已经存在，则恢复评论列表和分页参数，后续有参数需要保留可以在这里添加
        if (existingAnswer) {
          item.commentStatus = existingAnswer.commentStatus; // 恢复评论状态
          item.commentList = existingAnswer.commentList; // 恢复评论列表
          item.commentPaging = existingAnswer.commentPaging; // 恢复评论分页参数
        }
      });

      webviewItem.article.answerList = answerList;
      webviewItem.article.isLoading = false;

      // 更新批次加载数量参数，便于中断循环
      webviewItem.batchConfig.afterLoadCount = answerList.length || 0;

      webviewItem.article.loadedAnswerCount =
        webviewItem.article.answerList.length;
      webviewItem.article.loadComplete =
        webviewItem.article.answerList.length >=
        webviewItem.article.totalAnswerCount;

      this.updateWebview(webviewId); // 更新WebView内容
    } catch (error) {
      console.error("解析内容时出错:", error);
      throw new Error("解析内容时出错:" + error);
    }
  }

  /**
   * 获取更多回答
   * @description 递归加载更多回答，直到达到每批次的限制数量
   * @param webviewId - WebView的ID
   * @param page - Puppeteer的Page实例
   */
  private static async loadMoreAnswers(
    webviewId: string,
    page: Puppeteer.Page
  ): Promise<void> {
    // 在递归开始时先检查页面是否已经关闭
    if (!Store.webviewMap.has(webviewId)) {
      console.log("页面已关闭，停止加载更多回答。");
      return;
    }

    const webviewItem = Store.webviewMap.get(webviewId);
    if (!webviewItem) {
      return;
    }

    if (webviewItem.article.loadComplete) {
      console.log("全部回答已加载完成，停止加载更多。");
      webviewItem.article.isLoading = false; // 设置为加载完成
      webviewItem.batchConfig.isLoadingBatch = false; // 设置为批次加载完成
      this.updateWebview(webviewId); // 更新WebView内容
      return;
    }

    console.log(
      `当前批次已加载：${
        webviewItem.batchConfig.afterLoadCount -
        webviewItem.batchConfig.beforeLoadCount
      }，批次数量限制为：${webviewItem.batchConfig.limitPerBatch}`
    );

    // 模拟滚动到底部加载更多回答
    try {
      // 滚动前先拿一下当前的滚动高度
      const scrollHeightBefore = await page.evaluate(() => {
        return document.body.scrollHeight;
      });

      await PuppeteerManager.simulateHumanScroll(page);
      await PuppeteerManager.delay(1000);

      // 滚动后获取新的滚动高度
      const scrollHeightAfter = await page.evaluate(() => {
        return document.body.scrollHeight;
      });

      // 如果滚动高度没有变化，可能是加载完成了，认为是已经触及页面底部，那么应该中断加载
      if (scrollHeightBefore === scrollHeightAfter) {
        console.log(
          "滚动后页面高度没有变化，可能已经加载完成，停止加载更多回答。"
        );
        webviewItem.article.loadComplete = true; // 设置为加载完成
        webviewItem.batchConfig.isLoadingBatch = false; // 设置为批次加载完成
        // 更新已加载的回答数量，因为有时候页面中显示的回答总数和页面回答的实际数量不匹配，如果滚动到底部，数量不一致则以实际数量为准
        webviewItem.article.totalAnswerCount =
          webviewItem.article.loadedAnswerCount;
        this.updateWebview(webviewId); // 更新WebView内容
        return;
      } else {
        console.log(
          `滚动后页面高度变化：${scrollHeightBefore}px -> ${scrollHeightAfter}px，认为有更多内容`
        );
      }

      // 滚动后再次检查页面是否已关闭
      if (!Store.webviewMap.has(webviewId)) {
        console.log("页面在滚动加载过程中已关闭，停止加载更多回答。");
        return;
      }

      // 重新解析回答列表
      await this.parseAllAnswers(webviewId, page);

      // 解析后再次检查页面是否已关闭
      if (!Store.webviewMap.has(webviewId)) {
        console.log("页面在解析回答过程中已关闭，停止加载更多回答。");
        return;
      }

      const webviewItemUpdated = Store.webviewMap.get(webviewId); // 重新获取，因为可能已经被更新
      if (!webviewItemUpdated) {
        console.log("页面已关闭或WebView项已被删除，停止加载更多回答。");
        return;
      }

      const beforeLoadCount = webviewItemUpdated.batchConfig.beforeLoadCount; // 加载前的回答数量
      const afterLoadCount = webviewItemUpdated.batchConfig.afterLoadCount; // 加载后的回答数量
      const limitPerBatch = webviewItemUpdated.batchConfig.limitPerBatch; // 每批加载的回答数量

      // 如果加载的回答数量超过了配置的每批数量，则停止加载更多
      if (afterLoadCount - beforeLoadCount >= limitPerBatch) {
        console.log(
          `加载了 ${
            afterLoadCount - beforeLoadCount
          } 新个回答，达到每批 ${limitPerBatch} 个回答的限制， 总共已加载${
            webviewItemUpdated.article.loadedAnswerCount
          }，停止加载更多`
        );
        webviewItemUpdated.batchConfig.isLoadingBatch = false; // 设置为批次加载完成

        // 更新WebView前再次检查页面是否存在
        if (Store.webviewMap.has(webviewId)) {
          this.updateWebview(webviewId); // 更新WebView内容
        } else {
          console.log("页面已关闭，取消更新WebView");
        }
        return;
      }

      // 递归调用前再次检查页面是否存在
      if (Store.webviewMap.has(webviewId)) {
        await this.loadMoreAnswers(webviewId, page); // 递归调用加载更多回答
      } else {
        console.log("页面已关闭，取消继续加载更多回答");
      }
    } catch (error) {
      // 捕获可能的错误，例如页面已关闭导致的错误
      console.error("加载更多回答时出错:", error);

      // 如果页面还存在，则标记批次加载完成，避免继续加载
      const currentWebviewItem = Store.webviewMap.get(webviewId);
      if (currentWebviewItem) {
        currentWebviewItem.batchConfig.isLoadingBatch = false;
        console.log("发生错误，中断加载过程");
      } else {
        console.log("页面已关闭，忽略加载错误");
      }
    }
  }

  /** 获取短标题，避免文章标题过长，截取前15个字符 */
  private static getShortTitle(title: string): string {
    return title.length > 15 ? `${title.substring(0, 15)}...` : title;
  }

  /** 切换媒体显示模式 */
  private static async toggleMedia(webviewId: string): Promise<void> {
    // 获取当前配置
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const currentMode = config.get<string>("mediaDisplayMode", "normal");

    // 三种模式循环切换：normal -> mini -> none -> normal
    let newMode: string;
    switch (currentMode) {
      case "normal":
        newMode = "mini";
        break;
      case "mini":
        newMode = "none";
        break;
      case "none":
      default:
        newMode = "normal";
        break;
    }

    // 更新配置
    await config.update(
      "mediaDisplayMode",
      newMode,
      vscode.ConfigurationTarget.Global
    );

    // 重新加载文章内容（不触发网络请求，仅重新处理已获取的内容）
    this.updateWebview(webviewId);
  }

  /** 设置媒体显示模式 */
  private static async setMediaMode(
    webviewId: string,
    mode: string
  ): Promise<void> {
    // 处理直接设置媒体模式的消息
    if (!mode) {
      return;
    }

    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    await config.update(
      "mediaDisplayMode",
      mode,
      vscode.ConfigurationTarget.Global
    );
    this.updateWebview(webviewId);
  }

  /** 设置WebView消息处理 */
  private static setupMessageHandling(webviewId: string): void {
    const webviewItem = Store.webviewMap.get(webviewId);
    if (!webviewItem) {
      return;
    }

    // 处理WebView消息
    webviewItem.webviewPanel.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case "requestContent":
          await this.crawlingURLData(webviewId);
          break;

        case "updateCookie":
          // 处理更新Cookie的请求
          await vscode.commands.executeCommand("zhihu-fisher.setCookie");
          // 刷新当前页面
          if (webviewItem) {
            webviewItem.webviewPanel.webview.html = HtmlRenderer.getLoadingHtml(
              webviewItem.article.title,
              webviewItem.article.excerpt
            );
          }
          break;

        case "openInBrowser":
          const webviewItemForBrowser = Store.webviewMap.get(webviewId);
          if (!webviewItemForBrowser) {
            return;
          }
          // 如果提供了特定的URL（如作者页面），则打开该URL，否则打开文章URL
          if (message.url) {
            vscode.env.openExternal(vscode.Uri.parse(message.url));
          } else {
            vscode.env.openExternal(
              vscode.Uri.parse(webviewItemForBrowser.url)
            );
          }
          break;

        case "toggleMedia":
          await this.toggleMedia(webviewId);
          break;

        case "setMediaMode":
          await this.setMediaMode(webviewId, message.mode);
          break;

        case "loadPreviousAnswer":
          await this.loadPreviousAnswer(webviewId);
          break;

        case "loadNextAnswer":
          await this.loadNextAnswer(webviewId);
          break;

        case "jumpToAnswer":
          // 响应分页器的跳转请求，传入目标回答的索引
          if (typeof message.index === "number") {
            await this.jumpToAnswer(webviewId, message.index);
          }
          break;

        case "loadComments":
          await CommentsManager.loadComments(
            webviewId,
            message.answerId,
            message.page
          );
          break;

        case "loadChildComments":
          await CommentsManager.loadChildComments(
            webviewId,
            message.commentId,
            message.page
          );
          break;

        case "toggleCommentStatus":
          CommentsManager.toggleCommentStatus(webviewId, message.answerId);
      }
    });
  }

  /** 设置面板关闭处理 */
  private static setupPanelCloseHandler(webviewId: string): void {
    const webviewItem = Store.webviewMap.get(webviewId);
    if (!webviewItem) {
      return;
    }

    webviewItem.webviewPanel.onDidDispose(
      async () => {
        // 如果是问题页面，关闭对应的浏览器实例
        if (webviewId) {
          try {
            console.log(`视图关闭，关闭问题 ${webviewId} 的浏览器标签页`);

            // 检查是否正在加载回答，如果是则中断加载过程
            if (
              webviewItem.article.isLoading ||
              webviewItem.batchConfig.isLoadingBatch
            ) {
              console.log(`检测到正在加载回答，中断加载过程...`);
              // 将加载标志设置为false，以便中断加载过程
              webviewItem.article.isLoading = false;
              webviewItem.batchConfig.isLoadingBatch = false;
              webviewItem.article.loadComplete = true; // 强制标记为加载完成，以避免继续加载
            }
            Store.webviewMap.delete(webviewId);
            await PuppeteerManager.closePage(webviewId);
          } catch (error) {
            console.error("关闭浏览器时出错:", error);
          }
        }

        // 通知外部调用者面板已关闭
        WebviewManager.onDidDisposeCallback?.(webviewId);
      },
      null,
      []
    );
  }

  /** 设置视图状态变化处理 */
  private static setupViewStateChangeHandler(webviewId: string): void {
    const webviewItem = Store.webviewMap.get(webviewId);
    if (!webviewItem) {
      return;
    }

    webviewItem.webviewPanel.onDidChangeViewState(async (event) => {
      if (event.webviewPanel.active) {
        console.log(`WebView ${webviewId} 被激活`);
        // 当VS Code标签页被激活时，同时激活对应的Puppeteer浏览器页面
        await PuppeteerManager.bringPageToFront(webviewId);
      } else {
        console.log(`WebView ${webviewId} 失去焦点`);
      }
    });
  }

  /** 回调函数，用于通知视图管理器面板已关闭 */
  private static onDidDisposeCallback?: (id: string) => void;

  /** 设置面板关闭回调 */
  public static setOnDidDisposeCallback(callback: (id: string) => void): void {
    WebviewManager.onDidDisposeCallback = callback;
  }
}
