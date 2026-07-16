import * as vscode from "vscode";
import * as Puppeteer from "puppeteer";
import { Store } from "../stores";
import { CookieManager } from "../zhihu/cookie";
import { PuppeteerManager } from "../zhihu/puppeteer";
import { qrLoginTemplate } from "../zhihu/webview/templates/qr-login";
import { sidebarHotListDataProvider } from "../zhihu/sidebar/hot";
import { sidebarRecommendListDataProvider } from "../zhihu/sidebar/recommend";
import { sidebarFollowListDataProvider } from "../zhihu/sidebar/follow";
import { sidebarSearchListDataProvider } from "../zhihu/sidebar/search";
import { sidebarCollectionsDataProvider } from "../zhihu/sidebar/collections";

/**
 * 注册扫码登录相关命令
 */
export function registerQRLoginCommands(
  sidebarHot: sidebarHotListDataProvider,
  sidebarRecommend: sidebarRecommendListDataProvider,
  sidebarFollow: sidebarFollowListDataProvider,
  sidebarSearch: sidebarSearchListDataProvider,
  sidebarCollections: sidebarCollectionsDataProvider,
): vscode.Disposable[] {
  const commands: vscode.Disposable[] = [];

  const qrLoginCommand = vscode.commands.registerCommand(
    "zhihu-fisher.loginViaQRCode",
    async () => {
      await handleQRLogin(
        sidebarHot,
        sidebarRecommend,
        sidebarFollow,
        sidebarSearch,
        sidebarCollections,
      );
    },
  );
  commands.push(qrLoginCommand);

  return commands;
}

/**
 * 扫码登录处理逻辑
 */
