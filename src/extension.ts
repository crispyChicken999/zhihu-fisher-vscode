import * as vscode from "vscode";
import { Store } from "./core/stores";
import { ZhihuService } from "./core/zhihu/index";
import { WebviewManager } from "./core/zhihu/webview";
import { registerAllCommands } from "./core/commands";
import { sidebarHotListDataProvider } from "./core/zhihu/sidebar/hot";
import { sidebarSearchListDataProvider } from "./core/zhihu/sidebar/search";
import { SidebarDisguiseManager } from "./core/utils/sidebar-disguise-manager";
import { sidebarCollectionsDataProvider } from "./core/zhihu/sidebar/collections";
import { sidebarRecommendListDataProvider } from "./core/zhihu/sidebar/recommend";
import { sidebarFollowListDataProvider } from "./core/zhihu/sidebar/follow";

export function activate(context: vscode.ExtensionContext) {
  console.log("🐟知乎摸鱼🐟 已激活！");

  Store.context = context; // 保存上下文到全局 Store

  // 初始化侧边栏伪装管理器
  SidebarDisguiseManager.getInstance().initialize(context).catch((error) => {
    console.error('初始化侧边栏伪装管理器失败:', error);
  });

  // 创建 知乎服务实例
  const zhihuService = new ZhihuService();

  // 侧边栏 推荐 列表
  const sidebarRecommend = new sidebarRecommendListDataProvider();
  const recommendListView = vscode.window.createTreeView("zhihuRecommendList", {
    treeDataProvider: sidebarRecommend,
    showCollapseAll: false,
  });
  sidebarRecommend.setTreeView(recommendListView);

  // 侧边栏 关注 列表
  const sidebarFollow = new sidebarFollowListDataProvider();
  const followListView = vscode.window.createTreeView("zhihuFollowList", {
    treeDataProvider: sidebarFollow,
    showCollapseAll: false,
  });
  sidebarFollow.setTreeView(followListView);

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
      if (
        e.affectsConfiguration("zhihu-fisher.mediaDisplayMode") ||
        e.affectsConfiguration("zhihu-fisher.miniMediaScale")
      ) {
        // 媒体显示模式变更时，需要刷新所有侧边栏以更新图片显示
        console.log("媒体显示模式已变更，刷新侧边栏显示");
        // 使用新的 refreshView 方法来更新视图，而不重新加载数据
        sidebarHot.refreshView();
        sidebarRecommend.refreshView();
        sidebarFollow.refreshView();
        sidebarSearch.refreshView();
        sidebarCollections.refreshView();
      }

      if (e.affectsConfiguration("zhihu-fisher.debugMode")) {
        // 调试模式变更时，提示用户重启扩展
        console.log("调试模式设置已变更");
        vscode.window.showInformationMessage(
          "调试模式设置已变更，请重启扩展使设置生效。",
          "重启扩展"
        ).then((selection) => {
          if (selection === "重启扩展") {
            vscode.commands.executeCommand("zhihu-fisher.restartExtension");
          }
        });
      }
    }
  });

  // 监听 VSCode 窗口在操作系统层面的焦点变化
  // panel.onDidChangeViewState 只能感知"标签页在 VSCode 内部是否被切走"，
  // Alt+Tab 切到其他应用时，当前标签页在 VSCode 内部依然是 active 状态，
  // 不会触发该事件。这里补上窗口级别的焦点检测，覆盖"切到别的应用"这个场景。
  context.subscriptions.push(
    vscode.window.onDidChangeWindowState((windowState) => {
      if (windowState.focused) {
        // 重新聚焦时不自动恢复正常界面：切回来的瞬间自动摘伪装反而最容易被看到，
        // 保持伪装状态，交由用户自己按空格或工具栏按钮手动摘掉
        return;
      }

      for (const [webviewId, item] of Store.webviewMap) {
        if (!item.webviewPanel.active) {
          // 非当前激活的标签页，其伪装状态已由 onDidChangeViewState 处理，跳过
          continue;
        }
        WebviewManager.disguiseWebviewAppearance(webviewId);
      }
    })
  );

  registerAllCommands(context, {
    zhihuService,
    sidebarHot,
    sidebarRecommend,
    sidebarFollow,
    sidebarSearch,
    sidebarCollections,
  });
}

// 清理资源或执行其他必要的操作
export async function deactivate() {
  console.log("🐟知乎摸鱼🐟 开始停用...");
  try {
    await ZhihuService.cleanup(); // 清理知乎服务资源
    console.log("🐟知乎摸鱼🐟 已成功停用！");
  } catch (error) {
    console.error("🐟知乎摸鱼🐟 停用时出错:", error);
  }
}
