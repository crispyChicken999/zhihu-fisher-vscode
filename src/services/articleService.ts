import axios from "axios";
import * as cheerio from "cheerio";
import { marked } from "marked";
import { ZhihuArticle } from "./types";
import { CookieManager } from "./cookieManager";
import * as puppeteer from "puppeteer";

// 定义批量获取的回答内容结构
interface BatchAnswers {
  questionTitle: string;
  answers: ZhihuArticle[];
  hasMore: boolean;
  browser: puppeteer.Browser | null;
  page: puppeteer.Page | null;
  totalAnswers?: number; // 问题的总回答数
}

// 定义回调函数类型，用于实时更新爬取状态
interface ProgressCallback {
  (article: ZhihuArticle, count: number, total: number): void;
}

export class ArticleService {
  private cookieManager: CookieManager;
  private batchAnswersCache: Map<string, BatchAnswers> = new Map(); // 用于缓存已加载的回答
  private static browserInstance: puppeteer.Browser | null = null; // 浏览器单例

  constructor(cookieManager: CookieManager) {
    this.cookieManager = cookieManager;
  }

  // 获取或创建浏览器实例
  private async getBrowserInstance(): Promise<puppeteer.Browser> {
    if (!ArticleService.browserInstance) {
      console.log("创建新的浏览器实例...");
      ArticleService.browserInstance = await puppeteer.launch({
        headless: false, // 设置为false以便调试
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }
    return ArticleService.browserInstance;
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

      // 如果是问题链接，尝试从缓存中获取批量回答
      if (url.includes("/question/") && !url.includes("/answer/")) {
        // 提取问题ID
        const questionIdMatch = url.match(/question\/(\d+)/);
        if (questionIdMatch && questionIdMatch[1]) {
          const questionId = questionIdMatch[1];

          // 检查是否有缓存的回答
          if (this.batchAnswersCache.has(questionId)) {
            const cachedData = this.batchAnswersCache.get(questionId);
            if (cachedData && cachedData.answers.length > 0) {
              // 返回第一个回答
              return cachedData.answers[0];
            }
          }

          // 如果没有缓存，加载批量回答
          const batchAnswers = await this.getBatchAnswers(url, 10, hideImages);
          if (batchAnswers.answers.length > 0) {
            return batchAnswers.answers[0];
          }
        }
      }

      // 对于特定回答链接或其他类型的内容，使用原有方法获取
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
   * 创建延时Promise
   * @param ms 延时毫秒数
   * @returns Promise对象
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 模拟人类的滚动行为
   * @param page Puppeteer页面对象
   */
  private async simulateHumanScroll(page: puppeteer.Page): Promise<void> {
    const viewportHeight = await page.evaluate(() => window.innerHeight);

    // 先向下滚动到接近底部
    await page.evaluate((height) => {
      window.scrollBy(0, document.body.scrollHeight - height * 1.5);
    }, viewportHeight);

    // 等待一小段随机时间
    await this.delay(1000 + Math.random() * 500);

    // 稍微向上滚动一点
    await page.evaluate((height) => {
      window.scrollBy(0, -height * (0.1 + Math.random() * 0.3));
    }, viewportHeight);

    // 再次等待
    await this.delay(800 + Math.random() * 400);

    // 再次向下滚动到底部
    await page.evaluate(() => {
      window.scrollBy(0, document.body.scrollHeight);
    });

    // 最终等待加载
    await this.delay(1500 + Math.random() * 500);
  }

  /**
   * 批量获取问题的回答
   * @param questionUrl 问题URL
   * @param maxCount 最大获取回答数量，默认为10
   * @param hideImages 是否隐藏图片
   * @param progressCallback 进度回调函数，用于实时更新UI
   * @returns 包含问题标题和回答列表的对象
   */
  async getBatchAnswers(
    questionUrl: string,
    maxCount: number = 10,
    hideImages: boolean = false,
    progressCallback?: ProgressCallback
  ): Promise<BatchAnswers> {
    try {
      console.log(`尝试获取问题${questionUrl}的多个回答，最多${maxCount}个`);

      // 检查URL格式是否正确
      if (!questionUrl.includes("/question/")) {
        throw new Error("URL必须是知乎问题页面");
      }

      // 提取问题ID
      const questionIdMatch = questionUrl.match(/question\/(\d+)/);
      if (!questionIdMatch || !questionIdMatch[1]) {
        throw new Error("无法从URL中提取问题ID");
      }
      const questionId = questionIdMatch[1];

      // 检查缓存中是否已存在该问题的回答
      if (this.batchAnswersCache.has(questionId)) {
        const cachedData = this.batchAnswersCache.get(questionId)!;

        // 如果有回调函数并且有已加载的回答，通知UI第一个回答可以显示
        if (progressCallback && cachedData.answers.length > 0) {
          progressCallback(
            cachedData.answers[0],
            1,
            cachedData.totalAnswers || cachedData.answers.length
          );
        }

        return cachedData;
      }

      // 直接访问问题页面URL（不带回答ID）
      const cleanQuestionUrl = `https://www.zhihu.com/question/${questionId}`;

      // 使用Puppeteer获取页面内容
      let browser: puppeteer.Browser | null = null;
      let page: puppeteer.Page | null = null;

      console.log("获取浏览器实例...");
      browser = await this.getBrowserInstance();

      console.log("打开新页面...");
      page = await browser.newPage();

      // 设置浏览器视窗大小
      await page.setViewport({ width: 1920, height: 1080 });

      // 设置User-Agent
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36"
      );

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

      // 防反爬虫设置
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, "webdriver", {
          get: () => undefined,
        });
      });

      console.log(`导航到问题页面: ${cleanQuestionUrl}`);
      await page.goto(cleanQuestionUrl, {
        waitUntil: "networkidle0",
        timeout: 60000,
      });

      console.log("页面加载完成，开始提取问题标题和回答");

      // 提取问题标题和总回答数
      const { questionTitle, totalAnswers } = await page.evaluate(() => {
        const titleElement = document.querySelector("h1.QuestionHeader-title");

        // 获取总回答数
        let total = 0;
        const listHeaderText = document.querySelector(".List-headerText span");
        if (listHeaderText) {
          const match = listHeaderText.textContent?.match(/(\d+)/);
          if (match && match[1]) {
            total = parseInt(match[1], 10);
          }
        }

        return {
          questionTitle: titleElement
            ? titleElement.textContent?.trim()
            : "未知问题",
          totalAnswers: total,
        };
      });

      console.log(`问题标题: ${questionTitle}, 总回答数: ${totalAnswers}`);

      // 首先尝试点击"收起全部回答"按钮
      await page.evaluate(() => {
        const collapseButton = document.querySelector("#collapsed-button");
        if (collapseButton) {
          (collapseButton as HTMLElement).click();
          console.log("已点击收起回答按钮");
        }
      });

      // 使用自定义延迟函数等待UI更新
      await this.delay(1000);

      // 初始化结果对象
      const result: BatchAnswers = {
        questionTitle: questionTitle || "未知问题",
        answers: [],
        hasMore: false,
        browser,
        page,
        totalAnswers: totalAnswers || undefined,
      };

      // 滚动页面加载更多回答，直到达到所需数量或没有更多回答
      let answersCount = 0;
      let lastAnswersCount = 0;
      let noNewAnswersCounter = 0;

      // 是否发送了第一个回答
      let firstAnswerSent = false;

      while (answersCount < maxCount && noNewAnswersCounter < 3) {
        // 提取当前页面上的所有回答
        const newAnswers = await page.evaluate((hideImgs) => {
          const answers: any[] = [];
          const answerElements = document.querySelectorAll(".AnswerItem");

          answerElements.forEach((element) => {
            try {
              // 提取回答ID
              let answerId = "";
              const dataZop = element.getAttribute("data-zop");
              if (dataZop) {
                try {
                  const zopData = JSON.parse(dataZop.replace(/&quot;/g, '"'));
                  if (zopData.itemId) {
                    answerId = zopData.itemId;
                  }
                } catch (e) {
                  console.error("解析data-zop属性失败", e);
                }
              }

              if (!answerId) {
                answerId = element.getAttribute("name") || "";
              }

              // 提取作者信息
              const authorInfo = element.querySelector(".AuthorInfo");
              let author = "未知作者";
              let authorAvatar = "";
              let authorBio = "";
              let authorUrl = "";

              if (authorInfo) {
                const nameElement = authorInfo.querySelector(
                  "meta[itemprop='name']"
                );
                if (nameElement) {
                  author = nameElement.getAttribute("content") || "未知作者";
                }

                const avatarElement = authorInfo.querySelector(".Avatar");
                if (avatarElement) {
                  authorAvatar = avatarElement.getAttribute("src") || "";
                }

                const bioElement = authorInfo.querySelector(
                  ".AuthorInfo-badgeText"
                );
                if (bioElement) {
                  authorBio = bioElement.textContent?.trim() || "";
                }

                const urlElement = authorInfo.querySelector(
                  "meta[itemprop='url']"
                );
                if (urlElement) {
                  authorUrl = urlElement.getAttribute("content") || "";
                } else {
                  const linkElement =
                    authorInfo.querySelector(".UserLink-link");
                  if (linkElement) {
                    const href = linkElement.getAttribute("href");
                    if (href) {
                      authorUrl = href.startsWith("http")
                        ? href
                        : `https://www.zhihu.com${href}`;
                    }
                  }
                }
              }

              // 提取回答内容
              let contentElement =
                element.querySelector(".RichContent-inner") ||
                element.querySelector(".RichText.ztext");
              let contentHtml = "";

              if (contentElement) {
                // 深拷贝节点以避免修改原始DOM
                const clonedContent = contentElement.cloneNode(true) as Element;

                // 如果需要隐藏图片
                if (hideImgs) {
                  const images = clonedContent.querySelectorAll("img");
                  images.forEach((img) => img.parentNode?.removeChild(img));
                } else {
                  // 处理图片链接，确保使用真实URL
                  const images = clonedContent.querySelectorAll("img");
                  images.forEach((img) => {
                    const actualSrc = img.getAttribute("data-actualsrc");
                    if (actualSrc) {
                      img.setAttribute("src", actualSrc);
                    } else {
                      const originalSrc = img.getAttribute("data-original");
                      if (originalSrc) {
                        img.setAttribute("src", originalSrc);
                      }
                    }
                  });
                }

                contentHtml = clonedContent.innerHTML;
              }

              if (answerId && contentHtml) {
                answers.push({
                  answerId,
                  author,
                  authorAvatar,
                  authorBio,
                  authorUrl,
                  contentHtml,
                });
              }
            } catch (e) {
              console.error("处理回答元素时出错", e);
            }
          });

          return answers;
        }, hideImages);

        // 将新提取的回答转换为ZhihuArticle格式并添加到结果中
        for (const answer of newAnswers) {
          // 检查是否已经存在该回答
          const exists = result.answers.some((a) =>
            a.actualUrl?.includes(`/answer/${answer.answerId}`)
          );

          if (!exists && result.answers.length < maxCount) {
            const content = this.htmlToMarkdown(answer.contentHtml);
            const actualUrl = `https://www.zhihu.com/question/${questionId}/answer/${answer.answerId}`;

            const newArticle: ZhihuArticle = {
              title: result.questionTitle,
              content,
              author: answer.author,
              authorAvatar: answer.authorAvatar,
              authorBio: answer.authorBio,
              authorUrl: answer.authorUrl,
              actualUrl,
            };

            result.answers.push(newArticle);

            // 如果这是第一个回答且有回调函数，立即通知UI可以显示第一个回答
            if (
              !firstAnswerSent &&
              progressCallback &&
              result.answers.length === 1
            ) {
              progressCallback(newArticle, 1, totalAnswers || maxCount);
              firstAnswerSent = true;
            }
          }
        }

        // 检查是否有新回答被添加
        if (result.answers.length > lastAnswersCount) {
          // 如果有回调函数，通知UI更新当前爬取进度
          if (progressCallback) {
            progressCallback(
              result.answers[0], // 始终传递第一个回答（因为可能已经显示了）
              result.answers.length,
              totalAnswers || maxCount
            );
          }

          lastAnswersCount = result.answers.length;
          noNewAnswersCounter = 0;
          console.log(`已加载 ${result.answers.length} 个回答`);
        } else {
          noNewAnswersCounter++;
          console.log(`未找到新回答，尝试再次滚动 (${noNewAnswersCounter}/3)`);
        }

        // 如果已经达到目标数量，跳出循环
        if (result.answers.length >= maxCount) {
          break;
        }

        // 使用模拟人类滚动行为代替简单的滚动
        await this.simulateHumanScroll(page);

        // 检查是否还有"加载更多"按钮
        const hasLoadMoreButton = await page.evaluate(() => {
          const loadMoreButton = document.querySelector(".QuestionMainAction");
          if (
            loadMoreButton &&
            loadMoreButton.textContent?.includes("更多回答")
          ) {
            // 如果找到"更多回答"按钮，点击它
            (loadMoreButton as HTMLElement).click();
            return true;
          }
          return false;
        });

        if (hasLoadMoreButton) {
          // 使用自定义延迟函数等待新内容加载
          await this.delay(2000);
        }

        answersCount = result.answers.length;
      }

      // 更新是否有更多回答的标志
      result.hasMore = await page.evaluate(() => {
        return (
          document.querySelector(".QuestionMainAction") !== null ||
          document.querySelector(".List-loadMore") !== null
        );
      });

      console.log(
        `已成功获取 ${result.answers.length} 个回答，${
          result.hasMore ? "还有更多回答可加载" : "没有更多回答了"
        }`
      );

      // 将结果存入缓存
      this.batchAnswersCache.set(questionId, result);

      return result;
    } catch (error) {
      console.error("批量获取回答失败:", error);
      // 如果出错，不要关闭浏览器，只关闭当前页面
      try {
        // 尝试获取已有缓存
        const cachedData = this.batchAnswersCache.get(
          questionUrl.match(/question\/(\d+)/)?.[1] || ""
        );
        if (cachedData && cachedData.page) {
          await cachedData.page.close();
          cachedData.page = null;
        }
      } catch (e) {
        console.error("关闭页面失败:", e);
      }

      throw new Error(
        `批量获取回答失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`
      );
    }
  }

  /**
   * 获取更多批量回答
   * @param questionId 问题ID
   * @param maxCount 最大获取回答数量，默认为10
   * @param hideImages 是否隐藏图片
   * @returns 新加载的回答列表
   */
  async loadMoreBatchAnswers(
    questionId: string,
    maxCount: number = 10,
    hideImages: boolean = false
  ): Promise<ZhihuArticle[]> {
    try {
      // 检查缓存中是否存在该问题的回答
      if (!this.batchAnswersCache.has(questionId)) {
        throw new Error("未找到缓存的问题回答");
      }

      const cachedData = this.batchAnswersCache.get(questionId)!;

      // 如果已经没有更多回答，直接返回空数组
      if (!cachedData.hasMore) {
        console.log("没有更多回答可加载");
        return [];
      }

      // 如果浏览器实例已经关闭，创建新的实例
      if (!cachedData.browser || !cachedData.page) {
        console.log("页面已关闭，创建新页面...");

        // 获取浏览器实例
        cachedData.browser = await this.getBrowserInstance();

        // 创建新页面
        cachedData.page = await cachedData.browser.newPage();

        // 重新设置页面并导航到问题
        await cachedData.page.setViewport({ width: 1920, height: 1080 });
        await cachedData.page.setUserAgent(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36"
        );

        // 设置cookie
        const cookie = this.cookieManager.getCookie();
        if (cookie) {
          const cookies = cookie.split(";").map((pair) => {
            let name = pair.trim().slice(0, pair.trim().indexOf("="));
            let value = pair.trim().slice(pair.trim().indexOf("=") + 1);
            return { name, value, domain: "www.zhihu.com" };
          });
          await Promise.all(cookies.map((c) => cachedData.page!.setCookie(c)));
        }

        // 防反爬虫设置
        await cachedData.page.evaluateOnNewDocument(() => {
          Object.defineProperty(navigator, "webdriver", {
            get: () => undefined,
          });
        });

        // 导航到问题页面
        await cachedData.page.goto(
          `https://www.zhihu.com/question/${questionId}`,
          { waitUntil: "networkidle0", timeout: 60000 }
        );
      }

      // 使用现有浏览器实例继续加载
      const originalAnswersCount = cachedData.answers.length;
      let newAnswersCount = 0;
      let noNewAnswersCounter = 0;

      while (newAnswersCount < maxCount && noNewAnswersCounter < 3) {
        // 使用模拟人类滚动行为
        await this.simulateHumanScroll(cachedData.page);

        // 检查是否还有"加载更多"按钮
        const hasLoadMoreButton = await cachedData.page.evaluate(() => {
          const loadMoreButton = document.querySelector(".QuestionMainAction");
          if (
            loadMoreButton &&
            loadMoreButton.textContent?.includes("更多回答")
          ) {
            // 如果找到"更多回答"按钮，点击它
            (loadMoreButton as HTMLElement).click();
            return true;
          }
          return false;
        });

        if (hasLoadMoreButton) {
          // 等待新内容加载
          await this.delay(2000);
        }

        // 提取新回答
        const newAnswers = await cachedData.page.evaluate((hideImgs) => {
          const answers: any[] = [];
          const answerElements = document.querySelectorAll(".AnswerItem");

          answerElements.forEach((element) => {
            try {
              // 提取回答ID
              let answerId = "";
              const dataZop = element.getAttribute("data-zop");
              if (dataZop) {
                try {
                  const zopData = JSON.parse(dataZop.replace(/&quot;/g, '"'));
                  if (zopData.itemId) {
                    answerId = zopData.itemId;
                  }
                } catch (e) {
                  console.error("解析data-zop属性失败", e);
                }
              }

              if (!answerId) {
                answerId = element.getAttribute("name") || "";
              }

              // 提取作者信息
              const authorInfo = element.querySelector(".AuthorInfo");
              let author = "未知作者";
              let authorAvatar = "";
              let authorBio = "";
              let authorUrl = "";

              if (authorInfo) {
                const nameElement = authorInfo.querySelector(
                  "meta[itemprop='name']"
                );
                if (nameElement) {
                  author = nameElement.getAttribute("content") || "未知作者";
                }

                const avatarElement = authorInfo.querySelector(".Avatar");
                if (avatarElement) {
                  authorAvatar = avatarElement.getAttribute("src") || "";
                }

                const bioElement = authorInfo.querySelector(
                  ".AuthorInfo-badgeText"
                );
                if (bioElement) {
                  authorBio = bioElement.textContent?.trim() || "";
                }

                const urlElement = authorInfo.querySelector(
                  "meta[itemprop='url']"
                );
                if (urlElement) {
                  authorUrl = urlElement.getAttribute("content") || "";
                } else {
                  const linkElement =
                    authorInfo.querySelector(".UserLink-link");
                  if (linkElement) {
                    const href = linkElement.getAttribute("href");
                    if (href) {
                      authorUrl = href.startsWith("http")
                        ? href
                        : `https://www.zhihu.com${href}`;
                    }
                  }
                }
              }

              // 提取回答内容
              let contentElement =
                element.querySelector(".RichContent-inner") ||
                element.querySelector(".RichText.ztext");
              let contentHtml = "";

              if (contentElement) {
                // 深拷贝节点以避免修改原始DOM
                const clonedContent = contentElement.cloneNode(true) as Element;

                // 如果需要隐藏图片
                if (hideImgs) {
                  const images = clonedContent.querySelectorAll("img");
                  images.forEach((img) => img.parentNode?.removeChild(img));
                } else {
                  // 处理图片链接，确保使用真实URL
                  const images = clonedContent.querySelectorAll("img");
                  images.forEach((img) => {
                    const actualSrc = img.getAttribute("data-actualsrc");
                    if (actualSrc) {
                      img.setAttribute("src", actualSrc);
                    } else {
                      const originalSrc = img.getAttribute("data-original");
                      if (originalSrc) {
                        img.setAttribute("src", originalSrc);
                      }
                    }
                  });
                }

                contentHtml = clonedContent.innerHTML;
              }

              if (answerId && contentHtml) {
                answers.push({
                  answerId,
                  author,
                  authorAvatar,
                  authorBio,
                  authorUrl,
                  contentHtml,
                });
              }
            } catch (e) {
              console.error("处理回答元素时出错", e);
            }
          });

          return answers;
        }, hideImages);

        // 将新提取的回答转换为ZhihuArticle格式
        const existingAnswerIds = new Set(
          cachedData.answers.map(
            (a) => a.actualUrl?.match(/answer\/(\d+)/)?.[1]
          )
        );

        const newArticles: ZhihuArticle[] = [];

        for (const answer of newAnswers) {
          // 检查是否已经存在该回答
          if (
            !existingAnswerIds.has(answer.answerId) &&
            newArticles.length < maxCount
          ) {
            const content = this.htmlToMarkdown(answer.contentHtml);
            const actualUrl = `https://www.zhihu.com/question/${questionId}/answer/${answer.answerId}`;

            const newArticle: ZhihuArticle = {
              title: cachedData.questionTitle,
              content,
              author: answer.author,
              authorAvatar: answer.authorAvatar,
              authorBio: answer.authorBio,
              authorUrl: answer.authorUrl,
              actualUrl,
            };

            // 添加到新回答列表和缓存
            newArticles.push(newArticle);
            cachedData.answers.push(newArticle);
            existingAnswerIds.add(answer.answerId);
          }
        }

        // 检查是否有新回答被添加
        if (newArticles.length > newAnswersCount) {
          newAnswersCount = newArticles.length;
          noNewAnswersCounter = 0;
          console.log(`已加载 ${newArticles.length} 个新回答`);
        } else {
          noNewAnswersCounter++;
          console.log(`未找到新回答，尝试再次滚动 (${noNewAnswersCounter}/3)`);
        }

        // 如果已经达到目标数量，跳出循环
        if (newArticles.length >= maxCount) {
          break;
        }
      }

      // 更新是否有更多回答的标志
      cachedData.hasMore = await cachedData.page.evaluate(() => {
        return (
          document.querySelector(".QuestionMainAction") !== null ||
          document.querySelector(".List-loadMore") !== null
        );
      });

      console.log(
        `共获取了 ${
          cachedData.answers.length - originalAnswersCount
        } 个新回答，${
          cachedData.hasMore ? "还有更多回答可加载" : "没有更多回答了"
        }`
      );

      // 返回新加载的回答
      return cachedData.answers.slice(originalAnswersCount);
    } catch (error) {
      console.error("加载更多批量回答失败:", error);
      throw new Error(
        `加载更多批量回答失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`
      );
    }
  }

  /**
   * 关闭问题的浏览器页面
   * @param questionId 问题ID
   */
  async closeBrowser(questionId: string): Promise<void> {
    try {
      const cachedData = this.batchAnswersCache.get(questionId);
      if (cachedData && cachedData.page) {
        console.log(`关闭问题 ${questionId} 的页面`);
        await cachedData.page.close();

        // 更新缓存状态
        cachedData.page = null;
        this.batchAnswersCache.set(questionId, cachedData);
      }
    } catch (error) {
      console.error("关闭页面失败:", error);
    }
  }

  /**
   * 完全关闭浏览器实例（应用退出时调用）
   */
  static async closeBrowserInstance(): Promise<void> {
    if (ArticleService.browserInstance) {
      try {
        await ArticleService.browserInstance.close();
        ArticleService.browserInstance = null;
        console.log("已关闭浏览器实例");
      } catch (error) {
        console.error("关闭浏览器实例失败:", error);
      }
    }
  }

  // 将HTML转为Markdown
  private htmlToMarkdown(html: string): string {
    // 使用marked库将HTML转为Markdown
    return marked.parse(html) as string;
  }

  /**
   * 获取问题下的更多回答ID - 已废弃，保留用于兼容性
   * @deprecated 请使用getBatchAnswers方法代替
   */
  async getMoreAnswersId(questionUrl: string): Promise<string | null> {
    console.log(`getMoreAnswersId方法已废弃，请使用getBatchAnswers方法代替`);

    try {
      // 从URL中提取问题ID
      const questionIdMatch = questionUrl.match(/question\/(\d+)/);
      if (!questionIdMatch || !questionIdMatch[1]) {
        console.error("无法从URL中提取问题ID");
        return null;
      }

      const questionId = questionIdMatch[1];
      console.log(`从URL中提取到问题ID: ${questionId}`);

      // 检查是否已有缓存
      if (this.batchAnswersCache.has(questionId)) {
        const cachedData = this.batchAnswersCache.get(questionId)!;

        // 提取当前回答ID
        const currentAnswerIdMatch = questionUrl.match(/answer\/(\d+)/);
        if (!currentAnswerIdMatch || !currentAnswerIdMatch[1]) {
          return null;
        }

        const currentAnswerId = currentAnswerIdMatch[1];
        const currentIndex = cachedData.answers.findIndex((a) =>
          a.actualUrl?.includes(`/answer/${currentAnswerId}`)
        );

        // 如果找到当前回答，返回下一个回答的ID
        if (
          currentIndex !== -1 &&
          currentIndex < cachedData.answers.length - 1
        ) {
          const nextAnswer = cachedData.answers[currentIndex + 1];
          const nextAnswerId =
            nextAnswer.actualUrl?.match(/answer\/(\d+)/)?.[1];
          return nextAnswerId || null;
        }

        // 如果当前是最后一个回答，但有更多回答可加载
        if (
          currentIndex === cachedData.answers.length - 1 &&
          cachedData.hasMore
        ) {
          // 加载更多回答
          const newAnswers = await this.loadMoreBatchAnswers(
            questionId,
            10,
            false
          );

          if (newAnswers.length > 0) {
            const nextAnswer = newAnswers[0];
            const nextAnswerId =
              nextAnswer.actualUrl?.match(/answer\/(\d+)/)?.[1];
            return nextAnswerId || null;
          }
        }
      } else {
        // 如果没有缓存，使用批量获取方法
        const batchAnswers = await this.getBatchAnswers(
          `https://www.zhihu.com/question/${questionId}`,
          10,
          false
        );

        // 提取当前回答ID
        const currentAnswerIdMatch = questionUrl.match(/answer\/(\d+)/);
        if (!currentAnswerIdMatch || !currentAnswerIdMatch[1]) {
          // 如果URL没有回答ID，返回第一个回答的ID
          if (batchAnswers.answers.length > 0) {
            const firstAnswer = batchAnswers.answers[0];
            const firstAnswerId =
              firstAnswer.actualUrl?.match(/answer\/(\d+)/)?.[1];
            return firstAnswerId || null;
          }
        } else {
          const currentAnswerId = currentAnswerIdMatch[1];
          const currentIndex = batchAnswers.answers.findIndex((a) =>
            a.actualUrl?.includes(`/answer/${currentAnswerId}`)
          );

          // 如果找到当前回答，返回下一个回答的ID
          if (
            currentIndex !== -1 &&
            currentIndex < batchAnswers.answers.length - 1
          ) {
            const nextAnswer = batchAnswers.answers[currentIndex + 1];
            const nextAnswerId =
              nextAnswer.actualUrl?.match(/answer\/(\d+)/)?.[1];
            return nextAnswerId || null;
          }
        }
      }

      return null;
    } catch (error) {
      console.error("获取更多回答失败:", error);
      throw new Error(
        `获取更多回答失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`
      );
    }
  }
}
