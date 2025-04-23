import { StatusTreeItem, TreeItem } from "../../types";
import * as vscode from "vscode";
import { Store } from "../../stores";

/**
 * 侧边栏的知乎搜索-树数据提供者
 * 提供知乎搜索的数据，用于在侧边栏的树视图中显示
 */
export class sidebarSearchListDataProvider
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
    this.loadingStatusItem.text = "$(sync~spin) 加载知乎搜索结果中...";
  }

  // 刷新树视图
  refresh(): void {
    console.log("触发知乎搜索结果刷新...");
    this.searchContent("");
  }

  // 执行搜索
  async searchContent(query: string): Promise<void> {
    // 避免重复加载
    if (Store.Zhihu.search.isLoading) {
      console.log("正在加载中搜索结果，请稍候...");
      vscode.window.showInformationMessage("正在搜索中，请稍候...");
      return;
    }

    try {
      Store.Zhihu.search.isLoading = true;
      this.loadingStatusItem.show();
      this._onDidChangeTreeData.fire(); // 触发更新UI，显示加载状态

      if (query) {
        await Store.Zhihu.searchManager.search(query);
      }
      const list = Store.Zhihu.search.list;
      console.log(`搜索完成，获取到${list.length}个搜索结果`);

      Store.Zhihu.search.isLoading = false;
      this.loadingStatusItem.hide();
      this._onDidChangeTreeData.fire(); // 再次触发更新UI，显示搜索结果

      if (list.length > 0) {
        vscode.window.showInformationMessage(
          `搜索完成，共找到${list.length}条相关内容`
        );
      } else {
        if (query) {
          vscode.window.showInformationMessage(
            `搜索完成，但没有找到与"${query}"相关的内容`
          );
        }
      }
    } catch (error) {
      Store.Zhihu.search.isLoading = false;
      this.loadingStatusItem.hide();
      this._onDidChangeTreeData.fire(); // 触发更新UI，显示错误状态

      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("知乎搜索失败:", errorMsg);
      vscode.window.showErrorMessage(`知乎搜索失败: ${errorMsg}`);
    }
  }

  // 获取树项
  getTreeItem(element: TreeItem): vscode.TreeItem {
    return element;
  }

  // 获取子项
  async getChildren(element?: TreeItem): Promise<TreeItem[]> {
    if (element) {
      return []; // 搜索结果项没有子项
    }

    // 如果没有数据也不在加载中，可能是初次加载失败，显示提示
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const cookie = config.get<string>("cookie") || "";

    if (!cookie) {
      // 如果没有设置cookie，显示需要设置cookie的提示
      return [
        new StatusTreeItem(
          "需要设置知乎Cookie才能搜索内容",
          new vscode.ThemeIcon("key"),
          {
            command: "zhihu-fisher.setCookie",
            title: "设置知乎Cookie",
          },
          "点我设置Cookie\n【获取方式】去到知乎首页，登陆自己的账号，然后点击F12打开开发者工具，\n选择Network选项卡，刷新页面，点击一个请求，找到请求头Request Headers，\n里面Cookie字段，复制值的所有内容，粘贴到VSCode的输入框里面。\n"
        ),
      ];
    }

    // 如果正在加载，显示一个加载项
    if (Store.Zhihu.search.isLoading) {
      return [
        new StatusTreeItem(
          `🔍正在知乎搜索【${Store.Zhihu.search.currentQuery}】🔍...`,
          new vscode.ThemeIcon("loading~spin"),
          null,
          "你看，又急~你干嘛哎哟👉🤡"
        ),
      ];
    }

    const list = Store.Zhihu.search.list;
    const query = Store.Zhihu.search.currentQuery;

    // 如果有搜索结果，直接返回
    if (list && list.length > 0) {
      // 在顶部添加搜索按钮和当前搜索关键词信息
      const searchButtonItem = new StatusTreeItem(
        `🔍点我重新搜索🔍 (～￣▽￣)～ 当前搜索：🔮 ${query} 🔮`,
        new vscode.ThemeIcon("search"),
        {
          command: "zhihu-fisher.searchContent",
          title: "搜索知乎内容",
        },
        "点我输入关键词重新搜索"
      );

      // 创建结果列表树项
      const resultItems = list.map(
        (item) => new TreeItem(item, vscode.TreeItemCollapsibleState.None)
      );

      return [searchButtonItem, ...resultItems];
    }

    // 初始状态，只显示搜索按钮
    return [
      new StatusTreeItem(
        "点我搜索知乎内容",
        new vscode.ThemeIcon("search"),
        {
          command: "zhihu-fisher.searchContent",
          title: "搜索知乎内容",
        },
        "点我点我点我o(*￣▽￣*)o"
      ),
    ];
  }
}
