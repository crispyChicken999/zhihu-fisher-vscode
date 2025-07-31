import * as vscode from 'vscode';
import { Store } from '../stores';
import { WebviewManager } from '../zhihu/webview';
import { LinkItem } from '../types';

/**
 * 注册Webview相关命令
 */
export function registerWebviewCommands(): vscode.Disposable[] {
  const commands: vscode.Disposable[] = [];

  // 注册打开文章命令
  const openArticleCommand = vscode.commands.registerCommand(
    "zhihu-fisher.openArticle",
    (item: LinkItem, sourceType?: "collection" | "recommend" | "hot" | "search", collectionId?: string) => {
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

      // 根据item的id推断来源类型
      let inferredSourceType: "collection" | "recommend" | "hot" | "search" = "recommend";
      if (item.id.startsWith("collection-")) {
        inferredSourceType = "collection";
      } else if (item.id.startsWith("recommend-")) {
        inferredSourceType = "recommend";
      } else if (item.id.startsWith("hot-")) {
        inferredSourceType = "hot";
      } else if (item.id.startsWith("search-")) {
        inferredSourceType = "search";
      }

      const finalSourceType = sourceType || inferredSourceType;
      WebviewManager.openWebview(item, finalSourceType, collectionId);
    }
  );
  commands.push(openArticleCommand);

  // 注册在浏览器中打开命令
  const openInBrowserCommand = vscode.commands.registerCommand(
    "zhihu-fisher.openInBrowser",
    (item: any) => {
      if (item && item.listItem) {
        // 对于推荐列表，优先使用answerUrl（特定回答），否则使用url（问题页面）
        const urlToOpen = item.listItem.answerUrl || item.listItem.url;
        if (urlToOpen) {
          vscode.env.openExternal(vscode.Uri.parse(urlToOpen));
          // 提示用户打开的是什么类型的链接
          // const linkType = item.listItem.answerUrl && item.listItem.answerUrl !== item.listItem.url
          //   ? "特定回答"
          //   : item.listItem.type === "article" ? "文章" : "问题";
          // vscode.window.showInformationMessage(`已在浏览器中打开${linkType}: ${item.listItem.title}`);
        } else {
          vscode.window.showErrorMessage("无法获取链接地址");
        }
      } else {
        vscode.window.showErrorMessage("无法获取链接地址");
      }
    }
  );
  commands.push(openInBrowserCommand);

  return commands;
}
