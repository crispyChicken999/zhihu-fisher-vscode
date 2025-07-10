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
    if (itemType === "folder") {
      const loadedCount = collectionFolder.items.length;
      // 如果有总数信息就显示，没有则显示未知
      const totalCount = collectionFolder.totalCount ?? "?";
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
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const mediaDisplayMode = config.get<string>("mediaDisplayMode", "normal");
    const shouldShowImage =
      mediaDisplayMode !== "none" && !!collectionItem.thumbnail;

    // 构建更好的tooltip
    const typeMap = {
      article: "文章",
      question: "问题",
      answer: "回答",
    };

    // 设置图标：根据配置和缩略图可用性决定
    if (shouldShowImage) {
      try {
        this.iconPath = vscode.Uri.parse(collectionItem.thumbnail!);
      } catch (error) {
        console.warn(`解析缩略图URL失败: ${collectionItem.thumbnail}`, error);
        // 根据内容类型设置默认图标
        switch (collectionItem.type) {
          case "article":
            this.iconPath = new vscode.ThemeIcon("remote-explorer-documentation");
            break;
          case "question":
            this.iconPath = new vscode.ThemeIcon("question");
            break;
          case "answer":
            this.iconPath = new vscode.ThemeIcon("comment");
            break;
        }
      }
    } else {
      // 根据内容类型设置图标
      switch (collectionItem.type) {
        case "article":
          this.iconPath = new vscode.ThemeIcon("remote-explorer-documentation");
          break;
        case "question":
          this.iconPath = new vscode.ThemeIcon("question");
          break;
        case "answer":
          this.iconPath = new vscode.ThemeIcon("comment");
          break;
      }
    }

    // 构建tooltip
    if (shouldShowImage) {
      const markdownTooltip = new vscode.MarkdownString();
      markdownTooltip.supportHtml = true;

      if (collectionItem.question && collectionItem.type === "answer") {
        markdownTooltip.appendMarkdown(
          `#### **问题**: ${collectionItem.question.title}`
        );
      } else if (collectionItem.type === "article") {
        markdownTooltip.appendMarkdown(
          `#### **文章**: ${collectionItem.title}`
        );
      } else if (collectionItem.type === "question") {
        markdownTooltip.appendMarkdown(
          `#### **问题**: ${collectionItem.title}`
        );
      } else {
        markdownTooltip.appendMarkdown(`#### **${collectionItem.title}**`);
      }

      markdownTooltip.appendMarkdown(
        `**[${typeMap[collectionItem.type]}]**\n\n`
      );

      if (collectionItem.author) {
        markdownTooltip.appendMarkdown(
          `**作者**: ${collectionItem.author.name}\n\n`
        );
      }

      markdownTooltip.appendMarkdown("\n ___ \n\n");

      if (collectionItem.excerpt) {
        markdownTooltip.appendMarkdown(`${collectionItem.excerpt}\n\n`);
      }

      // 根据显示模式和缩放比例计算图片宽度
      let imageWidth: number;
      if (mediaDisplayMode === "normal") {
        imageWidth = 220; // 正常模式最大宽度220px
      } else if (mediaDisplayMode === "mini") {
        // 迷你模式：获取用户设置的缩放比例，最大宽度200px
        const miniMediaScale = config.get<number>("miniMediaScale", 50);
        const calculatedWidth = Math.round(200 * (miniMediaScale / 100));
        imageWidth = Math.min(calculatedWidth, 200); // 确保不超过200px
      } else {
        imageWidth = 150;
      }

      markdownTooltip.appendMarkdown(
        `<img src="${collectionItem.thumbnail}" alt="缩略图" width="${imageWidth}" />\n\n`
      );

      if (collectionItem.created) {
        markdownTooltip.appendMarkdown("\n ___ \n\n");

        const date = new Date(collectionItem.created);
        markdownTooltip.appendMarkdown(
          `**收藏时间**: ${date.toLocaleString()}`
        );
      }

      markdownTooltip.supportHtml = true;
      markdownTooltip.isTrusted = true;
      this.tooltip = markdownTooltip;
    } else {
      // 不显示图片时的tooltip
      let tooltipContent = "";

      if (collectionItem.question && collectionItem.type === "answer") {
        tooltipContent += `**问题**: ${collectionItem.question.title}`;
      } else if (collectionItem.type === "article") {
        tooltipContent += `**标题**: ${collectionItem.title}`;
      } else if (collectionItem.type === "question") {
        tooltipContent += `**问题**: ${collectionItem.title}`;
      }

      tooltipContent += `**[${typeMap[collectionItem.type]}]**\n\n`;

      if (collectionItem.author) {
        tooltipContent += `**作者**: ${collectionItem.author.name}\n\n`;
      }

      tooltipContent += "\n ___ \n\n";

      if (collectionItem.excerpt) {
        tooltipContent += `${collectionItem.excerpt}\n\n`;
      }

      if (collectionItem.created) {
        tooltipContent += "\n ___ \n\n";

        const date = new Date(collectionItem.created);
        tooltipContent += `**收藏时间**: ${date.toLocaleString()}`;
      }

      this.tooltip = new vscode.MarkdownString(tooltipContent);
    }

    this.contextValue = shouldShowImage
      ? "collectionItemWithImage"
      : "collectionItem";

    // 为收藏项添加取消收藏的 contextValue，以支持右键菜单
    this.contextValue = `${this.contextValue};removable`;

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
        this.treeView.title = `收藏(${totalCount}个收藏夹)`;
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
      `我创建的收藏夹 (${Store.Zhihu.collections.myCollections.length})`,
      this.expandedStates.get("myCollectionsRoot") !== false
        ? vscode.TreeItemCollapsibleState.Expanded
        : vscode.TreeItemCollapsibleState.Collapsed
    );
    myCollectionsItem.id = "myCollectionsRoot";
    myCollectionsItem.contextValue = "myCollectionsRoot";
    myCollectionsItem.iconPath = new vscode.ThemeIcon("folder");
    myCollectionsItem.tooltip = "我创建的收藏夹";
    myCollectionsItem.resourceUri = vscode.Uri.parse("myCollections:refresh");
    items.push(myCollectionsItem);

    // 我关注的收藏
    const followingCollectionsItem = new vscode.TreeItem(
      `我关注的收藏夹 (${Store.Zhihu.collections.followingCollections.length})`,
      this.expandedStates.get("followingCollectionsRoot") !== false
        ? vscode.TreeItemCollapsibleState.Expanded
        : vscode.TreeItemCollapsibleState.Collapsed
    );
    followingCollectionsItem.id = "followingCollectionsRoot";
    followingCollectionsItem.contextValue = "followingCollectionsRoot";
    followingCollectionsItem.iconPath = new vscode.ThemeIcon("folder");
    followingCollectionsItem.tooltip = "我关注的收藏夹";
    followingCollectionsItem.resourceUri = vscode.Uri.parse(
      "followingCollections:refresh"
    );
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

    // 如果有更多收藏夹可加载，显示加载更多按钮
    const pagination = Store.Zhihu.collections.myCollectionsPagination;
    if (pagination.hasMore && collections.length >= 20) {
      if (pagination.isLoading) {
        items.push(
          new StatusTreeItem("加载中...", new vscode.ThemeIcon("sync~spin"))
        );
      } else {
        const loadMoreItem = new vscode.TreeItem(
          "加载更多收藏夹",
          vscode.TreeItemCollapsibleState.None
        );
        loadMoreItem.id = `loadMoreMyCollections-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        loadMoreItem.contextValue = "loadMoreMyCollections";
        loadMoreItem.iconPath = new vscode.ThemeIcon("arrow-down");
        loadMoreItem.command = {
          command: "zhihu-fisher.loadMoreMyCollections",
          title: "加载更多收藏夹",
          arguments: ["myCollections"],
        };
        items.push(loadMoreItem);
      }
    }

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

    // 如果有更多收藏夹可加载，显示加载更多按钮
    const pagination = Store.Zhihu.collections.followingCollectionsPagination;
    if (pagination.hasMore && collections.length >= 20) {
      if (pagination.isLoading) {
        items.push(
          new StatusTreeItem("加载中...", new vscode.ThemeIcon("sync~spin"))
        );
      } else {
        const loadMoreItem = new vscode.TreeItem(
          "加载更多收藏夹",
          vscode.TreeItemCollapsibleState.None
        );
        loadMoreItem.id = `loadMoreFollowingCollections-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        loadMoreItem.contextValue = "loadMoreFollowingCollections";
        loadMoreItem.iconPath = new vscode.ThemeIcon("arrow-down");
        loadMoreItem.command = {
          command: "zhihu-fisher.loadMoreFollowingCollections",
          title: "加载更多收藏夹",
          arguments: ["followingCollections"],
        };
        items.push(loadMoreItem);
      }
    }

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
   * 仅刷新视图显示（不重新加载数据）
   */
  refreshView(): void {
    console.log("刷新收藏夹视图显示...");
    this._onDidChangeTreeData.fire();
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

      // 重置分页信息
      Store.Zhihu.collections.myCollectionsPagination = {
        currentPage: 1,
        hasMore: true,
        isLoading: false,
      };
      Store.Zhihu.collections.followingCollectionsPagination = {
        currentPage: 1,
        hasMore: true,
        isLoading: false,
      };

      // 获取收藏夹列表
      await this.loadMyCollections(userInfo.url_token);
      await this.loadFollowingCollections(userInfo.url_token);

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

            // 尝试获取收藏夹的总数信息
            let totalCount: number | undefined = undefined;

            // 查找包含数量信息的元素，通常在SelfCollectionItem-actions中
            const actionsElement = $(element).find(
              ".SelfCollectionItem-actions"
            );
            if (actionsElement.length > 0) {
              const actionsText = actionsElement.text().trim();
              // 尝试匹配 "N 条内容" 或 "N条内容" 格式，例如："2025-07-08 更新 · 2 条内容 · 0 人关注"
              const countMatch = actionsText.match(/(\d+)\s*条内容/);
              if (countMatch) {
                totalCount = parseInt(countMatch[1], 10);
                console.log(`解析到收藏夹总数: ${totalCount}`);
              }
            }

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
                  totalCount: totalCount,
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

            // 尝试获取收藏夹的总数信息
            let totalCount: number | undefined = undefined;

            // 查找包含数量信息的元素，对于关注的收藏夹，也尝试查找.SelfCollectionItem-actions
            const actionsElement = $(element).find(
              ".SelfCollectionItem-actions, .FollowingCollectionItem-actions"
            );
            if (actionsElement.length > 0) {
              const actionsText = actionsElement.text().trim();
              // 尝试匹配 "N 条内容" 或 "N条内容" 格式
              const countMatch = actionsText.match(/(\d+)\s*条内容/);
              if (countMatch) {
                totalCount = parseInt(countMatch[1], 10);
                console.log(`解析到关注收藏夹总数: ${totalCount}`);
              }
            }

            // 如果没有找到，尝试其他可能的选择器
            if (totalCount === undefined) {
              const hintElement = $(element).find(
                ".FollowingCollectionItem-hint, .hint, .meta"
              );
              if (hintElement.length > 0) {
                const hintText = hintElement.text().trim();
                const countMatch = hintText.match(/(\d+)\s*条内容/);
                if (countMatch) {
                  totalCount = parseInt(countMatch[1], 10);
                  console.log(`从hint元素解析到关注收藏夹总数: ${totalCount}`);
                }
              }
            }

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
                  totalCount: totalCount,
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

      // 设置总数（如果是第一次加载或者需要更新）
      if (collection.currentOffset === 0) {
        collection.totalCount = totalCount;
      } else if (collection.totalCount !== totalCount) {
        // 动态更新总数，如果API返回的总数和之前不一致
        collection.totalCount = totalCount;
      }

      if (items.length > 0) {
        // 去重：根据收藏时间确保唯一性
        const existingCreatedTimes = new Set(
          collection.items.map((item) => item.created)
        );

        const newItems = items.filter(
          (item) => !existingCreatedTimes.has(item.created)
        );

        if (newItems.length > 0) {
          collection.items.push(...newItems);
          collection.currentOffset += newItems.length;

          // 如果去重后的新项目数量小于返回的数量，说明有重复项
          if (newItems.length < items.length) {
            console.log(
              `去重：过滤掉 ${items.length - newItems.length} 个重复项目`
            );
          }
        }

        // 如果返回的项目数量小于限制，说明没有更多了
        if (items.length < 20) {
          collection.hasMore = false;
        }
      } else {
        collection.hasMore = false;
      }

      // 实际总数校验：如果已加载数量等于或超过API返回的总数，标记为没有更多
      if (
        collection.totalCount !== undefined &&
        collection.items.length >= collection.totalCount
      ) {
        collection.hasMore = false;
        // 如果实际数量和API返回总数不一致，更新为实际数量
        if (collection.items.length !== collection.totalCount) {
          console.log(
            `收藏夹 ${collection.title} 实际数量 ${collection.items.length} 与API返回总数 ${collection.totalCount} 不一致，更新总数`
          );
          collection.totalCount = collection.items.length;
        }
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

        const contentType = this.getContentType(content);

        // 根据内容类型处理缩略图和简介
        let thumbnail = "";
        let excerpt = "";

        if (contentType === "article") {
          // 文章：缩略图为image_url，简介为excerpt_title
          thumbnail = content.image_url || "";
          excerpt = content.excerpt_title || content.excerpt || "";
          console.log(
            `文章收藏项: ${content.title}, 缩略图: ${
              thumbnail ? "有" : "无"
            }, 简介来源: ${content.excerpt_title ? "excerpt_title" : "excerpt"}`
          );
        } else {
          // 问题/回答：缩略图为thumbnail，简介为excerpt
          thumbnail = content.thumbnail || "";
          excerpt = content.excerpt || "";
          console.log(
            `${contentType}收藏项: ${
              content.title || content.question?.title
            }, 缩略图: ${thumbnail ? "有" : "无"}`
          );
        }

        const collectionItem: CollectionItem = {
          id: content.id || item.id,
          type: contentType,
          url: content.url || "",
          title: content.title || content.question?.title || "",
          excerpt: excerpt,
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
          thumbnail: thumbnail,
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
    // 记录加载前的数量
    const previousCount = collection.items.length;

    await this.loadCollectionItems(collection.id);

    // 检查加载后的数量变化
    const newCount = collection.items.length;
    if (newCount === previousCount) {
      // 如果数量没有变化，说明已经没有更多数据了
      collection.hasMore = false;
      // 如果有总数信息，更新为实际数量
      if (
        collection.totalCount === undefined ||
        collection.totalCount > newCount
      ) {
        collection.totalCount = newCount;
        console.log(
          `收藏夹 ${collection.title} 内容：数量未变化，更新总数为 ${newCount} 并设置hasMore为false`
        );
      }
    }
  }

  /**
   * 刷新我创建的收藏夹
   */
  async refreshMyCollections(): Promise<void> {
    try {
      if (!Store.Zhihu.collections.userInfo) {
        vscode.window.showWarningMessage("请先加载收藏夹");
        return;
      }

      const userToken = Store.Zhihu.collections.userInfo.url_token;
      await this.loadMyCollections(userToken);
      this._onDidChangeTreeData.fire();
      vscode.window.showInformationMessage(
        `成功刷新 ${Store.Zhihu.collections.myCollections.length} 个创建的收藏夹`
      );
    } catch (error) {
      console.error("刷新我创建的收藏夹失败:", error);
      vscode.window.showErrorMessage(
        `刷新我创建的收藏夹失败: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * 刷新我关注的收藏夹
   */
  async refreshFollowingCollections(): Promise<void> {
    try {
      if (!Store.Zhihu.collections.userInfo) {
        vscode.window.showWarningMessage("请先加载收藏夹");
        return;
      }

      const userToken = Store.Zhihu.collections.userInfo.url_token;
      await this.loadFollowingCollections(userToken);
      this._onDidChangeTreeData.fire();
      vscode.window.showInformationMessage(
        `成功刷新 ${Store.Zhihu.collections.followingCollections.length} 个关注的收藏夹`
      );
    } catch (error) {
      console.error("刷新我关注的收藏夹失败:", error);
      vscode.window.showErrorMessage(
        `刷新我关注的收藏夹失败: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * 单独加载我创建的收藏夹
   */
  private async loadMyCollections(
    userToken: string,
    page: number = 1
  ): Promise<void> {
    let puppeteerPage;
    try {
      console.log(`开始获取我创建的收藏夹 (第${page}页)...`);
      puppeteerPage = await PuppeteerManager.createPage();

      const url =
        page === 1
          ? `https://www.zhihu.com/people/${userToken}/collections`
          : `https://www.zhihu.com/people/${userToken}/collections?page=${page}`;

      await puppeteerPage.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });

      // 等待页面稳定
      await PuppeteerManager.delay(2000);

      // 尝试滚动加载更多内容
      try {
        await PuppeteerManager.simulateHumanScroll(puppeteerPage);
        await PuppeteerManager.delay(1000);
      } catch (scrollError) {
        console.log("滚动时出现错误，继续执行:", scrollError);
      }

      const myCollectionsHtml = await puppeteerPage.content();
      const newCollections = this.parseMyCollections(myCollectionsHtml);

      if (page === 1) {
        // 第一页，替换现有数据
        Store.Zhihu.collections.myCollections = newCollections;
        Store.Zhihu.collections.myCollectionsPagination.currentPage = 1;
      } else {
        // 后续页面，追加数据
        const existingIds = new Set(
          Store.Zhihu.collections.myCollections.map((c) => c.id)
        );
        const filteredCollections = newCollections.filter(
          (c) => !existingIds.has(c.id)
        );
        Store.Zhihu.collections.myCollections.push(...filteredCollections);
        Store.Zhihu.collections.myCollectionsPagination.currentPage = page;
      }

      // 判断是否还有更多页面：如果返回的收藏夹数量少于20，说明没有更多了
      Store.Zhihu.collections.myCollectionsPagination.hasMore =
        newCollections.length >= 20;

      console.log(
        `成功获取 ${newCollections.length} 个我创建的收藏夹 (第${page}页)`
      );
    } catch (error) {
      console.error("获取我创建的收藏夹失败:", error);
      throw error;
    } finally {
      if (puppeteerPage) {
        try {
          await puppeteerPage.close();
        } catch (closeError) {
          console.error("关闭页面时出错:", closeError);
        }
      }
    }
  }

  /**
   * 单独加载我关注的收藏夹
   */
  private async loadFollowingCollections(
    userToken: string,
    page: number = 1
  ): Promise<void> {
    let puppeteerPage;
    try {
      console.log(`开始获取我关注的收藏夹 (第${page}页)...`);
      puppeteerPage = await PuppeteerManager.createPage();

      const url =
        page === 1
          ? `https://www.zhihu.com/people/${userToken}/collections/following`
          : `https://www.zhihu.com/people/${userToken}/collections/following?page=${page}`;

      await puppeteerPage.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });

      // 等待页面稳定
      await PuppeteerManager.delay(2000);

      // 尝试滚动加载更多内容
      try {
        await PuppeteerManager.simulateHumanScroll(puppeteerPage);
        await PuppeteerManager.delay(1000);
      } catch (scrollError) {
        console.log("滚动时出现错误，继续执行:", scrollError);
      }

      const followingCollectionsHtml = await puppeteerPage.content();
      const newCollections = this.parseFollowingCollections(
        followingCollectionsHtml
      );

      if (page === 1) {
        // 第一页，替换现有数据
        Store.Zhihu.collections.followingCollections = newCollections;
        Store.Zhihu.collections.followingCollectionsPagination.currentPage = 1;
      } else {
        // 后续页面，追加数据
        const existingIds = new Set(
          Store.Zhihu.collections.followingCollections.map((c) => c.id)
        );
        const filteredCollections = newCollections.filter(
          (c) => !existingIds.has(c.id)
        );
        Store.Zhihu.collections.followingCollections.push(
          ...filteredCollections
        );
        Store.Zhihu.collections.followingCollectionsPagination.currentPage =
          page;
      }

      // 判断是否还有更多页面：如果返回的收藏夹数量少于20，说明没有更多了
      Store.Zhihu.collections.followingCollectionsPagination.hasMore =
        newCollections.length >= 20;

      console.log(
        `成功获取 ${newCollections.length} 个我关注的收藏夹 (第${page}页)`
      );
    } catch (error) {
      console.error("获取我关注的收藏夹失败:", error);
      throw error;
    } finally {
      if (puppeteerPage) {
        try {
          await puppeteerPage.close();
        } catch (closeError) {
          console.error("关闭页面时出错:", closeError);
        }
      }
    }
  }

  /**
   * 加载更多我创建的收藏夹
   */
  async loadMoreMyCollections(): Promise<void> {
    try {
      if (!Store.Zhihu.collections.userInfo) {
        vscode.window.showWarningMessage("请先加载收藏夹");
        return;
      }

      const pagination = Store.Zhihu.collections.myCollectionsPagination;
      if (!pagination.hasMore || pagination.isLoading) {
        return;
      }

      pagination.isLoading = true;
      this._onDidChangeTreeData.fire();

      const userToken = Store.Zhihu.collections.userInfo.url_token;
      const nextPage = pagination.currentPage + 1;

      // 记录加载前的数量
      const previousCount = Store.Zhihu.collections.myCollections.length;

      await this.loadMyCollections(userToken, nextPage);

      // 检查加载后的数量变化
      const newCount = Store.Zhihu.collections.myCollections.length;
      if (newCount === previousCount) {
        // 如果数量没有变化，说明已经没有更多数据了
        pagination.hasMore = false;
        console.log("我创建的收藏夹：数量未变化，设置hasMore为false");
        vscode.window.showInformationMessage("已加载完所有收藏夹");
      } else {
        vscode.window.showInformationMessage(
          `加载了第 ${nextPage} 页收藏夹，新增 ${newCount - previousCount} 个`
        );
      }
    } catch (error) {
      console.error("加载更多我创建的收藏夹失败:", error);
      vscode.window.showErrorMessage(
        `加载更多收藏夹失败: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      Store.Zhihu.collections.myCollectionsPagination.isLoading = false;
      this._onDidChangeTreeData.fire();
    }
  }

  /**
   * 加载更多我关注的收藏夹
   */
  async loadMoreFollowingCollections(): Promise<void> {
    try {
      if (!Store.Zhihu.collections.userInfo) {
        vscode.window.showWarningMessage("请先加载收藏夹");
        return;
      }

      const pagination = Store.Zhihu.collections.followingCollectionsPagination;
      if (!pagination.hasMore || pagination.isLoading) {
        return;
      }

      pagination.isLoading = true;
      this._onDidChangeTreeData.fire();

      const userToken = Store.Zhihu.collections.userInfo.url_token;
      const nextPage = pagination.currentPage + 1;

      // 记录加载前的数量
      const previousCount = Store.Zhihu.collections.followingCollections.length;

      await this.loadFollowingCollections(userToken, nextPage);

      // 检查加载后的数量变化
      const newCount = Store.Zhihu.collections.followingCollections.length;
      if (newCount === previousCount) {
        // 如果数量没有变化，说明已经没有更多数据了
        pagination.hasMore = false;
        console.log("我关注的收藏夹：数量未变化，设置hasMore为false");
        vscode.window.showInformationMessage("已加载完所有关注的收藏夹");
      } else {
        vscode.window.showInformationMessage(
          `加载了第 ${nextPage} 页关注收藏夹，新增 ${
            newCount - previousCount
          } 个`
        );
      }
    } catch (error) {
      console.error("加载更多我关注的收藏夹失败:", error);
      vscode.window.showErrorMessage(
        `加载更多收藏夹失败: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      Store.Zhihu.collections.followingCollectionsPagination.isLoading = false;
      this._onDidChangeTreeData.fire();
    }
  }

  /**
   * 加载指定页面的我创建的收藏夹
   */
  private async loadMyCollectionsPage(
    userToken: string,
    page: number
  ): Promise<void> {
    let puppeteerPage;
    try {
      console.log(`开始获取我创建的收藏夹第 ${page} 页...`);
      puppeteerPage = await PuppeteerManager.createPage();

      await puppeteerPage.goto(
        `https://www.zhihu.com/people/${userToken}/collections?page=${page}`,
        {
          waitUntil: "domcontentloaded",
          timeout: 15000,
        }
      );

      // 等待页面稳定
      await PuppeteerManager.delay(2000);

      // 尝试滚动加载更多内容
      try {
        await PuppeteerManager.simulateHumanScroll(puppeteerPage);
        await PuppeteerManager.delay(1000);
      } catch (scrollError) {
        console.log("滚动时出现错误，继续执行:", scrollError);
      }

      const myCollectionsHtml = await puppeteerPage.content();
      const newCollections = this.parseMyCollections(myCollectionsHtml);

      // 去重并添加新收藏夹
      const existingIds = new Set(
        Store.Zhihu.collections.myCollections.map((c) => c.id)
      );
      const uniqueNewCollections = newCollections.filter(
        (c) => !existingIds.has(c.id)
      );

      Store.Zhihu.collections.myCollections.push(...uniqueNewCollections);
      console.log(
        `成功获取 ${uniqueNewCollections.length} 个新的我创建的收藏夹`
      );
    } catch (error) {
      console.error("获取我创建的收藏夹页面失败:", error);
      throw error;
    } finally {
      if (puppeteerPage) {
        try {
          await puppeteerPage.close();
        } catch (closeError) {
          console.error("关闭页面时出错:", closeError);
        }
      }
    }
  }

  /**
   * 加载指定页面的我关注的收藏夹
   */
  private async loadFollowingCollectionsPage(
    userToken: string,
    page: number
  ): Promise<void> {
    let puppeteerPage;
    try {
      console.log(`开始获取我关注的收藏夹第 ${page} 页...`);
      puppeteerPage = await PuppeteerManager.createPage();

      await puppeteerPage.goto(
        `https://www.zhihu.com/people/${userToken}/collections/following?page=${page}`,
        {
          waitUntil: "domcontentloaded",
          timeout: 15000,
        }
      );

      // 等待页面稳定
      await PuppeteerManager.delay(2000);

      // 尝试滚动加载更多内容
      try {
        await PuppeteerManager.simulateHumanScroll(puppeteerPage);
        await PuppeteerManager.delay(1000);
      } catch (scrollError) {
        console.log("滚动时出现错误，继续执行:", scrollError);
      }

      const followingCollectionsHtml = await puppeteerPage.content();
      const newCollections = this.parseFollowingCollections(
        followingCollectionsHtml
      );

      // 去重并添加新收藏夹
      const existingIds = new Set(
        Store.Zhihu.collections.followingCollections.map((c) => c.id)
      );
      const uniqueNewCollections = newCollections.filter(
        (c) => !existingIds.has(c.id)
      );

      Store.Zhihu.collections.followingCollections.push(
        ...uniqueNewCollections
      );
      console.log(
        `成功获取 ${uniqueNewCollections.length} 个新的我关注的收藏夹`
      );
    } catch (error) {
      console.error("获取我关注的收藏夹页面失败:", error);
      throw error;
    } finally {
      if (puppeteerPage) {
        try {
          await puppeteerPage.close();
        } catch (closeError) {
          console.error("关闭页面时出错:", closeError);
        }
      }
    }
  }
}
