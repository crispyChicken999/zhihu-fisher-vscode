import { marked } from "marked";
import * as vscode from "vscode";
import { Store } from "../../stores";
import { HtmlRenderer } from "./html";
import * as Puppeteer from "puppeteer";
import { CookieManager } from "../cookie";
import { ZhihuApiService } from "../api/index";
import { PuppeteerManager } from "../puppeteer";
import { CommentsManager } from "./components/comments";
import { LinkItem, WebViewItem, AnswerItem } from "../../types";
import { WebViewUtils, CollectionPickerUtils } from "../../utils";
import { DisguiseManager } from "../../utils/disguise-manager";

export class WebviewManager {
  /** 在vscode编辑器中打开页面（新建一个窗口） */
  static async openWebview(
    item: LinkItem,
    sourceType: "collection" | "recommend" | "hot" | "search" = "recommend"
  ): Promise<void> {
    // 提取基础ID和内容类型
    let baseId = item.id;
    let contentType: "article" | "answer" =
      item.type === "article" ? "article" : "answer";
    let answerId: string | undefined;
    let targetUrl = item.url;
    let isSpecificAnswer = false; // 是否是特定回答

    // 检查是否是特定回答（有answerUrl的情况）
    if (item.answerUrl) {
      const extractedAnswerId = WebViewUtils.extractAnswerIdFromUrl(
        item.answerUrl
      );
      if (extractedAnswerId) {
        answerId = extractedAnswerId;
        isSpecificAnswer = true;

        // 跳转到问题页面，用于后续加载全部回答
        const questionId = WebViewUtils.extractQuestionIdFromUrl(
          item.answerUrl
        );
        if (questionId) {
          targetUrl = WebViewUtils.buildQuestionAllAnswersUrl(questionId);
          console.log(`特定回答模式，将跳转到问题页面: ${targetUrl}`);
        }
      }
    }

    // 生成唯一的webview ID
    const webviewId = WebViewUtils.generateUniqueWebViewId(
      baseId,
      sourceType,
      contentType,
      answerId
    );

    // 检查是否已经打开了这个特定的内容
    const existingView = Store.webviewMap.get(webviewId);
    if (existingView) {
      // 如果已打开，激活对应的面板
      existingView.webviewPanel.reveal();
      return;
    }

    // 获取短标题
    const shortTitle = this.getShortTitle(item.title);

    // 根据内容类型设置不同的面板类型和标题
    const panelType =
      item.type === "article" ? "zhihuArticle" : "zhihuQuestion";
    let loadingTitle;
    if (isSpecificAnswer) {
      loadingTitle = "加载回答中";
    } else if (item.type === "article") {
      loadingTitle = "加载文章中";
    } else {
      loadingTitle = "加载问题中";
    }

    // 创建并配置WebView面板
    const panel = vscode.window.createWebviewPanel(
      panelType,
      shortTitle,
      vscode.ViewColumn.Active, // 修改为在当前编辑组显示
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [],
      }
    );

    panel.iconPath = vscode.Uri.joinPath(
      Store.context!.extensionUri,
      "resources",
      "icon.svg"
    );

    // 当面板失去焦点的时候，使用智能伪装系统
    panel.onDidChangeViewState((e) => {
      if (e.webviewPanel.active) {
        // 获取当前的webviewID对应是否正在加载中
        // 激活时恢复原始标题和图标
        panel.title = shortTitle;
        panel.iconPath = vscode.Uri.joinPath(
          Store.context!.extensionUri,
          "resources",
          "icon.svg"
        );
      } else {
        // 失去焦点时使用智能伪装（支持配置开关）
        const disguise = DisguiseManager.getDisguiseOrDefault(
          webviewId,
          shortTitle
        );
        panel.title = disguise.title;
        panel.iconPath = disguise.iconPath;
      }
    });

    // 获取配置中的每批回答数量
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const limitPerBatch = config.get<number>("answersPerBatch", 10);

