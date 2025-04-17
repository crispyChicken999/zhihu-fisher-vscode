// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ZhihuTreeDataProvider } from "./services/zhihuTreeDataProvider";
import { ArticleViewManager } from "./services/articleViewManager";
import { ZhihuHotItem, ZhihuService } from "./services/zhihuService";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // 使用控制台输出诊断信息和错误信息
  console.log('恭喜，你的扩展 "zhihu-fisher" 已激活！');

  // 创建知乎服务实例
  const zhihuService = new ZhihuService();

  // 创建知乎热榜视图提供者
  const zhihuTreeDataProvider = new ZhihuTreeDataProvider(zhihuService);
  // 注册知乎热榜视图
  const treeView = vscode.window.createTreeView("zhihuHotList", {
    treeDataProvider: zhihuTreeDataProvider,
    showCollapseAll: false,
  });

  // 注册刷新热榜命令
  const refreshCommand = vscode.commands.registerCommand(
    "zhihu-fisher.refreshHotList",
    () => {
      zhihuTreeDataProvider.refresh();
      vscode.window.showInformationMessage("正在刷新知乎热榜...");
    }
  );

  // 注册打开文章命令
  const openArticleCommand = vscode.commands.registerCommand(
    "zhihu-fisher.openArticle",
    (item: ZhihuHotItem) => {
      const articleViewManager = ArticleViewManager.getInstance();
      articleViewManager.openArticle(item);
    }
  );

  // 注册设置Cookie命令
  const setCookieCommand = vscode.commands.registerCommand(
    "zhihu-fisher.setCookie",
    async () => {
      const success = await zhihuService.setCookie();
      if (success) {
        // 设置Cookie成功后刷新热榜
        zhihuTreeDataProvider.refresh();
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

          // 更新状态栏图标 (设置为提供视觉反馈)
          updateImageToggleIcon(!currentValue);
        });
    }
  );

  // 在首次激活时设置正确的图标状态
  updateImageToggleIcon(
    vscode.workspace
      .getConfiguration("zhihu-fisher")
      .get<boolean>("hideImages", false)
  );

  // 当配置变更时触发刷新
  vscode.workspace.onDidChangeConfiguration((e) => {
    // 只在非hideImages的配置变更时才刷新热榜
    if (
      e.affectsConfiguration("zhihu-fisher") &&
      !e.affectsConfiguration("zhihu-fisher.hideImages")
    ) {
      zhihuTreeDataProvider.refresh();
    }
  });

  // 将所有可处置对象添加到扩展上下文的订阅中
  context.subscriptions.push(treeView);
  context.subscriptions.push(refreshCommand);
  context.subscriptions.push(openArticleCommand);
  context.subscriptions.push(setCookieCommand);
  context.subscriptions.push(clearCookieCommand);
  context.subscriptions.push(toggleImageDisplayCommand);
}

// 更新图片切换图标状态
function updateImageToggleIcon(hideImages: boolean): void {
  // 这里可以将图标设置为带有斜线的图片图标，以表示图片已被禁用
  // 但VSCode API不直接支持动态更改命令图标，所以这里作为未来改进的占位符
  console.log(`图片显示模式已更新: ${hideImages ? "无图模式" : "显示图片"}`);
}

// This method is called when your extension is deactivated
export function deactivate() {}
