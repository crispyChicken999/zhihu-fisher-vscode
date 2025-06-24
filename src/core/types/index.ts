import * as Puppeteer from "puppeteer";
import * as vscode from "vscode";

/** 全局状态管理 */
export interface ContentStore {
  /** 打开的所有页面构成的列表 */
  webviewMap: Map<string, WebViewItem>;

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

    /** 知乎热榜列表数据 */
    hot: {
      /** 是否正在加载热榜 */
      isLoading: boolean;
      /** 热榜列表 */
      list: LinkItem[];
    };

    /** 知乎搜索数据 */
    search: {
      /** 是否正在搜索 */
      isLoading: boolean;
      /** 当前搜索关键词 */
      currentQuery: string;
      /** 搜索结果列表 */
      list: LinkItem[];
    };

    /** 知乎的Cookie */
    cookieInfo: CookieInfo;
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
  /** 回答的评论列表（存储所有已加载的评论） */
  commentList: CommentItem[];
  /** 评论区的状态，收起|展开 */
  commentStatus: "collapsed" | "expanded";
  /** 回答的评论分页参数 */
  commentPaging: {
    /** 是否到最后一页了（当已加载的评论数量 commentList.length + commentList评论中的子评论数量总和 >= totals时为true） */
    is_end: boolean;
    /** 是否是第一页（当current为1时为true） */
    is_start: boolean;
    /** 下一页的接口URL */
    next: string | null;
    /** 上一页的接口URL */
    previous: string | null;
    /** 全部的评论数量 */
    totals: number;
    /** 已加载的评论数量（由commentList.length + commentList.reduce((acc,cur)=> acc += cur.child_comment_count),0)决定） */
    loadedTotals: number;
    /** 当前页码 */
    current: number;
    /** 每页大小 */
    limit: number;
  };
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

/** 评论数据结构 */
export interface CommentItem {
  /** 评论的ID */
  id: string;
  /** 评论的内容 */
  content: string;
  /** 评论的发布时间 */
  created_time: number;
  /** 评论的作者信息 */
  author: {
    /** 作者的ID */
    id: string;
    /** 作者主页URL 需要replace 'api/v4/comment_v5' 为空  */
    url: string;
    /** 作者的名称 */
    name: string;
    /** 作者的签名 */
    headline: string;
    /** 作者的头像 */
    avatar_url: string;
  };
  /** 评论的点赞数 */
  vote_count: number;
  /** 评论的分页参数（用于子评论） */
  commentPaging: {
    /** 是否到最后一页了（当total_child_comments.length >= child_comment_count时为true） */
    is_end: boolean;
    /** 是否是第一页（当current为1时为true） */
    is_start: boolean;
    /** 下一页的接口URL */
    next: string | null;
    /** 上一页的接口URL */
    previous: string | null;
    /** 全部的评论数量 */
    totals: number;
    /** 已加载的评论数量（total_child_comments.length） */
    loadedTotals: number;
    /** 当前页码 */
    current: number;
    /** 每页大小 */
    limit: number;
    /** 下一页的api请求参数 */
    next_offset: string | null;
    /** 上一页的api请求参数 */
    previous_offset: string | null;
  };
  /** 接口返回的当前分页子评论（用于临时存储API返回的当前页评论） */
  child_comments: CommentItem[];
  /** 该条评论的回复总数，如果总数大于total_child_comments.length则认为有更多的回答 */
  child_comment_count: number;
  /** 已加载的所有子评论（存储所有已加载的子评论） */
  total_child_comments: CommentItem[];
  /** 评论的点赞数 */
  like_count: number;
}
/** Cookie对象信息 */
export interface CookieInfo {
  cookie: string;
  lastUpdated?: number | null; // 时间戳，记录上次更新时间
}

/**
 * 知乎树节点类
 */
export class TreeItem extends vscode.TreeItem {
  constructor(
    public readonly listItem: LinkItem,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(listItem.title, collapsibleState);

    // 获取用户的媒体显示模式配置
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const mediaDisplayMode = config.get<string>("mediaDisplayMode", "normal");

    // 根据配置决定是否显示缩略图
    const shouldShowImage =
      listItem.imgUrl && listItem.imgUrl.trim();

    // 设置图标：根据配置和图片可用性决定
    if (shouldShowImage) {
      try {
        this.iconPath = vscode.Uri.parse(listItem.imgUrl!);
      } catch (error) {
        console.warn(`解析图片URL失败: ${listItem.imgUrl}`, error);
        this.iconPath = new vscode.ThemeIcon("comment-discussion");
      }
    } else {
      this.iconPath = new vscode.ThemeIcon("comment-discussion");
    }

    // 设置工具提示：根据配置和图片可用性决定
    if (shouldShowImage) {
      const markdownTooltip = new vscode.MarkdownString();
      markdownTooltip.appendMarkdown(`#### **${listItem.title}**\n\n`);

      if (listItem.hotValue) {
        markdownTooltip.appendMarkdown(`🔥 ${listItem.hotValue} 🔥\n\n`);
      }

      markdownTooltip.appendMarkdown("\n ___ \n\n");

      if (listItem.excerpt) {
        const excerptPreview = listItem.excerpt;
        markdownTooltip.appendMarkdown(`${excerptPreview}\n\n`);
      }

      // 根据显示模式设置图片宽度
      const imageWidth = mediaDisplayMode !== "normal" ? 150 : 300;
      markdownTooltip.appendMarkdown(
        `<img src="${listItem.imgUrl}" alt="预览图" width="${imageWidth}" />\n`
      );

      markdownTooltip.supportHtml = true;
      markdownTooltip.isTrusted = true;
      this.tooltip = markdownTooltip;
    } else {
      // 没有图片时的简单tooltip
      const simpleTooltip = new vscode.MarkdownString();
      simpleTooltip.appendMarkdown(`#### **${listItem.title}**\n\n`);

      if (listItem.hotValue) {
        simpleTooltip.appendMarkdown(`🔥 ${listItem.hotValue} 🔥\n\n`);
      }

      simpleTooltip.appendMarkdown("\n ___ \n\n");

      if (listItem.excerpt) {
        simpleTooltip.appendMarkdown(listItem.excerpt);
      }
      this.tooltip = simpleTooltip;
    } // 只有当热度值存在且不为空时才显示
    this.description =
      listItem.hotValue && listItem.hotValue.trim()
        ? listItem.hotValue.trim()
        : undefined;

    this.id = listItem.id;
    this.command = {
      command: "zhihu-fisher.openArticle",
      title: "打开文章",
      arguments: [listItem],
    };

    // 根据配置和图片可用性设置 contextValue
    this.contextValue = shouldShowImage ? "TreeItemWithImage" : "TreeItem";
  }
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
    const statusItem: any = {
      id: `status-${Date.now()}-${Math.random()}`,
      title: label,
      excerpt: "爬虫读取中，请耐心等待...",
      url: "",
    };

    super(statusItem, vscode.TreeItemCollapsibleState.None);

    // 覆盖默认图标
    if (icon) {
      this.iconPath = icon;
    }

    // 覆盖默认tooltip
    if (tooltip) {
      this.tooltip = tooltip;
    } else {
      this.tooltip = new vscode.MarkdownString(label);
    }

    // 覆盖默认命令
    if (command) {
      this.command = command;
    } else {
      this.command = undefined; // 清除命令，状态项不可点击
    }

    this.contextValue = "StatusTreeItem";
  }
}
