import * as vscode from "vscode";
import { DisguiseManager } from "../utils/disguise-manager";

/**
 * 注册通用命令
 */
export function registerGeneralCommands(): vscode.Disposable[] {
  const commands: vscode.Disposable[] = [];

  // 切换伪装功能开关命令
  commands.push(
    vscode.commands.registerCommand("zhihu-fisher.toggleDisguise", async () => {
      const config = vscode.workspace.getConfiguration("zhihu-fisher");
      const currentState = config.get<boolean>("enableDisguise", true);
      const newState = !currentState;

      await config.update(
        "enableDisguise",
        newState,
        vscode.ConfigurationTarget.Global
      );

      vscode.window.showInformationMessage(
        `伪装功能已${newState ? "启用" : "禁用"}`
      );
    })
  );

  // 查看伪装缓存状态命令
  commands.push(
    vscode.commands.registerCommand("zhihu-fisher.showDisguiseCache", () => {
      const stats = DisguiseManager.getCacheStats();
      const isEnabled = DisguiseManager.isDisguiseEnabled();

      const message = `伪装功能状态:\n启用状态: ${
        isEnabled ? "✅ 已启用" : "❌ 已禁用"
      }\n缓存数量: ${stats.totalCached}\n活跃WebView: ${
        stats.webviewIds.length > 0 ? stats.webviewIds.join(", ") : "无"
      }`;

      vscode.window.showInformationMessage(message, { modal: true });
    })
  );

  return commands;
}
