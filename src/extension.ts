import * as vscode from "vscode";
import { Store } from "./core/stores";
import { LinkItem } from "./core/types";
import { ZhihuService } from "./core/zhihu/index";
import { PuppeteerManager } from "./core/zhihu/puppeteer";
import { sidebarHotListDataProvider } from "./core/zhihu/sidebar/hot";
import { sidebarSearchListDataProvider } from "./core/zhihu/sidebar/search";
import { sidebarRecommendListDataProvider } from "./core/zhihu/sidebar/recommend";

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

  // 侧边栏 热榜 列表
  const sidebarHot = new sidebarHotListDataProvider();
  const hotListView = vscode.window.createTreeView("zhihuHotList", {
    treeDataProvider: sidebarHot,
    showCollapseAll: false,
  });

  // 侧边栏 搜索 列表
  const sidebarSearch = new sidebarSearchListDataProvider();
  const searchListView = vscode.window.createTreeView("zhihuSearchList", {
    treeDataProvider: sidebarSearch,
    showCollapseAll: false,
  });

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

  // 注册重置搜索结果
  const resetSearchListCommand = vscode.commands.registerCommand(
    "zhihu-fisher.resetSearchList",
    () => sidebarSearch.refresh()
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
    (item: LinkItem) => {
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

      const webviewManager = Store.webviewManager;
      webviewManager.openWebview(item);
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
        sidebarSearch.refresh();
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
      sidebarSearch.refresh();
      vscode.window.showInformationMessage("已清除知乎Cookie");
    }
  );

  // 注册切换图片显示命令
  const toggleImageDisplayCommand = vscode.commands.registerCommand(
    "zhihu-fisher.toggleImageDisplay",
    () => {
      const config = vscode.workspace.getConfiguration("zhihu-fisher");
      const currentValue = config.get<boolean>("hideImages", false);

      // 切换值
      config
        .update("hideImages", !currentValue, vscode.ConfigurationTarget.Global)
        .then(() => {
          // 提示用户
          const statusText = !currentValue
            ? "已关闭图片显示"
            : "已启用图片显示";
          vscode.window.showInformationMessage(
            `${statusText}，重新打开文章可应用设置`
          );
        });
    }
  );

  // 安装浏览器命令
  const installBrowserCommand = vscode.commands.registerCommand(
    "zhihu-fisher.installBrowser",
    async () => {
      const title = "安装Puppeteer内置浏览器";
      const message =
        "请在终端中运行以下命令安装浏览器：\n" +
        "npx puppeteer browsers install chrome@135.0.7049.84\n" +
        "\n" +
        "点击【安装浏览器】按钮会自动开始安装\n" +
        "\n" +
        "【安装目录】\n" +
        "C:\\Users\\{USERNAME}\\.cache\\puppeteer\\chrome\n" +
        "\\win64-135.0.7049.84\\chrome-win64\\chrome.exe\n" +
        "\n" +
        "【注意】安装完成后，请重启VSCode。\n" +
        "\n" +
        "【可能遇到的问题】\n" +
        "1. 如果提示 npx 指令运行失败：请检查是否安装了 Node.js 和 NPM \n" +
        "2. Node.js 和 npm 已安装，但仍然提示 npx 指令运行失败：那么可以使用\n" +
        "   npm install -g npx 来安装 NPX\n";
      const installBrowserAction = "安装浏览器";
      const installNpxAction = "安装NPX";

      const selection = await vscode.window.showInformationMessage(
        title,
        {
          modal: true,
          detail: message,
        },
        installBrowserAction,
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
      }
    }
  );

  // 当配置变更时触发刷新
  vscode.workspace.onDidChangeConfiguration((e) => {
    // 只在非hideImages的配置变更时才刷新热榜和推荐
    if (
      e.affectsConfiguration("zhihu-fisher") &&
      !e.affectsConfiguration("zhihu-fisher.hideImages")
    ) {
      sidebarHot.refresh();
      sidebarRecommend.refresh();
      sidebarSearch.refresh();
    }
  });

  // 将所有可处置对象添加到扩展上下文的订阅中
  context.subscriptions.push(hotListView);
  context.subscriptions.push(recommendListView);
  context.subscriptions.push(searchListView);
  context.subscriptions.push(refreshHotListCommand);
  context.subscriptions.push(refreshRecommendListCommand);
  context.subscriptions.push(resetSearchListCommand);
  context.subscriptions.push(searchContentCommand);
  context.subscriptions.push(openArticleCommand);
  context.subscriptions.push(setCookieCommand);
  context.subscriptions.push(clearCookieCommand);
  context.subscriptions.push(toggleImageDisplayCommand);
  context.subscriptions.push(installBrowserCommand);
}

// 清理资源或执行其他必要的操作
export function deactivate() {
  console.log("🐟知乎摸鱼🐟 已停用！");
}
