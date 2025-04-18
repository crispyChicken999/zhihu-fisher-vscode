import { ContentStore, WebViewItem } from "./types";
import { CookieManager } from "./zhihu/cookie";
import { HotListManager } from "./zhihu/hot";
import { RecommendListManager } from "./zhihu/recommend";
import * as Puppeteer from "puppeteer";
import { PuppeteerManager } from "./zhihu/puppeteer";
import { WebviewManager } from "./zhihu/webview";


export const Store: ContentStore = {
  webviewMap: new Map<string, WebViewItem>(),
  webviewManager: new WebviewManager(),
  browserInstance: null,
  pagesInstance: new Map<string, Puppeteer.Page>(),
  Zhihu: {
    hot: {
      list: [],
      isLoading: false,
    },
    hotListManager: new HotListManager(),
    recommend: {
      list: [],
      isLoading: false,
    },
    recommendListManager: new RecommendListManager(),
    cookieInfo: {
      cookie: "",
      lastUpdated: null,
    },
    cookieManager: new CookieManager(),
    puppeteerManager: new PuppeteerManager(),
  },
};
