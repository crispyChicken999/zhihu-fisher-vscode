import * as vscode from "vscode";
import { ZhihuHotItem, ZhihuService } from "./zhihuService";

// 知乎热榜树节点类
export class ZhihuTreeItem extends vscode.TreeItem {
  constructor(
    public readonly hotItem: ZhihuHotItem,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(hotItem.title, collapsibleState);

    this.tooltip = hotItem.excerpt || hotItem.title;
    this.description = hotItem.hotValue;
    this.id = hotItem.id;
    this.command = {
      command: "zhihu-fisher.openArticle",
      title: "打开文章",
      arguments: [hotItem],
    };
  }

  // 使用问答图标
  iconPath = new vscode.ThemeIcon("comment-discussion");

  contextValue = "zhihuHotItem";
}

// 状态显示树节点（加载中、错误等）
export class ZhihuStatusTreeItem extends ZhihuTreeItem {
  constructor(
    label: string,
    icon?: vscode.ThemeIcon,
    command?: vscode.Command
  ) {
    // 创建一个伪热榜项
    const statusItem: ZhihuHotItem = {
      id: `status-${Date.now()}`,
      title: label,
      url: "",
    };

    super(statusItem, vscode.TreeItemCollapsibleState.None);

    // 覆盖默认图标
    if (icon) {
      this.iconPath = icon;
    }

    // 覆盖默认命令
    if (command) {
      this.command = command;
    } else {
      this.command = undefined; // 清除命令，状态项不可点击
    }
  }
}

// 知乎热榜树数据提供者
export class ZhihuTreeDataProvider
  implements vscode.TreeDataProvider<ZhihuTreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    ZhihuTreeItem | undefined | null | void
  > = new vscode.EventEmitter<ZhihuTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    ZhihuTreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private hotItems: ZhihuHotItem[] = [];
  private zhihuService: ZhihuService;
  private isLoading = false;
  private loadingStatusItem: vscode.StatusBarItem;

  constructor(zhihuService: ZhihuService) {
    this.zhihuService = zhihuService;
    this.loadingStatusItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this.loadingStatusItem.text = "$(sync~spin) 加载知乎热榜中...";

    // 初始加载
    this.loadHotList();
  }

  // 刷新树视图
  refresh(): void {
    console.log("触发知乎热榜刷新...");
    this.loadHotList();
  }

  // 加载热榜内容
  private async loadHotList(): Promise<void> {
    // 避免重复加载
    if (this.isLoading) {
      console.log("正在加载中，忽略重复请求");
      return;
    }

    try {
      this.isLoading = true;
      this.loadingStatusItem.show();

      console.log("开始加载知乎热榜数据");
      this._onDidChangeTreeData.fire(); // 触发更新UI，显示加载状态

      this.hotItems = await this.zhihuService.getHotList();
      console.log(`加载完成，获取到${this.hotItems.length}个热榜项目`);

      this.isLoading = false;
      this.loadingStatusItem.hide();
      this._onDidChangeTreeData.fire(); // 再次触发更新UI，显示加载结果

      if (this.hotItems.length > 0) {
        vscode.window.showInformationMessage(
          `已更新知乎热榜，共${this.hotItems.length}个热门话题`
        );
      }
    } catch (error) {
      this.isLoading = false;
      this.loadingStatusItem.hide();
      this._onDidChangeTreeData.fire(); // 触发更新UI，显示错误状态

      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("加载知乎热榜失败:", errorMsg);
      
      // 不总是显示错误消息，因为ZhihuService中已经有提示
      if (!errorMsg.includes("Cookie")) {
        vscode.window.showErrorMessage(`加载知乎热榜失败: ${errorMsg}`);
      }
    }
  }

  // 获取树项
  getTreeItem(element: ZhihuTreeItem): vscode.TreeItem {
    return element;
  }

  // 获取子项
  async getChildren(element?: ZhihuTreeItem): Promise<ZhihuTreeItem[]> {
    if (element) {
      return []; // 热榜项没有子项
    }

    // 如果正在加载，显示一个加载项
    if (this.isLoading) {
      return [
        new ZhihuStatusTreeItem(
          "正在加载知乎热榜...", 
          new vscode.ThemeIcon("loading~spin")
        )
      ];
    }

    // 如果有缓存的热榜项目，直接返回
    if (this.hotItems.length > 0) {
      return this.hotItems.map(
        (item) => new ZhihuTreeItem(item, vscode.TreeItemCollapsibleState.None)
      );
    }

    // 如果没有数据也不在加载中，可能是初次加载失败，显示提示
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const cookie = config.get<string>("cookie") || "";
    
    if (!cookie) {
      // 如果没有设置cookie，显示需要设置cookie的提示
      return [
        new ZhihuStatusTreeItem(
          "需要设置知乎Cookie才能获取热榜", 
          new vscode.ThemeIcon("key"),
          {
            command: "zhihu-fisher.setCookie",
            title: "设置知乎Cookie",
          }
        )
      ];
    }

    return [
      new ZhihuStatusTreeItem(
        "获取热榜失败，点击刷新按钮重试", 
        new vscode.ThemeIcon("error"),
        {
          command: "zhihu-fisher.refreshHotList",
          title: "刷新知乎热榜",
        }
      )
    ];
  }
}
