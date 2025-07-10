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

  /** 清理知乎服务资源 */
  static cleanup() {
    Store.webviewMap.clear(); // 清理Webview映射
    Store.Zhihu.hot.list = []; // 清空热榜列表
    Store.Zhihu.recommend.list = []; // 清空推荐列表
    Store.Zhihu.search.list = []; // 清空搜索列表
    Store.Zhihu.collections.myCollections = []; // 清空收藏列表
    Store.Zhihu.collections.followingCollections = []; // 清空关注的收藏列表
    Store.statusBarMap.clear(); // 清理状态栏映射
    Store.browserInstance?.close(); // 关闭浏览器实例
    Store.browserInstance = null; // 清空浏览器实例
    Store.pagesInstance.clear(); // 清理页面实例
  }
}
