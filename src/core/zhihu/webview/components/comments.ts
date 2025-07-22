import axios from "axios";
import * as vscode from "vscode";
import * as cheerio from "cheerio";
import { Store } from "../../../stores";
import { CommentItem } from "../../../types";
import { WebViewItem } from "../../../types";
import { CookieManager } from "../../cookie";
import { Component, RenderOptions } from "./base";

/**
 * 评论容器组件
 * 负责管理评论区域的初始状态和加载后状态
 */
export class CommentsContainerComponent implements Component {
  private webviewId: string;
  private answerId: string;
  private commentCount: number;
  private options: RenderOptions;
  private modalContainerClass: string;
  private isLoaded: boolean = false;

  /**
   * 构造函数
   * @param webviewId 当前WebView的ID
   * @param answerId 回答ID
   * @param commentCount 评论数量
   * @param options 渲染选项
   */
  constructor(
    webviewId: string,
    answerId: string,
    commentCount: number,
    options: RenderOptions
  ) {
    this.webviewId = webviewId;
    this.answerId = answerId;
    this.commentCount = commentCount;
    this.options = options;

    // 根据媒体显示模式设置类名
    const mediaDisplayMode = this.options.mediaDisplayMode || "normal";
    this.modalContainerClass =
      {
        none: "hide-media",
        mini: "mini-media",
        normal: "",
      }[mediaDisplayMode] || "";
  }

  /**
   * 渲染评论容器组件
   * @returns 评论容器的HTML
   */
  public render(): string {
    // 评论区容器
    let commentsContainer = `
      <div class="comments-container ${this.modalContainerClass}" data-answer-id="${this.answerId}">
        <button class="zhihu-load-comments-btn" onclick="loadComments('${this.answerId}')" tooltip="按(，)加载评论" placement="right">
          加载评论 (${this.commentCount})
        </button>
      </div>
    `;

    // 如果已经加载过评论了，那么恢复之前的状态
    const webviewItem = Store.webviewMap.get(this.webviewId) as WebViewItem;
    const currentAnswerIndex = webviewItem.article.currentAnswerIndex;
    const currentAnswer = webviewItem.article.answerList[currentAnswerIndex];
    const currentAnswerPaging = currentAnswer.commentPaging;

    // 评论区的状态 展开|收起
    const commentStatus = currentAnswer.commentStatus || "collapsed";

    this.isLoaded =
      (currentAnswer && currentAnswer.commentList.length > 0) || false;

    if (this.isLoaded) {
      // 如果评论区是展开状态，则显示评论列表
      if (commentStatus === "expanded") {
        // 根据当前页码截取要显示的评论
        const startIndex =
          (currentAnswerPaging.current - 1) * currentAnswerPaging.limit;
        const endIndex = Math.min(
          startIndex + currentAnswerPaging.limit,
          currentAnswer.commentList.length
        );
        const displayComments = currentAnswer.commentList.slice(
          startIndex,
          endIndex
        );

        // 检查是否为专栏（通过URL判断）
        const contentType = webviewItem.url.includes("zhuanlan.zhihu.com")
          ? "article"
          : "question";

        commentsContainer = `
          <div class="comments-container ${
            this.modalContainerClass
          }" data-answer-id="${this.answerId}">
            ${CommentsManager.createCommentsComponent(
              displayComments,
              this.answerId,
              currentAnswerPaging,
              this.options,
              contentType
            ).render()}
          </div>
        `;
      } else {
        // 如果评论区是收起状态，则显示展开按钮
        commentsContainer = `
          <div class="comments-container ${this.modalContainerClass}" data-answer-id="${this.answerId}">
            <button class="zhihu-load-comments-btn" onclick="toggleCommentStatus('${this.answerId}')" data-answer-id="${this.answerId}" tooltip="按(，)展开/收起评论" placement="right">
              展开评论 (${this.commentCount})
            </button>
          </div>
        `;
      }
    }

    // 评论弹窗容器
    const modalContainer = `
      <div class="comments-modal-container ${this.modalContainerClass}"></div>
    `;

    return `
      <!-- 评论区容器 内容|加载按钮 -->
      ${commentsContainer}

      <!-- 评论弹窗容器 -->
      ${modalContainer}
    `;
  }
}

/**
 * 评论组件
 * 负责处理知乎回答的评论显示
 */
export class CommentsComponent implements Component {
  private comments: CommentItem[];
  private answerId: string;
  private paging: any;
  private options: RenderOptions;
  private contentType: "question" | "article";

  /**
   * 构造函数
   * @param comments 评论列表
   * @param answerId 回答ID
   * @param paging 分页信息
   * @param options 渲染选项
   * @param contentType 内容类型
   */
  constructor(
    comments: CommentItem[],
    answerId: string,
    paging: any,
    options: RenderOptions,
    contentType: "question" | "article" = "question"
  ) {
    this.comments = comments || [];
    this.answerId = answerId;
    this.paging = paging || {
      is_end: true,
      is_start: true,
      totals: 0,
      current: 1,
    };
    this.options = options || {};
    this.contentType = contentType;
  }

  /**
   * 渲染评论组件
   * @returns 评论HTML
   */
  public render(): string {
    // 生成分页按钮
    const paginationHtml = this.renderPagination();

    // 如果是最后一页且没有评论，仍然显示分页器（可能需要返回上一页）
    if (!this.comments || this.comments.length === 0) {
      return this.renderEmptyComments(paginationHtml);
    }

    // 解析并处理评论内容
    const commentsHtml = this.comments
      .map((comment) => this.renderSingleComment(comment))
      .join("");

    return `
      <div class="zhihu-comments-container" data-answer-id="${this.answerId}">
        <div class="zhihu-comments-header">
          <h3>全部评论 (${this.paging.totals})</h3>
          <div class="zhihu-comments-tips">
            <span>键盘</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <path fill="currentColor" d="m10 17l2-4H9V7h6v6l-2 4zM5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2m0 2v14h14V5z"/>
              </svg>
            <span>快速展开/收起评论</span>
          </div>
        </div>
        ${paginationHtml}
        <div class="zhihu-comments-list">
          ${commentsHtml}
        </div>
      </div>
    `;
  }

