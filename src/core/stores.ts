import { ContentStore, WebViewItem } from "./types";
import * as vscode from "vscode";
import * as Puppeteer from "puppeteer";

export const Store: ContentStore = {
  webviewMap: new Map<string, WebViewItem>(),
  browserInstance: null,
  pagesInstance: new Map<string, Puppeteer.Page>(),
  statusBarMap: new Map<string, vscode.StatusBarItem>(),
  Zhihu: {
    hot: {
      list: [],
      isLoading: false,
    },
    recommend: {
      list: [],
      isLoading: false,
    },
    search: {
      list: [],
      isLoading: false,
      currentQuery: "",
    },
    collections: {
      isLoading: false,
      myCollections: [],
      followingCollections: [],
      userInfo: null,
      myCollectionsPagination: {
        currentPage: 1,
        hasMore: true,
        isLoading: false,
      },
      followingCollectionsPagination: {
        currentPage: 1,
        hasMore: true,
        isLoading: false,
      },
    },
    cookie: "",
  },
};
