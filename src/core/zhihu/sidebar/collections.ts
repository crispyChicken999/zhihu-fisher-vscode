import axios from "axios";
import * as vscode from "vscode";
import * as cheerio from "cheerio";
import { Store } from "../../stores";
import { CookieManager } from "../cookie";
import { PuppeteerManager } from "../puppeteer";
import {
  StatusTreeItem,
  TreeItem,
  CollectionFolder,
  CollectionItem,
  ZhihuUser,
} from "../../types";

/**
 * 收藏夹树节点
 */
export class CollectionTreeItem extends vscode.TreeItem {
  constructor(
    public readonly collectionFolder: CollectionFolder,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly itemType:
      | "folder"
      | "item"
      | "loadMore"
      | "noMore" = "folder"
  ) {
    // 构建标题，包含总数和已加载数量
    let title = collectionFolder.title;
    if (itemType === "folder" && collectionFolder.totalCount !== undefined) {
      const loadedCount = collectionFolder.items.length;
      const totalCount = collectionFolder.totalCount;
      title = `${collectionFolder.title} (${loadedCount}/${totalCount})`;
    }

    super(title, collapsibleState);

    // 使用固定ID以支持状态记忆
    this.id = `collection-${collectionFolder.id}`;
    this.tooltip = collectionFolder.description || collectionFolder.title;

    if (itemType === "folder") {
      this.iconPath = new vscode.ThemeIcon("folder");
      this.contextValue = "collectionFolder";

      // 添加收藏夹的右键菜单
      this.resourceUri = vscode.Uri.parse(`collection:${collectionFolder.id}`);
    } else if (itemType === "loadMore") {
      this.iconPath = new vscode.ThemeIcon("arrow-down");
      this.contextValue = "loadMore";
      this.command = {
        command: "zhihu-fisher.loadMoreCollectionItems",
        title: "加载更多",
        arguments: [collectionFolder],
      };
    } else if (itemType === "noMore") {
      this.iconPath = new vscode.ThemeIcon("circle-slash");
      this.contextValue = "noMore";
    }
  }
}

/**
 * 收藏项树节点
 */
