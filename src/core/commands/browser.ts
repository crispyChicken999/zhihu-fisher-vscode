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
        "插件提供了配置浏览器的两种方式：\n" +
        "1. 安装Puppeteer的默认浏览器\n" +
        "2. 设置自定义Chrome路径\n" +
        "\n" +
        "===================================\n" +
        "\n" +
        "方法一：【安装默认的浏览器】(￣▽￣)ノ\n" +
        "1. 请在终端中运行以下命令来安装浏览器：\n" +
        "   npx puppeteer browsers install chrome@135.0.7049.84\n" +
        "2. 或者点击【安装浏览器】按钮会自动开始安装\n" +
        "\n" +
        "【安装目录】" +
        `${currentSystem}：${examplePath.default}\n` +
        "\n" +
        "【可能遇到的问题】(っ °Д °;)っ\n" +
        "1. 如果提示 npx 指令运行失败：请检查是否安装了 Node.js（v18及以上） 和 NPM \n" +
        "   如果没有安装，请点击【安装Node.js】按钮自动安装\n" +
        "2. Node.js 和 npm 已安装，但仍然提示 npx 指令运行失败：那么可以使用\n" +
        "   npm install -g npx 来安装 NPX，点击【安装NPX】自动安装\n" +
        "\n" +
        "===================================\n" +
        "\n" +
        "方法二：【设置自定义Chrome路径】(╯‵□′)╯︵┻━┻\n" +
        "1. 如果你已经安装了谷歌官方的 Chrome 浏览器，并且想要使用自己的浏览器\n" +
        "2. 请点击【自定义路径】按钮\n" +
        "3. 然后输入 Chrome 浏览器的可执行文件路径，例如：\n" +
        `   ${examplePath.custom}\n` +
        "\n" +
        "===================================\n" +
        "\n" +
        "【注意】\n" +
        "🎉设置完成后，请重启VSCode。🎉\n";
      const installBrowserAction = "安装浏览器";
      const setCustomChromePathAction = "自定义路径";
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
        installNodeAction,
        installNpxAction
      );

      if (selection === installBrowserAction) {
        // 打开终端并运行命令 npx puppeteer browsers install chrome@135.0.7049.84
        const terminal = vscode.window.createTerminal("Puppeteer");
        terminal.show();
        terminal.sendText(
          "npx puppeteer browsers install chrome@135.0.7049.84"
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
          "请输入本地谷歌浏览器Chrome.exe的绝对路径【想清空设置请按 ESC 退出即可】",
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
          "已清除自定义Chrome路径，将使用爬虫的默认浏览器，如果没安装请安装";
        const installBrowserAction = "安装浏览器";

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
