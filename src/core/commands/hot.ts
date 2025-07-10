import * as vscode from 'vscode';
import { sidebarHotListDataProvider } from '../zhihu/sidebar/hot';

/**
 * 注册热榜相关命令
 * @param sidebarHot 热榜侧边栏数据提供者
 */
export function registerHotCommands(sidebarHot: sidebarHotListDataProvider): vscode.Disposable[] {
  const commands: vscode.Disposable[] = [];

  // 注册刷新热榜命令
  const refreshHotListCommand = vscode.commands.registerCommand(
    "zhihu-fisher.refreshHotList",
    () => sidebarHot.refresh()
  );
  commands.push(refreshHotListCommand);

  return commands;
}
