import * as vscode from "vscode";
import { DisguiseManager } from "../utils/disguise-manager";
import { SidebarDisguiseManager } from "../utils/sidebar-disguise-manager";

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

  // 设置回答预加载数量命令
  commands.push(
    vscode.commands.registerCommand(
      "zhihu-fisher.setAnswersPerBatch",
      async () => {
        const config = vscode.workspace.getConfiguration("zhihu-fisher");
        const currentCount = config.get<number>("answersPerBatch", 10);

        // 显示输入框让用户输入预加载数量
        const countInput = await vscode.window.showInputBox({
          title: "设置回答预加载数量",
          prompt: "请输入每次预加载的回答数量 (5-50)",
          value: currentCount.toString(),
          placeHolder: "建议设置为 5-20 之间的数值",
          validateInput: (value: string) => {
            const num = parseInt(value);
            if (isNaN(num)) {
              return "请输入有效的数字";
            }
            if (num < 5) {
              return "回答数量不能少于 5";
            }
            if (num > 50) {
              return "为了性能考虑，回答数量不能超过 50，弄太大可能会提前触发知乎的反爬虫机制";
            }
            return undefined;
          },
        });

        if (countInput !== undefined) {
          const newCount = parseInt(countInput);
          await config.update(
            "answersPerBatch",
            newCount,
            vscode.ConfigurationTarget.Global
          );
          vscode.window.showInformationMessage(
            `已设置回答预加载数量为 ${newCount} 个，重新打开问题来查看效果。`
          );
        }
      }
    )
  );

  // 详情页伪装开启命令
  commands.push(
    vscode.commands.registerCommand(
      "zhihu-fisher.toggleWebviewDisguise",
      async () => {
        const config = vscode.workspace.getConfiguration("zhihu-fisher");
        const currentState = config.get<boolean>("enableDisguise", true);

        if (!currentState) {
          await config.update(
            "enableDisguise",
            true,
            vscode.ConfigurationTarget.Global
          );
          vscode.window.showInformationMessage("详情页伪装已启用");
        } else {
          vscode.window.showInformationMessage("详情页伪装已经是启用状态");
        }
      }
    )
  );

  // 详情页伪装关闭命令
  commands.push(
    vscode.commands.registerCommand(
      "zhihu-fisher.disableWebviewDisguise",
      async () => {
        const config = vscode.workspace.getConfiguration("zhihu-fisher");

        await config.update(
          "enableDisguise",
          false,
          vscode.ConfigurationTarget.Global
        );
        vscode.window.showInformationMessage("详情页伪装已关闭");
      }
    )
  );

  // 侧边栏伪装启用命令
  commands.push(
    vscode.commands.registerCommand(
      "zhihu-fisher.enableSidebarDisguise",
      async () => {
        const config = vscode.workspace.getConfiguration("zhihu-fisher");
        const webviewDisguiseEnabled = config.get<boolean>(
          "enableDisguise",
          true
        );

        if (!webviewDisguiseEnabled) {
          vscode.window.showWarningMessage(
            "请先启用详情页伪装，侧边栏伪装需要依赖详情页伪装功能"
          );
          return;
        }

        await config.update(
          "sidebarDisguiseEnabled",
          true,
          vscode.ConfigurationTarget.Global
        );

        // 立即启用侧边栏伪装
        const sidebarManager = SidebarDisguiseManager.getInstance();
        await sidebarManager.showDisguiseViews();

        vscode.window.showInformationMessage("侧边栏伪装已启用");
      }
    )
  );

  // 侧边栏伪装关闭命令
  commands.push(
    vscode.commands.registerCommand(
      "zhihu-fisher.disableSidebarDisguise",
      async () => {
        const config = vscode.workspace.getConfiguration("zhihu-fisher");

        await config.update(
          "sidebarDisguiseEnabled",
          false,
          vscode.ConfigurationTarget.Global
        );

        // 立即关闭侧边栏伪装
        const sidebarManager = SidebarDisguiseManager.getInstance();
        await sidebarManager.showNormalViews();

        vscode.window.showInformationMessage("侧边栏伪装已关闭");
      }
    )
  );

  return commands;
}
