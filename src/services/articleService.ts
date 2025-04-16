import axios from "axios";
import * as cheerio from "cheerio";
import { marked } from "marked";
import { ZhihuArticle } from "./types";
import { CookieManager } from "./cookieManager";
import * as puppeteer from "puppeteer";

export class ArticleService {
  private cookieManager: CookieManager;

  constructor(cookieManager: CookieManager) {
    this.cookieManager = cookieManager;
  }

  // 获取文章内容
  async getArticleContent(
    url: string,
    hideImages: boolean
  ): Promise<ZhihuArticle> {
    try {
      console.log(`开始获取文章内容: ${url}`);

      // 构建请求头
      const headers: Record<string, string> = {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        Referer: "https://www.zhihu.com/",
        "Sec-Ch-Ua":
          '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
      };

      // 如果有cookie，添加到请求头
      const cookie = this.cookieManager.getCookie();
      if (cookie) {
        headers["Cookie"] = cookie;
      }

      const response = await axios.get(url, {
        headers,
        timeout: 15000,
      });

      const $ = cheerio.load(response.data);

      // 检查是否有登录墙或验证码
      const loginElements =
        $("button:contains('登录')").length || $(".SignContainer").length;
      const captchaElements = $("body").find(
        "[class*='captcha'],[class*='verify'],[class*='Captcha'],[class*='Verify']"
      ).length;

      if (loginElements > 0 || captchaElements > 0) {
        // 如果需要登录而用户没有设置cookie
        if (!cookie) {
          this.cookieManager.promptForNewCookie(
            "需要知乎Cookie才能查看文章内容"
          );
          throw new Error("需要设置知乎Cookie才能查看文章内容");
        } else {
          // 如果已有cookie但仍被拦截
          this.cookieManager.promptForNewCookie(
            "您的知乎Cookie可能已过期，请更新"
          );
          throw new Error("知乎Cookie已失效，请更新");
        }
      }

      console.log("成功获取HTML，开始解析文章内容");

      let title = "";
      let author = "";
      let authorAvatar = "";
      let authorBio = "";
      let authorUrl = ""; // 添加作者URL
      let contentHtml = "";
      let actualUrl = url; // 添加实际URL字段用于存储回答链接

      // 1. 获取问题标题
      title = $("h1.QuestionHeader-title").text().trim();
      if (!title) {
        // 文章标题
        title = $("h1.Post-Title").text().trim();
      }
      if (!title) {
        // 更通用的标题选择器
        title = $("h1").first().text().trim();
      }

      // 2. 处理问题页面
      if (url.includes("/question/")) {
        let questionId = "";
        let answerId = "";

        // 2.1 提取问题ID
        const questionMatch = url.match(/question\/(\d+)/);
        if (questionMatch && questionMatch[1]) {
          questionId = questionMatch[1];
        } else {
          throw new Error("无法解析问题ID，请联系开发者更新解析方案");
        }

        // 2.2 检查URL中是否已包含answer ID
        const answerMatch = url.match(/answer\/(\d+)/);
        if (answerMatch && answerMatch[1]) {
          // URL已经包含answer ID，直接获取回答内容
          answerId = answerMatch[1];

          // 直接查找回答内容
          const contentItem = $(".ContentItem.AnswerItem");

          if (contentItem.length > 0) {
            // 获取回答内容
            contentHtml =
              contentItem.find(".RichContent-inner").html() ||
              contentItem.find(".RichText.ztext").html() ||
              "";

            // 获取作者信息
            const authorInfo = contentItem.find(".AuthorInfo");
            if (authorInfo.length > 0) {
              author =
                authorInfo.find("meta[itemprop='name']").attr("content") || "";
              authorAvatar = authorInfo.find(".Avatar").attr("src") || "";
              authorBio = authorInfo
                .find(".AuthorInfo-badgeText")
                .text()
                .trim();

              // 提取作者URL - 先尝试从meta标签获取
              const metaUrl = authorInfo
                .find("meta[itemprop='url']")
                .attr("content");
              if (metaUrl) {
                authorUrl = metaUrl;
                console.log(`从meta标签获取到作者URL: ${authorUrl}`);
              }
              console.log(`从回答页面获取到作者信息: ${author}`);
            }
          }

          if (!contentHtml) {
            throw new Error("无法获取回答内容，请联系开发者更新解析方案");
          }
        } else {
          // URL中不包含answer ID，需要从问题页面中提取第一个回答的ID
          console.log("从问题页面查找第一个回答...");

          // 根据提供的DOM结构查找第一个List-Item
          const firstListItem = $(".List-item").first();

          if (firstListItem.length > 0) {
            console.log("找到第一个List-Item元素");

            // 从List-Item中查找answerItem的数据
            const answerItem = firstListItem.find(".ContentItem.AnswerItem");

            if (answerItem.length > 0) {
              // 从data-zop属性中提取itemId，这就是回答ID
              const dataZop = answerItem.attr("data-zop");
              if (dataZop) {
                try {
                  const zopData = JSON.parse(dataZop.replace(/&quot;/g, '"'));
                  if (zopData.itemId) {
                    answerId = zopData.itemId;
                    console.log(`成功提取回答ID: ${answerId}`);
                  }
                } catch (e) {
                  console.error("解析data-zop属性失败", e);
                }
              }

              // 备用方法：尝试从name属性获取
              if (!answerId) {
                answerId = answerItem.attr("name") || "";
                console.log(`从name属性获取回答ID: ${answerId}`);
              }

              // 如果找到了回答ID，构建新的URL并获取内容
              if (answerId && questionId) {
                const newUrl = `https://www.zhihu.com/question/${questionId}/answer/${answerId}`;
                console.log(`构建新URL: ${newUrl}，重新获取回答内容`);
                actualUrl = newUrl; // 更新实际URL为带有回答ID的URL

                // 递归调用自身获取具体回答
                return this.getArticleContent(newUrl, hideImages);
              } else {
                throw new Error("无法提取回答ID，请联系开发者更新解析方案");
              }
            } else {
              throw new Error("无法找到回答项目，请联系开发者更新解析方案");
            }
          } else {
            throw new Error("无法找到List-Item元素，请联系开发者更新解析方案");
          }
        }
      }
      // 3. 处理文章页面
      else if (url.includes("/p/")) {
        contentHtml =
          $(".Post-RichTextContainer").html() ||
          $(".PostIndex-content").html() ||
          $(".RichText.ztext").html() ||
          "";

        // 获取作者信息
        const authorInfo = $(".AuthorInfo").first();
        if (authorInfo.length > 0) {
          author =
            authorInfo.find(".meta[itemprop='name']").attr("content") || "";
          authorAvatar = authorInfo.find(".Avatar").attr("src") || "";
          authorBio = authorInfo.find(".AuthorInfo-badgeText").text().trim();

          // 提取作者URL
          const metaUrl = $("meta[itemprop='url']").attr("content");
          if (metaUrl) {
            authorUrl = metaUrl;
          } else {
            const userLinkHref = authorInfo.find(".UserLink-link").attr("href");
            if (userLinkHref) {
              authorUrl = userLinkHref.startsWith("http")
                ? userLinkHref
                : `https://www.zhihu.com${userLinkHref}`;
            }
          }
        }

        if (!contentHtml) {
          throw new Error("无法获取文章内容，请联系开发者更新解析方案");
        }
      }
      // 4. 处理专栏文章
      else if (url.includes("/column/") || url.includes("/zhuanlan/")) {
        contentHtml =
          $(".RichText.ztext").html() ||
          $(".Post-RichTextContainer").html() ||
          "";

        // 获取作者信息
        const authorInfo = $(".AuthorInfo").first();
        if (authorInfo.length > 0) {
          author =
            authorInfo.find(".meta[itemprop='name']").attr("content") || "";
          authorAvatar = authorInfo.find(".Avatar").attr("src") || "";
          authorBio = authorInfo.find(".AuthorInfo-badgeText").text().trim();

          // 提取作者URL
          const metaUrl = $("meta[itemprop='url']").attr("content");
          if (metaUrl) {
            authorUrl = metaUrl;
          } else {
            const userLinkHref = authorInfo.find(".UserLink-link").attr("href");
            if (userLinkHref) {
              authorUrl = userLinkHref.startsWith("http")
                ? userLinkHref
                : `https://www.zhihu.com${userLinkHref}`;
            }
          }
        }

        if (!contentHtml) {
          throw new Error("无法获取专栏文章内容，请联系开发者更新解析方案");
        }
      } else {
        throw new Error("不支持的URL类型，请联系开发者更新解析方案");
      }

      // 处理内容，如果启用无图片模式，删除所有图片标签
      if (hideImages && contentHtml) {
        const $content = cheerio.load(contentHtml);
        $content("img").remove();
        contentHtml = $content.html() || "";
      } else if (contentHtml) {
        // 如果不是无图片模式，确保使用正确的图片URL
        const $content = cheerio.load(contentHtml);
        $content("img").each((_, img) => {
          const $img = $content(img);
          // 优先使用data-actualsrc属性，这是知乎图片的真实URL
          const actualSrc = $img.attr("data-actualsrc");
          if (actualSrc) {
            $img.attr("src", actualSrc);
          } else if ($img.attr("data-original")) {
            // 备选：某些知乎图片使用data-original存储URL
            $img.attr("src", $img.attr("data-original"));
          }
        });
        contentHtml = $content.html() || "";
      }

      // 如果仍然没有内容，提供友好的错误信息
      if (!contentHtml) {
        console.error("未能解析文章内容，可能需要登录或页面结构已更改");
        throw new Error("未能解析文章内容，请联系开发者更新解析方案");
      }

      // 将HTML转为Markdown
      const content = this.htmlToMarkdown(contentHtml);

      console.log(
        `成功解析文章：${title}，作者：${author || "未知"}，头像: ${
          authorAvatar ? "已获取" : "未获取"
        }，简介: ${authorBio || "未获取"}，作者URL: ${authorUrl || "未获取"}`
      );
      return {
        title: title || "未知标题",
        content,
        author: author || "未知作者",
        authorAvatar,
        authorBio,
        authorUrl,
        actualUrl, // 添加actualUrl到返回对象
      };
    } catch (error) {
      console.error("获取文章内容失败:", error);
      throw new Error(
        `获取文章内容失败: ${
          error instanceof Error ? error.message : "请联系开发者更新解析方案"
        }`
      );
    }
  }