async function handleQRLogin(
  sidebarHot: sidebarHotListDataProvider,
  sidebarRecommend: sidebarRecommendListDataProvider,
  sidebarFollow: sidebarFollowListDataProvider,
  sidebarSearch: sidebarSearchListDataProvider,
  sidebarCollections: sidebarCollectionsDataProvider,
): Promise<void> {
  // 先检查是否可以创建浏览器
  const canCreate = await PuppeteerManager.canCreateBrowser();
  if (!canCreate) {
    const action = await vscode.window.showErrorMessage(
      "无法启动浏览器，请先配置Chrome路径或安装Puppeteer浏览器",
      "配置浏览器",
    );
    if (action === "配置浏览器") {
      vscode.commands.executeCommand("zhihu-fisher.configureBrowser");
    }
    return;
  }

  // 创建webview面板
  const panel = vscode.window.createWebviewPanel(
    "zhihu-fisher-qr-login",
    "扫码登录知乎",
    vscode.ViewColumn.Active,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    },
  );

  // 先显示初始加载状态
  panel.webview.html = getLoadingHtml();

  // 重置清理标志，确保新一次登录的清理正常工作
  isCleanedUp = false;

  let page: Puppeteer.Page | null = null;
  let context: Puppeteer.BrowserContext | null = null;
  let pollingTimer: NodeJS.Timeout | null = null;
  let isLoginSuccess = false; // 标记是否已登录成功
  let isDisposed = false; // 标记面板是否已关闭
  let isProcessingRetry = false; // 防止重复重试

  // 设置消息处理器（必须在 panel 创建后尽早设置，以捕获 webview 发来的消息）
  panel.webview.onDidReceiveMessage(async (message) => {
    if (message.command === "retryQRLogin") {
      if (isProcessingRetry) return;
      isProcessingRetry = true;

      // 清理当前页面资源
      cleanupPage(context, page);
      if (pollingTimer) {
        clearInterval(pollingTimer);
        pollingTimer = null;
      }

      // 重新执行命令（关闭当前面板，打开新的）
      panel.dispose();
      vscode.commands.executeCommand("zhihu-fisher.loginViaQRCode");
    } else if (message.command === "setCookie") {
      panel.dispose();
      vscode.commands.executeCommand("zhihu-fisher.setCookie");
    } else if (message.command === "close") {
      panel.dispose();
    }
  });

  try {
    // 获取浏览器实例
    const browser = await PuppeteerManager.getBrowserInstance();

    // 创建新的浏览器上下文（类似于无痕模式），确保没有已有cookie干扰
    context = await browser.createBrowserContext();
    page = await context.newPage();

    // 设置User-Agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36",
    );

    // 防反爬虫设置
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => undefined,
      });
    });

    // 设置视窗大小
    await page.setViewport({ width: 800, height: 700 });

    // 监听页内控制台消息（调试用）
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.log("[QR Login Page Console Error]:", msg.text());
      }
    });

    // 监听页面关闭事件
    panel.onDidDispose(() => {
      isDisposed = true;
      if (pollingTimer) {
        clearInterval(pollingTimer);
        pollingTimer = null;
      }
      cleanupPage(context, page);
    });

    console.log("正在导航到知乎登录页...");
    await page.goto("https://www.zhihu.com/signin", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // 等待页面加载稳定
    try {
      await page.waitForNetworkIdle({ timeout: 5000 });
    } catch {
      // 忽略网络空闲超时
    }

    console.log("登录页已加载，等待二维码生成...");

    // 等待二维码canvas出现
    try {
      await page.waitForSelector(".Qrcode-qrcode", { timeout: 15000 });
      console.log("二维码已生成");
    } catch {
      // 如果二维码没有出现，可能是因为已经登录了，检查一下
      const currentUrl = page.url();
      if (!currentUrl.includes("signin")) {
        console.log("可能已经登录，当前URL:", currentUrl);
        vscode.window.showInformationMessage(
          "看起来您已经登录了知乎，无需重新登录",
        );
        panel.dispose();
        return;
      }

      // 可能页面加载稍微慢一点，再等一会儿
      try {
        await page.waitForSelector(".Qrcode-qrcode", { timeout: 10000 });
        console.log("二维码已生成（第二次等待）");
      } catch {
        console.log("等待二维码超时，尝试截图页面查看状态...");
        // 显示页面可能的状态
        const pageContent = await page.evaluate(() => {
          return document.body.innerText.substring(0, 500);
        });
        console.log("页面内容预览:", pageContent);

        // 更新webview显示等待状态
        panel.webview.html = getWaitingForQRHtml();
        return;
      }
    }

    // 检查面板是否已被关闭
    if (isDisposed) {
      return;
    }

    // 提取二维码图片数据
    // 使用 page.screenshot() + clip 截取 canvas 元素的像素区域，
    // 避免 canvas 跨域图片导致的 SecurityError (Tainted canvases)
    const qrCodeClip = await page.evaluate(() => {
      const canvas = document.querySelector(
        ".Qrcode-qrcode",
      ) as HTMLCanvasElement | null;
      if (!canvas) {
        return null;
      }
      const rect = canvas.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      };
    });

    if (!qrCodeClip) {
      console.error("无法找到二维码元素");
      panel.webview.html = getErrorHtml("无法获取二维码", [
        "二维码元素未能在页面中找到",
        "可能是页面加载异常",
        "请重试或使用手动设置Cookie方式",
      ]);
      return;
    }

    console.log("正在截取二维码图片...");
    const qrCodeScreenshot = await page.screenshot({
      clip: qrCodeClip,
      type: "png",
    });
    if (!qrCodeScreenshot || (typeof qrCodeScreenshot !== "string" && (qrCodeScreenshot as Buffer).length === 0)) {
      console.error("二维码截图数据为空");
      panel.webview.html = getErrorHtml("无法获取二维码", [
        "二维码截图数据为空",
        "可能是页面加载异常",
        "请重试或使用手动设置Cookie方式",
      ]);
      return;
    }

    // 处理返回值（可能是 Buffer 或 base64 string）
    let qrCodeBase64: string;
    if (typeof qrCodeScreenshot === "string") {
      qrCodeBase64 = `data:image/png;base64,${qrCodeScreenshot}`;
    } else {
      qrCodeBase64 = `data:image/png;base64,${Buffer.from(qrCodeScreenshot).toString("base64")}`;
    }
    console.log("二维码截图成功");

    // 获取微信扫码提示文本
    const wechatTip = await page.evaluate(() => {
      const tipElement = document.querySelector(".Qrcode-guide-message");
      return tipElement?.textContent?.trim() || "";
    });

    // 检查面板是否已被关闭
    if (isDisposed) {
      return;
    }

    // 显示二维码页面
    panel.webview.html = getQRDisplayHtml(qrCodeBase64, wechatTip);

    // 开始轮询检测登录状态
    let pollCount = 0;
    const maxPollCount = 300; // 最多轮询300次，约10分钟（每2秒一次）

    pollingTimer = setInterval(async () => {
      if (isDisposed || isLoginSuccess || !page || page.isClosed()) {
        if (pollingTimer) {
          clearInterval(pollingTimer);
          pollingTimer = null;
        }
        return;
      }

      pollCount++;
      if (pollCount > maxPollCount) {
        // 超时
        clearInterval(pollingTimer!);
        pollingTimer = null;
        if (!isDisposed) {
          panel.webview.html = getTimeoutHtml();
        }
        return;
      }

      try {
        // 获取当前页面URL，检查是否已经跳转（登录成功会跳转到首页）
        const currentUrl = page.url();
        console.log(
          `[QR Login] Poll #${pollCount}: URL = ${currentUrl.substring(0, 80)}`,
        );

        // 如果URL不再是signin页面，说明登录成功了
        if (!currentUrl.includes("signin") && !currentUrl.includes("zhihu.com/signup")) {
          console.log("检测到URL变更，登录成功！当前URL:", currentUrl);
          isLoginSuccess = true;
          clearInterval(pollingTimer!);
          pollingTimer = null;

          // 等待页面完全加载，确保cookie已设置
          try {
            await page.waitForNetworkIdle({ timeout: 8000 });
          } catch {
            // 忽略超时
          }

          // 提取cookie
          const cookies = await page.cookies();
          const cookieString = cookies
            .map((c) => `${c.name}=${c.value}`)
            .join("; ");

          if (cookieString) {
            console.log(`成功获取到 ${cookies.length} 个cookie`);
            await CookieManager.saveCookieString(cookieString);

            // 登录成功后，确保浏览器可用后再刷新侧边栏列表（与手动setCookie逻辑对齐）
            try {
              await PuppeteerManager.canCreateBrowser();
              console.log("浏览器可用，开始刷新侧边栏列表...");
              sidebarHot.refresh();
              sidebarRecommend.refresh();
              sidebarSearch.reset();
              sidebarCollections.reset();
            } catch (error) {
              console.error("创建爬虫浏览器失败，跳过自动刷新:", error);
            }

            // 显示成功页面后关闭
            if (!isDisposed) {
              panel.webview.html = getSuccessHtml();
              // 2秒后自动关闭
              setTimeout(() => {
                if (!isDisposed) {
                  panel.dispose();
                }
              }, 2000);
            }
          } else {
            console.error("登录成功但未能获取到cookie");
            if (!isDisposed) {
              panel.webview.html = getErrorHtml("登录成功但获取Cookie失败", [
                "请尝试使用手动设置Cookie方式",
                "或重新扫码登录",
              ]);
            }
          }

          // 清理页面资源
          cleanupPage(context, page);
          return;
        }

        // 更新轮询状态
        if (!isDisposed) {
          const elapsedMinutes = Math.floor((pollCount * 2) / 60);
          const elapsedSeconds = (pollCount * 2) % 60;
          const timeStr =
            elapsedMinutes > 0
              ? `${elapsedMinutes}分${elapsedSeconds}秒`
              : `${elapsedSeconds}秒`;

          panel.webview.postMessage({
            command: "updateStatus",
            status: "waiting",
            time: timeStr,
          });
        }
      } catch (error) {
        console.error("[QR Login] 轮询检测出错:", error);
        // 如果页面已关闭，停止轮询
        if (page?.isClosed()) {
          clearInterval(pollingTimer!);
          pollingTimer = null;
        }
      }
    }, 2000); // 每2秒轮询一次
  } catch (error: any) {
    console.error("扫码登录出错:", error);
    if (!isDisposed) {
      panel.webview.html = getErrorHtml(
        "扫码登录失败",
        [
          `错误信息: ${error.message || "未知错误"}`,
          "请检查网络连接后重试",
          "或使用手动设置Cookie方式",
        ],
      );
    }
    cleanupPage(context, page);
  }
}

