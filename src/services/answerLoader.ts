import * as puppeteer from "puppeteer";
import { ZhihuArticle, ZhihuAuthor } from "./types";
import { PuppeteerManager } from "./puppeteerManager";
import { ContentParser } from "./contentParser";
import { BatchAnswers } from "./articleCache";
import { CookieManager } from "./cookieManager";

// 定义回调函数类型，用于实时更新爬取状态
export interface ProgressCallback {
  (
    article: ZhihuArticle,
    count: number,
    total: number,
    isLoading?: boolean
  ): void;
}

/**
 * 负责加载知乎问题的回答
 */
export class AnswerLoader {
  private cookieManager: CookieManager;

  constructor(cookieManager: CookieManager) {
    this.cookieManager = cookieManager;
  }

  /**
   * 从问题页面提取回答
   * @param page Puppeteer页面对象
   * @param questionId 问题ID
   * @param hideImages 是否隐藏图片
   */
  async extractAnswersFromPage(
    page: puppeteer.Page,
    questionId: string,
    hideImages: boolean
  ): Promise<ZhihuArticle[]> {
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
          let author = {
            name: "未知作者",
            avatar: "",
            bio: "",
            url: "",
          };

          if (authorInfo) {
            const nameElement = authorInfo.querySelector(
              "meta[itemprop='name']"
            );
            if (nameElement) {
              author.name = nameElement.getAttribute("content") || "未知作者";
            }

            const avatarElement = authorInfo.querySelector(".Avatar");
            if (avatarElement) {
              author.avatar = avatarElement.getAttribute("src") || "";
            }

            const bioElement = authorInfo.querySelector(
              ".AuthorInfo-badgeText"
            );
            if (bioElement) {
              author.bio = bioElement.textContent?.trim() || "";
            }

            const urlElement = authorInfo.querySelector("meta[itemprop='url']");
            if (urlElement) {
              author.url = urlElement.getAttribute("content") || "";
            } else {
              const linkElement = authorInfo.querySelector(".UserLink-link");
              if (linkElement) {
                const href = linkElement.getAttribute("href");
                if (href) {
                  author.url = href.startsWith("http")
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
    const result: ZhihuArticle[] = [];
    const questionTitle = await page.evaluate(() => {
      const titleElement = document.querySelector("h1.QuestionHeader-title");
      return titleElement
        ? (titleElement.textContent?.trim() as string)
        : "未知问题";
    });

    for (const answer of newAnswers) {
      const content = ContentParser.htmlToMarkdown(answer.contentHtml);
      const actualUrl = `https://www.zhihu.com/question/${questionId}/answer/${answer.answerId}`;

      result.push({
        title: questionTitle,
        content,
        author: answer.author,
        actualUrl,
      });
    }

    return result;
  }

  /**
   * 从问题页面加载所有回答
   * @param page Puppeteer页面对象
   * @param questionId 问题ID
   * @param maxCount 最大获取回答数量
   * @param hideImages 是否隐藏图片
   * @param batchAnswers 现有的回答批次数据
   * @param progressCallback 进度回调函数
   * @param isLoadingMore 是否是加载更多操作
   * @param scrollAttempts 滚动尝试次数，默认为3
   */
  async loadAllAnswers(
    page: puppeteer.Page,
    questionId: string,
    maxCount: number,
    hideImages: boolean,
    batchAnswers: BatchAnswers,
    progressCallback?: ProgressCallback,
    isLoadingMore: boolean = false,
    scrollAttempts: number = 3
  ): Promise<boolean> {
    // 检查是否已经达到目标数量
    if (batchAnswers.answers.length >= maxCount) {
      return false;
    }

    let answersCount = batchAnswers.answers.length;
    let lastAnswersCount = answersCount;
    // 根据传入的scrollAttempts参数调整尝试次数
    let noNewAnswersCounter = 0;
    // 最大尝试次数
    const maxAttempts = Math.max(scrollAttempts, 3); // 至少尝试3次
    let loadedNewAnswers = false;

    console.log(`将尝试最多 ${maxAttempts} 次滚动以加载更多回答`);

    // 是否发送了第一个回答
    let firstAnswerSent = batchAnswers.answers.length > 0 && !isLoadingMore;

    // 如果是加载更多操作，先通知UI进入加载状态
    if (isLoadingMore && progressCallback) {
      progressCallback(
        batchAnswers.answers[batchAnswers.answers.length - 1],
        batchAnswers.answers.length,
        batchAnswers.totalAnswers || maxCount,
        true // 标记为加载中
      );
    }

    while (answersCount < maxCount && noNewAnswersCounter < maxAttempts) {
      // 提取当前页面上的所有回答
      const newAnswers = await this.extractAnswersFromPage(
        page,
        questionId,
        hideImages
      );

      // 将新提取的回答添加到结果中
      const existingUrls = new Set(
        batchAnswers.answers.map((a) => a.actualUrl)
      );
      const uniqueNewAnswers = newAnswers.filter(
        (answer) =>
          !existingUrls.has(answer.actualUrl) &&
          batchAnswers.answers.length < maxCount
      );

      if (uniqueNewAnswers.length > 0) {
        // 添加新回答
        batchAnswers.answers.push(...uniqueNewAnswers);
        loadedNewAnswers = true;

        // 如果这是第一个回答且有回调函数，立即通知UI可以显示第一个回答
        if (
          !firstAnswerSent &&
          progressCallback &&
          batchAnswers.answers.length > 0
        ) {
          progressCallback(
            batchAnswers.answers[0],
            1,
            batchAnswers.totalAnswers || maxCount
          );
          firstAnswerSent = true;
        }
        // 如果是加载更多且这是新批次的第一个回答，通知UI新回答已加载
        else if (
          isLoadingMore &&
          progressCallback &&
          uniqueNewAnswers.length > 0
        ) {
          progressCallback(
            uniqueNewAnswers[0],
            batchAnswers.answers.length,
            batchAnswers.totalAnswers || maxCount
          );
        }
        // 如果有回调函数，通知UI更新当前爬取进度
        else if (progressCallback) {
          progressCallback(
            batchAnswers.answers[0], // 始终传递第一个回答（因为可能已经显示了）
            batchAnswers.answers.length,
            batchAnswers.totalAnswers || maxCount
          );
        }

        lastAnswersCount = batchAnswers.answers.length;
        noNewAnswersCounter = 0;
        console.log(`已加载 ${batchAnswers.answers.length} 个回答`);
      } else {
        noNewAnswersCounter++;
        console.log(
          `未找到新回答，尝试再次滚动 (${noNewAnswersCounter}/${maxAttempts})`
        );
      }

      // 如果已经达到目标数量，跳出循环
      if (batchAnswers.answers.length >= maxCount) {
        break;
      }

      // 使用模拟人类滚动行为
      await PuppeteerManager.simulateHumanScroll(page);

      // 添加随机延迟，更好地模拟真人行为（500-1500ms）
      await PuppeteerManager.delay(500 + Math.random() * 1000);

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
        await PuppeteerManager.delay(2000);
      }

      answersCount = batchAnswers.answers.length;
    }

    // 更新是否有更多回答的标志
    batchAnswers.hasMore = await page.evaluate(() => {
      return (
        document.querySelector(".QuestionMainAction") !== null ||
        document.querySelector(".List-loadMore") !== null
      );
    });

    // 如果尝试了多次滚动但仍没有获取到新回答，并且我们知道总回答数大于当前加载的回答数
    // 那么可能是反爬机制在起作用，我们不应该将hasMore设为false
    if (
      !loadedNewAnswers &&
      batchAnswers.totalAnswers &&
      batchAnswers.answers.length < batchAnswers.totalAnswers
    ) {
      batchAnswers.hasMore = true;
      console.log(
        `尽管多次尝试未加载到新回答，但根据总回答数(${batchAnswers.totalAnswers})，应该还有更多回答可加载`
      );
    }

    console.log(
      `已成功获取 ${batchAnswers.answers.length} 个回答，${
        batchAnswers.hasMore ? "还有更多回答可加载" : "没有更多回答了"
      }`
    );

    return loadedNewAnswers;
  }

  /**
   * 初始化问题页面
   * @param questionUrl 问题URL
   */
  async initQuestionPage(questionUrl: string): Promise<{
    page: puppeteer.Page;
    questionTitle: string;
    totalAnswers: number;
  }> {
    // 创建新页面
    const page = await PuppeteerManager.createPage(this.cookieManager);

    console.log(`导航到问题页面: ${questionUrl}`);
    await page.goto(questionUrl, {
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
          ? (titleElement.textContent?.trim() as string)
          : "未知问题",
        totalAnswers: total,
      };
    });

    console.log(`问题标题: ${questionTitle}, 总回答数: ${totalAnswers}`);

    // 尝试点击"收起全部回答"按钮
    await page.evaluate(() => {
      const collapseButton = document.querySelector("#collapsed-button");
      if (collapseButton) {
        (collapseButton as HTMLElement).click();
        console.log("已点击收起回答按钮");
      }
    });

    // 等待一段时间让页面稳定
    await PuppeteerManager.delay(1000);

    return { page, questionTitle, totalAnswers };
  }
}
