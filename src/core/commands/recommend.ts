import * as vscode from 'vscode';

/**
 * 注册推荐列表相关命令
 * @param sidebarRecommend 推荐列表侧边栏数据提供者
 */
export function registerRecommendCommands(sidebarRecommend: any): vscode.Disposable[] {
  const commands: vscode.Disposable[] = [];

  // 注册刷新推荐命令
  const refreshRecommendListCommand = vscode.commands.registerCommand(
    "zhihu-fisher.refreshRecommendList",
    () => sidebarRecommend.refresh()
  );
  commands.push(refreshRecommendListCommand);

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
  commands.push(dislikeRecommendItemCommand);

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
  commands.push(dislikeAuthorCommand);

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
  commands.push(favoriteRecommendItemCommand);

  return commands;
}