    const webviewItem: WebViewItem = {
      id: webviewId, // 使用生成的唯一ID
      url: targetUrl, // 使用处理后的目标URL
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
        // 保存目标回答ID，用于在加载过程中进行特殊处理
        targetAnswerId: answerId,
        // 标记是否是特定回答模式
        isSpecificAnswer: isSpecificAnswer,
        // 保存原始特定回答URL
        specificAnswerUrl: item.answerUrl,
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
    Store.webviewMap.set(webviewId, webviewItem);

    // 在WebView中显示正在加载状态
    panel.webview.html = HtmlRenderer.getLoadingHtml(
      item.title,
      item.excerpt,
      item.imgUrl
    );

    // 设置消息处理
    this.setupMessageHandling(webviewId);

    // 设置面板关闭处理
    this.setupPanelCloseHandler(webviewId);

    // 设置视图状态变化处理（监听标签页切换）
    this.setupViewStateChangeHandler(webviewId);

    // 根据内容类型调用不同的爬取方法
    if (item.type === "article") {
      this.crawlingArticleData(webviewId);
    } else {
      this.crawlingURLData(webviewId);
    }
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

      // 根据是否是特定回答显示不同的加载文本
      if (webviewItem.article.isSpecificAnswer) {
        statusBarItem.text = `$(sync~spin) 加载回答: ${shortTitle}`;
      } else {
        statusBarItem.text = `$(sync~spin) 加载问题: ${shortTitle}`;
      }
      statusBarItem.show();

      // 保存状态栏项目的引用
      Store.statusBarMap.set(webviewId, statusBarItem);

      // 如果是特定回答模式，先获取特定回答内容
      if (
        webviewItem.article.isSpecificAnswer &&
        webviewItem.article.specificAnswerUrl
      ) {
        console.log(
          `特定回答模式，先获取回答内容: ${webviewItem.article.specificAnswerUrl}`
        );
        try {
          const preloadedAnswer = await WebViewUtils.fetchSpecificAnswerContent(
            webviewItem.article.specificAnswerUrl
          );
          if (preloadedAnswer) {
            // 将预加载的回答转换为标准AnswerItem格式并放在第一位
            const preloadedAnswerItem: AnswerItem = {
              id: preloadedAnswer.id,
              url: preloadedAnswer.url,
              author: {
                id: preloadedAnswer.authorUrl?.split("/").pop() || "",
                name: preloadedAnswer.authorName,
                url: preloadedAnswer.authorUrl,
                signature: "",
                avatar: preloadedAnswer.authorAvatar,
                followersCount: 0,
              },
              likeCount: preloadedAnswer.voteCount || 0,
              commentCount: preloadedAnswer.commentCount || 0,
              publishTime: preloadedAnswer.publishTime,
              updateTime: preloadedAnswer.publishTime,
              content: marked.parse(preloadedAnswer.content) as string,
              commentList: [],
              commentStatus: "collapsed",
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
            };

            // 将预加载的回答放在第一位
            webviewItem.article.answerList.push(preloadedAnswerItem);
            webviewItem.article.loadedAnswerCount = 1;

            // 更新WebView显示特定回答
            this.updateWebview(webviewId);
            console.log(`成功预加载特定回答: ${preloadedAnswer.id}`);
          }
        } catch (error) {
          console.error("预加载特定回答失败:", error);
        }
      }

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

      if (webviewItem.webviewPanel.active) {
        webviewItem.webviewPanel.title = shortTitle; // 更新面板标题
      }

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

  /** 从文章URL中爬取数据 */
  private static async crawlingArticleData(webviewId: string): Promise<void> {
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

      // 使用 Puppeteer 来获取文章内容
      const page = await PuppeteerManager.createPage();
      PuppeteerManager.setPageInstance(webviewId, page);

      // 前往文章页面
      await page.goto(webviewItem.url, {
        waitUntil: "networkidle0",
        timeout: 60000,
      });

      console.log("文章页面加载完成，开始读取页面...");
      webviewItem.isLoading = false;
      webviewItem.webviewPanel.title = shortTitle;

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

      // 解析文章内容
      await this.parseArticleContent(webviewId, page);

      // 对于文章，我们可以直接显示内容，不需要分批加载
      webviewItem.article.loadComplete = true;
      webviewItem.isLoaded = true;

      // 更新 webview 内容
      this.updateWebview(webviewId);
    } catch (error) {
      const webviewItem = Store.webviewMap.get(webviewId);
      if (webviewItem) {
        webviewItem.isLoading = false;
      }

      // 隐藏状态栏加载提示
      this.hideStatusBarItem(webviewId);

      console.error("加载文章内容时出错:", error);
      throw new Error("加载文章内容时出错:" + error);
    }
  }

