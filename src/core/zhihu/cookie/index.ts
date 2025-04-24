import * as vscode from "vscode";
import { CookieInfo } from "../../types";
import { Store } from "../../stores";

export class CookieManager {
  static isAlerting: boolean = false; // 是否正在提醒更新cookie

  // 加载已保存的cookie
  static loadCookie(): void {
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const cookie = config.get<string>("cookie") || "";

    // 如果有cookie，检查是否需要提醒更新
    if (cookie) {
      try {
        // cookie可能以JSON字符串形式存储，包含上次更新时间
        const cookieInfo = JSON.parse(cookie) as CookieInfo;
        Store.Zhihu.cookieInfo = cookieInfo;

        // 检查cookie是否过期
        CookieManager.checkCookieExpiration();
      } catch {
        // 如果解析失败，说明cookie是直接存储的字符串
        Store.Zhihu.cookieInfo = {
          cookie: cookie,
          lastUpdated: Date.now(),
        };

        // 更新格式
        CookieManager.saveCookieInfo();
      }
    }
  }

  // 检查cookie是否需要更新
  private static checkCookieExpiration(): void {
    if (!Store.Zhihu.cookieInfo.lastUpdated) {
      return;
    }

    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const expirationDays = config.get<number>("cookieExpirationReminder") || 30;

    const now = Date.now();
    const daysPassed =
      (now - Store.Zhihu.cookieInfo.lastUpdated) / (1000 * 60 * 60 * 24);

    if (daysPassed >= expirationDays) {
      vscode.window
        .showWarningMessage(
          `您的知乎Cookie已设置${Math.floor(daysPassed)}天，可能需要更新`,
          "更新Cookie",
          "忽略"
        )
        .then((selection) => {
          if (selection === "更新Cookie") {
            vscode.commands.executeCommand("zhihu-fisher.setCookie");
          }
        });
    }
  }

  // 保存cookie信息
  private static saveCookieInfo(): void {
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    config.update(
      "cookie",
      JSON.stringify(Store.Zhihu.cookieInfo),
      vscode.ConfigurationTarget.Global
    );
  }

  // 设置cookie
  static async setCookie(): Promise<boolean> {
    const result = await vscode.window.showInputBox({
      prompt: "请输入知乎Cookie",
      placeHolder: "复制浏览器中的完整Cookie值",
      password: true, // 将输入框显示为密码框以保护隐私
    });

    if (result) {
      Store.Zhihu.cookieInfo = {
        cookie: result,
        lastUpdated: Date.now(),
      };
      CookieManager.saveCookieInfo();
      vscode.window.showInformationMessage("知乎Cookie设置成功");
      return true;
    }
    return false;
  }

  // 清除cookie
  static clearCookie(): void {
    Store.Zhihu.cookieInfo = { cookie: "" };
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    config.update("cookie", "", vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage("知乎Cookie已清除");
    // 重新拿一下热榜和推荐
    vscode.commands.executeCommand("zhihu-fisher.refreshHotList");
    vscode.commands.executeCommand("zhihu-fisher.refreshRecommendList");
    // 重新刷新一下搜索列表
    vscode.commands.executeCommand("zhihu-fisher.resetSearchList");
  }

  // 获取当前 cookie
  static getCookie(): string {
    return Store.Zhihu.cookieInfo.cookie;
  }

  // 查看vscode配置看看cookie有没有设置，isCookieSet
  static isCookieSet(): boolean {
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const cookie = config.get<string>("cookie") || "";
    return !!cookie;
  }

  // 提示用户更新Cookie
  static promptForNewCookie(message: string): void {
    CookieManager.isAlerting = true; // 设置正在提醒更新cookie的状态
    vscode.window
      .showWarningMessage(message, "设置Cookie")
      .then((selection) => {
        if (selection === "设置Cookie") {
          vscode.commands.executeCommand("zhihu-fisher.setCookie");
        }
      });

    setTimeout(() => {
      CookieManager.isAlerting = false; // 5秒后重置提醒状态
    }, 5000); // 5秒后重置提醒状态
  }
}
