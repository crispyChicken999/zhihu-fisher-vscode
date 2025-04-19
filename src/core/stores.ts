import { ContentStore, WebViewItem } from "./types";
import { CookieManager } from "./zhihu/cookie";
import { HotListManager } from "./zhihu/hot";
import { RecommendListManager } from "./zhihu/recommend";
import * as Puppeteer from "puppeteer";
import { PuppeteerManager } from "./zhihu/puppeteer";
import { WebviewManager } from "./zhihu/webview";


export const Store: ContentStore = {
  webviewMap: null as any,
  webviewManager: null as any,
  browserInstance: null,
  pagesInstance: null as any,
  Zhihu: {
    hot: {
      list: [],
      isLoading: false,
    },
    hotListManager: null as any,
    recommend: {
      list: [],
      isLoading: false,
    },
    recommendListManager: null as any,
    cookieInfo: {
      cookie: "",
      lastUpdated: null,
    },
    cookieManager: null as any,
    puppeteerManager: null as any,
  },
};