/**
 * 清理页面资源
 * 注意：此函数可能被多次调用（panel.onDidDispose、轮询回调、retry等），
 * 需确保多次调用不会报错。清理过程中的错误是预期的（资源已关闭），直接忽略。
 */
let isCleanedUp = false;

function cleanupPage(
  context: Puppeteer.BrowserContext | null,
  page: Puppeteer.Page | null,
): void {
  if (isCleanedUp) {
    return;
  }
  isCleanedUp = true;

  if (page && !page.isClosed()) {
    page.close().catch(() => {});
  }
  if (context) {
    context.close().catch(() => {});
  }
}

/**
 * 生成初始加载HTML
 */
function getLoadingHtml(): string {
  return qrLoginTemplate
    .replace("${PAGE_TITLE}", "扫码登录知乎")
    .replace("${QR_CODE_DATA}", "")
    .replace("${WECHAT_TIP}", "")
    .replace(
      "${MAIN_CONTENT}",
      `
      <div class="status-container">
        <div class="status-icon loading-spinner">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="status-text">正在准备二维码...</div>
        <div class="status-desc">正在启动浏览器并加载知乎登录页面</div>
      </div>
    `,
    )
    .replace("${STATUS_SCRIPT}", "");
}

/**
 * 生成等待二维码HTML
 */
