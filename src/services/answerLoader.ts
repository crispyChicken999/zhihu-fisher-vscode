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
    // 根据传入的scrollAttempts参数调整尝试次数
    let noNewAnswersCounter = 0;
    // 最大尝试次数
    const maxAttempts = Math.max(scrollAttempts, 5); // 至少尝试5次
    let loadedNewAnswers = false;
    // 是否已经发送了第一个回答通知
    let firstAnswerSent = batchAnswers.answers.length > 0 && !isLoadingMore;

    console.log(`将尝试最多 ${maxAttempts} 次滚动以加载更多回答`);

    // 如果是加载更多操作，先通知UI进入加载状态
    if (isLoadingMore && progressCallback) {
      progressCallback(
        batchAnswers.answers[batchAnswers.answers.length - 1],
        batchAnswers.answers.length,
        batchAnswers.totalAnswers || maxCount,
        true // 标记为加载中
      );
    }

    // 首先给页面充分的初始等待时间，确保之前的内容已完全渲染
    console.log("等待页面稳定并渲染当前内容...");
    await PuppeteerManager.delay(2000);
    
    // 尝试立即提取第一批回答，如果当前页面已有回答则直接显示
    if (!firstAnswerSent) {
      const initialAnswers = await this.extractAnswersFromPage(
        page,
        questionId,
        hideImages
      );
      
      if (initialAnswers.length > 0) {
        // 将首批回答添加到结果中
        batchAnswers.answers.push(...initialAnswers);
        loadedNewAnswers = true;
        
        // 立即通知UI显示第一个回答
        if (progressCallback) {
          console.log("已找到第一个回答，立即通知UI显示");
          progressCallback(
            initialAnswers[0],
            1,
            batchAnswers.totalAnswers || maxCount
          );
          firstAnswerSent = true;
        }
        
        // 如果只获取到一个回答，继续后续流程加载更多回答
        console.log(`已加载页面上的 ${initialAnswers.length} 个回答，继续加载更多...`);
      }
    }

    while (answersCount < maxCount && noNewAnswersCounter < maxAttempts) {
      // 记录滚动前的页面高度
      const prevHeight = await page.evaluate(() => document.body.scrollHeight);
      
      // 使用已有的simulateHumanScroll方法滚动页面
      console.log("使用模拟人类滚动行为加载更多回答...");
      await PuppeteerManager.simulateHumanScroll(page);
      
      // 等待一段时间让内容加载
      await PuppeteerManager.delay(2000);
      
      // 检查高度是否变化
      const newHeight = await page.evaluate(() => document.body.scrollHeight);
      
      // 如果高度没变化且已经加载了部分回答但与总回答数差距较大，再尝试多滚动几次
      if (newHeight <= prevHeight && 
          batchAnswers.totalAnswers &&
          batchAnswers.answers.length > 0 &&
          batchAnswers.answers.length < batchAnswers.totalAnswers * 0.5) {
        console.log("页面高度未变化，检测到已加载部分回答与总数差距较大，尝试多次滚动...");
        console.log(`成功加载批量回答，共 ${batchAnswers.answers.length} 个回答，总共 ${batchAnswers.totalAnswers} 个回答`);
        
        // 多次尝试滚动以触发更多加载
        for (let i = 0; i < 3; i++) {
          await PuppeteerManager.simulateHumanScroll(page);
          await PuppeteerManager.delay(2000);
        }
      } else if (newHeight > prevHeight) {
        console.log(`页面高度变化: ${prevHeight}px -> ${newHeight}px，检测到新内容加载`);
      }

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
        if (!firstAnswerSent && progressCallback && batchAnswers.answers.length > 0) {
          progressCallback(
            batchAnswers.answers[0],
            1,
            batchAnswers.totalAnswers || maxCount
          );
          firstAnswerSent = true;
        } 
        // 如果有第二个回答，及时通知UI启用"下一条回答"按钮
        else if (firstAnswerSent && progressCallback && batchAnswers.answers.length >= 2) {
          console.log("已加载至少两个回答，通知UI更新导航状态");
          progressCallback(
            batchAnswers.answers[0], // 仍然使用第一个回答，不改变当前显示内容
            batchAnswers.answers.length,
            batchAnswers.totalAnswers || maxCount
          );
        }
        // 如果是加载更多操作，通知UI新回答已加载
        else if (isLoadingMore && progressCallback && uniqueNewAnswers.length > 0) {
          progressCallback(
            uniqueNewAnswers[0],
            batchAnswers.answers.length,
            batchAnswers.totalAnswers || maxCount
          );
        }
        // 其他情况，如有回调函数，通知UI更新当前爬取进度
        else if (progressCallback) {
          progressCallback(
            batchAnswers.answers[0], // 始终传递第一个回答（因为可能已经显示了）
            batchAnswers.answers.length,
            batchAnswers.totalAnswers || maxCount
          );
        }

        noNewAnswersCounter = 0;
        console.log(`已加载 ${batchAnswers.answers.length} 个回答，发现 ${uniqueNewAnswers.length} 个新回答`);
      } else {
        noNewAnswersCounter++;
        console.log(`尝试第 ${noNewAnswersCounter} 次滚动，未发现新回答`);
      }

      // 如果已经达到目标数量，跳出循环
      if (batchAnswers.answers.length >= maxCount) {
        break;
      }

      // 如果已经至少有两个回答，且已经通知了UI，可以考虑减少剩余尝试次数，加快返回
      if (firstAnswerSent && batchAnswers.answers.length >= 2 && noNewAnswersCounter >= 2) {
        console.log("已有足够的回答可供浏览，减少剩余尝试次数");
        noNewAnswersCounter++;
      }

      answersCount = batchAnswers.answers.length;
    }

    // 更新是否还有更多回答的标志
    if (
      batchAnswers.totalAnswers &&
      batchAnswers.answers.length < batchAnswers.totalAnswers
    ) {
      batchAnswers.hasMore = true;
      console.log(
        `多次滚动尝试后总共加载了 ${batchAnswers.answers.length} 个回答，根据总回答数(${batchAnswers.totalAnswers})，还有更多回答可加载`
      );
    } else {
      batchAnswers.hasMore = false;
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

    // 检查当前页面是否已经加载了目标URL
    const currentUrl = await page.evaluate(() => window.location.href);
    // 判断当前页面是不是已经在目标问题页了，如果是就不需要再导航
    const isAlreadyOnQuestionPage = currentUrl.includes(
      questionUrl.split("?")[0]
    );

    // 只有当当前页面不是目标问题页时才导航
    if (!isAlreadyOnQuestionPage) {
      console.log(`导航到问题页面: ${questionUrl}`);
      await page.goto(questionUrl, {
        waitUntil: "networkidle0",
        timeout: 60000,
      });
      console.log("页面加载完成，开始提取问题标题和回答");
    } else {
      console.log(`页面已经加载了目标URL: ${questionUrl}，无需再次导航`);
    }

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

    // 等待一段时间让页面稳定
    await PuppeteerManager.delay(1000);

    return { page, questionTitle, totalAnswers };
  }
}