  /**
   * 获取问题下的更多回答ID
   * 从"Card MoreAnswers"区域提取下一个回答ID
   * @param questionUrl 问题URL
   * @returns 下一个回答的ID，如果没有更多回答则返回null
   */
  async getMoreAnswersId(questionUrl: string): Promise<string | null> {
    try {
      console.log(`尝试获取问题${questionUrl}的更多回答`);

      // 从URL中提取问题ID
      const questionIdMatch = questionUrl.match(/question\/(\d+)/);
      if (!questionIdMatch || !questionIdMatch[1]) {
        console.error("无法从URL中提取问题ID");
        return null;
      }

      const questionId = questionIdMatch[1];
      console.log(`从URL中提取到问题ID: ${questionId}`);

      // 使用Puppeteer模拟浏览器获取更多回答
      console.log("使用Puppeteer获取更多回答");
      return await this.getMoreAnswersIdWithPuppeteer(questionUrl);
    } catch (error) {
      console.error("获取更多回答失败:", error);
      throw new Error(
        `获取更多回答失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`
      );
    }
  }

  // 将HTML转为Markdown
  private htmlToMarkdown(html: string): string {
    // 使用marked库将HTML转为Markdown
    return marked.parse(html) as string;
  }

  /**
   * 使用Puppeteer获取更多回答ID
   * @param questionWithAnswerUrl 问题+回答URL
   * @returns 下一个回答的ID或null
   */
  private async getMoreAnswersIdWithPuppeteer(
    questionWithAnswerUrl: string
  ): Promise<string | null> {
    // 检查URL格式是否为问题+回答格式（只有在这种URL下才会出现更多回答区域）
    if (!questionWithAnswerUrl.match(/\/question\/\d+\/answer\/\d+/)) {
      console.log("URL格式不正确，必须是问题+回答格式才能显示更多回答区域");
      throw new Error("要获取更多回答，URL必须包含问题ID和回答ID");
    }

    let browser: puppeteer.Browser | null = null;
    console.log("启动Puppeteer浏览器...");

    // 以无头模式启动浏览器，添加更多参数避免被检测
    browser = await puppeteer.launch({
      headless: true, // 使用无头模式
      args: ["--no-sandbox"],
    });

    console.log("打开新页面...");
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
    );

