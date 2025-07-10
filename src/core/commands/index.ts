import * as vscode from 'vscode';
import { registerHotCommands } from './hot';
import { registerMediaCommands } from './media';
import { registerGeneralCommands } from './general';
import { registerSearchCommands } from './search';
import { registerBrowserCommands } from './browser';
import { registerWebviewCommands } from './webview';
import { registerCookieCommands } from './cookie';
import { registerCollectionCommands } from './collection';
import { registerRecommendCommands } from './recommend';
import { registerAboutCommands } from './about';

/**
 * 注册所有命令
 * @param context VSCode扩展上下文
 * @param dependencies 命令依赖的服务和组件
 */
export function registerAllCommands(
  context: vscode.ExtensionContext,
  dependencies: {
    zhihuService: any;
    sidebarHot: any;
    sidebarRecommend: any;
    sidebarSearch: any;
    sidebarCollections: any;
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
