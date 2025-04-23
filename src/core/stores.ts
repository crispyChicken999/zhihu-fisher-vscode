import { ContentStore, WebViewItem } from "./types";
import * as vscode from "vscode";
import * as Puppeteer from "puppeteer";

export const Store: ContentStore = {
  webviewMap: new Map<string, WebViewItem>(),
  webviewManager: null as any,
  browserInstance: null,
  pagesInstance: new Map<string, Puppeteer.Page>(),
  statusBarMap: new Map<string, vscode.StatusBarItem>(),
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
    search: {
      list: [],
      isLoading: false,
      currentQuery: "",
    },
    searchManager: null as any,
    cookieInfo: {
      cookie: "",
      lastUpdated: null,
    },
    cookieManager: null as any,
    puppeteerManager: null as any,
  },
};
