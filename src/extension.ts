import * as vscode from "vscode";
import { ZhihuService } from "./core/zhihu/index";
import { registerAllCommands } from "./core/commands";
import { sidebarHotListDataProvider } from "./core/zhihu/sidebar/hot";
import { sidebarSearchListDataProvider } from "./core/zhihu/sidebar/search";
import { sidebarCollectionsDataProvider } from "./core/zhihu/sidebar/collections";
import { sidebarRecommendListDataProvider } from "./core/zhihu/sidebar/recommend";

export function activate(context: vscode.ExtensionContext) {
  console.log("🐟知乎摸鱼🐟 已激活！");

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
