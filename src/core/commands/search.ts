import * as vscode from 'vscode';
import { Store } from '../stores';
import { PuppeteerManager } from '../zhihu/puppeteer';
import { sidebarSearchListDataProvider } from '../zhihu/sidebar/search';

/**
 * 注册搜索相关命令
 * @param sidebarSearch 搜索侧边栏数据提供者
 */
export function registerSearchCommands(sidebarSearch: sidebarSearchListDataProvider): vscode.Disposable[] {
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

      // 检查搜索列表是否正在加载中
      if (Store.Zhihu.search.isLoading) {
        vscode.window.showInformationMessage(
          "搜索结果正在加载中，请稍候再试..."
        );
        return;
      }

      // 检查收藏列表是否正在加载中
      if (Store.Zhihu.collections.isLoading) {
        vscode.window.showInformationMessage(
          "收藏列表正在加载中，请稍候再试..."
        );
        return;
      }

      // 检查关注列表是否正在加载中
      if (Store.Zhihu.follow.isLoading) {
        vscode.window.showInformationMessage(
          "关注列表正在加载中，请稍候再试..."
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

  // 收藏搜索项命令
  const favoriteSearchItemCommand = vscode.commands.registerCommand(
    "zhihu-fisher.favoriteSearchItem",
    async (item: any) => {
      if (item && item.listItem) {
        await sidebarSearch.favoriteContent(item.listItem);
      } else {
        vscode.window.showErrorMessage("无法获取内容信息");
      }
    }
  );
  commands.push(favoriteSearchItemCommand);

  return commands;
}
