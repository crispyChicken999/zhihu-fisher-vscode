import * as vscode from "vscode";
import * as cheerio from "cheerio";
import { ZhihuArticle, ZhihuAuthor } from "../services/types";

/**
 * 导航状态接口
 */
interface NavState {
  hasPrevious: boolean;
  hasNext: boolean;
  questionId?: string;
  totalLoaded?: number; // 已加载回答数
  currentIndex?: number; // 当前回答索引（从1开始）
  totalAnswers?: number; // 问题总回答数
  isLoadingMore?: boolean; // 是否正在后台加载更多回答
}

/**
 * HTML渲染工具类，用于生成各种视图的HTML内容
 */
export class HtmlRenderer {
  /**
   * HTML转义函数
   * @param unsafe 需要转义的字符串
   * @returns 转义后的安全字符串
   */
  public static escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * 生成加载中的HTML内容
   * @param title 文章标题
   * @returns 加载中的HTML字符串
   */
  public static getLoadingHtml(title: string): string {
    return `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${this.escapeHtml(title)}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe WPC', 'Segoe UI', system-ui, 'Ubuntu', 'Droid Sans', sans-serif;
            padding: 0 20px;
            line-height: 1.6;
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
          }
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 80vh;
          }
          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 5px solid rgba(0, 0, 0, 0.1);
            border-top-color: var(--vscode-button-background);
            border-radius: 50%;
            animation: spin 1s ease-in-out infinite;
            margin-bottom: 20px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          h1, h2 {
            color: var(--vscode-editor-foreground);
          }
          .button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            border-radius: 2px;
            cursor: pointer;
            margin-top: 20px;
          }
          .button:hover {
            background-color: var(--vscode-button-hoverBackground);
          }
        </style>
      </head>
      <body>
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <h2>正在加载文章内容...</h2>
          <p>${this.escapeHtml(title)}</p>
          <button class="button" onclick="openInBrowser()">在浏览器中打开</button>
        </div>
        <script>
          const vscode = acquireVsCodeApi();

          // 通知扩展加载内容
          vscode.postMessage({ command: 'requestContent' });

          function openInBrowser() {
            vscode.postMessage({ command: 'openInBrowser' });
          }
        </script>
      </body>
      </html>
    `;
  }