function getWaitingForQRHtml(): string {
  return qrLoginTemplate
    .replace("${PAGE_TITLE}", "扫码登录知乎")
    .replace("${QR_CODE_DATA}", "")
    .replace("${WECHAT_TIP}", "")
    .replace(
      "${MAIN_CONTENT}",
      `
      <div class="status-container">
        <div class="status-icon loading-spinner">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="status-text">正在等待二维码生成...</div>
        <div class="status-desc">如果长时间未出现二维码，请尝试手动设置Cookie</div>
      </div>
    `,
    )
    .replace("${STATUS_SCRIPT}", "");
}

/**
 * 生成二维码展示HTML
 */
function getQRDisplayHtml(qrCodeData: string, wechatTip: string): string {
  const tipHtml = wechatTip
    ? `<div class="wechat-tip">${escapeHtml(wechatTip)}</div>`
    : "";

  return qrLoginTemplate
    .replace("${PAGE_TITLE}", "扫码登录知乎")
    .replace("${QR_CODE_DATA}", qrCodeData)
    .replace("${WECHAT_TIP}", tipHtml)
    .replace(
      "${MAIN_CONTENT}",
      `
      <div class="qrcode-section">
        <img src="${qrCodeData}" alt="登录二维码" class="qrcode-image" />
        <div class="qrcode-tip">请使用<strong>知乎 App</strong>扫描二维码登录</div>
        ${tipHtml}
      </div>
      <div id="qrStatus" class="status-bar">
        <span class="status-dot"></span>
        <span>等待扫码...</span>
        <span id="elapsedTime">已等待 0秒</span>
      </div>
    `,
    )
    .replace(
      "${STATUS_SCRIPT}",
      `
    <script>
      // 监听来自扩展的消息
      window.addEventListener('message', function(event) {
        const message = event.data;
        if (message.command === 'updateStatus') {
          const statusBar = document.getElementById('qrStatus');
          const timeEl = document.getElementById('elapsedTime');
          if (statusBar) {
            statusBar.className = 'status-bar ' + message.status;
          }
          if (timeEl) {
            timeEl.textContent = '已等待 ' + message.time;
          }
        }
      });

      // 显示二维码后播放微妙的动画
      document.addEventListener('DOMContentLoaded', function() {
        const img = document.querySelector('.qrcode-image');
        if (img) {
          img.classList.add('qrcode-visible');
        }
      });
    </script>
    `,
    );
}

