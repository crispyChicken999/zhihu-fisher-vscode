import { Store } from "../stores";
import { LinkItem } from "../types";
import { CookieManager } from "./cookie";
import { WebviewManager } from "./webview";

export class ZhihuService {
  constructor() {
    CookieManager.loadCookie(); // 初始化时加载cookie
  }

  /** 设置Cookie */
  async setCookie(): Promise<boolean> {
    return CookieManager.setCookie();
  }

  /** 清空Cookie */
  clearCookie(): void {
    CookieManager.clearCookie();
  }

  /** 加载文章内容 */
  async getArticleContent(item: LinkItem) {
    WebviewManager.openWebview(item);
  }
}
