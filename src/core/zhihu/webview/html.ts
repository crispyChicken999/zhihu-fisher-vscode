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
import { DisguiseManager } from "../../utils/disguise-manager";
// 导入模板文件
import { articleTemplate } from "./templates/article";
import { scriptsTemplate } from "./templates/scripts/index";
import { loadingTemplate } from "./templates/loading";
import { cookieTipsTemplate } from "./templates/cookieTips";
import { errorTemplate } from "./templates/error";
import {
  articleKeyboardTips,
  questionKeyboardTips,
} from "./templates/keyboardTips";
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
import { disguiseCss } from "./styles/disguise";

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
    imgUrl?: string
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
    actions?: string
  ): string {
    const reasonsHtml = reasons
      .map((reason) => `<li>${this.escapeHtml(reason)}</li>`)
      .join("");
    const defaultActions = `
      <button class="action-button" onclick="reloadPage()">重新加载</button>
      <button class="action-button secondary" onclick="openInBrowser('${this.escapeHtml(
        sourceUrl
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
      []
    );

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
    };

    // 判断内容类型：通过URL判断专栏文章
    const contentType = webview.url.includes("zhuanlan.zhihu.com")
      ? "article"
      : "question";

    const authorComponent = new AuthorComponent(
      currentAnswer?.author,
      renderOptions
    );
    const navigationComponent = new NavigationComponent(
      webview,
      article,
      contentType
    );
    const metaComponent = new MetaComponent(
      currentAnswer,
      contentType,
      webview
    );
    const contentComponent = new ArticleContentComponent(
      currentAnswer?.content,
      renderOptions
    );
    const toolbarComponent = new ToolbarComponent(
      currentAnswer?.url || webview.url || "",
      renderOptions,
      currentAnswer,
      webview.sourceType
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
    const webviewItem = Store.webviewMap.get(webviewId);
    const resourcesUri =
      webviewItem?.webviewPanel.webview
        .asWebviewUri(
          vscode.Uri.joinPath(Store.context!.extensionUri, "resources")
        )
        .toString() || "";

    // 生成伪装界面HTML（如果启用）
    const disguiseInterfaceHtml =
      enableDisguise
        ? DisguiseManager.generateDisguiseCodeInterface(webviewId)
        : "";

    // 生成伪装界面控制脚本（如果启用）
    const disguiseControlScript =
      enableDisguise
        ? `
          // 伪装界面控制
          (function() {
            const disguiseElement = document.getElementById('disguise-code-interface');
            let welcomeMessageElement = null;

            // 创建欢迎消息元素
            function createWelcomeMessage() {
              if (!welcomeMessageElement) {
                welcomeMessageElement = document.createElement('div');
                welcomeMessageElement.className = 'fisher-welcome-message';
                welcomeMessageElement.textContent = '欢迎回到 🐟 Fisher 🐟';
                document.body.appendChild(welcomeMessageElement);
              }
            }

            // 显示欢迎消息
            function showWelcomeMessage() {
              createWelcomeMessage();
              // 延迟显示以确保DOM已渲染
              setTimeout(() => {
                welcomeMessageElement.classList.add('show');
              }, 100);

              // 1秒后自动隐藏
              setTimeout(() => {
                hideWelcomeMessage();
              }, 1000);
            }

            // 隐藏欢迎消息
            function hideWelcomeMessage() {
              if (welcomeMessageElement) {
                welcomeMessageElement.classList.remove('show');
                welcomeMessageElement.classList.add('hide');
                // 动画完成后移除元素
                setTimeout(() => {
                  if (welcomeMessageElement && welcomeMessageElement.parentNode) {
                    welcomeMessageElement.parentNode.removeChild(welcomeMessageElement);
                    welcomeMessageElement = null;
                  }
                }, 300); // 匹配伪装界面的隐藏动画时间
              }
            }

            // 存储待执行的定时器ID，用于实现打断功能
            let welcomeMessageTimer = null;
            let hideDisguiseTimer = null;
            let hideElementTimer = null;

            // 监听来自扩展的消息
            window.addEventListener('message', function(event) {
              const message = event.data;

              if (message.command === 'showDisguise' && disguiseElement) {
                // 打断功能：清除所有待执行的hideDisguise相关定时器
                if (welcomeMessageTimer) {
                  clearTimeout(welcomeMessageTimer);
                  welcomeMessageTimer = null;
                }
                if (hideDisguiseTimer) {
                  clearTimeout(hideDisguiseTimer);
                  hideDisguiseTimer = null;
                }
                if (hideElementTimer) {
                  clearTimeout(hideElementTimer);
                  hideElementTimer = null;
                }

                // 如果当前有欢迎消息在显示，立即隐藏它
                hideWelcomeMessage();

                // 清理所有可能的状态类，确保动画正常
                disguiseElement.classList.remove('show', 'hiding');
                // 先设置为透明状态
                disguiseElement.style.opacity = '0';
                disguiseElement.style.display = 'block';

                // 使用双重 requestAnimationFrame 确保状态完全重置
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    // 移除内联样式，让CSS类接管
                    disguiseElement.style.opacity = '';
                    disguiseElement.classList.add('show');
                  });
                });
                document.body.classList.add('disguise-active');
              } else if (message.command === 'hideDisguise' && disguiseElement) {
                // 打断功能：如果之前有showDisguise正在执行，不需要特别处理，直接开始hideDisguise流程
                
                // 新的时序：先显示欢迎消息，保持伪装界面
                showWelcomeMessage();

                // 等待1秒后同时隐藏伪装界面和欢迎消息
                welcomeMessageTimer = setTimeout(() => {
                  // 同时开始隐藏动画
                  if (disguiseElement) {
                    disguiseElement.classList.remove('show');
                    disguiseElement.classList.add('hiding');
                  }

                  hideWelcomeMessage();

                  // 动画完成后隐藏伪装元素
                  hideElementTimer = setTimeout(() => {
                    if (disguiseElement) {
                      disguiseElement.style.display = 'none';
                      disguiseElement.classList.remove('hiding');
                      document.body.classList.remove('disguise-active');
                    }
                    hideElementTimer = null; // 清除定时器引用
                  }, 300); // 与CSS动画时间匹配
                  welcomeMessageTimer = null; // 清除定时器引用
                }, 1000); // 等待1秒
              }
            });
          })();
        `
        : "";

    const scriptContent = scriptsTemplate
      .replace("${MEDIA_DISPLAY_MODE}", mediaDisplayMode)
      .replace("${MINI_MEDIA_SCALE}", miniMediaScale.toString())
      .replace("${CURRENT_ANSWER_INDEX}", article.currentAnswerIndex.toString())
      .replace(
        "${LOADED_ANSWER_COUNT}",
        (article.loadedAnswerCount || article.answerList.length).toString()
      )
      .replace("${ARTICLE_ID}", webview.id || "")
      .replace("${SOURCE_TYPE}", webview.sourceType)
      .replace("${RESOURCES_BASE_PATH}", resourcesUri);

    // 判断是否为文章类型，生成对应的键盘提示
    const isArticle =
      webview.url.includes("zhuanlan.zhihu.com/p/") ||
      webview.url.includes("/p/");
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
      .replace("${DISGUISE_CSS}", disguiseCss)
      .replace("${AUTHOR_COMPONENT}", authorComponent.render())
      .replaceAll("${NAVIGATION_COMPONENT}", navigationComponent.render())
      .replaceAll("${META_COMPONENT}", metaComponent.render())
      .replace("${ARTICLE_CONTENT}", contentComponent.render())
      .replace("${COMMENTS_COMPONENT}", commentsComponent.render())
      .replace("${TOOLBAR_COMPONENT}", toolbarComponent.render())
      .replace("${STYLE_PANEL_COMPONENT}", stylePanelComponent.render())
      .replace("${SOURCE_URL}", currentAnswer?.url || webview.url || "")
      .replace("${KEYBOARD_TIPS}", keyboardTips)
      .replace(/\${MEDIA_MODE_CLASS}/g, mediaModeClass)
      .replace("${DISGUISE_INTERFACE}", disguiseInterfaceHtml)
      .replace("${DISGUISE_SCRIPT}", disguiseControlScript)
      .replace("${SCRIPTS}", scriptContent);
  }
}
