import * as Puppeteer from "puppeteer";
import { Store } from "../../stores";

export class PuppeteerManager {
  /**
   * 获取或创建浏览器实例（单例模式）
   */
  static async getBrowserInstance(): Promise<Puppeteer.Browser> {
    if (!Store.browserInstance) {
      console.log("创建新的浏览器实例...");
      Store.browserInstance = await Puppeteer.launch({
        headless: false,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--window-size=1000,700",
        ],
      });
    }
    return Store.browserInstance;
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
    const cookie = Store.Zhihu.cookieManager.getCookie();
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
