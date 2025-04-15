import * as vscode from "vscode";
import * as cheerio from "cheerio";
import { ZhihuArticle, ZhihuHotItem, ZhihuService } from "./zhihuService";

// 文章视图状态接口
interface ArticleViewState {
  webviewPanel: vscode.WebviewPanel;
  article: ZhihuArticle;
  url: string;
  isLoading: boolean;
}

// 文章视图管理类
export class ArticleViewManager {
  private static instance: ArticleViewManager;
  private zhihuService: ZhihuService;
  private activeViews: Map<string, ArticleViewState> = new Map();

  private constructor() {
    this.zhihuService = new ZhihuService();
  }

  // 单例模式
  public static getInstance(): ArticleViewManager {
    if (!ArticleViewManager.instance) {
      ArticleViewManager.instance = new ArticleViewManager();
    }
    return ArticleViewManager.instance;
  }

  // 打开文章
  public async openArticle(item: ZhihuHotItem): Promise<void> {
    try {
      // 检查是否已经打开了这篇文章
      const existingView = this.activeViews.get(item.id);
      if (existingView) {
        // 如果已打开，激活对应的面板
        existingView.webviewPanel.reveal();
        return;
      }

      // 创建并配置WebView面板
      const panel = vscode.window.createWebviewPanel(
        "zhihuArticle",
        `加载中: ${item.title}`,
        vscode.ViewColumn.Two,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [
            vscode.Uri.joinPath(vscode.Uri.file(__dirname), "../../../media"),
          ],
        }
      );

      // 初始化文章状态
      const viewState: ArticleViewState = {
        webviewPanel: panel,
        article: { title: item.title, content: "正在加载内容..." },
        url: item.url,
        isLoading: true,
      };

      this.activeViews.set(item.id, viewState);

      // 在WebView中显示正在加载状态
      panel.webview.html = this.getLoadingHtml(item.title);

      // 处理WebView关闭事件
      panel.onDidDispose(
        () => {
          this.activeViews.delete(item.id);
        },
        null,
        []
      );

      // 处理WebView消息
      panel.webview.onDidReceiveMessage(async (message) => {
        switch (message.command) {
          case "requestContent":
            await this.loadArticleContent(item, viewState);
            break;
          case "openInBrowser":
            // 如果提供了特定的URL（如作者页面），则打开该URL，否则打开文章URL
            if (message.url) {
              vscode.env.openExternal(vscode.Uri.parse(message.url));
            } else {
              vscode.env.openExternal(vscode.Uri.parse(item.url));
            }
            break;
          case "toggleImageDisplay":
            this.toggleImageDisplay(viewState);
            break;
        }
      });

      // 异步加载文章内容
      await this.loadArticleContent(item, viewState);
    } catch (error) {
      vscode.window.showErrorMessage(`无法打开文章: ${error}`);
    }
  }

  // 加载文章内容
  private async loadArticleContent(
    item: ZhihuHotItem,
    viewState: ArticleViewState
  ): Promise<void> {
    try {
      // 已经加载过内容并且正在加载中，避免重复请求
      if (
        viewState.isLoading &&
        viewState.article.content !== "正在加载内容..."
      ) {
        return;
      }

      viewState.isLoading = true;

      // 获取配置中的无图片模式设置
      const config = vscode.workspace.getConfiguration("zhihu-fisher");
      const hideImages = config.get<boolean>("hideImages", false);

      // 显示状态栏加载提示
      const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
      );
      statusBarItem.text = `$(sync~spin) 加载文章: ${item.title}`;
      statusBarItem.show();

      try {
        console.log(`开始从ArticleViewManager获取文章内容: ${item.url}`);
        // 获取文章内容
        const article = await this.zhihuService.getArticleContent(
          item.url,
          hideImages
        );

        // 更新状态
        viewState.article = article;
        viewState.isLoading = false;

        // 更新面板标题
        viewState.webviewPanel.title = article.title || item.title;

        // 更新内容
        this.updateWebviewContent(viewState);
        console.log(`成功加载并显示文章内容: ${article.title}`);
      } catch (error) {
        console.error("加载文章内容失败:", error);
        viewState.isLoading = false;

        // 显示错误信息
        viewState.article = {
          title: item.title,
          content: `加载文章内容失败: ${
            error instanceof Error ? error.message : String(error)
          }\n\n可能需要更新Cookie或者稍后再试。`,
        };

        this.updateWebviewContent(viewState);
      } finally {
        statusBarItem.dispose();
      }
    } catch (error) {
      viewState.isLoading = false;
      console.error("处理文章加载失败:", error);
      vscode.window.showErrorMessage(
        `加载文章内容时出错: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // 更新Webview内容
  private updateWebviewContent(viewState: ArticleViewState): void {
    if (!viewState.webviewPanel) {
      return;
    }

    viewState.webviewPanel.webview.html = this.getArticleHtml(
      viewState.article,
      viewState.url
    );
  }

  // 生成加载中的HTML
  private getLoadingHtml(title: string): string {
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

  // 生成文章HTML
  private getArticleHtml(article: ZhihuArticle, url: string): string {
    // 获取当前的图片显示设置
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const hideImages = config.get<boolean>("hideImages", false);

    // 如果启用无图模式，处理HTML内容
    let processedContent = article.content;
    if (hideImages) {
      // 使用cheerio解析HTML并删除所有图片标签
      const $ = cheerio.load(article.content);
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

      processedContent = $.html();
    } else {
      // 处理知乎特有的图片属性：data-actualsrc
      const $ = cheerio.load(article.content);
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

      processedContent = $.html();
    }

    // 构建作者信息HTML
    let authorHTML = "";
    if (article.author) {
      authorHTML = `<div class="author-info">`;

      // 如果有作者头像，显示头像
      if (article.authorAvatar) {
        authorHTML += `
          <div class="author-avatar">
            <img src="${article.authorAvatar}" alt="${this.escapeHtml(
          article.author
        )}" referrerpolicy="no-referrer">
          </div>
        `;
      }

      // 作者名称和简介
      // 如果有作者URL，将作者名字设为可点击链接
      const authorNameHTML = article.authorUrl
        ? `<div class="author-name"><a href="${
            article.authorUrl
          }" onclick="openAuthorPage('${
            article.authorUrl
          }')" class="author-link">${this.escapeHtml(article.author)}</a></div>`
        : `<div class="author-name">${this.escapeHtml(article.author)}</div>`;

      authorHTML += `
        <div class="author-details">
          ${authorNameHTML}
          ${
            article.authorBio
              ? `<div class="author-bio">${this.escapeHtml(
                  article.authorBio
                )}</div>`
              : ""
          }
        </div>
      </div>`;
    }
    
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
          }
          .button:hover {
            background-color: var(--vscode-button-hoverBackground);
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

        <div class="article-content">
          ${processedContent}
        </div>

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

  // HTML转义函数
  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // 切换图片显示状态
  private async toggleImageDisplay(viewState: ArticleViewState): Promise<void> {
    // 获取当前配置
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const currentValue = config.get<boolean>("hideImages", false);

    // 切换值
    await config.update(
      "hideImages",
      !currentValue,
      vscode.ConfigurationTarget.Global
    );

    // 提示用户
    const statusText = !currentValue ? "已启用无图模式" : "已启用图片显示模式";
    vscode.window.showInformationMessage(statusText);

    // 重新加载文章内容（不触发网络请求，仅重新处理已获取的内容）
    this.updateWebviewContent(viewState);
  }
}
