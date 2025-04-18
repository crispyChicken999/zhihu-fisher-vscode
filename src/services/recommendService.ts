import axios from "axios";
import * as cheerio from "cheerio";
import { ZhihuHotItem } from "./types";
import { CookieManager } from "./cookieManager";
import * as puppeteer from "puppeteer";
import { PuppeteerManager } from "./puppeteerManager";

export class RecommendService {
  private cookieManager: CookieManager;
  // 存储已使用的ID，避免重复
  private usedIds: Set<string> = new Set();
  // 静态变量标记是否正在加载推荐列表
  private static isLoading: boolean = false;

  constructor(cookieManager: CookieManager) {
    this.cookieManager = cookieManager;
  }

  /**
   * 检查是否正在加载推荐列表
   * @returns 是否正在加载
   */
  static isLoadingRecommendList(): boolean {
    return RecommendService.isLoading;
  }

  // 获取知乎首页推荐
  async getRecommendList(): Promise<ZhihuHotItem[]> {
    try {
      console.log("开始获取知乎首页推荐...");
      // 每次获取推荐前清空ID缓存
      this.usedIds.clear();

      // 设置加载状态
      RecommendService.isLoading = true;

      const cookie = this.cookieManager.getCookie();
      if (!cookie) {
        this.cookieManager.promptForNewCookie(
          "需要知乎Cookie才能获取推荐，请设置"
        );
        throw new Error("需要设置知乎Cookie才能访问");
      }

      // 创建并获取浏览器页面
      const page = await PuppeteerManager.createPage(this.cookieManager);

      console.log("导航到知乎首页...");
      await page.goto("https://www.zhihu.com/", {
        waitUntil: "networkidle0",
        timeout: 30000, // 30秒超时
      });

      PuppeteerManager.setPageInstance("home", page); // 设置页面实例
      try {
        console.log("页面加载完成，等待内容稳定...");
        await PuppeteerManager.simulateHumanScroll(page);
        await PuppeteerManager.delay(1000);
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
              "需要知乎Cookie才能获取推荐内容，请设置"
            );
            throw new Error("需要设置知乎Cookie才能访问");
          }
        }

        console.log("开始提取推荐内容...");
        const recommendItems = await this.extractRecommendItems(page);

        // 确保ID的唯一性
        const uniqueItems = this.ensureUniqueIds(recommendItems);

        if (uniqueItems.length === 0) {
          console.log("未找到推荐内容，尝试滚动页面加载更多...");

          // 尝试滚动页面加载更多内容
          await this.scrollToLoadMore(page);

          // 再次尝试提取
          const newRecommendItems = await this.extractRecommendItems(page);
          const uniqueNewItems = this.ensureUniqueIds(newRecommendItems);

          if (uniqueNewItems.length > 0) {
            console.log(`滚动后成功加载了${uniqueNewItems.length}个推荐项`);
            return uniqueNewItems;
          }

          // 如果仍然没有内容，可能是cookie问题
          const cookie = this.cookieManager.getCookie();
          if (!cookie) {
            this.cookieManager.promptForNewCookie(
              "需要知乎Cookie才能获取推荐，请设置"
            );
          } else {
            this.cookieManager.promptForNewCookie(
              "无法解析知乎推荐，您的Cookie可能已失效"
            );
          }

          throw new Error("未能识别知乎推荐结构，可能需要设置或更新Cookie");
        }

