import * as Puppeteer from "puppeteer";
import * as vscode from "vscode";

/** 全局状态管理 */
export interface ContentStore {
  /** vscode 扩展上下文 */
  context: vscode.ExtensionContext | null;
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

    /** 知乎关注列表数据 */
    follow: {
      /** 是否正在加载关注 */
      isLoading: boolean;
      /** 关注列表 */
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

    /** 知乎收藏数据 */
    collections: {
      /** 是否正在加载收藏 */
      isLoading: boolean;
      /** 我创建的收藏夹列表 */
      myCollections: CollectionFolder[];
      /** 我关注的收藏夹列表 */
      followingCollections: CollectionFolder[];
      /** 当前用户信息 */
      userInfo: ZhihuUser | null;
      /** 我创建的收藏夹分页信息 */
      myCollectionsPagination: {
        currentPage: number;
        hasMore: boolean;
        isLoading: boolean;
      };
      /** 我关注的收藏夹分页信息 */
      followingCollectionsPagination: {
        currentPage: number;
        hasMore: boolean;
        isLoading: boolean;
      };
      /** 刷新状态 */
      refreshStates: {
        /** 是否正在刷新我创建的收藏夹 */
        isRefreshingMyCollections: boolean;
        /** 是否正在刷新我关注的收藏夹 */
        isRefreshingFollowingCollections: boolean;
      };
    };

    /** 知乎的Cookie */
    cookie: string;
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
  /** 内容类型：问题、文章或想法 */
  type?: "question" | "article" | "thought";
  /** 内容token，用于不喜欢API */
  contentToken?: string;
  /** 回答的完整URL，用于浏览器打开特定回答 */
  answerUrl?: string;
  /** 排序类型：用于区分同一问题的不同排序方式 */
  sortType?: "updated" | "default";
  /** 关注信息（仅关注列表使用） */
  followInfo?: {
    /** 关注者名称 */
    followerName: string;
    /** 关注者URL */
    followerUrl: string;
    /** 关注动作（如"赞同了回答"） */
    followAction: string;
    /** 关注时间 */
    followTime: string;
    /** 作者名称 */
    authorName: string;
    /** 作者头像 */
    authorAvatar: string;
    /** 作者URL */
    authorUrl: string;
    /** 作者标签 */
    authorBadge: string;
    /** 点赞数 */
    upvoteCount: string;
    /** 评论数 */
    commentCount: string;
    /** 原始内容类型：question(问题本身) | answer(回答) | article(文章) | thought(想法) */
    rawContentType?: string;
  };
  /** 想法信息（仅想法类型使用） */
  thoughtInfo?: {
    /** 想法ID (pinId) */
    pinId: string;
    /** 想法文本内容 */
    content: string;
    /** 发布时间 */
    publishTime: string;
    /** 链接卡片信息（如果有） */
    linkCard?: {
      /** 卡片标题 */
      title: string;
      /** 卡片描述 */
      description: string;
      /** 卡片链接 */
      url: string;
      /** 卡片缩略图 */
      thumbnail: string;
    };
    /** 点赞数 */
    likeCount: number;
    /** 评论数 */
    commentCount: number;
    /** 是否已点赞 */
    isLiked: boolean;
  };
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
  /** 来源类型 - 新增字段 */
  sourceType: "collection" | "recommend" | "hot" | "search" | "inner-link" | "follow" | "thought";
  /** 原始链接项数据 - 新增字段，用于查找列表位置 */
  originalItem: LinkItem;
  /** 收藏夹ID - 仅当sourceType为collection时有效 */
  collectionId?: string;
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
  /** 问题的详细介绍内容（展开后的完整内容） */
  questionDetail?: string;
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
  /** 预设的特定回答URL（用于收藏的回答） */
  presetAnswerUrl?: string;
  /** 目标回答ID（用于特定回答的处理） */
  targetAnswerId?: string;
  /** 预加载的特定回答内容 */
  preloadedAnswer?: any;
  /** 是否是特定回答模式 */
  isSpecificAnswer?: boolean;
  /** 特定回答的原始URL */
  specificAnswerUrl?: string;
  /** 用户对该文章的投票状态：1(赞同), -1(不赞同), 0(中立) */
  voteStatus?: 1 | -1 | 0;
  /** 文章点赞数（对于专栏文章） */
  likeCount?: number;
  /** 是否正在处理投票请求 */
  isVoting?: boolean;
  /** 相关问题列表 */
  relatedQuestions?: RelatedQuestion[];
  /** 当前回答的排序类型 */
  currentSortType?: "default" | "updated";
  /** 是否支持按时间排序（某些问题不支持时间排序） */
  supportTimeSort?: boolean;
  /** 想法内容（仅想法类型使用） */
  thoughtContent?: {
    /** 想法ID */
    pinId: string;
    /** 想法文本内容 */
    content: string;
    /** 发布时间 */
    publishTime: string;
    /** 链接卡片 */
    linkCard?: {
      /** 卡片标题 */
      title: string;
      /** 卡片描述 */
      description: string;
      /** 卡片链接 */
      url: string;
      /** 卡片缩略图 */
      thumbnail: string;
    };
    /** 点赞数 */
    likeCount: number;
    /** 评论数 */
    commentCount: number;
    /** 是否已点赞 */
    isLiked: boolean;
    /** 用户对该想法的投票状态 */
    voteStatus?: 1 | -1 | 0;
  };
}

/** 相关问题数据结构 */
export interface RelatedQuestion {
  /** 问题ID */
  id: string;
  /** 问题标题 */
  title: string;
  /** 问题URL */
  url: string;
  /** 回答数量 */
  answerCount: number;
  /** 关注数量 */
  followerCount: number;
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
  /** 用户对该回答的投票状态：up(赞同), down(不赞同), neutral(中立) */
  voteStatus?: "up" | "down" | "neutral";
  /** 是否正在处理投票请求 */
  isVoting?: boolean;
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
  /** 排序类型：default(默认排序) | updated(时间排序) */
  sortType?: "default" | "updated";
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
  /** 是否已关注该作者 */
  isFollowing?: boolean;
  /** 是否为想法作者（用于区分想法和回答） */
  isThoughtAuthor?: boolean;
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
    /** 这条评论的角色，如果是author说明该评论的作者，是回答的作者 */
    role: "author" | "normal";
  };
  /** 作者标签 */
  author_tag?: Array<{
    type: string;
    text: string;
    color: string;
    night_color: string;
    has_border: boolean;
    border_color?: string;
    border_night_color?: string;
  }>;
  /** 评论标签 */
  comment_tag?: Array<{
    type: string;
    text: string;
    color: string;
    night_color: string;
    has_border: boolean;
  }>;
  /** 回复的作者信息 */
  reply_to_author?: {
    id: string;
    url_token: string;
    name: string;
    avatar_url: string;
    avatar_url_template: string;
    is_org: boolean;
    type: string;
    url: string;
    user_type: string;
    headline: string;
    gender: number;
    is_advertiser: boolean;
    badge?: any[];
    vip_info?: any;
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
  /** 当前用户是否已点赞该评论（接口返回字段） */
  liked?: boolean;
  /** 当前用户是否已点赞该评论（内部使用字段） */
  is_liked?: boolean;
}

/**
 * 知乎树节点类
 */
export class TreeItem extends vscode.TreeItem {
  constructor(
    public readonly listItem: LinkItem,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    // 不再添加前缀标识，直接使用原标题
    super(listItem.title, collapsibleState);

    // 获取用户的媒体显示模式配置
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const mediaDisplayMode = config.get<string>("mediaDisplayMode", "normal");

    // 根据配置决定是否显示缩略图
    const shouldShowImage =
      listItem.imgUrl && listItem.imgUrl.trim() && mediaDisplayMode !== "none";

    // 设置图标：根据配置和图片可用性决定
    if (shouldShowImage) {
      try {
        this.iconPath = vscode.Uri.parse(listItem.imgUrl!);
      } catch (error) {
        console.warn(`解析图片URL失败: ${listItem.imgUrl}`, error);
        this.iconPath = new vscode.ThemeIcon("comment-discussion");
      }
    } else {
      // 根据内容类型设置不同的默认图标
      if (listItem.type === "article") {
        this.iconPath = new vscode.ThemeIcon("remote-explorer-documentation");
      } else if (listItem.type === "thought") {
        this.iconPath = new vscode.ThemeIcon("comment-draft");
      } else {
        this.iconPath = new vscode.ThemeIcon("comment-discussion");
      }
    }
    // 添加内容类型标识
    const typeLabel =
      listItem.type === "article"
        ? `**<span style="color:#2196F3;background-color:#2196F333;">&nbsp;文章&nbsp;</span>**`
        : listItem.type === "thought"
        ? `**<span style="color:#9C27B0;background-color:#9C27B033;">&nbsp;想法&nbsp;</span>**`
        : `**<span style="color:#f68b83;background-color:#f68b8333;">&nbsp;问题&nbsp;</span>**`;

    const link = listItem.answerUrl || listItem.url || "https://www.zhihu.com/";

    // 检查是否是关注的问题（只关注了问题，没有回答）
    const isFollowedQuestionOnly = 
      listItem.followInfo?.rawContentType === "question";

    // 设置工具提示：根据配置和图片可用性决定
    if (shouldShowImage) {
      const markdownTooltip = new vscode.MarkdownString();
      markdownTooltip.isTrusted = true;
      markdownTooltip.supportThemeIcons = true;
      markdownTooltip.supportHtml = true;

      // 如果有关注信息，先显示关注信息
      if (listItem.followInfo) {
        const info = listItem.followInfo;
        markdownTooltip.appendMarkdown(
          `👥 **[${info.followerName}](${info.followerUrl})** ${info.followAction}`
        );
        // 只有非"关注了问题"的情况才显示时间
        if (!isFollowedQuestionOnly && info.followTime) {
          markdownTooltip.appendMarkdown(` · ⏰ ${info.followTime}`);
        }
        markdownTooltip.appendMarkdown("\n\n");
        markdownTooltip.appendMarkdown("\n ___ \n\n");

        // 只有当不是"关注的问题"时才显示作者信息
        if (!isFollowedQuestionOnly && info.authorName) {
          markdownTooltip.appendMarkdown(
            `✍️ 作者：**[${info.authorName}](${info.authorUrl})**`
          );
          if (info.authorBadge) {
            markdownTooltip.appendMarkdown(` · 💼 *${info.authorBadge}*\n\n`);
          } else {
            markdownTooltip.appendMarkdown("\n\n");
          }
          if (info.authorAvatar) {
            markdownTooltip.appendMarkdown(
              `<img src="${info.authorAvatar}" alt="作者头像" width="50" style="border-radius: 50%;" />\n\n`
            );
          }
          markdownTooltip.appendMarkdown("\n ___ \n\n");
        }
      }

      markdownTooltip.appendMarkdown(
        `#### ${typeLabel} **${listItem.title}** \n`
      );
      markdownTooltip.appendMarkdown("\n ___ \n\n");

      if (listItem.hotValue) {
        markdownTooltip.appendMarkdown(`🔥 ${listItem.hotValue} 🔥\n\n`);
        markdownTooltip.appendMarkdown("\n ___ \n\n");
      }

      // 对于想法类型，title和excerpt是相同的，不需要重复显示excerpt
      if (listItem.excerpt && listItem.type !== "thought") {
        const excerpt = listItem.excerpt.replaceAll('~','-');
        markdownTooltip.appendMarkdown(`\n ${excerpt} \n\n`);
      }

      // 根据显示模式和缩放比例计算图片宽度
      let imageWidth: number;
      if (mediaDisplayMode === "normal") {
        imageWidth = 220; // 正常模式最大宽度220px
      } else if (mediaDisplayMode === "mini") {
        // 迷你模式：获取用户设置的缩放比例，最大宽度200px
        const miniMediaScale = config.get<number>("miniMediaScale", 50);
        const calculatedWidth = Math.round(200 * (miniMediaScale / 100));
        imageWidth = Math.min(calculatedWidth, 200); // 确保不超过200px
      } else {
        // none模式下不会走到这里，因为shouldShowImage已经为false
        imageWidth = 150;
      }

      // 只有当不是"关注的问题"时才显示点赞和评论数
      if (listItem.followInfo && !isFollowedQuestionOnly) {
        markdownTooltip.appendMarkdown(
          `\n___ \n\n 👍 ${listItem.followInfo.upvoteCount} 赞同 · 💬 ${listItem.followInfo.commentCount} 评论\n`
        );

        markdownTooltip.appendMarkdown("\n ___ \n\n");
      }

      markdownTooltip.appendMarkdown(
        `<img src="${listItem.imgUrl}" alt="预览图" width="${imageWidth}" />\n`
      );

      markdownTooltip.supportHtml = true;
      markdownTooltip.isTrusted = true;
      this.tooltip = markdownTooltip;
    } else {
      // 没有图片时的简单tooltip
      const simpleTooltip = new vscode.MarkdownString();
      simpleTooltip.isTrusted = true;
      simpleTooltip.supportThemeIcons = true;
      simpleTooltip.supportHtml = true;

      // 如果有关注信息，先显示关注信息
      if (listItem.followInfo) {
        const info = listItem.followInfo;
        simpleTooltip.appendMarkdown(
          `👥 **[${info.followerName}](${info.followerUrl})** ${info.followAction}`
        );
        // 只有非"关注了问题"的情况才显示时间
        if (!isFollowedQuestionOnly && info.followTime) {
          simpleTooltip.appendMarkdown(` · ⏰ ${info.followTime}`);
        }
        simpleTooltip.appendMarkdown("\n\n");
        simpleTooltip.appendMarkdown("\n ___ \n\n");

        // 只有当不是"关注的问题"时才显示作者信息
        if (!isFollowedQuestionOnly && info.authorName) {
          simpleTooltip.appendMarkdown(
            `✍️ 作者：**[${info.authorName}](${info.authorUrl})**`
          );
          if (info.authorBadge) {
            simpleTooltip.appendMarkdown(` · 💼 *${info.authorBadge}*\n\n`);
          } else {
            simpleTooltip.appendMarkdown("\n\n");
          }
          simpleTooltip.appendMarkdown("\n ___ \n\n");
        }
      }

      simpleTooltip.appendMarkdown(
        `#### ${typeLabel} **${listItem.title}**</p> \n`
      );

      if (listItem.hotValue) {
        simpleTooltip.appendMarkdown(`🔥 ${listItem.hotValue} 🔥\n\n`);
      }

      simpleTooltip.appendMarkdown("\n ___ \n\n");

      // 对于想法类型，title和excerpt是相同的，不需要重复显示excerpt
      if (listItem.excerpt && listItem.type !== "thought") {
        const excerpt = listItem.excerpt.replaceAll('~','-');
        simpleTooltip.appendMarkdown(excerpt);
      }

      // 只有当不是"关注的问题"时才显示点赞和评论数
      if (listItem.followInfo && !isFollowedQuestionOnly) {
        simpleTooltip.appendMarkdown(
          `\n___ \n\n 👍 ${listItem.followInfo.upvoteCount} 赞同 · 💬 ${listItem.followInfo.commentCount} 评论\n`
        );
      }

      this.tooltip = simpleTooltip;
    }

    this.tooltip.appendMarkdown(`\n ___ \n\n **[原文链接](${link})**  |  *按住 Alt 键将鼠标悬停* `);

    // 只有当热度值存在且不为空时才显示
    this.description =
      listItem.hotValue && listItem.hotValue.trim()
        ? listItem.hotValue.trim()
        : undefined;

    this.id = listItem.id;

    // 根据内容类型设置不同的命令标题
    const commandTitle = 
      listItem.type === "article" 
        ? "打开文章" 
        : listItem.type === "thought"
        ? "打开想法"
        : "打开问题";

    this.command = {
      command: "zhihu-fisher.openArticle",
      title: commandTitle,
      arguments: [listItem],
    };

    // 根据配置和图片可用性设置 contextValue
    // 如果是关注的问题（只关注了问题，没有回答），使用特殊的contextValue，不显示收藏按钮
    if (isFollowedQuestionOnly) {
      this.contextValue = shouldShowImage ? "FollowedQuestionWithImage" : "FollowedQuestion";
    } else if (listItem.type === "thought") {
      // 想法类型使用特殊的 contextValue 以支持右键菜单
      this.contextValue = shouldShowImage ? "ThoughtItemWithImage" : "ThoughtItem";
    } else {
      this.contextValue = shouldShowImage ? "TreeItemWithImage" : "TreeItem";
    }
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
    tooltip?: string | vscode.MarkdownString
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
      // 如果传入的是字符串，转换为 MarkdownString
      if (typeof tooltip === 'string') {
        this.tooltip = new vscode.MarkdownString(tooltip);
      } else {
        this.tooltip = tooltip;
      }
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

/** 知乎用户信息 */
export interface ZhihuUser {
  /** 用户ID */
  id: string;
  /** 用户令牌 */
  url_token: string;
  /** 用户姓名 */
  name: string;
  /** 头像URL */
  avatar_url: string;
  /** 用户类型 */
  type: string;
  /** 用户URL */
  url: string;
  /** 性别 */
  gender: number;
  /** 是否实名认证 */
  is_realname: boolean;
}

/** 收藏夹 */
export interface CollectionFolder {
  /** 收藏夹ID */
  id: string;
  /** 收藏夹标题 */
  title: string;
  /** 收藏夹URL */
  url: string;
  /** 收藏夹描述 */
  description?: string;
  /** 创建者信息 */
  creator?: {
    name: string;
    avatar_url: string;
    url_token: string;
  };
  /** 收藏夹内容列表 */
  items: CollectionItem[];
  /** 是否已加载完成 */
  isLoaded: boolean;
  /** 当前加载的偏移量 */
  currentOffset: number;
  /** 是否还有更多内容 */
  hasMore: boolean;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 收藏夹类型：我创建的 或 我关注的 */
  type: "created" | "following";
  /** 收藏夹总数 */
  totalCount?: number;
  /** 是否为私密收藏夹 */
  isPrivate?: boolean;
  /** 最后更新时间 */
  lastUpdated?: string;
}

/** 收藏项 */
export interface CollectionItem {
  /** 收藏项ID */
  id: string;
  /** 收藏的内容类型 */
  type: "answer" | "article" | "question";
  /** 收藏内容的URL */
  url: string;
  /** 收藏内容的标题 */
  title: string;
  /** 收藏内容的摘要 */
  excerpt: string;
  /** 作者信息 */
  author?: {
    name: string;
    avatar_url: string;
    url_token: string;
  };
  /** 问题信息（对于回答类型） */
  question?: {
    title: string;
    url: string;
    id: string;
  };
  /** 收藏时间 */
  created: string;
  /** 缩略图 */
  thumbnail?: string;
}

/** 收藏夹信息 */
export interface CollectionInfo {
  /** 收藏夹ID */
  id: string;
  /** 收藏夹类型 */
  type: string;
  /** 收藏夹标题 */
  title: string;
  /** 是否公开 */
  is_public: boolean;
  /** 收藏夹URL */
  url: string;
  /** 收藏夹描述 */
  description: string;
  /** 关注者数量 */
  follower_count: number;
  /** 回答数量 */
  answer_count: number;
  /** 条目数量 */
  item_count: number;
  /** 点赞数量 */
  like_count: number;
  /** 查看数量 */
  view_count: number;
  /** 评论数量 */
  comment_count: number;
  /** 是否正在关注 */
  is_following: boolean;
  /** 是否点赞 */
  is_liking: boolean;
  /** 创建时间 */
  created_time: number;
  /** 更新时间 */
  updated_time: number;
  /** 创建者信息 */
  creator: {
    id: string;
    type: string;
    is_following: boolean;
    avatar_url: string;
    headline: string;
    user_type: string;
    gender: number;
    url: string;
    name: string;
    is_followed: boolean;
    badge: any[];
  };
  /** 是否已收藏 */
  is_favorited: boolean;
  /** 是否为默认收藏夹 */
  is_default: boolean;
}
