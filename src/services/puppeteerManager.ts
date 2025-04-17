import * as puppeteer from "puppeteer";
import { CookieManager } from "./cookieManager";

/**
 * 负责管理Puppeteer浏览器实例和页面操作
 */
export class PuppeteerManager {
  private static browserInstance: puppeteer.Browser | null = null;
  private static currentPage: puppeteer.Page | null = null;

  /**
   * 获取或创建浏览器实例（单例模式）
   */
  static async getBrowserInstance(): Promise<puppeteer.Browser> {
    if (!PuppeteerManager.browserInstance) {
      console.log("创建新的浏览器实例...");
      PuppeteerManager.browserInstance = await puppeteer.launch({
        headless: false, // 设置为false以便调试
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--window-size=1600,900",
        ],
      });
    }
    return PuppeteerManager.browserInstance;
  }

  /**
   * 创建并设置新的页面，如果已存在页面则重用
   */
  static async createPage(
    cookieManager: CookieManager
  ): Promise<puppeteer.Page> {
    const browser = await PuppeteerManager.getBrowserInstance();

    // 如果已有页面且没有关闭，则重用
    if (PuppeteerManager.currentPage) {
      try {
        // 检查页面是否仍然可用
        await PuppeteerManager.currentPage.evaluate(() => true);
        console.log("重用现有页面...");
        return PuppeteerManager.currentPage;
      } catch (e) {
        console.log("现有页面已关闭，创建新页面...");
        PuppeteerManager.currentPage = null;
      }
    }

    console.log("打开新页面...");
    const page = await browser.newPage();
    PuppeteerManager.currentPage = page;

    // 设置浏览器视窗大小
    await page.setViewport({ width: 800, height: 600 });

    // 设置User-Agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36"
    );

    // 如果有cookie，设置到页面
    const cookie = cookieManager.getCookie();
    if (cookie) {
      await PuppeteerManager.addCookiesToPage(cookie, page);
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
    page: puppeteer.Page,
    domain: string = "www.zhihu.com"
  ): Promise<void> {
    const cookies = cookiesStr.split(";").map((pair) => {
      let name = pair.trim().slice(0, pair.trim().indexOf("="));
      let value = pair.trim().slice(pair.trim().indexOf("=") + 1);
      return { name, value, domain };
    });

    await Promise.all(
      cookies.map((pair) => {
        return page.setCookie(pair);
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
   * 模拟人类的滚动行为
   */
  static async simulateHumanScroll(page: puppeteer.Page): Promise<void> {
    console.log("滚动了吗？");

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight); // 滚动到顶部
    });
    await PuppeteerManager.delay(1500 + Math.random() * 500);

    await page.mouse.wheel({ deltaY: 1000 }); // 快速滚到底部
    await PuppeteerManager.delay(1500 + Math.random() * 500);

    // 2. 上移 200px 制造滚动空间
    await page.mouse.wheel({ deltaY: -200 });
    await PuppeteerManager.delay(1500 + Math.random() * 500);

    // 3. 再次下滚触发加载
    await page.mouse.wheel({ deltaY: 1000 });
    await PuppeteerManager.delay(1500 + Math.random() * 500);
  }

  /**
   * 完全关闭浏览器实例
   */
  static async closeBrowserInstance(): Promise<void> {
    if (PuppeteerManager.browserInstance) {
      try {
        PuppeteerManager.currentPage = null;
        await PuppeteerManager.browserInstance.close();
        PuppeteerManager.browserInstance = null;
        console.log("已关闭浏览器实例");
      } catch (error) {
        console.error("关闭浏览器实例失败:", error);
      }
    }
  }
}
