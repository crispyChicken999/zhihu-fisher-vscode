import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import { Store } from "../../stores";
import * as Puppeteer from "puppeteer";
import { CookieManager } from "../cookie";

interface ChromePathExample {
  /** Puppeteer安装的浏览器位置 */
  default: string;
  /** 用户自定义的Chrome路径 */
  custom: string;
}

export class PuppeteerManager {
  /**
   * 获取当前操作系统类型
   * @returns 操作系统类型："windows" | "macos" | "unknown"
   */
  static getOSType(): "Windows" | "MacOS" | "unsupported" {
    const platform = os.platform();

    switch (platform) {
      case "win32":
        return "Windows";
      case "darwin":
        return "MacOS";
      default:
        return "unsupported";
    }
  }

  /**
   * 获取Chrome浏览器路径示例
   * @returns {default: string, custom: string}
   * - default: Puppeteer安装的浏览器位置
   * - custom: 用户自定义的Chrome路径
   */
  static getChromeExamplePath(): ChromePathExample {
    const osType = PuppeteerManager.getOSType();

    switch (osType) {
      case "Windows":
        return {
          default:
            "C:\\Users\\[用户名]\\.cache\\puppeteer\\chrome\\win64-135.0.7049.84\\chrome-win64\\chrome.exe",
          custom: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        };
      case "MacOS":
        return {
          default:
            "/Users/[用户名]/Library/Caches/puppeteer/chrome/mac-x64-135.0.7049.84/chrome-mac-x64/Google Chrome.app/Contents/MacOS/Google Chrome",
          custom:
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        };
      default:
        return {
          default: "unsupported",
          custom: "unsupported",
        };
    }
  }

  /**
   * 获取用户配置的Chrome浏览器路径
   */
  static getUserChromePath(): string {
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    return config.get<string>("customChromePath", "");
  }

  /**
   * 设置用户自定义Chrome路径
   * @param path Chrome可执行文件的绝对路径
   */
  static async setUserChromePath(path: string): Promise<void> {
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    await config.update(
      "customChromePath",
      path,
      vscode.ConfigurationTarget.Global
    );
    if (!path) {
      console.log("已清除自定义Chrome路径设置");
    } else {
      console.log("已设置自定义Chrome路径:", path);
    }
  }

  /**
   * 用户是否设置了自定义Chrome路径
   * @returns 是否设置了自定义路径
   */
  static isUserSetCustomPath(): boolean {
    const userChromePath = PuppeteerManager.getUserChromePath();
    return userChromePath !== undefined && userChromePath !== "";
  }

  /**
   * 用户自定义的Chrome路径是否合法
   * @returns 是否存在
   */
  static isUserChromePathValid(): boolean {
    const userChromePath = PuppeteerManager.getUserChromePath();
    if (userChromePath) {
      return fs.existsSync(userChromePath);
    }
    return false;
  }

