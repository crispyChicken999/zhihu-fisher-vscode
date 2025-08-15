import * as vscode from 'vscode';
import { ZhihuService } from '../zhihu';
import { registerHotCommands } from './hot';
import { registerAboutCommands } from './about';
import { registerMediaCommands } from './media';
import { registerSearchCommands } from './search';
import { registerCookieCommands } from './cookie';
import { registerBrowserCommands } from './browser';
import { registerWebviewCommands } from './webview';
import { registerGeneralCommands } from './general';
import { registerRecommendCommands } from './recommend';
import { registerCollectionCommands } from './collection';
import { registerWebviewNavigationCommands } from './webview-navigation';
import { sidebarHotListDataProvider } from '../zhihu/sidebar/hot';
import { sidebarSearchListDataProvider } from '../zhihu/sidebar/search';
import { sidebarCollectionsDataProvider } from '../zhihu/sidebar/collections';
import { sidebarRecommendListDataProvider } from '../zhihu/sidebar/recommend';

/**
 * 注册所有命令
 * @param context VSCode扩展上下文
 * @param dependencies 命令依赖的服务和组件
 */
export function registerAllCommands(
  context: vscode.ExtensionContext,
  dependencies: {
    zhihuService: ZhihuService;
    sidebarHot: sidebarHotListDataProvider;
    sidebarRecommend: sidebarRecommendListDataProvider;
    sidebarSearch: sidebarSearchListDataProvider;
    sidebarCollections: sidebarCollectionsDataProvider;
  }
) {
  // 注册各类命令
  const { zhihuService, sidebarHot, sidebarRecommend, sidebarSearch, sidebarCollections } = dependencies;

  const subscriptions = [
    ...registerHotCommands(sidebarHot),
    ...registerMediaCommands(),
    ...registerGeneralCommands(),
    ...registerSearchCommands(sidebarSearch),
    ...registerBrowserCommands(),
    ...registerWebviewCommands(),
    ...registerWebviewNavigationCommands(),
    ...registerCookieCommands(zhihuService, sidebarHot, sidebarRecommend, sidebarSearch, sidebarCollections),
    ...registerCollectionCommands(sidebarCollections),
    ...registerRecommendCommands(sidebarRecommend),
    ...registerAboutCommands()
  ];

  // 将所有命令添加到订阅中
  subscriptions.forEach(command => {
    context.subscriptions.push(command);
  });
}
