import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { Store } from "../../stores";
import * as Puppeteer from "puppeteer";
import { CookieManager } from "../cookie";

export class PuppeteerManager {
  /**
   * 获取或创建浏览器实例（单例模式）
   */
  static async getBrowserInstance(): Promise<Puppeteer.Browser> {
    if (!Store.browserInstance) {
      console.log("创建新的浏览器实例...");

      try {
        Store.browserInstance = await Puppeteer.launch({
          executablePath: Puppeteer.executablePath(),
          headless: true,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--window-size=1000,700",
          ],
        });
      } catch (error) {
        console.error("创建浏览器实例失败:", error);

        // 显示错误通知，提示用户运行特定命令以获取浏览器
        const message =
          "无法创建爬虫浏览器，可能是找不到爬虫浏览器的chrome.exe路径";
        const action = "点击安装爬虫浏览器";
        const selection = await vscode.window.showErrorMessage(message, action);

        // 用户点击了安装浏览器的操作，执行安装命令
        if (selection === action) {
          vscode.commands.executeCommand("zhihu-fisher.installBrowser");
        }
        throw new Error(
          "浏览器缺失，请运行命令：npx puppeteer browsers install chrome@135.0.7049.84"
        );
      }
    }
    return Store.browserInstance;
  }

  /**
   * 可以创建浏览器，说明系统中有安装浏览器，那么就继续执行下一步操作
   * @returns 是否可以创建浏览器实例
   */
  static async canCreateBrowser(): Promise<boolean> {
    const executablePath = Puppeteer.executablePath();
    // console.log("Puppeteer里面的executablePath: ", executablePath);
    const normalizedPath = path.normalize(executablePath);
    // console.log("规范化后的浏览器路径: ", normalizedPath);
    // console.log('666',fs.existsSync("C:\\Users"));

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
