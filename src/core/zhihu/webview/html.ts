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
            min-height: 500px;
            overflow: auto;
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
          <div style="border: 1px solid var(--vscode-panel-border); width: 80%; max-width:500px; margin: 10px 50px;"></div>
          <p style="text-align:center;max-width:500px;max-height:200px;overflow:auto;">${this.escapeHtml(
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

    // 构建回答元数据HTML（点赞数、评论数、发布时间和更新时间）
    let answerMetaHTML = this.buildAnswerMetaHtml(currentAnswer);

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
              flex-wrap: wrap;
            }
            .navigation-buttons {
              display: flex;
              gap: 10px;
            }
            .navigation-buttons .prev,
            .navigation-buttons .next {
              background-color: var(--vscode-button-background);
              color: var(--vscode-button-foreground);
              border: none;
              padding: 0 8px;
              border-radius: 2px;
              cursor: pointer;
              margin: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              flex-wrap: nowrap;
            }
            .navigation-buttons .prev:disabled,
            .navigation-buttons .next:disabled {
              background-color: var(--vscode-button-secondaryBackground);
              color: var(--vscode-button-secondaryForeground);
              cursor: not-allowed;
            }
            .nav-info {
              color: var(--vscode-descriptionForeground);
              font-size: 0.9em;
              display: flex;
              align-items: center;
              flex-wrap: nowrap;
              padding: 4px 0;
            }
            .nav-info > * {
              white-space: nowrap;
              display: flex;
              align-items: center;
              flex-shrink: 0;
            }
            .nav-info .separator {
              margin: 0 8px;
              opacity: 0.7;
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
              display: flex;
              align-items: center;
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

            /* 分页器样式 */
            .paginator {
              display: flex;
              align-items: center;
              gap: 5px;
            }

            .page-button {
              min-width: 30px;
              height: 30px;
              background-color: var(--vscode-button-secondaryBackground);
              color: var(--vscode-button-secondaryForeground);
              border: none;
              border-radius: 2px;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 0 8px;
            }

            .page-button:hover:not(.active-page):not(:disabled) {
              background-color: var(--vscode-button-secondaryHoverBackground);
            }

            .active-page {
              background-color: var(--vscode-button-background);
              color: var(--vscode-button-foreground);
              font-weight: bold;
            }

            .page-ellipsis {
              margin: 0 2px;
              color: var(--vscode-descriptionForeground);
            }

            /* 回答元数据样式 */
            .answer-meta {
              width: fit-content;
              display: flex;
              align-items: center;
              flex-wrap: wrap;
              gap: 16px;
              margin: 12px 0;
              padding: 6px 10px;
              border-radius: 4px;
              background-color: var(--vscode-editor-inactiveSelectionBackground);
              color: var(--vscode-descriptionForeground);
            }

            .meta-item {
              display: flex;
              align-items: center;
              gap: 5px;
            }

            .meta-item svg {
              opacity: 0.8;
            }

            .meta-item.like {
              color: #e53935;
            }

            .meta-item.comment {
              color: #42a5f5;
            }

            .meta-item.time {
              color: var(--vscode-descriptionForeground);
              display: flex;
              gap: 5px;
              overflow-x: auto;
            }

            .meta-item.time .update-time {
              opacity: 0.8;
              font-size: 0.9em;
            }
          </style>
        </head>
        <body>
          <header>
            <h3>${this.escapeHtml(article.title)}</h3>
            <div class="article-meta${hideImages ? " hide-avatar" : ""}">
              ${authorHTML}
              <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: space-between; align-items: center;">
                <div>来源: <a href="${sourceUrl}" target="_blank">知乎</a></div>
                <div class="tips" style="display:flex; justify-content: center; align-items: center;gap: 5px;">
                  <svg
                    t="1745309855325"
                    class="icon"
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    p-id="6781"
                    width="12"
                    height="12"
                  >
                    <path
                      d="M512 0.021489c-282.758945 0-511.978511 229.219565-511.978511 511.978511s229.219565 511.978511 511.978511 511.978511c282.752806 0 511.978511-229.219565 511.978511-511.978511S794.752806 0.021489 512 0.021489zM650.535193 799.341311c-30.110785 10.406001-53.770648 18.430768-71.779813 24.12035-17.759479 5.683443-38.609343 8.524141-62.269205 8.524141-36.280298 0-64.599274-8.057513-84.656075-23.679305-20.332071-16.089443-30.366611-35.953863-30.366611-60.573587 0-9.465582 0.76748-18.936281 2.297322-28.869514 1.567705-9.93221 4.121877-21.304212 7.225565-33.617655l37.547151-118.810966c3.353374-11.340279 1.453095-21.74628 3.78828-32.177863 2.316765-9.93221 3.333932-19.397792 3.333932-27.429723 0-15.647375 1.433652-26.053376-5.528923-31.742958-7.219425-6.15007-20.312628-4.383844-40.139186-4.383844-9.804297 0-19.832697 1.408069-29.854958 3.776-10.290367 2.847861-19.032472 0.607844-26.251897 3.455705l10.060123-36.926004c24.427342-8.997931 48.087205-16.562211 70.499657-22.719444 22.39301-6.617721 43.722804-9.458419 63.549362-9.458419 36.274158 0 64.09376 7.583722 83.631746 23.205515 19.551288 15.621792 41.169655 35.960003 41.169655 60.579727 0 5.215792-0.800225 14.213723-2.080382 27.461445-1.274016 12.773931-3.858888 24.613584-7.468089 35.486212L563.843762 673.880901c-2.847861 9.465582-5.65786 20.363793-7.986905 32.677237-2.585895 11.839653-3.858888 21.304212-3.858888 27.455305 0 15.621792 4.114714 26.494421 11.845793 32.184003 7.980765 5.65786 21.618367 8.498558 40.900525 8.498558 9.011234 0 19.321044-1.408069 30.878265-4.224208 11.564383-2.841721 19.800975-5.215792 24.946159-7.589862L650.535193 799.341311zM643.860167 319.355445c-17.240663 14.681374-38.315654 21.771863-62.768579 21.771863-24.434505 0-45.540196-7.090489-63.305815-21.771863-17.496489-14.213723-26.238594-31.710212-26.238594-52.547797 0-20.369933 8.742105-37.893029 26.238594-52.547797 17.765619-14.655791 38.872333-22.245653 63.305815-22.245653 24.421202 0 45.527916 7.55814 62.768579 22.245653 17.496489 14.681374 26.258037 32.209586 26.258037 52.547797C670.118204 287.644209 661.356656 305.141722 643.860167 319.355445z"
                      fill="var(--vscode-descriptionForeground)"
                      p-id="6782"
                    ></path>
                  </svg>
                  <div style="display: inline-flex; align-items: center; gap: 5px;">
                    <span>键盘</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><!-- Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE --><path fill="currentColor" d="m7 12l5-5v3h4v4h-4v3zm14-7v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2m-2 0H5v14h14z"/></svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><!-- Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE --><path fill="currentColor" d="m17 12l-5 5v-3H8v-4h4V7zM3 19V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2m2 0h14V5H5z"/></svg>
                    <span>切换上/下一条，</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><!-- Icon from Remix Icon by Remix Design - https://github.com/Remix-Design/RemixIcon/blob/master/License --><path fill="currentColor" d="M5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3zM4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm5.723 13L16.58 6h-2.303L7.42 18z"/></svg>
                    <span>显示/隐藏图片</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          ${navigationHTML}

          ${answerMetaHTML}

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

            // 跳转到指定回答
            function jumpToAnswer(index) {
              vscode.postMessage({ command: "jumpToAnswer", index: index });
            }

            // 在页面加载完成后自动设置焦点
            window.addEventListener("load", function() {
              // 或者也可以创建并聚焦一个隐藏的可聚焦元素
              const letsFocus = document.createElement('div');
              letsFocus.tabIndex = -1; // 使元素可聚焦
              letsFocus.style.outline = 'none'; // 隐藏焦点轮廓
              letsFocus.style.position = 'absolute'; // 绝对定位
              document.body.appendChild(letsFocus);
              letsFocus.focus();
              window.scrollTo(0, 0); // 滚动到顶部
            });

            // 监听键盘事件
            document.addEventListener("keyup", (event) => {
              // 只有当文档可见且不在输入框内时才处理键盘事件
              if (
                event.target.tagName === "INPUT" ||
                event.target.tagName === "TEXTAREA"
              ) {
                return;
              }

              // 检查是否为左右箭头键
              if (event.key === "ArrowLeft") {
                // 左箭头：上一个回答
                const prevButton = document.querySelector(".navigation-buttons .prev");
                if (prevButton && !prevButton.disabled) {
                  loadPreviousAnswer();
                  event.preventDefault(); // 阻止默认行为
                }
              } else if (event.key === "ArrowRight") {
                // 右箭头：下一个回答
                const nextButton = document.querySelector(".navigation-buttons .next");
                if (nextButton && !nextButton.disabled) {
                  loadNextAnswer();
                  event.preventDefault(); // 阻止默认行为
                }
              } else if (event.key === "/") {
                toggleImageDisplay();
                event.preventDefault(); // 阻止默认行为
              }
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

    // 生成分页器
    const currentPage = article.currentAnswerIndex + 1;
    const totalPages = article.loadedAnswerCount || 1;
    const paginatorHtml = this.buildPaginatorHtml(currentPage, totalPages);

    return `
      <div class="navigation">
        <div class="navigation-buttons">
          <button class="prev" onclick="loadPreviousAnswer()"
          ${article.currentAnswerIndex === 0 ? "disabled" : ""}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 20 20">
              <!-- Icon from OOUI by OOUI Team - https://github.com/wikimedia/oojs-ui/blob/master/LICENSE-MIT -->
              <path fill="currentColor" d="m4 10l9 9l1.4-1.5L7 10l7.4-7.5L13 1z"/>
            </svg>
            <span>上一个</span>
          </button>
          ${paginatorHtml}
          <button class="next" onclick="loadNextAnswer()" ${
            article.currentAnswerIndex + 1 === article.loadedAnswerCount
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
  private static buildPaginatorHtml(
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
  private static calculateVisiblePageNumbers(
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
    // 使用cheerio解析HTML并删除所有图片标签
    const $ = cheerio.load(content);
    $(".GifPlayer").remove(); // 删除GifPlayer元素

    // 如果启用无图模式，处理HTML内容
    if (hideImages) {
      $("img").each(function () {
        $(this).remove(); // 完全删除图片标签，不保留占位符
      });
      return $.html();
    } else {
      /** @todo 待优化应该可以删除，估计没影响 */
      // 处理知乎特有的图片属性：data-actualsrc
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
          <div class="author-fans" title="粉丝数 ${authorFollowersCount}">
            <svg t="1745304361368" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4733" width="12" height="12">
              <path fill="#FFFFFF" d="M479.352471 60.235294a260.999529 260.999529 0 1 1 0 522.059294 293.647059 293.647059 0 0 0-293.647059 293.647059 32.647529 32.647529 0 0 1-65.234824 0 359.002353 359.002353 0 0 1 222.569412-332.137412A260.999529 260.999529 0 0 1 479.412706 60.235294z m0 65.234824a195.764706 195.764706 0 1 0 0 391.529411 195.764706 195.764706 0 0 0 0-391.529411zM767.578353 614.881882c26.624 0 51.440941 11.143529 69.872941 31.322353 17.709176 19.395765 27.407059 44.875294 27.407059 71.920941 0 32.888471-15.36 57.103059-25.6 73.065412-11.745882 18.432-30.72 40.056471-56.500706 64.331294l-11.444706 10.541177a742.701176 742.701176 0 0 1-45.477647 38.249412 35.177412 35.177412 0 0 1-37.526588 3.011764l-4.758588-3.072c-0.903529-0.722824-21.383529-16.504471-45.357177-38.249411-31.623529-28.611765-54.512941-53.850353-67.945412-74.932706-6.144-9.637647-12.047059-19.275294-16.805647-30.418824a107.941647 107.941647 0 0 1 18.612706-114.447059 93.967059 93.967059 0 0 1 69.872941-31.322353c22.166588 0 43.851294 8.131765 61.018353 22.829177l1.807059 1.505882 1.807059-1.505882a94.268235 94.268235 0 0 1 61.018353-22.829177z m0 52.224a41.381647 41.381647 0 0 0-22.467765 6.866824l-5.12 3.794823-35.237647 29.394824-35.719529-29.756235a42.104471 42.104471 0 0 0-27.105883-10.300236 41.863529 41.863529 0 0 0-31.382588 14.396236 55.717647 55.717647 0 0 0-9.035294 58.789647c2.650353 6.204235 5.963294 12.047059 12.709647 22.708706 10.541176 16.504471 30.479059 38.490353 59.030588 64.331294l14.817883 13.071059 16.685176 13.974588 1.264941-0.90353c6.625882-5.421176 15.239529-12.709647 23.853177-20.359529l6.445176-5.722353c28.491294-25.840941 48.429176-47.766588 59.030589-64.391529 12.769882-19.877647 17.347765-30.72 17.347764-44.875295a53.970824 53.970824 0 0 0-13.733647-36.623058 41.803294 41.803294 0 0 0-31.322353-14.396236z" p-id="4734"></path>
            </svg>
            <span>${authorFollowersCount}</span>
          </div>
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

  /**
   * 构建回答元数据的HTML
   * @param answer 回答数据
   * @returns 回答元数据的HTML字符串
   */
  private static buildAnswerMetaHtml(answer: any): string {
    if (!answer) {
      return "";
    }

    // 格式化数字，如果大于1000则显示为 1k、2k 等
    const formatNumber = (num: number): string => {
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + "w";
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + "k";
      }
      return num.toString();
    };

    // 美化时间格式，只保留年月日和时分
    const formatDateTime = (dateTimeStr: string): string => {
      if (!dateTimeStr) {
        return "";
      }

      // 尝试解析日期字符串
      try {
        // 如果已经是本地化格式，直接使用
        if (dateTimeStr.includes("/")) {
          return dateTimeStr.split(" ")[0];
        }

        const date = new Date(dateTimeStr);
        return date.toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (error) {
        return dateTimeStr; // 如果解析出错，返回原字符串
      }
    };

    const likeCount = formatNumber(answer.likeCount || 0);
    const commentCount = formatNumber(answer.commentCount || 0);
    const publishTime = formatDateTime(answer.publishTime || "");
    const updateTime = formatDateTime(answer.updateTime || "");
    const isUpdated =
      answer.publishTime !== answer.updateTime && answer.updateTime;

    return `
      <div class="answer-meta">
        <div class="meta-item like" title="赞同数 ${answer.likeCount}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
            <!-- Icon from Myna UI Icons by Praveen Juge - https://github.com/praveenjuge/mynaui-icons/blob/main/LICENSE -->
            <path
              fill="currentColor"
              d="M4.148 9.175c-.55.294-.898.865-.898 1.493v9.385c0 .95.78 1.697 1.714 1.697h12.521c.579 0 1.024-.404 1.304-.725c.317-.362.618-.847.894-1.383c.557-1.08 1.08-2.494 1.459-3.893c.376-1.392.628-2.832.607-3.956c-.01-.552-.087-1.11-.312-1.556c-.247-.493-.703-.882-1.364-.882h-5.25c.216-.96.51-2.497.404-3.868c-.059-.758-.246-1.561-.723-2.189c-.509-.668-1.277-1.048-2.282-1.048c-.582 0-1.126.31-1.415.822m0 0l-1.28 2.266c-.512.906-1.3 1.58-2.258 2.176c-.638.397-1.294.727-1.973 1.07a50 50 0 0 0-1.148.591"
            />
          </svg>
          <span>${likeCount}</span>
        </div>
        <div class="meta-item comment" title="评论数 ${answer.commentCount}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
            <!-- Icon from IconaMoon by Dariush Habibpour - https://creativecommons.org/licenses/by/4.0/ -->
            <g fill="none">
              <path fill="currentColor" d="M12 21a9 9 0 1 0-9-9c0 1.488.36 2.89 1 4.127L3 21l4.873-1c1.236.639 2.64 1 4.127 1" opacity=".16"/>
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9 9 0 1 0-9-9c0 1.488.36 2.89 1 4.127L3 21l4.873-1c1.236.639 2.64 1 4.127 1"/>
            </g>
          </svg>
          <span>${commentCount}</span>
        </div>
        <div class="meta-item time">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-1-13h2v6h-6v-2h4z"/>
          </svg>
          <span title="发布时间">${publishTime}</span>
          ${
            isUpdated
              ? `<span class="update-time">(更新于：${updateTime})</span>`
              : ""
          }
        </div>
      </div>
    `;
  }
}