export class CollectionItemTreeItem extends vscode.TreeItem {
  constructor(
    public readonly collectionItem: CollectionItem,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode
      .TreeItemCollapsibleState.None
  ) {
    super(collectionItem.title, collapsibleState);

    // 使用收藏项类型和ID的组合来确保唯一性
    this.id = `collection-item-${collectionItem.type}-${
      collectionItem.id
    }-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 获取媒体显示模式配置
    const mediaDisplayMode = vscode.workspace
      .getConfiguration("zhihu-fisher")
      .get<string>("mediaDisplayMode", "normal");
    const shouldShowImage =
      mediaDisplayMode !== "none" && !!collectionItem.thumbnail;

    // 构建更好的tooltip
    const typeMap = {
      article: "文章",
      question: "问题",
      answer: "回答",
    };

    let tooltipContent= '';

    if (collectionItem.question && collectionItem.type === "answer") {
      tooltipContent += `**问题**: ${collectionItem.question.title}`;
    }

    tooltipContent+= ` **[${typeMap[collectionItem.type]}]** \n`

    if (collectionItem.author) {
      tooltipContent += `**作者**: ${collectionItem.author.name}\n`;
    }

    tooltipContent += '\n ___ \n\n'

    tooltipContent += `\n${collectionItem.excerpt}`;

    if (collectionItem.created) {
      const date = new Date(collectionItem.created);
      tooltipContent += `\n\n**收藏时间**: ${date.toLocaleString()}`;
    }

    this.tooltip = new vscode.MarkdownString(tooltipContent);

    // 根据内容类型设置图标
    switch (collectionItem.type) {
      case "article":
        this.iconPath = new vscode.ThemeIcon("file-text");
        break;
      case "question":
        this.iconPath = new vscode.ThemeIcon("question");
        break;
      case "answer":
        this.iconPath = new vscode.ThemeIcon("comment");
        break;
    }

    this.contextValue = shouldShowImage
      ? "collectionItemWithImage"
      : "collectionItem";
    this.command = {
      command: "zhihu-fisher.openCollectionItem",
      title: "打开内容",
      arguments: [collectionItem],
    };

    // 如果有图片且需要显示，设置描述以显示图片
    if (shouldShowImage) {
      this.description = `${typeMap[collectionItem.type]}`;
    } else {
      this.description = typeMap[collectionItem.type];
    }
  }
}

/**
 * 侧边栏的知乎收藏-树数据提供者
 */
export class sidebarCollectionsDataProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    vscode.TreeItem | undefined | null | void
  > = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    vscode.TreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private loadingStatusItem: vscode.StatusBarItem;
  private treeView?: vscode.TreeView<vscode.TreeItem>;
  // 记住展开状态
  private expandedStates: Map<string, boolean> = new Map();

  constructor() {
    this.loadingStatusItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this.loadingStatusItem.text = "$(sync~spin) 加载收藏夹中...";

    // 不在构造函数中自动加载，改为按需加载
  }

  // 设置 TreeView 引用
  setTreeView(treeView: vscode.TreeView<vscode.TreeItem>): void {
    this.treeView = treeView;

    // 监听展开状态变化
    treeView.onDidExpandElement((e) => {
      if (e.element.id) {
        this.expandedStates.set(e.element.id, true);
      }
    });

    treeView.onDidCollapseElement((e) => {
      if (e.element.id) {
        this.expandedStates.set(e.element.id, false);
      }
    });
  }

  // 更新侧边栏标题
  private updateTitle(): void {
    if (this.treeView) {
      const isLoading = Store.Zhihu.collections.isLoading;
      const myCollections = Store.Zhihu.collections.myCollections;
      const followingCollections = Store.Zhihu.collections.followingCollections;
      const totalCount = myCollections.length + followingCollections.length;

      if (isLoading) {
        this.treeView.title = "收藏(加载中...)";
      } else if (totalCount > 0) {
        this.treeView.title = `收藏(${totalCount})`;
      } else {
        this.treeView.title = "收藏";
      }
    }
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
    if (!element) {
      // 根级别：检查是否已加载收藏夹，如果没有则显示加载按钮
      if (
        Store.Zhihu.collections.myCollections.length === 0 &&
        Store.Zhihu.collections.followingCollections.length === 0 &&
        !Store.Zhihu.collections.isLoading
      ) {
        // 显示加载按钮
        const loadButton = new vscode.TreeItem(
          "点击加载收藏夹",
          vscode.TreeItemCollapsibleState.None
        );
        loadButton.id = `loadCollections-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        loadButton.contextValue = "loadCollections";
        loadButton.iconPath = new vscode.ThemeIcon("sync");
        loadButton.command = {
          command: "zhihu-fisher.refreshCollections",
          title: "加载收藏夹",
        };
        return Promise.resolve([loadButton]);
      }
      return Promise.resolve(this.getRootItems());
    }

    if (element.contextValue === "myCollectionsRoot") {
      // 我创建的收藏夹列表
      return Promise.resolve(this.getMyCollectionItems());
    }

    if (element.contextValue === "followingCollectionsRoot") {
      // 我关注的收藏夹列表
      return Promise.resolve(this.getFollowingCollectionItems());
    }

    if (element.contextValue === "collectionFolder") {
      // 收藏夹内容
      const collectionItem = element as CollectionTreeItem;
      // 如果还没有加载过，自动加载第一页
      if (
        !collectionItem.collectionFolder.isLoaded &&
        !collectionItem.collectionFolder.isLoading
      ) {
        this.loadCollectionItems(collectionItem.collectionFolder.id);
      }
      return Promise.resolve(
        this.getCollectionFolderItems(collectionItem.collectionFolder)
      );
    }

    return Promise.resolve([]);
  }

  private getRootItems(): vscode.TreeItem[] {
    const items: vscode.TreeItem[] = [];

    if (Store.Zhihu.collections.isLoading) {
      return [
        new StatusTreeItem(
          "加载收藏夹中...",
          new vscode.ThemeIcon("sync~spin")
        ),
      ];
    }

    // 我创建的收藏
    const myCollectionsItem = new vscode.TreeItem(
      "我创建的收藏夹",
      this.expandedStates.get("myCollectionsRoot") !== false
        ? vscode.TreeItemCollapsibleState.Expanded
        : vscode.TreeItemCollapsibleState.Collapsed
    );
    myCollectionsItem.id = "myCollectionsRoot";
    myCollectionsItem.contextValue = "myCollectionsRoot";
    myCollectionsItem.iconPath = new vscode.ThemeIcon("folder");
    myCollectionsItem.tooltip = "我创建的收藏夹";
    items.push(myCollectionsItem);

    // 我关注的收藏
    const followingCollectionsItem = new vscode.TreeItem(
      "我关注的收藏夹",
      this.expandedStates.get("followingCollectionsRoot") !== false
        ? vscode.TreeItemCollapsibleState.Expanded
        : vscode.TreeItemCollapsibleState.Collapsed
    );
    followingCollectionsItem.id = "followingCollectionsRoot";
    followingCollectionsItem.contextValue = "followingCollectionsRoot";
    followingCollectionsItem.iconPath = new vscode.ThemeIcon("folder");
    followingCollectionsItem.tooltip = "我关注的收藏夹";
    items.push(followingCollectionsItem);

    return items;
  }

  private getMyCollectionItems(): vscode.TreeItem[] {
    const collections = Store.Zhihu.collections.myCollections;
    if (collections.length === 0) {
      return [new StatusTreeItem("暂无收藏夹", new vscode.ThemeIcon("inbox"))];
    }

    const items: vscode.TreeItem[] = collections.map((collection) => {
      const collectionState = this.expandedStates.get(
        `collection-${collection.id}`
      );
      const collapsibleState =
        collectionState === true
          ? vscode.TreeItemCollapsibleState.Expanded
          : vscode.TreeItemCollapsibleState.Collapsed;

      return new CollectionTreeItem(collection, collapsibleState);
    });

    return items;
  }

  private getFollowingCollectionItems(): vscode.TreeItem[] {
    const collections = Store.Zhihu.collections.followingCollections;
    if (collections.length === 0) {
      return [
        new StatusTreeItem("暂无关注的收藏夹", new vscode.ThemeIcon("inbox")),
      ];
    }

    const items: vscode.TreeItem[] = collections.map((collection) => {
      const collectionState = this.expandedStates.get(
        `collection-${collection.id}`
      );
      const collapsibleState =
        collectionState === true
          ? vscode.TreeItemCollapsibleState.Expanded
          : vscode.TreeItemCollapsibleState.Collapsed;

      return new CollectionTreeItem(collection, collapsibleState);
    });

    return items;
  }

  private getCollectionFolderItems(
    folder: CollectionFolder
  ): vscode.TreeItem[] {
    const items: vscode.TreeItem[] = [];

    if (folder.isLoading) {
      return [
        new StatusTreeItem("加载中...", new vscode.ThemeIcon("sync~spin")),
      ];
    }

    // 如果没有内容且没有加载过，显示空状态
    if (folder.items.length === 0 && !folder.isLoaded) {
      return [
        new StatusTreeItem("点击展开加载内容", new vscode.ThemeIcon("inbox")),
      ];
    }

    // 添加收藏项
    folder.items.forEach((item) => {
      items.push(new CollectionItemTreeItem(item));
    });

    // 判断是否显示加载更多按钮
    // 如果已经有总数信息，根据已加载数量和总数判断
    if (folder.totalCount !== undefined) {
      if (folder.items.length < folder.totalCount) {
        const loadMoreItem = new vscode.TreeItem(
          "加载更多",
          vscode.TreeItemCollapsibleState.None
        );
        loadMoreItem.id = `loadMore-${folder.id}-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        loadMoreItem.contextValue = "loadMore";
        loadMoreItem.iconPath = new vscode.ThemeIcon("arrow-down");
        loadMoreItem.command = {
          command: "zhihu-fisher.loadMoreCollectionItems",
          title: "加载更多",
          arguments: [folder],
        };
        items.push(loadMoreItem);
      }
    } else {
      // 如果没有总数信息，按照原逻辑：如果是20的倍数就显示加载更多
      if (folder.items.length > 0 && folder.items.length % 20 === 0) {
        const loadMoreItem = new vscode.TreeItem(
          "加载更多",
          vscode.TreeItemCollapsibleState.None
        );
        loadMoreItem.id = `loadMore-${folder.id}-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        loadMoreItem.contextValue = "loadMore";
        loadMoreItem.iconPath = new vscode.ThemeIcon("arrow-down");
        loadMoreItem.command = {
          command: "zhihu-fisher.loadMoreCollectionItems",
          title: "加载更多",
          arguments: [folder],
        };
        items.push(loadMoreItem);
      }
    }

    return items;
  }

  /**
   * 刷新收藏夹列表
   */
  refresh(): void {
    this.loadCollections();
  }

  /**
   * 加载收藏夹数据
   */
  private async loadCollections(): Promise<void> {
    try {
      Store.Zhihu.collections.isLoading = true;
      this.updateTitle();
      this.loadingStatusItem.show();
      this._onDidChangeTreeData.fire();

      // 检查是否有cookie
      const cookie = CookieManager.getCookie();
      if (!cookie) {
        vscode.window.showWarningMessage("请先设置知乎Cookie才能获取收藏夹");
        return;
      }

      // 检查是否可以创建浏览器
      const canCreateBrowser = await PuppeteerManager.canCreateBrowser();
      if (!canCreateBrowser) {
        vscode.window.showErrorMessage(
          "无法创建浏览器实例，请检查浏览器安装情况"
        );
        return;
      }

      // 获取用户信息
      const userInfo = await this.getUserInfo();
      if (!userInfo) {
        vscode.window.showErrorMessage(
          "无法获取用户信息，请检查Cookie是否有效"
        );
        return;
      }

      Store.Zhihu.collections.userInfo = userInfo;

      // 获取收藏夹列表
      await this.getCollectionFolders(userInfo.url_token);

      const totalCount =
        Store.Zhihu.collections.myCollections.length +
        Store.Zhihu.collections.followingCollections.length;
      if (totalCount > 0) {
        vscode.window.showInformationMessage(`成功加载 ${totalCount} 个收藏夹`);
      }
    } catch (error) {
      console.error("加载收藏夹失败:", error);
      vscode.window.showErrorMessage(
        `加载收藏夹失败: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      Store.Zhihu.collections.isLoading = false;
      this.updateTitle();
      this.loadingStatusItem.hide();
      this._onDidChangeTreeData.fire();
    }
  }

  /**
   * 获取用户信息
   */
  private async getUserInfo(): Promise<ZhihuUser | null> {
    try {
      const cookie = CookieManager.getCookie();
      const response = await axios.get(
        "https://www.zhihu.com/api/v4/me?include=is_realname",
        {
          headers: {
            Cookie: cookie,
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        }
      );

      return response.data as ZhihuUser;
    } catch (error) {
      console.error("获取用户信息失败:", error);
      return null;
    }
  }

  /**
   * 通过爬虫获取收藏夹列表
   */
  private async getCollectionFolders(userToken: string): Promise<void> {
    let page;

    try {
      console.log("开始获取收藏夹列表...");
      page = await PuppeteerManager.createPage();

      // 获取我创建的收藏夹
      console.log("获取我创建的收藏夹...");
      try {
        await page.goto(
          `https://www.zhihu.com/people/${userToken}/collections`,
          {
            waitUntil: "domcontentloaded",
            timeout: 15000,
          }
        );

        // 等待页面稳定
        await PuppeteerManager.delay(2000);

        // 尝试滚动加载更多内容
        try {
          await PuppeteerManager.simulateHumanScroll(page);
          await PuppeteerManager.delay(1000);
        } catch (scrollError) {
          console.log("滚动时出现错误，继续执行:", scrollError);
        }

        const myCollectionsHtml = await page.content();
        const myCollections = this.parseMyCollections(myCollectionsHtml);
        Store.Zhihu.collections.myCollections = myCollections;
        console.log(`成功获取 ${myCollections.length} 个我创建的收藏夹`);
      } catch (error) {
        console.error("获取我创建的收藏夹失败:", error);
        Store.Zhihu.collections.myCollections = [];
      }

      // 获取我关注的收藏夹
      console.log("获取我关注的收藏夹...");
      try {
        await page.goto(
          `https://www.zhihu.com/people/${userToken}/collections/following`,
          {
            waitUntil: "domcontentloaded",
            timeout: 15000,
          }
        );

        // 等待页面稳定
        await PuppeteerManager.delay(2000);

        // 尝试滚动加载更多内容
        try {
          await PuppeteerManager.simulateHumanScroll(page);
          await PuppeteerManager.delay(1000);
        } catch (scrollError) {
          console.log("滚动时出现错误，继续执行:", scrollError);
        }

        const followingCollectionsHtml = await page.content();
        const followingCollections = this.parseFollowingCollections(
          followingCollectionsHtml
        );
        Store.Zhihu.collections.followingCollections = followingCollections;
        console.log(`成功获取 ${followingCollections.length} 个我关注的收藏夹`);
      } catch (error) {
        console.error("获取我关注的收藏夹失败:", error);
        Store.Zhihu.collections.followingCollections = [];
      }
    } catch (error) {
      console.error("获取收藏夹列表失败:", error);
      throw error;
    } finally {
      if (page) {
        try {
          await page.close();
        } catch (closeError) {
          console.error("关闭页面时出错:", closeError);
        }
      }
    }
  }

  /**
   * 解析我创建的收藏夹
   */
  private parseMyCollections(html: string): CollectionFolder[] {
    const $ = cheerio.load(html);
    const collections: CollectionFolder[] = [];

    // 尝试多种选择器，以适应不同的页面结构
    const selectors = [
      ".SelfCollectionItem-innerContainer",
      ".CollectionItem",
      '[data-zop="collection"]',
      ".Collection-Item",
    ];

    for (const selector of selectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`使用选择器 ${selector} 找到 ${elements.length} 个收藏夹`);

        elements.each((_, element) => {
          try {
            // 尝试多种方式获取标题和链接
            let titleElement = $(element).find(".SelfCollectionItem-title");
            if (titleElement.length === 0) {
              titleElement = $(element).find('a[href*="/collection/"]');
            }
            if (titleElement.length === 0) {
              titleElement = $(element).find("a").first();
            }

            const href = titleElement.attr("href");
            const title = titleElement.text().trim();

            if (href && title && href.includes("/collection/")) {
              const collectionId = href.split("/").pop() || "";

              if (
                collectionId &&
                !collections.find((c) => c.id === collectionId)
              ) {
                collections.push({
                  id: collectionId,
                  title: title,
                  url: href.startsWith("http")
                    ? href
                    : `https://www.zhihu.com${href}`,
                  items: [],
                  isLoaded: false,
                  currentOffset: 0,
                  hasMore: true,
                  totalCount: 0,
                  isLoading: false,
                  type: "created",
                });
              }
            }
          } catch (parseError) {
            console.error("解析单个收藏夹时出错:", parseError);
          }
        });

        if (collections.length > 0) {
          break; // 如果找到了收藏夹，就不再尝试其他选择器
        }
      }
    }

    if (collections.length === 0) {
      console.log("未找到我创建的收藏夹，尝试在页面中查找相关元素...");
      // 输出页面的相关部分用于调试
      const debugContent = $("body").html();
      if (debugContent) {
        console.log(
          "页面包含collection关键字:",
          debugContent.includes("collection")
        );
        console.log("页面包含收藏关键字:", debugContent.includes("收藏"));
      }
    }

    return collections;
  }

  /**
   * 解析我关注的收藏夹
   */
  private parseFollowingCollections(html: string): CollectionFolder[] {
    const $ = cheerio.load(html);
    const collections: CollectionFolder[] = [];

    // 尝试多种选择器
    const selectors = [
      ".FollowingCollectionItem-innerContainer",
      ".CollectionItem",
      '[data-zop="collection"]',
      ".Collection-Item",
    ];

    for (const selector of selectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(
          `使用选择器 ${selector} 找到 ${elements.length} 个关注的收藏夹`
        );

        elements.each((_, element) => {
          try {
            // 尝试多种方式获取标题和链接
            let titleElement = $(element).find(
              ".FollowingCollectionItem-title"
            );
            if (titleElement.length === 0) {
              titleElement = $(element).find('a[href*="/collection/"]');
            }
            if (titleElement.length === 0) {
              titleElement = $(element).find("a").first();
            }

            const href = titleElement.attr("href");
            const title = titleElement.text().trim();

            // 获取作者信息
            const authorElement = $(element).find(".UserLink-link");
            const authorName = authorElement.text().trim();
            const authorUrl = authorElement.attr("href");
            const avatarElement = $(element).find(".Avatar");
            const avatarUrl = avatarElement.attr("src");

            if (href && title && href.includes("/collection/")) {
              const collectionId = href.split("/").pop() || "";

              if (
                collectionId &&
                !collections.find((c) => c.id === collectionId)
              ) {
                collections.push({
                  id: collectionId,
                  title: title,
                  url: href.startsWith("http")
                    ? href
                    : `https://www.zhihu.com${href}`,
                  creator:
                    authorName && authorUrl
                      ? {
                          name: authorName,
                          avatar_url: avatarUrl || "",
                          url_token: authorUrl.split("/").pop() || "",
                        }
                      : undefined,
                  items: [],
                  isLoaded: false,
                  currentOffset: 0,
                  hasMore: true,
                  totalCount: 0,
                  isLoading: false,
                  type: "following",
                });
              }
            }
          } catch (parseError) {
            console.error("解析单个关注收藏夹时出错:", parseError);
          }
        });

        if (collections.length > 0) {
          break;
        }
      }
    }

    if (collections.length === 0) {
      console.log("未找到我关注的收藏夹，尝试在页面中查找相关元素...");
      // 输出页面的相关部分用于调试
      const debugContent = $("body").html();
      if (debugContent) {
        console.log(
          "页面包含collection关键字:",
          debugContent.includes("collection")
        );
        console.log("页面包含关注关键字:", debugContent.includes("关注"));
      }
    }

    return collections;
  }

  /**
   * 加载收藏夹内容
   */
  async loadCollectionItems(collectionId: string): Promise<void> {
    const collection = this.findCollection(collectionId);
    if (!collection || collection.isLoading) {
      return;
    }

    try {
      collection.isLoading = true;
      this._onDidChangeTreeData.fire();

      const result = await this.fetchCollectionItems(
        collectionId,
        collection.currentOffset
      );
      const items = result.items;
      const totalCount = result.totalCount;

      // 设置总数（如果是第一次加载）
      if (collection.currentOffset === 0) {
        collection.totalCount = totalCount;
      }

      if (items.length > 0) {
        collection.items.push(...items);
        collection.currentOffset += items.length;

        // 如果返回的项目数量小于限制，说明没有更多了
        if (items.length < 20) {
          collection.hasMore = false;
        }
      } else {
        collection.hasMore = false;
      }

      collection.isLoaded = true;
    } catch (error) {
      console.error("加载收藏夹内容失败:", error);
      vscode.window.showErrorMessage(
        `加载收藏夹内容失败: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      collection.isLoading = false;
      this._onDidChangeTreeData.fire();
    }
  }

  /**
   * 通过API获取收藏夹内容
   */
  private async fetchCollectionItems(
    collectionId: string,
    offset: number = 0
  ): Promise<{ items: CollectionItem[]; totalCount: number }> {
    try {
      const cookie = CookieManager.getCookie();
      const response = await axios.get(
        `https://www.zhihu.com/api/v4/collections/${collectionId}/items?offset=${offset}&limit=20`,
        {
          headers: {
            Cookie: cookie,
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        }
      );

      const items: CollectionItem[] = [];
      const data = response.data.data || [];
      const totalCount = response.data.paging?.totals || 0;

      for (const item of data) {
        const content = item.content;
        if (!content) continue;

        const collectionItem: CollectionItem = {
          id: content.id || item.id,
          type: this.getContentType(content),
          url: content.url || "",
          title: content.title || content.question?.title || "",
          excerpt: content.excerpt || "",
          author: content.author
            ? {
                name: content.author.name || "",
                avatar_url: content.author.avatar_url || "",
                url_token: content.author.url_token || "",
              }
            : undefined,
          question: content.question
            ? {
                title: content.question.title || "",
                url: content.question.url || "",
                id: content.question.id || "",
              }
            : undefined,
          created: item.created || "",
          thumbnail: content.thumbnail || "",
        };

        items.push(collectionItem);
      }

      return { items, totalCount };
    } catch (error) {
      console.error("获取收藏夹内容失败:", error);
      return { items: [], totalCount: 0 };
    }
  }

  /**
   * 获取内容类型
   */
  private getContentType(content: any): "answer" | "article" | "question" {
    if (content.type === "answer") {
      return "answer";
    } else if (content.type === "article") {
      return "article";
    } else if (content.type === "question") {
      return "question";
    }
    return "article"; // 默认为文章
  }

  /**
   * 查找收藏夹
   */
  private findCollection(collectionId: string): CollectionFolder | null {
    const allCollections = [
      ...Store.Zhihu.collections.myCollections,
      ...Store.Zhihu.collections.followingCollections,
    ];

    return allCollections.find((c) => c.id === collectionId) || null;
  }

  /**
   * 加载更多收藏项
   */
  async loadMoreCollectionItems(collection: CollectionFolder): Promise<void> {
    await this.loadCollectionItems(collection.id);
  }
}
