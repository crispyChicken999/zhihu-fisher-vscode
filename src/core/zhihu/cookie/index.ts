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

      // 自动过滤第三方cookie（百度统计等），已有cookie直接清洗并更新
      const cleaned = CookieManager.filterZhihuOnlyCookies(Store.Zhihu.cookie);
      if (cleaned !== Store.Zhihu.cookie) {
        console.log("检测到已有cookie中包含第三方cookie，已自动清洗并更新");
        Store.Zhihu.cookie = cleaned;
        CookieManager.saveCookie();
      }

      // 检查是否缺少关键的安全 cookie（__zse_ck 是请求签名必需，z_c0 是登录凭证）
      if (Store.Zhihu.cookie && !CookieManager.isCookieComplete(Store.Zhihu.cookie)) {
        const keys = CookieManager.parseCookieKeys(Store.Zhihu.cookie);
        const hasZseCk = keys.includes("__zse_ck");
        const hasZC0 = keys.includes("z_c0");
        const missing: string[] = [];
        if (!hasZseCk) { missing.push("__zse_ck"); }
        if (!hasZC0) { missing.push("z_c0"); }
        console.warn(
          `当前Cookie缺少关键安全项: ${missing.join(", ")}，建议重新扫码登录或手动设置完整Cookie`
        );
        vscode.window
          .showWarningMessage(
            `检测到Cookie不完整（缺少 ${missing.join(", ")}），之前扫码登录流程有bug，导致部分Cookie缺失，现已修复，建议重新扫码登录或手动设置完整Cookie`,
            "扫码登录",
            "手动设置Cookie"
          )
          .then((selection) => {
            if (selection === "扫码登录") {
              vscode.commands.executeCommand("zhihu-fisher.loginViaQRCode");
            } else if (selection === "手动设置Cookie") {
              vscode.commands.executeCommand("zhihu-fisher.setCookie");
            }
          });
      }
    } else {
      Store.Zhihu.cookie = "";
    }
  }

  // 保存cookie到配置
  static async saveCookie(): Promise<void> {
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    await config.update(
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
      // 过滤掉第三方cookie（百度统计等），确保干净存储
      Store.Zhihu.cookie = CookieManager.filterZhihuOnlyCookies(result);
      await CookieManager.saveCookie();
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

  /**
   * 直接保存cookie字符串（用于扫码登录等场景）
   * @param cookieString 完整的cookie字符串
   */
  static async saveCookieString(cookieString: string): Promise<void> {
    if (!cookieString) {
      console.warn("保存cookie失败：cookie字符串为空");
      return;
    }
    // 过滤掉第三方cookie（百度统计等，BEC等），只保留知乎域名相关cookie
    const cleanedCookie = CookieManager.filterZhihuOnlyCookies(cookieString);
    Store.Zhihu.cookie = cleanedCookie;
    await CookieManager.saveCookie();
    console.log("Cookie已通过扫码登录自动保存");
    vscode.window.showInformationMessage("知乎Cookie已通过扫码登录自动设置成功");
  }

  // 获取当前 cookie
  static getCookie(): string {
    return Store.Zhihu.cookie;
  }

  // 查看vscode配置看看cookie有没有设置，isCookieSet
  static isCookieSet(): boolean {
    // 优先检查运行时Store中的cookie（可能刚刚通过扫码登录设置，配置尚未写入完成）
    if (Store.Zhihu.cookie) {
      return true;
    }
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
   * 解析cookie字符串，返回所有key列表
   */
  static parseCookieKeys(cookie: string): string[] {
    if (!cookie) { return []; }
    return cookie
      .split(";")
      .map((c) => c.trim().split("=")[0])
      .filter(Boolean);
  }

  /**
   * 检查cookie是否包含必需的关键项（__zse_ck 签名 + z_c0 登录凭证）
   */
  static isCookieComplete(cookie: string): boolean {
    const keys = CookieManager.parseCookieKeys(cookie);
    return keys.includes("__zse_ck") && keys.includes("z_c0");
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
   * 过滤掉非知乎域名的第三方cookie（如百度统计等）
   * 这些第三方cookie如果一起发送到知乎会导致403
   * @param cookie 原始cookie字符串
   * @returns 过滤后的cookie字符串（只保留知乎相关cookie）
   */
  static filterZhihuOnlyCookies(cookie: string): string {
    if (!cookie) {
      return cookie;
    }

    // 已知的第三方cookie前缀（百度统计、Google Analytics等）
    const thirdPartyPrefixes = [
      // 百度统计
      "HMACCOUNT",
      "Hm_lvt",
      "Hm_lpvt",
      // 百度搜索
      "BAIDU",        // BAIDU_WISE_UID
      "BAIDUID",      // BAIDUID, BAIDUID_BFESS
      "BDUSS",        // BDUSS, BDUSS_BFESS
      "BDORZ",
      "BIDUPSID",
      "PSTM",
      "MCITY",
      "ZFY",
      "H_PS_PSSID",
      "H_WISE_SIDS",  // H_WISE_SIDS, H_WISE_SIDS_BFESS
      "ab_sr",
      "__bid_n",
      "_sp_id",       // _sp_id.cbae 等
      "ploganondeg",
      "BEC",
      // Google Analytics
      "_ga",
      "_gid",
      "_gat",
    ];

    const cookies = cookie.split(/;\s*/);
    const filteredCookies = cookies.filter((c) => {
      const key = c.split("=")[0]?.trim();
      if (!key) {
        return false;
      }
      // 检查是否匹配已知的第三方cookie前缀（支持 _ 和 . 分隔符）
      return !thirdPartyPrefixes.some(
        (prefix) =>
          key === prefix ||
          key.startsWith(prefix + "_") ||
          key.startsWith(prefix + ".")
      );
    });

    const result = filteredCookies.join("; ");
    if (result !== cookie) {
      console.log(
        `过滤第三方cookie: 从 ${cookies.length} 个减少到 ${filteredCookies.length} 个`
      );
    }
    return result;
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
