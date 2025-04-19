import * as Puppeteer from "puppeteer"; // 引入Puppeteer类型
import { Store } from "../../stores";
import { LinkItem } from "../../types";
import { PuppeteerManager } from "../puppeteer";

export class RecommendListManager {
  private cookieManager = Store.Zhihu.cookieManager;
  constructor() {}

  // 获取知乎首页推荐
  async getRecommendList() {
    console.log("开始获取知乎首页推荐...");

    Store.Zhihu.recommend.isLoading = true; // 设置加载状态

    const cookie = this.cookieManager.getCookie();
    if (!cookie) {
      this.cookieManager.promptForNewCookie(
        "需要知乎Cookie才能获取推荐，请设置"
      );
      throw new Error("需要设置知乎Cookie才能访问");
    }

    // 创建并获取浏览器页面
    const page = await PuppeteerManager.createPage();

    console.log("导航到知乎首页...");
    await page.goto("https://www.zhihu.com/", {
      waitUntil: "networkidle0",
      timeout: 30000, // 30秒超时
    });

    PuppeteerManager.setPageInstance("recommend", page); // 设置页面实例

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
            "需要知乎Cookie才能获取推荐内容，请设置"
          );
          throw new Error("需要设置知乎Cookie才能访问");
        }
      }

      console.log("开始提取推荐内容...");

      // 尝试滚动页面加载更多内容
      await this.scrollToLoadMore(page);

      const recommendList = await this.parseRecommendList(page);
      console.log(`成功解析出${recommendList.length}个推荐项目`);
      console.log("推荐列表解析完成，更新Store...");
      Store.Zhihu.recommend.list = recommendList; // 更新推荐列表
    } catch (error) {
      console.error("获取推荐列表失败:", error);
      // 处理错误
      if (error instanceof Puppeteer.TimeoutError) {
        console.error("页面加载超时，可能是网络问题或知乎反爬虫机制");
      } else {
        console.error("发生错误:", (error as Error).message);
      }
    } finally {
      console.log("关闭知乎首页...");
      await page.close(); // 关闭页面
      // 重置加载状态
      Store.Zhihu.recommend.isLoading = false;
    }
  }

  // 解析推荐列表
  private async parseRecommendList(page: Puppeteer.Page): Promise<LinkItem[]> {
    const recommendList = await page.evaluate(() => {
      const items: LinkItem[] = [];

      const feedItems = Array.from(
        document.querySelectorAll(".TopstoryItem-isRecommend .Feed")
      );

      if (feedItems.length > 0) {
        console.log(`找到${feedItems.length}个Feed项`);

        feedItems.forEach((item, index) => {
          const id = location.href.split('/').pop() as string; // 获取问题的ID

          // title <meta itemprop="name" content="长辈的什么行为让你感到窒息？">
          const titleElement = item.querySelector('meta[itemprop="name"]');
          const title = titleElement
            ? (titleElement as HTMLMetaElement).content
            : "未知标题";

          //<meta itemprop="url" content="https://www.zhihu.com/question/608280827">
          const urlElement = item.querySelector('meta[itemprop="url"]');
          const url = urlElement
            ? (urlElement as HTMLMetaElement).content
            : "未知链接";

          const excerptElement = item.querySelector(".RichContent .RichText");
          const excerpt = excerptElement
            ? ((excerptElement as HTMLMetaElement).textContent as string)
            : "未知摘要";

          items.push({
            id,
            url,
            title,
            excerpt,
          });
          console.log(`成功解析推荐项 #${index + 1}: ${title}`);
        });
      }

      return items;
    });

    return recommendList;
  }

  // 滚动页面加载更多内容
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
}
