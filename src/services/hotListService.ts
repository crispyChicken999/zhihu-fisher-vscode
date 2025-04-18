import axios from "axios";
import * as cheerio from "cheerio";
import { ZhihuHotItem } from "./types";
import { CookieManager } from "./cookieManager";

export class HotListService {
  private cookieManager: CookieManager;
  // 静态变量标记是否正在加载热榜
  private static isLoading: boolean = false;

  constructor(cookieManager: CookieManager) {
    this.cookieManager = cookieManager;
  }

  /**
   * 检查是否正在加载热榜
   * @returns 是否正在加载
   */
  static isLoadingHotList(): boolean {
    return HotListService.isLoading;
  }

  // 获取知乎热榜
  async getHotList(): Promise<ZhihuHotItem[]> {
    try {
      console.log("开始获取知乎热榜...");
      
      // 设置加载状态
      HotListService.isLoading = true;

      // 构建请求头
      const headers: Record<string, string> = {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "max-age=0",
        Connection: "keep-alive",
        "Sec-Ch-Ua":
          '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        Dnt: "1",
        "Upgrade-Insecure-Requests": "1",
      };

      // 如果有cookie，添加到请求头
      const cookie = this.cookieManager.getCookie();
      if (cookie) {
        headers["Cookie"] = cookie;
        console.log("使用已保存的Cookie进行请求");
      } else {
        this.cookieManager.promptForNewCookie(
          "需要知乎Cookie才能获取热榜，请设置"
        );
        throw new Error("需要设置知乎Cookie才能访问");
      }

      const response = await axios.get("https://www.zhihu.com/hot", {
        headers,
        timeout: 15000, // 增加超时时间到15秒
        maxRedirects: 5, // 允许重定向
      });

      console.log("成功获取知乎热榜HTML，开始解析...");

      const $ = cheerio.load(response.data);

      // 检查是否有登录墙或验证码
      const loginElements =
        $("button:contains('登录')").length || $(".SignContainer").length;
      const captchaElements = $("body").find(
        "[class*='captcha'],[class*='verify'],[class*='Captcha'],[class*='Verify']"
      ).length;

      if (
        (loginElements > 0 && $(".HotList-list").length === 0) ||
        captchaElements > 0
      ) {
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
            "需要知乎Cookie才能获取热榜，请设置"
          );
          throw new Error("需要设置知乎Cookie才能访问");
        }
      }

      const hotItems: ZhihuHotItem[] = [];

      // 基于提供的HTML结构进行精确定位
      console.log("尝试定位热榜列表容器 HotList-list...");
      const hotListContainer = $(".HotList-list");

