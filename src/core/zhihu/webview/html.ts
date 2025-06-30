import * as vscode from "vscode";
import { Store } from "../../stores";
import { WebViewItem } from "../../types";
import { MetaComponent } from "./components/meta";
import { AuthorComponent } from "./components/author";
import { CommentsManager } from "./components/comments";
import { ToolbarComponent } from "./components/toolbar";
import { NavigationComponent } from "./components/navigation";
import { ArticleContentComponent } from "./components/article";
import { StylePanelComponent } from "./components/style-panel";
// 导入模板文件
import { articleTemplate } from "./templates/article";
import { scriptsTemplate } from "./templates/scripts";
import { loadingTemplate } from "./templates/loading";
import { cookieTipsTemplate } from "./templates/cookieTips";
import { articleKeyboardTips, questionKeyboardTips } from "./templates/keyboardTips";
// 导入样式文件
import { mainCss } from "./styles/main";
import { panelCss } from "./styles/panel";
import { mediaCss } from "./styles/media";
import { authorCss } from "./styles/author";
import { articleCss } from "./styles/article";
import { toolbarCss } from "./styles/toolbar";
import { commentsCss } from "./styles/comments";
import { navigationCss } from "./styles/navigation";
import { componentsCss } from "./styles/components";

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
   * @param imgUrl 可选的缩略图URL
   * @returns 加载中的HTML字符串
   */
  public static getLoadingHtml(title: string, excerpt: string, imgUrl?: string): string {
    const excerptText =
      excerpt || "没找到问题摘要(っ °Д °;)っ";

    // 获取媒体显示模式配置
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const mediaDisplayMode = config.get<string>("mediaDisplayMode", "normal");
    const miniMediaScale = config.get<number>("miniMediaScale", 50);

    return loadingTemplate
      .replace(/\${TITLE}/g, this.escapeHtml(title))
      .replace("${EXCERPT}", this.escapeHtml(excerptText))
      .replace("${IMG_URL}", imgUrl || "")
      .replace("${MEDIA_DISPLAY_MODE}", mediaDisplayMode)
      .replace("${MINI_MEDIA_SCALE}", miniMediaScale.toString());
  }

  /**
   * 生成Cookie过期提示的HTML内容
   * @returns Cookie过期提示的HTML字符串
   */
  public static getCookieExpiredHtml(): string {
    return cookieTipsTemplate;
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
    const miniMediaScale = config.get<number>("miniMediaScale", 50);

    // 当前回答
    const currentAnswer = article.answerList[article.currentAnswerIndex];    if (!currentAnswer) {
      return this.getLoadingHtml(article.title, article.excerpt || "", "");
    }

    // 构建页面组件
    const renderOptions = { mediaDisplayMode, miniMediaScale };

    // 判断内容类型：通过URL判断专栏文章
    const contentType = webview.url.includes('zhuanlan.zhihu.com') ? "article" : "question";

    const authorComponent = new AuthorComponent(
      currentAnswer?.author,
      renderOptions
    );
    const navigationComponent = new NavigationComponent(webview, article, contentType);
    const metaComponent = new MetaComponent(currentAnswer);
    const contentComponent = new ArticleContentComponent(
      currentAnswer?.content,
      renderOptions
    );
    const toolbarComponent = new ToolbarComponent(
      currentAnswer?.url || webview.url || "",
      renderOptions,
      currentAnswer
    );
    const stylePanelComponent = new StylePanelComponent(renderOptions);
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
      .replace("${MINI_MEDIA_SCALE}", miniMediaScale.toString())
      .replace("${CURRENT_ANSWER_INDEX}", article.currentAnswerIndex.toString())
      .replace(
        "${LOADED_ANSWER_COUNT}",
        (article.loadedAnswerCount || article.answerList.length).toString()
      )
      .replace("${ARTICLE_ID}", webview.id || "");

    // 判断是否为文章类型，生成对应的键盘提示
    const isArticle = webview.url.includes('zhuanlan.zhihu.com/p/') || webview.url.includes('/p/');
    const keyboardTips = isArticle ? articleKeyboardTips : questionKeyboardTips;

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
      .replace("${KEYBOARD_TIPS}", keyboardTips)
      .replace(/\${MEDIA_MODE_CLASS}/g, mediaModeClass)
      .replace("${SCRIPTS}", scriptContent);
  }
}
