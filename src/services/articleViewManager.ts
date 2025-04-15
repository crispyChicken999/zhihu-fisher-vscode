import * as vscode from "vscode";
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
            vscode.env.openExternal(vscode.Uri.parse(item.url));
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
      // 检查是否正在加载，但允许首次加载
      // 注释下一行来修复初次加载不执行的问题
      // if (viewState.isLoading) {
      //   return;
      // }
      
      // 已经加载过内容并且正在加载中，避免重复请求
      if (viewState.isLoading && viewState.article.content !== "正在加载内容...") {
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
            border-bottom: 1px solid var(--vscode-panel-border);
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
          .article-cover {
            margin-top: 20px;
            text-align: center;
          }
          .article-content img.formula {
            display: inline-block;
            vertical-align: middle;
          }
        </style>
      </head>
      <body>
        <header>
          <h1>${this.escapeHtml(article.title)}</h1>
          <div class="article-meta">
            ${
              article.author
                ? `<div>作者: ${this.escapeHtml(article.author)}</div>`
                : ""
            }
            <div>来源: <a href="${url}" target="_blank">知乎</a></div>
          </div>
        </header>
        
        <div class="article-content">
          ${article.content}
        </div>
        
        <div class="toolbar">
          <button class="button" onclick="openInBrowser()">在浏览器中打开</button>
          <button class="button" onclick="refreshContent()">刷新内容</button>
        </div>
        
        <script>
          const vscode = acquireVsCodeApi();
          
          function openInBrowser() {
            vscode.postMessage({ command: 'openInBrowser' });
          }
          
          function refreshContent() {
            vscode.postMessage({ command: 'requestContent' });
          }
          
          // 调整图片链接，避免跨域问题
          document.querySelectorAll('img').forEach(img => {
            if (img.src && !img.src.startsWith('data:')) {
              img.onerror = function() {
                this.style.display = 'none';
              };
            }
          });
          
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
}
