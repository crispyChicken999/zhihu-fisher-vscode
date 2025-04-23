import * as Puppeteer from "puppeteer";
import { CookieManager } from "../zhihu/cookie";
import { RecommendListManager } from "../zhihu/recommend";
import { HotListManager } from "../zhihu/hot";
import { SearchManager } from "../zhihu/search";
import { PuppeteerManager } from "../zhihu/puppeteer";
import { WebviewManager } from "../zhihu/webview";
import * as vscode from "vscode";

/** 全局状态管理 */
export interface ContentStore {
  /** 打开的所有页面构成的列表 */
  webviewMap: Map<string, WebViewItem>;
  /** Webview管理器实例对象 */
  webviewManager: WebviewManager;
  /** Puppeteer浏览器实例 */
  browserInstance: Puppeteer.Browser | null;
  /** Puppeteer页面实例列表 */
  pagesInstance: Map<string, Puppeteer.Page>;
  /** 状态栏项目映射表 */
  statusBarMap: Map<string, vscode.StatusBarItem>;

  /** 知乎相关 */
  Zhihu: {
    /** 知乎推荐列表数据 */
    recommend: {
      /** 是否正在加载推荐 */
      isLoading: boolean;
      /** 推荐列表 */
      list: LinkItem[];
    };
    /** 推荐列表管理器实例对象 */
    recommendListManager: RecommendListManager;

    /** 知乎热榜列表数据 */
    hot: {
      /** 是否正在加载热榜 */
      isLoading: boolean;
      /** 热榜列表 */
      list: LinkItem[];
    };
    /** 热榜管理器实例对象 */
    hotListManager: HotListManager;

    /** 知乎搜索数据 */
    search: {
      /** 是否正在搜索 */
      isLoading: boolean;
      /** 当前搜索关键词 */
      currentQuery: string;
      /** 搜索结果列表 */
      list: LinkItem[];
    };
    /** 搜索管理器实例对象 */
    searchManager: SearchManager;

    /** 知乎的Cookie */
    cookieInfo: CookieInfo;
    /** Cookie管理器 */
    cookieManager: CookieManager;
    /** Puppeteer管理器 */
    puppeteerManager: PuppeteerManager;
  };
}

/** 链接数据结构 */
export interface LinkItem {
  /** 链接ID */
  id: string;
  /** 链接URL */
  url: string;
  /** 链接的标题 */
  title: string;
  /** 链接的摘要 */
  excerpt: string;
  /** 热榜的热度值 */
  hotValue?: string;
  /** 链接的缩略图 */
  imgUrl?: string;
}

/** 页面数据结构 */
export interface WebViewItem {
  /** 问题ID  */
  id: string;
  /** 问题对应的URL */
  url: string;
  /** 问题的内容数据 */
  article: ArticleInfo;
  /** vscode的视图面板 */
  webviewPanel: vscode.WebviewPanel;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 是否已加载 */
  isLoaded: boolean;
  /** BatchConfig 批次加载的参数，方便终止递归 */
  batchConfig: {
    /** 加载前的回答数量 */
    beforeLoadCount: number;
    /** 加载后的回答数量 */
    afterLoadCount: number;
    /** 每一批次加载的数量限制 */
    limitPerBatch: number;
    /** 正在加载批次，避免重复加载 */
    isLoadingBatch: boolean;
  };
}

/** 文章数据结构 */
export interface ArticleInfo {
  /** 问题的标题 */
  title: string;
  /** 问题的简介 */
  excerpt: string;
  /** 问题的回答列表 */
  answerList: AnswerItem[];
  /** 已加载的回答数量 */
  loadedAnswerCount: number;
  /** 总回答数量 */
  totalAnswerCount: number;
  /** 全部回答是否加载完成 */
  loadComplete: boolean;
  /** 现在看到第几条回答 */
  currentAnswerIndex: number;
  /** 是否正在加载新的回答 */
  isLoading: boolean;
}

/** 回答数据结构 */
export interface AnswerItem {
  /** 回答的ID */
  id: string;
  /** 回答的URL */
  url: string;
  /** 回答的作者信息 */
  author: AnswerAuthor;
  /** 回答的点赞数 */
  likeCount: number;
  /** 回答的评论数 */
  commentCount: number;
  /** 回答的发布时间 */
  publishTime: string;
  /** 回答的更新时间 */
  updateTime: string;
  /** 回答的内容 */
  content: string;
}

/** 回答作者信息 */
export interface AnswerAuthor {
  /** 作者的ID */
  id: string;
  /** 作者主页URL */
  url: string;
  /** 作者的名称 */
  name: string;
  /** 作者的签名 */
  signature: string;
  /** 作者的头像 */
  avatar: string;
  /** 作者的粉丝数 */
  followersCount: number;
}

/** Cookie对象信息 */
export interface CookieInfo {
  cookie: string;
  lastUpdated?: number | null; // 时间戳，记录上次更新时间
}

/**
 * 知乎热榜树节点类
 */
export class TreeItem extends vscode.TreeItem {
  constructor(
    public readonly hotListItem: LinkItem,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(hotListItem.title, collapsibleState);

    this.tooltip = hotListItem.excerpt || hotListItem.title;
    this.description = hotListItem.hotValue;
    this.id = hotListItem.id;
    this.command = {
      command: "zhihu-fisher.openArticle",
      title: "打开文章",
      arguments: [hotListItem],
    };
  }

  // 使用问答图标
  iconPath = new vscode.ThemeIcon("comment-discussion");

  contextValue = "TreeItem";
}

/**
 * 状态显示树节点（加载中、错误等）
 */
export class StatusTreeItem extends TreeItem {
  constructor(
    label: string,
    icon?: vscode.ThemeIcon,
    command?: vscode.Command | null,
    tooltip?: string
  ) {
    // 创建一个伪热榜项
    const statusItem: LinkItem = {
      id: `status-${Date.now()}-${Math.random()}`,
      title: label,
      excerpt: tooltip || "爬虫读取中，请耐心等待...",
      url: "",
    };

    super(statusItem, vscode.TreeItemCollapsibleState.None);

    // 覆盖默认图标
    if (icon) {
      this.iconPath = icon;
    }

    // 覆盖默认命令
    if (command) {
      this.command = command;
    } else {
      this.command = undefined; // 清除命令，状态项不可点击
    }
  }
}