  /** 解析文章内容 */
  private static async parseArticleContent(
    webviewId: string,
    page: Puppeteer.Page
  ): Promise<void> {
    const webviewItem = Store.webviewMap.get(webviewId);
    if (!webviewItem) {
      return;
    }

    try {
      const articleData = await page.evaluate(() => {
        // 获取文章主体内容
        const contentElement = document.querySelector(
          ".Post-RichTextContainer .RichText"
        );
        const content = contentElement
          ? contentElement.innerHTML
          : "无法获取文章内容";

        // 获取作者信息
        const authorElement = document.querySelector(".AuthorInfo-name a");
        const authorName = authorElement
          ? authorElement.textContent?.trim() || "未知作者"
          : "未知作者";
        const authorUrl = authorElement
          ? (authorElement as HTMLAnchorElement).href
          : "";

        const authorAvatar = document.querySelector(".AuthorInfo-avatar");
        const authorAvatarUrl = authorAvatar
          ? (authorAvatar as HTMLImageElement).src
          : "";

        const authorSignature = document.querySelector(".AuthorInfo-badgeText");
        const authorHeadline = authorSignature
          ? authorSignature.textContent?.trim() || ""
          : "";

        // 获取发布时间
        const timeElement = document.querySelector(".ContentItem-time");
        const publishTime = timeElement
          ? timeElement.textContent?.trim() || ""
          : "";

        // 获取点赞数
        const likeElement = document.querySelector(
          ".VoteButton .VoteButton-TriangleUp"
        );
        const likeText = likeElement
          ? likeElement.parentElement?.textContent?.trim() || "0"
          : "0";
        const likeCount = parseInt(likeText.replace(/[^\d]/g, "") || "0", 10);

        // 获取评论数
        const commentElement = document.querySelector(
          ".BottomActions-CommentBtn"
        );
        const commentText = commentElement
          ? commentElement.textContent?.trim() || "0"
          : "0";
        const commentCount = parseInt(
          commentText.replace(/[^\d]/g, "") || "0",
          10
        );

        return {
          content,
          author: {
            name: authorName,
            url: authorUrl,
            avatar: authorAvatarUrl,
            signature: authorHeadline,
          },
          publishTime,
          likeCount,
          commentCount,
        };
      });

      // 从webviewId中提取纯数字的文章ID用于API调用
      let articleId = webviewId;
      if (webviewId.includes("article-")) {
        const parts = webviewId.split("-");
        articleId = parts[parts.length - 1];
      }

      // 创建一个虚拟的 AnswerItem 来存储文章内容
      const articleAnswer: AnswerItem = {
        id: articleId, // 使用纯数字ID，方便评论API使用
        url: webviewItem.url,
        author: {
          id: "article-author",
          url: articleData.author.url,
          name: articleData.author.name,
          signature: articleData.author.signature,
          avatar: articleData.author.avatar,
          followersCount: 0,
        },
        likeCount: articleData.likeCount,
        commentCount: articleData.commentCount,
        commentList: [],
        commentStatus: "collapsed",
        commentPaging: {
          is_end: true,
          is_start: true,
          next: null,
          previous: null,
          totals: articleData.commentCount,
          loadedTotals: 0,
          current: 1,
          limit: 20,
        },
        publishTime: articleData.publishTime,
        updateTime: articleData.publishTime,
        content: articleData.content,
      };

      // 将文章内容作为单个"回答"存储
      webviewItem.article.answerList = [articleAnswer];
      webviewItem.article.loadedAnswerCount = 1;
      webviewItem.article.totalAnswerCount = 1;
      webviewItem.article.currentAnswerIndex = 0;

      console.log("文章内容解析完成");
    } catch (error) {
      console.error("解析文章内容时出错:", error);
      throw error;
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

      // 处理回答去重逻辑
      const processedAnswers: AnswerItem[] = [];
      const existingAnswerIds = new Set(
        webviewItem.article.answerList.map((a) => a.id)
      );

      // 获取目标回答ID（用于特定回答模式）
      const targetAnswerId = webviewItem.article.targetAnswerId;

      answerList.forEach((item) => {
        // 解析markdown格式的内容
        item.content = marked.parse(item.content) as string;

        // 特殊处理：如果这是目标回答且已存在预加载版本，更新预加载版本的内容
        if (
          targetAnswerId &&
          item.id === targetAnswerId &&
          existingAnswerIds.has(item.id)
        ) {
          const preloadedAnswerIndex = webviewItem.article.answerList.findIndex(
            (a) => a.id === targetAnswerId
          );
          if (preloadedAnswerIndex !== -1) {
            // 更新预加载的回答内容（保留原有的评论状态）
            const existingAnswer =
              webviewItem.article.answerList[preloadedAnswerIndex];
            webviewItem.article.answerList[preloadedAnswerIndex] = {
              ...item,
              commentStatus: existingAnswer.commentStatus,
              commentList: existingAnswer.commentList,
              commentPaging: existingAnswer.commentPaging,
            };
            console.log(`更新目标回答内容: ${item.id}`);
          }
          return; // 跳过，因为已经更新了预加载版本
        }

        // 检查是否是重复回答
        if (existingAnswerIds.has(item.id)) {
          // 不用一直提示很烦
          // console.log(`过滤重复回答: ${item.id}`);
          return; // 跳过重复的回答
        }

        // 找到当前已加载的回答（这里主要是恢复评论状态）
        const existingAnswer = webviewItem.article.answerList.find(
          (v) => v.id === item.id
        );

        // 如果当前回答已经存在，则恢复评论列表和分页参数
        if (existingAnswer) {
          item.commentStatus = existingAnswer.commentStatus;
          item.commentList = existingAnswer.commentList;
          item.commentPaging = existingAnswer.commentPaging;
        }

        processedAnswers.push(item);
      });

      // 追加新解析的回答到现有列表
      webviewItem.article.answerList = [
        ...webviewItem.article.answerList,
        ...processedAnswers,
      ];

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
    } catch (error: any) {
      // 如果是超时错误，直接返回，不啰嗦打印出来咯，看到心烦哈哈哈，timeout？哦！
      console.log("error.message: ", error.message);
      if (
        error.message.includes(
          "ProtocolError: Input.dispatchMouseEvent timed out."
        ) ||
        error.message.includes("protocolTimeout")
      ) {
        return;
      }

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

  /** 设置Mini模式下图片缩放比例 */
  private static async setMiniMediaScale(scale: number): Promise<void> {
    if (!scale || scale < 1 || scale > 100) {
      return;
    }

    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    await config.update(
      "miniMediaScale",
      scale,
      vscode.ConfigurationTarget.Global
    );
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
          await vscode.commands.executeCommand("zhihu-fisher.setCookie"); // 刷新当前页面
          if (webviewItem) {
            webviewItem.webviewPanel.webview.html = HtmlRenderer.getLoadingHtml(
              webviewItem.article.title,
              webviewItem.article.excerpt,
              "" // 这里没有缩略图信息，传空字符串
            );
          }
          break;

        case "restartExtension":
          // 处理重启扩展的请求
          await vscode.commands.executeCommand("zhihu-fisher.restartExtension");
          break;

        case "configureBrowser":
          // 处理配置浏览器的请求
          await vscode.commands.executeCommand("zhihu-fisher.configureBrowser");
          break;

        case "showTroubleshootingGuide":
          // 处理故障排除指引的请求
          await vscode.commands.executeCommand(
            "zhihu-fisher.showTroubleshootingGuide"
          );
          break;

        case "restartVSCode":
          // 处理重启VSCode的请求
          await vscode.commands.executeCommand("workbench.action.reloadWindow");
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

        case "setMiniMediaScale":
          await this.setMiniMediaScale(message.scale);
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
          break;

        case "loadArticleComments":
          await CommentsManager.loadArticleComments(
            webviewId,
            message.articleId,
            message.direction
          );
          break;

        case "showNotification":
          // 显示通知消息
          vscode.window.showInformationMessage(message.message);
          break;

        case "favoriteContent":
          // 处理收藏内容请求
          await this.handleFavoriteContent(
            message.contentToken,
            message.contentType
          );
          break;

        case "toggleDisguise":
          // 处理智能伪装开关切换
          await this.handleToggleDisguise(message.enabled);
          break;
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

            // 清理伪装缓存
            DisguiseManager.clearDisguiseCache(webviewId);

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

  /** 关闭全部webview */
  public static async closeAllWebviews(): Promise<void> {
    for (const webviewId of Store.webviewMap.keys()) {
      const webviewItem = Store.webviewMap.get(webviewId);
      if (webviewItem) {
        webviewItem.webviewPanel.dispose(); // 关闭WebView面板
        await PuppeteerManager.closePage(webviewId); // 关闭对应的浏览器页面
      }
    }
    Store.webviewMap.clear(); // 清空所有WebView项

    // 清理所有伪装缓存
    DisguiseManager.clearAllDisguiseCache();
  }

  /**
   * 处理收藏内容请求
   */
  private static async handleFavoriteContent(
    contentToken: string,
    contentType: "article" | "answer"
  ): Promise<void> {
    try {
      if (!contentToken) {
        vscode.window.showErrorMessage("无法获取内容标识，不能收藏");
        return;
      }

      // 使用工具类中的收藏夹选择器
      const selectedCollectionId =
        await CollectionPickerUtils.showCollectionPicker(
          contentToken,
          contentType
        );

      if (!selectedCollectionId) {
        // 用户取消了选择
        return;
      }

      vscode.window.showInformationMessage("正在收藏...");

      // 调用收藏API
      const success = await ZhihuApiService.addToCollection(
        selectedCollectionId,
        contentToken,
        contentType
      );

      if (success) {
        vscode.window.showInformationMessage(
          `成功收藏${contentType === "article" ? "文章" : "回答"}！`
        );
      } else {
        vscode.window.showErrorMessage(
          `收藏${
            contentType === "article" ? "文章" : "回答"
          }失败，可能是该收藏夹已有相同内容，换个收藏夹试试~`
        );
      }
    } catch (error) {
      console.error("收藏内容时出错:", error);
      vscode.window.showErrorMessage(
        `收藏失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 处理智能伪装开关切换
   * @param enabled 是否启用智能伪装
   */
  private static async handleToggleDisguise(enabled: boolean): Promise<void> {
    try {
      const config = vscode.workspace.getConfiguration('zhihu-fisher');
      await config.update('enableDisguise', enabled, vscode.ConfigurationTarget.Global);
      
      vscode.window.showInformationMessage(
        `智能伪装功能已${enabled ? '启用' : '禁用'}`
      );
    } catch (error) {
      console.error("切换智能伪装功能时出错:", error);
      vscode.window.showErrorMessage(
        `设置失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
