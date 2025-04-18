import * as vscode from "vscode";
import { CookieInfo } from "./types";

export class CookieManager {
  private cookieInfo: CookieInfo = { cookie: "" };

  constructor() {
    // 初始化时读取已有的cookie
    this.loadCookie();
  }

  // 加载已保存的cookie
  private loadCookie(): void {
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const cookie = config.get<string>("cookie") || "";

    // 如果有cookie，检查是否需要提醒更新
    if (cookie) {
      try {
        // cookie可能以JSON字符串形式存储，包含上次更新时间
        const cookieInfo = JSON.parse(cookie) as CookieInfo;
        this.cookieInfo = cookieInfo;

        // 检查cookie是否过期
        this.checkCookieExpiration();
      } catch {
        // 如果解析失败，说明cookie是直接存储的字符串
        this.cookieInfo = {
          cookie: cookie,
          lastUpdated: Date.now(),
        };

        // 更新格式
        this.saveCookieInfo();
      }
    }
  }

  // 检查cookie是否需要更新
  private checkCookieExpiration(): void {
    if (!this.cookieInfo.lastUpdated) {
      return;
    }

    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const expirationDays = config.get<number>("cookieExpirationReminder") || 30;

    const now = Date.now();
    const daysPassed =
      (now - this.cookieInfo.lastUpdated) / (1000 * 60 * 60 * 24);

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
  private saveCookieInfo(): void {
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    config.update(
      "cookie",
      JSON.stringify(this.cookieInfo),
      vscode.ConfigurationTarget.Global
    );
  }

  // 设置cookie
  async setCookie(): Promise<boolean> {
    const result = await vscode.window.showInputBox({
      prompt: "请输入知乎Cookie，可以从浏览器中复制",
      placeHolder: "复制浏览器中的完整Cookie值",
      password: true, // 将输入框显示为密码框以保护隐私
    });

    if (result) {
      this.cookieInfo = {
        cookie: result,
        lastUpdated: Date.now(),
      };
      this.saveCookieInfo();
      vscode.window.showInformationMessage("知乎Cookie设置成功");
      return true;
    }
    return false;
  }

  // 清除cookie
  clearCookie(): void {
    this.cookieInfo = { cookie: "" };
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    config.update("cookie", "", vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage("知乎Cookie已清除");
    // 重新拿一下热榜和推荐
    vscode.commands.executeCommand("zhihu-fisher.refreshHotList");
    vscode.commands.executeCommand("zhihu-fisher.refreshRecommendList");
  }

  // 获取当前 cookie
  getCookie(): string {
    return this.cookieInfo.cookie;
  }
  
  // 提示用户更新Cookie
  promptForNewCookie(message: string): void {
    vscode.window
      .showWarningMessage(message, "设置Cookie", "忽略")
      .then((selection) => {
        if (selection === "设置Cookie") {
          vscode.commands.executeCommand("zhihu-fisher.setCookie");
        }
      });
  }
}