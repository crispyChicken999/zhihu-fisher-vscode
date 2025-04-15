import axios from "axios";
import * as cheerio from "cheerio";
import { marked } from "marked";
import * as vscode from "vscode";

// 知乎热榜项目接口
export interface ZhihuHotItem {
  id: string;
  title: string;
  url: string;
  excerpt?: string;
  hotValue?: string;
  imgUrl?: string;
}

// 知乎文章接口
export interface ZhihuArticle {
  title: string;
  content: string;
  author?: string;
}

// Cookie相关信息
interface CookieInfo {
  cookie: string;
  lastUpdated?: number; // 时间戳，记录上次更新时间
}

// 知乎API服务类
export class ZhihuService {
  private cookieInfo: CookieInfo = { cookie: "" };

  constructor() {
    // 初始化时读取已有的cookie
    this.loadCookie();
  }

  // 加载已保存的cookie
  private loadCookie(): void {
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const cookie = config.get<string>("cookie") || "";

    // 如果有cookie，检查是否需要提醒更新
    if (cookie) {
      try {
        // cookie可能以JSON字符串形式存储，包含上次更新时间
        const cookieInfo = JSON.parse(cookie) as CookieInfo;
        this.cookieInfo = cookieInfo;

        // 检查cookie是否过期
        this.checkCookieExpiration();
      } catch {
        // 如果解析失败，说明cookie是直接存储的字符串
        this.cookieInfo = {
          cookie: cookie,
          lastUpdated: Date.now(),
        };

        // 更新格式
        this.saveCookieInfo();
      }
    }
  }

  // 检查cookie是否需要更新
  private checkCookieExpiration(): void {
    if (!this.cookieInfo.lastUpdated) {
      return;
    }

    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const expirationDays = config.get<number>("cookieExpirationReminder") || 30;

    const now = Date.now();
    const daysPassed =
      (now - this.cookieInfo.lastUpdated) / (1000 * 60 * 60 * 24);

    if (daysPassed >= expirationDays) {
      vscode.window
        .showWarningMessage(
          `您的知乎Cookie已设置${Math.floor(daysPassed)}天，可能需要更新`,
          "更新Cookie",
          "忽略"
        )
        .then((selection) => {
          if (selection === "更新Cookie") {
            vscode.commands.executeCommand("zhihu-fisher.setCookie");
          }
        });
    }
  }

  // 保存cookie信息
  private saveCookieInfo(): void {
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    config.update(
      "cookie",
      JSON.stringify(this.cookieInfo),
      vscode.ConfigurationTarget.Global
    );
  }

  // 设置cookie
  async setCookie(): Promise<boolean> {
    const result = await vscode.window.showInputBox({
      prompt: "请输入知乎Cookie，可以从浏览器中复制",
      placeHolder: "复制浏览器中的完整Cookie值",
      password: true, // 将输入框显示为密码框以保护隐私
    });

    if (result) {
      this.cookieInfo = {
        cookie: result,
        lastUpdated: Date.now(),
      };
      this.saveCookieInfo();
      vscode.window.showInformationMessage("知乎Cookie设置成功");
      return true;
    }
    return false;
  }

