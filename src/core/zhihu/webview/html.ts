import * as vscode from "vscode";
import { Store } from "../../stores";
import { ArticleInfo, WebViewItem } from "../../types";
import { AuthorComponent } from "./components/author";
import { NavigationComponent } from "./components/navigation";
import { MetaComponent } from "./components/meta";
import { ArticleContentComponent } from "./components/article";
import { ToolbarComponent } from "./components/toolbar";
import { StylePanelComponent } from "./components/style-panel";
import { CommentsManager } from "./components/comments";
// 导入模板文件
import { articleTemplate } from "./templates/article";
import { scriptsTemplate } from "./templates/scripts";
import { loadingTemplate } from "./templates/loading";
// 导入样式文件
import { mainCss } from "./styles/main";
import { componentsCss } from "./styles/components";
import { commentsCss } from "./styles/comments";
import { articleCss } from "./styles/article";
import { authorCss } from "./styles/author";
import { navigationCss } from "./styles/navigation";
import { toolbarCss } from "./styles/toolbar";
import { mediaCss } from "./styles/media";
import { panelCss } from "./styles/panel";

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
    const excerptText =
      excerpt.split("\n\n")[1] || "没找到问题摘要(っ °Д °;)っ";

    return loadingTemplate
      .replace(/\${TITLE}/g, this.escapeHtml(title))
      .replace("${EXCERPT}", this.escapeHtml(excerptText));
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
    const commentsComponent = CommentsManager.createCommentsContainerComponent(
      webviewId,
      currentAnswer?.id,
      currentAnswer?.commentCount || 0,
      renderOptions
    );

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

    // 填充模板
    return articleTemplate
      .replaceAll("${TITLE}", this.escapeHtml(article.title))
      .replace("${MAIN_CSS}", mainCss)
      .replace("${COMPONENTS_CSS}", componentsCss)
      .replace("${COMMENTS_CSS}", commentsCss)
      .replace("${ARTICLE_CSS}", articleCss)
      .replace("${AUTHOR_CSS}", authorCss)
      .replace("${NAVIGATION_CSS}", navigationCss)
      .replace("${TOOLBAR_CSS}", toolbarCss)
      .replace("${MEDIA_CSS}", mediaCss)
      .replace("${PANEL_CSS}", panelCss)
      .replace("${AUTHOR_COMPONENT}", authorComponent.render())
      .replaceAll("${NAVIGATION_COMPONENT}", navigationComponent.render())
      .replace("${META_COMPONENT}", metaComponent.render())
      .replace("${ARTICLE_CONTENT}", contentComponent.render())
      .replace("${COMMENTS_COMPONENT}", commentsComponent.render())
      .replace("${TOOLBAR_COMPONENT}", toolbarComponent.render())
      .replace("${STYLE_PANEL_COMPONENT}", stylePanelComponent.render())
      .replace("${SOURCE_URL}", currentAnswer?.url || webview.url || "")
      .replace(/\${MEDIA_MODE_CLASS}/g, mediaModeClass)
      .replace("${SCRIPTS}", scriptContent);
  }
}
