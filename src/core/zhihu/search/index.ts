import * as Puppeteer from "puppeteer";
import { Store } from "../../stores";
import { LinkItem } from "../../types";
import { PuppeteerManager } from "../puppeteer";

export class SearchManager {
  private cookieManager = Store.Zhihu.cookieManager;
  constructor() {}

  /**
   * 执行知乎搜索
   * @param query 搜索关键词
   * @returns 搜索结果列表
   */
  async search(query: string): Promise<LinkItem[]> {
    console.log(`开始搜索知乎内容: "${query}"`);

    Store.Zhihu.search.isLoading = true; // 设置加载状态
    Store.Zhihu.search.currentQuery = query; // 保存当前搜索词

    const cookie = this.cookieManager.getCookie();
    if (!cookie) {
      this.cookieManager.promptForNewCookie(
        "需要知乎Cookie才能搜索内容，请设置"
      );
      throw new Error("需要设置知乎Cookie才能访问");
    }

    // 创建并获取浏览器页面
    const page = await PuppeteerManager.createPage();

    // 构建搜索URL（搜索回答内容）
    const searchUrl = `https://www.zhihu.com/search?q=${encodeURIComponent(
      query
    )}&type=content&vertical=answer`;

    console.log(`导航到知乎搜索页面: ${searchUrl}`);
    await page.goto(searchUrl, {
      waitUntil: "networkidle0",
      timeout: 30000, // 30秒超时
    });

    PuppeteerManager.setPageInstance("search", page); // 设置页面实例

    try {
      console.log("页面加载完成，开始读取页面...");
      await PuppeteerManager.simulateHumanScroll(page);
      await PuppeteerManager.delay(500);

      // 检查是否有登录墙或验证码
      const hasLoginWall = await page.evaluate(() => {
        const loginElements =
          document.querySelectorAll("button, a, div").length > 0
            ? Array.from(document.querySelectorAll("button, a, div")).some(
                (el) =>
                  el.textContent?.includes("登录") &&
                  (el.tagName === "BUTTON" ||
                    el.classList.contains("SignContainer"))
              )
            : false;
        const captchaElements =
          document.querySelectorAll(
            '[class*="captcha"], [class*="verify"], [class*="Captcha"], [class*="Verify"]'
          ).length > 0;
        return loginElements || captchaElements;
      });

      // 如果有登录墙
      if (hasLoginWall) {
        console.log("检测到登录墙或验证码");
        if (cookie) {
          // 如果已经有cookie但仍然被拦截，可能是cookie过期
          console.log("Cookie可能已失效，需要更新");
          this.cookieManager.promptForNewCookie(
            "您的知乎Cookie可能已过期，请更新"
          );
          throw new Error("知乎Cookie已失效，请更新");
        } else {
          // 如果没有cookie且被拦截
          console.log("需要设置Cookie才能访问");
          this.cookieManager.promptForNewCookie(
            "需要知乎Cookie才能搜索内容，请设置"
          );
          throw new Error("需要设置知乎Cookie才能访问");
        }
      }

      console.log("开始提取搜索结果内容...");

      // 尝试滚动页面加载更多内容
      await this.scrollToLoadMore(page);

      const searchResults = await this.parseSearchResults(page, query);
      console.log(`成功解析出${searchResults.length}个搜索结果`);
      console.log("搜索结果解析完成，更新Store...");
      Store.Zhihu.search.list = searchResults; // 更新搜索结果列表
      return searchResults;
    } catch (error) {
      console.error("搜索失败:", error);
      // 处理错误
      if (error instanceof Puppeteer.TimeoutError) {
        console.error("页面加载超时，可能是网络问题或知乎反爬虫机制");
      } else {
        console.error("发生错误:", (error as Error).message);
      }
      throw error;
    } finally {
      console.log("关闭知乎搜索页面...");
      await page.close(); // 关闭页面
      // 重置加载状态
      Store.Zhihu.search.isLoading = false;
    }
  }

  /**
   * 解析搜索结果
   * @param page Puppeteer页面实例
   * @param query 搜索关键词
   * @returns 搜索结果列表
   */
  private async parseSearchResults(
    page: Puppeteer.Page,
    query: string
  ): Promise<LinkItem[]> {
    const searchResults = await page.evaluate((searchQuery) => {
      const items: LinkItem[] = [];

      // 查找所有搜索结果条目
      const resultItems = Array.from(document.querySelectorAll(".List-item"));

      if (resultItems.length > 0) {
        console.log(`找到${resultItems.length}个搜索结果项`);

        resultItems.forEach((item, index) => {
          try {
            // 提取问题信息
            const questionMeta = item.querySelector(
              'div[itemprop="zhihu:question"]'
            );
            if (!questionMeta) {
              return;
            }

            // 提取问题URL和标题
            const urlMeta = questionMeta.querySelector('meta[itemprop="url"]');
            const titleMeta = questionMeta.querySelector(
              'meta[itemprop="name"]'
            );

            if (!urlMeta || !titleMeta) {
              return;
            }

            const url = (urlMeta as HTMLMetaElement).content || "";
            const title = (titleMeta as HTMLMetaElement).content || "";
            const id = `search-${url.split("/").pop()}-${index}`;

            // 提取回答内容摘要
            const contentElement = item.querySelector(".RichText");
            let excerpt = contentElement
              ? contentElement.textContent || ""
              : "";

            // 如果摘要太长，截断它
            if (excerpt.length > 150) {
              excerpt = excerpt.substring(0, 147) + "...";
            }

            // 如果该结果已存在，则跳过
            if (items.some((existingItem) => existingItem.id === id)) {
              console.log(`搜索结果 #${index + 1} 已存在，跳过...`);
              return;
            }

            items.push({
              id,
              url,
              title,
              excerpt,
            });

            console.log(`成功解析搜索结果 #${index + 1}: ${title}`);
          } catch (error) {
            console.error(`解析搜索结果 #${index + 1} 时出错:`, error);
          }
        });
      } else {
        console.log("未找到搜索结果");
      }

      return items;
    }, query);

    return searchResults;
  }

  /**
   * 滚动页面加载更多内容
   * @param page Puppeteer页面实例
   */
  private async scrollToLoadMore(page: Puppeteer.Page) {
    let scrollAttempts = 3; // 滚动尝试次数
    for (let i = 0; i < scrollAttempts; i++) {
      console.log(`执行页面滚动 #${i + 1}/${scrollAttempts}`);
      const scrollHeight = await page.evaluate(() => {
        return document.body.scrollHeight;
      });

      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      await PuppeteerManager.delay(500); // 等待加载

      const newScrollHeight = await page.evaluate(() => {
        return document.body.scrollHeight;
      });

      if (newScrollHeight > scrollHeight) {
        console.log(
          `滚动高度: ${scrollHeight}px -> ${newScrollHeight}px，认为有更多内容`
        );
        console.log("成功加载更多内容");
      } else {
        console.log("没有更多内容可加载");
      }
    }
  }

  /**
   * 清空搜索列表
   */
  clearList(): void {
    console.log("清空搜索列表...");
    Store.Zhihu.search.list = []; // 清空搜索列表
    Store.Zhihu.search.isLoading = false; // 重置加载状态
    Store.Zhihu.search.currentQuery = ""; // 清空当前搜索词
  }
}
