import axios from "axios";
import * as cheerio from "cheerio";
import { ZhihuArticle, ZhihuAuthor } from "./types";
import { CookieManager } from "./cookieManager";
import { PuppeteerManager } from "./puppeteerManager";
import { ContentParser } from "./contentParser";
import { ArticleCache, BatchAnswers } from "./articleCache";
import { AnswerLoader, ProgressCallback } from "./answerLoader";

export class ArticleService {
  private cookieManager: CookieManager;
  private articleCache: ArticleCache;
  private answerLoader: AnswerLoader;
  // 记录是否正在加载更多回答
  private isLoadingMore: boolean = false;
  // 记录当前正在查看的回答索引
  private currentViewingIndex: number = 0;
  // 记录总共需要加载的回答数量
  private maxAnswersToLoad: number = Infinity;

  constructor(cookieManager: CookieManager) {
    this.cookieManager = cookieManager;
    this.articleCache = new ArticleCache();
    this.answerLoader = new AnswerLoader(cookieManager);
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

      // 如果是问题链接，直接使用批量获取回答的方法
      if (url.includes("/question/") && !url.includes("/answer/")) {
        // 提取问题ID
        const questionIdMatch = url.match(/question\/(\d+)/);
        if (questionIdMatch && questionIdMatch[1]) {
          const questionId = questionIdMatch[1];

          // 检查是否有缓存的回答
          if (this.articleCache.hasQuestionCache(questionId)) {
            const cachedData = this.articleCache.getQuestionCache(questionId);
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

      // 如果是特定回答链接，检查是否在缓存中
      if (url.includes("/question/") && url.includes("/answer/")) {
        const questionIdMatch = url.match(/question\/(\d+)/);
        const answerIdMatch = url.match(/answer\/(\d+)/);

        if (
          questionIdMatch &&
          questionIdMatch[1] &&
          answerIdMatch &&
          answerIdMatch[1]
        ) {
          const questionId = questionIdMatch[1];
          const answerId = answerIdMatch[1];

          // 检查是否有缓存的回答
          if (this.articleCache.hasQuestionCache(questionId)) {
            const cachedData = this.articleCache.getQuestionCache(questionId);
            if (cachedData) {
              // 查找匹配的回答
              const cachedAnswer = cachedData.answers.find(
                (a) =>
                  a.actualUrl && a.actualUrl.includes(`/answer/${answerId}`)
              );

              if (cachedAnswer) {
                // 更新当前查看的索引
                this.currentViewingIndex = cachedData.answers.findIndex(
                  (a) =>
                    a.actualUrl && a.actualUrl.includes(`/answer/${answerId}`)
                );
                return cachedAnswer;
              }
            }
          }

          // 如果没有在缓存中找到，则从问题页获取批量回答
          url = `https://www.zhihu.com/question/${questionId}`; // 简化为只访问问题页
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

      // 解析文章信息
      const articleInfo = ContentParser.parseArticleInfo($, url);
      let { title, author, contentHtml } = articleInfo;
      let actualUrl = url; // 添加实际URL字段用于存储回答链接

      // 处理内容中的图片
      contentHtml = ContentParser.processHtmlContent(contentHtml, hideImages);

      // 如果仍然没有内容，提供友好的错误信息
      if (!contentHtml) {
        console.error("未能解析文章内容，可能需要登录或页面结构已更改");
        throw new Error("未能解析文章内容，请联系开发者更新解析方案");
      }

      // 将HTML转为Markdown
      const content = ContentParser.htmlToMarkdown(contentHtml);

      console.log(
        `成功解析文章：${title}，作者：${author.name}，头像: ${
          author.avatar ? "已获取" : "未获取"
        }，简介: ${author.bio || "未获取"}，作者URL: ${author.url || "未获取"}`
      );

      return {
        title: title || "未知标题",
        content,
        author,
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
      console.log(`尝试获取问题 ${questionUrl} 的多个回答，最多${maxCount}个`);
      // 重置当前查看的索引
      this.currentViewingIndex = 0;
      this.maxAnswersToLoad = maxCount;

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
      if (this.articleCache.hasQuestionCache(questionId)) {
        const cachedData = this.articleCache.getQuestionCache(questionId)!;

        // 检查是否需要加载更多回答
        if (cachedData.answers.length < maxCount && cachedData.hasMore) {
          console.log(
            `缓存中的回答数量(${cachedData.answers.length})小于请求数量(${maxCount})，尝试加载更多回答`
          );
          // 异步加载更多回答，但不阻塞当前返回
          this.loadMoreBatchAnswers(
            questionId,
            maxCount - cachedData.answers.length,
            hideImages,
            progressCallback
          ).catch((error) => console.error("自动加载更多回答失败:", error));
        }

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

      // 初始化问题页面
      const { page, questionTitle, totalAnswers } =
        await this.answerLoader.initQuestionPage(cleanQuestionUrl);

      // 初始化结果对象
      const result: BatchAnswers = {
        questionTitle: questionTitle,
        answers: [],
        hasMore: false,
        browser: await PuppeteerManager.getBrowserInstance(),
        page,
        totalAnswers,
      };

      // 加载回答
      await this.answerLoader.loadAllAnswers(
        page,
        questionId,
        maxCount,
        hideImages,
        result,
        progressCallback
      );

      // 将结果存入缓存
      this.articleCache.setQuestionCache(questionId, result);

      return result;
    } catch (error) {
      console.error("批量获取回答失败:", error);
      // 如果出错，不要关闭浏览器，只关闭当前页面
      try {
        // 尝试获取已有缓存
        const cachedData = this.articleCache.getQuestionCache(
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
   * @param progressCallback 进度回调函数，用于实时更新UI
   * @returns 新加载的回答列表
   */
  async loadMoreBatchAnswers(
    questionId: string,
    maxCount: number = 10,
    hideImages: boolean = false,
    progressCallback?: ProgressCallback
  ): Promise<ZhihuArticle[]> {
    try {
      // 如果已经在加载中，直接返回
      if (this.isLoadingMore) {
        console.log("已有加载任务正在进行中，请稍后再试");
        return [];
      }

      this.isLoadingMore = true;

      // 检查缓存中是否存在该问题的回答
      if (!this.articleCache.hasQuestionCache(questionId)) {
        this.isLoadingMore = false;
        throw new Error("未找到缓存的问题回答");
      }

      const cachedData = this.articleCache.getQuestionCache(questionId)!;

      // 如果已经没有更多回答，直接返回空数组
      if (!cachedData.hasMore) {
        console.log("没有更多回答可加载");
        this.isLoadingMore = false;
        return [];
      }

      // 记录原始回答数量
      const originalAnswersCount = cachedData.answers.length;

      // 如果浏览器实例已经关闭，创建新的实例
      if (!cachedData.browser || !cachedData.page) {
        console.log("页面已关闭，创建新页面...");

        // 重新初始化页面
        const { page, questionTitle } =
          await this.answerLoader.initQuestionPage(
            `https://www.zhihu.com/question/${questionId}`
          );

        // 更新缓存
        cachedData.page = page;
        if (!cachedData.questionTitle) {
          cachedData.questionTitle = questionTitle;
        }

        this.articleCache.updateQuestionCache(questionId, {
          page,
          questionTitle: cachedData.questionTitle || questionTitle,
        });
      }

      // 加载更多回答，传入isLoadingMore=true参数以通知UI进入加载状态
      await this.answerLoader.loadAllAnswers(
        cachedData.page!,
        questionId,
        originalAnswersCount + maxCount, // 增加目标数量
        hideImages,
        cachedData,
        progressCallback,
        true // 标记这是加载更多操作
      );

      // 更新缓存
      this.articleCache.updateQuestionCache(questionId, cachedData);

      // 重置加载状态
      this.isLoadingMore = false;

      // 返回新加载的回答
      return cachedData.answers.slice(originalAnswersCount);
    } catch (error) {
      this.isLoadingMore = false;
      console.error("加载更多批量回答失败:", error);
      throw new Error(
        `加载更多批量回答失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`
      );
    }
  }

  /**
   * 设置当前查看的回答索引，并自动加载下一批次
   * @param questionId 问题ID
   * @param index 当前查看的索引
   * @param hideImages 是否隐藏图片
   * @param progressCallback 进度回调函数
   * @param options 可选配置参数，包含滚动尝试次数等
   */
  async setCurrentViewingIndex(
    questionId: string,
    index: number,
    hideImages: boolean = false,
    progressCallback?: ProgressCallback,
    options?: { scrollAttempts?: number }
  ): Promise<boolean> {
    try {
      // 更新当前查看的索引
      this.currentViewingIndex = index;

      // 检查缓存中是否存在该问题的回答
      if (!this.articleCache.hasQuestionCache(questionId)) {
        return false;
      }

      const cachedData = this.articleCache.getQuestionCache(questionId)!;

      // 如果是最后一项并且还有更多可加载且没有正在加载中的任务
      if (
        index === cachedData.answers.length - 1 &&
        cachedData.hasMore &&
        !this.isLoadingMore &&
        cachedData.answers.length < this.maxAnswersToLoad
      ) {
        console.log(`到达当前批次的最后一个回答，自动加载下一批次`);

        // 获取滚动尝试次数，默认为1
        const scrollAttempts = options?.scrollAttempts || 1;
        console.log(`将尝试滚动 ${scrollAttempts} 次以加载更多回答`);

        // 如果页面已关闭，需要重新初始化
        if (!cachedData.page) {
          console.log("页面已关闭，创建新页面...");
          // 重新初始化页面
          const { page } = await this.answerLoader.initQuestionPage(
            `https://www.zhihu.com/question/${questionId}`
          );
          // 更新缓存
          this.articleCache.updateQuestionCache(questionId, { page });
          cachedData.page = page;
        }

        // 防止重复加载
        if (this.isLoadingMore) {
          return false;
        }

        this.isLoadingMore = true;

        try {
          // 根据滚动尝试次数执行多次滚动
          const originalAnswersCount = cachedData.answers.length;
          const scrollResult = await this.answerLoader.loadAllAnswers(
            cachedData.page!,
            questionId,
            originalAnswersCount + 10, // 增加目标数量
            hideImages,
            cachedData,
            progressCallback,
            true, // 标记这是加载更多操作
            scrollAttempts // 传入滚动尝试次数
          );

          // 更新缓存
          this.articleCache.updateQuestionCache(questionId, cachedData);

          // 重置加载状态
          this.isLoadingMore = false;

          // 判断是否成功加载了新回答
          const newAnswersLoaded = cachedData.answers.length > originalAnswersCount;
          return newAnswersLoaded;
        } catch (error) {
          this.isLoadingMore = false;
          console.error("自动加载更多回答失败:", error);
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error("设置当前查看索引失败:", error);
      return false;
    }
  }

  /**
   * 关闭问题的浏览器页面
   * @param questionId 问题ID
   */
  async closeBrowser(questionId: string): Promise<void> {
    try {
      const cachedData = this.articleCache.getQuestionCache(questionId);
      if (cachedData && cachedData.page) {
        console.log(`关闭问题 ${questionId} 的页面`);
        await cachedData.page.close();

        // 更新缓存状态
        this.articleCache.updateQuestionCache(questionId, { page: null });
      }
    } catch (error) {
      console.error("关闭页面失败:", error);
    }
  }

  /**
   * 完全关闭浏览器实例（应用退出时调用）
   */
  static async closeBrowserInstance(): Promise<void> {
    await PuppeteerManager.closeBrowserInstance();
  }

  /**
   * 获取问题下的更多回答ID - 已废弃，保留用于兼容性
   * @deprecated 请使用getBatchAnswers方法代替
   */
  async getMoreAnswersId(questionUrl: string): Promise<string | null> {
    console.log(
      `getMoreAnswersId方法已废弃，请使用getBatchAnswers和setCurrentViewingIndex方法代替`
    );
    return null;
  }
}
