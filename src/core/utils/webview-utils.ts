import { PuppeteerManager } from "../zhihu/puppeteer/index";
import { RelatedQuestionsManager } from "../zhihu/webview/components/related-questions";

/**
 * WebView 工具类
 */
export class WebViewUtils {
  /**
   * 生成唯一的 WebView ID
   * @param baseId 基础ID（如文章ID、问题ID，可能已包含来源前缀）
   * @param sourceType 来源类型（collection、recommend、hot、search）
   * @param contentType 内容类型（article、answer）
   * @param answerId 可选的回答ID，用于特定回答
   * @param collectionId 可选的收藏夹ID，用于区分不同收藏夹中的相同内容
   * @param sortType 可选的排序类型，用于区分同一问题的不同排序方式
   * @returns 唯一的 WebView ID
   */
  public static generateUniqueWebViewId(
    baseId: string,
    sourceType: "collection" | "recommend" | "hot" | "search" | "inner-link",
    contentType: "article" | "answer",
    answerId?: string,
    collectionId?: string,
    sortType?: string
  ): string {
    // 提取纯净的ID，避免重复前缀
    let cleanBaseId = baseId;
    const sourcePrefix = `${sourceType}-`;
    if (baseId.startsWith(sourcePrefix)) {
      cleanBaseId = baseId.substring(sourcePrefix.length);
    }

    let webviewId = `${contentType}-${cleanBaseId}-${sourceType}`;

    // 如果是收藏夹来源，添加收藏夹ID以区分不同收藏夹中的相同内容
    if (sourceType === "collection" && collectionId) {
      webviewId += `-col-${collectionId}`;
    }

    // 如果是特定回答，添加回答ID
    if (answerId) {
      webviewId += `-answer-${answerId}`;
    }

    // 如果有排序类型，添加到ID中以区分不同排序方式
    if (sortType) {
      webviewId += `-sort-${sortType}`;
    }

    return webviewId;
  }

  /**
   * 从URL中提取回答ID
   * @param url 完整的回答URL
   * @returns 回答ID，如果提取失败则返回null
   */
  public static extractAnswerIdFromUrl(url: string): string | null {
    try {
      // 匹配 /answer/数字 的模式
      const match = url.match(/\/answer\/(\d+)/);
      return match ? match[1] : null;
    } catch (error) {
      console.error("提取回答ID时出错:", error);
      return null;
    }
  }

  /**
   * 从URL中提取问题ID
   * @param url 完整的问题URL
   * @returns 问题ID，如果提取失败则返回null
   */
  public static extractQuestionIdFromUrl(url: string): string | null {
    try {
      // 匹配 /question/数字 的模式
      const match = url.match(/\/question\/(\d+)/);
      return match ? match[1] : null;
    } catch (error) {
      console.error("提取问题ID时出错:", error);
      return null;
    }
  }

  /**
   * 从URL中提取文章ID
   * @param url 完整的文章URL
   * @returns 文章ID，如果提取失败则返回null
   */
  public static extractArticleIdFromUrl(url: string): string | null {
    try {
      // 匹配 /p/数字 的模式
      const match = url.match(/\/p\/(\d+)/);
      return match ? match[1] : null;
    } catch (error) {
      console.error("提取文章ID时出错:", error);
      return null;
    }
  }

  /**
   * 构建问题的全部回答页面URL
   * @param questionId 问题ID
   * @returns 全部回答页面URL
   */
  public static buildQuestionAllAnswersUrl(questionId: string): string {
    return `https://www.zhihu.com/question/${questionId}`;
  }

  /**
   * 构建特定回答的URL
   * @param questionId 问题ID
   * @param answerId 回答ID
   * @returns 特定回答的URL
   */
  public static buildAnswerUrl(questionId: string, answerId: string): string {
    return `https://www.zhihu.com/question/${questionId}/answer/${answerId}`;
  }

