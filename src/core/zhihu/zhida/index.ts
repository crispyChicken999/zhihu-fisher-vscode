import * as Puppeteer from "puppeteer";
import { PuppeteerManager } from "../puppeteer";

/**
 * 知乎直答 AI 回答结果
 */
export interface ZhidaResult {
  /** 关键词/查询内容 */
  keyword: string;
  /** AI 回答的 HTML 内容（.Render-markdown 的 innerHTML） */
  answerHtml: string;
  /** 是否成功 */
  success: boolean;
  /** 错误信息 */
  error?: string;
}

/**
 * 知乎直答（Zhida）管理器
 */
export class ZhidaManager {
  private static readonly MAX_WAIT_MS = 30000;
  private static readonly POLL_INTERVAL = 500;
  /** 内容稳定性轮询间隔（打字机结束后的检测频率） */
  private static readonly CONTENT_STABLE_POLL_MS = 300;
  /** 连续 N 次长度不变视为内容稳定 */
  private static readonly CONTENT_STABLE_CONFIRM_COUNT = 2;
  /** 等待内容稳定的最大超时 */
  private static readonly CONTENT_STABLE_MAX_MS = 5000;

  // ---- 面板 CSS 选择器常量（兼容新旧版本）----
  /** 新版+旧版面板组合选择器，用于 evaluate 回调中限定查询范围 */
  private static readonly PANEL_SELECTOR_ALL =
    '.KanshanPanel-enter-done, .AIPanel-enter-done, [data-kanshan-panel="true"], [class*="KanshanPanel"]';
  /** Puppeteer waitForSelector 用基础选择器 */
  private static readonly PANEL_SELECTOR_BASE =
    ".KanshanPanel-enter-done, .AIPanel-enter-done";
  /** 仅新版看山面板选择器 */
  private static readonly KANSHAN_SELECTOR =
    '.KanshanPanel-enter-done, [data-kanshan-panel="true"]';
  /** 关闭面板时使用的选择器数组 */
  private static readonly PANEL_CLOSE_SELECTORS = [
    ".KanshanPanel-enter-done",
    '[data-kanshan-panel="true"]',
    '[class*="KanshanPanel"]',
    ".AIPanel-enter-done",
    '[class*="AIPanel"]',
    'div[style*="z-index: 202"]',
  ];

  /**
   * 通过模拟点击 zhida 链接获取 AI 解释
   */
  static async fetchZhidaAnswer(
    page: Puppeteer.Page,
    zhidaHref: string,
    sourceUrl?: string,
  ): Promise<ZhidaResult> {
    const keyword = ZhidaManager.parseKeywordFromHref(zhidaHref);

    try {
      const result = await ZhidaManager.fetchZhidaAnswerFromPage(
        page,
        zhidaHref,
        keyword,
      );

      if (
        !result.success &&
        sourceUrl &&
        ZhidaManager.shouldRetryOnSourcePage(result.error)
      ) {
        return await ZhidaManager.withTemporarySourcePage(
          sourceUrl,
          (tempPage) =>
            ZhidaManager.fetchZhidaAnswerFromPage(tempPage, zhidaHref, keyword),
        );
      }

      return result;
    } catch (error: any) {
      return {
        keyword,
        answerHtml: "",
        success: false,
        error: `操作失败：${error?.message || String(error)}`,
      };
    }
  }

  /**
   * 通过模拟点击"解释这篇内容"按钮获取 AI 总结
   */
  static async fetchZhidaSummary(
    page: Puppeteer.Page,
    answerId: string,
    sourceUrl?: string,
  ): Promise<ZhidaResult> {
    const keyword = "这篇内容讲了什么？";
    try {
      const result = await ZhidaManager.fetchZhidaSummaryFromPage(
        page,
        answerId,
        keyword,
      );

      if (
        !result.success &&
        sourceUrl &&
        ZhidaManager.shouldRetryOnSourcePage(result.error)
      ) {
        return await ZhidaManager.withTemporarySourcePage(
          sourceUrl,
          (tempPage) =>
            ZhidaManager.fetchZhidaSummaryFromPage(tempPage, answerId, keyword),
        );
      }

      return result;
    } catch (error: any) {
      return {
        keyword,
        answerHtml: "",
        success: false,
        error: `操作失败：${error?.message || String(error)}`,
      };
    }
  }