  /**
   * 获取或创建浏览器实例（单例模式）
   */
  static async getBrowserInstance(): Promise<Puppeteer.Browser> {
    if (!Store.browserInstance) {
      console.log("创建新的浏览器实例...");

      try {
        // 优先获取用户配置的Chrome路径
        const userChromePath = PuppeteerManager.getUserChromePath();
        const executablePath = userChromePath || Puppeteer.executablePath();

        // 检查路径是否存在
        if (userChromePath && !fs.existsSync(userChromePath)) {
          throw new Error(`自定义Chrome路径不存在: ${userChromePath}`);
        }

        const browserStartAttempts = 5;
        for (let i = 0; i < browserStartAttempts; i++) {
          try {
            console.log(`尝试启动浏览器，第${i + 1}次尝试...`);
            // 尝试启动浏览器
            Store.browserInstance = await Puppeteer.launch({
              executablePath: executablePath,
              headless: true,
              args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--window-size=1000,700",
              ],
              protocolTimeout: 60000, // 设置协议超时时间为60秒
            });
            await new Promise((resolve) => setTimeout(resolve, 1000)); // 等待1秒钟
            // console.log("浏览器实例创建成功！")
            console.log(`第${i + 1}次尝试后，成功启动浏览器！`);
            break; // 成功启动后跳出循环
          } catch (error) {
            console.error("尝试启动浏览器失败:", error);

            const browser = Store.browserInstance;
            if (browser && browser.connected) {
              console.error("正在关闭已启动的浏览器...");
              await browser.close();
            }

            Store.browserInstance = null;

            if (i === browserStartAttempts - 1) {
              console.error("5次尝试启动浏览器均失败，请稍候重试");
              throw new Error("5次尝试启动浏览器均失败，请稍候重试，可能是网络问题");
            }
            console.log("等待5秒后重试...");
            await new Promise((resolve) => setTimeout(resolve, 5000)); // 等待5秒钟
          }
        }
      } catch (error) {
        console.error("创建浏览器实例失败:", error);

        // 获取用户当前的自定义路径设置
        const userChromePath = PuppeteerManager.getUserChromePath();

        // 如果是自定义路径导致的错误，显示特定错误消息
        if (userChromePath) {
          const message = `您的自定义Chrome浏览器 "${userChromePath}" 无法正常工作。`;
          const useDefault = "安装默认浏览器";
          const changeCustomPath = "更改浏览器路径";

          const selection = await vscode.window.showErrorMessage(
            message,
            { modal: true },
            useDefault,
            changeCustomPath
          );

          if (selection === useDefault) {
            // 清除自定义路径设置
            await PuppeteerManager.setUserChromePath("");
            vscode.commands.executeCommand("zhihu-fisher.configureBrowser");
          } else if (selection === changeCustomPath) {
            vscode.commands.executeCommand("zhihu-fisher.setCustomChromePath");
          }
        } else {
          const message = "无法创建爬虫浏览器，可能是找不到浏览器的Chrome路径";
          const installAction = "安装默认浏览器";
          const useCustomAction = "自定义浏览器路径";

          const selection = await vscode.window.showErrorMessage(
            message,
            { modal: true },
            installAction,
            useCustomAction
          );

          // 根据用户选择执行操作
          if (selection === installAction) {
            vscode.commands.executeCommand("zhihu-fisher.configureBrowser");
          } else if (selection === useCustomAction) {
            vscode.commands.executeCommand("zhihu-fisher.setCustomChromePath");
          }
        }

        throw new Error(
          "无法创建浏览器实例，请设置有效的Chrome浏览器路径或安装Puppeteer浏览器"
        );
      }
    }

