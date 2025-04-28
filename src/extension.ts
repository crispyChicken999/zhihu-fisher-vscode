import * as vscode from "vscode";
import { Store } from "./core/stores";
import { LinkItem } from "./core/types";
import { ZhihuService } from "./core/zhihu/index";
import { PuppeteerManager } from "./core/zhihu/puppeteer";
import { sidebarHotListDataProvider } from "./core/zhihu/sidebar/hot";
import { sidebarSearchListDataProvider } from "./core/zhihu/sidebar/search";
import { sidebarRecommendListDataProvider } from "./core/zhihu/sidebar/recommend";
import * as fs from "fs";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  console.log("🐟知乎摸鱼🐟 已激活！");

  // 创建知乎服务实例
  const zhihuService = new ZhihuService();

  // 侧边栏 推荐 列表
  const sidebarRecommend = new sidebarRecommendListDataProvider();
  const recommendListView = vscode.window.createTreeView("zhihuRecommendList", {
    treeDataProvider: sidebarRecommend,
    showCollapseAll: false,
  });

  // 侧边栏 热榜 列表
  const sidebarHot = new sidebarHotListDataProvider();
  const hotListView = vscode.window.createTreeView("zhihuHotList", {
    treeDataProvider: sidebarHot,
    showCollapseAll: false,
  });

  // 侧边栏 搜索 列表
  const sidebarSearch = new sidebarSearchListDataProvider();
  const searchListView = vscode.window.createTreeView("zhihuSearchList", {
    treeDataProvider: sidebarSearch,
    showCollapseAll: false,
  });

  // 注册刷新热榜命令
  const refreshHotListCommand = vscode.commands.registerCommand(
    "zhihu-fisher.refreshHotList",
    () => sidebarHot.refresh()
  );

  // 注册刷新推荐命令
  const refreshRecommendListCommand = vscode.commands.registerCommand(
    "zhihu-fisher.refreshRecommendList",
    () => sidebarRecommend.refresh()
  );

  // 注册重置搜索结果
  const resetSearchListCommand = vscode.commands.registerCommand(
    "zhihu-fisher.resetSearchList",
    () => sidebarSearch.reset()
  );

  // 注册搜索命令
  const searchContentCommand = vscode.commands.registerCommand(
    "zhihu-fisher.searchContent",
    async () => {
      // 检查热榜列表是否正在加载中
      if (Store.Zhihu.hot.isLoading) {
        vscode.window.showInformationMessage(
          "热榜列表正在加载中，请稍候再试..."
        );
        return;
      }

      // 检查推荐列表是否正在加载中
      if (Store.Zhihu.recommend.isLoading) {
        vscode.window.showInformationMessage(
          "推荐列表正在加载中，请稍候再试..."
        );
        return;
      }

      const canCreateBrowser = await PuppeteerManager.canCreateBrowser();
      if (!canCreateBrowser) {
        vscode.window.showErrorMessage(
          "无法创建浏览器实例，搜索失败，请检查浏览器安装情况。"
        );
        return;
      }

      const query = await vscode.window.showInputBox({
        prompt: "请输入要搜索的内容",
        placeHolder: "请输入关键词",
      });

      if (query) {
        await sidebarSearch.searchContent(query);
      }
    }
  );

  // 注册打开文章命令
  const openArticleCommand = vscode.commands.registerCommand(
    "zhihu-fisher.openArticle",
    (item: LinkItem) => {
      // 检查热榜列表是否正在加载中
      if (Store.Zhihu.hot.isLoading) {
        vscode.window.showInformationMessage(
          "热榜列表正在加载中，请稍候再试..."
        );
        return;
      }

      // 检查推荐列表是否正在加载中
      if (Store.Zhihu.recommend.isLoading) {
        vscode.window.showInformationMessage(
          "推荐列表正在加载中，请稍候再试..."
        );
        return;
      }

      // 检查搜索列表是否正在加载中
      if (Store.Zhihu.search.isLoading) {
        vscode.window.showInformationMessage(
          "搜索结果正在加载中，请稍候再试..."
        );
        return;
      }

      const webviewManager = Store.webviewManager;
      webviewManager.openWebview(item);
    }
  );

  // 注册设置Cookie命令
  const setCookieCommand = vscode.commands.registerCommand(
    "zhihu-fisher.setCookie",
    async () => {
      const success = await zhihuService.setCookie();
      if (success) {
        try {
          // 设置Cookie成功后，首先需要看看能不能创建爬虫浏览器
          await PuppeteerManager.canCreateBrowser();
          // 如果能创建成功，那么就继续下一步操作
          console.log("创建爬虫浏览器成功，开始加载热榜和推荐列表...");
        } catch (error) {
          console.error("创建爬虫浏览器失败:", error);
          return;
        }
        // 设置Cookie成功后刷新热榜、推荐和搜索列表
        sidebarHot.refresh();
        sidebarRecommend.refresh();
        sidebarSearch.reset();
      }
    }
  );

  // 注册清除Cookie命令
  const clearCookieCommand = vscode.commands.registerCommand(
    "zhihu-fisher.clearCookie",
    () => {
      zhihuService.clearCookie();
      sidebarHot.refresh();
      sidebarRecommend.refresh();
      sidebarSearch.reset();
    }
  );

  // 注册切换媒体显示模式命令
  const toggleMediaCommand = vscode.commands.registerCommand(
    "zhihu-fisher.toggleMedia",
    () => {
      const config = vscode.workspace.getConfiguration("zhihu-fisher");
      const currentMode = config.get<string>("mediaDisplayMode", "normal");

      // 三种模式循环切换：normal -> mini -> none -> normal
      let newMode: string;
      switch (currentMode) {
        case "normal":
          newMode = "mini";
          break;
        case "mini":
          newMode = "none";
          break;
        case "none":
        default:
          newMode = "normal";
          break;
      }

      // 更新配置
      config
        .update("mediaDisplayMode", newMode, vscode.ConfigurationTarget.Global)
        .then(() => {
          // 根据不同模式显示不同提示
          let statusText = "";
          switch (newMode) {
            case "normal":
              statusText = "已切换到正常媒体模式";
              break;
            case "mini":
              statusText = "已切换到迷你媒体模式";
              break;
            case "none":
              statusText = "已切换到隐藏媒体模式";
              break;
          }
          vscode.window.showInformationMessage(
            `${statusText}，重新打开文章来查看效果。`
          );
        });
    }
  );

  // 注册设置正常媒体模式命令
  const setMediaModeNormalCommand = vscode.commands.registerCommand(
    "zhihu-fisher.setMediaModeNormal",
    async () => {
      const config = vscode.workspace.getConfiguration("zhihu-fisher");
      await config.update(
        "mediaDisplayMode",
        "normal",
        vscode.ConfigurationTarget.Global
      );
      vscode.window.showInformationMessage("图片和视频正常展示~");
    }
  );

  // 注册设置迷你媒体模式命令
  const setMediaModeMiniCommand = vscode.commands.registerCommand(
    "zhihu-fisher.setMediaModeMini",
    async () => {
      const config = vscode.workspace.getConfiguration("zhihu-fisher");
      await config.update(
        "mediaDisplayMode",
        "mini",
        vscode.ConfigurationTarget.Global
      );
      vscode.window.showInformationMessage(
        "图片和视频将缩小尺寸展示，方便偷偷看哈哈~"
      );
    }
  );

  // 注册设置无媒体模式命令
  const setMediaModeNoneCommand = vscode.commands.registerCommand(
    "zhihu-fisher.setMediaModeNone",
    async () => {
      const config = vscode.workspace.getConfiguration("zhihu-fisher");
      await config.update(
        "mediaDisplayMode",
        "none",
        vscode.ConfigurationTarget.Global
      );
      vscode.window.showInformationMessage("图片和视频将不再展示~");
    }
  );

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

  // 当配置变更时触发刷新
  vscode.workspace.onDidChangeConfiguration((e) => {
    // 只在非mediaDisplayMode的配置变更时才刷新热榜和推荐及搜索列表
    if (
      e.affectsConfiguration("zhihu-fisher") &&
      (!e.affectsConfiguration("zhihu-fisher.mediaDisplayMode") &&
        !e.affectsConfiguration("zhihu-fisher.hideImages"))
    ) {
      sidebarHot.refresh();
      sidebarRecommend.refresh();
      sidebarSearch.reset();
    }
  });

  // 将所有可处置对象添加到扩展上下文的订阅中
  context.subscriptions.push(hotListView);
  context.subscriptions.push(recommendListView);
  context.subscriptions.push(searchListView);
  context.subscriptions.push(refreshHotListCommand);
  context.subscriptions.push(refreshRecommendListCommand);
  context.subscriptions.push(resetSearchListCommand);
  context.subscriptions.push(searchContentCommand);
  context.subscriptions.push(openArticleCommand);
  context.subscriptions.push(setCookieCommand);
  context.subscriptions.push(clearCookieCommand);
  context.subscriptions.push(toggleMediaCommand);
  context.subscriptions.push(setMediaModeNormalCommand);
  context.subscriptions.push(setMediaModeMiniCommand);
  context.subscriptions.push(setMediaModeNoneCommand);
  context.subscriptions.push(configureBrowserCommand);
  context.subscriptions.push(setCustomChromePathCommand);
}

// 清理资源或执行其他必要的操作
export function deactivate() {
  console.log("🐟知乎摸鱼🐟 已停用！");
}