  /**
   * 生成文章HTML内容
   * @param article 文章内容对象
   * @param url 文章URL
   * @param hideImages 是否隐藏图片
   * @param navState 导航状态（添加上一个/下一个回答导航功能）
   * @returns 文章内容的HTML字符串
   */
  public static getArticleHtml(
    article: ZhihuArticle,
    url: string,
    hideImages: boolean,
    navState?: NavState
  ): string {
    // 处理文章内容中的图片
    let processedContent = this.processArticleContent(
      article.content,
      hideImages
    );

    // 构建作者信息HTML
    let authorHTML = this.buildAuthorHtml(article);

    // 构建导航按钮
    let navigationHTML = this.buildNavigationHtml(navState);

    // 使用actualUrl作为来源链接（如果存在），否则使用原始URL
    const sourceUrl = article.actualUrl || url;

    return `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${this.escapeHtml(article.title)}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe WPC', 'Segoe UI', system-ui, 'Ubuntu', 'Droid Sans', sans-serif;
            padding: 0 20px;
            margin: 0 auto;
            max-width: 800px;
            line-height: 1.6;
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
          }
          h1, h2, h3, h4, h5, h6 {
            color: var(--vscode-editor-foreground);
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
          }
          h1 {
            font-size: 2em;
            padding-bottom: 0.3em;
            border-bottom: 1px solid var(--vscode-panel-border);
          }
          h2 {
            font-size: 1.5em;
            padding-bottom: 0.3em;
            border-bottom: 1px solid var (--vscode-panel-border);
          }
          a {
            color: var(--vscode-textLink-foreground);
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          code {
            font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
            background-color: var(--vscode-textCodeBlock-background);
            padding: 2px 4px;
            border-radius: 3px;
          }
          pre {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 16px;
            border-radius: 3px;
            overflow: auto;
          }
          img {
            max-width: 100%;
            height: auto;
          }
          blockquote {
            padding: 0 1em;
            color: var(--vscode-foreground);
            border-left: 0.25em solid var(--vscode-panel-border);
            margin: 0 0 16px 0;
          }
          hr {
            height: 0.25em;
            padding: 0;
            margin: 24px 0;
            background-color: var(--vscode-panel-border);
            border: 0;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 16px;
          }
          table th, table td {
            padding: 6px 13px;
            border: 1px solid var(--vscode-panel-border);
          }
          table tr {
            background-color: var(--vscode-editor-background);
            border-top: 1px solid var(--vscode-panel-border);
          }
          table tr:nth-child(2n) {
            background-color: var(--vscode-textCodeBlock-background);
          }
          .article-meta {
            color: var(--vscode-descriptionForeground);
            margin-bottom: 20px;
            font-size: 0.9em;
          }
          .article-content {
            margin-top: 20px;
          }
          .toolbar {
            display: flex;
            justify-content: space-between;
            margin: 20px 0;
            padding: 10px 0;
            border-top: 1px solid var(--vscode-panel-border);
          }
          .button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            border-radius: 2px;
            cursor: pointer;
            margin-right: 8px;
          }
          .button:hover {
            background-color: var(--vscode-button-hoverBackground);
          }
          .button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .image-display-toggle {
            margin-right: 10px;
          }
          .article-content img.formula {
            display: inline-block;
            vertical-align: middle;
          }
          .empty-container {
            display: none !important;
          }
          
          /* 导航按钮样式 */
          .navigation {
            display: flex;
            justify-content: space-between;
            margin: 20px 0;
            align-items: center;
          }
          .navigation-buttons {
            display: flex;
            gap: 10px;
          }
          .nav-info {
            color: var(--vscode-descriptionForeground);
            font-size: 0.9em;
          }

          /* 作者信息样式 */
          .author-info {
            display: flex;
            align-items: center;
            margin: 15px 0;
            padding: 10px;
            border-radius: 4px;
            background-color: var(--vscode-editor-inactiveSelectionBackground);
          }

          .author-avatar {
            margin-right: 15px;
            flex-shrink: 0;
          }

          .author-avatar img {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            object-fit: cover;
          }

          .author-details {
            flex-grow: 1;
          }

          .author-name {
            font-weight: 600;
            margin-bottom: 4px;
          }

          .author-bio {
            font-size: 0.9em;
            color: var(--vscode-descriptionForeground);
          }

          .author-link {
            cursor: pointer;
            color: var(--vscode-textLink-foreground);
          }

          .author-link:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <header>
          <h1>${this.escapeHtml(article.title)}</h1>
          <div class="article-meta">
            ${authorHTML}
            <div>来源: <a href="${sourceUrl}" target="_blank">知乎</a></div>
          </div>
        </header>
        
        ${navigationHTML}

        <div class="article-content">
          ${processedContent}
        </div>
        
        ${navigationHTML}

        <div class="toolbar">
          <div>
            <button class="button" onclick="openInBrowser()">在浏览器中打开</button>
            <button class="button" onclick="refreshContent()">刷新内容</button>
          </div>
          <div>
            <button class="button image-display-toggle" onclick="toggleImageDisplay()">
              ${hideImages ? "显示图片" : "隐藏图片"}
            </button>
          </div>
        </div>

        <script>
          const vscode = acquireVsCodeApi();

          function openInBrowser() {
            vscode.postMessage({ 
              command: 'openInBrowser', 
              url: ${article.actualUrl ? `"${article.actualUrl}"` : undefined}
            });
          }

          function refreshContent() {
            vscode.postMessage({ command: 'requestContent' });
          }

          function toggleImageDisplay() {
            vscode.postMessage({ command: 'toggleImageDisplay' });
          }

          function openAuthorPage(url) {
            vscode.postMessage({ command: 'openInBrowser', url: url });
          }

          // 上一个回答按钮点击事件
          function loadPreviousAnswer() {
            vscode.postMessage({ command: 'loadPreviousAnswer' });
          }

          // 下一个回答按钮点击事件
          function loadNextAnswer() {
            vscode.postMessage({ command: 'loadNextAnswer' });
          }

          // 处理图片加载错误，完全删除图片占位符
          document.querySelectorAll('img').forEach(img => {
            if (img.src && !img.src.startsWith('data:')) {
              img.onerror = function() {
                // 移除整个父元素如果父元素是figure或者特定的图片容器
                const parent = this.parentNode;
                if (parent && (parent.tagName.toLowerCase() === 'figure' ||
                    parent.className.includes('img-container') ||
                    parent.className.includes('image-container'))) {
                  parent.remove();
                } else {
                  // 否则只移除图片本身
                  this.remove();
                }
              };

              // 检查是否存在data-actualsrc或data-original属性
              if (!img.getAttribute('data-actualsrc-processed') && !img.getAttribute('data-original-processed')) {
                // 尝试从data-actualsrc或data-original获取真实图片URL
                const actualSrc = img.getAttribute('data-actualsrc');
                const originalSrc = img.getAttribute('data-original');

                if (actualSrc) {
                  img.setAttribute('src', actualSrc);
                } else if (originalSrc) {
                  img.setAttribute('src', originalSrc);
                }
              }

              // 对于知乎图片，添加source参数和no-referrer策略
              const src = img.getAttribute('src');
              if (src && (
                  src.includes('zhimg.com') ||
                  src.includes('pic1.zhimg.com') ||
                  src.includes('pic2.zhimg.com') ||
                  src.includes('pic3.zhimg.com') ||
                  src.includes('pic4.zhimg.com') ||
                  src.includes('picx.zhimg.com')
                )) {
                // 修改引用策略
                img.setAttribute('referrerpolicy', 'no-referrer');

                // 添加source参数（如果尚未添加）
                if (!src.includes('source=') && !src.includes('?')) {
                  img.setAttribute('src', src + '?source=1def8aca');
                } else if (!src.includes('source=') && src.includes('?')) {
                  img.setAttribute('src', src + '&source=1def8aca');
                }
              }
            }
          });

          // 查找并清理空白的图片容器
          function cleanEmptyContainers() {
            document.querySelectorAll('figure, [class*="img-container"], [class*="image-container"]').forEach(container => {
              if (container.children.length === 0 ||
                  (container.children.length === 1 && container.children[0].tagName.toLowerCase() === 'figcaption')) {
                container.classList.add('empty-container');
              }
            });
          }

          // 在DOM加载完成后执行清理
          document.addEventListener('DOMContentLoaded', cleanEmptyContainers);

          // 添加锚点滚动
          document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
              e.preventDefault();
              const targetId = this.getAttribute('href').slice(1);
              const targetElement = document.getElementById(targetId);
              if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
              }
            });
          });
        </script>
      </body>
      </html>
    `;
  }

