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
 * 侧边栏的知乎推荐-树数据提供者
 * 提供知乎推荐的数据，用于在侧边栏的树视图中显示
 */
export class sidebarRecommendListDataProvider
  implements vscode.TreeDataProvider<TreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    TreeItem | undefined | null | void
  > = new vscode.EventEmitter<TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    TreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private loadingStatusItem: vscode.StatusBarItem;
  private canCreateBrowser: boolean = false; // 是否可以创建浏览器实例
  private treeView?: vscode.TreeView<TreeItem>; // TreeView 引用，用于更新标题

  constructor() {
    this.loadingStatusItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this.loadingStatusItem.text = "$(sync~spin) 加载知乎推荐中...";

    // 初始加载
    this.getSideBarRecommendList();
  }

  // 设置 TreeView 引用
  setTreeView(treeView: vscode.TreeView<TreeItem>): void {
    this.treeView = treeView;
  }

  // 更新侧边栏标题
  private updateTitle(): void {
    if (this.treeView) {
      const isLoading = Store.Zhihu.recommend.isLoading;
      const list = Store.Zhihu.recommend.list;

      if (isLoading) {
        this.treeView.title = "推荐(加载中...)";
      } else if (list.length > 0) {
        // 统计问题和文章的数量
        const questionCount = list.filter(
          (item) => item.type === "question" || !item.type
        ).length;
        const articleCount = list.filter(
          (item) => item.type === "article"
        ).length;

        if (questionCount > 0 && articleCount > 0) {
          this.treeView.title = `推荐(${list.length}条: ${questionCount}条问题 | ${articleCount}篇文章)`;
        } else if (questionCount > 0) {
          this.treeView.title = `推荐(${questionCount}条问题)`;
        } else if (articleCount > 0) {
          this.treeView.title = `推荐(${articleCount}条文章)`;
        } else {
          this.treeView.title = `推荐(${list.length}条)`;
        }
      } else {
        this.treeView.title = "推荐";
      }
    }
  }

  // 刷新树视图
  refresh(): void {
    console.log("触发知乎推荐刷新...");
    this.getSideBarRecommendList();
  }

  // 重置推荐列表
  reset(): void {
    console.log("重置知乎推荐列表...");
    Store.Zhihu.recommend.list = []; // 清空推荐列表
    Store.Zhihu.recommend.isLoading = false; // 重置加载状态
    this.updateTitle(); // 更新标题
    this._onDidChangeTreeData.fire(); // 触发更新UI
  }

  // 仅刷新视图显示（不重新加载数据）
  refreshView(): void {
    console.log("刷新推荐视图显示...");
    this._onDidChangeTreeData.fire();
  }

  // 加载推荐列表
  private async getSideBarRecommendList(): Promise<void> {
    // 看看能不能创建浏览器实例，不能则认为加载不出推荐列表
    this.canCreateBrowser = await PuppeteerManager.canCreateBrowser();
    if (!this.canCreateBrowser) {
      console.log("无法创建浏览器实例，推荐加载失败");
      Store.Zhihu.recommend.isLoading = false; // 重置加载状态
      Store.Zhihu.recommend.list = []; // 清空推荐列表
      this.updateTitle(); // 更新标题
      vscode.window.showErrorMessage(
        "无法创建浏览器实例，推荐加载失败，请检查浏览器配置情况。"
      );
      this._onDidChangeTreeData.fire(); // 触发更新UI，显示加载状态
      return;
    }

    // 避免重复加载
    if (Store.Zhihu.recommend.isLoading) {
      console.log("正在加载中推荐，请稍候...");
      vscode.window.showInformationMessage("正在加载中推荐，请稍候...");
      return;
    }
    try {
      this.loadingStatusItem.show();

      console.log("开始加载知乎推荐数据");
      this.updateTitle(); // 开始加载时更新标题为加载中
      this._onDidChangeTreeData.fire(); // 触发更新UI，显示加载状态

      await this.getRecommendList();
      const list = Store.Zhihu.recommend.list;
      console.log(`加载完成，获取到${list.length}个推荐项目`);
      this.loadingStatusItem.hide();
      this.updateTitle(); // 更新标题显示条数
      this._onDidChangeTreeData.fire(); // 再次触发更新UI，显示加载结果

      if (list.length > 0) {
        vscode.window.showInformationMessage(
          `已更新知乎推荐，共${list.length}个推荐话题`
        );
      }
    } catch (error) {
      Store.Zhihu.recommend.isLoading = false;
      this.loadingStatusItem.hide();
      this.updateTitle(); // 出错时也要更新标题
      this._onDidChangeTreeData.fire(); // 触发更新UI，显示错误状态

      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("加载知乎推荐失败:", errorMsg);
      vscode.window.showErrorMessage(`加载知乎推荐失败: ${errorMsg}`);
    }
  }

  // 通过爬虫获取推荐列表
  async getRecommendList() {
    console.log("开始获取知乎首页推荐...");

    Store.Zhihu.recommend.isLoading = true; // 设置加载状态
    this.updateTitle(); // 设置加载状态后更新标题

    const isCookieSet = CookieManager.isCookieSet();
    if (!isCookieSet) {
      CookieManager.promptForNewCookie("需要知乎Cookie才能获取推荐，请设置");
      throw new Error("需要设置知乎Cookie才能访问");
    }

    // 创建并获取浏览器页面
    const page = await PuppeteerManager.createPage();

    console.log("导航到知乎首页...");
    await page.goto("https://www.zhihu.com/", {
      waitUntil: "networkidle0", // "domcontentloaded"
      timeout: 60000, // 60秒超时
    });

    PuppeteerManager.setPageInstance("recommend", page); // 设置页面实例

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
            "需要知乎Cookie才能获取推荐内容，请设置"
          );
          throw new Error("需要设置知乎Cookie才能访问");
        }
      }

      console.log("开始提取推荐内容...");

      // 尝试滚动页面加载更多内容
      await this.scrollToLoadMore(page);

      const recommendList = await this.parseRecommendList(page);
      console.log(`成功解析出${recommendList.length}个推荐项目`);
      console.log("推荐列表解析完成，更新Store...");
      Store.Zhihu.recommend.list = recommendList; // 更新推荐列表
    } catch (error) {
      console.error("获取推荐列表失败:", error);
      // 处理错误
      if (error instanceof Puppeteer.TimeoutError) {
        console.error("页面加载超时，可能是网络问题或知乎反爬虫机制");
      } else {
        console.error("发生错误:", (error as Error).message);
      }
    } finally {
      console.log("关闭知乎首页...");
      await page.close(); // 关闭页面
      // 重置加载状态
      Store.Zhihu.recommend.isLoading = false;
    }
  }

  // 解析推荐列表
  private async parseRecommendList(page: Puppeteer.Page): Promise<LinkItem[]> {
    const recommendList = await page.evaluate(() => {
      const items: LinkItem[] = [];
      const feedItems = Array.from(
        document.querySelectorAll(".TopstoryItem-isRecommend .Feed")
      );

      // 不再过滤，而是分别处理问题和文章
      const questionItems = feedItems.filter((item) => {
        const hasArticleItem = item.querySelector(".ArticleItem");
        const hasAnswerItem = item.querySelector(".AnswerItem");
        // 只保留有AnswerItem且没有ArticleItem的项目（问题）
        return hasAnswerItem && !hasArticleItem;
      });

      const articleItems = feedItems.filter((item) => {
        const hasArticleItem = item.querySelector(".ArticleItem");
        // 只保留有ArticleItem的项目（文章）
        return hasArticleItem;
      });

      console.log(
        `找到${feedItems.length}个Feed项，其中${questionItems.length}个问题项，${articleItems.length}个文章项`
      );

      // 解析问题项
      questionItems.forEach((item, index) => {
        try {
          // imgUrl <meta itemprop="image" content="https://picx.zhimg.com/50/v2-e2024c4c889bdb560c4055ce0aa9d9d8_720w.jpg?source=b6762063">
          const imgElement = item.querySelector('meta[itemprop="image"]');
          const imgUrl = (imgElement as HTMLMetaElement)?.content || "";

          // title <meta itemprop="name" content="长辈的什么行为让你感到窒息？">
          const titleElement = item.querySelector('meta[itemprop="name"]');
          const title = titleElement
            ? (titleElement as HTMLMetaElement).content
            : "未知标题";

          //<meta itemprop="url" content="https://www.zhihu.com/question/608280827">
          const urlElement = item.querySelector('meta[itemprop="url"]');
          const url = urlElement
            ? (urlElement as HTMLMetaElement).content
            : "未知链接";

          // 提取问题ID
          const questionId = url.split("/").pop() || "";

          // 提取回答的完整URL，用于"在浏览器中打开"功能
          let answerUrl = url; // 默认为问题URL
          let contentToken = questionId; // 默认使用问题ID

          const answerElement = item.querySelector(
            ".AnswerItem .ContentItem-title a"
          );
          if (answerElement) {
            const fullAnswerUrl = (answerElement as HTMLAnchorElement).href;
            if (fullAnswerUrl && fullAnswerUrl.includes("/answer/")) {
              answerUrl = fullAnswerUrl; // 使用完整的回答URL
              // 从回答URL中提取回答ID用于收藏API
              const answerIdMatch = fullAnswerUrl.match(/\/answer\/(\d+)/);
              if (answerIdMatch) {
                contentToken = answerIdMatch[1]; // 使用回答ID作为contentToken
              }
            }
          }

          const id =
            `recommend-question-${questionId}` || `recommend-question-${index}`;

          const excerptElement = item.querySelector(".RichContent .RichText");
          const excerpt = excerptElement
            ? `${
                (excerptElement as HTMLMetaElement).textContent
                  ? (excerptElement as HTMLMetaElement).textContent
                  : "🐟无摘要🐟"
              }`
            : "🐟无摘要🐟";

          // 检查是否已存在
          if (items.some((item) => item.id === id)) {
            console.log(`问题项 #${index + 1} 已存在，跳过...`);
            return;
          }

          items.push({
            id,
            url, // 问题URL，用于点击标题时打开
            title,
            imgUrl,
            excerpt,
            type: "question",
            contentToken,
            answerUrl, // 回答URL，用于"在浏览器中打开"
          });
          console.log(
            `成功解析问题项 #${index + 1}: ${title}, answerUrl: ${answerUrl}`
          );
        } catch (error) {
          console.error(`解析问题项 #${index + 1} 时出错:`, error);
        }
      });

      // 解析文章项
      articleItems.forEach((item, index) => {
        try {
          // 文章的结构不同，需要特殊处理
          const articleElement = item.querySelector(".ContentItem.ArticleItem");
          if (!articleElement) {
            return;
          }

          // 文章标题在 h2.ContentItem-title a 中
          const titleElement = articleElement.querySelector(
            "h2.ContentItem-title a"
          );
          const title = titleElement
            ? (titleElement as HTMLAnchorElement).textContent?.trim() ||
              "未知标题"
            : "未知标题";

          // 文章链接在 href 属性中
          const url = titleElement
            ? (titleElement as HTMLAnchorElement).href
            : "未知链接";

          // 文章摘要在 .RichContent .RichText 中
          const excerptElement = articleElement.querySelector(
            ".RichContent .RichText"
          );
          const excerpt = excerptElement
            ? (excerptElement as HTMLElement).textContent?.trim() ||
              "没找到文章摘要"
            : "没找到文章摘要";

          // 文章可能没有图片，或者图片在 meta 标签中
          const imgElement = articleElement.querySelector(
            'meta[itemprop="image"]'
          );
          const imgUrl = (imgElement as HTMLMetaElement)?.content || "";

          // 提取 contentToken，从 URL 中获取文章ID
          const articleId = url.split("/").pop() || "";
          const contentToken = articleId;

          // 对于文章，answerUrl 就是文章本身的URL
          const answerUrl = url;

          const id =
            `recommend-article-${articleId}` || `recommend-article-${index}`;

          // 检查是否已存在
          if (items.some((item) => item.id === id)) {
            console.log(`文章项 #${index + 1} 已存在，跳过...`);
            return;
          }

          items.push({
            id,
            url,
            title,
            imgUrl,
            excerpt,
            type: "article",
            contentToken,
            answerUrl,
          });
          console.log(`成功解析文章项 #${index + 1}: ${title}`);
        } catch (error) {
          console.error(`解析文章项 #${index + 1} 时出错:`, error);
        }
      });

      return items;
    });

    return recommendList;
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
      if (!item.contentToken) {
        vscode.window.showErrorMessage("无法获取内容标识，不能标记为不喜欢");
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
        // 从推荐列表中移除该项目
        const currentList = Store.Zhihu.recommend.list;
        const filteredList = currentList.filter(
          (listItem) => listItem.id !== item.id
        );
        Store.Zhihu.recommend.list = filteredList;

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
      if (!item.contentToken) {
        vscode.window.showErrorMessage(
          "无法获取内容标识，不能标记为不再推荐该作者"
        );
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
        // 从推荐列表中移除该项目
        const currentList = Store.Zhihu.recommend.list;
        const filteredList = currentList.filter(
          (listItem) => listItem.id !== item.id
        );
        Store.Zhihu.recommend.list = filteredList;

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
      if (!item.contentToken) {
        vscode.window.showErrorMessage("无法获取内容标识，不能收藏");
        return;
      }

      // 确定内容类型
      // 对于推荐列表中的"问题"类型，实际上是展示的某个具体回答，所以应该收藏为answer
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

  // 清空推荐列表
  clearList(): void {
    console.log("清空推荐列表...");
    Store.Zhihu.recommend.list = [];
    Store.Zhihu.recommend.isLoading = false;
    this.updateTitle(); // 清空时更新标题
  }

  // 获取树项
  getTreeItem(element: TreeItem): vscode.TreeItem {
    return element;
  }

  // 获取子项
  async getChildren(element?: TreeItem): Promise<TreeItem[]> {
    if (element) {
      return []; // 推荐项没有子项
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
          "需要设置知乎Cookie才能获取推荐",
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
    if (Store.Zhihu.recommend.isLoading) {
      return [
        new StatusTreeItem(
          "正在加载知乎推荐...",
          new vscode.ThemeIcon("loading~spin"),
          null,
          TooltipContents.getRecommendLoadingTooltip()
        ),
      ];
    }
    const list = Store.Zhihu.recommend.list;

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

    // 如果有缓存的推荐项目，直接返回
    if (list.length > 0) {
      const treeItems = list.map(
        (item) => new TreeItem(item, vscode.TreeItemCollapsibleState.None)
      );

      // 在推荐列表底部添加刷新按钮
      const refreshButton = new StatusTreeItem(
        "看完啦？点我刷新推荐列表~ (￣▽￣)ノ",
        new vscode.ThemeIcon("refresh"),
        {
          command: "zhihu-fisher.refreshRecommendList",
          title: "刷新推荐列表",
        },
        TooltipContents.getRefreshRecommendTooltip()
      );

      return [sponsorItem, ...treeItems, refreshButton];
    }

    return [
      new StatusTreeItem(
        "获取推荐失败，点击刷新按钮重试",
        new vscode.ThemeIcon("error"),
        {
          command: "zhihu-fisher.refreshRecommendList",
          title: "刷新知乎推荐",
        },
        TooltipContents.getRetryTooltip('recommend')
      ),
    ];
  }
}
