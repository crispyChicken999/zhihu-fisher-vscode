import * as vscode from "vscode";
import * as Puppeteer from "puppeteer";
import { Store } from "../../stores";
import { CookieManager } from "../cookie";
import { PuppeteerManager } from "../puppeteer";
import { StatusTreeItem, TreeItem, LinkItem } from "../../types";

/**
 * 侧边栏的知乎搜索-树数据提供者
 * 提供知乎搜索的数据，用于在侧边栏的树视图中显示
 */
export class sidebarSearchListDataProvider
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
    this.loadingStatusItem.text = "$(sync~spin) 加载知乎搜索结果中...";
  }

  /**
   * @deprecated 触发刷新搜索结果，用reset()代替
   */
  refresh(): void {
    console.log("触发知乎搜索结果刷新...");
    this.searchContent("");
  }

  // 重置搜索状态
  reset(): void {
    console.log("重置搜索列表状态");
    Store.Zhihu.search.list = []; // 清空搜索结果
    Store.Zhihu.search.isLoading = false; // 重置加载状态
    this.updateTitle(); // 重置时更新标题
    this._onDidChangeTreeData.fire(); // 触发更新UI
  }

  // 仅刷新视图显示（不重新加载数据）
  refreshView(): void {
    console.log("刷新搜索视图显示...");
    this._onDidChangeTreeData.fire();
  }

  // 检查浏览器是否可用
  private async isBrowserAvaliable() {
    this.canCreateBrowser = await PuppeteerManager.canCreateBrowser();
  }

  // 执行搜索
  async searchContent(query: string): Promise<void> {
    // 看看能不能创建浏览器实例，不能则认为加载不出搜索结果
    this.canCreateBrowser = await PuppeteerManager.canCreateBrowser();
    if (!this.canCreateBrowser) {
      console.log("无法创建浏览器实例，获取搜索结果失败");
      Store.Zhihu.search.isLoading = false; // 重置加载状态
      Store.Zhihu.search.list = []; // 清空搜索结果
      this.updateTitle(); // 更新标题
      vscode.window.showErrorMessage(
        "无法创建浏览器实例，获取搜索结果失败，请检查浏览器配置情况。"
      );
      this._onDidChangeTreeData.fire(); // 触发更新UI，显示加载状态
      return;
    }

    // 避免重复加载
    if (Store.Zhihu.search.isLoading) {
      console.log("正在加载中搜索结果，请稍候...");
      vscode.window.showInformationMessage("正在加载搜索结果中，请稍候...");
      return;
    }

    try {
      Store.Zhihu.search.isLoading = true; // 设置加载状态
      this.loadingStatusItem.show();
      this.updateTitle(); // 开始加载时更新标题为加载中
      this._onDidChangeTreeData.fire(); // 触发更新UI，显示加载状态

      if (query) {
        await this.search(query);
      }
      const list = Store.Zhihu.search.list;
      console.log(`搜索完成，获取到${list.length}个搜索结果`);

      Store.Zhihu.search.isLoading = false; // 重置加载状态
      this.loadingStatusItem.hide();
      this.updateTitle(); // 搜索完成后更新标题显示条数
      this._onDidChangeTreeData.fire(); // 再次触发更新UI，显示搜索结果

      if (list.length > 0) {
        vscode.window.showInformationMessage(
          `搜索完成，共找到${list.length}条相关内容`
        );
      } else {
        if (query) {
          vscode.window.showInformationMessage(
            `搜索完成，但没有找到与"${query}"相关的内容`
          );
        }
      }
    } catch (error) {
      Store.Zhihu.search.isLoading = false;
      this.loadingStatusItem.hide();
      this.updateTitle(); // 出错时也要更新标题
      this._onDidChangeTreeData.fire(); // 触发更新UI，显示错误状态

      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("知乎搜索失败:", errorMsg);
      vscode.window.showErrorMessage(`知乎搜索失败: ${errorMsg}`);
    }
  }

  /**
   * 执行知乎搜索
   * @param query 搜索关键词
   * @returns 搜索结果列表
   */
  async search(query: string): Promise<LinkItem[]> {
    const isCookieSet = CookieManager.isCookieSet();
    if (!isCookieSet) {
      CookieManager.promptForNewCookie("需要知乎Cookie才能搜索内容，请设置");
      throw new Error("需要设置知乎Cookie才能访问");
    }

    console.log(`开始搜索知乎内容: "${query}"`);

    Store.Zhihu.search.isLoading = true; // 设置加载状态
    this.updateTitle(); // 设置加载状态后更新标题
    Store.Zhihu.search.currentQuery = query; // 保存当前搜索词

    // 创建并获取浏览器页面
    const page = await PuppeteerManager.createPage();

    // 构建搜索URL（搜索所有内容类型）
    const searchUrl = `https://www.zhihu.com/search?q=${encodeURIComponent(
      query
    )}&type=content`;

    console.log(`导航到知乎搜索页面: ${searchUrl}`);
    await page.goto(searchUrl, {
      waitUntil: "networkidle0",
      timeout: 60000, // 60秒超时
    });

    PuppeteerManager.setPageInstance("search", page); // 设置页面实例

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

      console.log("开始提取搜索结果内容...");

      // 尝试滚动页面加载更多内容
      await this.scrollToLoadMore(page);

      const searchResults = await this.parseSearchResults(page, query);
      console.log(`成功解析出${searchResults.length}个搜索结果`);
      console.log("搜索结果解析完成，更新Store...");
      Store.Zhihu.search.list = searchResults; // 更新搜索结果列表
      return searchResults;
    } catch (error) {
      console.error("搜索失败:", error);
      // 处理错误
      if (error instanceof Puppeteer.TimeoutError) {
        console.error("页面加载超时，可能是网络问题或知乎反爬虫机制");
      } else {
        console.error("发生错误:", (error as Error).message);
      }
      throw error;
    } finally {
      console.log("关闭知乎搜索页面...");
      await page.close(); // 关闭页面
      // 重置加载状态
      Store.Zhihu.search.isLoading = false;
    }
  }

  /**
   * 解析搜索结果
   * @param page Puppeteer页面实例
   * @param query 搜索关键词
   * @returns 搜索结果列表
   */
  private async parseSearchResults(
    page: Puppeteer.Page,
    query: string
  ): Promise<LinkItem[]> {
    const searchResults = await page.evaluate((searchQuery) => {
      const items: LinkItem[] = [];

      // 查找所有搜索结果条目
      const resultItems = Array.from(document.querySelectorAll(".List-item"));

      if (resultItems.length > 0) {
        console.log(`找到${resultItems.length}个搜索结果项`);

        resultItems.forEach((item, index) => {
          try {
            // 优先尝试解析专栏文章
            const articleResult = parseArticleItem(item, index);
            if (articleResult) {
              // 如果该结果已存在，则跳过
              if (
                items.some(
                  (existingItem) => existingItem.id === articleResult.id
                )
              ) {
                console.log(
                  `搜索结果 #${index + 1} (专栏文章) 已存在，跳过...`
                );
                return;
              }
              items.push(articleResult);
              console.log(
                `成功解析搜索结果 #${index + 1} (专栏文章): ${
                  articleResult.title
                }`
              );
              return;
            }

            // 如果不是专栏文章，尝试解析问题回答
            const questionResult = parseQuestionItem(item, index);
            if (questionResult) {
              // 如果该结果已存在，则跳过
              if (
                items.some(
                  (existingItem) => existingItem.id === questionResult.id
                )
              ) {
                console.log(
                  `搜索结果 #${index + 1} (问题回答) 已存在，跳过...`
                );
                return;
              }
              items.push(questionResult);
              console.log(
                `成功解析搜索结果 #${index + 1} (问题回答): ${
                  questionResult.title
                }`
              );
              return;
            }

            console.log(`搜索结果 #${index + 1} 无法识别类型，跳过...`);
          } catch (error) {
            console.error(`解析搜索结果 #${index + 1} 时出错:`, error);
          }
        });

        // 解析专栏文章项的函数（精准解析，针对知乎专栏文章的DOM结构）
        function parseArticleItem(
          item: Element,
          index: number
        ): LinkItem | null {
          try {
            // 方法1：检查是否为专栏文章：查找 ContentItem ArticleItem 和 itemprop="article"
            const articleItem = item.querySelector(
              '.ContentItem.ArticleItem[itemprop="article"]'
            );
            if (articleItem) {
              // 提取标题和链接 - 支持多种URL格式
              let titleLink = articleItem.querySelector(
                '.ContentItem-title a[href*="/p/"]'
              );

              if (!titleLink) {
                // 尝试查找其他可能的链接元素
                titleLink = articleItem.querySelector('a[href*="/p/"]');
              }

              if (titleLink) {
                const url = titleLink.getAttribute("href") || "";
                const title = titleLink.textContent?.trim() || "";

                if (url && title && url.includes("/p/")) {
                  // 确保URL是完整的
                  const fullUrl = url.startsWith("http")
                    ? url
                    : url.startsWith("//")
                    ? `https:${url}`
                    : `https://zhuanlan.zhihu.com${url}`;

                  // 提取文章ID
                  const articleId =
                    fullUrl.split("/p/")[1]?.split("?")[0] || "";
                  const id = `search-article-${articleId}-${index}`;

                  // 提取封面图片
                  const imgElement =
                    articleItem.querySelector(".RichContent-cover img") ||
                    articleItem.querySelector("img");
                  const imgUrl = imgElement?.getAttribute("src") || "";

                  // 提取文章摘要内容
                  const contentElement =
                    articleItem.querySelector(".RichText.ztext") ||
                    articleItem.querySelector(".RichText") ||
                    articleItem.querySelector(".ContentItem-excerpt");
                  let excerpt = "";
                  if (contentElement) {
                    excerpt = contentElement.textContent?.trim() || "";
                    // 清理摘要内容，移除多余的空白字符
                    excerpt = excerpt.replace(/\s+/g, " ").substring(0, 200);
                    if (excerpt.length > 197) {
                      excerpt = excerpt.substring(0, 197) + "...";
                    }
                  }

                  if (!excerpt) {
                    excerpt = "没找到专栏摘要(っ °Д °;)っ";
                  }

                  return {
                    id,
                    url: fullUrl,
                    imgUrl,
                    title,
                    excerpt,
                    type: "article" as const,
                  };
                }
              }
            }

            return null;
          } catch (error) {
            console.error(`解析专栏文章项时出错:`, error);
            return null;
          }
        }

        // 解析问题回答项的函数
        function parseQuestionItem(
          item: Element,
          index: number
        ): LinkItem | null {
          try {
            // 提取问题信息
            const questionMeta = item.querySelector(
              'div[itemprop="zhihu:question"]'
            );
            if (!questionMeta) {
              return null;
            }

            // 提取问题URL和标题
            const urlMeta = questionMeta.querySelector('meta[itemprop="url"]');
            const titleMeta = questionMeta.querySelector(
              'meta[itemprop="name"]'
            );

            if (!urlMeta || !titleMeta) {
              return null;
            }

            // 提取图片
            const imgElement = item.querySelector("img");
            const imgUrl = imgElement?.getAttribute("src") || "";

            const url = (urlMeta as HTMLMetaElement).content || "";
            const title = (titleMeta as HTMLMetaElement).content || "";
            const id = `search-question-${url.split("/").pop()}-${index}`;

            // 提取回答内容摘要
            const contentElement = item.querySelector(".RichText");
            let excerpt = contentElement
              ? `${
                  contentElement.textContent
                    ? contentElement.textContent
                    : "没找到摘要🤔"
                }`
              : "没找到摘要🤔";

            return {
              id,
              url,
              imgUrl,
              title,
              excerpt,
              type: "question" as const,
            };
          } catch (error) {
            console.error(`解析问题回答项时出错:`, error);
            return null;
          }
        }
      } else {
        console.log("未找到搜索结果");
      }

      // 统计搜索结果类型
      const articleCount = items.filter(
        (item) => item.type === "article"
      ).length;
      const questionCount = items.filter(
        (item) => item.type === "question"
      ).length;
      console.log(
        `搜索结果统计: 专栏文章 ${articleCount} 篇, 问题回答 ${questionCount} 个`
      );

      return items;
    }, query);

    return searchResults;
  }

  /**
   * 滚动页面加载更多内容
   * @param page Puppeteer页面实例
   */
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

  /**
   * 清空搜索列表
   */
  clearList(): void {
    console.log("清空搜索列表...");
    Store.Zhihu.search.list = []; // 清空搜索列表
    Store.Zhihu.search.isLoading = false; // 重置加载状态
    Store.Zhihu.search.currentQuery = ""; // 清空当前搜索词
  }

  // 获取树项
  getTreeItem(element: TreeItem): vscode.TreeItem {
    return element;
  }

  // 获取子项
  async getChildren(element?: TreeItem): Promise<TreeItem[]> {
    if (element) {
      return []; // 搜索结果项没有子项
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
          "您设置的自定义浏览器路径无效，请重新设置。\n " +
            "【解决方法】\n" +
            "  点我重新设置~ 如果不想用自定义路径，点我然后直接按ESC即可清空设置。\n " +
            "  清空设置后，插件会尝试使用默认位置的浏览器，如果没安装，会提示你安装。\n" +
            "【注意】\n" +
            "  设置完成后，请重启VSCode。避免出现bug。\n" +
            "  优先级是：自定义路径 > 默认安装路径 \n"
        ),
      ];
    }

    // 检查浏览器是否可用
    await this.isBrowserAvaliable();
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
          "点我配置爬虫浏览器\n " +
            "【原因】\n" +
            "  插件依赖Puppeteer去爬取页面数据，如果没有安装浏览器，或者配置的浏览器不是谷歌原版Chrome浏览器，\n" +
            "  就会导致爬虫无法在后台创建浏览器实例，进而无法爬取数据。\n " +
            "【解决方法】\n" +
            "  点我去配置浏览器，提供两种方式：\n" +
            "  在弹出的窗口中你可以选择安装默认的浏览器，或者选择自定义路径。\n" +
            "【注意】\n" +
            "  设置完成后，请重启VSCode。避免出现bug。\n"
        ),
      ];
    }

    const isCookieSet = CookieManager.isCookieSet();
    if (!isCookieSet) {
      // 如果没有设置cookie，显示需要设置cookie的提示
      return [
        new StatusTreeItem(
          "需要设置知乎Cookie才能搜索内容",
          new vscode.ThemeIcon("key"),
          {
            command: "zhihu-fisher.setCookie",
            title: "设置知乎Cookie",
          },
          "点我设置Cookie\n" +
            "【获取方式】\n" +
            "  去到知乎首页，登陆自己的账号，然后点击F12打开开发者工具\n" +
            "  选择 Network 选项卡，刷新页面，点击一个请求，找到请求头Request Headers，\n" +
            "  里面 Cookie 字段，复制值的所有内容，粘贴到 VSCode 的输入框里面。\n" +
            "【注意】\n" +
            "  设置完成后，请重启VSCode。避免出现bug。\n" +
            "【tips】\n" +
            "  主包主包，我还是看不懂咋办啊TAT？\n" +
            "  打开扩展，搜zhihu fisher，点开来，里面有设置 Cookie 的说明图。"
        ),
      ];
    }

    // 如果正在加载，显示一个加载项
    if (Store.Zhihu.search.isLoading) {
      return [
        new StatusTreeItem(
          `🔍正在知乎搜索【${Store.Zhihu.search.currentQuery}】🔍...`,
          new vscode.ThemeIcon("loading~spin"),
          null,
          "爬虫正在后台加载知乎搜索结果(～￣▽￣)～\n" +
            "模拟滚动加载更多中，请耐心等待...\n" +
            "【注意】\n" +
            "如果长时间没有响应，请确保浏览器正确配置，或者重新搜索~"
        ),
      ];
    }

    const list = Store.Zhihu.search.list;
    const query = Store.Zhihu.search.currentQuery;

    // 如果有搜索结果，直接返回
    if (list && list.length > 0) {
      // 在顶部添加搜索按钮和当前搜索关键词信息
      const searchButtonItem = new StatusTreeItem(
        `🔍点我重新搜索🔍 (～￣▽￣)～ 当前搜索：🔮 ${query} 🔮`,
        new vscode.ThemeIcon("search"),
        {
          command: "zhihu-fisher.searchContent",
          title: "搜索知乎内容",
        },
        "点我输入关键词重新搜索"
      );

      // 创建结果列表树项
      const resultItems = list.map(
        (item) => new TreeItem(item, vscode.TreeItemCollapsibleState.None)
      );

      return [searchButtonItem, ...resultItems];
    }

    // 初始状态，只显示搜索按钮
    return [
      new StatusTreeItem(
        "点我搜索知乎内容",
        new vscode.ThemeIcon("search"),
        {
          command: "zhihu-fisher.searchContent",
          title: "搜索知乎内容",
        },
        "点我点我点我o(*￣▽￣*)o"
      ),
    ];
  }

  // 设置 TreeView 引用
  setTreeView(treeView: vscode.TreeView<TreeItem>): void {
    this.treeView = treeView;
  }

  // 更新侧边栏标题
  private updateTitle(): void {
    if (this.treeView) {
      const isLoading = Store.Zhihu.search.isLoading;
      const list = Store.Zhihu.search.list;

      if (isLoading) {
        this.treeView.title = "搜索(加载中...)";
      } else if (list.length > 0) {
        // 统计不同类型的条数
        const articleCount = list.filter(
          (item) => item.type === "article"
        ).length;
        const questionCount = list.filter(
          (item) => item.type === "question"
        ).length;

        if (articleCount > 0 && questionCount > 0) {
          // 两种类型都有
          this.treeView.title = `搜索(${list.length}条: ${questionCount}条问题 | ${articleCount}篇文章)`;
        } else if (articleCount > 0) {
          // 只有文章
          this.treeView.title = `搜索(${list.length}条: ${articleCount}篇文章)`;
        } else if (questionCount > 0) {
          // 只有问题
          this.treeView.title = `搜索(${list.length}条: ${questionCount}条问题)`;
        } else {
          // 兜底显示
          this.treeView.title = `搜索(${list.length}条)`;
        }
      } else {
        this.treeView.title = "搜索";
      }
    }
  }
}