  /**
   * 构建导航按钮HTML
   * @param navState 导航状态
   * @returns 导航按钮的HTML字符串
   */
  private static buildNavigationHtml(navState?: NavState): string {
    if (
      !navState ||
      (!navState.hasPrevious && !navState.hasNext && !navState.questionId)
    ) {
      return ""; // 如果不是问题回答或者没有导航状态，则不显示导航按钮
    }

    // 添加导航状态信息显示
    let navInfoHtml = "";
    if (navState.questionId) {
      // 显示当前回答索引、已加载回答数和总回答数，分别显示
      let currentIndexText = `当前第 ${navState.currentIndex || 1} 个回答`;
      let loadedText = `已加载 ${navState.totalLoaded || 1} 个回答`;
      let totalText =
        navState.totalAnswers && navState.totalAnswers > 0
          ? `共 ${navState.totalAnswers} 个回答`
          : "";

      // 如果正在加载更多，添加指示器
      let loadingText = navState.isLoadingMore
        ? '<span class="loading-indicator">(正在加载更多...)</span>'
        : "";

      navInfoHtml = `
        <div class="nav-info">
          <span>${currentIndexText}</span>
          <span class="separator">|</span>
          <span>${loadedText}</span>
          ${
            totalText
              ? `<span class="separator">|</span><span>${totalText}</span>`
              : ""
          }
          ${loadingText}
        </div>
      `;
    }

    return `
      <div class="navigation">
        <div class="navigation-buttons">
          ${
            !navState.hasPrevious
              ? ""
              : `<button class="button" onclick="loadPreviousAnswer()">
            上一个回答
          </button>`
          }
          <button class="button" onclick="loadNextAnswer()" ${
            !navState.hasNext && !navState.questionId ? "disabled" : ""
          }>
            下一个回答
          </button>
        </div>
        ${navInfoHtml}
      </div>
    `;
  }

