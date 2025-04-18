import * as vscode from "vscode";
import { ZhihuHotItem, ZhihuService } from "./zhihuService";
import { ZhihuStatusTreeItem, ZhihuTreeItem } from "../models/zhihuTreeItems";

/**
 * 知乎推荐树数据提供者
 * 提供知乎首页推荐内容，用于在侧边栏的树视图中显示
 */
export class ZhihuRecommendDataProvider
  implements vscode.TreeDataProvider<ZhihuTreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    ZhihuTreeItem | undefined | null | void
  > = new vscode.EventEmitter<ZhihuTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    ZhihuTreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private recommendItems: ZhihuHotItem[] = [];
  private zhihuService: ZhihuService;
  private isLoading = false;
  private loadingStatusItem: vscode.StatusBarItem;

  constructor(zhihuService: ZhihuService) {
    this.zhihuService = zhihuService;
    this.loadingStatusItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this.loadingStatusItem.text = "$(sync~spin) 加载知乎推荐中...";

    // 初始加载
    this.loadRecommendList();
  }

  // 刷新树视图
  refresh(): void {
    console.log("触发知乎推荐刷新...");
    this.loadRecommendList();
  }

  // 加载推荐内容
  private async loadRecommendList(): Promise<void> {
    // 避免重复加载
    if (this.isLoading) {
      console.log("正在加载中，忽略重复请求");
      return;
    }

    try {
      this.isLoading = true;
      this.loadingStatusItem.show();

      console.log("开始加载知乎推荐数据");
      this._onDidChangeTreeData.fire(); // 触发更新UI，显示加载状态

      this.recommendItems = await this.zhihuService.getRecommendList();
      console.log(`加载完成，获取到${this.recommendItems.length}个推荐项目`);

      this.isLoading = false;
      this.loadingStatusItem.hide();
      this._onDidChangeTreeData.fire(); // 再次触发更新UI，显示加载结果

      if (this.recommendItems.length > 0) {
        vscode.window.showInformationMessage(
          `已更新知乎推荐，共${this.recommendItems.length}个推荐内容`
        );
      }
    } catch (error) {
      this.isLoading = false;
      this.loadingStatusItem.hide();
      this._onDidChangeTreeData.fire(); // 触发更新UI，显示错误状态

      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("加载知乎推荐失败:", errorMsg);

      // 不总是显示错误消息，因为ZhihuService中已经有提示
      if (!errorMsg.includes("Cookie")) {
        vscode.window.showErrorMessage(`加载知乎推荐失败: ${errorMsg}`);
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
      return []; // 推荐项没有子项
    }

    // 如果正在加载，显示一个加载项
    if (this.isLoading) {
      return [
        new ZhihuStatusTreeItem(
          "正在加载知乎推荐...（爬虫抓取需要时间，请耐心等待）",
          new vscode.ThemeIcon("loading~spin")
        ),

      ];
    }

    // 如果有缓存的推荐项目，直接返回
    if (this.recommendItems.length > 0) {
      return this.recommendItems.map(
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
          "需要设置知乎Cookie才能获取推荐",
          new vscode.ThemeIcon("key"),
          {
            command: "zhihu-fisher.setCookie",
            title: "设置知乎Cookie",
          }
        ),
      ];
    }

    return [
      new ZhihuStatusTreeItem(
        "获取推荐失败，点击刷新按钮重试",
        new vscode.ThemeIcon("error"),
        {
          command: "zhihu-fisher.refreshRecommendList",
          title: "刷新知乎推荐",
        }
      ),
    ];
  }
}