  /**
   * 通过Puppeteer获取特定回答的内容
   * @param answerUrl 回答的完整URL
   * @returns 解析后的回答对象，如果失败返回null
   */
  public static async fetchSpecificAnswerContent(
    webviewId: string,
    answerUrl: string
  ): Promise<any | null> {
    try {
      console.log(`开始获取特定回答内容: ${answerUrl}`);

      // 创建新页面
      const page = await PuppeteerManager.createPage();

      try {
        // 导航到回答页面
        console.log("正在加载回答页面...");
        await page.goto(answerUrl, {
          waitUntil: "domcontentloaded", // 只等待DOM加载完成即可
          timeout: 30000,
        });

        // 等待回答元素出现
        await page.waitForSelector(".ContentItem.AnswerItem", {
          timeout: 15000,
        });

        console.log("回答页面加载完成，开始提取内容...");

        // 提取回答数据
        const answerData = await page.evaluate(() => {
          const answerElement = document.querySelector(
            ".ContentItem.AnswerItem"
          );
          if (!answerElement) {
            return null;
          }

          // 提取回答ID
          let answerId = answerElement.getAttribute("name");
          if (!answerId) {
            const dataZop = answerElement.getAttribute("data-zop");
            if (dataZop) {
              try {
                const zopData = JSON.parse(dataZop);
                answerId = zopData.itemId;
              } catch (e) {
                console.error("解析data-zop失败:", e);
              }
            }
          }

          // 提取作者信息
          const authorElement = answerElement.querySelector(".AuthorInfo");

          // 作者名称
          const authorName =
            authorElement
              ?.querySelector("meta[itemprop='name']")
              ?.getAttribute("content") || "匿名用户";

          // 作者头像
          const authorAvatar =
            authorElement
              ?.querySelector("meta[itemprop='image']")
              ?.getAttribute("content") || "";

          // 作者URL
          const authorUrl =
            authorElement
              ?.querySelector("meta[itemprop='url']")
              ?.getAttribute("content") || "";

          // 作者签名 AuthorInfo-badgeText
          const authorSignatureElement = authorElement?.querySelector(
            ".AuthorInfo-badgeText"
          );
          const authorHeadline = authorSignatureElement
            ? authorSignatureElement.textContent?.trim() || ""
            : "";

          // 作者的关注数量 <meta itemprop="zhihu:followerCount" content="787">
          const authorFollowerElement = document.querySelector(
            "meta[itemprop='zhihu:followerCount']"
          );
          let authorFollowerCount = 0;
          if (authorFollowerElement) {
            const followerText = authorFollowerElement.getAttribute("content") || "0";
            authorFollowerCount = parseInt(followerText.replace(/,/g, "")) || 0;
          }

          // .KfeCollection-AnswerTopCard-Container 这个是盐选的标识，如果发现了则加到答案内容里
          const isPaidAnswer =
            document.querySelector(
              ".KfeCollection-AnswerTopCard-Container"
            ) !== null;

          // 提取回答内容
          const contentElement = answerElement.querySelector(
            ".RichContent .RichContent-inner"
          );
          const content = isPaidAnswer ? '<span class="zhihu-fisher-content-is-paid-needed"></span>' + contentElement?.innerHTML : contentElement?.innerHTML || "";

          // 提取点赞数
          const voteElement = answerElement.querySelector(".VoteButton");
          let voteCount = 0;
          if (voteElement) {
            const voteText = voteElement.textContent || "";
            const match = voteText.match(/赞同\s*(\d+)/);
            if (match) {
              voteCount = parseInt(match[1]) || 0;
            }
          }

          // 检测用户的投票状态
          let voteStatus: "up" | "down" | "neutral" = "neutral";

          // 查找投票按钮区域
          const contentItemActions = answerElement.querySelector(
            ".ContentItem-actions"
          );
          if (contentItemActions) {
            // 先检查所有投票相关的按钮
            const allVoteButtons = contentItemActions.querySelectorAll(
              "[class*='VoteButton']"
            );
            console.log(
              `特定回答 ${answerId} 找到 ${allVoteButtons.length} 个投票按钮`
            );

            // 更精确地查找赞同按钮：VoteButton + is-active，但不包含 VoteButton--down
            const upVoteButton = contentItemActions.querySelector(
              ".VoteButton.is-active:not(.VoteButton--down)"
            );
            // 查找不赞同按钮：VoteButton--down + is-active
            const downVoteButton = contentItemActions.querySelector(
              ".VoteButton--down.is-active"
            );

            // 输出调试信息
            if (allVoteButtons.length > 0) {
              allVoteButtons.forEach((btn, index) => {
                console.log(`特定回答按钮${index}: class="${btn.className}"`);
              });
            }

            if (upVoteButton) {
              voteStatus = "up";
              console.log(`特定回答 ${answerId} 检测到赞同状态`);
            } else if (downVoteButton) {
              voteStatus = "down";
              console.log(`特定回答 ${answerId} 检测到不赞同状态`);
            } else {
              console.log(`特定回答 ${answerId} 检测到中立状态`);
            }
          } else {
            console.log(`特定回答 ${answerId} 未找到投票按钮区域`);
          }

          // 提取评论数
          const commentElement = answerElement.querySelector(
            ".ContentItem-action"
          );
          let commentCount = 0;
          if (commentElement) {
            const commentText = commentElement.textContent || "";
            const match = commentText.match(/(\d+)\s*条评论/);
            if (match) {
              commentCount = parseInt(match[1]) || 0;
            }
          }

          // 提取发布时间
          const timeElement = answerElement.querySelector(
            ".ContentItem-time a"
          );
          const publishTime =
            timeElement?.getAttribute("data-tooltip") ||
            timeElement?.textContent ||
            "";

          return {
            id: answerId,
            authorName,
            authorAvatar,
            authorUrl,
            authorHeadline,
            authorFollowerCount,
            content,
            voteCount,
            commentCount,
            publishTime,
            url: window.location.href,
            voteStatus, // 添加投票状态
          };
        });

        // 解析相关推荐
        await RelatedQuestionsManager.parseRelatedQuestions(webviewId, page);

        if (answerData && answerData.id) {
          console.log(
            `成功获取回答内容: ID=${answerData.id}, 作者=${answerData.authorName}`
          );
          return answerData;
        } else {
          console.error("未能解析到有效的回答数据");
          return null;
        }
      } finally {
        // 确保页面被关闭
        await page.close();
      }
    } catch (error) {
      console.error("获取特定回答内容失败:", error);
      return null;
    }
  }
}