/**
 * 生登录成功HTML
 */
function getSuccessHtml(): string {
  return qrLoginTemplate
    .replace("${PAGE_TITLE}", "✅ 登录成功")
    .replace("${QR_CODE_DATA}", "")
    .replace("${WECHAT_TIP}", "")
    .replace(
      "${MAIN_CONTENT}",
      `
      <div class="status-container success">
        <div class="status-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 12l3 3 5-5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="status-text success-text">✅ 登录成功！</div>
        <div class="status-desc">Cookie已自动保存，页面即将关闭...</div>
      </div>
    `,
    )
    .replace("${STATUS_SCRIPT}", "");
}

/**
 * 生成超时HTML
 */
function getTimeoutHtml(): string {
  return qrLoginTemplate
    .replace("${PAGE_TITLE}", "⏰ 扫码超时")
    .replace("${QR_CODE_DATA}", "")
    .replace("${WECHAT_TIP}", "")
    .replace(
      "${MAIN_CONTENT}",
      `
      <div class="status-container">
        <div class="status-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF9800" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="status-text">⏰ 扫码超时</div>
        <div class="status-desc">二维码已过期，请重试或使用手动设置Cookie方式</div>
        <div class="action-buttons">
          <button class="action-btn primary" onclick="retryQRLogin()">重新扫码</button>
          <button class="action-btn secondary" onclick="manualSetCookie()">手动设置Cookie</button>
        </div>
      </div>
    `,
    )
    .replace(
      "${STATUS_SCRIPT}",
      `
    <script>
      function retryQRLogin() {
        vscode.postMessage({ command: 'retryQRLogin' });
      }
      function manualSetCookie() {
        vscode.postMessage({ command: 'setCookie' });
      }
    </script>
    `,
    );
}

/**
 * 生成错误HTML
 */
function getErrorHtml(title: string, reasons: string[]): string {
  const reasonsHtml = reasons
    .map((reason) => `<li>${escapeHtml(reason)}</li>`)
    .join("");

  return qrLoginTemplate
    .replace("${PAGE_TITLE}", "❌ " + title)
    .replace("${QR_CODE_DATA}", "")
    .replace("${WECHAT_TIP}", "")
    .replace(
      "${MAIN_CONTENT}",
      `
      <div class="status-container">
        <div class="status-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#F44336" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M15 9l-6 6M9 9l6 6" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="status-text">❌ ${escapeHtml(title)}</div>
        <ul class="error-reasons">
          ${reasonsHtml}
        </ul>
        <div class="action-buttons">
          <button class="action-btn primary" onclick="retryQRLogin()">重新扫码</button>
          <button class="action-btn secondary" onclick="manualSetCookie()">手动设置Cookie</button>
        </div>
      </div>
    `,
    )
    .replace(
      "${STATUS_SCRIPT}",
      `
    <script>
      const vscode = acquireVsCodeApi();
      function retryQRLogin() {
        vscode.postMessage({ command: 'retryQRLogin' });
      }
      function manualSetCookie() {
        vscode.postMessage({ command: 'setCookie' });
      }
    </script>
    `,
    );
}

/**
 * HTML转义
 */
function escapeHtml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