  /**
   * 渲染空评论状态
   * @param paginationHtml 分页器HTML，确保评论为空时也能显示分页器
   */
  private renderEmptyComments(paginationHtml: string = ""): string {
    return `
      <div class="zhihu-comments-container" data-answer-id="${this.answerId}">
        <div class="zhihu-comments-header">
          <h3>全部评论 (${this.paging.totals})</h3>
          <div class="zhihu-comments-tips">
            <span>键盘</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <path fill="currentColor" d="m10 17l2-4H9V7h6v6l-2 4zM5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2m0 2v14h14V5z"/>
              </svg>
            <span>快速展开/收起评论</span>
          </div>
        </div>
        ${paginationHtml}
        <div class="zhihu-comments-list">
          <div style="text-align: center; padding: 20px; color: var(--vscode-descriptionForeground);">
            暂无评论
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 渲染单条评论
   * @param comment 评论数据
   */
  private renderSingleComment(comment: CommentItem): string {
    const author = comment.author;
    const avatarUrl = author.avatar_url || "";
    const authorName = author.name || "匿名用户";
    const authorHeadline = author.headline || "";
    const authorUrl = author.url?.replace("api/v4/", "") || "";

    // 处理评论内容中的图片
    const mediaDisplayMode = this.options.mediaDisplayMode || "normal";
    const formattedContent = CommentsUtils.processCommentContent(
      comment.content || "",
      mediaDisplayMode
    );
    const voteCount = comment.vote_count || 0;
    const createdTime = CommentsUtils.formatTime(comment.created_time);

    // 渲染评论标签（移到footer）
    let commentTagsHtml = "";
    if (comment.comment_tag && comment.comment_tag.length > 0) {
      commentTagsHtml = comment.comment_tag.map((tag) => tag.text).join(" · ");
    }

    // 处理回复关系 - 在作者栏显示
    let authorDisplayHtml = "";
    const hasReplyTo = comment.reply_to_author && comment.reply_to_author.name;

    // 处理作者标签
    let authorTagsHtml = "";
    if (comment.author_tag && comment.author_tag.length > 0) {
      authorTagsHtml = comment.author_tag
        .map((tag) => {
          const borderStyle = tag.has_border
            ? `border: 1px solid ${tag.border_color || tag.color};`
            : "";
          return `
            <span class="author-tag" style="
              color: ${tag.color};
              background-color: ${tag.color}15;
              ${borderStyle}
              padding: 1px 4px;
              border-radius: 2px;
              font-size: 10px;
              margin-left: 4px;
              display: inline-block;
            ">${tag.text}</span>
          `;
        })
        .join("");
    }

    if (hasReplyTo) {
      // 有回复关系：显示 作者 -> 回复作者，不显示签名
      const replyToAuthor = comment.reply_to_author!;
      const replyToAuthorUrl =
        replyToAuthor.url?.replace("api/v4/comment_v5/", "") || "";
      const replyToAvatarUrl = replyToAuthor.avatar_url || "";
      const replyToAuthorName = replyToAuthor.name || "匿名用户";

      authorDisplayHtml = `
        <div class="zhihu-comment-author">
          <div class="zhihu-comment-author-name zhihu-reply-chain">
            <a href="${authorUrl}" title="点击查看作者【${authorName}】知乎首页">${authorName}</a>
            ${authorTagsHtml}
            <span class="reply-arrow" title="向...回复">→</span>
            <img class="zhihu-reply-to-avatar" src="${replyToAvatarUrl}" alt="${replyToAuthorName}" referrerpolicy="no-referrer">
            <a href="${replyToAuthorUrl}" title="点击查看作者【${replyToAuthorName}】知乎首页">${replyToAuthorName}</a>
          </div>
        </div>
      `;
    } else {
      // 无回复关系：正常显示作者和签名
      authorDisplayHtml = `
        <div class="zhihu-comment-author">
          <div class="zhihu-comment-author-name">
            <a href="${authorUrl}" title="点击查看作者【${authorName}】知乎首页">${authorName}</a>
            ${authorTagsHtml}
          </div>
          ${
            authorHeadline
              ? `<div class="zhihu-comment-author-headline" title="${authorHeadline}">${authorHeadline}</div>`
              : ""
          }
        </div>
      `;
    }

    // 子评论HTML
    let childCommentsHtml = "";
    if (comment.child_comments && comment.child_comments.length > 0) {
      childCommentsHtml = `
        <div class="zhihu-child-comments">
          ${comment.child_comments
            .map((child) => {
              const childAuthor = child.author;
              const childAvatarUrl = childAuthor.avatar_url || "";
              const childAuthorName = childAuthor.name || "匿名用户";
              const childAuthorUrl =
                childAuthor.url?.replace("api/v4/", "") || "";
              const childAuthorHeadline = childAuthor.headline || "";
              // 处理子评论内容中的图片
              const childFormattedContent = CommentsUtils.processCommentContent(
                child.content || "",
                mediaDisplayMode
              );
              const childVoteCount = child.vote_count || 0;

              // 渲染子评论标签（移到footer）
              let childCommentTagsHtml = "";
              if (child.comment_tag && child.comment_tag.length > 0) {
                childCommentTagsHtml = child.comment_tag
                  .map((tag) => tag.text)
                  .join(" · ");
              }

              // 处理子评论的回复关系 - 在作者栏显示
              let childAuthorDisplayHtml = "";
              const childHasReplyTo =
                child.reply_to_author && child.reply_to_author.name;

              // 处理子评论的作者标签
              let childAuthorTagsHtml = "";
              if (child.author_tag && child.author_tag.length > 0) {
                childAuthorTagsHtml = child.author_tag
                  .map((tag) => {
                    const borderStyle = tag.has_border
                      ? `border: 1px solid ${tag.border_color || tag.color};`
                      : "";
                    return `
                      <span class="author-tag" style="
                        color: ${tag.color};
                        background-color: ${tag.color}15;
                        ${borderStyle}
                        padding: 1px 4px;
                        border-radius: 2px;
                        font-size: 10px;
                        margin-left: 4px;
                        display: inline-block;
                      ">${tag.text}</span>
                    `;
                  })
                  .join("");
              }

              if (childHasReplyTo) {
                // 有回复关系：显示 作者 -> 回复作者，不显示签名
                const replyToAuthor = child.reply_to_author!;
                const replyToAuthorUrl =
                  replyToAuthor.url?.replace("api/v4/comment_v5/", "") || "";
                const replyToAvatarUrl = replyToAuthor.avatar_url || "";
                const replyToAuthorName = replyToAuthor.name || "匿名用户";

                childAuthorDisplayHtml = `
                  <div>
                    <div class="zhihu-child-comment-author-name zhihu-reply-chain">
                      <a href="${childAuthorUrl}" title="点击查看作者【${childAuthorName}】知乎首页">${childAuthorName}</a>
                      ${childAuthorTagsHtml}
                      <span class="reply-arrow" title="向...回复">→</span>
                      <img class="zhihu-reply-to-avatar" src="${replyToAvatarUrl}" alt="${replyToAuthorName}" referrerpolicy="no-referrer">
                      <a href="${replyToAuthorUrl}" title="点击查看作者【${replyToAuthorName}】知乎首页">${replyToAuthorName}</a>
                    </div>
                  </div>
                `;
              } else {
                // 无回复关系：正常显示作者和签名
                childAuthorDisplayHtml = `
                  <div>
                    <div class="zhihu-child-comment-author-name">
                      <a href="${childAuthorUrl}" title="点击查看作者【${childAuthorName}】知乎首页">${childAuthorName}</a>
                      ${childAuthorTagsHtml}
                    </div>
                    ${
                      childAuthorHeadline
                        ? `<div class="zhihu-child-comment-author-headline" title="${childAuthorHeadline}">${childAuthorHeadline}</div>`
                        : ""
                    }
                  </div>
                `;
              }

              return `
              <div class="zhihu-child-comment">
                <div class="zhihu-child-comment-header">
                  <img class="zhihu-child-comment-avatar" src="${childAvatarUrl}" alt="${childAuthorName}" referrerpolicy="no-referrer">
                  ${childAuthorDisplayHtml}
                </div>
                <div class="zhihu-child-comment-content">${childFormattedContent}</div>
                <div class="zhihu-child-comment-footer">
                  <span>${CommentsUtils.formatTime(child.created_time)}</span>
                  ${childCommentTagsHtml ? ` · ${childCommentTagsHtml}` : ""}
                  ${
                    childVoteCount > 0
                      ? ` · <span>${childVoteCount}赞</span>`
                      : ""
                  }
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
      `;
    }

    // 查看更多子评论按钮
    let showMoreChildCommentsButton = "";
    if (comment.child_comment_count > (comment.child_comments?.length || 0)) {
      showMoreChildCommentsButton = `
        <button class="zhihu-show-all-replies-btn" onclick="loadAllChildComments('${comment.id}')">
          查看全部 ${comment.child_comment_count} 条回复
        </button>
      `;
    }

    return `
      <div class="zhihu-comment" data-comment-id="${comment.id}">
        <div class="zhihu-comment-header">
          <img class="zhihu-comment-avatar" src="${avatarUrl}" alt="${authorName}" referrerpolicy="no-referrer">
          ${authorDisplayHtml}
        </div>
        <div class="zhihu-comment-content">${formattedContent}</div>
        <div class="zhihu-comment-footer">
          <span>${createdTime}</span>
          ${commentTagsHtml ? ` · ${commentTagsHtml}` : ""}
          ${
            voteCount > 0
              ? ` · <span class="zhihu-comment-like">${voteCount}赞</span>`
              : ""
          }
        </div>
        ${childCommentsHtml}
        ${showMoreChildCommentsButton}
      </div>
    `;
  }

  /**
   * 渲染分页按钮
   */
  private renderPagination(): string {
    // 专栏和问题使用不同的分页逻辑
    if (this.contentType === "article") {
      return this.renderArticlePagination();
    } else {
      return this.renderQuestionPagination();
    }
  }

  /**
   * 渲染问题评论分页按钮
   */
  private renderQuestionPagination(): string {
    const currentPage = this.paging.current || 1;
    const isFirstPage = currentPage === 1;
    // 简化逻辑：只要当前请求回来的评论数据小于limit，就认为是最后一页
    const isLastPage = this.paging.is_end;

    return `
      <div class="zhihu-comment-pagination">
        <button
          ${isFirstPage ? "disabled" : ""}
          onclick="loadMoreComments('${this.answerId}', ${currentPage - 1})"
          class="prev-button"
          title="上一页"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          上一页
        </button>
        <span class="page-info">第 ${currentPage} 页</span>
        <button
          ${isLastPage ? "disabled" : ""}
          onclick="loadMoreComments('${this.answerId}', ${currentPage + 1})"
          class="next-button"
          title="下一页"
        >
          下一页
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    `;
  }

  /**
   * 渲染专栏评论分页按钮
   */
  private renderArticlePagination(): string {
    const isFirstPage = this.paging.is_start;
    const isLastPage = this.paging.is_end;
    const currentPage = this.paging.current || 1;

    return `
      <div class="zhihu-comment-pagination">
        <button
          ${isFirstPage ? "disabled" : ""}
          onclick="loadArticleComments('${this.answerId}', 'previous')"
          class="prev-button"
          title="上一页"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          上一页
        </button>
        <span class="page-info">第 ${currentPage} 页</span>
        <button
          ${isLastPage ? "disabled" : ""}
          onclick="loadArticleComments('${this.answerId}', 'next')"
          class="next-button"
          title="下一页"
        >
          下一页
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    `;
  }

  /**
   * 创建子评论弹窗组件
   * @param parentComment 父评论
   * @param childComments 子评论列表
   * @param paging 分页信息
   */
  public static createChildCommentsModal(
    parentComment: CommentItem,
    childComments: CommentItem[],
    paging: any
  ): string {
    return new ChildCommentsModalComponent(
      parentComment,
      childComments,
      paging
    ).render();
  }
}

/**
 * 子评论弹窗组件
 */
export class ChildCommentsModalComponent implements Component {
  private parentComment: CommentItem;
  private childComments: CommentItem[];
  private paging: any;

  /**
   * 构造函数
   * @param parentComment 父评论
   * @param childComments 子评论列表
   * @param paging 分页信息
   */
  constructor(
    parentComment: CommentItem,
    childComments: CommentItem[],
    paging: any
  ) {
    this.parentComment = parentComment;
    this.childComments = childComments || [];
    this.paging = paging || {};
  }

  /**
   * 渲染子评论弹窗
   */
  public render(): string {
    // 父评论信息
    const author = this.parentComment.author;
    const avatarUrl = author.avatar_url || "";
    const authorUrl = author.url?.replace("api/v4/", "") || "";
    const authorName = author.name || "匿名用户";
    const authorHeadline = author.headline || "";
    // 获取媒体显示模式（这里需要从全局配置获取）
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const mediaDisplayMode = config.get<string>("mediaDisplayMode", "normal");
    const formattedContent = CommentsUtils.processCommentContent(
      this.parentComment.content || "",
      mediaDisplayMode
    );
    const voteCount = this.parentComment.vote_count || 0;
    const createdTime = CommentsUtils.formatTime(
      this.parentComment.created_time
    );

    // 渲染父评论标签（移到footer）
    let parentCommentTagsHtml = "";
    if (
      this.parentComment.comment_tag &&
      this.parentComment.comment_tag.length > 0
    ) {
      parentCommentTagsHtml = this.parentComment.comment_tag
        .map((tag) => tag.text)
        .join(" · ");
    }

    // 处理父评论的回复关系 - 在作者栏显示
    let parentAuthorDisplayHtml = "";
    const parentHasReplyTo =
      this.parentComment.reply_to_author &&
      this.parentComment.reply_to_author.name;

    // 处理父评论的作者标签
    let parentAuthorTagsHtml = "";
    if (
      this.parentComment.author_tag &&
      this.parentComment.author_tag.length > 0
    ) {
      parentAuthorTagsHtml = this.parentComment.author_tag
        .map((tag) => {
          const borderStyle = tag.has_border
            ? `border: 1px solid ${tag.border_color || tag.color};`
            : "";
          return `
            <span class="author-tag" style="
              color: ${tag.color};
              background-color: ${tag.color}15;
              ${borderStyle}
              padding: 1px 4px;
              border-radius: 2px;
              font-size: 10px;
              margin-left: 4px;
              display: inline-block;
            ">${tag.text}</span>
          `;
        })
        .join("");
    }

    if (parentHasReplyTo) {
      // 有回复关系：显示 作者 -> 回复作者，不显示签名
      const replyToAuthor = this.parentComment.reply_to_author!;
      const replyToAuthorUrl =
        replyToAuthor.url?.replace("api/v4/comment_v5/", "") || "";
      const replyToAvatarUrl = replyToAuthor.avatar_url || "";
      const replyToAuthorName = replyToAuthor.name || "匿名用户";

      parentAuthorDisplayHtml = `
        <div class="zhihu-comment-author">
          <div class="zhihu-comment-author-name zhihu-reply-chain">
            <a href="${authorUrl}" title="点击查看作者【${authorName}】知乎首页">${authorName}</a>
            ${parentAuthorTagsHtml}
            <span class="reply-arrow" title="向...回复">→</span>
            <img class="zhihu-reply-to-avatar" src="${replyToAvatarUrl}" alt="${replyToAuthorName}" referrerpolicy="no-referrer">
            <a href="${replyToAuthorUrl}" title="点击查看作者【${replyToAuthorName}】知乎首页">${replyToAuthorName}</a>
          </div>
        </div>
      `;
    } else {
      // 无回复关系：正常显示作者和签名
      parentAuthorDisplayHtml = `
        <div class="zhihu-comment-author">
          <div class="zhihu-comment-author-name">
            <a href="${authorUrl}" title="点击查看作者【${authorName}】知乎首页">${authorName}</a>
            ${parentAuthorTagsHtml}
          </div>
          ${
            authorHeadline
              ? `<div class="zhihu-comment-author-headline" title="${authorHeadline}">${authorHeadline}</div>`
              : ""
          }
        </div>
      `;
    }

    // 子评论HTML列表
    const childCommentsHtml = this.childComments
      .map((child) => {
        const childAuthor = child.author;
        const childAvatarUrl = childAuthor.avatar_url || "";
        const childAuthorName = childAuthor.name || "匿名用户";
        const childAuthorUrl =
          childAuthor.url?.replace("api/v4/comment_v5/", "") || "";
        const childAuthorHeadline = childAuthor.headline || "";
        // 处理子评论内容中的图片
        const childFormattedContent = CommentsUtils.processCommentContent(
          child.content || "",
          mediaDisplayMode
        );
        const childVoteCount = child.like_count || 0;
        const childCreatedTime = CommentsUtils.formatTime(child.created_time);

        // 渲染子评论标签（移到footer）
        let childCommentTagsHtml = "";
        if (child.comment_tag && child.comment_tag.length > 0) {
          childCommentTagsHtml = child.comment_tag
            .map((tag) => tag.text)
            .join(" · ");
        }

        // 处理子评论的回复关系 - 在作者栏显示
        let childAuthorDisplayHtml = "";
        const childHasReplyTo =
          child.reply_to_author && child.reply_to_author.name;

        // 处理子评论的作者标签
        let childAuthorTagsHtml = "";
        if (child.author_tag && child.author_tag.length > 0) {
          childAuthorTagsHtml = child.author_tag
            .map((tag) => {
              const borderStyle = tag.has_border
                ? `border: 1px solid ${tag.border_color || tag.color};`
                : "";
              return `
                <span class="author-tag" style="
                  color: ${tag.color}; 
                  background-color: ${tag.color}15;
                  ${borderStyle}
                  padding: 1px 4px; 
                  border-radius: 2px; 
                  font-size: 10px; 
                  margin-left: 4px;
                  display: inline-block;
                ">${tag.text}</span>
              `;
            })
            .join("");
        }

        if (childHasReplyTo) {
          // 有回复关系：显示 作者 -> 回复作者，不显示签名
          const replyToAuthor = child.reply_to_author!;
          const replyToAuthorUrl =
            replyToAuthor.url?.replace("api/v4/comment_v5/", "") || "";
          const replyToAvatarUrl = replyToAuthor.avatar_url || "";
          const replyToAuthorName = replyToAuthor.name || "匿名用户";

          childAuthorDisplayHtml = `
            <div class="zhihu-comment-author">
              <div class="zhihu-comment-author-name zhihu-reply-chain">
                <a href="${childAuthorUrl}" title="点击查看作者【${childAuthorName}】知乎首页">${childAuthorName}</a>
                ${childAuthorTagsHtml}
                <span class="reply-arrow" title="向...回复">→</span>
                <img class="zhihu-reply-to-avatar" src="${replyToAvatarUrl}" alt="${replyToAuthorName}" referrerpolicy="no-referrer">
                <a href="${replyToAuthorUrl}" title="点击查看作者【${replyToAuthorName}】知乎首页">${replyToAuthorName}</a>
              </div>
            </div>
          `;
        } else {
          // 无回复关系：正常显示作者和签名
          childAuthorDisplayHtml = `
            <div class="zhihu-comment-author">
              <div class="zhihu-comment-author-name">
                <a href="${childAuthorUrl}" title="点击查看作者【${childAuthorName}】知乎首页">${childAuthorName}</a>
                ${childAuthorTagsHtml}
              </div>
              ${
                childAuthorHeadline
                  ? `<div class="zhihu-comment-author-headline" title="${childAuthorHeadline}">${childAuthorHeadline}</div>`
                  : ""
              }
            </div>
          `;
        }

        return `
        <div class="zhihu-comment">
          <div class="zhihu-comment-header">
            <img class="zhihu-comment-avatar" src="${childAvatarUrl}" alt="${childAuthorName}" referrerpolicy="no-referrer">
            ${childAuthorDisplayHtml}
          </div>
          <div class="zhihu-comment-content">${childFormattedContent}</div>
          <div class="zhihu-comment-footer">
            <span>${childCreatedTime}</span>
            ${childCommentTagsHtml ? ` · ${childCommentTagsHtml}` : ""}
            ${
              childVoteCount > 0
                ? ` · <span class="zhihu-comment-like">${childVoteCount}赞</span>`
                : ""
            }
          </div>
        </div>
      `;
      })
      .join("");

    // 分页按钮
    const currentPage = this.paging.current || 1;
    const isFirstPage = this.paging.is_start;
    const isLastPage = this.paging.is_end;

    const paginationHtml = `
      <div class="zhihu-modal-pagination">
        <button
          ${isFirstPage ? "disabled" : ""}
          onclick="loadMoreChildComments('${this.parentComment.id}', ${
      currentPage - 1
    })"
          class="prev-button"
          title="上一页"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          上一页
        </button>
        <span class="page-info">第 ${currentPage} 页</span>
        <button
          ${isLastPage ? "disabled" : ""}
          onclick="loadMoreChildComments('${this.parentComment.id}', ${
      currentPage + 1
    })"
          class="next-button"
          title="下一页"
        >
          下一页
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    `;

    return `
      <div class="zhihu-comments-modal">
        <div class="zhihu-comments-modal-overlay" onclick="closeCommentsModal()"></div>
        <div class="zhihu-comments-modal-content">
          <div class="zhihu-comments-modal-header">
            <h3>全部回复 (${this.paging.totals})</h3>
            <button class="zhihu-comments-modal-close" onclick="closeCommentsModal()">×</button>
          </div>

          <div class="zhihu-comments-modal-parent-comment">
            <div class="zhihu-comment-header">
              <img class="zhihu-comment-avatar" src="${avatarUrl}" alt="${authorName}" referrerpolicy="no-referrer">
              ${parentAuthorDisplayHtml}
            </div>
            <div class="zhihu-comment-content">${formattedContent}</div>
            <div class="zhihu-comment-footer">
              <span>${createdTime}</span>
              ${parentCommentTagsHtml ? ` · ${parentCommentTagsHtml}` : ""}
              ${
                voteCount > 0
                  ? ` · <span class="zhihu-comment-like">${voteCount}赞</span>`
                  : ""
              }
            </div>
          </div>

          <div class="zhihu-comments-modal-child-comments">
            ${
              childCommentsHtml.length > 0
                ? childCommentsHtml
                : '<div style="text-align: center; padding: 20px; color: var(--vscode-descriptionForeground);">暂无回复</div>'
            }
          </div>

          ${paginationHtml}
        </div>
      </div>
    `;
  }
}

/**
 * 评论数据获取工具类
 */
export class CommentsManager {
  /**
   * 获取评论的URL模板
   * @param answerId 回答ID
   * @param offset 起始偏移量（分页用）
   * @param limit 每页数量限制
   */
  private static commentRequestURL(
    answerId: string,
    offset: number = 0,
    limit: number = 20
  ): string {
    return `https://www.zhihu.com/api/v4/answers/${answerId}/root_comments?order=normal&limit=${limit}&offset=${offset}&status=open`;
  }

  /**
   * 获取专栏文章评论的URL模板
   * @param articleId 专栏文章ID
   * @param offset 起始偏移量（分页用）
   * @param limit 每页数量限制
   */
  private static articleCommentRequestURL(
    articleId: string,
    offset: number = 0,
    limit: number = 20
  ): string {
    // 专栏评论API要求：当offset为0时不传递offset参数
    const offsetParam = offset > 0 ? `&offset=${offset}` : "";
    return `https://www.zhihu.com/api/v4/comment_v5/articles/${articleId}/root_comment?order_by=score&limit=${limit}${offsetParam}`;
  }

  /**
   * 获取子评论的URL模板
   * @param commentId 评论ID
   * @param offset 起始偏移量（分页用），可能是数字或字符串
   * @param limit 每页数量限制
   */
  private static childCommentRequestURL(
    commentId: string,
    offset: number | string = 0,
    limit: number = 20
  ): string {
    return `https://www.zhihu.com/api/v4/comment_v5/comment/${commentId}/child_comment?order=normal&limit=${limit}&offset=${offset}&status=open`;
  }

  /**
   * 从知乎评论接口，获取评论列表，并返回处理后的数据
   * @param answerId 回答ID
   * @param offset 起始偏移量
   * @param limit 每页数量限制
   */
  public static async getCommentsFromApi(
    answerId: string,
    offset: number = 0,
    limit: number = 20
  ): Promise<{
    comments: CommentItem[];
    paging: {
      is_end: boolean;
      is_start: boolean;
      next: string | null;
      previous: string | null;
      totals: number;
      current: number;
    };
  }> {
    try {
      const url = this.commentRequestURL(answerId, offset, limit);
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Cookie: CookieManager.getCookie(),
        },
      });

      // 简化判断逻辑：当返回的数据长度小于请求的limit，则认为是最后一页
      const is_end =
        response.data.data.length < limit ||
        response.data.data.length === 0 ||
        !response.data.data;

      return {
        comments: response.data.data.map((comment: any) => {
          // 处理 address_text，将其转换为 comment_tag
          const addressTag = comment.address_text
            ? {
                type: "location",
                text: comment.address_text,
                color: "#8c8c8c",
                night_color: "#8c8c8c",
                has_border: false,
              }
            : null;

          // 合并原有的 comment_tag 和地址标签
          const combinedCommentTags = [
            ...(comment.comment_tag || []),
            ...(addressTag ? [addressTag] : []),
          ];

          return {
            ...comment,
            author: comment.author.member,
            // 添加处理后的 comment_tag
            comment_tag: combinedCommentTags,
            // 处理回复关系 - 适配新的数据结构
            reply_to_author: comment.reply_to_author?.member
              ? {
                  ...comment.reply_to_author.member,
                  url:
                    comment.reply_to_author.member.url?.replace(
                      "api/v4/",
                      ""
                    ) || "",
                }
              : comment.reply_to_author,
            child_comments: comment.child_comments.map((child: any) => {
              // 处理子评论的 address_text
              const childAddressTag = child.address_text
                ? {
                    type: "location",
                    text: child.address_text,
                    color: "#8c8c8c",
                    night_color: "#8c8c8c",
                    has_border: false,
                  }
                : null;

              // 合并子评论的 comment_tag 和地址标签
              const childCombinedCommentTags = [
                ...(child.comment_tag || []),
                ...(childAddressTag ? [childAddressTag] : []),
              ];

              child.author.member.url = child.author.member.url.replace(
                "api/v4/",
                ""
              );
              return {
                ...child,
                author: child.author.member,
                // 添加处理后的 comment_tag
                comment_tag: childCombinedCommentTags,
                // 处理子评论的回复关系
                reply_to_author: child.reply_to_author?.member
                  ? {
                      ...child.reply_to_author.member,
                      url:
                        child.reply_to_author.member.url?.replace(
                          "api/v4/",
                          ""
                        ) || "",
                    }
                  : child.reply_to_author,
              };
            }),
          };
        }),
        paging: {
          is_end: is_end,
          is_start: offset === 0,
          next: response.data.paging.next,
          previous: response.data.paging.previous,
          totals: response.data.common_counts || 0,
          current: Math.floor(offset / limit) + 1,
        },
      };
    } catch (error) {
      console.error("获取评论失败:", error);
      throw new Error(`获取评论失败: ${error}`);
    }
  }

  /**
   * 从知乎专栏评论接口，获取评论列表，并返回处理后的数据
   * @param articleId 专栏ID
   * @param offset 起始偏移量
   * @param limit 每页数量限制
   */
  public static async getArticleCommentsFromApi(
    articleId: string,
    offset: number = 0,
    limit: number = 20
  ): Promise<{
    comments: CommentItem[];
    paging: {
      is_end: boolean;
      is_start: boolean;
      next: string | null;
      previous: string | null;
      totals: number;
      current: number;
    };
  }> {
    try {
      const url = this.articleCommentRequestURL(articleId, offset, limit);
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Cookie: CookieManager.getCookie(),
        },
      });

      // 判断是否为最后一页：优先使用API返回的paging信息
      const is_end =
        response.data.paging?.is_end !== false ||
        response.data.data.length < limit ||
        response.data.data.length === 0 ||
        !response.data.data;

      return {
        comments: response.data.data.map((comment: any) => {
          return {
            id: comment.id,
            type: "comment" as const,
            content: comment.content || "",
            created_time: comment.created_time || 0,
            author: {
              id: comment.author?.id || "",
              name: comment.author?.name || "匿名用户",
              avatar_url: comment.author?.avatar_url || "",
              headline: comment.author?.headline || "",
              url: comment.author?.url || "",
            },
            vote_count: comment.like_count || 0,
            like_count: comment.like_count || 0,
            child_comments: (comment.child_comments || []).map((child: any) => {
              return {
                id: child.id,
                type: "comment" as const,
                content: child.content || "",
                created_time: child.created_time || 0,
                author: {
                  id: child.author?.id || "",
                  name: child.author?.name || "匿名用户",
                  avatar_url: child.author?.avatar_url || "",
                  headline: child.author?.headline || "",
                  url: child.author?.url || "",
                },
                vote_count: child.like_count || 0,
                like_count: child.like_count || 0,
                child_comments: [],
                child_comment_count: 0,
                total_child_comments: [],
                commentPaging: {} as any,
              };
            }),
            child_comment_count: comment.child_comment_count || 0,
            total_child_comments: [],
            commentPaging: {} as any,
          };
        }),
        paging: {
          is_end: is_end,
          is_start:
            response.data.paging?.is_start !== false || offset === 0 || !offset,
          next: response.data.paging?.next || null,
          previous: response.data.paging?.previous || null,
          totals: response.data.paging?.totals || response.data.data.length,
          current: Math.floor(offset / limit) + 1,
        },
      };
    } catch (error) {
      console.error("获取专栏评论失败:", error);
      throw new Error(`获取专栏评论失败: ${error}`);
    }
  }

  /**
   * 从知乎评论接口，获取子评论列表，并返回处理后的数据
   * @param commentId 评论ID
   * @param offset 起始偏移量，可能是数字或字符串
   * @param limit 每页数量限制
   */
  public static async getChildCommentsFromApi(
    commentId: string,
    offset: number | string = 0,
    limit: number = 20
  ): Promise<{
    comments: CommentItem[];
    paging: {
      is_end: boolean;
      is_start: boolean;
      next: string | null;
      previous: string | null;
      totals: number;
      next_offset: string | null;
      previous_offset: string | null;
      current: number;
    };
  }> {
    try {
      const url = this.childCommentRequestURL(commentId, offset, limit);
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Cookie: CookieManager.getCookie(),
        },
      });

      // 从next和previous URL中提取offset参数
      const extractOffset = (url: string | null): string | null => {
        if (!url) {
          return null;
        }

        try {
          const match = url.match(/offset=([^&]*)/);
          return match ? match[1] : null;
        } catch {
          return null;
        }
      };

      // 检查是否为最后一页
      const is_end =
        response.data.data.length === 0 ||
        response.data.data.length < limit ||
        !response.data.data ||
        !response.data.paging.next;

      // 计算当前页码，这里需要根据API的特性做调整
      const currentPage =
        offset === 0 || offset === "0"
          ? 1
          : Math.floor(Number(offset) / limit) + 1;

      return {
        comments: response.data.data.map((comment: any) => {
          // 处理子评论的 address_text，将其转换为 comment_tag
          const addressTag = comment.address_text
            ? {
                type: "location",
                text: comment.address_text,
                color: "#8c8c8c",
                night_color: "#8c8c8c",
                has_border: false,
              }
            : null;

          // 合并原有的 comment_tag 和地址标签
          const combinedCommentTags = [
            ...(comment.comment_tag || []),
            ...(addressTag ? [addressTag] : []),
          ];

          return {
            ...comment,
            // 添加处理后的 comment_tag
            comment_tag: combinedCommentTags,
          };
        }),
        paging: {
          is_end: is_end,
          is_start: offset === 0 || offset === "0" || !offset,
          next: response.data.paging.next,
          previous: response.data.paging.previous,
          totals: response.data.counts.total_counts,
          next_offset: extractOffset(response.data.paging.next),
          previous_offset: extractOffset(response.data.paging.previous),
          current: currentPage,
        },
      };
    } catch (error) {
      console.error("获取子评论失败:", error);
      throw new Error(`获取子评论失败: ${error}`);
    }
  }

  /**
   * 创建评论组件
   * @param comments 评论列表
   * @param answerId 回答ID
   * @param paging 分页信息
   * @param options 渲染选项
   * @param contentType 内容类型
   */
  public static createCommentsComponent(
    comments: CommentItem[],
    answerId: string,
    paging: any,
    options: RenderOptions,
    contentType: "question" | "article" = "question"
  ): CommentsComponent {
    return new CommentsComponent(
      comments,
      answerId,
      paging,
      options,
      contentType
    );
  }

  /**
   * 创建评论容器组件
   * @param webviewId 当前WebView的ID
   * @param answerId 回答ID
   * @param commentCount 评论数量
   * @param options 渲染选项
   * @returns 评论容器组件实例
   */
  public static createCommentsContainerComponent(
    webviewId: string,
    answerId: string,
    commentCount: number,
    options: RenderOptions
  ): CommentsContainerComponent {
    return new CommentsContainerComponent(
      webviewId,
      answerId,
      commentCount,
      options
    );
  }

  /**
   * 加载专栏评论（简化版本，直接根据paging URL加载）
   * @param webviewId - WebView的ID
   * @param articleId - 专栏文章的ID
   * @param direction - 分页方向：'previous' | 'next' | 'current'
   * @param pagingUrl - 可选的完整分页URL
   */
  public static async loadArticleComments(
    webviewId: string,
    articleId: string,
    direction: "previous" | "next" | "current" = "current",
    pagingUrl?: string
  ): Promise<void> {
    const webviewItem = Store.webviewMap.get(webviewId);
    if (!webviewItem) {
      return;
    }

    try {
      // 获取当前回答
      const currentAnswerIndex = webviewItem.article.currentAnswerIndex;
      const currentAnswer = webviewItem.article.answerList[currentAnswerIndex];

      if (!currentAnswer) {
        throw new Error("未找到当前回答");
      }

      let requestUrl = pagingUrl;

      // 如果没有提供URL，根据direction和当前paging信息构建URL
      if (!requestUrl) {
        const currentPaging = currentAnswer.commentPaging;

        if (direction === "previous" && currentPaging?.previous) {
          requestUrl = currentPaging.previous;
        } else if (direction === "next" && currentPaging?.next) {
          requestUrl = currentPaging.next;
        } else if (direction === "current") {
          // 首次加载，使用默认URL
          requestUrl = this.articleCommentRequestURL(articleId, 0);
        }
      }

      if (!requestUrl) {
        console.warn(`无法获取${direction}页的URL`);
        return;
      }

      // 发送请求
      const response = await axios.get(requestUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Cookie: CookieManager.getCookie(),
        },
      });

      // 处理响应数据
      const comments = response.data.data.map((comment: any) => {
        return {
          id: comment.id,
          type: "comment" as const,
          content: comment.content || "",
          created_time: comment.created_time || 0,
          author: {
            id: comment.author?.id || "",
            name: comment.author?.name || "匿名用户",
            avatar_url: comment.author?.avatar_url || "",
            headline: comment.author?.headline || "",
            url: comment.author?.url || "",
          },
          vote_count: comment.like_count || 0,
          like_count: comment.like_count || 0,
          child_comments: (comment.child_comments || []).map((child: any) => {
            return {
              id: child.id,
              type: "comment" as const,
              content: child.content || "",
              created_time: child.created_time || 0,
              author: {
                id: child.author?.id || "",
                name: child.author?.name || "匿名用户",
                avatar_url: child.author?.avatar_url || "",
                headline: child.author?.headline || "",
                url: child.author?.url || "",
              },
              vote_count: child.like_count || 0,
              like_count: child.like_count || 0,
              child_comments: [],
              child_comment_count: 0,
              total_child_comments: [],
              commentPaging: {} as any,
            };
          }),
          child_comment_count: comment.child_comment_count || 0,
          total_child_comments: [],
          commentPaging: {} as any,
        };
      });

      // 直接替换评论列表，不做缓存
      currentAnswer.commentList = comments;
      currentAnswer.commentStatus = "expanded";

      // 更新分页信息
      currentAnswer.commentPaging = {
        is_end: response.data.paging?.is_end !== false || comments.length === 0,
        is_start:
          response.data.paging?.is_start !== false || direction === "current",
        next: response.data.paging?.next || null,
        previous: response.data.paging?.previous || null,
        totals: response.data.paging?.totals || comments.length,
        current:
          response.data.paging?.current ||
          (direction === "current"
            ? 1
            : (currentAnswer.commentPaging?.current || 1) +
              (direction === "next" ? 1 : -1)),
        limit: 20,
        loadedTotals: comments.length,
      };

      // 获取当前媒体显示模式配置
      const config = vscode.workspace.getConfiguration("zhihu-fisher");
      const mediaDisplayMode = config.get<string>("mediaDisplayMode", "normal");
      const renderOptions = { mediaDisplayMode };

      // 创建评论组件并生成HTML
      const commentsComponent = this.createCommentsComponent(
        comments,
        articleId,
        currentAnswer.commentPaging,
        renderOptions,
        "article"
      );

      const commentsHtml = commentsComponent.render();

      // 更新Webview中的评论区
      webviewItem.webviewPanel.webview.postMessage({
        command: "updateComments",
        html: commentsHtml,
      });
    } catch (error) {
      console.error("加载专栏评论时出错:", error);

      // 显示错误提示
      webviewItem.webviewPanel.webview.postMessage({
        command: "updateComments",
        html: `
          <div class="zhihu-comments-container">
            <h3>专栏评论加载失败</h3>
            <div style="text-align: center; padding: 20px; color: var(--vscode-errorForeground);">
              ${error}
            </div>
            <button class="zhihu-load-comments-btn" onclick="loadComments('${articleId}')">
              重新加载
            </button>
          </div>
        `,
      });
    }
  }

  /**
   * 加载评论（包括获取数据，并通知页面更新，全流程）
   * @param webviewId - WebView的ID
   * @param answerId - 回答的ID
   * @param page - 页码，从1开始
   */
  public static async loadComments(
    webviewId: string,
    answerId: string,
    page: number = 1
  ): Promise<void> {
    const webviewItem = Store.webviewMap.get(webviewId);
    if (!webviewItem) {
      return;
    }

    // 检查是否为专栏（通过URL判断）
    const isArticle = webviewItem.url.includes("zhuanlan.zhihu.com");

    if (isArticle) {
      // 专栏使用专栏评论接口
      // 需要从answerId中提取纯数字的文章ID
      let articleId = answerId;

      // 如果ID包含非数字字符，尝试提取数字部分
      if (!/^\d+$/.test(answerId)) {
        // 匹配字符串中的数字部分
        const match = answerId.match(/\d+/);
        if (match) {
          articleId = match[0];
        } else {
          // 如果没有找到数字，尝试从URL中提取
          const urlMatch = webviewItem.url.match(/\/p\/(\d+)/);
          if (urlMatch) {
            articleId = urlMatch[1];
          }
        }
      }

      console.log(
        `专栏评论请求 - 原始ID: ${answerId}, 提取的文章ID: ${articleId}`
      );

      // 调用专栏评论加载方法
      await this.loadArticleComments(webviewId, articleId, "current");
      return;
    }

    // 以下是问题评论的处理逻辑
    try {
      // 根据页码计算offset
      const limit = 20;
      const offset = (page - 1) * limit;

      // 获取问题评论数据
      const commentsData = await this.getCommentsFromApi(answerId, offset);

      const { comments, paging } = commentsData;

      // 获取当前回答
      const currentAnswerIndex = webviewItem.article.currentAnswerIndex;
      const currentAnswer = webviewItem.article.answerList[currentAnswerIndex];

      if (!currentAnswer) {
        throw new Error("未找到当前回答");
      }

      if (currentAnswer && currentAnswer.id === answerId) {
        // 判断是否是第一页
        const is_start = page === 1;

        // 问题评论：保持原有逻辑
        if (is_start) {
          // 如果是第一页，则初始化评论列表
          currentAnswer.commentList = [...comments];
        } else {
          // 如果不是第一页，则增量添加评论
          // 去重逻辑：通过id判断评论是否已经存在
          const existingIds = new Set(
            currentAnswer.commentList.map((comment) => comment.id)
          );
          const newComments = comments.filter(
            (comment) => !existingIds.has(comment.id)
          );
          currentAnswer.commentList = [
            ...currentAnswer.commentList,
            ...newComments,
          ];
        }

        // 计算已加载的评论总数
        const loadedTotals = currentAnswer.commentList.reduce(
          (acc, cur) => acc + (cur.child_comment_count || 0),
          currentAnswer.commentList.length
        );

        // 更新分页信息
        const totalPages = Math.ceil(paging.totals / limit);
        currentAnswer.commentStatus = "expanded"; // 设置评论区为展开状态
        currentAnswer.commentPaging = {
          ...paging,
          current: page,
          limit,
          loadedTotals,
          is_start: page === 1,
          /**
           * 如果已加载的评论总数(包括子评论) >= 总评论数，或者当前页已经是最后一页，则认为已加载完成
           * 这个条件比较复杂因为用的是旧版接口，没有正确的能够使用的分页信息，只能自己判断一下
           * 用这个接口是因为他没有反爬机制，直接用就完了。
           */
          is_end:
            loadedTotals >= paging.totals ||
            page >= totalPages ||
            paging.totals <= limit ||
            comments.length < limit ||
            !comments,
        };

        // 根据当前页码截取要显示的评论
        const startIndex = (page - 1) * limit;
        const endIndex = Math.min(
          startIndex + limit,
          currentAnswer.commentList.length
        );
        const displayComments = currentAnswer.commentList.slice(
          startIndex,
          endIndex
        );

        // 获取当前媒体显示模式配置
        const config = vscode.workspace.getConfiguration("zhihu-fisher");
        const mediaDisplayMode = config.get<string>(
          "mediaDisplayMode",
          "normal"
        );
        const renderOptions = { mediaDisplayMode };

        // 创建问题评论组件并生成HTML
        const commentsComponent = this.createCommentsComponent(
          displayComments,
          answerId,
          currentAnswer.commentPaging,
          renderOptions,
          "question"
        );

        const commentsHtml = commentsComponent.render();

        // 更新Webview中的评论区
        webviewItem.webviewPanel.webview.postMessage({
          command: "updateComments",
          html: commentsHtml,
        });
      }
    } catch (error) {
      console.error("加载评论时出错:", error);

      // 显示错误提示
      webviewItem.webviewPanel.webview.postMessage({
        command: "updateComments",
        html: `
            <div class="zhihu-comments-container">
              <h3>评论加载失败</h3>
              <div style="text-align: center; padding: 20px; color: var(--vscode-errorForeground);">
                ${error}
              </div>
              <button class="zhihu-load-comments-btn" onclick="loadComments('${answerId}')">
                重新加载
              </button>
            </div>
          `,
      });
    }
  }

  /**
   * 加载子评论（包括获取数据，并通知页面更新，全流程）
   * @param webviewId - WebView的ID
   * @param commentId - 评论的ID
   * @param page - 页码，从1开始
   */
  public static async loadChildComments(
    webviewId: string,
    commentId: string,
    page: number = 1
  ): Promise<void> {
    const webviewItem = Store.webviewMap.get(webviewId);
    if (!webviewItem) {
      return;
    }

    try {
      // 查找父评论
      const currentAnswerIndex = webviewItem.article.currentAnswerIndex;
      const currentAnswer = webviewItem.article.answerList[currentAnswerIndex];
      let parentComment = null;

      if (currentAnswer && currentAnswer.commentList.length) {
        // 在顶层评论中查找
        parentComment = currentAnswer.commentList.find(
          (comment) => String(comment.id) === commentId
        );
      }

      if (!parentComment) {
        throw new Error("找不到对应的父评论");
      }

      // 确定合适的offset参数
      let offset: string | number = 0;

      if (page === 1) {
        // 第一页使用默认的offset=0
        offset = 0;
      } else if (page > 1) {
        offset = parentComment.commentPaging.next_offset || 0;
      }

      // 获取子评论数据
      const { comments, paging } =
        await CommentsManager.getChildCommentsFromApi(commentId, offset);

      // 判断是否是第一页
      const is_start = page === 1;

      if (is_start) {
        // 如果是第一页，初始化子评论列表
        parentComment.total_child_comments = [...comments];
      } else {
        // 如果不是第一页，则增量添加子评论
        // 去重逻辑，通过id判断评论是否已经存在
        if (!parentComment.total_child_comments) {
          parentComment.total_child_comments = [];
        }

        const existingIds = new Set(
          parentComment.total_child_comments.map((comment) => comment.id)
        );
        const newComments = comments.filter(
          (comment) => !existingIds.has(comment.id)
        );
        parentComment.total_child_comments = [
          ...parentComment.total_child_comments,
          ...newComments,
        ];
      }

      // 更新分页信息
      parentComment.commentPaging = {
        ...paging,
        current: page,
        limit: 20,
        loadedTotals: parentComment.total_child_comments.length,
        is_start: is_start,
        // 判断是否已加载完全部子评论
        is_end:
          paging.is_end ||
          parentComment.total_child_comments.length >=
            parentComment.child_comment_count,
        next_offset: paging.next_offset || null,
        previous_offset: paging.previous_offset || null,
      };

      // 根据当前页码截取要显示的子评论
      // 这里特别注意: 由于知乎API返回的评论顺序可能和页码不完全对应
      // 我们直接使用API返回的当前页评论进行展示，而不是从累积的评论中截取
      const displayChildComments = [...comments];

      // 使用新的组件类创建子评论弹窗HTML
      const modalHtml = CommentsComponent.createChildCommentsModal(
        parentComment,
        displayChildComments,
        parentComment.commentPaging
      );

      // 更新Webview中的子评论弹窗
      webviewItem.webviewPanel.webview.postMessage({
        command: "updateChildCommentsModal",
        html: modalHtml,
      });
    } catch (error) {
      console.error("加载子评论时出错:", error);

      // 显示错误提示
      webviewItem.webviewPanel.webview.postMessage({
        command: "updateChildCommentsModal",
        html: `
            <div class="zhihu-comments-modal">
              <div class="zhihu-comments-modal-content">
                <div class="zhihu-comments-modal-header">
                  <h3>加载失败</h3>
                  <button class="zhihu-comments-modal-close" onclick="closeCommentsModal()">×</button>
                </div>
                <div style="text-align: center; padding: 40px; color: var(--vscode-errorForeground);">
                  加载子评论失败: ${error}
                  <div style="margin-top: 20px; display: flex; justify-content: center;">
                    <button class="button" onclick="loadAllChildComments('${commentId}')">重试</button>
                    <button class="button" onclick="closeCommentsModal()" style="margin-left: 10px;">关闭</button>
                  </div>
                </div>
              </div>
            </div>
          `,
      });
    }
  }

  /**
   * 切换评论状态（例如展开/收起评论）
   * @param webviewId - WebView的ID
   * @param answerId - 回答的ID
   */
  public static toggleCommentStatus(webviewId: string, answerId: string) {
    const webviewItem = Store.webviewMap.get(webviewId);
    if (!webviewItem) {
      return;
    }

    // 切换评论状态
    const currentAnswer =
      webviewItem.article.answerList[webviewItem.article.currentAnswerIndex];
    if (!currentAnswer) {
      console.error("当前回答不存在，无法切换评论状态");
      return;
    }

    currentAnswer.commentStatus =
      currentAnswer.commentStatus === "collapsed" ? "expanded" : "collapsed";
    const newStatus = currentAnswer.commentStatus;
    const currentAnswerPaging = currentAnswer.commentPaging;

    // 获取当前媒体显示模式配置
    const config = vscode.workspace.getConfiguration("zhihu-fisher");
    const mediaDisplayMode = config.get<string>("mediaDisplayMode", "normal");
    const renderOptions = { mediaDisplayMode };

    // 检查是否为专栏（通过URL判断）
    const contentType = webviewItem.url.includes("zhuanlan.zhihu.com")
      ? "article"
      : "question";

    // 根据新状态生成适当的HTML
    let commentsHtml = "";
    if (newStatus === "expanded") {
      // 如果是展开状态，显示评论列表
      const startIndex =
        (currentAnswerPaging.current - 1) * currentAnswerPaging.limit;
      const endIndex = Math.min(
        startIndex + currentAnswerPaging.limit,
        currentAnswer.commentList.length
      );
      const displayComments = currentAnswer.commentList.slice(
        startIndex,
        endIndex
      );

      commentsHtml = CommentsManager.createCommentsComponent(
        displayComments,
        answerId,
        currentAnswerPaging,
        renderOptions,
        contentType
      ).render();
    } else {
      // 如果是收起状态，显示展开按钮
      commentsHtml = `
        <button class="zhihu-expand-comments-btn" onclick="toggleCommentStatus('${answerId}')" data-answer-id="${answerId}">
          展开评论 (${currentAnswer.commentPaging?.totals || 0})
        </button>
      `;
    }

    // 更新WebView内容
    webviewItem.webviewPanel.webview.postMessage({
      command: "updateComments",
      html: commentsHtml,
    });
  }
}

