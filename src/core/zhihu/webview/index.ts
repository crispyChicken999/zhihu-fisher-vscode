import { marked } from "marked";
import * as vscode from "vscode";
import { Store } from "../../stores";
import { HtmlRenderer } from "./html";
import * as Puppeteer from "puppeteer";
import { CookieManager } from "../cookie";
import { ZhihuApiService } from "../api/index";
import { PuppeteerManager } from "../puppeteer";
import { CommentsManager } from "./components/comments";
import { DisguiseManager } from "../../utils/disguise-manager";
import { LinkItem, WebViewItem, AnswerItem } from "../../types";
import { ContentProcessor } from "./components/content-processor";
import { WebViewUtils, CollectionPickerUtils } from "../../utils";
import { RelatedQuestionsManager } from "./components/related-questions";
import { SidebarDisguiseManager } from "../../utils/sidebar-disguise-manager";

export class WebviewManager {
  /** 在vscode编辑器中打开页面（新建一个窗口） */
  static async openWebview(
    item: LinkItem,
    sourceType:
      | "collection"
      | "recommend"
      | "hot"
      | "search"
      | "inner-link" = "recommend",
    collectionId?: string
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

    // 生成唯一的webview ID（包含排序类型信息）
    const webviewId = WebViewUtils.generateUniqueWebViewId(
      baseId,
      sourceType,
      contentType,
      answerId,
      collectionId,
      item.sortType // 传递排序类型
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

    // 创建并配置WebView面板
    const panel = vscode.window.createWebviewPanel(
      "zhihu-fisher-content-viewer", // 使用固定的panel类型，避免localstorage失效
      shortTitle,
      vscode.ViewColumn.Active, // 修改为在当前编辑组显示
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(Store.context!.extensionUri, "resources"),
        ],
      }
    );

    panel.iconPath = vscode.Uri.joinPath(
      Store.context!.extensionUri,
      "resources",
      "icon.svg"
    );

    // 当面板失去焦点的时候，使用智能伪装系统
    panel.onDidChangeViewState((e) => {
      // 获取伪装配置
      const config = vscode.workspace.getConfiguration("zhihu-fisher");
      const enableDisguise = config.get<boolean>("enableDisguise", false);
      const enableSideBarDisguise = config.get<boolean>(
        "sidebarDisguiseEnabled",
        false
      );

      if (e.webviewPanel.active) {
        // 激活时恢复原始标题和图标
        const currentWebviewItem = Store.webviewMap.get(webviewId);
        const currentTitle = currentWebviewItem
          ? this.getShortTitle(currentWebviewItem.article.title)
          : shortTitle;
        panel.title = currentTitle;
        panel.iconPath = vscode.Uri.joinPath(
          Store.context!.extensionUri,
          "resources",
          "icon.svg"
        );

        DisguiseManager.hideDisguiseInterface(panel);
      } else {
        // 失去焦点时使用智能伪装（支持配置开关）
        const currentWebviewItem = Store.webviewMap.get(webviewId);
        const currentTitle = currentWebviewItem
          ? this.getShortTitle(currentWebviewItem.article.title)
          : shortTitle;
        const disguise = DisguiseManager.getDisguiseOrDefault(
          webviewId,
          currentTitle
        );
        panel.title = disguise.title;
        panel.iconPath = disguise.iconPath;

        // 如果启用了伪装功能，显示伪装界面
        if (enableDisguise) {
          DisguiseManager.showDisguiseInterface(panel);

          if (enableSideBarDisguise) {
            // 同时触发侧边栏伪装 if 开启了的话
            const sidebarManager = SidebarDisguiseManager.getInstance();
            sidebarManager.onWebViewDisguised().catch((error) => {
              console.error("触发侧边栏联动伪装失败:", error);
            });
          } else {
            console.log("侧边栏伪装功能未启用，未联动侧边栏");
          }
        }
      }

      // 触发侧边栏伪装状态评估
      console.log("WebView状态变化，已触发相关处理");
    });

    // 获取配置中的每批回答数量
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const limitPerBatch = config.get<number>("answersPerBatch", 10);

