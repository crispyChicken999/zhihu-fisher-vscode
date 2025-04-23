import { StatusTreeItem, TreeItem } from "../../types";
import * as vscode from "vscode";
import { Store } from "../../stores";

/**
 * 侧边栏的知乎推荐-树数据提供者
 * 提供知乎推荐的数据，用于在侧边栏的树视图中显示
 */
export class sidebarRecommendListDataProvider
  implements vscode.TreeDataProvider<TreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    TreeItem | undefined | null | void
  > = new vscode.EventEmitter<TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    TreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private loadingStatusItem: vscode.StatusBarItem;

  constructor() {
    this.loadingStatusItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this.loadingStatusItem.text = "$(sync~spin) 加载知乎推荐中...";

    // 初始加载
    this.getRecommendList();
  }

  // 刷新树视图
  refresh(): void {
    console.log("触发知乎推荐刷新...");
    this.getRecommendList();
  }

  // 加载推荐内容
  private async getRecommendList(): Promise<void> {
    // 避免重复加载
    if (Store.Zhihu.recommend.isLoading) {
      console.log("正在加载中推荐，请稍候...");
      return;
    }

    try {
      Store.Zhihu.recommend.isLoading = true;
      this.loadingStatusItem.show();

      console.log("开始加载知乎推荐数据");
      this._onDidChangeTreeData.fire(); // 触发更新UI，显示加载状态

      await Store.Zhihu.recommendListManager.getRecommendList();
      const list = Store.Zhihu.recommend.list;
      console.log(`加载完成，获取到${list.length}个推荐项目`);

      Store.Zhihu.recommend.isLoading = false;
      this.loadingStatusItem.hide();
      this._onDidChangeTreeData.fire(); // 再次触发更新UI，显示加载结果

      if (list.length > 0) {
        vscode.window.showInformationMessage(
          `已更新知乎推荐，共${list.length}个推荐话题`
        );
      }
    } catch (error) {
      Store.Zhihu.recommend.isLoading = false;
      this.loadingStatusItem.hide();
      this._onDidChangeTreeData.fire(); // 触发更新UI，显示错误状态

      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("加载知乎推荐失败:", errorMsg);
    }
  }

  // 获取树项
  getTreeItem(element: TreeItem): vscode.TreeItem {
    return element;
  }

  // 获取子项
  async getChildren(element?: TreeItem): Promise<TreeItem[]> {
    if (element) {
      return []; // 推荐项没有子项
    }

    // 如果正在加载，显示一个加载项
    if (Store.Zhihu.recommend.isLoading) {
      return [
        new StatusTreeItem(
          "正在加载知乎推荐...",
          new vscode.ThemeIcon("loading~spin")
        ),
      ];
    }
    const list = Store.Zhihu.recommend.list;

    // 如果有缓存的推荐项目，直接返回
    if (list.length > 0) {
      return list.map(
        (item) =>
          new TreeItem(item, vscode.TreeItemCollapsibleState.None)
      );
    }

    // 如果没有数据也不在加载中，可能是初次加载失败，显示提示
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const cookie = config.get<string>("cookie") || "";

    if (!cookie) {
      // 如果没有设置cookie，显示需要设置cookie的提示
      return [
        new StatusTreeItem(
          "需要设置知乎Cookie才能获取推荐",
          new vscode.ThemeIcon("key"),
          {
            command: "zhihu-fisher.setCookie",
            title: "设置知乎Cookie",
          },
          "点我设置Cookie\n【获取方式】去到知乎首页，登陆自己的账号，然后点击F12打开开发者工具，\n选择Network选项卡，刷新页面，点击一个请求，找到请求头Request Headers，\n里面Cookie字段，复制值的所有内容，粘贴到VSCode的输入框里面。\n"
        ),
      ];
    }

    return [
      new StatusTreeItem(
        "获取推荐失败，点击刷新按钮重试",
        new vscode.ThemeIcon("error"),
        {
          command: "zhihu-fisher.refreshRecommendList",
          title: "刷新知乎推荐",
        },
        "点我刷新推荐"
      ),
    ];
  }
}