      if (hotListContainer.length > 0) {
        console.log("找到热榜列表容器，开始解析热榜项...");
        const items = hotListContainer.find("section.HotItem");
        console.log(`找到${items.length}个热榜项目`);

        items.each((index, element) => {
          try {
            // 从每个HotItem中提取信息
            const titleElement = $(element).find(".HotItem-title");
            const title = titleElement.text().trim();

            const linkElement = $(element).find(".HotItem-content a");
            const url = linkElement.attr("href") || "";

            const id = url.split("/").pop() || `item-${index}`;

            const excerpt = $(element).find(".HotItem-excerpt").text().trim();

            const hotValue = $(element).find(".HotItem-metrics").text().trim();

            const imgUrl =
              $(element).find(".HotItem-img img").attr("src") || "";

            if (title && url) {
              hotItems.push({
                id,
                title,
                url: url.startsWith("http")
                  ? url
                  : `https://www.zhihu.com${url}`,
                excerpt,
                hotValue,
                imgUrl,
              });
              console.log(`成功解析热榜项 #${index + 1}: ${title}`);
            }
          } catch (itemError) {
            console.error(`解析第${index + 1}个热榜项目失败:`, itemError);
          }
        });
      } else {
        console.log("未找到热榜列表容器，尝试备用选择器...");

        // 备用方案：直接查找所有HotItem
        const items = $("section.HotItem");
        console.log(`通过备用选择器找到${items.length}个热榜项目`);

        if (items.length === 0) {
          // 再尝试一种可能的选择器 - 基于用户提供的实际HTML结构
          const alternativeItems = $(
            "[data-za-detail-view-path-module='FeedItem']"
          );
          console.log(
            `通过另一备用选择器找到${alternativeItems.length}个热榜项目`
          );

          if (alternativeItems.length > 0) {
            alternativeItems.each((index, element) => {
              try {
                // 针对用户提供的HTML结构进行精确解析
                const titleElement = $(element).find("h2.HotItem-title");
                const title = titleElement.text().trim();

                const linkElement = $(element)
                  .find(".HotItem-content a")
                  .first();
                const url = linkElement.attr("href") || "";

                const id = url.split("/").pop() || `item-${index}`;

                const excerpt = $(element)
                  .find("p.HotItem-excerpt")
                  .text()
                  .trim();

                const hotValue = $(element)
                  .find(".HotItem-metrics")
                  .text()
                  .trim();

                const imgUrl =
                  $(element).find(".HotItem-img img").attr("src") || "";

                if (title && url) {
                  hotItems.push({
                    id,
                    title,
                    url: url.startsWith("http")
                      ? url
                      : `https://www.zhihu.com${url}`,
                    excerpt,
                    hotValue,
                    imgUrl,
                  });
                  console.log(`成功解析备用热榜项 #${index + 1}: ${title}`);
                }
              } catch (itemError) {
                console.error(`解析备用热榜项目失败:`, itemError);
              }
            });
          }
        } else {
          items.each((index, element) => {
            try {
              const titleElement = $(element).find(".HotItem-title, h2");
              const title = titleElement.text().trim();

              const linkElement = $(element).find("a[href]").first();
              const url = linkElement.attr("href") || "";

              const id = url.split("/").pop() || `item-${index}`;

              const excerpt = $(element)
                .find(".HotItem-excerpt, p")
                .text()
                .trim();

              const hotValue = $(element)
                .find(".HotItem-metrics")
                .text()
                .trim();

              const imgUrl = $(element).find("img").attr("src") || "";

              if (title && url) {
                hotItems.push({
                  id,
                  title,
                  url: url.startsWith("http")
                    ? url
                    : `https://www.zhihu.com${url}`,
                  excerpt,
                  hotValue,
                  imgUrl,
                });
                console.log(`成功解析热榜项 #${index + 1}: ${title}`);
              }
            } catch (itemError) {
              console.error(`解析热榜项目失败:`, itemError);
            }
          });
        }
      }

      // 终极备用方案：如果仍然找不到热榜项目，尝试寻找任何可能的列表项
      if (hotItems.length === 0) {
        console.log("使用终极备用方案尝试获取任何列表项...");
        // 尝试获取任何带链接和标题的元素
        $("a[href]").each((index, element) => {
          const $el = $(element);
          // 只选取可能是内容项目的链接（包含知乎问题或文章URL模式的链接）
          if (
            $el.attr("href")?.includes("/question/") ||
            $el.attr("href")?.includes("/p/")
          ) {
            const url = $el.attr("href") || "";
            // 尝试从链接或其父元素获取标题
            const title =
              $el.find("h2, h3").text().trim() ||
              $el.text().trim() ||
              $el.parent().find("h2, h3").text().trim();

            if (title && url && title.length > 5) {
              // 确保标题有一定长度才可能是正确内容
              const id = url.split("/").pop() || `item-${index}`;
              hotItems.push({
                id,
                title,
                url: url.startsWith("http")
                  ? url
                  : `https://www.zhihu.com${url}`,
                excerpt: "",
                hotValue: "",
                imgUrl: "",
              });

              if (hotItems.length >= 50) {
                // 限制项目数量
                return false; // 中断each循环
              }
            }
          }
        });
      }

      if (hotItems.length === 0) {
        console.log("所有方法均未能获取热榜项目");

        // 如果没有cookie或cookie无效，提示需要更新cookie
        if (!cookie) {
          this.cookieManager.promptForNewCookie(
            "需要知乎Cookie才能获取热榜，请设置"
          );
        } else {
          this.cookieManager.promptForNewCookie(
            "无法解析知乎热榜，您的Cookie可能已失效"
          );
        }

        throw new Error("未能识别知乎热榜结构，可能需要设置或更新Cookie");
      }

      console.log(`成功解析出${hotItems.length}个热榜项目`);
      return hotItems;
    } catch (error) {
      console.error("获取知乎热榜失败:", error);
      throw new Error(
        `获取知乎热榜失败: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      // 重置加载状态
      HotListService.isLoading = false;
    }
  }
}