    const webviewItem: WebViewItem = {
      id: webviewId, // 使用生成的唯一ID
      url: targetUrl, // 使用处理后的目标URL
      webviewPanel: panel,
      sourceType: sourceType, // 保存来源类型
      originalItem: item, // 保存原始链接项数据
      collectionId: collectionId, // 保存收藏夹ID（仅当sourceType为collection时有效）
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

    // 触发侧边栏伪装（WebView创建时）
    try {
      const sidebarManager = SidebarDisguiseManager.getInstance();
      await sidebarManager.onWebViewCreated();
    } catch (error) {
      console.error("触发侧边栏伪装失败:", error);
    }

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

  /**
   * 更新导航信息
   * 通过 postMessage 部分更新DOM，不用 updateWebview 全刷，体验更好
   */
  private static updateNavInfoViaMessage(
    webviewId: string,
    isLoading: boolean = false
  ): void {
    const webviewItem = Store.webviewMap.get(webviewId);
    if (!webviewItem) {
      return;
    }

    // 发送消息更新导航信息
    webviewItem.webviewPanel.webview.postMessage({
      command: "updateNavInfo",
      loadedCount: webviewItem.article.loadedAnswerCount,
      totalCount: webviewItem.article.totalAnswerCount,
      isLoading: isLoading,
    });
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
            webviewId,
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
                signature: preloadedAnswer.authorHeadline || "",
                avatar: preloadedAnswer.authorAvatar,
                followersCount: preloadedAnswer.authorFollowerCount || 0,
              },
              likeCount: preloadedAnswer.voteCount || 0,
              commentCount: preloadedAnswer.commentCount || 0,
              voteStatus: preloadedAnswer.voteStatus || "neutral", // 添加投票状态
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
            webviewItem.article.totalAnswerCount = 1;

            // 更新WebView显示特定回答
            this.updateWebview(webviewId);

            webviewItem.isLoaded = true; // 关键步骤，标记为已加载
            console.log(`成功预加载特定回答: ${preloadedAnswer.id}`);
          } else {
            // 如果没有获取到内容，显示错误页面
            console.error("特定回答内容为空");

            // 隐藏状态栏加载提示
            this.hideStatusBarItem(webviewId);

            // 显示错误页面
            const errorTitle = "特定回答不存在";
            const errorDescription = "无法找到指定的回答内容";
            const errorReasons = [
              "该回答可能已被作者删除",
              "该回答可能已被知乎管理员删除",
              "回答URL可能不正确",
              "该回答可能仅对部分用户可见",
              "网络问题导致无法获取内容",
            ];

            webviewItem.webviewPanel.webview.html = HtmlRenderer.getErrorHtml(
              errorTitle,
              errorDescription,
              webviewItem.article.specificAnswerUrl || webviewItem.url,
              errorReasons
            );

            webviewItem.isLoading = false;
            webviewItem.isLoaded = true;
            return;
          }
        } catch (error) {
          console.error("预加载特定回答失败:", error);

          // 隐藏状态栏加载提示
          this.hideStatusBarItem(webviewId);

          // 显示错误页面
          const errorTitle = "特定回答加载失败";
          const errorDescription = "无法获取指定的回答内容";
          const errorReasons = [
            "该回答可能已被删除或隐藏",
            "回答URL格式不正确",
            "网络连接问题导致内容加载失败",
            "知乎反爬机制阻止了内容获取",
            "Cookie可能已过期，需要重新登录",
          ];

          webviewItem.webviewPanel.webview.html = HtmlRenderer.getErrorHtml(
            errorTitle,
            errorDescription,
            webviewItem.article.specificAnswerUrl || webviewItem.url,
            errorReasons
          );

          webviewItem.isLoading = false;
          return;
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

      // 处理问题详情内容（检查并点击"显示全部"按钮）
      try {
        console.log("开始处理问题详情...");
        await this.parseQuestionDetail(webviewId, page);
      } catch (error) {
        console.error("解析问题详情失败:", error);
      }

      // 检测是否支持时间排序（检查排序选项按钮数量）
      const supportTimeSort = await page.evaluate(async () => {
        // 先尝试点击排序按钮展开菜单
        const toggleButton = document.querySelector(
          "button.Select-button"
        ) as HTMLButtonElement;
        if (toggleButton) {
          toggleButton.click();
          // 等待一下让菜单显示出来，其实不等也可以，不过还是等一下哈哈
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        const sortButtons = document.querySelectorAll(
          ".Select-list.Answers-select .Select-option"
        );
        // 如果有2个或更多排序选项，说明支持时间排序
        return sortButtons.length >= 2;
      });
      webviewItem.article.supportTimeSort = supportTimeSort;
      console.log(`该问题是否支持时间排序: ${supportTimeSort}`);

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

      // 解析页面中的全部回答
      await this.parseAllAnswers(webviewId, page);

      // 检查是否爬取到了任何回答
      const webviewItemAfterParsing = Store.webviewMap.get(webviewId);
      if (
        webviewItemAfterParsing &&
        webviewItemAfterParsing.article.answerList.length === 0
      ) {
        console.log("未爬取到任何回答，显示错误页面");

        // 隐藏状态栏加载提示
        this.hideStatusBarItem(webviewId);

        // 显示错误页面
        const errorTitle = "未找到任何回答";
        const errorDescription = "该问题下没有可显示的回答内容";
        const errorReasons = [
          "该问题可能已被知乎删除或隐藏",
          "该问题可能没有任何回答",
          "网络连接问题导致内容加载失败",
          "知乎反爬机制阻止了内容获取",
          "Cookie可能已过期，需要重新登录",
        ];

        webviewItemAfterParsing.webviewPanel.webview.html =
          HtmlRenderer.getErrorHtml(
            errorTitle,
            errorDescription,
            webviewItemAfterParsing.url,
            errorReasons
          );

        webviewItemAfterParsing.isLoading = false;
        return;
      }

      // 解析相关问题
      try {
        console.log("开始解析相关问题...");
        await RelatedQuestionsManager.parseRelatedQuestions(webviewId, page);
      } catch (error) {
        console.error("解析相关问题失败:", error);
      }

      if (!webviewItem.isLoaded) {
        this.updateWebview(webviewId); // 更新WebView内容
        webviewItem.isLoaded = true;
      } else {
        this.updateNavInfoViaMessage(webviewId, true); // 通过消息更新导航信息
      }

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

      console.error("加载文章内容时出错:", error);
      throw new Error("加载文章内容时出错:" + error);
    } finally {
      // 隐藏状态栏加载提示
      this.hideStatusBarItem(webviewId);
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
      // 对于inner-link类型，首先提取页面真实标题
      if (webviewItem.sourceType === "inner-link") {
        try {
          const realTitle = await page.evaluate(() => {
            // 专栏文章标题
            const articleTitleElement = document.querySelector("h1.Post-Title");
            if (articleTitleElement) {
              return articleTitleElement.textContent?.trim() || "";
            }
            return "";
          });

          if (realTitle && realTitle !== webviewItem.article.title) {
            console.log(
              `更新专栏文章标题: ${webviewItem.article.title} -> ${realTitle}`
            );
            webviewItem.article.title = realTitle;
            webviewItem.webviewPanel.title = this.getShortTitle(realTitle);
            this.updateWebview(webviewId); // 更新WebView内容
          }
        } catch (error) {
          console.error("提取专栏文章标题失败:", error);
        }
      }

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

        // 作者名称
        const authorName = authorElement
          ? authorElement.textContent?.trim() || "未知作者"
          : "未知作者";

        // 作者主页链接
        const authorUrl = authorElement
          ? (authorElement as HTMLAnchorElement).href
          : "";

        // 作者头像
        const authorAvatar = document.querySelector(".AuthorInfo-avatar");
        const authorAvatarUrl = authorAvatar
          ? (authorAvatar as HTMLImageElement).src
          : "";

        // 作者签名（简介）
        const authorSignature = document.querySelector(".AuthorInfo-badgeText");
        const authorHeadline = authorSignature
          ? authorSignature.textContent?.trim() || ""
          : "";

        // 检测是否已关注该作者（解析关注按钮）
        let isFollowing = false;
        const followButton = document.querySelector(
          ".AuthorInfo button.FollowButton"
        );
        if (followButton) {
          // 如果按钮文字包含"已关注"，说明已经关注了
          const buttonText = followButton.textContent?.trim() || "";
          isFollowing = buttonText.includes("已关注");
          console.log(
            `作者的关注状态: ${
              isFollowing ? "已关注" : "未关注"
            } (按钮文字: "${buttonText}")`
          );
        }

        // 作者粉丝数 .NumberBoard-item[data-za-detail-view-element_name='Follower'] .NumberBoard-itemValue
        const authorFollowerElement = document.querySelector(
          ".NumberBoard-item[data-za-detail-view-element_name='Follower'] .NumberBoard-itemValue"
        );
        let authorFollowerCount = 0;
        if (authorFollowerElement) {
          const followerText =
            authorFollowerElement.getAttribute("title") || "0";
          authorFollowerCount = parseInt(followerText) || 0;
        }

        // 获取发布时间
        const timeElement = document.querySelector(".ContentItem-time");
        const publishTime = timeElement
          ? timeElement.textContent?.trim() || ""
          : "";

        // 获取点赞数
        const likeElement = document.querySelector(".VoteButton");
        const likeText = likeElement
          ? likeElement.getAttribute("aria-label") || "0"
          : "0";
        const likeCount = parseInt(likeText.replace(/[^\d]/g, "") || "0", 10);

        // 获取投票状态
        let voteStatus: 1 | -1 | 0 = 0; // 默认为中立

        // 先检查所有投票相关的按钮
        const allVoteButtons = document.querySelectorAll(
          "[class*='VoteButton']"
        );
        console.log(`文章找到 ${allVoteButtons.length} 个投票按钮`);

        // 更精确地查找赞同按钮：VoteButton + is-active，但不包含 VoteButton--down
        const upVoteButton = document.querySelector(
          ".VoteButton.is-active:not(.VoteButton--down)"
        );
        // 查找不赞同按钮：VoteButton--down + is-active
        const downVoteButton = document.querySelector(
          ".VoteButton--down.is-active"
        );

        // 输出调试信息
        if (allVoteButtons.length > 0) {
          allVoteButtons.forEach((btn, index) => {
            console.log(`文章按钮${index}: class="${btn.className}"`);
          });
        }

        if (upVoteButton) {
          voteStatus = 1; // 已赞同
          console.log("文章检测到赞同状态");
        } else if (downVoteButton) {
          voteStatus = -1; // 已不赞同
          console.log("文章检测到不赞同状态");
        } else {
          console.log("文章检测到中立状态");
        }

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
            url: authorUrl,
            name: authorName,
            avatar: authorAvatarUrl,
            signature: authorHeadline,
            authorFollowerCount,
            isFollowing, // 添加关注状态
          },
          publishTime,
          likeCount,
          commentCount,
          voteStatus,
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
          avatar: articleData.author.avatar,
          signature: articleData.author.signature,
          followersCount: articleData.author.authorFollowerCount,
          isFollowing: articleData.author.isFollowing, // 添加关注状态
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

      // 保存文章的投票状态
      webviewItem.article.voteStatus = articleData.voteStatus;
      webviewItem.article.likeCount = articleData.likeCount;

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

  /** 加载上一篇文章/问题 */
  public static async loadPreviousArticle(webviewId: string): Promise<void> {
    const webviewItem = Store.webviewMap.get(webviewId);
    if (!webviewItem) {
      return;
    }

    try {
      // 中断当前正在进行的加载操作
      if (webviewItem.batchConfig.isLoadingBatch || webviewItem.isLoading) {
        webviewItem.batchConfig.isLoadingBatch = false;
        webviewItem.isLoading = false;
        console.log("中断当前加载操作，准备切换上一篇");
      }

      const sourceType = webviewItem.sourceType;
      const originalItem = webviewItem.originalItem;
      const collectionId = webviewItem.collectionId;

      // 根据来源类型获取对应的列表
      const list = this.getListBySourceType(sourceType, collectionId);
      if (!list) {
        vscode.window.showErrorMessage(
          "未找到对应的列表数据，列表可能已经刷新了"
        );
        return;
      }

      // 查找当前项在列表中的位置
      const currentIndex = this.findItemIndexInList(originalItem, list);
      if (currentIndex === -1) {
        vscode.window.showErrorMessage("未找到上一篇内容，列表可能已经刷新了");
        return;
      }

      // 检查是否已是第一篇
      if (currentIndex === 0) {
        vscode.window.showInformationMessage("已经是第一篇了");
        return;
      }

      // 获取上一篇内容
      const previousItem = list[currentIndex - 1];

      // 创建新的webview显示上一篇内容
      await this.openWebview(previousItem, sourceType, collectionId);
    } catch (error) {
      console.error("切换上一篇文章时出错:", error);
      vscode.window.showErrorMessage("切换上一篇文章时出错:" + error);
    }
  }

  /** 加载下一篇文章/问题 */
  public static async loadNextArticle(webviewId: string): Promise<void> {
    const webviewItem = Store.webviewMap.get(webviewId);
    if (!webviewItem) {
      return;
    }

    try {
      // 中断当前正在进行的加载操作
      if (webviewItem.batchConfig.isLoadingBatch || webviewItem.isLoading) {
        webviewItem.batchConfig.isLoadingBatch = false;
        webviewItem.isLoading = false;
        console.log("中断当前加载操作，准备切换下一篇");
      }

      const sourceType = webviewItem.sourceType;
      const originalItem = webviewItem.originalItem;
      const collectionId = webviewItem.collectionId;

      // 根据来源类型获取对应的列表
      const list = this.getListBySourceType(sourceType, collectionId);
      if (!list) {
        vscode.window.showErrorMessage(
          "未找到对应的列表数据，列表可能已经刷新了"
        );
        return;
      }

      // 查找当前项在列表中的位置
      const currentIndex = this.findItemIndexInList(originalItem, list);
      if (currentIndex === -1) {
        vscode.window.showErrorMessage("未找到下一篇内容，列表可能已经刷新了");
        return;
      }

      // 检查是否已是最后一篇
      if (currentIndex === list.length - 1) {
        vscode.window.showInformationMessage("已经是最后一篇了");
        return;
      }

      // 获取下一篇内容
      const nextItem = list[currentIndex + 1];

      // 创建新的webview显示下一篇内容
      await this.openWebview(nextItem, sourceType, collectionId);
    } catch (error) {
      console.error("切换下一篇文章时出错:", error);
      vscode.window.showErrorMessage("切换下一篇文章时出错:" + error);
    }
  }

  /** 根据来源类型获取对应的列表 */
  private static getListBySourceType(
    sourceType: "collection" | "recommend" | "hot" | "search" | "inner-link",
    collectionId?: string
  ): LinkItem[] | null {
    switch (sourceType) {
      case "hot":
        return Store.Zhihu.hot.list;
      case "recommend":
        return Store.Zhihu.recommend.list;
      case "search":
        return Store.Zhihu.search.list;
      case "collection":
        // 收藏夹的处理比较复杂，需要特殊处理
        return this.getCollectionItemsList(collectionId);
      default:
        return null;
    }
  }

  /** 获取所有收藏夹的内容列表（转换为LinkItem格式） */
  private static getCollectionItemsList(collectionId?: string): LinkItem[] {
    const allCollections = [
      ...Store.Zhihu.collections.myCollections,
      ...Store.Zhihu.collections.followingCollections,
    ];

    const linkItems: LinkItem[] = [];

    // 如果指定了收藏夹ID，只处理该收藏夹
    const targetCollections = collectionId
      ? allCollections.filter((collection) => collection.id === collectionId)
      : allCollections;

    for (const collection of targetCollections) {
      for (const item of collection.items) {
        // 将CollectionItem转换为LinkItem格式
        let linkItemId = item.id;
        let linkItemType: "question" | "article" = item.type as
          | "question"
          | "article";

        // 对于回答类型，需要特殊处理ID和类型
        if (item.type === "answer") {
          // 回答类型：从URL中提取回答ID作为真实ID
          const answerIdMatch = item.url.match(/\/answer\/(\d+)/);
          if (answerIdMatch) {
            linkItemId = answerIdMatch[1]; // 使用回答的真实ID
          }
          linkItemType = "question"; // 转换为question类型，因为界面上需要这样显示
        }

        const linkItem: LinkItem = {
          id: linkItemId,
          url: item.url,
          title: item.title,
          excerpt: item.excerpt,
          type: linkItemType,
          imgUrl: item.thumbnail,
          // 对于回答类型，保存answerUrl以便匹配
          answerUrl: item.type === "answer" ? item.url : undefined,
        };
        linkItems.push(linkItem);
      }
    }

    return linkItems;
  }

  /** 在列表中查找指定项的索引 */
  private static findItemIndexInList(
    targetItem: LinkItem,
    list: LinkItem[]
  ): number {
    return list.findIndex((item) => {
      // 如果有answerUrl，说明这是一个回答类型的内容
      if (targetItem.answerUrl && item.answerUrl) {
        // 对于回答类型，比较answerUrl是否相同
        return targetItem.answerUrl === item.answerUrl;
      }

      // 对于其他类型，比较ID和URL
      return item.id === targetItem.id && item.url === targetItem.url;
    });
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
      this.updateNavInfoViaMessage(webviewId, true); // 通过消息更新导航信息

      console.log("开始解析回答列表...");

      // 对于inner-link类型，首先提取页面真实标题
      if (webviewItem.sourceType === "inner-link") {
        try {
          const realTitle = await page.evaluate(() => {
            const questionTitleElement = document.querySelector(
              ".QuestionHeader-title"
            );
            if (questionTitleElement) {
              return questionTitleElement.textContent?.trim() || "";
            }
            return "";
          });

          if (realTitle && realTitle !== webviewItem.article.title) {
            console.log(
              `更新页面标题: ${webviewItem.article.title} -> ${realTitle}`
            );
            webviewItem.article.title = realTitle;
            webviewItem.webviewPanel.title = this.getShortTitle(realTitle);
            this.updateWebview(webviewId); // 更新WebView内容
          }
        } catch (error) {
          console.error("提取页面标题失败:", error);
        }
      }

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

            // 跳过无效的回答元素，例如占位符，或者回答元素不存在
            if (!answerElement || element.classList.contains("PlaceHolder")) {
              return;
            }

            // 获取问题ID https://www.zhihu.com/question/1971269237239691012/answers/updated || https://www.zhihu.com/question/1971269237239691012
            const questionId = location.href.replace('/answers/updated', '').split('/')[4];

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

            // 检测是否已关注该作者（解析关注按钮）
            let isFollowing = false;
            const followButton = authorElement?.querySelector(
              "button.FollowButton"
            );
            if (followButton) {
              // 如果按钮文字包含"已关注"，说明已经关注了
              const buttonText = followButton.textContent?.trim() || "";
              isFollowing = buttonText.includes("已关注");
              console.log(
                `作者 ${authorName} 的关注状态: ${
                  isFollowing ? "已关注" : "未关注"
                } (按钮文字: "${buttonText}")`
              );
            }

            // 获取回答点赞数 answerElement <meta itemprop="upvoteCount" content="648">
            const likeCount = element
              .querySelector("meta[itemprop='upvoteCount']")
              ?.getAttribute("content");

            // 获取回答评论数 <meta itemprop="commentCount" content="11">
            const commentCount = element
              .querySelector("meta[itemprop='commentCount']")
              ?.getAttribute("content");

            // 获取回答发布时间
            // 优先从 ContentItem-time 元素中提取完整时间(包括时和分)
            // <div class="ContentItem-time"><a target="_blank" data-tooltip="发布于 2025-11-09 09:04" ...>发布于 2025-11-09 09:04</a></div>
            let publishTimeStr = "";
            const timeElement = element.querySelector(".ContentItem-time a");
            if (timeElement) {
              const tooltip =
                timeElement.getAttribute("data-tooltip") ||
                timeElement.textContent;
              if (tooltip) {
                // 从 "发布于 2025-11-09 09:04" 提取时间部分
                const match = tooltip.match(
                  /(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})/
                );
                publishTimeStr = match ? match[1] : "";
              }
            }

            // 如果没有找到,则使用meta标签
            if (!publishTimeStr) {
              // <meta itemprop="dateCreated" content="2024-06-21T03:27:48.000Z">
              const publishTime = element
                .querySelector("meta[itemprop='dateCreated']")
                ?.getAttribute("content");
              publishTimeStr = publishTime
                ? new Date(publishTime).toLocaleString("zh-CN", {
                    timeZone: "Asia/Shanghai",
                  })
                : "";
            }

            // 获取回答更新时间 <meta itemprop="dateModified" content="2024-06-21T03:27:48.000Z">
            const updateTime = element
              .querySelector("meta[itemprop='dateModified']")
              ?.getAttribute("content");

            // 获取回答内容 answerElement 里面的.RichContent 的 <div class="RichContent-inner">...</div>
            const contentElement = element.querySelector(
              ".RichContent .RichContent-inner"
            );

            // .KfeCollection-AnswerTopCard-Container 这个是盐选的标识，如果发现了则加到答案内容里
            const isPaidAnswer =
              document.querySelector(
                ".KfeCollection-AnswerTopCard-Container"
              ) !== null;

            // 获取内容的HTML字符串
            const contentHtml = isPaidAnswer
              ? '<span class="zhihu-fisher-content-is-paid-needed"></span>' +
                contentElement?.innerHTML
              : contentElement?.innerHTML || "";

            // 检测用户的投票状态
            let voteStatus: "up" | "down" | "neutral" = "neutral";

            // 查找投票按钮区域，更精确的选择器
            const contentItemActions = element.querySelector(
              ".ContentItem-actions"
            );
            if (contentItemActions) {
              // 先检查所有投票相关的按钮
              const allVoteButtons = contentItemActions.querySelectorAll(
                "[class*='VoteButton']"
              );
              console.log(
                `回答 ${answerId} 找到 ${allVoteButtons.length} 个投票按钮`
              );

              // 更精确地查找赞同按钮：VoteButton + is-active，但不包含 VoteButton--down
              const upVoteButton = contentItemActions.querySelector(
                ".VoteButton.is-active:not(.VoteButton--down)"
              );
              // 查找不赞同按钮：VoteButton--down + is-active
              const downVoteButton = contentItemActions.querySelector(
                ".VoteButton--down.is-active"
              );

              // 输出调试信息
              if (allVoteButtons.length > 0) {
                allVoteButtons.forEach((btn, index) => {
                  console.log(`按钮${index}: class="${btn.className}"`);
                });
              }

              if (upVoteButton) {
                voteStatus = "up";
                console.log(`回答 ${answerId} 检测到赞同状态`);
              } else if (downVoteButton) {
                voteStatus = "down";
                console.log(`回答 ${answerId} 检测到不赞同状态`);
              } else {
                console.log(`回答 ${answerId} 检测到中立状态`);
              }
            } else {
              console.log(`回答 ${answerId} 未找到投票按钮区域`);
            }

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
                isFollowing: isFollowing, // 添加关注状态
              },
              likeCount: parseInt(likeCount || "0", 10) || 0,
              commentCount: parseInt(commentCount || "0", 10) || 0,
              voteStatus: voteStatus, // 添加投票状态
              publishTime: publishTimeStr,
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

      if (webviewItem.article.relatedQuestions?.length === 0) {
        RelatedQuestionsManager.parseRelatedQuestions(webviewId, page); // 解析相关推荐
      }

      // this.updateWebview(webviewId); // 更新WebView内容
      this.updateNavInfoViaMessage(webviewId, false); // 发送导航信息更新（加载完成）
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

    // 发送加载中状态
    this.updateNavInfoViaMessage(webviewId, true);

    if (webviewItem.article.loadComplete) {
      console.log("全部回答已加载完成，停止加载更多。");
      webviewItem.article.isLoading = false; // 设置为加载完成
      webviewItem.batchConfig.isLoadingBatch = false; // 设置为批次加载完成
      this.updateNavInfoViaMessage(webviewId, false); // 发送加载完成状态
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
        this.updateNavInfoViaMessage(webviewId, false); // 发送加载完成状态
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

      // 解析后发送导航信息更新（仍在加载中）
      this.updateNavInfoViaMessage(webviewId, true);

      const beforeLoadCount = webviewItemUpdated.batchConfig.beforeLoadCount; // 加载前的回答数量
      const afterLoadCount = webviewItemUpdated.batchConfig.afterLoadCount; // 加载后的回答数量
      const limitPerBatch = webviewItemUpdated.batchConfig.limitPerBatch; // 每批加载的回答数量

      // 如果加载的回答数量超过了配置的每批数量，则停止加载更多
      if (afterLoadCount - beforeLoadCount >= limitPerBatch) {
        console.log(
          `加载了 ${
            afterLoadCount - beforeLoadCount
          } 个新回答，达到每批 ${limitPerBatch} 个回答的限制， 总共已加载${
            webviewItemUpdated.article.loadedAnswerCount
          }，停止加载更多`
        );
        webviewItemUpdated.batchConfig.isLoadingBatch = false; // 设置为批次加载完成

        // 更新WebView前再次检查页面是否存在
        if (Store.webviewMap.has(webviewId)) {
          this.updateNavInfoViaMessage(webviewId, false); // 发送加载完成状态
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
        this.updateNavInfoViaMessage(webviewId, false); // 发送加载完成状态
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
  private static async toggleMedia(_webviewId: string): Promise<void> {
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

        case "reloadPage":
          // 处理错误页面的重新加载请求
          const webviewItemForReload = Store.webviewMap.get(webviewId);
          if (webviewItemForReload) {
            webviewItemForReload.webviewPanel.webview.html =
              HtmlRenderer.getLoadingHtml(
                webviewItemForReload.article.title,
                webviewItemForReload.article.excerpt || "重新加载中...",
                ""
              );
            // 重新爬取数据
            await this.crawlingURLData(webviewId);
          }
          break;

        case "setCookie":
          // 处理错误页面的设置Cookie请求
          await vscode.commands.executeCommand("zhihu-fisher.setCookie");
          const webviewItemForCookie = Store.webviewMap.get(webviewId);
          if (webviewItemForCookie) {
            webviewItemForCookie.webviewPanel.webview.html =
              HtmlRenderer.getLoadingHtml(
                webviewItemForCookie.article.title,
                webviewItemForCookie.article.excerpt || "正在重新加载...",
                ""
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

        case "loadPreviousArticle":
          await this.loadPreviousArticle(webviewId);
          break;

        case "loadNextArticle":
          await this.loadNextArticle(webviewId);
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

        case "toggleSidebarDisguise":
          // 处理侧边栏伪装开关切换
          await this.handleToggleSidebarDisguise(message.enabled);
          break;

        case "syncSidebarDisguise":
          // 处理侧边栏伪装实时同步
          await this.handleSyncSidebarDisguise(message.enabled);
          break;

        case "manualDisguiseToggle":
          // 处理手动代码伪装切换
          await this.handleManualDisguiseToggle(webviewId, message.action);
          break;

        case "updateSelectedDisguiseTypes":
          // 处理更新选择的伪装类型
          await this.handleUpdateSelectedDisguiseTypes(message.selectedTypes);
          break;

        case "previewDisguise":
          // 处理预览伪装效果
          await this.handlePreviewDisguise(webviewId, message.selectedTypes);
          break;

        case "voteContent":
          // 处理投票请求
          await this.handleVoteContent(
            webviewId,
            message.contentId,
            message.voteValue,
            message.contentType
          );
          break;

        case "likeComment":
          // 处理评论点赞请求
          await this.handleLikeComment(
            webviewId,
            message.commentId,
            message.isLike
          );
          break;

        case "openZhihuLink":
          // 处理在VSCode中打开知乎链接的请求
          await this.handleOpenZhihuLink(message.url);
          break;

        case "switchAnswerSort":
          // 处理回答排序切换请求
          await this.handleSwitchAnswerSort(
            webviewId,
            message.url,
            message.sortType
          );
          break;

        case "followAuthor":
          // 处理关注作者请求
          await this.handleFollowAuthor(webviewId, message.authorId);
          break;

        case "unfollowAuthor":
          // 处理取消关注作者请求
          await this.handleUnfollowAuthor(webviewId, message.authorId);
          break;

        case "getExportStats":
          // 处理获取导出统计信息请求
          await this.handleGetExportStats(webviewId);
          break;

        case "exportMarkdown":
          // 处理导出Markdown请求
          await this.handleExportMarkdown(webviewId);
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

            // 检查是否需要恢复侧边栏（延迟执行，确保Store更新完成）
            setTimeout(async () => {
              try {
                const sidebarManager = SidebarDisguiseManager.getInstance();
                await sidebarManager.onWebViewClosed();
              } catch (error) {
                console.error("侧边栏恢复检查失败:", error);
              }
            }, 100);
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

  /** 处理收藏内容请求 */
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
      const config = vscode.workspace.getConfiguration("zhihu-fisher");
      await config.update(
        "enableDisguise",
        enabled,
        vscode.ConfigurationTarget.Global
      );

      vscode.window.showInformationMessage(
        `智能伪装功能已${enabled ? "启用" : "禁用"}`
      );
    } catch (error) {
      console.error("切换智能伪装功能时出错:", error);
      vscode.window.showErrorMessage(
        `设置失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 处理侧边栏伪装开关切换
   * @param enabled 是否启用侧边栏伪装
   */
  private static async handleToggleSidebarDisguise(
    enabled: boolean
  ): Promise<void> {
    try {
      const config = vscode.workspace.getConfiguration("zhihu-fisher");
      await config.update(
        "sidebarDisguiseEnabled",
        enabled,
        vscode.ConfigurationTarget.Global
      );

      vscode.window.showInformationMessage(
        `侧边栏伪装功能已${enabled ? "启用" : "禁用"}`
      );
    } catch (error) {
      console.error("切换侧边栏伪装功能时出错:", error);
      vscode.window.showErrorMessage(
        `设置失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 处理侧边栏伪装实时同步
   * @param enabled 是否启用侧边栏伪装
   */
  private static async handleSyncSidebarDisguise(
    enabled: boolean
  ): Promise<void> {
    try {
      // 直接同步到侧边栏，不保存配置
      const sidebarManager = SidebarDisguiseManager.getInstance();

      if (enabled) {
        await sidebarManager.showDisguiseViews();
      } else {
        await sidebarManager.showNormalViews();
      }

      console.log(`侧边栏伪装状态已同步: ${enabled ? "启用" : "禁用"}`);
    } catch (error) {
      console.error("同步侧边栏伪装状态时出错:", error);
    }
  }

  // 防抖标志：记录正在执行伪装切换的webview ID
  private static togglingDisguiseWebviews = new Set<string>();

  /**
   * 处理手动代码伪装切换（快捷键或工具栏按钮触发）
   * @param webviewId WebView ID
   * @param action 操作类型: 'show' 或 'hide'
   */
  private static async handleManualDisguiseToggle(
    webviewId: string,
    action: "show" | "hide"
  ): Promise<void> {
    const webviewItem = Store.webviewMap.get(webviewId);
    if (!webviewItem) {
      return;
    }

    // 防抖检查：如果该webview正在执行伪装切换，忽略新的请求
    if (this.togglingDisguiseWebviews.has(webviewId)) {
      console.log(`WebView ${webviewId} 正在执行伪装切换，忽略重复请求`);
      return;
    }

    // 标记为正在切换
    this.togglingDisguiseWebviews.add(webviewId);

    // 检查是否开启了智能伪装模式
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const enableDisguise = config.get<boolean>("enableDisguise", false);
    const enableSideBarDisguise = config.get<boolean>(
      "sidebarDisguiseEnabled",
      false
    );

    if (!enableDisguise) {
      // 未开启智能伪装，提示用户
      const result = await vscode.window.showInformationMessage(
        "代码伪装功能需要先开启智能伪装模式，是否现在开启？",
        "开启",
        "取消"
      );

      if (result === "开启") {
        // 开启智能伪装
        await config.update(
          "enableDisguise",
          true,
          vscode.ConfigurationTarget.Global
        );
        vscode.window.showInformationMessage("已开启智能伪装模式");
        // 继续执行伪装操作
      } else {
        // 用户取消，不执行伪装，解除防抖锁定
        this.togglingDisguiseWebviews.delete(webviewId);
        return;
      }
    }

    const panel = webviewItem.webviewPanel;
    const currentTitle = this.getShortTitle(webviewItem.article.title);

    if (action === "show") {
      // 显示伪装前，检查webview是否处于激活状态
      // 如果已经失焦，则不执行手动显示伪装（因为失焦时会自动触发智能伪装）
      if (!panel.active) {
        console.log(`WebView ${webviewId} 已失焦，取消手动显示伪装操作`);
        this.togglingDisguiseWebviews.delete(webviewId);
        return;
      }

      // 显示伪装 - 修改标题和图标
      const disguise = DisguiseManager.getDisguiseOrDefault(
        webviewId,
        currentTitle
      );
      panel.title = disguise.title;
      panel.iconPath = disguise.iconPath;

      // 显示伪装界面（这里会发送postMessage给前端）
      DisguiseManager.showDisguiseInterface(panel);

      if (enableSideBarDisguise) {
        // 同时触发侧边栏伪装
        try {
          const sidebarManager = SidebarDisguiseManager.getInstance();
          await sidebarManager.onWebViewDisguised();
        } catch (error) {
          console.error("触发侧边栏伪装失败:", error);
        }
      } else {
        console.log(
          `WebView ${webviewId} 手动显示伪装操作取消，侧边栏伪装未触发`
        );
      }
    } else {
      // 隐藏伪装前，检查webview是否处于激活状态
      // 如果已经失焦，则不执行手动隐藏伪装（因为失焦时会自动触发智能伪装）
      if (!panel.active) {
        console.log(`WebView ${webviewId} 已失焦，取消手动隐藏伪装操作`);
        this.togglingDisguiseWebviews.delete(webviewId);
        return;
      }

      // 隐藏伪装 - 恢复标题和图标
      panel.title = currentTitle;
      panel.iconPath = vscode.Uri.joinPath(
        Store.context!.extensionUri,
        "resources",
        "icon.svg"
      );

      // 隐藏伪装界面（这里会发送postMessage给前端）
      DisguiseManager.hideDisguiseInterface(panel);
    }

    // 动画完成后解除防抖锁定（总时长：1000ms欢迎消息 + 300ms动画）
    setTimeout(
      () => {
        this.togglingDisguiseWebviews.delete(webviewId);
      },
      action === "hide" ? 1300 : 300
    );
  }

  /** 处理投票请求 */
  private static async handleVoteContent(
    webviewId: string,
    contentId: string,
    voteValue: string | number,
    contentType: "answer" | "article"
  ): Promise<void> {
    const webviewItem = Store.webviewMap.get(webviewId);
    if (!webviewItem) {
      return;
    }

    try {
      if (contentType === "answer") {
        // 处理回答投票
        const voteType = voteValue as "up" | "down" | "neutral";

        // 找到对应的回答
        const currentAnswerIndex = webviewItem.article.currentAnswerIndex;
        const currentAnswer =
          webviewItem.article.answerList[currentAnswerIndex];

        if (!currentAnswer || currentAnswer.id !== contentId) {
          console.error("找不到对应的回答:", contentId);
          return;
        }

        // 设置投票状态
        currentAnswer.isVoting = true;
        this.updateWebview(webviewId);

        // 调用API
        const result = await ZhihuApiService.voteAnswer(contentId, voteType);

        // 更新回答状态
        if (result.success) {
          currentAnswer.voteStatus = voteType;
          currentAnswer.likeCount =
            result.voteup_count || result.up_count || currentAnswer.likeCount;

          vscode.window.showInformationMessage(
            `投票成功: ${
              voteType === "up"
                ? "赞同"
                : voteType === "down"
                ? "不赞同"
                : "中立"
            }`
          );
        } else {
          vscode.window.showErrorMessage("投票失败，请稍后重试");
        }
      } else if (contentType === "article") {
        // 处理文章投票
        const voting = voteValue as 1 | -1 | 0;

        // 设置投票状态
        webviewItem.article.isVoting = true;
        this.updateWebview(webviewId);

        // 调用API
        const result = await ZhihuApiService.voteArticle(contentId, voting);

        // 更新文章状态
        if (result.success) {
          webviewItem.article.voteStatus = voting;
          webviewItem.article.likeCount =
            result.voteup_count ||
            result.up_count ||
            webviewItem.article.likeCount;

          const voteText =
            voting === 1 ? "赞同" : voting === -1 ? "不赞同" : "中立";
          vscode.window.showInformationMessage(`投票成功: ${voteText}`);
        } else {
          vscode.window.showErrorMessage("投票失败，请稍后重试");
        }
      }
    } catch (error: any) {
      console.error("投票时出错:", error);

      // 检查是否是评论关闭的错误
      if (error.message?.includes("403")) {
        vscode.window.showErrorMessage("无法投票：可能需要登录或权限不足");
      } else {
        vscode.window.showErrorMessage("投票失败，请检查网络连接和Cookie设置");
      }
    } finally {
      // 重置投票状态
      if (contentType === "answer") {
        const currentAnswerIndex = webviewItem.article.currentAnswerIndex;
        const currentAnswer =
          webviewItem.article.answerList[currentAnswerIndex];
        if (currentAnswer) {
          currentAnswer.isVoting = false;
        }
      } else {
        webviewItem.article.isVoting = false;
      }

      // 更新界面
      this.updateWebview(webviewId);
    }
  }

  /**
   * 处理评论点赞
   * @param webviewId WebView的ID
   * @param commentId 评论ID
   * @param isLike 是否点赞（true=点赞，false=取消点赞）
   */
  private static async handleLikeComment(
    webviewId: string,
    commentId: string,
    isLike: boolean
  ): Promise<void> {
    const webviewItem = Store.webviewMap.get(webviewId);
    if (!webviewItem) {
      return;
    }

    try {
      console.log(`${isLike ? "点赞" : "取消点赞"}评论: ${commentId}`);

      // 调用API
      const result = await ZhihuApiService.likeComment(commentId, isLike);

      if (result.success || result) {
        // 更新评论的点赞状态
        this.updateCommentLikeStatus(webviewItem, commentId, isLike);

        // 发送成功消息到前端
        webviewItem.webviewPanel.webview.postMessage({
          command: "likeCommentSuccess",
          commentId: commentId,
          isLike: isLike,
        });

        console.log(`评论${isLike ? "点赞" : "取消点赞"}成功`);
      } else {
        throw new Error("点赞失败");
      }
    } catch (error: any) {
      console.error("评论点赞时出错:", error);

      // 发送失败消息到前端
      webviewItem.webviewPanel.webview.postMessage({
        command: "likeCommentFailed",
        commentId: commentId,
        isLike: isLike,
        error: error.message || "点赞失败",
      });

      // 显示错误提示
      if (error.message?.includes("403")) {
        vscode.window.showErrorMessage("无法点赞评论：可能需要登录或权限不足");
      } else {
        vscode.window.showErrorMessage(
          `评论点赞失败: ${error.message || "请检查网络连接和Cookie设置"}`
        );
      }
    }
  }

  /**
   * 更新评论的点赞状态
   * @param webviewItem WebView项
   * @param commentId 评论ID
   * @param isLike 是否点赞
   */
  private static updateCommentLikeStatus(
    webviewItem: WebViewItem,
    commentId: string,
    isLike: boolean
  ): void {
    const currentAnswerIndex = webviewItem.article.currentAnswerIndex;
    const currentAnswer = webviewItem.article.answerList[currentAnswerIndex];

    if (!currentAnswer || !currentAnswer.commentList) {
      return;
    }

    // 递归查找并更新评论
    const updateComment = (comments: any[]): boolean => {
      for (const comment of comments) {
        if (Number(comment.id) === Number(commentId)) {
          // 同时更新 liked 和 is_liked 字段
          comment.liked = isLike;
          comment.is_liked = isLike;
          // 更新点赞数
          comment.vote_count = (comment.vote_count || 0) + (isLike ? 1 : -1);
          if (comment.vote_count < 0) {
            comment.vote_count = 0;
          }
          return true;
        }

        // 检查子评论
        if (comment.child_comments && comment.child_comments.length > 0) {
          if (updateComment(comment.child_comments)) {
            return true;
          }
        }

        // 检查所有子评论
        if (
          comment.total_child_comments &&
          comment.total_child_comments.length > 0
        ) {
          if (updateComment(comment.total_child_comments)) {
            return true;
          }
        }
      }
      return false;
    };

    updateComment(currentAnswer.commentList);
  }

  /**
   * 处理回答排序切换
   * 优先切换到已存在的页面，如果不存在则在当前页面刷新
   */
  private static async handleSwitchAnswerSort(
    currentWebviewId: string,
    targetUrl: string,
    targetSortType: "default" | "updated"
  ): Promise<void> {
    try {
      console.log(
        `handleSwitchAnswerSort 调用: targetSortType=${targetSortType}, targetUrl=${targetUrl}`
      );

      const currentWebview = Store.webviewMap.get(currentWebviewId);
      if (!currentWebview) {
        console.error("当前WebView不存在");
        return;
      }

      const currentWebviewArticle = currentWebview.article;

      // 从URL创建LinkItem
      const linkItem = this.createLinkItemFromUrl(targetUrl);
      if (!linkItem) {
        vscode.window.showErrorMessage("无法解析知乎链接");
        return;
      }

      console.log(
        `linkItem创建成功: id=${linkItem.id}, sortType=${linkItem.sortType}`
      );

      // 生成目标排序方式的webviewId
      // 注意：这里使用传入的targetSortType参数，而不是linkItem中的sortType
      const sortTypeParam =
        targetSortType === "updated" ? "updated" : undefined;
      console.log(`生成目标webviewId参数: sortTypeParam=${sortTypeParam}`);

      const targetWebviewId = WebViewUtils.generateUniqueWebViewId(
        linkItem.id,
        currentWebview.sourceType,
        linkItem.type === "article" ? "article" : "answer",
        undefined,
        currentWebview.collectionId,
        sortTypeParam
      );

      console.log(
        `排序切换: 当前=${currentWebviewId}, 目标=${targetWebviewId}, 目标排序=${targetSortType}`
      );

      // 检查目标排序的页面是否已存在
      const existingView = Store.webviewMap.get(targetWebviewId);

      if (existingView) {
        // 如果已存在，直接切换过去
        console.log("目标排序页面已存在，切换过去");
        existingView.webviewPanel.reveal();
      } else {
        // 如果不存在，创建新页面显示目标排序
        console.log("目标排序页面不存在，创建新页面");

        // 更新linkItem的sortType以匹配目标排序
        linkItem.sortType =
          targetSortType === "updated" ? "updated" : undefined;

        // 设置linkItem的标题和摘要
        linkItem.title = currentWebviewArticle.title;
        linkItem.excerpt = currentWebviewArticle.excerpt;

        // 调用openWebview创建新的webview
        await this.openWebview(
          linkItem,
          currentWebview.sourceType,
          currentWebview.collectionId
        );
      }
    } catch (error) {
      console.error("切换排序时出错:", error);
      vscode.window.showErrorMessage("切换排序失败");
    }
  }

  /** 处理在VSCode中打开知乎链接的请求 */
  private static async handleOpenZhihuLink(url: string): Promise<void> {
    try {
      // 从URL创建LinkItem
      const linkItem = this.createLinkItemFromUrl(url);
      if (linkItem) {
        // 调用openWebview方法在VSCode中打开
        await this.openWebview(linkItem, "inner-link");
      } else {
        vscode.window.showErrorMessage("无法解析知乎链接");
        // 如果无法解析链接，尝试直接在浏览器中打开
        const uri = vscode.Uri.parse(url);
        const success = await vscode.env.openExternal(uri);
        if (!success) {
          vscode.window.showErrorMessage("无法打开知乎链接，请检查链接格式");
        }
      }
    } catch (error) {
      console.error("打开知乎链接时出错:", error);
      vscode.window.showErrorMessage("打开知乎链接失败");
    }
  }

  /** 公共方法：从URL打开知乎链接 */
  static async openZhihuUrlInWebview(url: string): Promise<void> {
    await this.handleOpenZhihuLink(url);
  }

  /** 从URL创建LinkItem */
  private static createLinkItemFromUrl(url: string): LinkItem | null {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      const pathname = urlObj.pathname;

      let id = "";
      let title = "知乎内容";
      let type: "question" | "article" = "question";

      if (hostname === "www.zhihu.com") {
        // 处理问题页面
        const questionMatch = pathname.match(/^\/question\/(\d+)/);
        const answerMatch = pathname.match(/^\/question\/\d+\/answer\/(\d+)/);

        // 检测是否是按时间排序的URL
        const isTimeSorted = pathname.includes("/answers/updated");

        if (questionMatch) {
          id = questionMatch[1];
          title = `知乎问题 ${id}`;
          type = "question";

          // 如果是特定回答，设置answerUrl
          if (answerMatch) {
            return {
              id: id,
              url: `https://www.zhihu.com/question/${id}`,
              title: `知乎回答 ${answerMatch[1]}`,
              excerpt: "正在加载回答中，请稍后~",
              type: type,
              answerUrl: url, // 保存特定回答的URL
              sortType: isTimeSorted ? "updated" : undefined, // 添加排序类型
            };
          }
        }
      } else if (hostname === "zhuanlan.zhihu.com") {
        // 处理文章页面
        const articleMatch = pathname.match(/^\/p\/(\d+)/);
        if (articleMatch) {
          id = articleMatch[1];
          title = `知乎文章 ${id}`;
          type = "article";
        }
      }

      if (id) {
        // 检测是否是按时间排序的URL（针对问题类型）
        const isTimeSorted =
          type === "question" && pathname.includes("/answers/updated");

        return {
          id: id,
          url: url,
          title: title,
          excerpt: "正在加载中，请稍后~",
          type: type,
          sortType: isTimeSorted ? "updated" : undefined, // 添加排序类型
        };
      }

      return null;
    } catch (error) {
      console.error("解析URL时出错:", error);
      return null;
    }
  }

  /**
   * 处理更新选择的伪装类型
   * @param selectedTypes 用户选择的伪装类型数组
   */
  private static async handleUpdateSelectedDisguiseTypes(
    selectedTypes: string[]
  ): Promise<void> {
    try {
      const config = vscode.workspace.getConfiguration("zhihu-fisher");
      await config.update(
        "selectedDisguiseTypes",
        selectedTypes,
        vscode.ConfigurationTarget.Global
      );

      console.log(
        `伪装类型已更新: ${
          selectedTypes.length > 0 ? selectedTypes.join(", ") : "使用全部类型"
        }`
      );
    } catch (error) {
      console.error("更新伪装类型时出错:", error);
      vscode.window.showErrorMessage(
        `设置失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 处理预览伪装效果
   * @param webviewId WebView的ID
   * @param selectedTypes 选择的伪装类型
   */
  private static async handlePreviewDisguise(
    webviewId: string,
    selectedTypes: string[]
  ): Promise<void> {
    try {
      // 临时更新配置以进行预览
      const config = vscode.workspace.getConfiguration("zhihu-fisher");
      const originalTypes = config.get<string[]>("selectedDisguiseTypes", []);

      // 临时设置选择的类型
      await config.update(
        "selectedDisguiseTypes",
        selectedTypes,
        vscode.ConfigurationTarget.Global
      );

      // 清除当前缓存并生成新的伪装
      DisguiseManager.clearDisguiseCache(webviewId);
      const newDisguise = DisguiseManager.getRandomDisguise(webviewId);

      // 获取WebView面板并更新标题和图标
      const webviewItem = Store.webviewMap.get(webviewId);
      if (webviewItem && webviewItem.webviewPanel) {
        webviewItem.webviewPanel.title = newDisguise.title;
        webviewItem.webviewPanel.iconPath = newDisguise.iconPath;
      }

      // 恢复原始配置
      await config.update(
        "selectedDisguiseTypes",
        originalTypes,
        vscode.ConfigurationTarget.Global
      );

      vscode.window.showInformationMessage(
        `伪装预览: 当前页面已伪装为"${newDisguise.title}"`
      );
    } catch (error) {
      console.error("预览伪装效果时出错:", error);
      vscode.window.showErrorMessage(
        `预览失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 解析问题详情内容（点击"显示全部"按钮获取完整内容）
   * @param webviewId WebView的ID
   * @param page Puppeteer页面实例
   */
  private static async parseQuestionDetail(
    webviewId: string,
    page: Puppeteer.Page
  ): Promise<void> {
    const webviewItem = Store.webviewMap.get(webviewId);
    if (!webviewItem) {
      return;
    }

    try {
      // 检查是否存在"显示全部"按钮并点击
      const expandButtonExists = await page.evaluate(() => {
        const expandButton = document.querySelector(
          ".QuestionRichText-more"
        ) as HTMLButtonElement;

        if (expandButton && expandButton.textContent?.includes("显示全部")) {
          expandButton.click();
          return true;
        }
        return false;
      });

      if (expandButtonExists) {
        console.log('找到"显示全部"按钮，已点击展开');
        // 等待内容加载
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        console.log('未找到"显示全部"按钮，使用当前显示的内容');
      }

      // 提取问题详情内容
      const questionDetail = await page.evaluate(() => {
        // 优先查找展开后的完整内容
        const expandedContent = document.querySelector(
          ".QuestionRichText .RichText.ztext"
        );

        if (expandedContent) {
          return expandedContent.innerHTML;
        }

        // 如果没有展开内容，使用收缩状态的内容
        const collapsedContent = document.querySelector(
          '.QuestionRichText--collapsed span[itemprop="text"]'
        );

        if (collapsedContent) {
          return collapsedContent.innerHTML;
        }

        // 最后尝试获取任何问题描述内容
        const anyContent = document.querySelector(
          '.QuestionRichText span[itemprop="text"]'
        );

        return anyContent ? anyContent.innerHTML : "";
      });

      if (questionDetail) {
        const processedQuestionDetail = ContentProcessor.processContent(
          questionDetail,
          null,
          false
        ); // 处理内容中的多媒体元素
        webviewItem.article.questionDetail = processedQuestionDetail;
        console.log("成功提取问题详情内容");

        // 通过 postMessage 更新前端的问题详情内容
        webviewItem.webviewPanel.webview.postMessage({
          command: "updateQuestionDetail",
          data: {
            questionDetail: questionDetail,
          },
        });
      } else {
        console.log("未找到问题详情内容");
      }
    } catch (error) {
      console.error("解析问题详情时出错:", error);
    }
  }

  /**
   * 处理关注作者请求
   * @param webviewId WebView的ID
   * @param authorId 作者ID
   */
  private static async handleFollowAuthor(
    webviewId: string,
    authorId: string
  ): Promise<void> {
    const webviewItem = Store.webviewMap.get(webviewId);
    if (!webviewItem) {
      return;
    }

    try {
      // 调用API关注用户
      await ZhihuApiService.followUser(authorId);

      // 更新Store中所有回答的作者关注状态
      webviewItem.article.answerList.forEach((answer) => {
        if (answer.author.id === authorId) {
          answer.author.isFollowing = true;
        }
      });

      // 通知前端更新状态
      webviewItem.webviewPanel.webview.postMessage({
        command: "updateAuthorFollowStatus",
        authorId: authorId,
        isFollowing: true,
      });

      vscode.window.showInformationMessage("已关注该作者");
    } catch (error) {
      console.error("关注作者时出错:", error);
      vscode.window.showErrorMessage(
        `关注失败: ${error instanceof Error ? error.message : String(error)}`
      );

      // 通知前端恢复状态
      webviewItem.webviewPanel.webview.postMessage({
        command: "updateAuthorFollowStatus",
        authorId: authorId,
        isFollowing: false,
      });
    }
  }

  /**
   * 处理获取导出统计信息请求
   * @param webviewId WebView的ID
   */
  private static async handleGetExportStats(
    webviewId: string
  ): Promise<void> {
    const webviewItem = Store.webviewMap.get(webviewId);
    if (!webviewItem) {
      return;
    }

    try {
      // 统计回答数量
      const answerCount = webviewItem.article.answerList.length;

      // 统计评论数量（从已加载的回答中统计）
      let commentCount = 0;
      webviewItem.article.answerList.forEach((answer) => {
        // commentList包含了已加载的评论
        commentCount += answer.commentList.length;
        // 统计子评论（优先使用 total_child_comments，如果没有则使用 child_comments）
        answer.commentList.forEach((comment) => {
          const childComments = (comment.total_child_comments && Array.isArray(comment.total_child_comments))
            ? comment.total_child_comments
            : (comment.child_comments && Array.isArray(comment.child_comments))
              ? comment.child_comments
              : [];
          commentCount += childComments.length;
        });
      });

      // 发送统计信息到前端
      webviewItem.webviewPanel.webview.postMessage({
        command: "displayExportModal",
        stats: {
          answerCount,
          commentCount,
        },
      });
    } catch (error) {
      console.error("获取导出统计信息失败:", error);
      vscode.window.showErrorMessage(
        `获取统计信息失败: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * 处理导出Markdown请求
   * @param webviewId WebView的ID
   */
  private static async handleExportMarkdown(
    webviewId: string
  ): Promise<void> {
    const webviewItem = Store.webviewMap.get(webviewId);
    if (!webviewItem) {
      return;
    }

    try {
      vscode.window.showInformationMessage("正在生成 Markdown 文件...");

      // 生成Markdown内容
      const markdown = this.generateMarkdownContent(webviewItem);

      // 生成文件名（使用标题，移除特殊字符）
      const fileName = webviewItem.article.title
        .replace(/[<>:"/\\|?*]/g, "_")
        .substring(0, 100);

      // 获取工作区路径
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        // 如果没有工作区，让用户选择保存位置
        const uri = await vscode.window.showSaveDialog({
          defaultUri: vscode.Uri.file(`${fileName}.md`),
          filters: {
            Markdown: ["md"],
          },
        });

        if (uri) {
          await vscode.workspace.fs.writeFile(
            uri,
            Buffer.from(markdown, "utf8")
          );
          vscode.window.showInformationMessage(
            `✅ Markdown文件已导出: ${uri.fsPath}`
          );
          // 打开文件
          await vscode.window.showTextDocument(uri);
        }
      } else {
        // 保存到工作区根目录
        const filePath = vscode.Uri.joinPath(
          workspaceFolders[0].uri,
          `${fileName}.md`
        );
        await vscode.workspace.fs.writeFile(
          filePath,
          Buffer.from(markdown, "utf8")
        );
        vscode.window.showInformationMessage(
          `✅ Markdown文件已导出: ${filePath.fsPath}`
        );
        // 打开文件
        await vscode.window.showTextDocument(filePath);
      }
    } catch (error) {
      console.error("导出Markdown失败:", error);
      vscode.window.showErrorMessage(
        `导出失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 生成Markdown内容
   * @param webviewItem WebView项
   */
  private static generateMarkdownContent(webviewItem: WebViewItem): string {
    let markdown = "";

    // 添加标题
    markdown += `# ${webviewItem.article.title}\n\n`;

    // 添加元信息
    markdown += `> 📅 导出时间: ${new Date().toLocaleString("zh-CN")}\n`;
    markdown += `> 🔗 原文链接: ${webviewItem.url}\n`;
    markdown += `> 📊 已加载回答数: ${webviewItem.article.answerList.length}\n\n`;

    // 添加问题详情（如果有）
    if (webviewItem.article.questionDetail) {
      markdown += "## 问题详情\n\n";
      markdown += this.htmlToMarkdown(webviewItem.article.questionDetail);
      markdown += "\n\n";
    }

    // 添加分隔线
    markdown += "---\n\n";

    // 遍历所有回答
    webviewItem.article.answerList.forEach((answer, index) => {
      // 回答标题和URL
      markdown += `## 回答 ${index + 1}\n\n`;
      if (answer.url) {
        markdown += `> 🔗 回答链接: [${answer.url}](${answer.url})\n\n`;
      }

      // 作者信息
      if (answer.author) {
        markdown += `**👤 作者:** [${answer.author.name || "未知作者"}](${
          answer.author.url || ""
        })\n\n`;
        if (answer.author.signature) {
          markdown += `> ${answer.author.signature}\n\n`;
        }
      }

      // 元信息
      if (answer.likeCount !== undefined || answer.commentCount !== undefined) {
        markdown += "**📊 数据:**\n";
        if (answer.likeCount !== undefined) {
          markdown += `- 👍 点赞: ${answer.likeCount}\n`;
        }
        if (answer.commentCount !== undefined) {
          markdown += `- 💬 评论: ${answer.commentCount}\n`;
        }
        if (answer.publishTime) {
          markdown += `- 📅 发布: ${answer.publishTime}\n`;
        }
        if (answer.updateTime && answer.updateTime !== answer.publishTime) {
          markdown += `- ✏️ 更新: ${answer.updateTime}\n`;
        }
        markdown += "\n";
      }

      // 回答内容
      markdown += "### 回答内容\n\n";
      if (answer.content) {
        markdown += this.htmlToMarkdown(answer.content);
      }
      markdown += "\n\n";

      // 评论（如果已加载）
      if (answer.commentList && answer.commentList.length > 0) {
        markdown += `### 💬 评论区 (${answer.commentList.length}条)\n\n`;

        answer.commentList.forEach((comment, commentIndex) => {
          markdown += `#### 评论 ${commentIndex + 1}\n\n`;
          markdown += `**${comment.author?.name || "匿名用户"}**`;
          if (comment.created_time) {
            const timeStr = new Date(comment.created_time * 1000).toLocaleString("zh-CN");
            markdown += ` · ${timeStr}`;
          }
          if (comment.vote_count) {
            markdown += ` · 👍 ${comment.vote_count}`;
          }
          markdown += "\n\n";
          markdown += `${comment.content || ""}\n\n`;

          // 子评论（回复）
          // 优先使用 total_child_comments（用户手动加载的），如果没有则使用 child_comments（API初始返回的）
          const childComments = (comment.total_child_comments && comment.total_child_comments.length > 0)
            ? comment.total_child_comments
            : (comment.child_comments && comment.child_comments.length > 0)
              ? comment.child_comments
              : [];

          if (childComments.length > 0) {
            markdown += `**↳ 回复 (${childComments.length}条):**\n\n`;
            childComments.forEach((childComment) => {
              markdown += `  - **${childComment.author?.name || "匿名用户"}**`;
              if (childComment.created_time) {
                const childTimeStr = new Date(childComment.created_time * 1000).toLocaleString("zh-CN");
                markdown += ` · ${childTimeStr}`;
              }
              if (childComment.vote_count) {
                markdown += ` · 👍 ${childComment.vote_count}`;
              }
              markdown += "\n";
              markdown += `    ${childComment.content || ""}\n\n`;
            });
          }
        });
      }

      // 回答之间的分隔线
      if (index < webviewItem.article.answerList.length - 1) {
        markdown += "---\n\n";
      }
    });

    // 添加页脚
    markdown += "\n---\n\n";
    markdown += `> 📝 本文件由 [知乎摸鱼插件](https://github.com/crispyChicken999/zhihu-fisher-vscode) 导出\n\n`;
    markdown += `> 💡 提示: 您可以将此文件发送给 AI 工具进行分析总结\n\n`;

    // 添加免责声明
    markdown += "## ⚠️ 免责声明\n\n";
    markdown += "1. **内容版权**: 本文件中的所有内容（包括问题、回答、评论等）版权归知乎平台及原作者所有。本工具仅提供技术手段导出您已在知乎平台上可见的公开内容，用于个人学习、研究和备份目的。\n\n";
    markdown += "2. **使用限制**: 导出的内容仅供个人非商业用途使用。未经原作者授权，请勿将导出内容用于任何商业用途、二次发布、转载或其他可能侵犯原作者权益的行为。\n\n";
    markdown += "3. **责任声明**: 使用本工具导出内容的用户应自行承担因使用导出内容而产生的一切法律责任。本工具开发者不对用户使用导出内容的行为承担任何责任，包括但不限于因侵犯知识产权、违反平台规则等引起的任何纠纷或损失。\n\n";
    markdown += "4. **合规使用**: 请遵守知乎平台的用户协议和相关法律法规，尊重原创作者的知识产权。如需引用或转载内容，请务必标注来源并获得原作者授权。\n\n";
    markdown += "5. **数据准确性**: 导出的内容为导出时刻的快照，可能与当前知乎平台上的实际内容存在差异。本工具不保证导出内容的完整性和准确性。\n\n";
    markdown += `6. **开源协议**: 本工具遵循开源协议，使用即表示您同意上述条款。更多信息请访问: https://github.com/crispyChicken999/zhihu-fisher-vscode\n\n`;

    return markdown;
  }

  /**
   * 简单的HTML转Markdown转换
   * @param html HTML内容
   */
  private static htmlToMarkdown(html: string): string {
    if (!html) {return "";}

    // 使用marked的反向转换，或者简单处理
    let text = html;

    // 移除script和style标签
    text = text.replace(/<script[^>]*>.*?<\/script>/gi, "");
    text = text.replace(/<style[^>]*>.*?<\/style>/gi, "");

    // 处理图片
    text = text.replace(
      /<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi,
      "![$2]($1)"
    );
    text = text.replace(
      /<img[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']*)["'][^>]*>/gi,
      "![$1]($2)"
    );
    text = text.replace(/<img[^>]*src=["']([^"']*)["'][^>]*>/gi, "![图片]($1)");

    // 处理链接
    text = text.replace(
      /<a[^>]*href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gi,
      "[$2]($1)"
    );

    // 处理代码块
    text = text.replace(
      /<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
      "\n```\n$1\n```\n"
    );
    text = text.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, "\n```\n$1\n```\n");

    // 处理行内代码
    text = text.replace(/<code[^>]*>([^<]*)<\/code>/gi, "`$1`");

    // 处理标题
    text = text.replace(/<h1[^>]*>([^<]*)<\/h1>/gi, "\n# $1\n\n");
    text = text.replace(/<h2[^>]*>([^<]*)<\/h2>/gi, "\n## $1\n\n");
    text = text.replace(/<h3[^>]*>([^<]*)<\/h3>/gi, "\n### $1\n\n");
    text = text.replace(/<h4[^>]*>([^<]*)<\/h4>/gi, "\n#### $1\n\n");
    text = text.replace(/<h5[^>]*>([^<]*)<\/h5>/gi, "\n##### $1\n\n");
    text = text.replace(/<h6[^>]*>([^<]*)<\/h6>/gi, "\n###### $1\n\n");

    // 处理粗体和斜体
    text = text.replace(/<strong[^>]*>([^<]*)<\/strong>/gi, "**$1**");
    text = text.replace(/<b[^>]*>([^<]*)<\/b>/gi, "**$1**");
    text = text.replace(/<em[^>]*>([^<]*)<\/em>/gi, "*$1*");
    text = text.replace(/<i[^>]*>([^<]*)<\/i>/gi, "*$1*");

    // 处理列表
    text = text.replace(/<li[^>]*>([^<]*)<\/li>/gi, "- $1\n");
    text = text.replace(/<\/ul>/gi, "\n");
    text = text.replace(/<\/ol>/gi, "\n");
    text = text.replace(/<ul[^>]*>/gi, "\n");
    text = text.replace(/<ol[^>]*>/gi, "\n");

    // 处理段落和换行
    text = text.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "$1\n\n");
    text = text.replace(/<br\s*\/?>/gi, "\n");
    text = text.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, "$1\n");

    // 移除所有剩余的HTML标签
    text = text.replace(/<[^>]+>/g, "");

    // 解码HTML实体
    text = text.replace(/&nbsp;/g, " ");
    text = text.replace(/&lt;/g, "<");
    text = text.replace(/&gt;/g, ">");
    text = text.replace(/&amp;/g, "&");
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");

    // 清理多余的空行
    text = text.replace(/\n{3,}/g, "\n\n");
    text = text.trim();

    return text;
  }

  /**
   * 处理取消关注作者请求
   * @param webviewId WebView的ID
   * @param authorId 作者ID
   */
  private static async handleUnfollowAuthor(
    webviewId: string,
    authorId: string
  ): Promise<void> {
    const webviewItem = Store.webviewMap.get(webviewId);
    if (!webviewItem) {
      return;
    }

    try {
      // 调用API取消关注用户
      await ZhihuApiService.unfollowUser(authorId);

      // 更新Store中所有回答的作者关注状态
      webviewItem.article.answerList.forEach((answer) => {
        if (answer.author.id === authorId) {
          answer.author.isFollowing = false;
        }
      });

      // 通知前端更新状态
      webviewItem.webviewPanel.webview.postMessage({
        command: "updateAuthorFollowStatus",
        authorId: authorId,
        isFollowing: false,
      });

      vscode.window.showInformationMessage("已取消关注");
    } catch (error) {
      console.error("取消关注作者时出错:", error);
      vscode.window.showErrorMessage(
        `取消关注失败: ${
          error instanceof Error ? error.message : String(error)
        }`
      );

      // 通知前端恢复状态
      webviewItem.webviewPanel.webview.postMessage({
        command: "updateAuthorFollowStatus",
        authorId: authorId,
        isFollowing: true,
      });
    }
  }
}
