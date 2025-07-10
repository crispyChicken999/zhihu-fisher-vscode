import * as vscode from 'vscode';
import { Store } from '../stores';
import { PuppeteerManager } from '../zhihu/puppeteer';

/**
 * 注册搜索相关命令
 * @param sidebarSearch 搜索侧边栏数据提供者
 */
export function registerSearchCommands(sidebarSearch: any): vscode.Disposable[] {
  const commands: vscode.Disposable[] = [];

  // 注册重置搜索结果命令
  const resetSearchListCommand = vscode.commands.registerCommand(
    "zhihu-fisher.resetSearchList",
    () => sidebarSearch.reset()
  );
  commands.push(resetSearchListCommand);

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
  commands.push(searchContentCommand);

  return commands;
}
