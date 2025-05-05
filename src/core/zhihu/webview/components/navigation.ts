import { ArticleInfo, WebViewItem } from "../../../types";
import { Component } from "./base";

/**
 * 导航组件
 */
export class NavigationComponent implements Component {
  private webview: WebViewItem;
  private article: ArticleInfo;

  /**
   * 构造函数
   * @param webview Webview项
   * @param article 文章信息
   */
  constructor(webview: WebViewItem, article: ArticleInfo) {
    this.webview = webview;
    this.article = article;
  }

  /**
   * 渲染导航组件
   * @returns 导航组件HTML
   */
  public render(): string {
    // 添加导航状态信息显示
    let navInfoHtml = "";

    // 显示当前回答索引、已加载回答数和总回答数，分别显示
    let currentIndexText = `当前第 ${this.article.currentAnswerIndex + 1} 个回答`;
    let loadedText = `已加载 ${this.article.loadedAnswerCount || 1} 个回答`;
    let totalText =
      this.article.totalAnswerCount && this.article.totalAnswerCount > 0
        ? `共 ${this.article.totalAnswerCount} 个回答`
        : "";

    // 如果正在加载更多，添加指示器
    let loadingIcon = this.webview.batchConfig.isLoadingBatch
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"><!-- Icon from Material Line Icons by Vjacheslav Trushkin - https://github.com/cyberalien/line-md/blob/master/license.txt --><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="16" stroke-dashoffset="16" d="M12 3c4.97 0 9 4.03 9 9"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.3s" values="16;0"/><animateTransform attributeName="transform" dur="1.5s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/></path><path stroke-dasharray="64" stroke-dashoffset="64" stroke-opacity=".3" d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="1.2s" values="64;0"/></path></g></svg>'
      : "";

    navInfoHtml = `
      <div class="nav-info">
        <span>${currentIndexText}</span>
        <span class="separator">|</span>
        <div style="display: inline-flex; align-items: center; gap:5px">${loadedText}${loadingIcon}</div>
        ${
          totalText
            ? `<span class="separator">| </span><span>${totalText}</span>`
            : ""
        }
      </div>
    `;

    // 生成分页器
    const currentPage = this.article.currentAnswerIndex + 1;
    const totalPages = this.article.loadedAnswerCount || 1;
    const paginatorHtml = this.buildPaginatorHtml(currentPage, totalPages);

    return `
      <div class="navigation">
        <div class="navigation-buttons">
          <button class="prev" onclick="loadPreviousAnswer()"
          ${this.article.currentAnswerIndex === 0 ? "disabled" : ""}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 20 20">
              <!-- Icon from OOUI by OOUI Team - https://github.com/wikimedia/oojs-ui/blob/master/LICENSE-MIT -->
              <path fill="currentColor" d="m4 10l9 9l1.4-1.5L7 10l7.4-7.5L13 1z"/>
            </svg>
            <span>上一个</span>
          </button>
          ${paginatorHtml}
          <button class="next" onclick="loadNextAnswer()" ${
            this.article.currentAnswerIndex + 1 === this.article.loadedAnswerCount
              ? "disabled"
              : ""
          }>
            <span>下一个</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 20 20">
              <!-- Icon from OOUI by OOUI Team - https://github.com/wikimedia/oojs-ui/blob/master/LICENSE-MIT -->
              <path fill="currentColor" d="M7 1L5.6 2.5L13 10l-7.4 7.5L7 19l9-9z"/>
            </svg>
          </button>
        </div>
        ${navInfoHtml}
      </div>
    `;
  }

  /**
   * 构建分页器HTML
   * @param currentPage 当前页数
   * @param totalPages 总页数
   * @returns 分页器的HTML字符串
   */
  private buildPaginatorHtml(
    currentPage: number,
    totalPages: number
  ): string {
    if (totalPages <= 1) {
      return "";
    }

    let paginatorHtml = '<div class="paginator">';

    // 确定显示哪些页码
    const pageNumbers = this.calculateVisiblePageNumbers(
      currentPage,
      totalPages
    );

    // 生成页码按钮
    for (const item of pageNumbers) {
      if (item === "ellipsis") {
        paginatorHtml += '<span class="page-ellipsis">...</span>';
      } else {
        const isActive = item === currentPage;
        paginatorHtml += `<button class="page-button ${
          isActive ? "active-page" : ""
        }" ${
          isActive ? "disabled" : `onclick="jumpToAnswer(${item - 1})"`
        }>${item}</button>`;
      }
    }

    paginatorHtml += "</div>";
    return paginatorHtml;
  }

  /**
   * 计算应该显示哪些页码
   * @param currentPage 当前页码
   * @param totalPages 总页数
   * @returns 应该显示的页码或省略号
   */
  private calculateVisiblePageNumbers(
    currentPage: number,
    totalPages: number
  ): (number | "ellipsis")[] {
    const result: (number | "ellipsis")[] = [];

    // 如果总页数小于等于7，直接显示所有页码
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        result.push(i);
      }
      return result;
    }

    // 始终显示第一页
    result.push(1);

    // 计算中间部分的页码
    if (currentPage <= 4) {
      // 当前页靠近开始
      for (let i = 2; i <= 5; i++) {
        result.push(i);
      }
      result.push("ellipsis");
    } else if (currentPage >= totalPages - 3) {
      // 当前页靠近结束
      result.push("ellipsis");
      for (let i = totalPages - 4; i <= totalPages - 1; i++) {
        result.push(i);
      }
    } else {
      // 当前页在中间
      result.push("ellipsis");
      result.push(currentPage - 1);
      result.push(currentPage);
      result.push(currentPage + 1);
      result.push("ellipsis");
    }

    // 始终显示最后一页
    result.push(totalPages);

    return result;
  }
}