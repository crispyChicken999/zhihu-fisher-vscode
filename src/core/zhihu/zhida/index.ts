import * as Puppeteer from "puppeteer";

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
  ): Promise<ZhidaResult> {
    try {
      await ZhidaManager.closeExistingPanel(page);

      // 解析关键词（q= 参数）
      let keyword = "";
      try {
        const urlObj = new URL(zhidaHref);
        keyword = decodeURIComponent(urlObj.searchParams.get("q") || "");
      } catch (_) {}

      const clicked = await page.evaluate((href: string) => {
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
          const qParam = new URL(href).searchParams.get("q");
          if (qParam) {
            target = links.find((a) => {
              const aHref = a.href || a.getAttribute("href") || "";
              return aHref.includes(`q=${qParam}`);
            });
          }
        }

        if (target) {
          (target as HTMLElement).click();
          return true;
        }
        return false;
      }, zhidaHref);

      if (!clicked) {
        return {
          keyword,
          answerHtml: "",
          success: false,
          error: "页面中未找到对应的知乎直答链接，请确认页面已完整加载",
        };
      }

      return await ZhidaManager.waitAndExtract(page, keyword);
    } catch (error: any) {
      return {
        keyword: "",
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
  ): Promise<ZhidaResult> {
    const keyword = "这篇内容讲了什么？";
    try {
      await ZhidaManager.closeExistingPanel(page);

      const clicked = await page.evaluate((id: string) => {
        // 知乎回答容器用 name="{answerId}" 标识（DOM 分析确认）
        // 同时兼容其他可能的 id/data 属性选择器
        const selectors = [
          `[name="${id}"]`, // 最精确，知乎实际的属性
          `#answer-${id}`, // id 属性（部分场景）
          `[data-answer-id="${id}"]`, // data 属性
          `[data-record-id="${id}"]`, // data 属性备用
        ];

        let container: Element | null = null;
        for (const sel of selectors) {
          container = document.querySelector(sel);
          if (container) {
            break;
          }
        }

        if (container) {
          const btn = container.querySelector<HTMLElement>(
            'button[data-tooltip="解释这篇内容"]',
          );
          if (btn) {
            btn.click();
            return true;
          }
        }

        // 最终回退：第一个可见按钮
        const allBtns = Array.from(
          document.querySelectorAll<HTMLElement>(
            'button[data-tooltip="解释这篇内容"]',
          ),
        );
        if (allBtns.length > 0) {
          allBtns[0].click();
          return true;
        }
        return false;
      }, answerId);

      if (!clicked) {
        return {
          keyword,
          answerHtml: "",
          success: false,
          error: '页面中未找到"解释这篇内容"按钮，请确认页面已完整加载',
        };
      }

      return await ZhidaManager.waitAndExtract(page, keyword);
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
