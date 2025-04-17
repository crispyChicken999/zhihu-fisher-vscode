import * as puppeteer from "puppeteer";
import { ZhihuArticle } from "./types";

// 定义批量获取的回答内容结构
export interface BatchAnswers {
  questionTitle: string;
  answers: ZhihuArticle[];
  hasMore: boolean;
  page: puppeteer.Page | null; // 每个问题对应一个独立的页面实例
  totalAnswers?: number; // 问题的总回答数
}

/**
 * 负责管理知乎文章回答的缓存
 */
export class ArticleCache {
  private batchAnswersCache: Map<string, BatchAnswers> = new Map();

  /**
   * 获取问题的缓存回答
   * @param questionId 问题ID
   */
  getQuestionCache(questionId: string): BatchAnswers | undefined {
    return this.batchAnswersCache.get(questionId);
  }

  /**
   * 保存问题的回答缓存
   * @param questionId 问题ID
   * @param data 回答数据
   */
  setQuestionCache(questionId: string, data: BatchAnswers): void {
    this.batchAnswersCache.set(questionId, data);
  }

  /**
   * 检查问题是否已有缓存
   * @param questionId 问题ID
   */
  hasQuestionCache(questionId: string): boolean {
    return this.batchAnswersCache.has(questionId);
  }

  /**
   * 更新缓存中问题的特定属性
   * @param questionId 问题ID
   * @param updates 要更新的属性
   */
  updateQuestionCache(
    questionId: string,
    updates: Partial<BatchAnswers>
  ): void {
    if (this.batchAnswersCache.has(questionId)) {
      const existingData = this.batchAnswersCache.get(questionId)!;
      this.batchAnswersCache.set(questionId, { ...existingData, ...updates });
    }
  }

  /**
   * 添加回答到问题的缓存中
   * @param questionId 问题ID
   * @param answers 要添加的回答
   */
  addAnswersToCache(questionId: string, answers: ZhihuArticle[]): void {
    if (this.batchAnswersCache.has(questionId)) {
      const existingData = this.batchAnswersCache.get(questionId)!;

      // 过滤掉已经存在的回答
      const existingAnswerUrls = new Set(
        existingData.answers.map((a) => a.actualUrl)
      );

      const newAnswers = answers.filter(
        (answer) => !existingAnswerUrls.has(answer.actualUrl)
      );

      // 合并新回答
      existingData.answers = [...existingData.answers, ...newAnswers];
      this.batchAnswersCache.set(questionId, existingData);
    }
  }

  /**
   * 关闭问题对应的页面
   * @param questionId 问题ID
   */
  async closePageForQuestion(questionId: string): Promise<void> {
    if (this.batchAnswersCache.has(questionId)) {
      const existingData = this.batchAnswersCache.get(questionId)!;
      if (existingData.page) {
        try {
          await existingData.page.close();
          existingData.page = null;
          this.batchAnswersCache.set(questionId, existingData);
          console.log(`已关闭问题 ${questionId} 的页面`);
        } catch (error) {
          console.error(`关闭问题 ${questionId} 的页面失败:`, error);
        }
      }
    }
  }

  /**
   * 关闭所有问题的页面
   */
  async closeAllPages(): Promise<void> {
    const closePromises: Promise<void>[] = [];
    for (const questionId of this.batchAnswersCache.keys()) {
      closePromises.push(this.closePageForQuestion(questionId));
    }
    await Promise.all(closePromises);
    console.log('已关闭所有问题的页面');
  }

  /**
   * 清除问题的缓存
   * @param questionId 问题ID
   */
  async clearQuestionCache(questionId: string): Promise<void> {
    // 首先关闭页面
    await this.closePageForQuestion(questionId);
    // 然后移除缓存
    this.batchAnswersCache.delete(questionId);
  }

  /**
   * 获取缓存的所有问题ID
   */
  getAllCachedQuestionIds(): string[] {
    return Array.from(this.batchAnswersCache.keys());
  }
}
