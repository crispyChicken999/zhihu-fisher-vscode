import { RelatedQuestion } from "../../../types";
import { Store } from "../../../stores";
import * as Puppeteer from "puppeteer";

/**
 * 相关问题管理器
 */
export class RelatedQuestionsManager {
  /**
   * 解析页面中的相关问题
   * @param webviewId WebView的ID
   * @param page Puppeteer页面实例
   * @returns 解析到的相关问题列表
   */
  public static async parseRelatedQuestions(
    webviewId: string,
    page: Puppeteer.Page
  ): Promise<RelatedQuestion[]> {
    const webviewItem = Store.webviewMap.get(webviewId);
    if (!webviewItem) {
      return [];
    }

    try {
      const relatedQuestions = await page.evaluate(() => {
        // 根据提供的DOM结构解析相关问题
        const relatedQuestionsCard = document.querySelector('.Card[role="complementary"][aria-label="相关问题"]');
        if (!relatedQuestionsCard) {
          return [];
        }

        const questionItems = relatedQuestionsCard.querySelectorAll('.SimilarQuestions-item');
        const questions: any[] = [];

        questionItems.forEach((item: Element) => {
          try {
            // 提取问题标题
            const titleMeta = item.querySelector('meta[itemprop="name"]');
            const title = titleMeta?.getAttribute('content') || '';

            // 提取问题URL
            const urlMeta = item.querySelector('meta[itemprop="url"]');
            const url = urlMeta?.getAttribute('content') || '';

            // 提取回答数量
            const answerCountMeta = item.querySelector('meta[itemprop="answerCount"]');
            const answerCount = parseInt(answerCountMeta?.getAttribute('content') || '0', 10);

            // 提取关注数量
            const followerCountMeta = item.querySelector('meta[itemprop="zhihu:followerCount"]');
            const followerCount = parseInt(followerCountMeta?.getAttribute('content') || '0', 10);

            // 从URL中提取问题ID
            const questionId = url ? url.split('/').pop() || '' : '';

            if (title && url && questionId) {
              questions.push({
                id: questionId,
                title: title.trim(),
                url: url.startsWith('http') ? url : `https://www.zhihu.com${url}`,
                answerCount,
                followerCount
              });
            }
          } catch (error) {
            console.error('解析单个相关问题时出错:', error);
          }
        });

        return questions;
      });

      // 将解析到的相关问题推送到webviewItem.article.relatedQuestions并去重
      if (relatedQuestions && relatedQuestions.length > 0) {
        this.addRelatedQuestionsWithDeduplication(webviewId, relatedQuestions);
        console.log(`解析到 ${relatedQuestions.length} 个相关问题`);
        return relatedQuestions;
      } else {
        console.log("未找到相关问题");
        return [];
      }

    } catch (error) {
      console.error("解析相关问题时出错:", error);
      return [];
    }
  }

  /**
   * 添加相关问题到webviewItem.article.relatedQuestions，并进行去重处理
   * @param webviewId WebView的ID
   * @param newQuestions 新的相关问题列表
   */
  private static addRelatedQuestionsWithDeduplication(
    webviewId: string,
    newQuestions: RelatedQuestion[]
  ): void {
    const webviewItem = Store.webviewMap.get(webviewId);
    if (!webviewItem) {
      return;
    }

    let hasChanges = false;

    // 如果还没有相关问题列表，直接设置
    if (!webviewItem.article.relatedQuestions) {
      webviewItem.article.relatedQuestions = newQuestions;
      hasChanges = newQuestions.length > 0;
    } else {
      // 创建一个已存在问题ID的Set用于快速查找
      const existingIds = new Set(webviewItem.article.relatedQuestions.map(q => q.id));

      // 筛选出新的问题（去重）
      const uniqueNewQuestions = newQuestions.filter(question => !existingIds.has(question.id));

      if (uniqueNewQuestions.length > 0) {
        // 将新问题推送到现有列表
        webviewItem.article.relatedQuestions.push(...uniqueNewQuestions);
        hasChanges = true;
      }

      console.log(`去重后添加了 ${uniqueNewQuestions.length} 个新的相关问题，总数: ${webviewItem.article.relatedQuestions.length}`);
    }

    // 如果有变化，通知WebView更新相关问题数据
    if (hasChanges) {
      this.notifyWebViewUpdateRelatedQuestions(webviewId);
    }
  }

