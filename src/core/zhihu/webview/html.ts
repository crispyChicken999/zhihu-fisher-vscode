import * as vscode from "vscode";
import { Store } from "../../stores";
import { WebViewItem } from "../../types";
import { MetaComponent } from "./components/meta";
import { AuthorComponent } from "./components/author";
import { CommentsManager } from "./components/comments";
import { ToolbarComponent } from "./components/toolbar";
import { NavigationComponent } from "./components/navigation";
import { disguiseScript } from "./templates/scripts/disguise";
import { ArticleContentComponent } from "./components/article";
import { StylePanelComponent } from "./components/style-panel";
import { ZhidaPanelComponent } from "./components/zhida-panel";
import { DisguiseManager } from "../../utils/disguise-manager";
import { QuestionDetailComponent } from "./components/question-detail";
import { RelatedQuestionsComponent } from "./components/related-questions";
import { AnswerSortComponent } from "./components/answer-sort";

// 导入模板文件
import { errorTemplate } from "./templates/error";
import { articleTemplate } from "./templates/article";
import { loadingTemplate } from "./templates/loading";
import { scriptsTemplate } from "./templates/scripts/index";
import { cookieTipsTemplate } from "./templates/cookieTips";
import { articleKeyboardTips } from "./templates/keyboardTips";
import { questionKeyboardTips } from "./templates/keyboardTips";