    // @ts-ignore
    return Store.browserInstance;
  }

  /**
   * 可以创建浏览器，说明系统中有安装浏览器，那么就继续执行下一步操作
   * @returns 是否可以创建浏览器实例
   */
  static async canCreateBrowser(): Promise<boolean> {
    // 优先检查用户配置的Chrome路径
    const userChromePath = PuppeteerManager.getUserChromePath();
    if (userChromePath) {
      console.log("用户设置了自定义Chrome浏览器路径:", userChromePath);
      if (fs.existsSync(userChromePath)) {
        console.log("可以创建浏览器实例");
        return true;
      } else {
        console.error("无法创建浏览器实例，浏览器路径不存在:", userChromePath);
        return false;
      }
    }

    // 如果没有自定义路径，检查Puppeteer默认路径
    const executablePath = Puppeteer.executablePath();
    const normalizedPath = path.normalize(executablePath);

    if (fs.existsSync(normalizedPath)) {
      console.log("可以创建浏览器实例");
      return true;
    } else {
      console.error("无法创建浏览器实例，浏览器路径不存在:", normalizedPath);
      return false;
    }
  }

  /**
   * 获取的页面实例
   * @param key 页面唯一标识符
   */
  static getPageInstance(key: string): Puppeteer.Page {
    return Store.pagesInstance.get(key) as Puppeteer.Page;
  }

  /**
   * 设置页面实例
   * @param key 页面唯一标识符
   * @param page 页面实例
   */
  static async setPageInstance(
    key: string,
    page: Puppeteer.Page
  ): Promise<void> {
    Store.pagesInstance.set(key, page);
  }

  /**
   * 创建新的页面
   */
  static async createPage(): Promise<Puppeteer.Page> {
    // 创建页面前先看看能不能创建浏览器实例
    const canCreateBrowser = await PuppeteerManager.canCreateBrowser();
    if (!canCreateBrowser) {
      console.error("无法创建浏览器实例，无法创建页面");
      throw new Error("无法创建浏览器实例，无法创建页面");
    }

    const browser = await PuppeteerManager.getBrowserInstance();

    console.log("打开新页面...");
    const page = await browser.newPage();

    // 设置浏览器视窗大小
    await page.setViewport({ width: 800, height: 600 });

    // 设置User-Agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36"
    );

    // 如果有cookie，设置到页面
    const cookie = CookieManager.getCookie();
    if (cookie) {
      await PuppeteerManager.addCookiesToPage(cookie);
    } else {
      console.log("没有找到Cookie，需要设置Cookie");
      throw new Error("没有找到Cookie，需要设置Cookie");
    }

    // 防反爬虫设置
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => undefined,
      });
    });

    return page;
  }

  /**
   * 添加Cookies到页面
   */
  static async addCookiesToPage(
    cookiesStr: string,
    domain: string = "www.zhihu.com"
  ): Promise<void> {
    const cookies = cookiesStr.split(";").map((pair) => {
      let name = pair.trim().slice(0, pair.trim().indexOf("="));
      let value = pair.trim().slice(pair.trim().indexOf("=") + 1);
      return { name, value, domain };
    });

    await Promise.all(
      cookies.map((pair) => {
        return Store.browserInstance!.setCookie(pair);
      })
    );
  }

  /**
   * 创建延时Promise
   */
  static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 模拟自然滚动行为
   * @todo 可以使用scrollIntoView()方法来模拟滚动到某个元素
   */
  static async simulateHumanScroll(page: Puppeteer.Page): Promise<void> {
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight); // 滚动到底部
    });
    await PuppeteerManager.delay(1000 + Math.random() * 500);

    await page.mouse.wheel({ deltaY: 1000 }); // 快速滚到底部
    await PuppeteerManager.delay(1000 + Math.random() * 500);

    // 2. 上移 200px 制造滚动空间
    await page.mouse.wheel({ deltaY: -200 });
    await PuppeteerManager.delay(1000 + Math.random() * 500);

    // 3. 再次下滚触发加载
    await page.mouse.wheel({ deltaY: 1000 });
    await PuppeteerManager.delay(1000 + Math.random() * 500);
  }

  /**
   * 将页面带到前台(激活页面)
   * @param key 页面唯一标识符
   */
  static async bringPageToFront(key: string): Promise<void> {
    const page = Store.pagesInstance.get(key);
    if (page) {
      console.log(`激活页面: ${key}`);
      await page.bringToFront();
    } else {
      console.log(`页面不存在，无法激活: ${key}，可能是新创建的页面`);
    }
  }

  /**
   * 关闭页面
   * @param key 页面唯一标识符
   */
  static async closePage(key: string): Promise<void> {
    const page = Store.pagesInstance.get(key);
    if (page) {
      console.log(`关闭${key}页面`);
      await page.close();
      Store.pagesInstance.delete(key);
    } else {
      console.log(`页面不存在: ${key}`);
    }
  }

  /**
   * 关闭浏览器实例
   * 其实关闭浏览器，页面也会一起关闭的，无需手动关闭页面
   */
  static async closeBrowserInstance(): Promise<void> {
    if (Store.browserInstance) {
      console.log("关闭浏览器实例...");
      await Store.browserInstance.close();
      Store.browserInstance = null;
    }
  }
}
