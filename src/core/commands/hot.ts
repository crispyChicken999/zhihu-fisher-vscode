import * as vscode from 'vscode';

/**
 * 注册热榜相关命令
 * @param sidebarHot 热榜侧边栏数据提供者
 */
export function registerHotCommands(sidebarHot: any): vscode.Disposable[] {
  const commands: vscode.Disposable[] = [];

  // 注册刷新热榜命令
  const refreshHotListCommand = vscode.commands.registerCommand(
    "zhihu-fisher.refreshHotList",
    () => sidebarHot.refresh()
  );
  commands.push(refreshHotListCommand);

  return commands;
}
