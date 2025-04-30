import axios from "axios";
import * as cheerio from "cheerio";
import { CommentItem } from "../../../types";
import { CookieManager } from "../../cookie";

/**
 * 评论管理器类，负责获取和处理评论数据
 */
export class CommentsManager {
  /**
   * 获取评论的URL模板
   * @param answerId 回答ID
   * @param offset 起始偏移量（分页用）
   * @param limit 每页数量限制
   */
  private static getCommentsURL(
    answerId: string,
    offset: number = 0,
    limit: number = 20
  ): string {
    return `https://www.zhihu.com/api/v4/answers/${answerId}/root_comments?order=normal&limit=${limit}&offset=${offset}&status=open`;
  }

  /**
   * 获取子评论的URL模板
   * @param commentId 评论ID
   * @param offset 起始偏移量（分页用），可能是数字或字符串
   * @param limit 每页数量限制
   */
  private static getChildCommentsURL(
    commentId: string,
    offset: number | string = 0,
    limit: number = 20
  ): string {
    return `https://www.zhihu.com/api/v4/comment_v5/comment/${commentId}/child_comment?order=normal&limit=${limit}&offset=${offset}&status=open`;
  }

  /**
   * 获取评论列表
   * @param answerId 回答ID
   * @param offset 起始偏移量
   * @param limit 每页数量限制
   */
  public static async getComments(
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
    };
  }> {
    try {
      const url = this.getCommentsURL(answerId, offset, limit);
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Cookie: CookieManager.getCookie(),
        },
      });

      return {
        comments: response.data.data.map((comment: any) => {
          return {
            ...comment,
            author: comment.author.member,
            child_comments: comment.child_comments.map((child: any) => {
              return {
                ...child,
                author: child.author.member,
              };
            }),
          };
        }),
        paging: {
          is_end: response.data.data.length < limit,
          is_start: offset === 0,
          next: response.data.paging.next,
          previous: response.data.paging.previous,
          totals: response.data.common_counts || 0,
        },
      };
    } catch (error) {
      console.error("获取评论失败:", error);
      throw new Error(`获取评论失败: ${error}`);
    }
  }

  /**
   * 获取子评论列表
   * @param commentId 评论ID
   * @param offset 起始偏移量，可能是数字或字符串
   * @param limit 每页数量限制
   */
  public static async getChildComments(
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
      next_offset: string | null; // 下一页的offset值
      previous_offset: string | null; // 上一页的offset值
    };
  }> {
    try {
      const url = this.getChildCommentsURL(commentId, offset, limit);
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Cookie: CookieManager.getCookie(),
        },
      });

      // 从next和previous URL中提取offset参数
      const extractOffset = (url: string | null): string | null => {
        if (!url) return null;
        try {
          const match = url.match(/offset=([^&]*)/);
          return match ? match[1] : null;
        } catch {
          return null;
        }
      };

      // 检查是否为最后一页
      // 如果返回的数据为空或数据长度小于请求的limit，或者没有next链接，则认为是最后一页
      const is_end = response.data.data.length === 0 || 
                    response.data.data.length < limit || 
                    !response.data.paging.next;

      return {
        comments: response.data.data,
        paging: {
          is_end: is_end,
          is_start: offset === 0 || offset === '0' || !offset,
          next: response.data.paging.next,
          previous: response.data.paging.previous,
          totals: response.data.counts.total_counts,
          next_offset: extractOffset(response.data.paging.next),
          previous_offset: extractOffset(response.data.paging.previous)
        },
      };
    } catch (error) {
      console.error("获取子评论失败:", error);
      throw new Error(`获取子评论失败: ${error}`);
    }
  }

  /**
   * 生成评论区HTML
   * @param comments 评论列表
   * @param answerId 回答ID
   * @param paging 分页信息
   */
  public static generateCommentsHTML(
    comments: CommentItem[],
    answerId: string,
    paging: any
  ): string {
    if (paging.is_end && (!comments || comments.length === 0)) {
      return `
        <div class="zhihu-comments-container">
          <h3>评论 (0)</h3>
          <div class="zhihu-comments-list">
            <div style="text-align: center; padding: 20px; color: var(--vscode-descriptionForeground);">
              暂无评论
            </div>
          </div>
        </div>
      `;
    }

    // 解析并处理评论内容
    const commentsHtml = comments
      .map((comment) => {
        return this.generateSingleCommentHTML(comment);
      })
      .join("");

    // 生成分页按钮
    const paginationHtml = this.generatePaginationHTML(paging, answerId);

    return `
      <div class="zhihu-comments-container">
        <h3>评论 (${paging.totals})</h3>
        ${paginationHtml}
        <div class="zhihu-comments-list">
          ${commentsHtml}
        </div>
        ${paginationHtml}
      </div>
    `;
  }

  /**
   * 处理时间，将时间戳转换为可读格式
   * @param timeStr 时间戳
   * @returns 格式化后的时间字符串
   */
  private static formatTime(timeStr: number) {
    // timeStr: 1745962199需要转换为1745962199000
    // 然后需要new Date().now()计算出时间差，如果小于1小时，则需要显示为xx分钟前，如果小于1天，则需要显示为xx小时前，如果大于1天，则直接展示时间 YYYY-MM-DD HH:mm:ss
    try {
      const date = new Date(parseInt(timeStr + "000", 10));
      const now = new Date();
      const diff = now.getTime() - date.getTime();

      if (diff < 60 * 60 * 1000) {
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
      return timeStr;
    }
  }

  /**
   * 生成单条评论的HTML
   * @param comment 评论数据
   */
  private static generateSingleCommentHTML(comment: CommentItem): string {
    const author = comment.author;
    const avatarUrl = author.avatar_url || "";
    const authorName = author.name || "匿名用户";
    const authorHeadline = author.headline || "";
    const authorUrl = author.url?.replace("api/v4/", "") || "";
    const formattedContent = comment.content || "";
    const voteCount = comment.vote_count || 0;
    const createdTime = this.formatTime(comment.created_time);

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
                childAuthor.url?.replace("api/v4/comment_v5", "") || "";
              const childFormattedContent = child.content || "";
              const childVoteCount = child.vote_count || 0;

              return `
              <div class="zhihu-child-comment">
                <div class="zhihu-child-comment-header">
                  <img class="zhihu-child-comment-avatar" src="${childAvatarUrl}" alt="${childAuthorName}" referrerpolicy="no-referrer">
                  <div>
                    <div class="zhihu-child-comment-author-name">
                      <a href="#" onclick="openPage('${childAuthorUrl}')">${childAuthorName}</a>
                    </div>
                  </div>
                </div>
                <div class="zhihu-child-comment-content">${childFormattedContent}</div>
                <div class="zhihu-child-comment-footer">
                  <span>${this.formatTime(child.created_time)}</span>
                  ${
                    childVoteCount > 0
                      ? `<span> · ${childVoteCount}赞</span>`
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
          <div class="zhihu-comment-author">
            <div class="zhihu-comment-author-name">
              <a href="#" onclick="openPage('${authorUrl}')">${authorName}</a>
            </div>
            ${
              authorHeadline
                ? `<div class="zhihu-comment-author-headline">${authorHeadline}</div>`
                : ""
            }
          </div>
        </div>
        <div class="zhihu-comment-content">${formattedContent}</div>
        <div class="zhihu-comment-footer">
          <span>${createdTime}</span>
          ${
            voteCount > 0
              ? `<span> · <div class="zhihu-comment-like">${voteCount}赞</div></span>`
              : ""
          }
        </div>
        ${childCommentsHtml}
        ${showMoreChildCommentsButton}
      </div>
    `;
  }

  /**
   * 生成分页按钮HTML
   * @param paging 分页信息
   * @param answerId 回答ID
   */
  private static generatePaginationHTML(paging: any, answerId: string): string {
    // 当前页码和分页信息
    const currentPage = paging.current || 1;
    const totalPages = Math.ceil(paging.totals / paging.limit) || 1;
    const isFirstPage = currentPage === 1;
    const isLastPage = paging.is_end || currentPage >= totalPages;

    return `
      <div class="zhihu-comment-pagination">
        <button
          ${isFirstPage ? "disabled" : ""}
          onclick="loadMoreComments('${answerId}', ${currentPage - 1})"
          class="prev-button"
          title="上一页"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          上一页
        </button>
        <span class="page-info">第 ${currentPage}/${totalPages} 页</span>
        <button
          ${isLastPage ? "disabled" : ""}
          onclick="loadMoreComments('${answerId}', ${currentPage + 1})"
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
   * 生成子评论弹窗HTML
   * @param comment 父评论
   * @param childComments 子评论列表
   * @param paging 分页信息
   */
  public static generateChildCommentsModalHTML(
    parentComment: CommentItem,
    childComments: CommentItem[],
    paging: any
  ): string {
    // 父评论信息
    const author = parentComment.author;
    const avatarUrl = author.avatar_url || "";
    const authorName = author.name || "匿名用户";
    const authorHeadline = author.headline || "";
    const formattedContent = parentComment.content || "";
    const voteCount = parentComment.vote_count || 0;
    const createdTime = this.formatTime(parentComment.created_time);

    // 子评论HTML列表
    const childCommentsHtml = childComments
      .map((child) => {
        const childAuthor = child.author;
        const childAvatarUrl = childAuthor.avatar_url || "";
        const childAuthorName = childAuthor.name || "匿名用户";
        const childAuthorUrl =
          childAuthor.url?.replace("api/v4/comment_v5", "") || "";
        const childAuthorHeadline = childAuthor.headline || "";
        const childFormattedContent = child.content || "";
        const childVoteCount = child.vote_count || 0;
        const childCreatedTime = this.formatTime(child.created_time);

        return `
        <div class="zhihu-comment">
          <div class="zhihu-comment-header">
            <img class="zhihu-comment-avatar" src="${childAvatarUrl}" alt="${childAuthorName}" referrerpolicy="no-referrer">
            <div class="zhihu-comment-author">
              <div class="zhihu-comment-author-name">
                <a href="#" onclick="openPage('${childAuthorUrl}')">${childAuthorName}</a>
              </div>
              ${
                childAuthorHeadline
                  ? `<div class="zhihu-comment-author-headline">${childAuthorHeadline}</div>`
                  : ""
              }
            </div>
          </div>
          <div class="zhihu-comment-content">${childFormattedContent}</div>
          <div class="zhihu-comment-footer">
            <span>${childCreatedTime}</span>
            ${
              childVoteCount > 0
                ? `<span> · <div class="zhihu-comment-like">${childVoteCount}赞</div></span>`
                : ""
            }
          </div>
        </div>
      `;
      })
      .join("");

    // 分页按钮
    const currentPage = paging.current || 1;
    const totalPages = Math.ceil(paging.totals / paging.limit) || 1;
    const isFirstPage = paging.is_start;
    const isLastPage = paging.is_end;

    const paginationHtml = `
      <div class="zhihu-modal-pagination">
        <button
          ${isFirstPage ? "disabled" : ""}
          onclick="loadMoreChildComments('${parentComment.id}', ${currentPage - 1})"
          class="prev-button"
          title="上一页"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          上一页
        </button>
        <span class="page-info">第 ${currentPage}/${totalPages} 页</span>
        <button
          ${isLastPage ? "disabled" : ""}
          onclick="loadMoreChildComments('${parentComment.id}', ${currentPage + 1})"
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
        <div class="zhihu-comments-modal-overlay" onclick="closeCommentsModal()" title="点我关闭弹窗"></div>
        <div class="zhihu-comments-modal-content">
          <div class="zhihu-comments-modal-header">
            <h3>全部回复 (${paging.totals})</h3>
            <button class="zhihu-comments-modal-close" onclick="closeCommentsModal()">×</button>
          </div>

          <div class="zhihu-comments-modal-parent-comment">
            <div class="zhihu-comment-header">
              <img class="zhihu-comment-avatar" src="${avatarUrl}" alt="${authorName}" referrerpolicy="no-referrer">
              <div>
                <div class="zhihu-comment-author-name">${authorName}</div>
                ${
                  authorHeadline
                    ? `<div class="zhihu-comment-author-headline">${authorHeadline}</div>`
                    : ""
                }
              </div>
            </div>
            <div class="zhihu-comment-content">${formattedContent}</div>
            <div class="zhihu-comment-footer">
              <span>${createdTime}</span>
              ${
                voteCount > 0
                  ? `<span> · <div class="zhihu-comment-like">${voteCount}赞</div></span>`
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