        console.log(`成功解析出${uniqueItems.length}个推荐项目`);
        return uniqueItems;
      } finally {
        console.log("关闭知乎首页...");
        await page.close(); // 关闭页面
        // 重置加载状态
        RecommendService.isLoading = false;
      }
    } catch (error) {
      console.error("获取知乎推荐失败:", error);
      // 确保在出错时也重置加载状态
      RecommendService.isLoading = false;
      throw new Error(
        `获取知乎推荐失败: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // 确保推荐项的ID唯一
  private ensureUniqueIds(items: ZhihuHotItem[]): ZhihuHotItem[] {
    const uniqueItems: ZhihuHotItem[] = [];

    for (const item of items) {
      // 如果ID已存在，为其生成新ID
      if (this.usedIds.has(item.id)) {
        const timestamp = Date.now();
        const randomSuffix = Math.floor(Math.random() * 10000);
        const newId = `recommend-${timestamp}-${randomSuffix}`;
        console.log(`检测到重复ID: ${item.id}，重新分配为: ${newId}`);

        // 创建新对象而不是修改原对象
        uniqueItems.push({
          ...item,
          id: newId,
        });
        this.usedIds.add(newId);
      } else {
        // ID尚未使用，记录并添加到结果
        this.usedIds.add(item.id);
        uniqueItems.push(item);
      }
    }

    return uniqueItems;
  }

  // 提取推荐列表项
  private async extractRecommendItems(
    page: puppeteer.Page
  ): Promise<ZhihuHotItem[]> {
    return await page.evaluate(() => {
      const items: {
        id: string;
        title: string;
        url: string;
        excerpt: string;
        hotValue: string;
        imgUrl: string;
      }[] = [];

      // 为每个推荐项生成唯一前缀ID
      const generateId = (baseId: string, index: number) => {
        return `recommend-item-${baseId || index}`;
      };

      const feedItems = Array.from(document.querySelectorAll(".Feed"));

      if (feedItems.length > 0) {
        console.log(`找到${feedItems.length}个Feed项`);

        // 处理每个Feed项
        feedItems.forEach((item, index) => {
          try {
            // 尝试多种选择器找标题元素
            const titleElement =
              item.querySelector("h2.ContentItem-title a") ||
              item.querySelector(".ContentItem-title a") ||
              item.querySelector("h2 a");

            if (!titleElement) {
              return;
            };

            const title = titleElement.textContent?.trim() || "";
            let url = (titleElement as HTMLAnchorElement).href || "";

            // 生成唯一ID
            let baseId;
            if (url.includes("/question/")) {
              const match = url.match(/question\/(\d+)/);
              baseId = match ? match[1] : null;
            } else if (url.includes("/answer/")) {
              const match = url.match(/answer\/(\d+)/);
              baseId = match ? match[1] : null;
            } else if (url.includes("/p/")) {
              const match = url.match(/p\/([a-zA-Z0-9]+)/);
              baseId = match ? match[1] : null;
            }

            // 确保ID唯一
            const id = generateId(baseId || "", index);

            // 对URL进行处理，只保留问题，不要具体的回答，把/answer/及后面的内容去掉
            url = url.replace(/\/answer\/\d+/, "");

            // 获取摘要内容
            const excerptElement =
              item.querySelector(".RichText.ztext") ||
              item.querySelector(".RichContent-inner") ||
              item.querySelector(".RichText");
            const excerpt = excerptElement?.textContent?.trim() || "";

            // 获取热度/赞数
            const voteButton =
              item.querySelector(".VoteButton--up") ||
              item.querySelector(".Button--plain");
            const hotValue = voteButton?.textContent?.trim() || "";

            // 获取图片URL
            const imgElement = item.querySelector("img[src]");
            const imgUrl = imgElement?.getAttribute("src") || "";

            if (title && url) {
              items.push({
                id,
                title,
                url,
                excerpt,
                hotValue,
                imgUrl,
              });
              console.log(`成功解析推荐项 #${index + 1}: ${title}`);
            }
          } catch (err) {
            console.error(`解析推荐项 #${index} 失败`);
          }
        });
      }

      return items;
    });
  }

  // 滚动页面加载更多内容
  private async scrollToLoadMore(
    page: puppeteer.Page,
    scrollAttempts: number = 3
  ): Promise<void> {
    for (let i = 0; i < scrollAttempts; i++) {
      console.log(`执行页面滚动 #${i + 1}/${scrollAttempts}`);

      // 滚动到页面底部
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      // 等待内容加载
      console.log("等待新内容加载...");
      await PuppeteerManager.delay(2000);
    }
  }
}
