import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { Store } from "./core/stores";
import { ZhihuService } from "./core/zhihu/index";
import { ZhihuApiService } from "./core/zhihu/api";
import { WebviewManager } from "./core/zhihu/webview";
import { PuppeteerManager } from "./core/zhihu/puppeteer";
import { aboutTemplate } from "./core/zhihu/webview/templates/about";
import { sidebarHotListDataProvider } from "./core/zhihu/sidebar/hot";
import { LinkItem, CollectionItem, CollectionFolder } from "./core/types";
import { sidebarSearchListDataProvider } from "./core/zhihu/sidebar/search";
import { sidebarRecommendListDataProvider } from "./core/zhihu/sidebar/recommend";
import { sidebarCollectionsDataProvider } from "./core/zhihu/sidebar/collections";

export function activate(context: vscode.ExtensionContext) {
  console.log("🐟知乎摸鱼🐟 已激活！");

  // 创建知乎服务实例
  const zhihuService = new ZhihuService();

  // 侧边栏 推荐 列表
  const sidebarRecommend = new sidebarRecommendListDataProvider();
  const recommendListView = vscode.window.createTreeView("zhihuRecommendList", {
    treeDataProvider: sidebarRecommend,
    showCollapseAll: false,
  });
  // 将 TreeView 引用传递给数据提供者，用于更新标题
  sidebarRecommend.setTreeView(recommendListView);

  // 侧边栏 热榜 列表
  const sidebarHot = new sidebarHotListDataProvider();
  const hotListView = vscode.window.createTreeView("zhihuHotList", {
    treeDataProvider: sidebarHot,
    showCollapseAll: false,
  });
  // 将 TreeView 引用传递给数据提供者，用于更新标题
  sidebarHot.setTreeView(hotListView);

  // 侧边栏 搜索 列表
  const sidebarSearch = new sidebarSearchListDataProvider();
  const searchListView = vscode.window.createTreeView("zhihuSearchList", {
    treeDataProvider: sidebarSearch,
    showCollapseAll: false,
  });
  // 将 TreeView 引用传递给数据提供者，用于更新标题
  sidebarSearch.setTreeView(searchListView);

  // 侧边栏 收藏 列表
  const sidebarCollections = new sidebarCollectionsDataProvider();
  const collectionsListView = vscode.window.createTreeView(
    "zhihuCollectionsList",
    {
      treeDataProvider: sidebarCollections,
      showCollapseAll: false,
    }
  );
  // 将 TreeView 引用传递给数据提供者，用于更新标题
  sidebarCollections.setTreeView(collectionsListView);

  // 注册刷新热榜命令
  const refreshHotListCommand = vscode.commands.registerCommand(
    "zhihu-fisher.refreshHotList",
    () => sidebarHot.refresh()
  );

  // 注册刷新推荐命令
  const refreshRecommendListCommand = vscode.commands.registerCommand(
    "zhihu-fisher.refreshRecommendList",
    () => sidebarRecommend.refresh()
  );

  // 注册不喜欢推荐内容命令
  const dislikeRecommendItemCommand = vscode.commands.registerCommand(
    "zhihu-fisher.dislikeRecommendItem",
    (item: any) => {
      if (item && item.listItem) {
        sidebarRecommend.dislikeContent(item.listItem);
      } else {
        vscode.window.showErrorMessage("无法获取内容信息");
      }
    }
  );

  // 注册重置搜索结果
  const resetSearchListCommand = vscode.commands.registerCommand(
    "zhihu-fisher.resetSearchList",
    () => sidebarSearch.reset()
  );

  // 注册刷新收藏夹命令
  const refreshCollectionsCommand = vscode.commands.registerCommand(
    "zhihu-fisher.refreshCollections",
    () => sidebarCollections.refresh()
  );

  // 注册刷新我创建的收藏夹命令
  const refreshMyCollectionsCommand = vscode.commands.registerCommand(
    "zhihu-fisher.refreshMyCollections",
    async () => {
      await sidebarCollections.refreshMyCollections();
    }
  );

  // 注册刷新我关注的收藏夹命令
  const refreshFollowingCollectionsCommand = vscode.commands.registerCommand(
    "zhihu-fisher.refreshFollowingCollections",
    async () => {
      await sidebarCollections.refreshFollowingCollections();
    }
  );

  // 注册加载更多收藏项命令
  const loadMoreCollectionItemsCommand = vscode.commands.registerCommand(
    "zhihu-fisher.loadMoreCollectionItems",
    async (collection: CollectionFolder) => {
      await sidebarCollections.loadMoreCollectionItems(collection);
    }
  );

  // 注册加载更多我创建的收藏夹命令
  const loadMoreMyCollectionsCommand = vscode.commands.registerCommand(
    "zhihu-fisher.loadMoreMyCollections",
    async () => {
      await sidebarCollections.loadMoreMyCollections();
    }
  );

  // 注册加载更多我关注的收藏夹命令
  const loadMoreFollowingCollectionsCommand = vscode.commands.registerCommand(
    "zhihu-fisher.loadMoreFollowingCollections",
    async () => {
      await sidebarCollections.loadMoreFollowingCollections();
    }
  );

  // 注册打开收藏项命令
  const openCollectionItemCommand = vscode.commands.registerCommand(
    "zhihu-fisher.openCollectionItem",
    async (collectionItem: CollectionItem) => {
      if (!collectionItem) {
        vscode.window.showErrorMessage("无法获取收藏项信息");
        return;
      }

      // 根据收藏项类型处理
      if (collectionItem.type === "article") {
        // 文章直接打开
        const linkItem: LinkItem = {
          id: collectionItem.id,
          url: collectionItem.url,
          title: collectionItem.title,
          excerpt: collectionItem.excerpt,
          type: "article",
          imgUrl: collectionItem.thumbnail,
        };
        await vscode.commands.executeCommand(
          "zhihu-fisher.openArticle",
          linkItem,
          "collection"
        );
      } else if (collectionItem.type === "question") {
        // 问题直接打开
        const linkItem: LinkItem = {
          id: collectionItem.id,
          url: collectionItem.url,
          title: collectionItem.title,
          excerpt: collectionItem.excerpt,
          type: "question",
          imgUrl: collectionItem.thumbnail,
        };
        await vscode.commands.executeCommand(
          "zhihu-fisher.openArticle",
          linkItem,
          "collection"
        );
      } else if (collectionItem.type === "answer") {
        // 回答需要特殊处理：构建一个包含该回答的问题页面
        if (!collectionItem.question) {
          vscode.window.showErrorMessage("回答缺少问题信息");
          return;
        }

        const linkItem: LinkItem = {
          id: collectionItem.question.id,
          url: collectionItem.question.url,
          title: collectionItem.question.title,
          excerpt: collectionItem.excerpt,
          type: "question",
          imgUrl: collectionItem.thumbnail,
          answerUrl: collectionItem.url, // 保存特定回答的URL
        };

        // 打开问题页面，会自动加载回答，特定回答会被优先显示
        await vscode.commands.executeCommand(
          "zhihu-fisher.openArticle",
          linkItem,
          "collection"
        );
      }
    }
  );

  // 注册刷新收藏夹命令
  const refreshCollectionCommand = vscode.commands.registerCommand(
    "zhihu-fisher.refreshCollection",
    async (item: any) => {
      if (!item || !item.collectionFolder) {
        vscode.window.showErrorMessage("无法获取收藏夹信息");
        return;
      }

      const collection = item.collectionFolder;
      // 重置收藏夹状态
      collection.items = [];
      collection.isLoaded = false;
      collection.currentOffset = 0;

      // 重新加载
      await sidebarCollections.loadCollectionItems(collection.id);
      vscode.window.showInformationMessage(
        `收藏夹 "${collection.title}" 已刷新`
      );
    }
  );

  // 注册在浏览器中打开收藏夹命令
  const openCollectionInBrowserCommand = vscode.commands.registerCommand(
    "zhihu-fisher.openCollectionInBrowser",
    async (item: any) => {
      if (!item || !item.collectionFolder) {
        vscode.window.showErrorMessage("无法获取收藏夹信息");
        return;
      }

      const collection = item.collectionFolder;
      await vscode.env.openExternal(vscode.Uri.parse(collection.url));
    }
  );

  // 注册在浏览器中打开收藏项命令
  const openCollectionItemInBrowserCommand = vscode.commands.registerCommand(
    "zhihu-fisher.openCollectionItemInBrowser",
    async (item: any) => {
      if (!item || !item.collectionItem) {
        vscode.window.showErrorMessage("无法获取收藏项信息");
        return;
      }

      const collectionItem = item.collectionItem;
      await vscode.env.openExternal(vscode.Uri.parse(collectionItem.url));
    }
  );

  // 注册取消收藏命令
  const removeFromCollectionCommand = vscode.commands.registerCommand(
    "zhihu-fisher.removeFromCollection",
    async (item: any) => {
      if (!item || !item.collectionItem) {
        vscode.window.showErrorMessage("无法获取收藏项信息");
        return;
      }

      const collectionItem = item.collectionItem as CollectionItem;

      // 确认对话框
      const confirm = await vscode.window.showWarningMessage(
        `确定要取消收藏 "${collectionItem.title}" 吗？`,
        { modal: true },
        "取消"
      );

      if (confirm !== "取消") {
        return;
      }

      try {
        // 从侧边栏收藏夹中找到包含该收藏项的收藏夹
        let targetCollectionId: string | null = null;

        // 遍历我创建的收藏夹
        for (const collection of Store.Zhihu.collections.myCollections) {
          const foundItem = collection.items.find(
            (item) =>
              item.id === collectionItem.id && item.type === collectionItem.type
          );
          if (foundItem) {
            targetCollectionId = collection.id;
            break;
          }
        }

        // 如果在我创建的收藏夹中没找到，查找我关注的收藏夹
        if (!targetCollectionId) {
          for (const collection of Store.Zhihu.collections
            .followingCollections) {
            const foundItem = collection.items.find(
              (item) =>
                item.id === collectionItem.id &&
                item.type === collectionItem.type
            );
            if (foundItem) {
              targetCollectionId = collection.id;
              break;
            }
          }
        }

        if (!targetCollectionId) {
          vscode.window.showErrorMessage("无法找到包含该收藏项的收藏夹");
          return;
        }

        // 调用取消收藏API
        const contentType =
          collectionItem.type === "article" ? "article" : "answer";
        const success = await ZhihuApiService.removeFromCollection(
          targetCollectionId,
          collectionItem.id,
          contentType
        );

        if (success) {
          vscode.window.showInformationMessage(
            `成功取消收藏: ${collectionItem.title}`
          );

          // 从本地数据中移除该收藏项
          const targetCollection = [
            ...Store.Zhihu.collections.myCollections,
            ...Store.Zhihu.collections.followingCollections,
          ].find((c) => c.id === targetCollectionId);

          if (targetCollection) {
            const itemIndex = targetCollection.items.findIndex(
              (item) =>
                item.id === collectionItem.id &&
                item.type === collectionItem.type
            );
            if (itemIndex > -1) {
              targetCollection.items.splice(itemIndex, 1);
              // 更新总数
              if (targetCollection.totalCount !== undefined) {
                targetCollection.totalCount = Math.max(
                  0,
                  targetCollection.totalCount - 1
                );
              }
            }
          }

          // 刷新收藏夹视图
          sidebarCollections.refreshView();
        } else {
          vscode.window.showErrorMessage(
            `取消收藏失败: ${collectionItem.title}`
          );
        }
      } catch (error) {
        console.error("取消收藏时出错:", error);
        vscode.window.showErrorMessage(
          `取消收藏失败: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }
  );

  // 注册搜索命令
  const searchContentCommand = vscode.commands.registerCommand(
    "zhihu-fisher.searchContent",
    async () => {
      // 检查热榜列表是否正在加载中
      if (Store.Zhihu.hot.isLoading) {
        vscode.window.showInformationMessage(
          "热榜列表正在加载中，请稍候再试..."
        );
        return;
      }

      // 检查推荐列表是否正在加载中
      if (Store.Zhihu.recommend.isLoading) {
        vscode.window.showInformationMessage(
          "推荐列表正在加载中，请稍候再试..."
        );
        return;
      }

      const canCreateBrowser = await PuppeteerManager.canCreateBrowser();
      if (!canCreateBrowser) {
        vscode.window.showErrorMessage(
          "无法创建浏览器实例，搜索失败，请检查浏览器安装情况。"
        );
        return;
      }

      const query = await vscode.window.showInputBox({
        prompt: "请输入要搜索的内容",
        placeHolder: "请输入关键词",
      });

      if (query) {
        await sidebarSearch.searchContent(query);
      }
    }
  );

  // 注册打开文章命令
  const openArticleCommand = vscode.commands.registerCommand(
    "zhihu-fisher.openArticle",
    (item: LinkItem, sourceType?: "collection" | "recommend" | "hot" | "search") => {
      // 检查热榜列表是否正在加载中
      if (Store.Zhihu.hot.isLoading) {
        vscode.window.showInformationMessage(
          "热榜列表正在加载中，请稍候再试..."
        );
        return;
      }

      // 检查推荐列表是否正在加载中
      if (Store.Zhihu.recommend.isLoading) {
        vscode.window.showInformationMessage(
          "推荐列表正在加载中，请稍候再试..."
        );
        return;
      }

      // 检查搜索列表是否正在加载中
      if (Store.Zhihu.search.isLoading) {
        vscode.window.showInformationMessage(
          "搜索结果正在加载中，请稍候再试..."
        );
        return;
      }

      // 根据item的id推断来源类型
      let inferredSourceType: "collection" | "recommend" | "hot" | "search" = "recommend";
      if (item.id.startsWith("collection-")) {
        inferredSourceType = "collection";
      } else if (item.id.startsWith("recommend-")) {
        inferredSourceType = "recommend";
      } else if (item.id.startsWith("hot-")) {
        inferredSourceType = "hot";
      } else if (item.id.startsWith("search-")) {
        inferredSourceType = "search";
      }

      const finalSourceType = sourceType || inferredSourceType;
      WebviewManager.openWebview(item, finalSourceType);
    }
  );

  // 注册在浏览器中打开命令
  const openInBrowserCommand = vscode.commands.registerCommand(
    "zhihu-fisher.openInBrowser",
    (item: any) => {
      if (item && item.listItem) {
        // 对于推荐列表，优先使用answerUrl（特定回答），否则使用url（问题页面）
        const urlToOpen = item.listItem.answerUrl || item.listItem.url;
        if (urlToOpen) {
          vscode.env.openExternal(vscode.Uri.parse(urlToOpen));
          // 提示用户打开的是什么类型的链接
          // const linkType = item.listItem.answerUrl && item.listItem.answerUrl !== item.listItem.url
          //   ? "特定回答"
          //   : item.listItem.type === "article" ? "文章" : "问题";
          // vscode.window.showInformationMessage(`已在浏览器中打开${linkType}: ${item.listItem.title}`);
        } else {
          vscode.window.showErrorMessage("无法获取链接地址");
        }
      } else {
        vscode.window.showErrorMessage("无法获取链接地址");
      }
    }
  );

  // 注册查看大图命令
  const showFullImageCommand = vscode.commands.registerCommand(
    "zhihu-fisher.showFullImage",
    (item: any) => {
      let imageUrl: string | undefined;
      let title: string = "图片预览";

      // 兼容不同的参数格式
      if (item && item.imgUrl && item.title) {
        // 新格式：直接传递 imgUrl 和 title
        imageUrl = item.imgUrl;
        title = item.title;
      } else if (item && item.listItem && item.listItem.imgUrl) {
        // 原有格式：通过 listItem 传递
        imageUrl = item.listItem.imgUrl;
        title = `缩略图预览 - ${item.listItem.title.substring(0, 10)}`;
      } else {
        vscode.window.showInformationMessage("该项目没有图片");
        return;
      }

      if (imageUrl) {
        const panel = vscode.window.createWebviewPanel(
          "previewImage",
          title,
          vscode.ViewColumn.Active, // 在当前编辑组显示
          {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [],
          }
        );

        // 设置Webview内容
        panel.webview.html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>图片预览</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background-color: var(--vscode-editor-background);
              }
              img {
                max-width: 100%;
                max-height: 90vh;
                height: auto;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
              }
            </style>
          </head>
          <body>
            <img src="${imageUrl}" alt="预览图片" onerror="document.body.innerHTML='<p style=color:var(--vscode-errorForeground)>图片加载失败</p>'" />
          </body>
          </html>
        `;
      } else {
        vscode.window.showInformationMessage("无法获取图片URL");
      }
    }
  );

  // 注册设置Cookie命令
  const setCookieCommand = vscode.commands.registerCommand(
    "zhihu-fisher.setCookie",
    async () => {
      const success = await zhihuService.setCookie();
      if (success) {
        try {
          // 设置Cookie成功后，首先需要看看能不能创建爬虫浏览器
          await PuppeteerManager.canCreateBrowser();
          // 如果能创建成功，那么就继续下一步操作
          console.log("创建爬虫浏览器成功，开始加载热榜和推荐列表...");
        } catch (error) {
          console.error("创建爬虫浏览器失败:", error);
          return;
        }
        // 设置Cookie成功后刷新热榜、推荐和搜索列表
        sidebarHot.refresh();
        sidebarRecommend.refresh();
        sidebarSearch.reset();
      }
    }
  );

  // 注册清除Cookie命令
  const clearCookieCommand = vscode.commands.registerCommand(
    "zhihu-fisher.clearCookie",
    () => {
      zhihuService.clearCookie();
      sidebarHot.refresh();
      sidebarRecommend.refresh();
      sidebarSearch.reset();
    }
  );

  // 注册清理收藏夹缓存命令
  const clearCollectionCacheCommand = vscode.commands.registerCommand(
    "zhihu-fisher.clearCollectionCache",
    async () => {
      const { CollectionCacheManager } = await import("./utils/index.js");
      CollectionCacheManager.clearCache();
      vscode.window.showInformationMessage("已清理收藏夹缓存，下次收藏时将重新获取最新数据");
    }
  );

  // 注册切换媒体显示模式命令
  const toggleMediaCommand = vscode.commands.registerCommand(
    "zhihu-fisher.toggleMedia",
    () => {
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
      config
        .update("mediaDisplayMode", newMode, vscode.ConfigurationTarget.Global)
        .then(() => {
          // 根据不同模式显示不同提示
          let statusText = "";
          switch (newMode) {
            case "normal":
              statusText = "图片、视频将正常展示";
              break;
            case "mini":
              statusText = "已切换到小图模式";
              break;
            case "none":
              statusText = "图片、视频将全部隐藏";
              break;
          }
          vscode.window.showInformationMessage(
            `${statusText}，重新打开文章来查看效果。`
          );
        });
    }
  );

  // 注册设置正常媒体模式命令
  const setMediaModeNormalCommand = vscode.commands.registerCommand(
    "zhihu-fisher.setMediaModeNormal",
    async () => {
      const config = vscode.workspace.getConfiguration("zhihu-fisher");
      await config.update(
        "mediaDisplayMode",
        "normal",
        vscode.ConfigurationTarget.Global
      );
      vscode.window.showInformationMessage("图片和视频正常展示~");
    }
  );

  // 注册设置迷你媒体模式命令
  const setMediaModeMiniCommand = vscode.commands.registerCommand(
    "zhihu-fisher.setMediaModeMini",
    async () => {
      const config = vscode.workspace.getConfiguration("zhihu-fisher");
      await config.update(
        "mediaDisplayMode",
        "mini",
        vscode.ConfigurationTarget.Global
      );
      vscode.window.showInformationMessage(
        "图片和视频将缩小尺寸展示，方便偷偷看哈哈~"
      );
    }
  );

  // 注册设置无媒体模式命令
  const setMediaModeNoneCommand = vscode.commands.registerCommand(
    "zhihu-fisher.setMediaModeNone",
    async () => {
      const config = vscode.workspace.getConfiguration("zhihu-fisher");
      await config.update(
        "mediaDisplayMode",
        "none",
        vscode.ConfigurationTarget.Global
      );
      vscode.window.showInformationMessage("图片和视频将不再展示~");
    }
  );

  // 安装浏览器命令
  const configureBrowserCommand = vscode.commands.registerCommand(
    "zhihu-fisher.configureBrowser",
    async () => {
      const title = "设置 Puppeteer 使用的浏览器";
      const currentSystem = PuppeteerManager.getOSType();
      const examplePath = PuppeteerManager.getChromeExamplePath();
      const message =
        "插件提供了配置浏览器的两种方式：\n" +
        "1. 安装Puppeteer的默认浏览器\n" +
        "2. 设置自定义Chrome路径\n" +
        "\n" +
        "===================================\n" +
        "\n" +
        "方法一：【安装默认的浏览器】(￣▽￣)ノ\n" +
        "1. 请在终端中运行以下命令来安装浏览器：\n" +
        "   npx puppeteer browsers install chrome@135.0.7049.84\n" +
        "2. 或者点击【安装浏览器】按钮会自动开始安装\n" +
        "\n" +
        "【安装目录】" +
        `${currentSystem}：${examplePath.default}\n` +
        "\n" +
        "【可能遇到的问题】(っ °Д °;)っ\n" +
        "1. 如果提示 npx 指令运行失败：请检查是否安装了 Node.js（v18及以上） 和 NPM \n" +
        "   如果没有安装，请点击【安装Node.js】按钮自动安装\n" +
        "2. Node.js 和 npm 已安装，但仍然提示 npx 指令运行失败：那么可以使用\n" +
        "   npm install -g npx 来安装 NPX，点击【安装NPX】自动安装\n" +
        "\n" +
        "===================================\n" +
        "\n" +
        "方法二：【设置自定义Chrome路径】(╯‵□′)╯︵┻━┻\n" +
        "1. 如果你已经安装了谷歌官方的 Chrome 浏览器，并且想要使用自己的浏览器\n" +
        "2. 请点击【自定义路径】按钮\n" +
        "3. 然后输入 Chrome 浏览器的可执行文件路径，例如：\n" +
        `   ${examplePath.custom}\n` +
        "\n" +
        "===================================\n" +
        "\n" +
        "【注意】\n" +
        "🎉设置完成后，请重启VSCode。🎉\n";
      const installBrowserAction = "安装浏览器";
      const setCustomChromePathAction = "自定义路径";
      const installNodeAction = "安装Node.js";
      const installNpxAction = "安装NPX";

      const selection = await vscode.window.showInformationMessage(
        title,
        {
          modal: true,
          detail: message,
        },
        installBrowserAction,
        setCustomChromePathAction,
        installNodeAction,
        installNpxAction
      );

      if (selection === installBrowserAction) {
        // 打开终端并运行命令 npx puppeteer browsers install chrome@135.0.7049.84
        const terminal = vscode.window.createTerminal("Puppeteer");
        terminal.show();
        terminal.sendText(
          "npx puppeteer browsers install chrome@135.0.7049.84"
        );

        setTimeout(() => {
          // 安装完成后请重启VSCode
          vscode.window
            .showInformationMessage(
              "安装完成后请重启 VSCode，以启用爬虫浏览器",
              "点我重启"
            )
            .then((selection) => {
              if (selection === "点我重启") {
                vscode.commands.executeCommand("workbench.action.reloadWindow");
              }
            });
        }, 6666); // 等待6秒后提示重启VSCode
      } else if (selection === setCustomChromePathAction) {
        // 用户选择设置自定义Chrome路径
        vscode.commands.executeCommand("zhihu-fisher.setCustomChromePath");
      } else if (selection === installNpxAction) {
        // 打开终端并运行命令 npm install -g npx
        const terminal = vscode.window.createTerminal("Npx");
        terminal.show();
        terminal.sendText("npm install -g npx");

        setTimeout(() => {
          // 安装完成后提示用户
          vscode.window.showInformationMessage(
            "npx 安装完成后，请重新点击侧边栏安装浏览器"
          );
        }, 5000);
      } else if (selection === installNodeAction) {
        // 打开浏览器链接
        const nodeJsUrl = "https://nodejs.org/zh-cn/download";
        // 直接打开浏览器
        vscode.env.openExternal(vscode.Uri.parse(nodeJsUrl)).then(() => {
          // 提示用户安装完成后重启VSCode
          vscode.window
            .showInformationMessage(
              "Node.js 安装完成后，请重新点击侧边栏安装浏览器"
            )
            .then(() => {
              // 这里可以添加其他操作，比如刷新列表等
            });
        });
      }
    }
  );

  // 注册设置自定义Chrome路径命令
  const setCustomChromePathCommand = vscode.commands.registerCommand(
    "zhihu-fisher.setCustomChromePath",
    async () => {
      const currentSystem = PuppeteerManager.getOSType();
      const examplePath = PuppeteerManager.getChromeExamplePath();

      // 创建输入框让用户输入Chrome路径
      const options: vscode.InputBoxOptions = {
        title: "设置自定义Chrome路径",
        prompt:
          "请输入本地谷歌浏览器Chrome.exe的绝对路径【想清空设置请按 ESC 退出即可】",
        placeHolder: `(${currentSystem})例如: ${examplePath.custom}`,
        ignoreFocusOut: true,
        validateInput: async (input) => {
          // 验证路径是否存在且是否为Chrome可执行文件
          if (!input) {
            return "请输入Chrome浏览器的路径";
          }

          // 如果是windows才做一下校验，Mac和Linux不需要，因为没环境不知道限制了会怎么样，让用户自己把握哈哈
          if (currentSystem === "Windows") {
            if (!fs.existsSync(input)) {
              return "找不到指定的文件";
            }

            const fileName = path.basename(input).toLowerCase();
            if (!fileName.includes("chrome")) {
              return "文件名似乎不是Chrome浏览器(应包含chrome字样)";
            }
          }

          return null; // 验证通过
        },
      };

      // 获取当前设置的路径作为默认值
      const currentPath = PuppeteerManager.getUserChromePath();
      if (currentPath) {
        options.value = currentPath;
      }

      const chromePath = await vscode.window.showInputBox(options);
      if (!chromePath) {
        // 清除自定义路径
        await PuppeteerManager.setUserChromePath("");
        // 用户取消输入
        const cancelMessage =
          "已清除自定义Chrome路径，将使用爬虫的默认浏览器，如果没安装请安装";
        const installBrowserAction = "安装浏览器";

        vscode.window
          .showInformationMessage(cancelMessage, installBrowserAction)
          .then((selection) => {
            if (selection === installBrowserAction) {
              vscode.commands.executeCommand("zhihu-fisher.configureBrowser");
            }
          });
        return;
      }

      try {
        // 保存自定义路径
        if (chromePath) {
          await PuppeteerManager.setUserChromePath(chromePath);
          // 重置浏览器实例以使用新路径
          await PuppeteerManager.closeBrowserInstance();
          vscode.window
            .showInformationMessage(
              `已设置自定义Chrome路径，最好重启一下避免出现bug~`,
              "重启VSCode"
            )
            .then((selection) => {
              if (selection === "重启VSCode") {
                vscode.commands.executeCommand("workbench.action.reloadWindow");
              }
            });
        }
      } catch (error) {
        vscode.window.showErrorMessage(`设置Chrome路径失败: ${error}`);
      }
    }
  );

  // 注册意见反馈命令
  const openFeedbackCommand = vscode.commands.registerCommand(
    "zhihu-fisher.openFeedback",
    async () => {
      const feedbackUrl =
        "https://github.com/crispyChicken999/zhihu-fisher-vscode/issues";
      vscode.env.openExternal(vscode.Uri.parse(feedbackUrl));
      vscode.window.showInformationMessage(
        "已打开GitHub Issues页面，欢迎提出问题和建议！"
      );
    }
  );

  // GitHub点星命令
  const starOnGitHubCommand = vscode.commands.registerCommand(
    "zhihu-fisher.starOnGitHub",
    async () => {
      const repoUrl = "https://github.com/crispyChicken999/zhihu-fisher-vscode";
      vscode.env.openExternal(vscode.Uri.parse(repoUrl));
      vscode.window.showInformationMessage(
        "感谢您的支持！已打开GitHub仓库页面，点击 ⭐️ 即可~"
      );
    }
  );

  // 请开发者喝杯咖啡命令
  const buyMeCoffeeCommand = vscode.commands.registerCommand(
    "zhihu-fisher.buyMeCoffee",
    async () => {
      const alipayUrl =
        "https://img2024.cnblogs.com/blog/3085939/202504/3085939-20250425153014632-145153684.jpg";

      const title = "☕ 请开发者喝杯咖啡吧 ☕";
      const message =
        "如果您觉得知乎摸鱼插件对您有帮助，欢迎请开发者喝杯咖啡！\n\n" +
        "您的支持是我们继续开发和改进的动力！\n\n" +
        "💝 感谢您的支持~💝";

      const alipayAction = "微信打赏";
      const starAction = "GitHub上点颗星";

      const selection = await vscode.window.showInformationMessage(
        title,
        {
          modal: true,
          detail: message,
        },
        alipayAction,
        starAction
      );

      switch (selection) {
        case alipayAction:
          vscode.env.openExternal(vscode.Uri.parse(alipayUrl));
          vscode.window.showInformationMessage(
            "谢谢您的支持！已打开微信赞赏码~"
          );
          break;
        case starAction:
          await vscode.commands.executeCommand("zhihu-fisher.starOnGitHub");
          break;
      }
    }
  );

  // 关于命令
  const showAboutCommand = vscode.commands.registerCommand(
    "zhihu-fisher.showAbout",
    async () => {
      const panel = vscode.window.createWebviewPanel(
        "zhihuFisherAbout",
        "关于知乎摸鱼",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        }
      );

      panel.webview.html = aboutTemplate;
    }
  );

  // 使用说明命令
  const showGuideCommand = vscode.commands.registerCommand(
    "zhihu-fisher.showGuide",
    async () => {
      // 打开walkthrough
      vscode.commands.executeCommand(
        "workbench.action.openWalkthrough",
        "CrispyChicken.zhihu-fisher#zhihu-fisher-getting-started"
      );
    }
  );

  // 注册重启扩展命令
  const restartExtensionCommand = vscode.commands.registerCommand(
    "zhihu-fisher.restartExtension",
    async () => {
      const selection = await vscode.window.showInformationMessage(
        "重启扩展将重新加载所有功能，这可能有助于解决加载卡住等问题。\n\n是否确认重启扩展？",
        { modal: true },
        "确认重启"
      );

      if (selection === "确认重启") {
        try {
          // 关闭已经打开的webview
          WebviewManager.closeAllWebviews();

          await vscode.commands.executeCommand(
            "workbench.action.restartExtensionHost"
          );
        } catch (error) {
          vscode.window.showErrorMessage(`重启扩展失败: ${error}`);
        }
      }
    }
  );

  // 注册显示故障排除指引命令
  const showTroubleshootingGuideCommand = vscode.commands.registerCommand(
    "zhihu-fisher.showTroubleshootingGuide",
    async () => {
      const title = "🤔 知乎摸鱼故障排除指引";
      const message =
        "如果您遇到了页面加载卡住的问题，可能的原因和解决方案如下：\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
        "1. Cookie失效\n" +
        "   原因：知乎Cookie过期或失效\n" +
        "   解决：点击【更新Cookie】重新设置知乎登录信息\n\n" +
        "2. 网络连接问题\n" +
        "   原因：网络不稳定或速度过慢\n" +
        "   解决：检查网络连接，稍后重试，或切换网络环境\n\n" +
        "3. 扩展状态异常\n" +
        "   原因：扩展内部状态出现异常\n" +
        "   解决：点击【重启扩展】重新加载扩展功能\n\n" +
        "4. 浏览器引擎问题\n" +
        "   原因：爬虫浏览器未正确安装或配置\n" +
        "   解决：点击【配置浏览器】重新安装或设置浏览器\n\n" +
        "5. 知乎服务器问题\n" +
        "   原因：知乎服务器响应慢或临时不可用\n" +
        "   解决：稍后重试，或直接在浏览器中打开链接\n\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
        "★ 推荐操作顺序 ★\n" +
        "1. 首先尝试【更新Cookie】\n" +
        "2. 如果还是不行，检查【配置浏览器】\n" +
        "3. 如果问题依然存在，点击【重启扩展】\n" +
        "4. 最后可以尝试【重启VSCode】";

      const updateCookieAction = "更新Cookie";
      const configureBrowserAction = "配置浏览器";
      const restartExtensionAction = "重启扩展";
      const restartVSCode = "重启VSCode";

      const selection = await vscode.window.showInformationMessage(
        title,
        {
          modal: true,
          detail: message,
        },
        updateCookieAction,
        configureBrowserAction,
        restartExtensionAction,
        restartVSCode
      );

      switch (selection) {
        case updateCookieAction:
          await vscode.commands.executeCommand("zhihu-fisher.setCookie");
          break;
        case restartExtensionAction:
          await vscode.commands.executeCommand("zhihu-fisher.restartExtension");
          break;
        case configureBrowserAction:
          await vscode.commands.executeCommand("zhihu-fisher.configureBrowser");
          break;
        case restartVSCode:
          await vscode.commands.executeCommand("workbench.action.reloadWindow");
          break;
      }
    }
  );

  // 注册不再推荐作者命令
  const dislikeAuthorCommand = vscode.commands.registerCommand(
    "zhihu-fisher.dislikeAuthor",
    (item: any) => {
      if (item && item.listItem) {
        sidebarRecommend.dislikeAuthor(item.listItem);
      } else {
        vscode.window.showErrorMessage("无法获取内容信息");
      }
    }
  );

  // 收藏推荐项命令
  const favoriteRecommendItemCommand = vscode.commands.registerCommand(
    "zhihu-fisher.favoriteRecommendItem",
    async (item: any) => {
      if (item && item.listItem) {
        await sidebarRecommend.favoriteContent(item.listItem);
      } else {
        vscode.window.showErrorMessage("无法获取内容信息");
      }
    }
  );

  // 当配置变更时触发刷新
  vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("zhihu-fisher")) {
      if (e.affectsConfiguration("zhihu-fisher.mediaDisplayMode")) {
        // 媒体显示模式变更时，需要刷新所有侧边栏以更新图片显示
        console.log("媒体显示模式已变更，刷新侧边栏显示");
        // 使用新的 refreshView 方法来更新视图，而不重新加载数据
        sidebarHot.refreshView();
        sidebarRecommend.refreshView();
        sidebarSearch.refreshView();
        sidebarCollections.refreshView();
      }
    }
  });

  // 将所有可处置对象添加到扩展上下文的订阅中
  context.subscriptions.push(hotListView);
  context.subscriptions.push(recommendListView);
  context.subscriptions.push(searchListView);
  context.subscriptions.push(collectionsListView);
  context.subscriptions.push(refreshHotListCommand);
  context.subscriptions.push(refreshRecommendListCommand);
  context.subscriptions.push(dislikeRecommendItemCommand);
  context.subscriptions.push(favoriteRecommendItemCommand);
  context.subscriptions.push(dislikeAuthorCommand);
  context.subscriptions.push(resetSearchListCommand);
  context.subscriptions.push(refreshCollectionsCommand);
  context.subscriptions.push(refreshMyCollectionsCommand);
  context.subscriptions.push(refreshFollowingCollectionsCommand);
  context.subscriptions.push(loadMoreCollectionItemsCommand);
  context.subscriptions.push(loadMoreMyCollectionsCommand);
  context.subscriptions.push(loadMoreFollowingCollectionsCommand);
  context.subscriptions.push(openCollectionItemCommand);
  context.subscriptions.push(refreshCollectionCommand);
  context.subscriptions.push(openCollectionInBrowserCommand);
  context.subscriptions.push(openCollectionItemInBrowserCommand);
  context.subscriptions.push(removeFromCollectionCommand);
  context.subscriptions.push(searchContentCommand);
  context.subscriptions.push(openArticleCommand);
  context.subscriptions.push(openInBrowserCommand);
  context.subscriptions.push(showFullImageCommand);
  context.subscriptions.push(setCookieCommand);
  context.subscriptions.push(clearCookieCommand);
  context.subscriptions.push(clearCollectionCacheCommand);
  context.subscriptions.push(toggleMediaCommand);
  context.subscriptions.push(setMediaModeNormalCommand);
  context.subscriptions.push(setMediaModeMiniCommand);
  context.subscriptions.push(setMediaModeNoneCommand);
  context.subscriptions.push(configureBrowserCommand);
  context.subscriptions.push(setCustomChromePathCommand);
  context.subscriptions.push(openFeedbackCommand);
  context.subscriptions.push(starOnGitHubCommand);
  context.subscriptions.push(buyMeCoffeeCommand);
  context.subscriptions.push(showAboutCommand);
  context.subscriptions.push(showGuideCommand);
  context.subscriptions.push(restartExtensionCommand);
  context.subscriptions.push(showTroubleshootingGuideCommand);
}

// 清理资源或执行其他必要的操作
export function deactivate() {
  console.log("🐟知乎摸鱼🐟 已停用！");
}
