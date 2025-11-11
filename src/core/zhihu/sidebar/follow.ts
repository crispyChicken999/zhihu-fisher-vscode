import * as vscode from "vscode";
import * as Puppeteer from "puppeteer";
import { Store } from "../../stores";
import { CookieManager } from "../cookie";
import { PuppeteerManager } from "../puppeteer";
import { StatusTreeItem, TreeItem, LinkItem } from "../../types";
import { ZhihuApiService } from "../api";
import { CollectionPickerUtils } from "../../utils";
import { TooltipContents } from "../../utils/tooltip-contents";

/**
 * 侧边栏的知乎关注-树数据提供者
 * 提供知乎关注的数据，用于在侧边栏的树视图中显示
 */
export class sidebarFollowListDataProvider
  implements vscode.TreeDataProvider<TreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    TreeItem | undefined | null | void
  > = new vscode.EventEmitter<TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    TreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private loadingStatusItem: vscode.StatusBarItem;
  private canCreateBrowser: boolean = true; // 是否可以创建浏览器实例
  private treeView?: vscode.TreeView<TreeItem>; // TreeView 引用，用于更新标题

  constructor() {
    this.loadingStatusItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this.loadingStatusItem.text = "$(sync~spin) 加载知乎关注中...";

    // 不在初始化时自动加载，等待用户手动触发
    // 异步检查浏览器创建能力
    this.checkBrowserCapability();
  }

  // 检查浏览器创建能力
  private async checkBrowserCapability(): Promise<void> {
    this.canCreateBrowser = await PuppeteerManager.canCreateBrowser();
    this._onDidChangeTreeData.fire(); // 更新视图
  }

  // 设置 TreeView 引用
  setTreeView(treeView: vscode.TreeView<TreeItem>): void {
    this.treeView = treeView;
  }

  // 更新侧边栏标题
  private updateTitle(): void {
    if (this.treeView) {
      const isLoading = Store.Zhihu.follow.isLoading;
      const list = Store.Zhihu.follow.list;

      if (isLoading) {
        this.treeView.title = "关注(加载中...)";
      } else if (list.length > 0) {
        // 统计问题和文章的数量
        const questionCount = list.filter(
          (item) => item.type === "question" || !item.type
        ).length;
        const articleCount = list.filter(
          (item) => item.type === "article"
        ).length;

        if (questionCount > 0 && articleCount > 0) {
          this.treeView.title = `关注(${list.length}条: ${questionCount}条问题 | ${articleCount}篇文章)`;
        } else if (questionCount > 0) {
          this.treeView.title = `关注(${questionCount}条问题)`;
        } else if (articleCount > 0) {
          this.treeView.title = `关注(${articleCount}条文章)`;
        } else {
          this.treeView.title = `关注(${list.length}条)`;
        }
      } else {
        this.treeView.title = "关注";
      }
    }
  }

  // 刷新树视图
  refresh(): void {
    console.log("触发知乎关注刷新...");
    this.getSideBarFollowList();
  }

  // 重置关注列表
  reset(): void {
    console.log("重置知乎关注列表...");
    Store.Zhihu.follow.list = []; // 清空关注列表
    Store.Zhihu.follow.isLoading = false; // 重置加载状态
    this.updateTitle(); // 更新标题
    this._onDidChangeTreeData.fire(); // 触发更新UI
  }

  // 仅刷新视图显示（不重新加载数据）
  refreshView(): void {
    console.log("刷新关注视图显示...");
    this._onDidChangeTreeData.fire();
  }

  // 加载关注列表
  private async getSideBarFollowList(): Promise<void> {
    // 看看能不能创建浏览器实例，不能则认为加载不出关注列表
    this.canCreateBrowser = await PuppeteerManager.canCreateBrowser();
    if (!this.canCreateBrowser) {
      console.log("无法创建浏览器实例，关注加载失败");
      Store.Zhihu.follow.isLoading = false; // 重置加载状态
      Store.Zhihu.follow.list = []; // 清空关注列表
      this.updateTitle(); // 更新标题
      vscode.window.showErrorMessage(
        "无法创建浏览器实例，关注加载失败，请检查浏览器配置情况。"
      );
      this._onDidChangeTreeData.fire(); // 触发更新UI，显示加载状态
      return;
    }

    // 避免重复加载
    if (Store.Zhihu.follow.isLoading) {
      console.log("正在加载中关注，请稍候...");
      vscode.window.showInformationMessage("正在加载中关注，请稍候...");
      return;
    }

    try {
      this.loadingStatusItem.show();

      console.log("开始加载知乎关注数据");
      this.updateTitle(); // 开始加载时更新标题为加载中
      this._onDidChangeTreeData.fire(); // 触发更新UI，显示加载状态

      await this.getFollowList();
      const list = Store.Zhihu.follow.list;
      console.log(`加载完成，获取到${list.length}个关注项目`);
      this.loadingStatusItem.hide();
      this.updateTitle(); // 更新标题显示条数
      this._onDidChangeTreeData.fire(); // 再次触发更新UI，显示加载结果

      if (list.length > 0) {
        vscode.window.showInformationMessage(
          `已更新知乎关注，共${list.length}条动态`
        );
      }
    } catch (error) {
      Store.Zhihu.follow.isLoading = false;
      this.loadingStatusItem.hide();
      this.updateTitle(); // 出错时也要更新标题
      this._onDidChangeTreeData.fire(); // 触发更新UI，显示错误状态

      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("加载知乎关注失败:", errorMsg);
      vscode.window.showErrorMessage(`加载知乎关注失败: ${errorMsg}`);
    }
  }

  // 通过爬虫获取关注列表
  async getFollowList() {
    console.log("开始获取知乎关注页面...");

    Store.Zhihu.follow.isLoading = true; // 设置加载状态
    this.updateTitle(); // 设置加载状态后更新标题

    const isCookieSet = CookieManager.isCookieSet();
    if (!isCookieSet) {
      CookieManager.promptForNewCookie("需要知乎Cookie才能获取关注，请设置");
      throw new Error("需要设置知乎Cookie才能访问");
    }

    // 创建并获取浏览器页面
    const page = await PuppeteerManager.createPage();

    console.log("导航到知乎关注页面...");
    await page.goto("https://www.zhihu.com/follow", {
      waitUntil: "networkidle0",
      timeout: 60000, // 60秒超时
    });

    PuppeteerManager.setPageInstance("follow", page); // 设置页面实例

    try {
      console.log("页面加载完成，开始读取页面...");
      await PuppeteerManager.simulateHumanScroll(page);
      await PuppeteerManager.delay(500);

      const isCookieExpired = await CookieManager.checkIfPageHasLoginElement(
        page
      );

      if (isCookieExpired) {
        console.log("检测到登录墙或验证码");
        console.log("Cookie过期，请重新登录！");
        if (isCookieSet) {
          // 如果已经有cookie但仍然被拦截，可能是cookie过期
          console.log("Cookie可能已失效，需要更新");
          CookieManager.promptForNewCookie("您的知乎Cookie可能已过期，请更新");
          throw new Error("知乎Cookie已失效，请更新");
        } else {
          // 如果没有cookie且被拦截
          console.log("需要设置Cookie才能访问");
          CookieManager.promptForNewCookie(
            "需要知乎Cookie才能获取关注内容，请设置"
          );
          throw new Error("需要设置知乎Cookie才能访问");
        }
      }

      console.log("开始提取关注内容...");

      // 尝试滚动页面加载更多内容
      await this.scrollToLoadMore(page);

      const followList = await this.parseFollowList(page);
      console.log(`成功解析出${followList.length}个关注项目`);
      console.log("关注列表解析完成，更新Store...");
      Store.Zhihu.follow.list = followList; // 更新关注列表
    } catch (error) {
      console.error("获取关注列表失败:", error);
      // 处理错误
      if (error instanceof Puppeteer.TimeoutError) {
        console.error("页面加载超时，可能是网络问题或知乎反爬虫机制");
      } else {
        console.error("发生错误:", (error as Error).message);
      }
    } finally {
      console.log("保持关注页面打开，以便后续加载更多内容");
      // 不关闭页面，以便后续继续加载更多内容
      // 重置加载状态
      Store.Zhihu.follow.isLoading = false;
    }
  }

  // 解析关注列表
  private async parseFollowList(page: Puppeteer.Page): Promise<LinkItem[]> {
    // 循环点击所有展开按钮，直到没有展开按钮为止
    let hasExpandButtons = true;
    let clickRound = 0;

    while (hasExpandButtons) {
      clickRound++;
      console.log(`第 ${clickRound} 轮查找展开按钮...`);

      const buttonCount = await page.evaluate(() => {
        const expandButtons = Array.from(
          document.querySelectorAll(
            ".Card.TopstoryItem.TopstoryItem-feedList.TopstoryItem-isFollow .Topstory-feedGroupCollapsedItem"
          )
        );

        console.log(`找到 ${expandButtons.length} 个展开更多按钮`);

        // 点击所有展开按钮
        expandButtons.forEach((btn, index) => {
          try {
            (btn as HTMLElement).click();
            console.log(`点击了展开按钮 #${index + 1}`);
          } catch (error) {
            console.error(`点击展开按钮 #${index + 1} 失败:`, error);
          }
        });

        return expandButtons.length;
      });

      if (buttonCount === 0) {
        console.log("没有找到展开按钮，结束点击");
        hasExpandButtons = false;
      } else {
        console.log(`点击了 ${buttonCount} 个展开按钮，等待内容加载...`);
        // 等待每个按钮点击后内容加载(1.5-2秒)
        await PuppeteerManager.delay(1500);
      }

      // 防止无限循环
      if (clickRound >= 10) {
        console.log("达到最大点击轮数限制，退出");
        break;
      }
    }

    console.log(`所有展开按钮已点击完毕，共进行了 ${clickRound} 轮点击`);

    console.log(`所有展开按钮已点击完毕，共进行了 ${clickRound} 轮点击`);

    // 现在解析所有Feed项
    const parsedList = await page.evaluate(() => {
      const items: LinkItem[] = [];
      const feedItems = Array.from(
        document.querySelectorAll(
          ".Card.TopstoryItem.TopstoryItem-isFollow .Feed"
        )
      );

      console.log(`展开后共找到 ${feedItems.length} 个Feed项`);

      feedItems.forEach((item, index) => {
        try {
          // 获取关注人的操作信息
          const feedSourceElement = item.querySelector(".FeedSource-firstline");
          let followAction = "";
          let followTime = "";
          let followerName = "";
          let followerUrl = "";

          if (feedSourceElement) {
            const userLinkElement =
              feedSourceElement.querySelector(".UserLink-link");
            if (userLinkElement) {
              followerName =
                (userLinkElement as HTMLAnchorElement).textContent?.trim() ||
                "";
              const href =
                (userLinkElement as HTMLAnchorElement).getAttribute("href") ||
                "";
              followerUrl = href.startsWith("//") ? "https:" + href : href;
            }

            const fullText = feedSourceElement.textContent || "";
            // 提取操作类型(如"赞同了回答"、"关注了问题")和时间
            const parts = fullText.split(followerName);
            if (parts.length > 1) {
              const restText = parts[1];
              const timeMatch = restText.match(/·\s*(.+)$/);
              if (timeMatch) {
                followTime = timeMatch[1].trim();
                followAction = restText.replace(/·\s*.+$/, "").trim();
              } else {
                followAction = restText.trim();
              }
            }
          }

          // 判断是问题、回答还是文章

          // 关注的问题通过data-za-detail-view-path-module="QuestionItem"标识
          const hasQuestionItem = item.querySelector(
            "[data-za-detail-view-path-module='QuestionItem']"
          );
          const hasAnswerItem = item.querySelector(".ContentItem.AnswerItem");
          const hasArticleItem = item.querySelector(".ContentItem.ArticleItem");

          let contentType = "";
          let contentElement: Element | null = null;

          if (hasQuestionItem) {
            contentType = "question";
            contentElement = hasQuestionItem;
          } else if (hasAnswerItem) {
            contentType = "answer";
            contentElement = hasAnswerItem;
          } else if (hasArticleItem) {
            contentType = "article";
            contentElement = hasArticleItem;
          } else {
            console.log(`Feed项 #${index + 1} 无法识别类型，跳过`);
            return;
          }

          console.log(`Feed项 #${index + 1} 类型: ${contentType}`);

          // 回答和文章需要获取作者信息
          let authorName = "";
          let authorAvatar = "";
          let authorUrl = "";
          let authorBadge = "";

          if (contentType === "answer" || contentType === "article") {
            // 首先检查操作类型，判断关注人是否就是作者
            const isFollowerTheAuthor =
              followAction.includes("回答了问题") ||
              followAction.includes("发布了文章") ||
              followAction.includes("写了文章") ||
              followAction.includes("回答了");

            if (isFollowerTheAuthor) {
              // 如果关注人本身就是作者，直接使用关注人信息
              authorName = followerName;
              authorUrl = followerUrl;
              console.log(
                `Feed项 #${index + 1}: 关注人就是作者 - ${authorName}`
              );

              // 尝试从ContentItem内的AuthorInfo获取头像和简介
              const contentAuthorInfo =
                contentElement?.querySelector(".AuthorInfo");
              if (contentAuthorInfo) {
                const avatarMeta = contentAuthorInfo.querySelector(
                  'meta[itemprop="image"]'
                );
                authorAvatar = (avatarMeta as HTMLMetaElement)?.content || "";
                const badgeElement = contentAuthorInfo.querySelector(
                  ".AuthorInfo-badgeText"
                );
                const rawBadge = badgeElement?.textContent?.trim() || "";
                // 清理签名中的换行符，将多个连续换行替换为空格
                authorBadge = rawBadge.replace(/\n+/g, ' ').trim();
              }
            } else {
              // 否则，查找AuthorInfo元素（赞同了回答、喜欢了文章等情况）
              const authorInfoElement = item.querySelector(".AuthorInfo");
              if (authorInfoElement) {
                const authorNameMeta = authorInfoElement.querySelector(
                  'meta[itemprop="name"]'
                );
                authorName = (authorNameMeta as HTMLMetaElement)?.content || "";

                const authorImageMeta = authorInfoElement.querySelector(
                  'meta[itemprop="image"]'
                );
                authorAvatar =
                  (authorImageMeta as HTMLMetaElement)?.content || "";

                const authorUrlMeta = authorInfoElement.querySelector(
                  'meta[itemprop="url"]'
                );
                authorUrl = (authorUrlMeta as HTMLMetaElement)?.content || "";

                const authorBadgeElement = authorInfoElement.querySelector(
                  ".AuthorInfo-badgeText"
                );
                const rawBadge = authorBadgeElement?.textContent?.trim() || "";
                // 清理签名中的换行符，将多个连续换行替换为空格
                authorBadge = rawBadge.replace(/\n+/g, ' ').trim();

                console.log(
                  `Feed项 #${index + 1}: 从AuthorInfo获取作者 - ${authorName}`
                );
              }
            }
          }

          // 获取内容标题和URL
          let title = "";
          let url = "";

          if (contentType === "question") {
            // 问题类型的标题在 QuestionItem-title 中
            const titleElement = contentElement?.querySelector(
              ".QuestionItem-title a"
            );
            title = titleElement
              ? (titleElement as HTMLAnchorElement).textContent?.trim() ||
                "未知标题"
              : "未知标题";
            const href = titleElement
              ? (titleElement as HTMLAnchorElement).getAttribute("href") || ""
              : "";
            url = href.startsWith("/") ? "https://www.zhihu.com" + href : href;
          } else {
            // 回答和文章的标题在 ContentItem-title 中
            const titleElement = contentElement?.querySelector(
              ".ContentItem-title a"
            );
            title = titleElement
              ? (titleElement as HTMLAnchorElement).textContent?.trim() ||
                "未知标题"
              : "未知标题";
            const href = titleElement
              ? (titleElement as HTMLAnchorElement).getAttribute("href") || ""
              : "";
            url = href.startsWith("//")
              ? "https:" + href
              : href.startsWith("/")
              ? "https://www.zhihu.com" + href
              : href;
          }

          // 提取ID和token
          let questionId = "";
          let answerId = "";
          let articleId = "";
          let contentToken = "";
          let answerUrl = url;
          let itemType: "question" | "article" = "question"; // 默认为问题类型

          if (contentType === "question") {
            const questionMatch = url.match(/question\/(\d+)/);
            questionId = questionMatch ? questionMatch[1] : "";
            // 关注的问题没有contentToken，因为问题本身无法收藏
            contentToken = "";
            itemType = "question";
            console.log(`Feed项 #${index + 1}: 类型=问题, questionId=${questionId}, contentToken为空`);
          } else if (contentType === "answer") {
            const questionMatch = url.match(/question\/(\d+)/);
            const answerMatch = url.match(/answer\/(\d+)/);
            questionId = questionMatch ? questionMatch[1] : "";
            answerId = answerMatch ? answerMatch[1] : "";
            contentToken = answerId; // 回答的token是answerId
            itemType = "question"; // 回答归类为问题类型
            console.log(`Feed项 #${index + 1}: 类型=回答, questionId=${questionId}, answerId=${answerId}, contentToken=${contentToken}`);
          } else if (contentType === "article") {
            // 文章URL格式: https://zhuanlan.zhihu.com/p/123456789 或 /p/123456789
            const articleMatch = url.match(/\/p\/(\d+)/);
            articleId = articleMatch ? articleMatch[1] : "";
            contentToken = articleId;
            itemType = "article";
            console.log(`Feed项 #${index + 1}: 类型=文章, articleId=${articleId}, contentToken=${contentToken}, url=${url}`);
          }

          const id =
            contentType === "question"
              ? `follow-question-${questionId}`
              : contentType === "answer"
              ? `follow-answer-${answerId}`
              : `follow-article-${articleId}`;

          // 获取摘要
          const excerptElement = contentElement?.querySelector(
            ".RichContent .RichText"
          );
          const excerpt = excerptElement
            ? (excerptElement as HTMLElement).textContent?.trim() ||
              "🐟无摘要🐟"
            : "🐟无摘要🐟";

          // 获取图片(如果有)
          const imgMeta = contentElement?.querySelector(
            'meta[itemprop="image"]'
          );
          const imgUrl = (imgMeta as HTMLMetaElement)?.content || "";

          // 获取点赞数和评论数
          let upvoteCount = "0";
          let commentCount = "0";

          if (contentType === "question") {
            // 问题类型从按钮文本中提取回答数
            const answerButton = contentElement?.querySelector(
              '.ContentItem-action[href*="/question/"] span'
            );
            if (answerButton) {
              const answerText = answerButton.textContent || "";
              const answerMatch = answerText.match(/(\d+)/);
              commentCount = answerMatch ? answerMatch[1] : "0"; // 问题用回答数作为评论数
            }

            // 问题本身可能有评论数
            const commentButton = contentElement?.querySelector(
              'button[class*="Comment"]'
            );
            if (commentButton) {
              const commentText = commentButton.textContent || "";
              const commentMatch = commentText.match(/(\d+)/);
              if (commentMatch) {
                upvoteCount = commentMatch[1]; // 用评论数作为互动指标
              }
            }
          } else {
            // 回答和文章类型
            const upvoteElement = contentElement?.querySelector(
              'meta[itemprop="upvoteCount"]'
            );
            upvoteCount = (upvoteElement as HTMLMetaElement)?.content || "0";

            const commentElement = contentElement?.querySelector(
              'meta[itemprop="commentCount"]'
            );
            commentCount = (commentElement as HTMLMetaElement)?.content || "0";
          }

          // 检查是否已存在
          if (items.some((existingItem) => existingItem.id === id)) {
            console.log(`Feed项 #${index + 1} (${id}) 已存在，跳过...`);
            return;
          }

          items.push({
            id,
            url,
            title,
            imgUrl,
            excerpt,
            type: itemType,
            contentToken,
            answerUrl,
            // 扩展字段用于tooltip
            followInfo: {
              followerName,
              followerUrl,
              followAction,
              followTime,
              authorName,
              authorAvatar,
              authorUrl,
              authorBadge,
              upvoteCount,
              commentCount,
              // 标记内容类型（用于tooltip区分）
              rawContentType: contentType,
            },
          } as any);

          console.log(`成功解析Feed项 #${index + 1}: ${title}`);
        } catch (error) {
          console.error(`解析Feed项 #${index + 1} 时出错:`, error);
        }
      });

      return items;
    });

    return parsedList;
  }

  // 滚动页面加载更多内容
  private async scrollToLoadMore(page: Puppeteer.Page) {
    let scrollAttempts = 3; // 滚动尝试次数
    for (let i = 0; i < scrollAttempts; i++) {
      console.log(`执行页面滚动 #${i + 1}/${scrollAttempts}`);
      const scrollHeight = await page.evaluate(() => {
        return document.body.scrollHeight;
      });

      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      await PuppeteerManager.delay(500); // 等待加载

      const newScrollHeight = await page.evaluate(() => {
        return document.body.scrollHeight;
      });

      if (newScrollHeight > scrollHeight) {
        console.log(
          `滚动高度: ${scrollHeight}px -> ${newScrollHeight}px，认为有更多内容`
        );
        console.log("成功加载更多内容");
      } else {
        console.log("没有更多内容可加载");
      }
    }
  }

  // 不喜欢指定内容
  async dislikeContent(item: LinkItem): Promise<void> {
    try {
      // 检查是否为只关注的问题（无contentToken）
      if (!item.contentToken || item.followInfo?.rawContentType === "question") {
        vscode.window.showWarningMessage("暂不支持对问题本身标记不喜欢，只能对回答或文章标记");
        return;
      }

      // 确定内容类型：文章为2，问题为1
      const contentType = item.type === "article" ? 2 : 1;

      vscode.window.showInformationMessage("正在标记为不喜欢...");

      const success = await ZhihuApiService.sendDislikeRequest(
        item.contentToken,
        contentType
      );

      if (success) {
        // 从关注列表中移除该项目
        const currentList = Store.Zhihu.follow.list;
        const filteredList = currentList.filter(
          (listItem) => listItem.id !== item.id
        );
        Store.Zhihu.follow.list = filteredList;

        // 刷新视图
        this.updateTitle();
        this._onDidChangeTreeData.fire();

        vscode.window.showInformationMessage(
          `已标记为不喜欢：${item.title.substring(0, 20)}...`
        );
      } else {
        vscode.window.showWarningMessage(
          "标记不喜欢失败，可能是网络问题或Cookie已过期"
        );
      }
    } catch (error) {
      console.error("不喜欢功能出错:", error);
      vscode.window.showErrorMessage("标记不喜欢时出现错误");
    }
  }

  // 不再推荐指定作者
  async dislikeAuthor(item: LinkItem): Promise<void> {
    try {
      // 检查是否为只关注的问题（无contentToken和作者）
      if (!item.contentToken || item.followInfo?.rawContentType === "question") {
        vscode.window.showWarningMessage("问题本身没有作者信息，无法屏蔽作者");
        return;
      }

      // 确定内容类型：文章为2，问题为1
      const contentType = item.type === "article" ? 2 : 1;

      vscode.window.showInformationMessage("正在标记为不再推荐该作者...");

      const success = await ZhihuApiService.sendDislikeAuthorRequest(
        item.contentToken,
        contentType
      );

      if (success) {
        // 从关注列表中移除该项目
        const currentList = Store.Zhihu.follow.list;
        const filteredList = currentList.filter(
          (listItem) => listItem.id !== item.id
        );
        Store.Zhihu.follow.list = filteredList;

        // 刷新视图
        this.updateTitle();
        this._onDidChangeTreeData.fire();

        vscode.window.showInformationMessage(
          `已标记为不再推荐该作者：${item.title.substring(0, 20)}...`
        );
      } else {
        vscode.window.showWarningMessage(
          "标记不再推荐该作者失败，可能是网络问题或Cookie已过期"
        );
      }
    } catch (error) {
      console.error("不再推荐作者功能出错:", error);
      vscode.window.showErrorMessage("标记不再推荐该作者时出现错误");
    }
  }

  // 收藏内容到收藏夹
  async favoriteContent(item: LinkItem): Promise<void> {
    try {
      // 检查是否为只关注的问题（无contentToken）
      if (!item.contentToken || item.followInfo?.rawContentType === "question") {
        vscode.window.showWarningMessage("问题本身无法收藏，只能收藏问题下的回答或文章");
        return;
      }

      // 确定内容类型
      const contentType = item.type === "article" ? "article" : "answer";

      // 使用工具类中的分页收藏夹选择器
      const selectedCollectionId =
        await CollectionPickerUtils.showCollectionPicker(
          item.contentToken,
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
        item.contentToken,
        contentType
      );

      if (success) {
        vscode.window
          .showInformationMessage(
            `成功收藏${contentType === "article" ? "文章" : "回答"}！`,
            "查看收藏夹"
          )
          .then((selection) => {
            if (selection === "查看收藏夹") {
              // 跳转到收藏夹视图
              vscode.commands.executeCommand("zhihu-fisher.refreshCollections");
            }
          });
      } else {
        vscode.window.showErrorMessage(
          `收藏${
            contentType === "article" ? "文章" : "回答"
          }失败，可能是该收藏夹已有相同内容，可以换个收藏夹试试。`
        );
      }
    } catch (error) {
      console.error("收藏内容时出错:", error);
      vscode.window.showErrorMessage(
        `收藏失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // 加载更多关注内容（增量加载）
  async loadMoreFollowContent(): Promise<void> {
    try {
      // 检查页面实例是否存在
      const page = PuppeteerManager.getPageInstance("follow");
      if (!page) {
        vscode.window.showErrorMessage("请先加载关注列表");
        return;
      }

      vscode.window.showInformationMessage("正在加载更多关注内容...");

      // 将页面带到前台
      await page.bringToFront();

      // 获取当前已有的项目数量
      const currentIds = Store.Zhihu.follow.list.map((item) => item.id);
      console.log(`当前关注列表有 ${currentIds.length} 项`);

      // 模拟滚动到底部
      console.log("模拟滚动到页面底部...");
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      await PuppeteerManager.delay(1500); // 等待内容加载

      // 再次滚动确保加载
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      await PuppeteerManager.delay(1500);

      // 解析新内容
      const newItems = await this.parseFollowList(page);

      // 过滤出真正的新项目
      const actualNewItems = newItems.filter(
        (item) => !currentIds.includes(item.id)
      );

      if (actualNewItems.length === 0) {
        vscode.window.showInformationMessage("没有更多关注内容了");
        return;
      }

      // 将新项目添加到列表
      Store.Zhihu.follow.list = [...Store.Zhihu.follow.list, ...actualNewItems];

      console.log(`新增了 ${actualNewItems.length} 个关注项目`);

      // 更新视图
      this.updateTitle();
      this._onDidChangeTreeData.fire();

      vscode.window.showInformationMessage(
        `成功加载 ${actualNewItems.length} 条新的关注内容`
      );
    } catch (error) {
      console.error("加载更多关注内容失败:", error);
      vscode.window.showErrorMessage(
        `加载更多失败: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // 清空关注列表
  clearList(): void {
    console.log("清空关注列表...");
    Store.Zhihu.follow.list = [];
    Store.Zhihu.follow.isLoading = false;
    this.updateTitle(); // 清空时更新标题

    // 关闭关注页面
    const page = PuppeteerManager.getPageInstance("follow");
    if (page) {
      page.close().catch((err) => console.error("关闭关注页面失败:", err));
      PuppeteerManager.setPageInstance("follow", null as any);
    }
  }

  // 获取树项
  getTreeItem(element: TreeItem): vscode.TreeItem {
    return element;
  }

  // 获取子项
  async getChildren(element?: TreeItem): Promise<TreeItem[]> {
    if (element) {
      return []; // 关注项没有子项
    }

    const isUserSetCustomPath = PuppeteerManager.isUserSetCustomPath();
    const isUserChromePathValid = PuppeteerManager.isUserChromePathValid();
    if (isUserSetCustomPath && !isUserChromePathValid) {
      // 如果用户设置了自定义路径，并且路径无效，显示提示
      return [
        new StatusTreeItem(
          "自定义浏览器路径无效，请重新设置",
          new vscode.ThemeIcon("error"),
          {
            command: "zhihu-fisher.setCustomChromePath",
            title: "设置自定义浏览器路径",
          },
          TooltipContents.getInvalidBrowserPathTooltip()
        ),
      ];
    }

    if (!this.canCreateBrowser) {
      // 如果不能创建浏览器，显示提示
      return [
        new StatusTreeItem(
          "爬虫无法创建浏览器，点我去配置浏览器",
          new vscode.ThemeIcon("error"),
          {
            command: "zhihu-fisher.configureBrowser",
            title: "配置浏览器",
          },
          TooltipContents.getBrowserUnavailableTooltip()
        ),
      ];
    }

    const isCookieSet = CookieManager.isCookieSet();
    if (!isCookieSet) {
      // 如果没有设置cookie，显示需要设置cookie的提示
      return [
        new StatusTreeItem(
          "需要设置知乎Cookie才能获取关注",
          new vscode.ThemeIcon("key"),
          {
            command: "zhihu-fisher.setCookie",
            title: "设置知乎Cookie",
          },
          TooltipContents.getCookieRequiredTooltip()
        ),
      ];
    }

    // 如果正在加载，显示一个加载项
    if (Store.Zhihu.follow.isLoading) {
      return [
        new StatusTreeItem(
          "正在加载知乎关注...",
          new vscode.ThemeIcon("loading~spin"),
          null,
          TooltipContents.getFollowLoadingTooltip()
        ),
      ];
    }

    const list = Store.Zhihu.follow.list;

    // 在顶部添加打赏入口
    const sponsorItem = new StatusTreeItem(
      "请我喝杯咖啡吧~ 支持插件持续更新~(￣▽￣)ノ",
      new vscode.ThemeIcon("coffee"),
      {
        command: "zhihu-fisher.buyMeCoffee",
        title: "查看详情",
      },
      TooltipContents.getSponsorTooltip()
    );

    // 如果列表为空且未加载过，显示"开始加载"按钮
    if (list.length === 0) {
      return [
        sponsorItem,
        new StatusTreeItem(
          "点击加载关注动态 ✨",
          new vscode.ThemeIcon("cloud-download"),
          {
            command: "zhihu-fisher.refreshFollowList",
            title: "加载关注列表",
          },
          new vscode.MarkdownString(
            "👥 **开始加载关注动态** 👥\n\n" +
              "---\n\n" +
              "✨ 点击开始加载您关注的人的最新动态\n\n" +
              "📱 包含关注用户的回答和文章\n\n" +
              "🎯 首次加载可能需要较长时间，请耐心等待"
          )
        ),
      ];
    }

    // 如果有缓存的关注项目，直接返回
    if (list.length > 0) {
      const treeItems = list.map(
        (item) => new TreeItem(item, vscode.TreeItemCollapsibleState.None)
      );

      // 在关注列表底部添加"加载更多"按钮
      const loadMoreButton = new StatusTreeItem(
        "加载更多关注内容 📥",
        new vscode.ThemeIcon("arrow-down"),
        {
          command: "zhihu-fisher.loadMoreFollowContent",
          title: "加载更多关注",
        },
        new vscode.MarkdownString(
          "📥 **加载更多关注** 📥\n\n" +
            "---\n\n" +
            "✨ 点击加载更多关注动态\n\n" +
            "🔄 会自动滚动页面并获取新内容\n\n" +
            "🎯 如果没有新内容会提示您"
        )
      );

      // 刷新按钮
      const refreshButton = new StatusTreeItem(
        "重新加载关注列表 🔄",
        new vscode.ThemeIcon("refresh"),
        {
          command: "zhihu-fisher.refreshFollowList",
          title: "刷新关注列表",
        },
        TooltipContents.getRefreshFollowTooltip()
      );

      return [sponsorItem, ...treeItems, loadMoreButton, refreshButton];
    }

    return [
      sponsorItem,
      new StatusTreeItem(
        "获取关注失败，点击刷新按钮重试",
        new vscode.ThemeIcon("error"),
        {
          command: "zhihu-fisher.refreshFollowList",
          title: "刷新知乎关注",
        },
        TooltipContents.getRetryTooltip("follow")
      ),
    ];
  }
}
