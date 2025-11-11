import * as vscode from "vscode";
import { sidebarFollowListDataProvider } from "../zhihu/sidebar/follow";
import { LinkItem } from "../types";
import { Store } from "../stores";

/**
 * 注册关注相关命令
 * @param sidebarFollow 关注列表数据提供者
 */
export function registerFollowCommands(
  sidebarFollow: sidebarFollowListDataProvider
): vscode.Disposable[] {
  const commands: vscode.Disposable[] = [];

  // 刷新关注列表
  const refreshFollowListCommand = vscode.commands.registerCommand(
    "zhihu-fisher.refreshFollowList",
    () => {
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

      console.log("执行刷新关注列表命令");
      sidebarFollow.refresh();
    }
  );
  commands.push(refreshFollowListCommand);

  // 不喜欢关注的内容
  const dislikeFollowContentCommand = vscode.commands.registerCommand(
    "zhihu-fisher.dislikeFollowContent",
    async (item: LinkItem) => {
      console.log("执行不喜欢关注内容命令:", item.title);
      await sidebarFollow.dislikeContent(item);
    }
  );
  commands.push(dislikeFollowContentCommand);

  // 不再推荐该作者（关注内容）
  const dislikeFollowAuthorCommand = vscode.commands.registerCommand(
    "zhihu-fisher.dislikeFollowAuthor",
    async (item: LinkItem) => {
      console.log("执行不再推荐关注作者命令:", item.title);
      await sidebarFollow.dislikeAuthor(item);
    }
  );
  commands.push(dislikeFollowAuthorCommand);

  // 收藏关注的内容
  const favoriteFollowContentCommand = vscode.commands.registerCommand(
    "zhihu-fisher.favoriteFollowContent",
    async (item: LinkItem) => {
      console.log("执行收藏关注内容命令:", item.title);
      await sidebarFollow.favoriteContent(item);
    }
  );
  commands.push(favoriteFollowContentCommand);

  // 清空关注列表
  const clearFollowListCommand = vscode.commands.registerCommand(
    "zhihu-fisher.clearFollowList",
    () => {
      console.log("执行清空关注列表命令");
      sidebarFollow.clearList();
      vscode.window.showInformationMessage("已清空关注列表");
    }
  );
  commands.push(clearFollowListCommand);

  // 加载更多关注内容
  const loadMoreFollowContentCommand = vscode.commands.registerCommand(
    "zhihu-fisher.loadMoreFollowContent",
    async () => {
      console.log("执行加载更多关注内容命令");
      await sidebarFollow.loadMoreFollowContent();
    }
  );
  commands.push(loadMoreFollowContentCommand);

  console.log("关注命令已注册");
  return commands;
}
