import * as vscode from "vscode";
import * as cheerio from "cheerio";
import { Store } from "../../stores";
import { AnswerAuthor, ArticleInfo, WebViewItem } from "../../types";

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
  public static getLoadingHtml(title: string, excerpt: string): string {
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
            flex: 0 0 auto;
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
          <h3 style="text-align:center;max-width:500px;">${this.escapeHtml(
            title
          )}</h3>
          <div style="border: 1px solid var(--vscode-panel-border); width: 100%; margin: 10px;"></div>
          <p style="text-align:center;max-width:500px;">${this.escapeHtml(
            excerpt
          )}</p>
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
  public static getArticleHtml(webviewId: string): string {
    // 获取文章对象
    const webview = Store.webviewMap.get(webviewId) as WebViewItem;
    const article = webview.article;
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const hideImages = config.get<boolean>("hideImages", false);

    // 当前的回答
    const currentAnswer = article.answerList[article.currentAnswerIndex];

    // 处理文章内容中的图片
    let processedContent = this.processArticleContent(
      currentAnswer?.content,
      hideImages
    );

    // 构建作者信息HTML
    let authorHTML = this.buildAuthorHtml(currentAnswer?.author);

    // 构建导航按钮
    let navigationHTML = this.buildNavigationHtml(webview, article);

    // 回答的来源URL
    const sourceUrl = currentAnswer?.url || webview.url || "";

    return `
      <!DOCTYPE html>
      <html lang="zh-CN">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${this.escapeHtml(article.title)}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe WPC", "Segoe UI",
                system-ui, "Ubuntu", "Droid Sans", sans-serif;
              padding: 0 20px;
              margin: 0 auto;
              max-width: 800px;
              line-height: 1.6;
              color: var(--vscode-foreground);
              background-color: var(--vscode-editor-background);
            }
            h1,
            h2,
            h3,
            h4,
            h5,
            h6 {
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
              font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
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
            table th,
            table td {
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
            .article-meta.hide-avatar .author-avatar {
              display: none;
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
              padding: 6px 12px;
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
              text-align: center;
            }
            .article-content.hide-image img {
              display: none;
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
              box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px,
                rgba(0, 0, 0, 0.3) 0px 7px 13px -3px,
                rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
            }

            .author-avatar {
              margin-right: 15px;
              flex-shrink: 0;
            }

            .author-avatar img {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              object-fit: cover;
            }

            .author-details {
              flex-grow: 1;
            }

            .author-name {
              font-weight: 600;
              margin-bottom: 4px;
              display: flex;
              align-items: center;
              gap: 5px;
            }

            .author-name .author-fans {
              color: var(--vscode-descriptionForeground);
              font-size: 0.9em;
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
            <h3>${this.escapeHtml(article.title)}</h3>
            <div class="article-meta${hideImages ? " hide-avatar" : ""}">
              ${authorHTML}
              <div>来源: <a href="${sourceUrl}" target="_blank">知乎</a></div>
            </div>
          </header>

          ${navigationHTML}

          <div class="article-content${
            hideImages ? " hide-image" : ""
          }"">${processedContent}</div>

          ${navigationHTML}

          <div class="toolbar">
            <div>
              <button class="button" onclick="openInBrowser()">在浏览器中打开</button>
              <button class="button" onclick="backTop()">回到顶部</button>
              <button class="button" onclick="refreshContent()" style="display: none">
                刷新内容
              </button>
            </div>
            <div>
              <button
                class="button image-display-toggle"
                onclick="toggleImageDisplay()"
              >
                ${hideImages ? "显示图片" : "隐藏图片"}
              </button>
            </div>
          </div>
          <script>
            const vscode = acquireVsCodeApi();

            function backTop() {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }

            function openInBrowser() {
              vscode.postMessage({
                command: "openInBrowser",
                url: "${sourceUrl}",
              });
            }

            function refreshContent() {
              vscode.postMessage({ command: "requestContent" });
            }

            function toggleImageDisplay() {
              // 向扩展发送消息
              vscode.postMessage({ command: "toggleImageDisplay" });

              // 在前端立即切换图片显示状态
              // const allImages = document.querySelectorAll(".article-content img");
              // const isHidden =
              //   allImages.length > 0 &&
              //   window.getComputedStyle(allImages[0]).display === "none";

              // allImages.forEach((img) => {
              //   img.style.display = isHidden ? "inline" : "none";
              // });

              // 更新按钮文本
              // const toggleButton = document.querySelector(".image-display-toggle");
              // if (toggleButton) {
              //   toggleButton.textContent = isHidden ? "隐藏图片" : "显示图片";
              // }
            }

            function openAuthorPage(url) {
              vscode.postMessage({ command: "openInBrowser", url: url });
            }

            // 上一个回答按钮点击事件
            function loadPreviousAnswer() {
              vscode.postMessage({ command: "loadPreviousAnswer" });
            }

            // 下一个回答按钮点击事件
            function loadNextAnswer() {
              vscode.postMessage({ command: "loadNextAnswer" });
            }
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
  private static buildNavigationHtml(
    webview: WebViewItem,
    article: ArticleInfo
  ): string {
    // 添加导航状态信息显示
    let navInfoHtml = "";

    // 显示当前回答索引、已加载回答数和总回答数，分别显示
    let currentIndexText = `当前第 ${article.currentAnswerIndex + 1} 个回答`;
    let loadedText = `已加载 ${article.loadedAnswerCount || 1} 个回答`;
    let totalText =
      article.totalAnswerCount && article.totalAnswerCount > 0
        ? `共 ${article.totalAnswerCount} 个回答`
        : "";

    // 如果正在加载更多，添加指示器
    let loadingIcon = webview.batchConfig.isLoadingBatch
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

    return `
      <div class="navigation">
        <div class="navigation-buttons">
          <button class="button" onclick="loadPreviousAnswer()"
          ${article.currentAnswerIndex === 0 ? "disabled" : ""}
          >
            上一个回答
          </button>
          <button class="button" onclick="loadNextAnswer()" ${
            article.currentAnswerIndex + 1 === article.loadedAnswerCount
              ? "disabled"
              : ""
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
    if (!content) {
      return "正在加载中，请稍候..."; // 返回加载提示
    }

    // 如果启用无图模式，处理HTML内容
    if (hideImages) {
      // 使用cheerio解析HTML并删除所有图片标签
      const $ = cheerio.load(content);
      $("img").each(function () {
        $(this).remove(); // 完全删除图片标签，不保留占位符
      });

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
   * @param author 作者信息
   * @returns 作者信息的HTML
   */
  private static buildAuthorHtml(author: AnswerAuthor): string {
    if (!author) {
      return "";
    }

    const authorName = author.name;
    const authorAvatar = author.avatar || ""; // 使用默认头像URL
    const authorBio = author.signature || ""; // 使用默认签名
    const authorFollowersCount = author.followersCount || 0; // 使用默认粉丝数
    const authorUrl = author.url || ""; // 使用默认作者主页URL
    let authorHTML = `<div class="author-info">`;

    // 如果有作者头像，显示头像
    if (author.avatar) {
      authorHTML += `
        <div class="author-avatar">
          <img src="${authorAvatar}" alt="${this.escapeHtml(
        authorName
      )}" referrerpolicy="no-referrer" />
        </div>
      `;
    }

    // 作者名称和简介
    // 如果有作者URL，将作者名字设为可点击链接
    const authorTitleHtml = `<div class="author-name">
          ${
            authorUrl
              ? `<a href="${authorUrl}" onclick="openAuthorPage('${authorUrl}')" class="author-link">${this.escapeHtml(
                  authorName
                )}</a>`
              : this.escapeHtml(authorName)
          }
          <span>|</span>
          <span class="author-fans">粉丝数:${authorFollowersCount}</span>
        </div>`;

    authorHTML += `
      <div class="author-details">
        ${authorTitleHtml}
        ${
          authorBio
            ? `<div class="author-bio">${this.escapeHtml(authorBio)}</div>`
            : ""
        }
      </div>
    </div>`;

    return authorHTML;
  }
}
