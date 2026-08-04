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
    sourceType:
      | "collection"
      | "recommend"
      | "hot"
      | "search"
      | "inner-link"
      | "follow"
      | "thought",
    contentType: "article" | "answer",
    answerId?: string,
    collectionId?: string,
    sortType?: string,
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
}