/**
 * 评论工具类
 */
export class CommentsUtils {
  /**
   * 处理评论内容，转换图片链接为实际图片元素
   * @param content 原始评论内容
   * @param mediaDisplayMode 媒体显示模式
   * @returns 处理后的评论内容
   */
  public static processCommentContent(
    content: string,
    mediaDisplayMode: string = "normal"
  ): string {
    if (!content) {
      return content;
    }

    // 使用Cheerio处理HTML内容
    const $ = cheerio.load(content);

    // 处理评论中的图片链接
    $("a.comment_img").each(function () {
      const link = $(this);
      const href = link.attr("href");
      const dataWidth = link.attr("data-width");
      const dataHeight = link.attr("data-height");

      // 检查是否是知乎图片链接
      if (href && href.includes("pic") && href.includes(".zhimg.com")) {
        // 无媒体模式时只显示链接
        if (mediaDisplayMode === "none") {
          return;
        }

        // 计算图片显示尺寸
        const originalWidth = parseInt(dataWidth || "100");
        const originalHeight = parseInt(dataHeight || "100");

        let displayWidth = 100;
        let displayHeight = 100;

        // 保持宽高比，但限制最大尺寸
        const aspectRatio = originalWidth / originalHeight;
        if (aspectRatio > 1) {
          // 横向图片
          displayHeight = Math.round(displayWidth / aspectRatio);
        } else {
          // 纵向图片
          displayWidth = Math.round(displayHeight * aspectRatio);
        }

        // 小图模式缩放，但保证最小尺寸
        if (mediaDisplayMode === "mini") {
          displayWidth = Math.max(Math.round(displayWidth * 0.5), 20);
          displayHeight = Math.max(Math.round(displayHeight * 0.5), 20);
        }

        // 确保图片URL是完整的HTTPS地址
        let imageUrl = href;
        if (imageUrl.startsWith("//")) {
          imageUrl = "https:" + imageUrl;
        } else if (!imageUrl.startsWith("http")) {
          imageUrl = "https://" + imageUrl;
        }

        // 创建新的图片元素，直接在img上使用FancyBox
        const imageContainer = $(`
          <div class="comment-image-container" style="margin: 8px 0;">
            <img
              src="${imageUrl}"
              alt="评论图片"
              class="comment-image"
              style="width: ${displayWidth}px; height: ${displayHeight}px; cursor: pointer; border-radius: 4px; object-fit: cover;"
              data-original-width="${originalWidth}"
              data-original-height="${originalHeight}"
              data-fancybox="comment-gallery"
              data-caption="评论图片"
              data-src="${imageUrl}"
              referrerpolicy="no-referrer"
              loading="lazy"
              title="点击查看大图"
            />
          </div>
        `);

        // 替换原有的链接
        link.replaceWith(imageContainer);
      }
    });

    // 处理评论中的动图链接
    $("a.comment_gif").each(function () {
      const link = $(this);
      const href = link.attr("href");
      const dataWidth = link.attr("data-width");
      const dataHeight = link.attr("data-height");

      // 检查是否是知乎动图链接
      if (href && href.includes("pic") && href.includes(".zhimg.com")) {
        // 无媒体模式时移除动图链接
        if (mediaDisplayMode === "none") {
          link.remove();
          return;
        }

        // 计算动图显示尺寸
        const originalWidth = parseInt(dataWidth || "200");
        const originalHeight = parseInt(dataHeight || "120");

        let displayWidth = Math.min(originalWidth, 200);
        let displayHeight = Math.min(originalHeight, 120);

        // 保持宽高比
        const aspectRatio = originalWidth / originalHeight;
        if (aspectRatio > 1) {
          // 横向动图
          displayHeight = Math.round(displayWidth / aspectRatio);
        } else {
          // 纵向动图
          displayWidth = Math.round(displayHeight * aspectRatio);
        }

        // 小图模式缩放，但保证最小尺寸
        if (mediaDisplayMode === "mini") {
          displayWidth = Math.max(Math.round(displayWidth * 0.7), 30);
          displayHeight = Math.max(Math.round(displayHeight * 0.7), 20);
        }

        // 确保动图URL是完整的HTTPS地址
        let gifUrl = href;
        if (gifUrl.startsWith("//")) {
          gifUrl = "https:" + gifUrl;
        } else if (!gifUrl.startsWith("http")) {
          gifUrl = "https://" + gifUrl;
        }

        // 创建新的动图元素
        const gifContainer = $(`
          <div class="comment-gif-container" style="margin: 8px 0;">
            <img
              src="${gifUrl}"
              alt="评论动图"
              class="comment-gif"
              style="width: ${displayWidth}px; height: ${displayHeight}px; cursor: pointer; border-radius: 4px; object-fit: cover;"
              data-original-width="${originalWidth}"
              data-original-height="${originalHeight}"
              data-fancybox="comment-gallery"
              data-caption="评论动图"
              data-src="${gifUrl}"
              referrerpolicy="no-referrer"
              loading="lazy"
              title="点击查看大图"
            />
            <div class="gif-indicator" style="position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.7); color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px;">GIF</div>
          </div>
        `);

        // 替换原有的链接
        link.replaceWith(gifContainer);
      }
    });

    // 处理评论中的表情包
    $("a.comment_sticker").each(function () {
      const link = $(this);
      const href = link.attr("href");
      const dataWidth = link.attr("data-width");
      const dataHeight = link.attr("data-height");
      const stickerId = link.attr("data-sticker-id");
      const title = link.attr("title");
      const stickerText = link.text(); // 获取表情包的文本，如 [吃瓜]

      // 检查是否是知乎表情包链接
      if (href && href.includes("pic") && href.includes(".zhimg.com")) {
        // 无媒体模式时只显示文本，不显示图片
        if (mediaDisplayMode === "none") {
          const textSpan = $(
            `<span class="comment-sticker-text"">${stickerText}</span>`
          );
          link.replaceWith(textSpan);
          return;
        }

        // 表情包通常尺寸较小，设置默认尺寸
        let originalWidth = parseInt(dataWidth || "0");
        let originalHeight = parseInt(dataHeight || "0");

        // 如果没有尺寸信息，使用默认的表情包尺寸
        if (originalWidth === 0 || originalHeight === 0) {
          originalWidth = 64;
          originalHeight = 64;
        }

        let displayWidth = Math.min(originalWidth, 64);
        let displayHeight = Math.min(originalHeight, 64);

        // 保持宽高比
        if (originalWidth > 0 && originalHeight > 0) {
          const aspectRatio = originalWidth / originalHeight;
          if (aspectRatio > 1) {
            // 横向表情包
            displayHeight = Math.round(displayWidth / aspectRatio);
          } else {
            // 纵向表情包
            displayWidth = Math.round(displayHeight * aspectRatio);
          }
        }

        // 小图模式缩放
        if (mediaDisplayMode === "mini") {
          displayWidth = Math.max(Math.round(displayWidth * 0.8), 24);
          displayHeight = Math.max(Math.round(displayHeight * 0.8), 24);
        }

        // 确保表情包URL是完整的HTTPS地址
        let stickerUrl = href;
        if (stickerUrl.startsWith("//")) {
          stickerUrl = "https:" + stickerUrl;
        } else if (!stickerUrl.startsWith("http")) {
          stickerUrl = "https://" + stickerUrl;
        }

        // 创建新的表情包元素
        const stickerContainer = $(`
          <span class="comment-sticker-container" style="
            display: inline-block;
            margin: 0 2px;
            vertical-align: middle;
            position: relative;
          ">
            <img
              src="${stickerUrl}"
              alt="${stickerText}"
              class="comment-sticker"
              style="width: ${displayWidth}px; height: ${displayHeight}px; cursor: pointer; border-radius: 4px; object-fit: contain;"
              data-original-width="${originalWidth}"
              data-original-height="${originalHeight}"
              data-sticker-id="${stickerId || ""}"
              data-fancybox="comment-gallery"
              data-caption="表情包: ${stickerText}"
              data-src="${stickerUrl}"
              referrerpolicy="no-referrer"
              loading="lazy"
              title="${title || stickerText}"
            />
          </span>
        `);

        // 替换原有的链接
        link.replaceWith(stickerContainer);
      }
    });

    // 处理纯文本的图片链接（如 [图片]、[动图]、[表情] 等）
    $("a").each(function () {
      const link = $(this);
      const href = link.attr("href");
      const linkText = link.text().trim();

      // 检查是否是图片、动图或表情的文本链接
      if (
        href &&
        (linkText === "[图片]" ||
          linkText === "[动图]" ||
          linkText.match(/^\[.*\]$/))
      ) {
        // 检查是否是知乎图片链接
        if (href.includes("pic") && href.includes(".zhimg.com")) {
          // 无媒体模式时只保留文本
          if (mediaDisplayMode === "none") {
            return;
          }

          // 确保图片URL是完整的HTTPS地址
          let imageUrl = href;
          if (imageUrl.startsWith("//")) {
            imageUrl = "https:" + imageUrl;
          } else if (!imageUrl.startsWith("http")) {
            imageUrl = "https://" + imageUrl;
          }

          // 根据链接文本类型决定显示样式
          let displayWidth, displayHeight, elementClass, indicator;

          if (linkText === "[动图]") {
            // 动图样式
            displayWidth = 120;
            displayHeight = 80;
            elementClass = "comment-gif";
            indicator =
              '<div class="gif-indicator" style="position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.7); color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px;">GIF</div>';
          } else if (linkText.match(/^\[.*\]$/) && linkText !== "[图片]") {
            // 表情包样式
            displayWidth = 48;
            displayHeight = 48;
            elementClass = "comment-sticker";
            indicator = "";
          } else {
            // 普通图片样式
            displayWidth = 100;
            displayHeight = 100;
            elementClass = "comment-image";
            indicator = "";
          }

          // 小图模式缩放
          if (mediaDisplayMode === "mini") {
            displayWidth = Math.max(Math.round(displayWidth * 0.7), 24);
            displayHeight = Math.max(Math.round(displayHeight * 0.7), 24);
          }

          // 创建图片元素
          const imageContainer = $(`
            <div class="comment-image-container" style="margin: 8px 0; position: relative; display: inline-block;">
              <img
                src="${imageUrl}"
                alt="${linkText}"
                class="${elementClass}"
                style="width: ${displayWidth}px; height: ${displayHeight}px; cursor: pointer; border-radius: 4px; object-fit: cover;"
                data-fancybox="comment-gallery"
                data-caption="${linkText}"
                data-src="${imageUrl}"
                referrerpolicy="no-referrer"
                loading="lazy"
                title="点击查看大图"
              />
              ${indicator}
            </div>
          `);

          // 替换原有的链接
          link.replaceWith(imageContainer);
        }
      }
    });

    // 处理知乎重定向链接
    $("a").each(function () {
      const link = $(this);
      let href = link.attr("href");

      // 跳过已经处理过的图片链接
      if (link.hasClass("zhihu-redirect-processed") || !href) {
        return;
      }

      if (href.includes("link.zhihu.com/?target=")) {
        try {
          const targetParam = new URL(href).searchParams.get("target");
          if (targetParam) {
            href = decodeURIComponent(targetParam);
            link.attr("href", href);
            // 添加标记表示已处理
            link.addClass("zhihu-redirect-processed");
          }
        } catch (e) {
          // 如果解析失败，保留原始链接
        }
      }
    });

    return $.html();
  }

  /**
   * 处理时间，将时间戳转换为可读格式
   * @param timeStr 时间戳
   * @returns 格式化后的时间字符串
   */
  public static formatTime(timeStr: number): string {
    try {
      const date = new Date(parseInt(timeStr + "000", 10));
      const now = new Date();
      const diff = now.getTime() - date.getTime();

      // 如果小于1分钟，显示刚刚
      if (diff < 1 * 60 * 1000) {
        return "刚刚";
      } else if (diff < 60 * 60 * 1000) {
        return `${Math.floor(diff / (60 * 1000))}分钟前`;
      } else if (diff < 24 * 60 * 60 * 1000) {
        return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
      } else {
        return date.toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch (error) {
      return String(timeStr);
    }
  }
}