  private static parseKeywordFromHref(zhidaHref: string): string {
    try {
      const urlObj = new URL(zhidaHref);
      return decodeURIComponent(urlObj.searchParams.get("q") || "");
    } catch (_) {
      return "";
    }
  }

  private static async fetchZhidaAnswerFromPage(
    page: Puppeteer.Page,
    zhidaHref: string,
    keyword: string,
  ): Promise<ZhidaResult> {
    await ZhidaManager.closeExistingPanel(page);

    const clicked = await ZhidaManager.clickZhidaLink(page, zhidaHref);
    if (!clicked) {
      return {
        keyword,
        answerHtml: "",
        success: false,
        error: "页面中未找到对应的知乎直答链接，请确认页面已完整加载",
      };
    }

    return await ZhidaManager.waitAndExtract(page, keyword);
  }

  private static async fetchZhidaSummaryFromPage(
    page: Puppeteer.Page,
    answerId: string,
    keyword: string,
  ): Promise<ZhidaResult> {
    await ZhidaManager.closeExistingPanel(page);

    const clicked = await ZhidaManager.clickZhidaSummaryButton(page, answerId);
    if (!clicked) {
      return {
        keyword,
        answerHtml: "",
        success: false,
        error: '页面中未找到"解释这篇内容"按钮，请确认页面已完整加载',
      };
    }

    return await ZhidaManager.waitAndExtract(page, keyword);
  }

  private static async clickZhidaLink(
    page: Puppeteer.Page,
    zhidaHref: string,
  ): Promise<boolean> {
    return await page.evaluate((href: string) => {
      const links = Array.from(document.querySelectorAll("a"));

      // 优先精确匹配
      let target = links.find(
        (a) => a.href === href || a.getAttribute("href") === href,
      );

      // 如果没找到，尝试去除 URL 中的随机参数后匹配
      if (!target) {
        try {
          const cleanHref = href.split("&zhida_source=")[0];
          target = links.find((a) => {
            const aHref = a.href || a.getAttribute("href") || "";
            return aHref.includes(cleanHref);
          });
        } catch (_) {}
      }

      // 最后的兜底：通过 textContent 和 q= 匹配
      if (!target && href.includes("q=")) {
        try {
          const qParam = new URL(href).searchParams.get("q");
          if (qParam) {
            target = links.find((a) => {
              const aHref = a.href || a.getAttribute("href") || "";
              return aHref.includes(`q=${qParam}`);
            });
          }
        } catch (_) {}
      }

      if (target) {
        (target as HTMLElement).click();
        return true;
      }
      return false;
    }, zhidaHref);
  }

  private static async clickZhidaSummaryButton(
    page: Puppeteer.Page,
    answerId: string,
  ): Promise<boolean> {
    return await page.evaluate((id: string) => {
      // 兼容新旧版本的按钮选择器
      const buttonSelectors = [
        'button[data-tooltip="解释这篇内容"]',
        'button[aria-label="解释这篇内容"]',
        'button[data-testid="Button:zhida_summarize_btn"]',
      ];

      const clickFirstVisibleButton = () => {
        for (const sel of buttonSelectors) {
          const buttons = Array.from(
            document.querySelectorAll<HTMLElement>(sel),
          );
          const button = buttons.find((btn) => {
            const style = window.getComputedStyle(btn);
            const rect = btn.getBoundingClientRect();
            return (
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              rect.width > 0 &&
              rect.height > 0
            );
          });
          if (button) {
            button.click();
            return true;
          }
        }
        return false;
      };

      // 知乎回答容器用 name="{answerId}" 标识（DOM 分析确认）
      // 同时兼容其他可能的 id/data 属性选择器
      const containerSelectors = [
        `[name="${id}"]`,
        `#answer-${id}`,
        `[data-answer-id="${id}"]`,
        `[data-record-id="${id}"]`,
      ];

      for (const containerSel of containerSelectors) {
        const container = document.querySelector(containerSel);
        if (!container) {
          continue;
        }
        for (const btnSel of buttonSelectors) {
          const button = container.querySelector<HTMLElement>(btnSel);
          if (button) {
            button.click();
            return true;
          }
        }
      }

      if (id && location.href.includes(`/answer/${id}`)) {
        return clickFirstVisibleButton();
      }

      return false;
    }, answerId);
  }

