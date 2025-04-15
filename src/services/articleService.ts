import axios from "axios";
import * as cheerio from "cheerio";
import { marked } from "marked";
import { ZhihuArticle } from "./types";
import { CookieManager } from "./cookieManager";

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
          this.cookieManager.promptForNewCookie("需要知乎Cookie才能查看文章内容");
          throw new Error("需要设置知乎Cookie才能查看文章内容");
        } else {
          // 如果已有cookie但仍被拦截
          this.cookieManager.promptForNewCookie("您的知乎Cookie可能已过期，请更新");
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
              const metaUrl = authorInfo.find("meta[itemprop='url']").attr("content");
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

  // 将HTML转为Markdown
  private htmlToMarkdown(html: string): string {
    // 使用marked库将HTML转为Markdown
    return marked.parse(html) as string;
  }
}