    // 设置浏览器视窗大小
    await page.setViewport({ width: 1920, height: 1080 });

    // 如果有cookie，设置到页面
    const cookie = this.cookieManager.getCookie();
    if (cookie) {
      async function addCookies(
        cookies_str: string,
        page: puppeteer.Page,
        domain: string
      ) {
        let cookies = cookies_str.split(";").map((pair) => {
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
      await addCookies(cookie, page, "www.zhihu.com");
    }

    // 防反爬虫设置 - 避免被检测为自动化脚本
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined
        })
    });

    try {
      // 导航到问题页面
      console.log(`导航到问题页面: ${questionWithAnswerUrl}`);
      await page.goto(questionWithAnswerUrl, {
        waitUntil: "networkidle0", // 等待网络请求完成
        timeout: 0,
      });

      console.log("页面完全加载完成");

      // 等待页面内容加载
      await page.waitForSelector("body", { timeout: 2000 });

      // 提取更多回答区域中第一个回答的ID
      const answerId = await page.evaluate(() => {
        console.log("开始在页面中查找更多回答区域...");
        const moreAnswersCard = document.querySelector(".MoreAnswers");
        if (!moreAnswersCard) {
          console.log("未找到更多回答区域(MoreAnswers)");
          return null;
        }

        // 查找更多回答区域下的第一个回答项
        const answerItem = moreAnswersCard.querySelector(
          ".ContentItem.AnswerItem"
        );
        if (!answerItem) {
          console.log("更多回答区域中未找到回答项(AnswerItem)");
          return null;
        }

        // 尝试从data-zop属性提取
        if (answerItem.hasAttribute("data-zop")) {
          try {
            const dataZop = answerItem.getAttribute("data-zop");
            if (dataZop) {
              const zopData = JSON.parse(dataZop.replace(/&quot;/g, '"'));
              if (zopData && zopData.itemId) {
                console.log(`从data-zop找到回答ID: ${zopData.itemId}`);
                return zopData.itemId;
              }
            }
          } catch (e) {
            console.error("解析data-zop失败");
          }
        }

        // 从name属性提取
        if (answerItem.hasAttribute("name")) {
          const nameId = answerItem.getAttribute("name");
          console.log(`从name属性找到回答ID: ${nameId}`);
          return nameId;
        }

        // 从链接提取
        const link = answerItem.querySelector('a[href*="/answer/"]');
        if (link) {
          const href = link.getAttribute("href");
          if (href) {
            const match = href.match(/\/answer\/(\d+)/);
            if (match && match[1]) {
              console.log(`从链接找到回答ID: ${match[1]}`);
              return match[1];
            }
          }
        }

        return null;
      });

      console.log("关闭浏览器");
      await browser.close();

      if (answerId) {
        console.log(`提取到的回答ID: ${answerId}`);
        return answerId;
      } else {
        console.log("未能提取到更多回答ID，可能没有更多回答");
        return null;
      }
    } catch (error) {
      console.error("Puppeteer操作失败:", error);
      if (browser) {
        await browser.close();
      }
      throw new Error(
        `获取更多回答失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`
      );
    }
  }
}
