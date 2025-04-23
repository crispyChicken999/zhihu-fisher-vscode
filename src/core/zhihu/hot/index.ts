import axios from "axios";
import * as cheerio from "cheerio";
import { Store } from "../../stores";
import { LinkItem } from "../../types";

export class HotListManager {
  private cookieManager = Store.Zhihu.cookieManager;
  constructor() {}

  async getHotList() {
    // 设置加载状态
    Store.Zhihu.hot.isLoading = true;

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

    const cookie = Store.Zhihu.cookieInfo.cookie;
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

    const hotList: LinkItem[] = [];

    try {
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
            const linkElement = $(element).find(".HotItem-content a");

            const title = titleElement.text().trim();
            const url = linkElement.attr("href") || "";
            const id = `hot-${url.split("/").pop()}` || `hot-${index}`;
            const excerpt = $(element).find(".HotItem-excerpt").text().trim();
            const hotValue = $(element).find(".HotItem-metrics").text().trim();
            const imgUrl =
              $(element).find(".HotItem-img img").attr("src") || "";

            if (title && url) {
              hotList.push({
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
        console.log("未找到热榜列表容器");
        throw new Error("未找到热榜列表容器");
      }

      console.log(`成功解析出${hotList.length}个热榜项目`);

      Store.Zhihu.hot.list = hotList;
    } catch (error) {
      Store.Zhihu.hot.list = []; // 清空热榜列表
      console.error("获取知乎热榜失败:", error);
      throw new Error(
        `获取知乎热榜失败: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      // 重置加载状态
      Store.Zhihu.hot.isLoading = false;
    }
  }

  // 清空热榜列表
  clearList() {
    console.log("清空知乎热榜列表");
    Store.Zhihu.hot.list = []; // 清空热榜列表
    Store.Zhihu.hot.isLoading = false; // 重置加载状态
  }
}