  // 清除cookie
  clearCookie(): void {
    this.cookieInfo = { cookie: "" };
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    config.update("cookie", "", vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage("知乎Cookie已清除");
  }

  // 获取知乎热榜
  async getHotList(): Promise<ZhihuHotItem[]> {
    try {
      console.log("开始获取知乎热榜...");

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
      if (this.cookieInfo.cookie) {
        headers["Cookie"] = this.cookieInfo.cookie;
        console.log("使用已保存的Cookie进行请求");
      } else {
        console.log("未设置Cookie，使用匿名模式访问");
        // 使用基本的匿名cookie
        headers["Cookie"] = "_xsrf=anonymous; d_c0=anonymous; _zap=anonymous";
      }

      const response = await axios.get("https://www.zhihu.com/hot", {
        headers,
        timeout: 15000, // 增加超时时间到15秒
        maxRedirects: 5, // 允许重定向
      });

      console.log("成功获取知乎热榜HTML，开始解析...");
      console.log("HTTP状态码:", response.status);
      console.log("响应头:", JSON.stringify(response.headers));

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

        if (this.cookieInfo.cookie) {
          // 如果已经有cookie但仍然被拦截，可能是cookie过期
          console.log("Cookie可能已失效，需要更新");
          this.promptForNewCookie("您的知乎Cookie可能已过期，请更新");
          throw new Error("知乎Cookie已失效，请更新");
        } else {
          // 如果没有cookie且被拦截
          console.log("需要设置Cookie才能访问");
          this.promptForNewCookie("需要知乎Cookie才能获取热榜，请设置");
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
        if (!this.cookieInfo.cookie) {
          this.promptForNewCookie("需要知乎Cookie才能获取热榜，请设置");
        } else {
          this.promptForNewCookie("无法解析知乎热榜，您的Cookie可能已失效");
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
    }
  }

  // 提示用户更新Cookie
  private promptForNewCookie(message: string): void {
    vscode.window
      .showWarningMessage(message, "设置Cookie", "忽略")
      .then((selection) => {
        if (selection === "设置Cookie") {
          vscode.commands.executeCommand("zhihu-fisher.setCookie");
        }
      });
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
      if (this.cookieInfo.cookie) {
        headers["Cookie"] = this.cookieInfo.cookie;
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
        if (!this.cookieInfo.cookie) {
          this.promptForNewCookie("需要知乎Cookie才能查看文章内容");
          throw new Error("需要设置知乎Cookie才能查看文章内容");
        } else {
          // 如果已有cookie但仍被拦截
          this.promptForNewCookie("您的知乎Cookie可能已过期，请更新");
          throw new Error("知乎Cookie已失效，请更新");
        }
      }

      console.log("成功获取HTML，开始解析文章内容");

      let title = "";
      let author = "";
      let contentHtml = "";

      // 1. 尝试获取标题
      // 问题标题
      title = $("h1.QuestionHeader-title").text().trim();
      if (!title) {
        // 文章标题
        title = $("h1.Post-Title").text().trim();
      }
      if (!title) {
        // 更通用的标题选择器
        title = $("h1").first().text().trim();
      }

      // 2. 尝试获取作者
      author = $(".AuthorInfo-name").first().text().trim();
      if (!author) {
        author = $(".author-info-head").text().trim();
      }

      // 3. 尝试获取内容
      // 根据URL类型和页面结构选择不同的内容选择器

      // 问题回答
      if (url.includes("question")) {
        // 如果是问题页面

        // 先尝试找最佳回答
        const contentItem = $(".ContentItem.AnswerItem");

        if (contentItem.length > 0) {
          // 优先获取第一个回答（推荐回答）
          contentHtml =
            $(contentItem[0]).find(".RichContent-inner").html() || "";

          // 如果没有找到内容，尝试其他选择器
          if (!contentHtml) {
            contentHtml = $(contentItem[0]).find(".RichText").html() || "";
          }

          // 获取这个特定回答的作者信息
          const answerAuthor = $(contentItem[0])
            .find(".AuthorInfo-name")
            .text()
            .trim();
          if (answerAuthor) {
            author = answerAuthor;
          }
        } else {
          // 备用：直接查找回答内容区域
          contentHtml = $(".RichContent-inner").first().html() || "";
        }
      }
      // 文章
      else if (url.includes("p/")) {
        contentHtml =
          $(".Post-RichTextContainer").html() ||
          $(".PostIndex-content").html() ||
          $(".RichText.ztext").html() ||
          "";
      }
      // 专栏文章
      else if (url.includes("column") || url.includes("zhuanlan")) {
        contentHtml =
          $(".RichText.ztext").html() ||
          $(".Post-RichTextContainer").html() ||
          "";
      }

      // 兜底方案：如果上述方法都没找到内容，尝试更通用的选择器
      if (!contentHtml) {
        contentHtml =
          $(".RichContent-inner").html() ||
          $(".RichText.ztext").html() ||
          $(".ContentItem-content").html() ||
          "";
      }

      // 访问知乎文章有时会被跳转（特别是专栏文章）
      if (!contentHtml && response.request.res.responseUrl !== url) {
        console.log(`检测到URL重定向: ${response.request.res.responseUrl}`);
        // 如果重定向了，尝试解析重定向后的页面
        const redirectUrl = response.request.res.responseUrl;
        const redirectResponse = await axios.get(redirectUrl, { headers });
        const $redirect = cheerio.load(redirectResponse.data);

        // 尝试从重定向页面获取内容
        contentHtml =
          $redirect(".RichText.ztext").html() ||
          $redirect(".RichContent-inner").html() ||
          $redirect(".Post-RichTextContainer").html() ||
          "";

        // 更新标题和作者（如果重定向页面有）
        const redirectTitle = $redirect("h1").first().text().trim();
        if (redirectTitle) {
          title = redirectTitle;
        }

        const redirectAuthor = $redirect(".AuthorInfo-name")
          .first()
          .text()
          .trim();
        if (redirectAuthor) {
          author = redirectAuthor;
        }
      }

      // 处理内容，如果启用无图片模式，删除所有图片标签
      if (hideImages && contentHtml) {
        const $content = cheerio.load(contentHtml);
        $content("img").remove();
        contentHtml = $content.html() || "";
      }

      // 如果仍然没有内容，提供友好的错误信息
      if (!contentHtml) {
        console.error("未能解析文章内容，可能需要登录或页面结构已更改");
        throw new Error("未能解析文章内容，可能需要登录或页面结构已更改");
      }

      // 将HTML转为Markdown
      const content = this.htmlToMarkdown(contentHtml);

      console.log(`成功解析文章：${title}，作者：${author || "未知"}`);
      return {
        title: title || "未知标题",
        content,
        author: author || "未知作者",
      };
    } catch (error) {
      console.error("获取文章内容失败:", error);
      throw new Error(
        `获取文章内容失败: ${
          error instanceof Error ? error.message : String(error)
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