  /**
   * 处理文章内容，包括图片处理
   * @param content 原始文章内容
   * @param hideImages 是否隐藏图片
   * @returns 处理后的文章内容
   */
  private static processArticleContent(
    content: string,
    hideImages: boolean
  ): string {
    // 如果启用无图模式，处理HTML内容
    if (hideImages) {
      // 使用cheerio解析HTML并删除所有图片标签
      const $ = cheerio.load(content);
      $("img").each(function () {
        $(this).remove(); // 完全删除图片标签，不保留占位符
      });

      // 同时清理可能导致空白的figure和其他包装元素
      $("figure").each(function () {
        if ($(this).children().length === 0) {
          $(this).remove();
        }
      });
      $('[class*="img-container"], [class*="image-container"]').each(
        function () {
          if ($(this).children().length === 0) {
            $(this).remove();
          }
        }
      );

      return $.html();
    } else {
      // 处理知乎特有的图片属性：data-actualsrc
      const $ = cheerio.load(content);
      $("img").each(function () {
        const actualSrc = $(this).attr("data-actualsrc");
        const originalSrc = $(this).attr("data-original");

        // 优先使用 data-actualsrc
        if (actualSrc) {
          $(this).attr("src", actualSrc);
          $(this).attr("data-actualsrc-processed", "true");
        }
        // 其次使用 data-original
        else if (originalSrc) {
          $(this).attr("src", originalSrc);
          $(this).attr("data-original-processed", "true");
        }

        // 添加no-referrer属性以避免跨域问题
        $(this).attr("referrerpolicy", "no-referrer");
      });

      return $.html();
    }
  }

  /**
   * 构建作者信息的HTML
   * @param article 文章对象
   * @returns 作者信息的HTML
   */
  private static buildAuthorHtml(article: ZhihuArticle): string {
    if (!article.author) {
      return "";
    }

    const author = article.author;
    let authorHTML = `<div class="author-info">`;

    // 如果有作者头像，显示头像
    if (author.avatar) {
      authorHTML += `
        <div class="author-avatar">
          <img src="${author.avatar}" alt="${this.escapeHtml(
        author.name
      )}" referrerpolicy="no-referrer">
        </div>
      `;
    }

    // 作者名称和简介
    // 如果有作者URL，将作者名字设为可点击链接
    const authorNameHTML = author.url
      ? `<div class="author-name"><a href="${
          author.url
        }" onclick="openAuthorPage('${
          author.url
        }')" class="author-link">${this.escapeHtml(author.name)}</a></div>`
      : `<div class="author-name">${this.escapeHtml(author.name)}</div>`;

    authorHTML += `
      <div class="author-details">
        ${authorNameHTML}
        ${
          author.bio
            ? `<div class="author-bio">${this.escapeHtml(
                author.bio
              )}</div>`
            : ""
        }
      </div>
    </div>`;

    return authorHTML;
  }
}
