import * as vscode from 'vscode';
import { PuppeteerManager } from '../zhihu/puppeteer';

/**
 * 注册Cookie相关命令
 * @param zhihuService 知乎服务实例
 * @param sidebarHot 热榜侧边栏数据提供者
 * @param sidebarRecommend 推荐侧边栏数据提供者
 * @param sidebarSearch 搜索侧边栏数据提供者
 */
export function registerCookieCommands(
  zhihuService: any,
  sidebarHot: any,
  sidebarRecommend: any,
  sidebarSearch: any,
  sidebarCollections: any
): vscode.Disposable[] {
  const commands: vscode.Disposable[] = [];

  // 注册设置Cookie命令
  const setCookieCommand = vscode.commands.registerCommand(
    "zhihu-fisher.setCookie",
    async () => {
      const success = await zhihuService.setCookie();
      if (success) {
        try {
          // 设置Cookie成功后，首先需要看看能不能创建爬虫浏览器
          await PuppeteerManager.canCreateBrowser();
          // 如果能创建成功，那么就继续下一步操作
          console.log("创建爬虫浏览器成功，开始加载热榜和推荐列表...");
        } catch (error) {
          console.error("创建爬虫浏览器失败:", error);
          return;
        }
        // 设置Cookie成功后刷新热榜、推荐和搜索列表
        sidebarHot.refresh();
        sidebarRecommend.refresh();
        sidebarSearch.reset();
        sidebarCollections.reset();
      }
    }
  );
  commands.push(setCookieCommand);

  // 注册清除Cookie命令
  const clearCookieCommand = vscode.commands.registerCommand(
    "zhihu-fisher.clearCookie",
    () => {
      zhihuService.clearCookie();
      sidebarHot.refresh();
      sidebarRecommend.refresh();
      sidebarSearch.reset();
      sidebarCollections.reset();
    }
  );
  commands.push(clearCookieCommand);

  return commands;
}
