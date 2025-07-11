import * as vscode from "vscode";
import { Store } from "./core/stores";
import { ZhihuService } from "./core/zhihu/index";
import { registerAllCommands } from "./core/commands";
import { sidebarHotListDataProvider } from "./core/zhihu/sidebar/hot";
import { sidebarSearchListDataProvider } from "./core/zhihu/sidebar/search";
import { sidebarCollectionsDataProvider } from "./core/zhihu/sidebar/collections";
import { sidebarRecommendListDataProvider } from "./core/zhihu/sidebar/recommend";
export function activate(context: vscode.ExtensionContext) {
  console.log("🐟知乎摸鱼🐟 已激活！");

  Store.context = context; // 保存上下文到全局 Store

  // 创建 知乎服务实例
  const zhihuService = new ZhihuService();

  // 侧边栏 推荐 列表
  const sidebarRecommend = new sidebarRecommendListDataProvider();
  const recommendListView = vscode.window.createTreeView("zhihuRecommendList", {
    treeDataProvider: sidebarRecommend,
    showCollapseAll: false,
  });
  sidebarRecommend.setTreeView(recommendListView);

  // 侧边栏 热榜 列表
  const sidebarHot = new sidebarHotListDataProvider();
  const hotListView = vscode.window.createTreeView("zhihuHotList", {
    treeDataProvider: sidebarHot,
    showCollapseAll: false,
  });
  sidebarHot.setTreeView(hotListView);

  // 侧边栏 搜索 列表
  const sidebarSearch = new sidebarSearchListDataProvider();
  const searchListView = vscode.window.createTreeView("zhihuSearchList", {
    treeDataProvider: sidebarSearch,
    showCollapseAll: false,
  });
  sidebarSearch.setTreeView(searchListView);

  // 侧边栏 收藏 列表
  const sidebarCollections = new sidebarCollectionsDataProvider();
  const collectionsListView = vscode.window.createTreeView(
    "zhihuCollectionsList",
    {
      treeDataProvider: sidebarCollections,
      showCollapseAll: true,
    }
  );
  sidebarCollections.setTreeView(collectionsListView);

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

  registerAllCommands(context, {
    zhihuService,
    sidebarHot,
    sidebarRecommend,
    sidebarSearch,
    sidebarCollections,
  });
}

// 清理资源或执行其他必要的操作
export function deactivate() {
  console.log("🐟知乎摸鱼🐟 已停用！");
  ZhihuService.cleanup(); // 清理知乎服务资源
}
