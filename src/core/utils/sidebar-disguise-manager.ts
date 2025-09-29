import * as vscode from "vscode";
import { FakeFileListDataProvider } from "./file-list-provider";
import { Store } from "../stores";

/**
 * 侧边栏伪装管理器
 * 负责管理侧边栏的伪装状态和视图切换
 */
export class SidebarDisguiseManager {
  private static instance: SidebarDisguiseManager;
  private fakeFileProvider: FakeFileListDataProvider | null = null;
  private fakeTreeView: vscode.TreeView<any> | null = null;
  private isDisguiseEnabled: boolean = true; // 功能开关
  private isCurrentlyDisguised: boolean = false; // 当前状态

  private constructor() {}

  public static getInstance(): SidebarDisguiseManager {
    if (!SidebarDisguiseManager.instance) {
      SidebarDisguiseManager.instance = new SidebarDisguiseManager();
    }
    return SidebarDisguiseManager.instance;
  }

  /**
   * 初始化伪装管理器
   */
  public async initialize(context: vscode.ExtensionContext): Promise<void> {
    // 读取配置
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    this.isDisguiseEnabled = config.get<boolean>(
      "sidebarDisguiseEnabled",
      true
    );

    // 创建伪装文件提供者（始终创建，但通过context控制显示）
    this.fakeFileProvider = new FakeFileListDataProvider();
    this.fakeTreeView = vscode.window.createTreeView("fakeFileList", {
      treeDataProvider: this.fakeFileProvider,
      showCollapseAll: true,
    });
    this.fakeFileProvider.setTreeView(this.fakeTreeView);

    // 注册命令（避免重复注册）
    try {
      this.registerCommands(context);
    } catch (error) {
      console.warn('部分命令可能已存在，跳过重复注册:', error);
    }

    // 监听配置变化
    vscode.workspace.onDidChangeConfiguration(async (event) => {
      if (event.affectsConfiguration("zhihu-fisher.sidebarDisguiseEnabled")) {
        const newState = config.get<boolean>("sidebarDisguiseEnabled", true);
        if (newState !== this.isDisguiseEnabled) {
          this.isDisguiseEnabled = newState;
          if (!newState && this.isCurrentlyDisguised) {
            await this.showNormalViews();
          }
        }
      }
    });

    console.log(
      `侧边栏伪装管理器初始化完成，功能状态: ${
        this.isDisguiseEnabled ? "启用" : "禁用"
      }`
    );
  }

  /**
   * 显示伪装视图（当有WebView打开时）
   */
  public async showDisguiseViews(): Promise<void> {
    if (this.isCurrentlyDisguised || !this.isDisguiseEnabled) {
      return;
    }

    try {
      await vscode.commands.executeCommand(
        "setContext",
        "zhihu-fisher.sidebarDisguised",
        true
      );
      this.isCurrentlyDisguised = true;

      if (this.fakeFileProvider) {
        this.fakeFileProvider.refresh();
      }

      console.log("侧边栏已切换为伪装模式 - 原因：WebView已打开");
    } catch (error) {
      console.error("切换到伪装模式失败:", error);
    }
  }

  /**
   * 显示正常视图
   */
  public async showNormalViews(): Promise<void> {
    if (!this.isCurrentlyDisguised) {
      return;
    }

    try {
      await vscode.commands.executeCommand(
        "setContext",
        "zhihu-fisher.sidebarDisguised",
        false
      );
      this.isCurrentlyDisguised = false;

      console.log("侧边栏已恢复正常模式");
    } catch (error) {
      console.error("恢复正常模式失败:", error);
    }
  }

  /**
   * 手动切换伪装状态
   */
  public async toggleDisguise(): Promise<void> {
    if (!this.isDisguiseEnabled) {
      vscode.window.showWarningMessage("请先启用侧边栏伪装功能");
      return;
    }

    if (this.isCurrentlyDisguised) {
      await this.showNormalViews();
    } else {
      await this.showDisguiseViews();
    }

    const message = `侧边栏已切换为${
      this.isCurrentlyDisguised ? "伪装" : "正常"
    }模式`;
    vscode.window.showInformationMessage(message);
  }

  /**
   * 切换伪装功能开关
   */
  public async toggleDisguiseFunction(): Promise<void> {
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const newState = !this.isDisguiseEnabled;

    await config.update(
      "sidebarDisguiseEnabled",
      newState,
      vscode.ConfigurationTarget.Global
    );
    this.isDisguiseEnabled = newState;

    if (!newState && this.isCurrentlyDisguised) {
      await this.showNormalViews();
    }

    const message = `侧边栏伪装功能已${newState ? "启用" : "禁用"}`;
    vscode.window.showInformationMessage(message);
  }

