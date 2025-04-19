import { Store } from "../stores";
import { LinkItem, WebViewItem } from "../types";
import { PuppeteerManager } from "./puppeteer";
import { CookieManager } from "./cookie";
import { RecommendListManager } from "./recommend";
import { HotListManager } from "./hot";
import { WebviewManager } from "./webview";
import * as Puppeteer from "puppeteer";

export class ZhihuService {
  private cookieManager;
  private hotListManager;
  private recommendListManager;
  private webviewManager;
  private webviewMap: Map<string, WebViewItem>;
  private pagesInstance: Map<string, Puppeteer.Page>;

  constructor() {
    this.cookieManager = Store.Zhihu.cookieManager = new CookieManager();
    this.hotListManager = Store.Zhihu.hotListManager = new HotListManager();
    this.recommendListManager = Store.Zhihu.recommendListManager =
      new RecommendListManager();
    this.webviewManager = Store.webviewManager = new WebviewManager();
    this.webviewMap = Store.webviewMap = new Map<string, WebViewItem>();
    this.pagesInstance = Store.pagesInstance = new Map<string, Puppeteer.Page>();
  }

  /** 设置Cookie */
  async setCookie(): Promise<boolean> {
    return this.cookieManager.setCookie();
  }

  /** 清空Cookie */
  clearCookie(): void {
    this.cookieManager.clearCookie();
  }

  /** 获取推荐列表 */
  async getRecommendList() {
    return this.recommendListManager.getRecommendList();
  }

  /** 获取热榜列表 */
  async getHotList() {
    return this.hotListManager.getHotList();
  }

  /** 加载文章内容 */
  async getArticleContent(item: LinkItem) {
    this.webviewManager.openWebview(item);
  }

  /**
   * 关闭问题的Puppeteer页面
   * @param key 问题ID
   */
  async closeBrowserPage(key: string): Promise<void> {
    return PuppeteerManager.closePage(key);
  }
}
