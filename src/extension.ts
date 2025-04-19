import * as vscode from "vscode";
import { Store } from "./core/stores";
import { LinkItem } from "./core/types";
import { ZhihuService } from "./core/zhihu/index";
import { sidebarHotListDataProvider } from "./core/zhihu/sidebar/hot";
import { sidebarRecommendListDataProvider } from "./core/zhihu/sidebar/recommend";

export function activate(context: vscode.ExtensionContext) {
  console.log("🐟知乎摸鱼🐟 已激活！");

  // 创建知乎服务实例
  const zhihuService = new ZhihuService();

  // 创建知乎推荐视图提供者，让推荐先开始爬，热榜很快就加载完成的
  const sidebarRecommendList = new sidebarRecommendListDataProvider();
  // 注册知乎推荐视图
  const recommendListView = vscode.window.createTreeView("zhihuRecommendList", {
    treeDataProvider: sidebarRecommendList,
    showCollapseAll: false,
  });

  // 创建知乎热榜视图提供者
  const sidebarHotList = new sidebarHotListDataProvider();
  // 注册知乎热榜视图
  const hotListView = vscode.window.createTreeView("zhihuHotList", {
    treeDataProvider: sidebarHotList,
    showCollapseAll: false,
  });

  // 注册刷新热榜命令
  const refreshHotListCommand = vscode.commands.registerCommand(
    "zhihu-fisher.refreshHotList",
    () => {
      sidebarHotList.refresh();
      vscode.window.showInformationMessage("正在刷新知乎热榜...");
    }
  );

  // 注册刷新推荐命令
  const refreshRecommendListCommand = vscode.commands.registerCommand(
    "zhihu-fisher.refreshRecommendList",
    () => {
      sidebarRecommendList.refresh();
      vscode.window.showInformationMessage("正在刷新知乎推荐...");
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

      const webviewManager = Store.webviewManager;
      // webviewManager.watchVscodeWindowEvents();
      webviewManager.openWebview(item);
    }
  );

  // 注册设置Cookie命令
  const setCookieCommand = vscode.commands.registerCommand(
    "zhihu-fisher.setCookie",
    async () => {
      const success = await zhihuService.setCookie();
      if (success) {
        // 设置Cookie成功后刷新热榜和推荐
        sidebarHotList.refresh();
        sidebarRecommendList.refresh();
      }
    }
  );

  // 注册清除Cookie命令
  const clearCookieCommand = vscode.commands.registerCommand(
    "zhihu-fisher.clearCookie",
    () => {
      zhihuService.clearCookie();
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

  // 当配置变更时触发刷新
  vscode.workspace.onDidChangeConfiguration((e) => {
    // 只在非hideImages的配置变更时才刷新热榜和推荐
    if (
      e.affectsConfiguration("zhihu-fisher") &&
      !e.affectsConfiguration("zhihu-fisher.hideImages")
    ) {
      sidebarHotList.refresh();
      sidebarRecommendList.refresh();
    }
  });

  // 将所有可处置对象添加到扩展上下文的订阅中
  context.subscriptions.push(hotListView);
  context.subscriptions.push(recommendListView);
  context.subscriptions.push(refreshHotListCommand);
  context.subscriptions.push(refreshRecommendListCommand);
  context.subscriptions.push(openArticleCommand);
  context.subscriptions.push(setCookieCommand);
  context.subscriptions.push(clearCookieCommand);
  context.subscriptions.push(toggleImageDisplayCommand);
}

export function deactivate() {
  console.log("🐟知乎摸鱼🐟 已停用！");
  // 清理资源或执行其他必要的操作
}
