import { Component } from "./base";

/**
 * 回答排序选择组件
 * 用于在问题详情页面显示回答排序选项
 */
export class AnswerSortComponent implements Component {
  private currentSortType: "default" | "updated";
  private questionUrl: string; // 问题基础URL
  private supportTimeSort: boolean; // 是否支持时间排序

  /**
   * 构造函数
   * @param questionUrl 问题的基础URL（不带排序参数）
   * @param currentSortType 当前的排序类型
   * @param supportTimeSort 是否支持时间排序，默认为 true
   */
  constructor(
    questionUrl: string,
    currentSortType: "default" | "updated" = "default",
    supportTimeSort: boolean = true
  ) {
    this.questionUrl = questionUrl;
    this.currentSortType = currentSortType;
    this.supportTimeSort = supportTimeSort;
  }

  /**
   * 渲染排序按钮
   */
  public render(): string {
    const sortIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" width="min(1em,13px)" height="min(1em,13px)" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12 13.125a.75.75 0 0 1 .538 1.272l-4 4.125a.75.75 0 0 1-1.076 0l-4-4.125A.75.75 0 0 1 4 13.125h3.25V6a.75.75 0 1 1 1.5 0v7.125z"/><path fill="currentColor" d="M20 10.875a.75.75 0 0 0 .538-1.272l-4-4.125a.75.75 0 0 0-1.076 0l-4 4.125A.75.75 0 0 0 12 10.875h3.25V18a.75.75 0 0 0 1.5 0v-7.125z"/>
      </svg>
    `;

    const defaultSortIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="currentColor" d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/></svg>`;
    const timeSortIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-4.48-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8zm.5-13H11v6l5.25 3.15l.75-1.23l-4.5-2.67z"/></svg>`;
    const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z"/></svg>`;

    return `
      <div class="answer-sort-selector" >
        <div class="answer-sort-button" onclick="toggleAnswerSortPopover()">
          ${sortIcon}
        </div>
        <div class="answer-sort-popover" id="answerSortPopover">
          <div class="popover-overlay" onclick="toggleAnswerSortPopover()"></div>
          <div class="popover-content-wrapper">
            <div class="popover-header">
              <h3>回答排序</h3>
              <button class="popover-close" onclick="toggleAnswerSortPopover()" title="关闭">×</button>
            </div>
            <div class="popover-body">
              <div class="answer-sort-option ${
                this.currentSortType === "default" ? "active" : ""
              }"
                onclick="switchAnswerSort('default')"
                title="点击切换 -> 默认排序"
              >
                <span class="sort-option-icon">${defaultSortIcon}</span>
                <span class="sort-option-text">默认排序</span>
                ${
                  this.currentSortType === "default"
                    ? `<span class="sort-option-check">${checkIcon}</span>`
                    : ""
                }
              </div>
              ${
                this.supportTimeSort
                  ? `
                <div class="answer-sort-option ${
                  this.currentSortType === "updated" ? "active" : ""
                }"
                  onclick="switchAnswerSort('updated')"
                  title="点击切换 -> 按时间排序（由新到旧）"
                >
                  <span class="sort-option-icon">${timeSortIcon}</span>
                  <span class="sort-option-text">时间排序</span>
                  ${
                    this.currentSortType === "updated"
                      ? `<span class="sort-option-check">${checkIcon}</span>`
                      : ""
                  }
                </div>
                `
                  : ""
              }
              <div class="sort-tips">
                ✨提示：部分问题暂不支持按时间排序，此时将仅显示默认排序选项。
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
