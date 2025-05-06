import * as vscode from "vscode";
import { Store } from "../../stores";
import { ArticleInfo, WebViewItem } from "../../types";
import { AuthorComponent } from "./components/author";
import { NavigationComponent } from "./components/navigation";
import { MetaComponent } from "./components/meta";
import { ArticleContentComponent } from "./components/article";
import { ToolbarComponent } from "./components/toolbar";
import { StylePanelComponent } from "./components/style-panel";
// 导入模板文件
import { articleTemplate } from "./templates/article";
import { scriptsTemplate } from "./templates/scripts";
// 导入样式文件
import { mainCss } from "./styles/main";
import { componentsCss } from "./styles/components";
import { commentsCss } from "./styles/comments";

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
    if (!unsafe) {
      return "";
    }
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
   * @param excerpt 文章摘要
   * @returns 加载中的HTML字符串
   */
  public static getLoadingHtml(title: string, excerpt: string): string {
    const excerptText = excerpt.split('\n\n')[1] || "没找到问题摘要(っ °Д °;)っ";
    const loadingHtml = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${this.escapeHtml(title)}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe WPC', 'Segoe UI', system-ui, 'Ubuntu', 'Droid Sans', sans-serif;
            padding: 10px;
            line-height: 1.6;
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            height: 95vh;
            justify-content: center;
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
          <h3 style="text-align:center;max-width:600px;">${this.escapeHtml(
            title
          )}</h3>
          <div style="border: 1px solid var(--vscode-panel-border); width:60%; max-width:600px; margin: 10px 30px;"></div>
          <p style="text-align:center;max-width:600px;max-height:300px;overflow:auto;">${this.escapeHtml(
            excerptText
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

    return loadingHtml;
  }

  /**
   * 生成文章HTML内容
   * @param webviewId 网页视图ID
   * @returns 文章内容的HTML字符串
   */
  public static getArticleHtml(webviewId: string): string {
    // 获取文章对象
    const webview = Store.webviewMap.get(webviewId) as WebViewItem;
    const article = webview.article;
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const mediaDisplayMode = config.get<string>("mediaDisplayMode", "normal");

    // 当前回答
    const currentAnswer = article.answerList[article.currentAnswerIndex];

    if (!currentAnswer) {
      return this.getLoadingHtml(article.title, article.excerpt || "");
    }

    // 构建页面组件
    const renderOptions = { mediaDisplayMode };
    const authorComponent = new AuthorComponent(
      currentAnswer?.author,
      renderOptions
    );
    const navigationComponent = new NavigationComponent(webview, article);
    const metaComponent = new MetaComponent(currentAnswer);
    const contentComponent = new ArticleContentComponent(
      currentAnswer?.content,
      renderOptions
    );
    const toolbarComponent = new ToolbarComponent(
      currentAnswer?.url || webview.url || "",
      renderOptions
    );
    const stylePanelComponent = new StylePanelComponent();

    // 媒体模式类
    const mediaModeClass =
      {
        none: "hide-media",
        mini: "mini-media",
        normal: "",
      }[mediaDisplayMode] || "";

    // 生成JavaScript代码
    const scriptContent = scriptsTemplate
      .replace("${MEDIA_DISPLAY_MODE}", mediaDisplayMode)
      .replace("${CURRENT_ANSWER_INDEX}", article.currentAnswerIndex.toString())
      .replace(
        "${LOADED_ANSWER_COUNT}",
        (article.loadedAnswerCount || article.answerList.length).toString()
      )
      .replace("${ARTICLE_ID}", webview.id || "");

    // 评论组件占位符
    const commentsComponent = `
      <!-- 评论区容器 内容|加载按钮 -->
      <div class="comments-container ${mediaModeClass}">
        <button class="zhihu-load-comments-btn" onclick="loadComments('${
          currentAnswer?.id
        }')" data-answer-id="${currentAnswer?.id}">
          加载评论 (${currentAnswer?.commentCount || 0})
        </button>
      </div>

      <!-- 评论弹窗容器 -->
      <div class="comments-modal-container ${mediaModeClass}"></div>
    `;

    // 填充模板
    return articleTemplate
      .replaceAll("${TITLE}", this.escapeHtml(article.title))
      .replace("${MAIN_CSS}", mainCss)
      .replace("${COMPONENTS_CSS}", componentsCss)
      .replace("${COMMENTS_CSS}", commentsCss)
      .replace("${AUTHOR_COMPONENT}", authorComponent.render())
      .replaceAll("${NAVIGATION_COMPONENT}", navigationComponent.render())
      .replace("${META_COMPONENT}", metaComponent.render())
      .replace("${ARTICLE_CONTENT}", contentComponent.render())
      .replace("${COMMENTS_COMPONENT}", commentsComponent)
      .replace("${TOOLBAR_COMPONENT}", toolbarComponent.render())
      .replace("${STYLE_PANEL_COMPONENT}", stylePanelComponent.render())
      .replace("${SOURCE_URL}", currentAnswer?.url || webview.url || "")
      .replace(/\${MEDIA_MODE_CLASS}/g, mediaModeClass)
      .replace("${SCRIPTS}", scriptContent);
  }
}