  private static shouldRetryOnSourcePage(error?: string): boolean {
    if (!error) {
      return false;
    }
    return error.includes("未找到") || error.includes("未出现");
  }

  private static async withTemporarySourcePage<T>(
    sourceUrl: string,
    action: (page: Puppeteer.Page) => Promise<T>,
  ): Promise<T> {
    const page = await PuppeteerManager.createPage();
    try {
      await page.goto(sourceUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      try {
        await page.waitForNetworkIdle({ timeout: 5000 });
      } catch (_) {
        // 知乎页面经常长连接不断，DOM 已加载即可继续尝试点击 AI 入口。
      }

      return await action(page);
    } finally {
      try {
        if (!page.isClosed()) {
          await page.close();
        }
      } catch (_) {}
    }
  }

  /**
   * 等待 AI 面板进入"思考中"状态，再等待"完成回答"，最后提取内容。
   * 分两阶段等待，防止复用旧内容。
   */
  private static async waitAndExtract(
    page: Puppeteer.Page,
    keyword: string,
  ): Promise<ZhidaResult> {
    const startTime = Date.now();

    // 阶段1：等待面板出现（最长 5 秒）
    const panelAppeared = await ZhidaManager.waitForPanel(page, 5000);
    if (!panelAppeared) {
      return {
        keyword,
        answerHtml: "",
        success: false,
        error: "知乎直答面板未出现，请确认页面已完整加载且已登录知乎",
      };
    }

    // 阶段2：等待"思考中"（loading）状态，确认是新一次查询开始了
    // 超时 3 秒，若未出现 loading 也继续（有时候查询很快）
    const loadingAppeared = await ZhidaManager.waitForLoadingState(page, 3000);
    console.log(
      `[ZhidaManager] 思考中状态${loadingAppeared ? "出现" : "未出现（可能已完成）"}`,
    );

    // 阶段3：轮询等待"搜索完成"或"完成回答"
    while (Date.now() - startTime < ZhidaManager.MAX_WAIT_MS) {
      const result = await page.evaluate(
        (_kw: string, panelSel: string) => {
          // ---- 先定位面板容器，所有查询限定在面板内部，防止误提取页面正文内容 ----
          const panel = document.querySelector(panelSel) || document;

          // ---- 新版（看山 Kanshan）：回答完成 = 点赞按钮出现 ----
          // 看山面板的打字机效果：searchDoneBtn 出现得早但内容还在输出中，
          // 只有 like_button 出现才表示回答已完整渲染
          const likeBtn = panel.querySelector(
            '[data-testid="Button:ai_assistant_chat_like_button"]',
          );
          // data-phase="End" 是更明确的结束标记
          const endMarker = panel.querySelector('[data-phase="End"]');

          if (likeBtn || endMarker) {
            // 新版答案在面板内任意 [data-testid="Block"] 中的 .Render-markdown
            const blocks = panel.querySelectorAll('[data-testid="Block"]');
            const found = Array.from(blocks).find((block) => {
              const md = block.querySelector(".Render-markdown");
              return md && md.innerHTML.trim();
            });
            if (found) {
              return found.querySelector(".Render-markdown")!.innerHTML;
            }
          }

          // ---- 旧版（知乎直答 AI）：thinking_node 完成按钮 ----
          const thinkingBtn = panel.querySelector(
            '[data-testid="Button:thinking_node"]',
          );
          if (thinkingBtn?.textContent?.includes("完成回答")) {
            const answerBlock = panel.querySelector(
              '[data-testid="Block:zhida_answer_result_block"]',
            );
            const markdownDiv = answerBlock?.querySelector(".Render-markdown");
            if (markdownDiv && markdownDiv.innerHTML.trim()) {
              return markdownDiv.innerHTML;
            }
          }

          return null;
        },
        keyword,
        ZhidaManager.PANEL_SELECTOR_ALL,
      );

      if (result !== null && result.trim()) {
        // 完成信号出现后，轮询等待内容稳定（打字机效果彻底结束）
        const settled = await ZhidaManager.waitForContentStable(page, result);
        return {
          keyword,
          answerHtml: settled,
          success: true,
        };
      }

      await new Promise((r) => setTimeout(r, ZhidaManager.POLL_INTERVAL));
    }

    // 超时：尝试返回已有内容
    const partial = await ZhidaManager.extractAnswerFromPanel(page).catch(
      () => null,
    );

    if (partial) {
      return {
        keyword,
        answerHtml:
          partial +
          '<p style="color:gray;font-size:12px">（以上为超时前的部分内容）</p>',
        success: true,
      };
    }

    return {
      keyword,
      answerHtml: "",
      success: false,
      error: "等待 AI 回答超时（超过 30 秒），请稍后重试",
    };
  }

  /**
   * 从面板中提取 .Render-markdown 内容（兼容新旧版本）
   */
  private static async extractAnswerFromPanel(
    page: Puppeteer.Page,
  ): Promise<string | null> {
    return page.evaluate((panelSel: string) => {
      const panel = document.querySelector(panelSel) || document;

      // 新版：查找面板内 [data-testid="Block"] 中的 .Render-markdown
      const blocks = panel.querySelectorAll('[data-testid="Block"]');
      const found = Array.from(blocks).find((block) => {
        const md = block.querySelector(".Render-markdown");
        return md?.innerHTML?.trim();
      });
      if (found) {
        return found.querySelector(".Render-markdown")!.innerHTML;
      }
      // 旧版
      const markdownDiv = panel
        .querySelector('[data-testid="Block:zhida_answer_result_block"]')
        ?.querySelector(".Render-markdown");
      if (markdownDiv?.innerHTML?.trim()) {
        return markdownDiv.innerHTML;
      }
      return null;
    }, ZhidaManager.PANEL_SELECTOR_ALL);
  }

  /**
   * 轮询等待面板内的 .Render-markdown 内容稳定（打字机效果结束）
   * 当连续 CONTENT_STABLE_CONFIRM_COUNT 次内容长度不变时，视为稳定。
   * @param page 页面
   * @param fallback 首次提取的内容，超时时降级使用
   */
  private static async waitForContentStable(
    page: Puppeteer.Page,
    fallback: string,
  ): Promise<string> {
    const start = Date.now();
    let lastLength = -1;
    let stableCount = 0;
    let lastContent = fallback;

    while (Date.now() - start < ZhidaManager.CONTENT_STABLE_MAX_MS) {
      const content = await ZhidaManager.extractAnswerFromPanel(page);
      if (!content) {
        return fallback;
      }
      lastContent = content;

      const currentLength = content.length;
      if (currentLength === lastLength) {
        stableCount++;
        if (stableCount >= ZhidaManager.CONTENT_STABLE_CONFIRM_COUNT) {
          return content;
        }
      } else {
        stableCount = 0;
      }
      lastLength = currentLength;

      await new Promise((r) =>
        setTimeout(r, ZhidaManager.CONTENT_STABLE_POLL_MS),
      );
    }

    // 超时：返回循环中最后一次提取的内容
    return lastContent;
  }

  /**
   * 等待面板出现（支持多种 CSS 类名，适配知乎 DOM 更新）
   */
  private static async waitForPanel(
    page: Puppeteer.Page,
    timeoutMs: number,
  ): Promise<boolean> {
    const start = Date.now();

    // 优先使用 Puppeteer 的 waitForSelector（最快）
    try {
      await page.waitForSelector(ZhidaManager.PANEL_SELECTOR_BASE, {
        timeout: Math.min(timeoutMs, 3000),
      });
      return true;
    } catch (_) {
      // 继续尝试轮询
    }

    // 轮询检测面板是否出现（适配新旧版本）
    while (Date.now() - start < timeoutMs) {
      const hasPanel = await page.evaluate((closeSels: string[]) => {
        // 面板选择器 + 通用检测标志
        const selectors = [
          ...closeSels,
          '[data-testid="Button:thinking_node"]',
          '[data-testid="Block:zhida_answer_result_block"]',
          '[data-testid="Button:ai_assistant_search_complete_button"]',
          '[data-testid="Button:ai_assistant_chat_copy_button"]',
          'div[style*="z-index: 202"]',
          'div[style*="z-index: 202"] [data-testid="Text:ai_assistant_search_complete_button"]',
        ];
        for (const sel of selectors) {
          if (document.querySelector(sel)) {
            return true;
          }
        }
        return false;
      }, ZhidaManager.PANEL_CLOSE_SELECTORS);
      if (hasPanel) {
        return true;
      }
      await new Promise((r) => setTimeout(r, 200));
    }
    return false;
  }

  /**
   * 等待面板进入"思考中"（加载）状态
   * 兼容新旧两版面板的加载状态检测
   * @param page 页面
   * @param timeoutMs 超时时间
   * @returns 是否出现了 loading 状态
   */
  private static async waitForLoadingState(
    page: Puppeteer.Page,
    timeoutMs: number,
  ): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const isLoading = await page.evaluate((kanshanSel: string) => {
        // ---- 新版（看山 Kanshan）----
        // 面板存在但点赞按钮未出现 = 仍在搜索/打字机输出中
        const kanshanPanel = document.querySelector(kanshanSel);
        if (kanshanPanel) {
          const likeBtn = kanshanPanel.querySelector(
            '[data-testid="Button:ai_assistant_chat_like_button"]',
          );
          // 点赞按钮还没出来 = 仍在加载
          return !likeBtn;
        }

        // ---- 旧版（知乎直答 AIPanel）----
        const aiPanel = document.querySelector(".AIPanel-enter-done");
        if (aiPanel) {
          const btn = aiPanel.querySelector(
            '[data-testid="Button:thinking_node"]',
          );
          return btn ? !btn.textContent?.includes("完成回答") : true;
        }

        // 面板还没出现
        return false;
      }, ZhidaManager.KANSHAN_SELECTOR);
      if (isLoading) {
        return true;
      }
      await new Promise((r) => setTimeout(r, 200));
    }
    return false;
  }

  /**
   * 关闭已有的知乎直答面板，等待其完全从 DOM 消失
   */
  private static async closeExistingPanel(page: Puppeteer.Page): Promise<void> {
    try {
      const existed = await page.evaluate((closeSels: string[]) => {
        // 尝试多种选择器找到面板（兼容新旧版本）
        const panelSelectors = closeSels;
        let panel: Element | null = null;
        for (const sel of panelSelectors) {
          panel = document.querySelector(sel);
          if (panel) {
            break;
          }
        }

        if (!panel) {
          return false;
        }

        // 查找关闭按钮（兼容新旧版本）
        // 新版看山面板：aria-label="收起对话"
        // 旧版直答面板：aria-label="关闭"
        const closeBtnSelectors = [
          '[aria-label="收起对话"]',
          '[aria-label="关闭"]',
          '[data-tooltip="关闭"]',
        ];
        let closeBtn: HTMLElement | null = null;
        for (const sel of closeBtnSelectors) {
          closeBtn = panel.querySelector<HTMLElement>(sel);
          if (closeBtn) {
            break;
          }
        }

        if (closeBtn) {
          closeBtn.click();
          return true;
        }
        return false;
      }, ZhidaManager.PANEL_CLOSE_SELECTORS);

      if (!existed) {
        return;
      }

      // 等待面板彻底消失（最多 2 秒）
      const waitStart = Date.now();
      while (Date.now() - waitStart < 2000) {
        const stillHere = await page.evaluate((closeSels: string[]) => {
          const selectors = closeSels;
          for (const sel of selectors) {
            if (document.querySelector(sel)) {
              return true;
            }
          }
          return false;
        }, ZhidaManager.PANEL_CLOSE_SELECTORS);
        if (!stillHere) {
          break;
        }
        await new Promise((r) => setTimeout(r, 100));
      }
    } catch (_) {
      // 忽略
    }
  }
}