  /**
   * 注册相关命令
   */
  private registerCommands(context: vscode.ExtensionContext): void {
    const commands = [
      // 检查命令是否已存在，如果不存在才注册
      this.safeRegisterCommand(
        "zhihu-fisher.toggleSidebarDisguise",
        async () => {
          await this.toggleDisguise();
        }
      ),

      this.safeRegisterCommand(
        "zhihu-fisher.refreshFakeFileList",
        () => {
          if (this.fakeFileProvider) {
            this.fakeFileProvider.refresh();
            vscode.window.showInformationMessage("伪装文件列表已刷新");
          }
        }
      ),

      this.safeRegisterCommand(
        "zhihu-fisher.openFakeFile",
        (fileName: string) => {
          vscode.window.showInformationMessage(`打开伪装文件: ${fileName}`);
        }
      ),



      this.safeRegisterCommand(
        "zhihu-fisher.onFakeFileClick",
        async (filename: string) => {
          // 用户点击伪装文件时恢复正常侧边栏
          await this.showNormalViews();
          console.log(`用户点击了伪装文件: ${filename}，已恢复正常侧边栏`);
          vscode.window.showInformationMessage("已切换回知乎列表", {
            modal: false,
          });
        }
      ),
    ];

    // 只添加成功注册的命令到context.subscriptions
    const validCommands = commands.filter(cmd => cmd !== null);
    context.subscriptions.push(...validCommands);
  }

  /**
   * 安全地注册命令，避免重复注册
   */
  private safeRegisterCommand(commandId: string, callback: (...args: any[]) => any): vscode.Disposable | null {
    try {
      return vscode.commands.registerCommand(commandId, callback);
    } catch (error) {
      console.warn(`命令 ${commandId} 已存在，跳过注册:`, error);
      return null;
    }
  }

  /**
   * 获取当前状态
   */
  public getStatus(): { enabled: boolean; disguised: boolean } {
    return {
      enabled: this.isDisguiseEnabled,
      disguised: this.isCurrentlyDisguised,
    };
  }

  /**
   * WebView创建时触发伪装
   */
  public async onWebViewCreated(): Promise<void> {
    // 检查智能伪装总开关
    if (!this.isDisguiseEnabled) {
      return;
    }

    // 检查侧边栏伪装是否启用
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const sidebarDisguiseEnabled = config.get<boolean>("sidebarDisguiseEnabled", true);
    
    if (!sidebarDisguiseEnabled) {
      console.log("WebView创建，但侧边栏伪装功能已关闭，跳过自动伪装");
      return;
    }

    await this.showDisguiseViews();
    console.log("WebView创建，自动启用侧边栏伪装");
  }

  /**
   * WebView界面伪装时触发侧边栏伪装
   */
  public async onWebViewDisguised(): Promise<void> {
    // 检查智能伪装总开关
    if (!this.isDisguiseEnabled) {
      return;
    }

    // 检查侧边栏伪装是否启用
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const sidebarDisguiseEnabled = config.get<boolean>("sidebarDisguiseEnabled", true);
    
    if (!sidebarDisguiseEnabled) {
      console.log("WebView界面伪装触发，但侧边栏伪装功能已关闭，跳过联动伪装");
      return;
    }

    await this.showDisguiseViews();
    console.log("WebView界面伪装触发，联动启用侧边栏伪装");
  }

  /**
   * WebView关闭或恢复时可能需要恢复侧边栏
   */
  public async onWebViewClosed(): Promise<void> {
    // 检查是否还有其他活跃的WebView
    const hasActiveWebView = this.hasActiveZhihuWebView();

    if (!hasActiveWebView && this.isCurrentlyDisguised) {
      await this.showNormalViews();
      console.log("所有WebView已关闭，恢复正常侧边栏");
    }
  }

  /**
   * 检查是否有活跃的知乎WebView
   */
  private hasActiveZhihuWebView(): boolean {
    if (Store.webviewMap && Store.webviewMap.size > 0) {
      for (const [webviewId, webviewItem] of Store.webviewMap.entries()) {
        if (
          webviewItem &&
          webviewItem.webviewPanel &&
          !webviewItem.webviewPanel.active
        ) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    if (this.fakeTreeView) {
      this.fakeTreeView.dispose();
    }
    this.fakeFileProvider = null;
    this.fakeTreeView = null;
  }
}
