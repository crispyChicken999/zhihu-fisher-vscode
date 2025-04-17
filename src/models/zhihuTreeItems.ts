import * as vscode from "vscode";
import { ZhihuHotItem } from "../services/zhihuService";

/**
 * 知乎热榜树节点类
 */
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

/**
 * 状态显示树节点（加载中、错误等）
 */
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
