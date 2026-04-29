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

  /** 获取知乎评论区表情包列表 */
  public static getEmojis(): Array<{ name: string; url: string }> {
    return [
      {
        name: "感谢",
        url: "https://pic1.zhimg.com/v2-694cac2ec9f3c63f774e723f77d8c840.png",
      },
      {
        name: "哇",
        url: "https://picx.zhimg.com/v2-6a766571a6d6d3a4d8d16f433e5b284c.png",
      },
      {
        name: "打招呼",
        url: "https://picx.zhimg.com/v2-95c560d0c9c0491f6ef404cc010878fc.png",
      },
      {
        name: "握手",
        url: "https://pic2.zhimg.com/v2-f5aa165e86b5c9ed3b7bee821da59365.png",
      },
      {
        name: "知乎益蜂",
        url: "https://pica.zhimg.com/v2-11d9b8b6edaae71e992f95007c777446.png",
      },
      {
        name: "百分百赞",
        url: "https://picx.zhimg.com/v2-27521d5ba23dfc1ea58fd9ebb220e304.png",
      },
      {
        name: "为爱发乎",
        url: "https://pic1.zhimg.com/v2-609b1f168acfa22d59fa09d3cb0846ee.png",
      },
      {
        name: "脑爆",
        url: "https://pica.zhimg.com/v2-b6f53e9726998343e7713f564a422575.png",
      },
      {
        name: "暗中学习",
        url: "https://pica.zhimg.com/v2-5dc88b4f8cbc58d7597e2134a384e392.png",
      },
      {
        name: "匿了",
        url: "https://pic1.zhimg.com/v2-c1e799b8357888525ec45793e8270306.png",
      },
      {
        name: "谢邀",
        url: "https://pic2.zhimg.com/v2-6fe2283baa639ae1d7c024487f1d68c7.png",
      },
      {
        name: "赞同",
        url: "https://pic2.zhimg.com/v2-419a1a3ed02b7cfadc20af558aabc897.png",
      },
      {
        name: "蹲",
        url: "https://pic4.zhimg.com/v2-66e5de3da039ac969d3b9d4dc5ef3536.png",
      },
      {
        name: "爱",
        url: "https://pic1.zhimg.com/v2-0942128ebfe78f000e84339fbb745611.png",
      },
      {
        name: "害羞",
        url: "https://pic4.zhimg.com/v2-52f8c87376792e927b6cf0896b726f06.png",
      },
      {
        name: "好奇",
        url: "https://pic2.zhimg.com/v2-72b9696632f66e05faaca12f1f1e614b.png",
      },
      {
        name: "思考",
        url: "https://pic4.zhimg.com/v2-bffb2bf11422c5ef7d8949788114c2ab.png",
      },
      {
        name: "酷",
        url: "https://pic4.zhimg.com/v2-c96dd18b15beb196b2daba95d26d9b1c.png",
      },
      {
        name: "大笑",
        url: "https://pic1.zhimg.com/v2-3ac403672728e5e91f5b2d3c095e415a.png",
      },
      {
        name: "微笑",
        url: "https://pic1.zhimg.com/v2-3700cc07f14a49c6db94a82e989d4548.png",
      },
      {
        name: "捂脸",
        url: "https://pic1.zhimg.com/v2-b62e608e405aeb33cd52830218f561ea.png",
      },
      {
        name: "捂嘴",
        url: "https://pic4.zhimg.com/v2-0e26b4bbbd86a0b74543d7898fab9f6a.png",
      },
      {
        name: "飙泪笑",
        url: "https://pic4.zhimg.com/v2-3bb879be3497db9051c1953cdf98def6.png",
      },
      {
        name: "耶",
        url: "https://pic2.zhimg.com/v2-f3b3b8756af8b42bd3cb534cbfdbe741.png",
      },
      {
        name: "可怜",
        url: "https://pic1.zhimg.com/v2-aa15ce4a2bfe1ca54c8bb6cc3ea6627b.png",
      },
      {
        name: "惊喜",
        url: "https://pic2.zhimg.com/v2-3846906ea3ded1fabbf1a98c891527fb.png",
      },
      {
        name: "流泪",
        url: "https://pic4.zhimg.com/v2-dd613c7c81599bcc3085fc855c752950.png",
      },
      {
        name: "大哭",
        url: "https://pic1.zhimg.com/v2-41f74f3795489083630fa29fde6c1c4d.png",
      },
      {
        name: "生气",
        url: "https://pic4.zhimg.com/v2-6a976b21fd50b9535ab3e5b17c17adc7.png",
      },
      {
        name: "惊讶",
        url: "https://pic4.zhimg.com/v2-0d9811a7961c96d84ee6946692a37469.png",
      },
      {
        name: "调皮",
        url: "https://pic1.zhimg.com/v2-76c864a7fd5ddc110965657078812811.png",
      },
      {
        name: "衰",
        url: "https://pic1.zhimg.com/v2-d6d4d1689c2ce59e710aa40ab81c8f10.png",
      },
      {
        name: "发呆",
        url: "https://pic2.zhimg.com/v2-7f09d05d34f03eab99e820014c393070.png",
      },
      {
        name: "机智",
        url: "https://pic1.zhimg.com/v2-4e025a75f219cf79f6d1fda7726e297f.png",
      },
      {
        name: "嘘",
        url: "https://pic4.zhimg.com/v2-f80e1dc872d68d4f0b9ac76e8525d402.png",
      },
      {
        name: "尴尬",
        url: "https://pic3.zhimg.com/v2-b779f7eb3eac05cce39cc33e12774890.png",
      },
      {
        name: "小情绪",
        url: "https://pic1.zhimg.com/v2-c65aaaa25730c59f5097aca04e606d88.png",
      },
      {
        name: "为难",
        url: "https://pic1.zhimg.com/v2-132ab52908934f6c3cd9166e51b99f47.png",
      },
      {
        name: "吃瓜",
        url: "https://pic4.zhimg.com/v2-74ecc4b114fce67b6b42b7f602c3b1d6.png",
      },
      {
        name: "语塞",
        url: "https://pic2.zhimg.com/v2-58e3ec448b58054fde642914ebb850f9.png",
      },
      {
        name: "看看你",
        url: "https://pic3.zhimg.com/v2-4e4870fc6e57bb76e7e5924375cb20b6.png",
      },
      {
        name: "撇嘴",
        url: "https://pic2.zhimg.com/v2-1043b00a7b5776e2e6e1b0af2ab7445d.png",
      },
      {
        name: "魔性笑",
        url: "https://pic2.zhimg.com/v2-e6270881e74c90fc01994e8cd072bd3a.png",
      },
      {
        name: "潜水",
        url: "https://pic1.zhimg.com/v2-99bb6a605b136b95e442f5b69efa2ccc.png",
      },
      {
        name: "口罩",
        url: "https://pic4.zhimg.com/v2-6551348276afd1eaf836551b93a94636.png",
      },
      {
        name: "开心",
        url: "https://pic2.zhimg.com/v2-c99cdc3629ff004f83ff44a952e5b716.png",
      },
      {
        name: "滑稽",
        url: "https://pic4.zhimg.com/v2-8a8f1403a93ddd0a458bed730bebe19b.png",
      },
      {
        name: "笑哭",
        url: "https://pic4.zhimg.com/v2-ca0015e8ed8462cfce839fba518df585.png",
      },
      {
        name: "白眼",
        url: "https://pic2.zhimg.com/v2-d4f78d92922632516769d3f2ce055324.png",
      },
      {
        name: "红心",
        url: "https://pic2.zhimg.com/v2-9ab384e3947547851cb45765e6fc1ea8.png",
      },
      {
        name: "柠檬",
        url: "https://pic4.zhimg.com/v2-a8f46a21217d58d2b4cdabc4568fde15.png",
      },
      {
        name: "拜托",
        url: "https://pic2.zhimg.com/v2-3e36d546a9454c8964fbc218f0db1ff8.png",
      },
      {
        name: "赞",
        url: "https://pic1.zhimg.com/v2-c71427010ca7866f9b08c37ec20672e0.png",
      },
      {
        name: "发火",
        url: "https://pic1.zhimg.com/v2-d5c0ed511a09bf5ceb633387178e0d30.png",
      },
      {
        name: "不抬杠",
        url: "https://pic4.zhimg.com/v2-395d272d5635143119b1dbc0b51e05e4.png",
      },
      {
        name: "种草",
        url: "https://pic2.zhimg.com/v2-cb191a92f1296e33308b2aa16f61bfb9.png",
      },
      {
        name: "抱抱",
        url: "https://pic2.zhimg.com/v2-b2e3fa9e0b6f431bd18d4a9d5d3c6596.png",
      },
      {
        name: "doge",
        url: "https://pic4.zhimg.com/v2-501ff2e1fb7cf3f9326ec5348dc8d84f.png",
      },
    ];
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
          <span style="font-weight: 700;">全部评论 (${this.paging.totals})</span>
          <div class="zhihu-comments-tips">
            <span>默认键盘</span>
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
            <span>默认键盘</span>
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
              border-radius: 4px;
              font-size: 1em;
              margin-left: 2px;
              display: inline-block;
            ">${tag.text}</span>
          `;
        })
        .join("");
    }

    if (comment.author.role === "author") {
      // 如果作者是回答者，显示作者标签
      authorTagsHtml += `
        <span class="author-tag" style="
          color: #999999;
          background-color: #99999915;
          padding: 1px 2px;
          border-radius: 2px;
          border: 1px solid #D3D3D3;
          margin-left: 4px;
          display: inline-block;
          font-size: 1em;
          height: 1em;
          line-height: 1em;
        ">作者</span>
      `;
    }

    if (hasReplyTo) {
      // 有回复关系：显示 作者 -> 回复作者，不显示签名
      const replyToAuthor = comment.reply_to_author!;
      const replyToAuthorUrl =
        replyToAuthor.url?.replace("api/v4/comment_v5/", "") || "";
      const replyToAvatarUrl = replyToAuthor.avatar_url || "";
      const replyToAuthorName = replyToAuthor.name || "匿名用户";
      const replyToAuthorHeadline = replyToAuthor.headline || "";

      authorDisplayHtml = `
        <div class="zhihu-comment-author">
          <div class="zhihu-comment-author-name zhihu-reply-chain">
            <a href="${authorUrl}" title="『${authorName}』&#010签名：${
        authorHeadline !== "" ? authorHeadline : "神秘人，没有留下签名哦🤔"
      }&#010(点击前往主页)">${authorName}</a>
            ${authorTagsHtml}
            <span class="reply-arrow" title="向...回复">→</span>
            <img class="zhihu-reply-to-avatar" src="${replyToAvatarUrl}" alt="${replyToAuthorName}" referrerpolicy="no-referrer">
            <a href="${replyToAuthorUrl}" title="『${replyToAuthorName}』&#010签名：${
        replyToAuthorHeadline !== ""
          ? replyToAuthorHeadline
          : "神秘人，没有留下签名哦🤔"
      }&#010(点击前往主页)">${replyToAuthorName}</a>
          </div>
        </div>
      `;
    } else {
      // 无回复关系：正常显示作者和签名
      authorDisplayHtml = `
        <div class="zhihu-comment-author">
          <div class="zhihu-comment-author-name">
            <a href="${authorUrl}" title="『${authorName}』&#010签名：${
        authorHeadline !== "" ? authorHeadline : "神秘人，没有留下签名哦🤔"
      }&#010(点击前往主页)">${authorName}</a>
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
              const childIsLiked = child.liked || child.is_liked || false;

              // 子评论点赞按钮
              const childLikeButtonHtml = `
                <button
                  class="zhihu-comment-like-btn ${childIsLiked ? 'liked' : ''}"
                  onclick="likeComment('${child.id}', ${!childIsLiked})"
                  title="${childIsLiked ? '取消点赞' : '点赞'}"
                  data-comment-id="${child.id}"
                  data-is-liked="${childIsLiked}"
                >
                  <svg class="like-icon" width="12" height="12" viewBox="0 0 24 24" fill="${childIsLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                  </svg>
                  <span class="like-count">${childVoteCount > 0 ? childVoteCount : 0}</span>
                </button>
              `;

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
                        font-size: 1em;
                        margin-left: 4px;
                        display: inline-block;
                      ">${tag.text}</span>
                    `;
                  })
                  .join("");
              }

              if (child.author.role === "author") {
                // 如果子评论作者是回答者，显示作者标签
                childAuthorTagsHtml += `
                  <span class="author-tag" style="
                    color: #999999;
                    background-color: #99999915;
                    padding: 1px 2px;
                    border-radius: 2px;
                    border: 1px solid #D3D3D3;
                    font-size: 1em;
                    display: inline-block;
                    height: 1em;
                    line-height: 1em;
                  ">作者</span>
                `;
              }

              if (childHasReplyTo) {
                // 有回复关系：显示 作者 -> 回复作者，不显示签名
                const replyToAuthor = child.reply_to_author!;
                const replyToAuthorUrl =
                  replyToAuthor.url?.replace("api/v4/comment_v5/", "") || "";
                const replyToAvatarUrl = replyToAuthor.avatar_url || "";
                const replyToAuthorName = replyToAuthor.name || "神秘人";
                const replyToAuthorHeadline = replyToAuthor.headline || "";

                childAuthorDisplayHtml = `
                  <div class="zhihu-child-comment-author">
                    <div class="zhihu-child-comment-author-name zhihu-reply-chain">
                      <a href="${childAuthorUrl}" title="『${childAuthorName}』&#010签名：${
                  childAuthorHeadline !== ""
                    ? childAuthorHeadline
                    : "神秘人，没有留下签名哦🤔"
                }&#010(点击前往主页)">${childAuthorName}</a>
                      ${childAuthorTagsHtml}
                      <span class="reply-arrow" title="向...回复">→</span>
                      <img class="zhihu-reply-to-avatar" src="${replyToAvatarUrl}" alt="${replyToAuthorName}" referrerpolicy="no-referrer">
                      <a href="${replyToAuthorUrl}" title="『${replyToAuthorName}』&#010签名：${
                  replyToAuthorHeadline !== ""
                    ? replyToAuthorHeadline
                    : "神秘人，没有留下签名哦🤔"
                }&#010(点击前往主页)">${replyToAuthorName}</a>
                    </div>
                  </div>
                `;
              } else {
                // 无回复关系：正常显示作者和签名
                childAuthorDisplayHtml = `
                  <div class="zhihu-child-comment-author">
                    <div class="zhihu-child-comment-author-name">
                      <a href="${childAuthorUrl}" title="『${childAuthorName}』&#010签名：${
                  childAuthorHeadline !== ""
                    ? childAuthorHeadline
                    : "神秘人，没有留下签名哦🤔"
                }&#010(点击前往主页)">${childAuthorName}</a>
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
                  ${childLikeButtonHtml}
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

    // 处理点赞按钮 - 优先使用接口返回的 liked 字段
    const isLiked = comment.liked || comment.is_liked || false;
    const likeButtonHtml = `
      <button
        class="zhihu-comment-like-btn ${isLiked ? 'liked' : ''}"
        onclick="likeComment('${comment.id}', ${!isLiked})"
        title="${isLiked ? '取消点赞' : '点赞'}"
        data-is-liked="${isLiked}"
      >
        <svg class="like-icon" width="14" height="14" viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
        </svg>
        <span class="like-count">${voteCount > 0 ? voteCount : 0}</span>
      </button>
    `;

    return `
      <div class="zhihu-comment" data-comment-id="${comment.id}">
        <div class="zhihu-comment-header">
          <img class="zhihu-comment-avatar" src="${avatarUrl}" alt="${authorName}" referrerpolicy="no-referrer">
          ${authorDisplayHtml}
        </div>
        <div class="zhihu-comment-content">${formattedContent}</div>
        <div class="zhihu-comment-footer">
          <span>${createdTime}${commentTagsHtml ? ` · ${commentTagsHtml}` : ""}</span>
          ${likeButtonHtml}
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
    const parentIsLiked = this.parentComment.liked || this.parentComment.is_liked || false;

    // 父评论点赞按钮（弹窗中）
    const parentLikeButtonHtml = `
      <button
        class="zhihu-comment-like-btn ${parentIsLiked ? 'liked' : ''}"
        onclick="likeComment('${this.parentComment.id}', ${!parentIsLiked})"
        title="${parentIsLiked ? '取消点赞' : '点赞'}"
        data-comment-id="${this.parentComment.id}"
        data-is-liked="${parentIsLiked}"
      >
        <svg class="like-icon" width="14" height="14" viewBox="0 0 24 24" fill="${parentIsLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
        </svg>
        <span class="like-count">${voteCount > 0 ? voteCount : 0}</span>
      </button>
    `;

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
              font-size: 1em;
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
      const replyToAuthorHeadline = replyToAuthor.headline || "";

      parentAuthorDisplayHtml = `
        <div class="zhihu-comment-author">
          <div class="zhihu-comment-author-name zhihu-reply-chain">
            <a href="${authorUrl}" title="『${authorName}』&#010签名：${
        authorHeadline !== "" ? authorHeadline : "神秘人，没有留下签名哦🤔"
      }&#010(点击前往主页)">${authorName}</a>
            ${parentAuthorTagsHtml}
            <span class="reply-arrow" title="向...回复">→</span>
            <img class="zhihu-reply-to-avatar" src="${replyToAvatarUrl}" alt="${replyToAuthorName}" referrerpolicy="no-referrer">
            <a href="${replyToAuthorUrl}" title="『${replyToAuthorName}』&#010签名：${
        replyToAuthorHeadline !== ""
          ? replyToAuthorHeadline
          : "神秘人，没有留下签名哦🤔"
      }&#010(点击前往主页)">${replyToAuthorName}</a>
          </div>
        </div>
      `;
    } else {
      // 无回复关系：正常显示作者和签名
      parentAuthorDisplayHtml = `
        <div class="zhihu-comment-author">
          <div class="zhihu-comment-author-name">
            <a href="${authorUrl}" title="『${authorName}』&#010签名：${
        authorHeadline !== "" ? authorHeadline : "神秘人，没有留下签名哦🤔"
      }&#010(点击前往主页)">${authorName}</a>
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
        const childAuthorName = childAuthor.name || "神秘人";
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
        const childIsLiked = child.liked || child.is_liked || false;

        // 子评论点赞按钮（弹窗中）
        const childLikeButtonHtml = `
          <button
            class="zhihu-comment-like-btn ${childIsLiked ? 'liked' : ''}"
            onclick="likeComment('${child.id}', ${!childIsLiked})"
            title="${childIsLiked ? '取消点赞' : '点赞'}"
            data-comment-id="${child.id}"
            data-is-liked="${childIsLiked}"
          >
            <svg class="like-icon" width="12" height="12" viewBox="0 0 24 24" fill="${childIsLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
            </svg>
            <span class="like-count">${childVoteCount > 0 ? childVoteCount : 0}</span>
          </button>
        `;

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
                  font-size: 1em;
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
          const replyToAuthorName = replyToAuthor.name || "神秘人";
          const replyToAuthorHeadline = replyToAuthor.headline || "";

          childAuthorDisplayHtml = `
            <div class="zhihu-comment-author">
              <div class="zhihu-comment-author-name zhihu-reply-chain">
                <a href="${childAuthorUrl}" title="『${childAuthorName}』&#010签名：${
            childAuthorHeadline !== ""
              ? childAuthorHeadline
              : "神秘人，没有留下签名哦🤔"
          }&#010(点击前往主页)">${childAuthorName}</a>
                ${childAuthorTagsHtml}
                <span class="reply-arrow" title="向...回复">→</span>
                <img class="zhihu-reply-to-avatar" src="${replyToAvatarUrl}" alt="${replyToAuthorName}" referrerpolicy="no-referrer">
                <a href="${replyToAuthorUrl}" title="『${replyToAuthorName}』&#010签名：${
            replyToAuthorHeadline !== ""
              ? replyToAuthorHeadline
              : "神秘人，没有留下签名哦🤔"
          }&#010(点击前往主页)">${replyToAuthorName}</a>
              </div>
            </div>
          `;
        } else {
          // 无回复关系：正常显示作者和签名
          childAuthorDisplayHtml = `
            <div class="zhihu-comment-author">
              <div class="zhihu-comment-author-name">
                <a href="${childAuthorUrl}" title="『${childAuthorName}』&#010签名：${
            childAuthorHeadline !== ""
              ? childAuthorHeadline
              : "神秘人，没有留下签名哦🤔"
          }&#010(点击前往主页)">${childAuthorName}</a>
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
            <span>${childCreatedTime}${childCommentTagsHtml ? ` · ${childCommentTagsHtml}` : ""}</span>
            ${childLikeButtonHtml}
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
            <button class="zhihu-comments-modal-close" title="点击关闭（ESC）" onclick="closeCommentsModal()">×</button>
          </div>

          <div class="zhihu-comments-modal-parent-comment">
            <div class="zhihu-comment-header">
              <img class="zhihu-comment-avatar" src="${avatarUrl}" alt="${authorName}" referrerpolicy="no-referrer">
              ${parentAuthorDisplayHtml}
            </div>
            <div class="zhihu-comment-content">${formattedContent}</div>
            <div class="zhihu-comment-footer">
              <span>${createdTime}${parentCommentTagsHtml ? ` · ${parentCommentTagsHtml}` : ""}</span>
              ${parentLikeButtonHtml}
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
   * 生成评论关闭的HTML提示
   * @param message 自定义消息，如果不提供则使用默认消息
   * @returns 评论关闭的HTML字符串
   */
  private static generateCommentClosedHtml(message?: string): string {
    const defaultMessage = "该内容的作者已关闭评论功能";
    const displayMessage = message || defaultMessage;

    return `
      <div class="zhihu-comments-container">
        <div class="zhihu-comments-closed-notice">
          <div class="closed-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </div>
          <h3>评论区已关闭</h3>
          <div class="closed-message">${displayMessage}</div>
        </div>
      </div>
      <style>
        .zhihu-comments-closed-notice {
          text-align: center;
          padding: 40px 20px;
          color: var(--vscode-descriptionForeground);
          border: 1px solid var(--vscode-widget-border);
          border-radius: 8px;
          background: var(--vscode-editor-background);
          margin: 10px 0;
        }
        .closed-icon {
          margin-bottom: 16px;
          opacity: 0.6;
        }
        .closed-icon svg {
          color: var(--vscode-descriptionForeground);
        }
        .zhihu-comments-closed-notice h3 {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--vscode-foreground);
        }
        .closed-message {
          font-size: 14px;
          line-height: 1.5;
          opacity: 0.8;
        }
      </style>
    `;
  }

  /**
   * 生成子评论关闭的模态框HTML
   * @param message 自定义消息，如果不提供则使用默认消息
   * @returns 子评论关闭的模态框HTML字符串
   */
  private static generateChildCommentClosedModalHtml(message?: string): string {
    const defaultMessage = "该评论的子评论功能已被关闭";
    const displayMessage = message || defaultMessage;

    return `
      <div class="zhihu-comments-modal">
        <div class="zhihu-comments-modal-content">
          <div class="zhihu-comments-modal-header">
            <h3>子评论</h3>
            <button class="zhihu-comments-modal-close" title="点击关闭（ESC）" onclick="closeCommentsModal()">×</button>
          </div>
          <div class="zhihu-comments-closed-notice">
            <div class="closed-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </div>
            <h4>子评论已关闭</h4>
            <div class="closed-message">${displayMessage}</div>
          </div>
        </div>
      </div>
      <style>
        .zhihu-comments-closed-notice {
          text-align: center;
          padding: 40px 20px;
          color: var(--vscode-descriptionForeground);
        }
        .closed-icon {
          margin-bottom: 16px;
          opacity: 0.6;
        }
        .closed-icon svg {
          color: var(--vscode-descriptionForeground);
        }
        .zhihu-comments-closed-notice h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--vscode-foreground);
        }
        .closed-message {
          font-size: 12px;
          line-height: 1.5;
          opacity: 0.8;
        }
      </style>
    `;
  }

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
      console.log("评论获取API链接：", url);
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Cookie: CookieManager.getCookie(),
        },
      });

      if (!response.ok) {
        const error: any = new Error(`HTTP error! status: ${response.status}`);
        try {
          error.response = {
            status: response.status,
            data: await response.json(),
          };
        } catch (e) {
          error.response = {
            status: response.status,
            data: await response.text(),
          };
        }
        throw error;
      }

      const responseData = await response.json();
      console.log("评论获取API返回数据：", responseData);

      // 简化判断逻辑：当返回的数据长度小于请求的limit，则认为是最后一页
      const is_end =
        responseData.data.length < limit ||
        responseData.data.length === 0 ||
        !responseData.data;

      return {
        comments: responseData.data.map((comment: any) => {
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
            author: {
              ...comment.author.member,
              role: comment.author.role || "normal",
            },
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
                author: {
                  ...child.author.member,
                  role: child.author.role || "normal",
                },
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
          next: responseData.paging.next,
          previous: responseData.paging.previous,
          totals: responseData.common_counts || 0,
          current: Math.floor(offset / limit) + 1,
        },
      };
    } catch (error: any) {
      console.error("获取评论失败:", error);

      // 检查是否是评论区关闭的错误
      if (error.response && error.response.status === 403) {
        const errorData = error.response.data;
        if (
          errorData?.error?.code === 106 &&
          errorData?.error?.name === "ForbiddenError"
        ) {
          // 抛出特定的评论关闭错误，便于上层处理
          const commentClosedError = new Error("评论已关闭");
          (commentClosedError as any).isCommentClosed = true;
          (commentClosedError as any).originalMessage =
            errorData.error.message || "评论已关闭";
          throw commentClosedError;
        }
      }

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
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Cookie: CookieManager.getCookie(),
        },
      });

      if (!response.ok) {
        const error: any = new Error(`HTTP error! status: ${response.status}`);
        try {
          error.response = {
            status: response.status,
            data: await response.json(),
          };
        } catch (e) {
          error.response = {
            status: response.status,
            data: await response.text(),
          };
        }
        throw error;
      }

      const responseData = await response.json();

      // 判断是否为最后一页：优先使用API返回的paging信息
      const is_end =
        responseData.paging?.is_end !== false ||
        responseData.data.length < limit ||
        responseData.data.length === 0 ||
        !responseData.data;

      return {
        comments: responseData.data.map((comment: any) => {
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
                liked: child.liked || child.is_liked || false,
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
            responseData.paging?.is_start !== false || offset === 0 || !offset,
          next: responseData.paging?.next || null,
          previous: responseData.paging?.previous || null,
          totals: responseData.paging?.totals || responseData.data.length,
          current: Math.floor(offset / limit) + 1,
        },
      };
    } catch (error: any) {
      console.error("获取专栏评论失败:", error);

      // 检查是否是评论区关闭的错误
      if (error.response && error.response.status === 403) {
        const errorData = error.response.data;
        if (
          errorData?.error?.code === 106 &&
          errorData?.error?.name === "ForbiddenError"
        ) {
          // 抛出特定的评论关闭错误，便于上层处理
          const commentClosedError = new Error("评论已关闭");
          (commentClosedError as any).isCommentClosed = true;
          (commentClosedError as any).originalMessage =
            errorData.error.message || "评论已关闭";
          throw commentClosedError;
        }
      }

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
      console.log("子评论获取API链接：", url);
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Cookie: CookieManager.getCookie(),
        },
      });

      if (!response.ok) {
        const error: any = new Error(`HTTP error! status: ${response.status}`);
        try {
          error.response = {
            status: response.status,
            data: await response.json(),
          };
        } catch (e) {
          error.response = {
            status: response.status,
            data: await response.text(),
          };
        }
        throw error;
      }

      const responseData = await response.json();
      console.log("子评论获取API返回数据：", responseData);

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
        responseData.data.length === 0 ||
        responseData.data.length < limit ||
        !responseData.data ||
        !responseData.paging.next;

      // 计算当前页码，这里需要根据API的特性做调整
      const currentPage =
        offset === 0 || offset === "0"
          ? 1
          : Math.floor(Number(offset) / limit) + 1;

      return {
        comments: responseData.data.map((comment: any) => {
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
          next: responseData.paging.next,
          previous: responseData.paging.previous,
          totals: responseData.counts.total_counts,
          next_offset: extractOffset(responseData.paging.next),
          previous_offset: extractOffset(responseData.paging.previous),
          current: currentPage,
        },
      };
    } catch (error: any) {
      console.error("获取子评论失败:", error);

      // 检查是否是评论区关闭的错误
      if (error.response && error.response.status === 403) {
        const errorData = error.response.data;
        if (
          errorData?.error?.code === 106 &&
          errorData?.error?.name === "ForbiddenError"
        ) {
          // 抛出特定的评论关闭错误，便于上层处理
          const commentClosedError = new Error("评论已关闭");
          (commentClosedError as any).isCommentClosed = true;
          (commentClosedError as any).originalMessage =
            errorData.error.message || "评论已关闭";
          throw commentClosedError;
        }
      }

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

      console.log(`加载专栏评论 URL：${requestUrl}`);

      // 发送请求
      const response = await fetch(requestUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Cookie: CookieManager.getCookie(),
        },
      });

      if (!response.ok) {
        const error: any = new Error(`HTTP error! status: ${response.status}`);
        try {
          error.response = {
            status: response.status,
            data: await response.json(),
          };
        } catch (e) {
          error.response = {
            status: response.status,
            data: await response.text(),
          };
        }
        throw error;
      }

      const responseData = await response.json();
      console.log("专栏评论获取API返回数据：", responseData);

      // 处理响应数据
      const comments = responseData.data.map((comment: any) => {
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
            role: comment.author?.role || "normal",
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
                role: child.author?.role || "normal",
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
        is_end: responseData.paging?.is_end !== false || comments.length === 0,
        is_start:
          responseData.paging?.is_start !== false || direction === "current",
        next: responseData.paging?.next || null,
        previous: responseData.paging?.previous || null,
        totals: responseData.paging?.totals || comments.length,
        current:
          responseData.paging?.current ||
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
    } catch (error: any) {
      console.error("加载专栏评论时出错:", error);

      let errorHtml = "";

      // 检查是否是评论关闭错误
      if (error.isCommentClosed) {
        const message =
          error.originalMessage || "该专栏文章的作者已关闭评论功能";
        errorHtml = this.generateCommentClosedHtml(message);
      } else {
        // 普通错误提示
        errorHtml = `
          <div class="zhihu-comments-container">
            <h3>专栏评论加载失败</h3>
            <div style="text-align: center; padding: 20px; color: var(--vscode-errorForeground);">
              ${error}
            </div>
            <button class="zhihu-load-comments-btn" onclick="loadComments('${articleId}')">
              重新加载
            </button>
          </div>
        `;
      }

      // 显示错误提示
      webviewItem.webviewPanel.webview.postMessage({
        command: "updateComments",
        html: errorHtml,
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
    } catch (error: any) {
      console.error("加载评论时出错:", error);

      let errorHtml = "";

      // 检查是否是评论关闭错误
      if (error.isCommentClosed) {
        const message = error.originalMessage || "该内容的作者已关闭评论功能";
        errorHtml = this.generateCommentClosedHtml(message);
      } else {
        // 普通错误提示
        errorHtml = `
          <div class="zhihu-comments-container">
            <h3>评论加载失败</h3>
            <div style="text-align: center; padding: 20px; color: var(--vscode-errorForeground);">
              ${error}
            </div>
            <button class="zhihu-reload-comments-btn" onclick="loadComments('${answerId}')">
              重新加载
            </button>
          </div>
        `;
      }

      // 显示错误提示
      webviewItem.webviewPanel.webview.postMessage({
        command: "updateComments",
        html: errorHtml,
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
    } catch (error: any) {
      console.error("加载子评论时出错:", error);

      let modalHtml = "";

      // 检查是否是评论关闭错误
      if (error.isCommentClosed) {
        const message = error.originalMessage || "该评论的子评论功能已被关闭";
        modalHtml = this.generateChildCommentClosedModalHtml(message);
      } else {
        // 普通错误提示
        modalHtml = `
          <div class="zhihu-comments-modal">
            <div class="zhihu-comments-modal-content">
              <div class="zhihu-comments-modal-header">
                <h3>加载失败</h3>
                <button class="zhihu-comments-modal-close" title="点击关闭（ESC）" onclick="closeCommentsModal()">×</button>
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
        `;
      }

      // 显示错误提示
      webviewItem.webviewPanel.webview.postMessage({
        command: "updateChildCommentsModal",
        html: modalHtml,
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
        <button class="zhihu-expand-comments-btn" onclick="toggleCommentStatus('${answerId}')" data-answer-id="${answerId}" tooltip="按(，)展开/收起评论" placement="right">
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
   * 静态表情包映射，避免重复创建
   */
  private static emojiMap: Map<string, string> | null = null;

  /**
   * 检查是否为知乎内部链接
   * @param href 链接地址
   * @returns 是否为知乎内部链接
   */
  public static isZhihuInternalLink(href: string): boolean {
    if (!href) {
      return false;
    }

    try {
      const url = new URL(href);
      const hostname = url.hostname.toLowerCase();
      const pathname = url.pathname;

      // 检查是否为知乎域名
      if (hostname !== "www.zhihu.com" && hostname !== "zhuanlan.zhihu.com") {
        return false;
      }

      // 检查路径模式
      if (hostname === "www.zhihu.com") {
        // 匹配 /question/xxx 或 /question/xxx/answer/xxx 或 /pin/xxx
        return /^\/question\/\d+(?:\/answer\/\d+)?(?:\/|$)/.test(pathname) ||
               /^\/pin\/\d+(?:\/|$)/.test(pathname);
      }

      if (hostname === "zhuanlan.zhihu.com") {
        // 匹配 /p/xxx
        return /^\/p\/\d+(?:\/|$)/.test(pathname);
      }

      return false;
    } catch (e) {
      return false;
    }
  }

  /**
   * 获取表情包映射（懒加载单例）
   */
  private static getEmojiMap(): Map<string, string> {
    if (!CommentsUtils.emojiMap) {
      CommentsUtils.emojiMap = new Map<string, string>();
      CommentsContainerComponent.getEmojis().forEach((emoji) => {
        CommentsUtils.emojiMap!.set(emoji.name, emoji.url);
      });
    }
    return CommentsUtils.emojiMap;
  }

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
        // if (mediaDisplayMode === "none") {
        //   return;
        // }

        // 获取原始尺寸信息
        const originalWidth = parseInt(dataWidth || "100");
        const originalHeight = parseInt(dataHeight || "100");

        // 确保图片URL是完整的HTTPS地址
        let imageUrl = href;
        if (imageUrl.startsWith("//")) {
          imageUrl = "https:" + imageUrl;
        } else if (!imageUrl.startsWith("http")) {
          imageUrl = "https://" + imageUrl;
        }

        // 创建新的图片元素，样式完全由CSS控制
        const imageContainer = $(`
          <div class="comment-image-container">
            <img
              src="${imageUrl}"
              alt="评论图片"
              class="comment-image"
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
        // if (mediaDisplayMode === "none") {
        //   link.remove();
        //   return;
        // }

        // 获取原始尺寸信息
        const originalWidth = parseInt(dataWidth || "200");
        const originalHeight = parseInt(dataHeight || "120");

        // 确保动图URL是完整的HTTPS地址
        let gifUrl = href;
        if (gifUrl.startsWith("//")) {
          gifUrl = "https:" + gifUrl;
        } else if (!gifUrl.startsWith("http")) {
          gifUrl = "https://" + gifUrl;
        }

        // 创建新的动图元素，样式完全由CSS控制
        const gifContainer = $(`
          <div class="comment-gif-container">
            <img
              src="${gifUrl}"
              alt="评论动图"
              class="comment-gif"
              data-original-width="${originalWidth}"
              data-original-height="${originalHeight}"
              data-fancybox="comment-gallery"
              data-caption="评论动图"
              data-src="${gifUrl}"
              referrerpolicy="no-referrer"
              loading="lazy"
              title="点击查看大图"
            />
            <div class="gif-indicator">GIF</div>
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
        // 确保表情包URL是完整的HTTPS地址
        let stickerUrl = href;
        if (stickerUrl.startsWith("//")) {
          stickerUrl = "https:" + stickerUrl;
        } else if (!stickerUrl.startsWith("http")) {
          stickerUrl = "https://" + stickerUrl;
        }

        // 获取原始尺寸信息，用于data属性
        let originalWidth = parseInt(dataWidth || "0");
        let originalHeight = parseInt(dataHeight || "0");

        // 如果没有尺寸信息，使用默认的表情包尺寸
        if (originalWidth === 0 || originalHeight === 0) {
          originalWidth = 64;
          originalHeight = 64;
        }

        // 创建新的表情包元素，样式完全由CSS控制
        const stickerContainer = $(`
          <span class="comment-sticker-container">
            <img
              src="${stickerUrl}"
              alt="${stickerText}"
              class="comment-sticker"
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
          // if (mediaDisplayMode === "none") {
          //   return;
          // }

          // 确保图片URL是完整的HTTPS地址
          let imageUrl = href;
          if (imageUrl.startsWith("//")) {
            imageUrl = "https:" + imageUrl;
          } else if (!imageUrl.startsWith("http")) {
            imageUrl = "https://" + imageUrl;
          }

          // 根据链接文本类型决定显示样式
          let elementClass, indicator;

          if (linkText === "[动图]") {
            // 动图样式
            elementClass = "comment-gif";
            indicator =
              '<div class="gif-indicator">GIF</div>';
          } else if (linkText.match(/^\[.*\]$/) && linkText !== "[图片]") {
            // 表情包样式
            elementClass = "comment-sticker";
            indicator = "";
          } else {
            // 普通图片样式
            elementClass = "comment-image";
            indicator = "";
          }

          // 创建图片元素，样式完全由CSS控制
          const imageContainer = $(`
            <div class="comment-image-container">
              <img
                src="${imageUrl}"
                alt="${linkText}"
                class="${elementClass}"
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

    // 处理知乎重定向链接和内部链接
    $("a").each(function () {
      const link = $(this);
      let href = link.attr("href");

      // 跳过已经处理过的图片链接
      if (link.hasClass("zhihu-redirect-processed") || !href) {
        return;
      }

      // 处理相对协议的URL（以//开头的链接），补全为https://
      if (href.startsWith("//")) {
        href = "https:" + href;
        link.attr("href", href);

        // 同时处理title属性
        const title = link.attr("title") || "";
        if (title.startsWith("//")) {
          link.attr("title", "https:" + title);
        }
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

      // 处理知乎内部链接，添加VSCode打开选项
      const isZhihuInternalLink = CommentsUtils.isZhihuInternalLink(href);
      if (isZhihuInternalLink) {
        // 保持原有链接可以在浏览器中打开
        link.attr("href", href);
        link.attr("target", "_blank");
        link.attr("title", `${href} 【在浏览器中打开】`);

        // 在原有链接后添加VSCode打开选项
        const vscodeOption = $(
          `<span class="zhihu-link-vscode" onclick="openWebView('${href}');" title="${href} &#010(在 VSCode 中查看)"><svg width="min(1em, 12px)" height="min(1em, 12px)" viewBox="0 0 24 24"><path fill="currentColor" d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zM18.5 16.5L13 12l5.5-4.5v9z"></path></svg></span>`
        );

        // 将VSCode选项添加到链接后面
        link.after(vscodeOption);

        // 添加标记表示已处理
        link.addClass("zhihu-internal-processed");
      }
    });

    // 处理文本形式的表情包（如 [doge]、[感谢] 等）
    let htmlContent = $.html();
    htmlContent = CommentsUtils.processTextEmojis(htmlContent);

    return htmlContent;
  }

  /**
   * 处理文本形式的表情包
   * @param content HTML内容
   * @returns 处理后的内容
   */
  private static processTextEmojis(content: string): string {
    // 使用静态的表情包映射，避免重复创建
    const emojiMap = CommentsUtils.getEmojiMap();

    // 匹配 [表情名] 格式的文本
    const emojiRegex = /\[([^\]]+)\]/g;

    return content.replace(emojiRegex, (match, emojiName) => {
      const emojiUrl = emojiMap.get(emojiName);

      // 如果找到对应的表情包图片
      if (emojiUrl) {
        return `
          <img src="${emojiUrl}"
            alt="${match}"
            title="${match}"
            class="comment-text-emoji"
            referrerpolicy="no-referrer"
            loading="lazy" />
        `;
      }

      // 如果没有找到对应的表情包，保持原文
      return match;
    });
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
