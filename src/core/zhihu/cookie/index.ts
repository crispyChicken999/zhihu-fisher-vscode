import * as vscode from "vscode";
import { Store } from "../../stores";
import * as Puppeteer from "puppeteer";

export class CookieManager {
  static isAlerting: boolean = false; // 是否正在提醒更新cookie

  // 加载已保存的cookie
  static loadCookie(): void {
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const cookie = config.get<string>("cookie") || "";

    // 如果有cookie，处理兼容性
    if (cookie) {
      try {
        // 尝试解析旧格式的JSON对象
        const oldCookieInfo = JSON.parse(cookie);
        if (oldCookieInfo && typeof oldCookieInfo === 'object' && oldCookieInfo.cookie) {
          // 是旧格式，提取cookie字符串并保存为新格式
          console.log("检测到旧格式Cookie，正在转换为新格式...");
          Store.Zhihu.cookie = oldCookieInfo.cookie;
          CookieManager.saveCookie(); // 保存为新格式
          vscode.window.showInformationMessage("Cookie已自动调整为新格式，您现在可以在vscode设置中搜索zhihu fisher的cookie设置，直接复制到Cookie输入框中即可~");
        } else {
          // JSON解析成功但不是预期的对象格式，当作新格式处理
          Store.Zhihu.cookie = cookie;
        }
      } catch {
        // JSON解析失败，说明已经是新格式的纯字符串
        Store.Zhihu.cookie = cookie;
      }
    } else {
      Store.Zhihu.cookie = "";
    }
  }

  // 保存cookie
  private static saveCookie(): void {
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    config.update(
      "cookie",
      Store.Zhihu.cookie,
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
      Store.Zhihu.cookie = result;
      CookieManager.saveCookie();
      vscode.window.showInformationMessage("知乎Cookie设置成功");
      return true;
    }
    return false;
  }

  // 清除cookie
  static clearCookie(): void {
    Store.Zhihu.cookie = "";
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    config.update("cookie", "", vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage("知乎Cookie已清除");
    // 重新拿一下热榜和推荐
    vscode.commands.executeCommand("zhihu-fisher.refreshHotList");
    vscode.commands.executeCommand("zhihu-fisher.refreshRecommendList");
    // 重新刷新一下搜索列表
    vscode.commands.executeCommand("zhihu-fisher.resetSearchList");
    // 重新刷新一下收藏列表
    vscode.commands.executeCommand("zhihu-fisher.resetCollectionsList");
  }

  // 获取当前 cookie
  static getCookie(): string {
    return Store.Zhihu.cookie;
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

  /**
   * 去除cookie中的BEC参数
   * @param cookie 原始cookie字符串
   * @returns 去除BEC参数后的cookie字符串
   */
  static removeBECFromCookie(cookie: string): string {
    if (!cookie) {
      return cookie;
    }

    // 分割cookie字符串
    const cookies = cookie.split("; ");
    
    // 过滤掉BEC参数
    const filteredCookies = cookies.filter(c => {
      const [key] = c.split("=");
      return key.trim() !== "BEC";
    });

    // 重新组合cookie字符串
    return filteredCookies.join("; ");
  }

  /**
   * 获取cookie中的指定字段
   * @param key cookie字段名
   * @returns cookie字段值，如果不存在则返回null
   */
  static async getCookieValue(key: string): Promise<string | null> {
    const cookie = CookieManager.getCookie();
    if (!cookie) {
      return null;
    }

    const cookies = cookie.split("; ");
    let result = null;
    for (const c of cookies) {
      const [k, v] = c.split("=");
      if (k === key) {
        result = v;
      }
    }
    return result;
  }

  /**
   * 检查页面是否包含登录按钮，如果有的话说明页面要用户登录，也就是cookie失效了/没设置cookie
   * @param page Puppeteer.Page 实例
   * @return {Promise<boolean>} 如果页面包含登录元素，返回true，否则返回false
   * @throws {Error} 如果检查过程中发生错误，抛出错误
   */
  static async checkIfPageHasLoginElement(
    page: Puppeteer.Page
  ): Promise<boolean> {
    try {
      // 检查页面是否包含登录元素
      const loginSelector = ".SignFlow-submitButton"; // 登录元素的选择器
      const element = await page.$(loginSelector);
      return !!element; // 如果找到了元素，返回true，否则返回false
    } catch (error) {
      console.error("Error checking for login element:", error);
      return false;
    }
  }
}
