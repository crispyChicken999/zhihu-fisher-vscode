import * as vscode from 'vscode';
import { WebviewManager } from '../zhihu/webview';
import { aboutTemplate } from '../zhihu/webview/templates/about';

/**
 * 注册关于和帮助相关命令
 */
export function registerAboutCommands(): vscode.Disposable[] {
  const commands: vscode.Disposable[] = [];

  // 注册意见反馈命令
  const openFeedbackCommand = vscode.commands.registerCommand(
    "zhihu-fisher.openFeedback",
    async () => {
      const feedbackUrl =
        "https://github.com/crispyChicken999/zhihu-fisher-vscode/issues";
      vscode.env.openExternal(vscode.Uri.parse(feedbackUrl));
      vscode.window.showInformationMessage(
        "已打开GitHub Issues页面，欢迎提出问题和建议！"
      );
    }
  );
  commands.push(openFeedbackCommand);

  // GitHub点星命令
  const starOnGitHubCommand = vscode.commands.registerCommand(
    "zhihu-fisher.starOnGitHub",
    async () => {
      const repoUrl = "https://github.com/crispyChicken999/zhihu-fisher-vscode";
      vscode.env.openExternal(vscode.Uri.parse(repoUrl));
      vscode.window.showInformationMessage(
        "感谢您的支持！已打开GitHub仓库页面，点击 ⭐️ 即可~"
      );
    }
  );
  commands.push(starOnGitHubCommand);

  // 请开发者喝杯咖啡命令
  const buyMeCoffeeCommand = vscode.commands.registerCommand(
    "zhihu-fisher.buyMeCoffee",
    async () => {
      const alipayUrl =
        "https://img2024.cnblogs.com/blog/3085939/202504/3085939-20250425153014632-145153684.jpg";

      const title = "☕ 请开发者喝杯咖啡吧 ☕";
      const message =
        "如果您觉得知乎摸鱼插件对您有帮助，欢迎请开发者喝杯咖啡！\n\n" +
        "您的支持是我们继续开发和改进的动力！\n\n" +
        "💝 感谢您的支持~💝";

      const alipayAction = "微信打赏";
      const starAction = "GitHub上点颗星";

      const selection = await vscode.window.showInformationMessage(
        title,
        {
          modal: true,
          detail: message,
        },
        alipayAction,
        starAction
      );

      switch (selection) {
        case alipayAction:
          vscode.env.openExternal(vscode.Uri.parse(alipayUrl));
          vscode.window.showInformationMessage(
            "谢谢您的支持！已打开微信赞赏码~"
          );
          break;
        case starAction:
          await vscode.commands.executeCommand("zhihu-fisher.starOnGitHub");
          break;
      }
    }
  );
  commands.push(buyMeCoffeeCommand);

  // 关于命令
  const showAboutCommand = vscode.commands.registerCommand(
    "zhihu-fisher.showAbout",
    async () => {
      const panel = vscode.window.createWebviewPanel(
        "zhihuFisherAbout",
        "关于知乎摸鱼",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        }
      );

      panel.webview.html = aboutTemplate;
    }
  );
  commands.push(showAboutCommand);

  // 使用说明命令
  const showGuideCommand = vscode.commands.registerCommand(
    "zhihu-fisher.showGuide",
    async () => {
      // 打开walkthrough
      vscode.commands.executeCommand(
        "workbench.action.openWalkthrough",
        "CrispyChicken.zhihu-fisher#zhihu-fisher-getting-started"
      );
    }
  );
  commands.push(showGuideCommand);

  // 注册重启扩展命令
  const restartExtensionCommand = vscode.commands.registerCommand(
    "zhihu-fisher.restartExtension",
    async () => {
      const selection = await vscode.window.showInformationMessage(
        "重启扩展将重新加载所有功能，这可能有助于解决加载卡住等问题。\n\n是否确认重启扩展？",
        { modal: true },
        "确认重启"
      );

      if (selection === "确认重启") {
        try {
          // 关闭已经打开的webview
          WebviewManager.closeAllWebviews();

          await vscode.commands.executeCommand(
            "workbench.action.restartExtensionHost"
          );
        } catch (error) {
          vscode.window.showErrorMessage(`重启扩展失败: ${error}`);
        }
      }
    }
  );
  commands.push(restartExtensionCommand);

  // 注册显示故障排除指引命令
  const showTroubleshootingGuideCommand = vscode.commands.registerCommand(
    "zhihu-fisher.showTroubleshootingGuide",
    async () => {
      const title = "🤔 知乎摸鱼故障排除指引";
      const message =
        "如果您遇到了页面加载卡住的问题，可能的原因和解决方案如下：\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
        "1. Cookie失效\n" +
        "   原因：知乎Cookie过期或失效\n" +
        "   解决：点击【更新Cookie】重新设置知乎登录信息\n\n" +
        "2. 网络连接问题\n" +
        "   原因：网络不稳定或速度过慢\n" +
        "   解决：检查网络连接，稍后重试，或切换网络环境\n\n" +
        "3. 扩展状态异常\n" +
        "   原因：扩展内部状态出现异常\n" +
        "   解决：点击【重启扩展】重新加载扩展功能\n\n" +
        "4. 浏览器引擎问题\n" +
        "   原因：爬虫浏览器未正确安装或配置\n" +
        "   解决：点击【配置浏览器】重新安装或设置浏览器\n\n" +
        "5. 知乎服务器问题\n" +
        "   原因：知乎服务器响应慢或临时不可用\n" +
        "   解决：稍后重试，或直接在浏览器中打开链接\n\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
        "★ 推荐操作顺序 ★\n" +
        "1. 首先尝试【更新Cookie】\n" +
        "2. 如果还是不行，检查【配置浏览器】\n" +
        "3. 如果问题依然存在，点击【重启扩展】\n" +
        "4. 最后可以尝试【重启VSCode】";

      const updateCookieAction = "更新Cookie";
      const configureBrowserAction = "配置浏览器";
      const restartExtensionAction = "重启扩展";
      const restartVSCode = "重启VSCode";

      const selection = await vscode.window.showInformationMessage(
        title,
        {
          modal: true,
          detail: message,
        },
        updateCookieAction,
        configureBrowserAction,
        restartExtensionAction,
        restartVSCode
      );

      switch (selection) {
        case updateCookieAction:
          await vscode.commands.executeCommand("zhihu-fisher.setCookie");
          break;
        case restartExtensionAction:
          await vscode.commands.executeCommand("zhihu-fisher.restartExtension");
          break;
        case configureBrowserAction:
          await vscode.commands.executeCommand("zhihu-fisher.configureBrowser");
          break;
        case restartVSCode:
          await vscode.commands.executeCommand("workbench.action.reloadWindow");
          break;
      }
    }
  );
  commands.push(showTroubleshootingGuideCommand);

  // 注册显示媒体设置说明命令
  const showMediaDisplaySettingsCommand = vscode.commands.registerCommand(
    "zhihu-fisher.showMediaDisplaySettings",
    async () => {
      // 读取媒体显示设置Markdown文件
      const uri = vscode.Uri.file(vscode.extensions.getExtension('CrispyChicken.zhihu-fisher')?.extensionPath + '/walkthrough/media/display-settings.md');
      
      try {
        // 尝试使用Markdown预览打开文件
        await vscode.commands.executeCommand('markdown.showPreview', uri);
      } catch (error) {
        // 如果Markdown预览失败，则使用常规编辑器打开
        vscode.window.showErrorMessage(`无法打开媒体显示设置说明: ${error}`);
        await vscode.commands.executeCommand('vscode.open', uri);
      }
    }
  );
  commands.push(showMediaDisplaySettingsCommand);

  return commands;
}