  /**
   * 通知WebView更新相关问题数据
   * @param webviewId WebView的ID
   */
  private static notifyWebViewUpdateRelatedQuestions(webviewId: string): void {
    const webviewItem = Store.webviewMap.get(webviewId);
    if (!webviewItem || !webviewItem.webviewPanel) {
      return;
    }

    try {
      // 发送消息给WebView，更新相关问题数据
      webviewItem.webviewPanel.webview.postMessage({
        command: "updateRelatedQuestions",
        data: webviewItem.article.relatedQuestions || []
      });

      console.log(`已通知WebView更新相关问题数据，共 ${webviewItem.article.relatedQuestions?.length || 0} 个问题`);
    } catch (error) {
      console.error("通知WebView更新相关问题数据失败:", error);
    }
  }
}

/**
 * 相关问题组件
 * 负责渲染知乎问题页面的相关问题模块
 */
export class RelatedQuestionsComponent {
  private relatedQuestions: RelatedQuestion[];

  constructor(relatedQuestions: RelatedQuestion[]) {
    this.relatedQuestions = relatedQuestions || [];
  }

  /**
   * 渲染相关问题组件
   * 根据新设计，这里只返回空字符串，不再显示完整列表
   */
  public render(): string {
    return this.Icon();
  }

  /**
   * 渲染沉浸模式的图标（点击显示弹窗）
   */
  private Icon(): string {
    const questionCount = this.relatedQuestions.length;

    return `
      <div class="related-questions-icon" onclick="showRelatedQuestionsModal()" title="相关问题 (${questionCount})">
        <svg xmlns="http://www.w3.org/2000/svg" width="min(1em,12px)" height="min(1em,12px)" viewBox="0 0 24 24">
          <path fill="currentColor" d="M21.738 16.13a1 1 0 0 1-.19.61a1 1 0 0 1-.52.38l-1.71.57a3.6 3.6 0 0 0-1.4.86a3.5 3.5 0 0 0-.86 1.4l-.6 1.7a1 1 0 0 1-.36.51a1.1 1.1 0 0 1-.62.19a1 1 0 0 1-1-.71l-.57-1.71a3.5 3.5 0 0 0-.86-1.4a3.8 3.8 0 0 0-1.4-.87l-1.71-.56a1.1 1.1 0 0 1-.51-.37a1.1 1.1 0 0 1-.21-.62a1 1 0 0 1 .71-1l1.72-.57a3.54 3.54 0 0 0 2.28-2.28l.57-1.69a1 1 0 0 1 .95-.73c.215 0 .426.059.61.17c.182.125.322.303.4.51l.58 1.74a3.54 3.54 0 0 0 2.28 2.28l1.7.6a1 1 0 0 1 .51.38a1 1 0 0 1 .21.61m-9.999-6.36a1 1 0 0 1-.17.55a1 1 0 0 1-.47.35l-1.26.42c-.353.122-.673.32-.94.58a2.5 2.5 0 0 0-.58.94l-.43 1.24a.9.9 0 0 1-.35.47a1 1 0 0 1-.56.18a1 1 0 0 1-.57-.19a1 1 0 0 1-.34-.47l-.41-1.25a2.44 2.44 0 0 0-.58-.93a2.2 2.2 0 0 0-.93-.58l-1.25-.42a.93.93 0 0 1-.48-.35a1 1 0 0 1 .48-1.47l1.25-.41a2.49 2.49 0 0 0 1.53-1.53l.41-1.23a1 1 0 0 1 .32-.47a1 1 0 0 1 .55-.2a1 1 0 0 1 .57.16a1 1 0 0 1 .37.46l.42 1.28a2.49 2.49 0 0 0 1.53 1.53l1.25.43a.92.92 0 0 1 .46.35a.94.94 0 0 1 .18.56m5.789-5.36a1 1 0 0 1-.17.51a.82.82 0 0 1-.42.3l-.62.21a.84.84 0 0 0-.52.52l-.22.63a.93.93 0 0 1-.29.39a.82.82 0 0 1-.52.18a1.1 1.1 0 0 1-.49-.15a.9.9 0 0 1-.32-.44l-.21-.62a.7.7 0 0 0-.2-.32a.76.76 0 0 0-.32-.2l-.62-.2a1 1 0 0 1-.42-.31a.9.9 0 0 1-.16-.51a.94.94 0 0 1 .17-.51a.9.9 0 0 1 .42-.3l.61-.2a.9.9 0 0 0 .33-.2a.9.9 0 0 0 .2-.33l.21-.62c.06-.155.155-.292.28-.4a1 1 0 0 1 .49-.19a.94.94 0 0 1 .53.16a1 1 0 0 1 .32.41l.21.64a.9.9 0 0 0 .2.33a1 1 0 0 0 .32.2l.63.21a1 1 0 0 1 .41.3a.87.87 0 0 1 .17.51"/>
        </svg>
      </div>
    `;
  }
}
