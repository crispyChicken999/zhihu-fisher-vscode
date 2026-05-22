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
        return await ZhidaManager.withTemporarySourcePage(sourceUrl, (tempPage) =>
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
        return await ZhidaManager.withTemporarySourcePage(sourceUrl, (tempPage) =>
          ZhidaManager.fetchZhidaSummaryFromPage(
            tempPage,
            answerId,
            keyword,
          ),
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
      const buttonSelector =
        'button[data-tooltip="解释这篇内容"], button[aria-label="解释这篇内容"]';
      const clickFirstVisibleButton = () => {
        const buttons = Array.from(
          document.querySelectorAll<HTMLElement>(buttonSelector),
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
        if (!button) {
          return false;
        }
        button.click();
        return true;
      };

      // 知乎回答容器用 name="{answerId}" 标识（DOM 分析确认）
      // 同时兼容其他可能的 id/data 属性选择器
      const selectors = [
        `[name="${id}"]`,
        `#answer-${id}`,
        `[data-answer-id="${id}"]`,
        `[data-record-id="${id}"]`,
      ];

      for (const sel of selectors) {
        const container = document.querySelector(sel);
        const button = container?.querySelector<HTMLElement>(buttonSelector);
        if (button) {
          button.click();
          return true;
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
    try {
      await page.waitForSelector(".AIPanel-enter-done", { timeout: 5000 });
    } catch (_) {
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

    // 阶段3：轮询等待"完成回答"
    while (Date.now() - startTime < ZhidaManager.MAX_WAIT_MS) {
      const result = await page.evaluate((kw: string) => {
        // 额外校验：确认面板中的查询关键词是否匹配，防止抓到旧结果
        const queryBlock = document.querySelector(
          '[data-testid="Block:zhida_answer_query_block"]',
        );
        if (queryBlock && kw && !queryBlock.textContent?.includes(kw)) {
          return "PENDING_KEYWORD_MATCH";
        }

        const thinkingBtn = document.querySelector(
          '[data-testid="Button:thinking_node"]',
        );
        if (!thinkingBtn?.textContent?.includes("完成回答")) {
          return null;
        }
        const answerBlock = document.querySelector(
          '[data-testid="Block:zhida_answer_result_block"]',
        );
        const markdownDiv = answerBlock?.querySelector(".Render-markdown");
        return markdownDiv ? markdownDiv.innerHTML : null;
      }, keyword);

      if (
        result !== null &&
        result !== "PENDING_KEYWORD_MATCH" &&
        result.trim()
      ) {
        return { keyword, answerHtml: result, success: true };
      }

      await new Promise((r) => setTimeout(r, ZhidaManager.POLL_INTERVAL));
    }

    // 超时：尝试返回已有内容
    const partial = await page
      .evaluate(() => {
        const markdownDiv = document
          .querySelector('[data-testid="Block:zhida_answer_result_block"]')
          ?.querySelector(".Render-markdown");
        return markdownDiv?.innerHTML || null;
      })
      .catch(() => null);

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
   * 等待面板进入"思考中"（加载）状态
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
      const isLoading = await page.evaluate(() => {
        const btn = document.querySelector(
          '[data-testid="Button:thinking_node"]',
        );
        // 未出现完成按钮 = 正在思考中
        return btn ? !btn.textContent?.includes("完成回答") : false;
      });
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
      const existed = await page.evaluate(() => {
        const panel = document.querySelector(".AIPanel-enter-done");
        if (!panel) {
          return false;
        }
        const closeBtn = panel.querySelector<HTMLElement>(
          '[aria-label="关闭"], [data-tooltip="关闭"]',
        );
        if (closeBtn) {
          closeBtn.click();
          return true;
        }
        return false;
      });

      if (!existed) {
        return;
      }

      // 等待面板彻底消失（最多 2 秒）
      const waitStart = Date.now();
      while (Date.now() - waitStart < 2000) {
        const stillHere = await page.evaluate(
          () => !!document.querySelector(".AIPanel-enter-done"),
        );
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
