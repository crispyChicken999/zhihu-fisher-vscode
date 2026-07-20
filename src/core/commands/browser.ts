import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { PuppeteerManager } from "../zhihu/puppeteer";

/**
 * 注册浏览器配置相关命令
 */
export function registerBrowserCommands(): vscode.Disposable[] {
  const commands: vscode.Disposable[] = [];

  // 安装浏览器命令
  const configureBrowserCommand = vscode.commands.registerCommand(
    "zhihu-fisher.configureBrowser",
    async () => {
      const title = "设置 Puppeteer 使用的浏览器";
      const currentSystem = PuppeteerManager.getOSType();
      const examplePath = PuppeteerManager.getChromeExamplePath();
      const message =
        "插件支持两种浏览器配置方式：\n" +
        "\n" +
        "===================================\n" +
        "\n" +
        "🟢 方法一：【安装默认浏览器】（推荐）\n" +
        `Puppeteer 自带一个「Chrome for Testing」浏览器，` +
        `版本与当前插件严格匹配，保证 100% 兼容。` +
        "\n" +
        "📌 优势：版本配套、自动管理、无需手动更新\n" +
        "📌 适合：绝大多数用户\n" +
        "\n" +
        "安装方式：\n" +
        "  1. 点击下方【安装浏览器】按钮自动安装\n" +
        "  2. 或者在终端中手动运行：\n" +
        "     npx puppeteer browsers install chrome\n" +
        "\n" +
        "【安装目录】" +
        `${currentSystem}：${examplePath.default}\n` +
        "\n" +
        "【可能遇到的问题】(っ °Д °;)っ\n" +
        "1. 如果提示 npx 指令运行失败：请检查是否安装了 Node.js（v22及以上）\n" +
        "   如果没有安装，请点击【安装Node.js】按钮\n" +
        "2. Node.js 已安装但仍提示 npx 失败：可尝试 npm install -g npx\n" +
        "   点击【安装NPX】自动安装\n" +
        "\n" +
        "===================================\n" +
        "\n" +
        "🟡 方法二：【设置自定义Chrome路径】（高级）\n" +
        "使用你本机已安装的 Chrome 浏览器（如 Chrome 正式版、Dev 版等）。\n" +
        "\n" +
        "⚠️ 兼容性风险：\n" +
        "  · 自定义 Chrome 版本可能与 Puppeteer 的 CDP 协议不匹配\n" +
        "  · 新版 Chrome（如 v150+）可能出现白色窗口、无法关闭等异常\n" +
        "  · 旧版 Chrome 可能缺少新特性，导致页面加载失败\n" +
        "  · 如果遇到奇怪问题，请先用方法一安装默认浏览器排查\n" +
        "\n" +
        "📌 适合：不想额外下载浏览器的高级用户\n" +
        "📌 注意：设置后如遇异常，请优先切回默认浏览器\n" +
        "\n" +
        "使用方式：点击下方【自定义路径】按钮，输入 Chrome 路径，例如：\n" +
        `   ${examplePath.custom}\n` +
        "\n" +
        "===================================\n" +
        "\n" +
        "💡 提示：设置完成后，建议重启 VSCode。";
      const installBrowserAction = "安装默认浏览器";
      const setCustomChromePathAction = "自定义路径";
      const reloadAction = "重启VSCode";
      const installNodeAction = "安装Node.js";
      const installNpxAction = "安装NPX";

      const selection = await vscode.window.showInformationMessage(
        title,
        {
          modal: true,
          detail: message,
        },
        installBrowserAction,
        setCustomChromePathAction,
        reloadAction,
        installNodeAction,
        installNpxAction
      );

      if (selection === installBrowserAction) {
        // 打开终端并运行命令 npx puppeteer browsers install chrome@135.0.7049.84
        const terminal = vscode.window.createTerminal("Puppeteer");
        terminal.show();
        terminal.sendText(
          "npx puppeteer browsers install chrome"
        );

        setTimeout(() => {
          // 安装完成后请重启VSCode
          vscode.window
            .showInformationMessage(
              "安装完成后请重启 VSCode，以启用爬虫浏览器",
              "点我重启"
            )
            .then((selection) => {
              if (selection === "点我重启") {
                vscode.commands.executeCommand("workbench.action.reloadWindow");
              }
            });
        }, 6666); // 等待6秒后提示重启VSCode
      } else if (selection === setCustomChromePathAction) {
        // 用户选择设置自定义Chrome路径
        vscode.commands.executeCommand("zhihu-fisher.setCustomChromePath");
      } else if (selection === installNpxAction) {
        // 打开终端并运行命令 npm install -g npx
        const terminal = vscode.window.createTerminal("Npx");
        terminal.show();
        terminal.sendText("npm install -g npx");

        setTimeout(() => {
          // 安装完成后提示用户
          vscode.window.showInformationMessage(
            "npx 安装完成后，请重新点击侧边栏安装浏览器"
          );
        }, 5000);
      } else if (selection === installNodeAction) {
        // 打开浏览器链接
        const nodeJsUrl = "https://nodejs.org/zh-cn/download";
        // 直接打开浏览器
        vscode.env.openExternal(vscode.Uri.parse(nodeJsUrl)).then(() => {
          // 提示用户安装完成后重启VSCode
          vscode.window
            .showInformationMessage(
              "Node.js 安装完成后，请重新点击侧边栏安装浏览器"
            )
            .then(() => {
              // 这里可以添加其他操作，比如刷新列表等
            });
        });
      } else if (selection === reloadAction) {
        vscode.commands.executeCommand("workbench.action.reloadWindow");
      }
    }
  );
  commands.push(configureBrowserCommand);

  // 注册设置自定义Chrome路径命令
  const setCustomChromePathCommand = vscode.commands.registerCommand(
    "zhihu-fisher.setCustomChromePath",
    async () => {
      const currentSystem = PuppeteerManager.getOSType();
      const examplePath = PuppeteerManager.getChromeExamplePath();

      // 创建输入框让用户输入Chrome路径
      const options: vscode.InputBoxOptions = {
        title: "设置自定义Chrome路径",
        prompt:
          "请输入 Chrome 可执行文件的绝对路径（按 ESC 可清空设置恢复默认）。⚠️ 注意：自定义 Chrome 版本与 Puppeteer 可能不兼容，遇到异常请切回默认浏览器。",
        placeHolder: `(${currentSystem})例如: ${examplePath.custom}`,
        ignoreFocusOut: true,
        validateInput: async (input) => {
          // 验证路径是否存在且是否为Chrome可执行文件
          if (!input) {
            return "请输入Chrome浏览器的路径";
          }

          // 如果是windows才做一下校验，Mac和Linux不需要，因为没环境不知道限制了会怎么样，让用户自己把握哈哈
          if (currentSystem === "Windows") {
            if (!fs.existsSync(input)) {
              return "找不到指定的文件";
            }

            const fileName = path.basename(input).toLowerCase();
            if (!fileName.includes("chrome")) {
              return "文件名似乎不是Chrome浏览器(应包含chrome字样)";
            }
          }

          return null; // 验证通过
        },
      };

      // 获取当前设置的路径作为默认值
      const currentPath = PuppeteerManager.getUserChromePath();
      if (currentPath) {
        options.value = currentPath;
      }

      const chromePath = await vscode.window.showInputBox(options);
      if (!chromePath) {
        // 清除自定义路径
        await PuppeteerManager.setUserChromePath("");
        // 用户取消输入
        const cancelMessage =
          "已清除自定义Chrome路径，将使用默认浏览器（推荐）。默认浏览器版本与插件严格匹配，兼容性最佳。";
        const installBrowserAction = "安装默认浏览器";

        vscode.window
          .showInformationMessage(cancelMessage, installBrowserAction)
          .then((selection) => {
            if (selection === installBrowserAction) {
              vscode.commands.executeCommand("zhihu-fisher.configureBrowser");
            }
          });
        return;
      }

      try {
        // 保存自定义路径
        if (chromePath) {
          await PuppeteerManager.setUserChromePath(chromePath);
          // 重置浏览器实例以使用新路径
          await PuppeteerManager.closeBrowserInstance();
          vscode.window
            .showInformationMessage(
              `已设置自定义Chrome路径，最好重启一下避免出现bug~`,
              "重启VSCode"
            )
            .then((selection) => {
              if (selection === "重启VSCode") {
                vscode.commands.executeCommand("workbench.action.reloadWindow");
              }
            });
        }
      } catch (error) {
        vscode.window.showErrorMessage(`设置Chrome路径失败: ${error}`);
      }
    }
  );
  commands.push(setCustomChromePathCommand);

  // 注册调试模式切换命令
  const toggleDebugModeCommand = vscode.commands.registerCommand(
    "zhihu-fisher.toggleDebugMode",
    async () => {
      const config = vscode.workspace.getConfiguration("zhihu-fisher");
      const currentDebugMode = config.get<boolean>("debugMode", false);

      const message = currentDebugMode
        ? "调试模式已启用，浏览器将以可见模式运行，方便你观察浏览器的工作过程和排查问题。\n\n是否要关闭调试模式？"
        : "调试模式可以让浏览器以可见模式运行，这样你就能看到浏览器页面的加载过程，方便排查问题和调试。\n\n启用调试模式后需要重启扩展才能生效。\n\n是否要启用调试模式？";

      const actionText = currentDebugMode ? "关闭调试模式" : "启用调试模式";
      const restartText = "重启扩展";

      const selection = await vscode.window.showInformationMessage(
        message,
        { modal: true },
        actionText,
        restartText
      );

      if (selection === actionText) {
        const newDebugMode = !currentDebugMode;
        await config.update(
          "debugMode",
          newDebugMode,
          vscode.ConfigurationTarget.Global
        );

        const statusMessage = newDebugMode
          ? "调试模式已启用！请重启扩展使设置生效。启用后浏览器将以可见模式运行。"
          : "调试模式已关闭！请重启扩展使设置生效。关闭后浏览器将在后台运行。";

        const restartSelection = await vscode.window.showInformationMessage(
          statusMessage,
          "重启扩展"
        );

        if (restartSelection === "重启扩展") {
          vscode.commands.executeCommand("zhihu-fisher.restartExtension");
        }
      } else if (selection === restartText) {
        vscode.commands.executeCommand("zhihu-fisher.restartExtension");
      }
    }
  );
  commands.push(toggleDebugModeCommand);

  return commands;
}