// 导入样式文件
import { mainCss } from "./styles/main";
import { panelCss } from "./styles/panel";
import { mediaCss } from "./styles/media";
import { authorCss } from "./styles/author";
import { articleCss } from "./styles/article";
import { toolbarCss } from "./styles/toolbar";
import { commentsCss } from "./styles/comments";
import { disguiseCss } from "./styles/disguise";
import { navigationCss } from "./styles/navigation";
import { componentsCss } from "./styles/components";
import { questionDetailCss } from "./styles/question-detail";
import { relatedQuestionsCss } from "./styles/related-questions";
import { answerSortCss } from "./styles/answer-sort";
import { zhidaPanelCss } from "./styles/zhida-panel";

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
  public static getLoadingHtml(
    title: string,
    excerpt: string,
    imgUrl?: string,
  ): string {
    const excerptText = excerpt || "🐟无摘要🐟";

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
   * 生成错误页面的HTML内容
   * @param title 错误标题
   * @param description 错误描述
   * @param sourceUrl 源URL
   * @param reasons 错误原因列表
   * @param actions 可执行的操作按钮HTML
   * @returns 错误页面的HTML字符串
   */
  public static getErrorHtml(
    title: string,
    description: string,
    sourceUrl: string,
    reasons: string[],
    actions?: string,
  ): string {
    const reasonsHtml = reasons
      .map((reason) => `<li>${this.escapeHtml(reason)}</li>`)
      .join("");
    const defaultActions = `
      <button class="action-button" onclick="reloadPage()">重新加载</button>
      <button class="action-button secondary" onclick="openInBrowser('${this.escapeHtml(
        sourceUrl,
      )}')">🌐 浏览器打开</button>
      <button class="action-button secondary" onclick="setCookie()">更新Cookie</button>
    `;

    return errorTemplate
      .replace("${ERROR_TITLE}", this.escapeHtml(title))
      .replace("${ERROR_DESCRIPTION}", this.escapeHtml(description))
      .replace("${SOURCE_URL}", this.escapeHtml(sourceUrl))
      .replace("${ERROR_REASONS}", reasonsHtml)
      .replace("${ERROR_ACTIONS}", actions || defaultActions);
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
    const enableDisguise = config.get<boolean>("enableDisguise", true);
    const selectedDisguiseTypes = config.get<string[]>(
      "selectedDisguiseTypes",
      [],
    );
    const sidebarDisguiseEnabled = config.get<boolean>(
      "sidebarDisguiseEnabled",
      true,
    );
    const hideFollowUpVotes = config.get<boolean>("hideFollowUpVotes", true);

    // 当前回答
    const currentAnswer = article.answerList[article.currentAnswerIndex];
    if (!currentAnswer) {
      return this.getLoadingHtml(article.title, article.excerpt || "", "");
    }

    // 构建页面组件
    const renderOptions = {
      mediaDisplayMode,
      miniMediaScale,
      enableDisguise,
      selectedDisguiseTypes,
      sidebarDisguiseEnabled,
      hideFollowUpVotes,
      isFirstAnswer: article.currentAnswerIndex === 0,
    };

    // 判断内容类型：通过URL判断专栏文章
    const contentType = webview.url.includes("zhuanlan.zhihu.com")
      ? "article"
      : "question";

    // 创建作者信息组件
    const authorComponent = new AuthorComponent(
      currentAnswer?.author,
      renderOptions,
    );

    // 创建导航组件
    const navigationComponent = new NavigationComponent(
      webview,
      article,
      contentType,
    );

    // 创建沉浸模式的相关问题图标（用于放在标题后面）
    const relatedQuestionsIcon = new RelatedQuestionsComponent(
      article.relatedQuestions || [],
    );

    // 检测当前URL的排序类型
    const currentSortType = webview.url.includes("/answers/updated")
      ? "updated"
      : "default";

    // 从URL中提取问题ID
    const questionIdMatch = webview.url.match(/\/question\/(\d+)/);
    const questionId = questionIdMatch ? questionIdMatch[1] : "";

    // 获取是否支持时间排序（默认为 true）
    const supportTimeSort = article.supportTimeSort ?? true;

    // 创建回答排序选择组件
    const answerSortComponent = new AnswerSortComponent(
      webview.url,
      currentSortType,
      supportTimeSort,
    );

    // 创建问题详情组件
    const questionDetailComponent = new QuestionDetailComponent(
      article.questionDetail || "",
      contentType,
      renderOptions,
    );

    // 创建Meta组件（传入沉浸模式作者信息）
    const metaComponent = new MetaComponent(
      currentAnswer,
      contentType,
      webview,
      authorComponent.renderImmersive(),
      article.currentAnswerIndex === 0,
    );

    // 创建文章内容组件
    const contentComponent = new ArticleContentComponent(
      currentAnswer?.content,
      renderOptions,
    );

    // 创建工具栏组件 - 侧边栏
    const toolbarComponent = new ToolbarComponent(
      currentAnswer?.url || webview.url || "",
      renderOptions,
      currentAnswer,
      webview.sourceType,
    );

    // 创建样式面板组件
    const stylePanelComponent = new StylePanelComponent(renderOptions);

    // 创建评论组件
    const commentsComponent = CommentsManager.createCommentsContainerComponent(
      webviewId,
      currentAnswer?.id,
      currentAnswer?.commentCount || 0,
      renderOptions,
    );

    // 媒体模式类
    const mediaModeClass =
      {
        none: "hide-media",
        mini: "mini-media",
        normal: "",
      }[mediaDisplayMode] || "";

    // 生成JavaScript代码
    const webviewItem = Store.webviewMap.get(webviewId);
    const resourcesUri =
      webviewItem?.webviewPanel.webview
        .asWebviewUri(
          vscode.Uri.joinPath(Store.context!.extensionUri, "resources"),
        )
        .toString() || "";

    // 生成伪装界面HTML（如果启用）
    const disguiseInterfaceHtml = enableDisguise
      ? DisguiseManager.generateDisguiseCodeInterface(webviewId)
      : "";

    // 生成伪装界面控制脚本（如果启用）
    const disguiseControlScript = enableDisguise ? disguiseScript : "";

    // 判断是否为文章类型，生成对应的键盘提示
    const isArticle =
      webview.url.includes("zhuanlan.zhihu.com/p/") ||
      webview.url.includes("/p/");
    const keyboardTips = isArticle ? articleKeyboardTips : questionKeyboardTips;

    // 填充脚本模板
    const scriptContent = scriptsTemplate
      .replace("${MEDIA_DISPLAY_MODE}", mediaDisplayMode)
      .replace("${MINI_MEDIA_SCALE}", miniMediaScale.toString())
      .replace("${CURRENT_ANSWER_INDEX}", article.currentAnswerIndex.toString())
      .replace(
        "${LOADED_ANSWER_COUNT}",
        (article.loadedAnswerCount || article.answerList.length).toString(),
      )
      .replace("${ARTICLE_ID}", webview.id || "")
      .replace("${SOURCE_TYPE}", webview.sourceType)
      .replace("${RESOURCES_BASE_PATH}", resourcesUri)
      .replace(
        "${RELATED_QUESTIONS_DATA}",
        JSON.stringify(article.relatedQuestions || []),
      );

    // 最后一步，组装全部的HTML，嘎嘎嘎~
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
      .replace("${DISGUISE_CSS}", disguiseCss)
      .replace("${RELATED_QUESTIONS_CSS}", relatedQuestionsCss)
      .replace("${QUESTION_DETAIL_CSS}", questionDetailCss)
      .replace("${ANSWER_SORT_CSS}", answerSortCss)
      .replace("${ZHIDA_PANEL_CSS}", zhidaPanelCss)
      .replace("${ZHIDA_PANEL_MODAL}", ZhidaPanelComponent.renderModal())
      .replace(
        "${RELATED_QUESTION_COMPONENT_ICON}",
        isArticle ? "" : relatedQuestionsIcon.render(),
      )
      .replace(
        "${ANSWER_SORT_COMPONENT}",
        isArticle ? "" : answerSortComponent.render(),
      )
      .replace("${AUTHOR_COMPONENT}", authorComponent.render())
      .replaceAll("${NAVIGATION_COMPONENT}", navigationComponent.render())
      .replaceAll("${META_COMPONENT}", metaComponent.render())
      .replace("${ARTICLE_CONTENT}", contentComponent.render())
      .replace("${COMMENTS_COMPONENT}", commentsComponent.render())
      .replace("${TOOLBAR_COMPONENT}", toolbarComponent.render())
      .replace("${STYLE_PANEL_COMPONENT}", stylePanelComponent.render())
      .replace(
        "${QUESTION_DETAIL_COMPONENT_ICON}",
        questionDetailComponent.render(),
      )
      .replace(
        "${QUESTION_DETAIL_COMPONENT_MODAL}",
        questionDetailComponent.renderModal(),
      )
      .replace("${SOURCE_URL}", currentAnswer?.url || webview.url || "")
      .replace("${KEYBOARD_TIPS}", keyboardTips)
      .replace("${CONTENT_ID}", questionId || webview.id || "")
      .replace("${SORT_TYPE}", currentSortType)
      .replace(/\${MEDIA_MODE_CLASS}/g, mediaModeClass)
      .replace("${DISGUISE_INTERFACE}", disguiseInterfaceHtml)
      .replace("${DISGUISE_SCRIPT}", disguiseControlScript)
      .replace("${SCRIPTS}", scriptContent);
  }
}
