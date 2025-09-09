import { Component, RenderOptions } from "./base";
import { ContentProcessor } from "./content-processor";
import * as cheerio from "cheerio";

/**
 * 问题详情组件
 * 用于显示问题的详细介绍内容
 */
export class QuestionDetailComponent implements Component {
  private questionDetail: string;
  private contentType: "article" | "question";
  private options: RenderOptions;

  constructor(
    questionDetail: string = "",
    contentType: "article" | "question" = "question",
    options: RenderOptions
  ) {
    this.questionDetail = questionDetail;
    this.contentType = contentType;
    this.options = options;
  }

  /**
   * 渲染问题详情按钮（只在问题类型下显示）
   */
  public renderButton(): string {
    // 如果是文章类型或没有问题详情，不显示按钮
    if (this.contentType === "article") {
      return "";
    }

    return `
      <button class="question-detail-btn" id="questionDetailBtn" title="查看问题简介（描述）">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path fill="currentColor" d="M13.839 17.525c-.006.002-.559.186-1.039.186c-.265 0-.372-.055-.406-.079c-.168-.117-.48-.336.054-1.4l1-1.994c.593-1.184.681-2.329.245-3.225c-.356-.733-1.039-1.236-1.92-1.416a5 5 0 0 0-.958-.097c-1.849 0-3.094 1.08-3.146 1.126a.5.5 0 0 0 .493.848c.005-.002.559-.187 1.039-.187c.263 0 .369.055.402.078c.169.118.482.34-.051 1.402l-1 1.995c-.594 1.185-.681 2.33-.245 3.225c.356.733 1.038 1.236 1.921 1.416c.314.063.636.097.954.097c1.85 0 3.096-1.08 3.148-1.126a.5.5 0 0 0-.491-.849"/><circle cx="13" cy="6.001" r="2.5" fill="currentColor"/>
        </svg>
      </button>
    `;
  }

  /**
   * 渲染问题详情弹窗
   */
  public renderModal(): string {
    // 如果是文章类型或没有问题详情，不显示弹窗
    if (this.contentType === "article") {
      return "";
    }

    // 处理问题详情内容
    let processedContent = '<p style="color: var(--vscode-descriptionForeground); text-align: center; padding: 1em;">该问题暂无简介（描述）</p>';

    if (this.questionDetail && this.questionDetail.trim()) {
      // 使用 ContentProcessor 处理问题详情内容，不包含高级功能
      processedContent = ContentProcessor.processContent(this.questionDetail, this.options, false);

      // 使用 cheerio 进一步处理内容，移除不必要的元素
      const $ = cheerio.load(processedContent);

      // LinkCard 是一个a标签，清空里面的内容，并设置其内容为 其data-text
      $("a.LinkCard").each((_, elem) => {
        const dataText = $(elem).attr("data-text") || "";
        $(elem).empty().text(dataText);
      });

      // p标签如果里面没有内容，删除该p标签
      $('p').each((_, elem) => {
        const dataText = $(elem).text().trim();
        if (!dataText) {
          $(elem).remove();
        }
      });

      // 最终输出
      processedContent = $.html();
    }

    // 媒体模式类
    const mediaModeClass =
      {
        none: "hide-media",
        mini: "mini-media",
        normal: "",
      }[this.options.mediaDisplayMode] || "";

    return `
      <!-- 问题详情弹窗 -->
      <div id="questionDetailModal" class="question-detail-modal" style="display: none;">
        <div class="question-detail-modal-overlay"></div>
        <div class="question-detail-modal-content">
          <div class="question-detail-modal-header">
            <h3>问题简介（描述）</h3>
            <button class="question-detail-close" title="点击关闭（ESC）" id="questionDetailClose">×</button>
          </div>
          <div class="question-detail-modal-body">
            <div class="question-detail-content ${mediaModeClass}" id="questionDetailContent">
              ${processedContent}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 渲染完整组件（按钮 + 弹窗）
   */
  public render(): string {
    return this.renderButton()
  }
}
