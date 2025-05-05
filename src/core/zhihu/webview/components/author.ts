import { AnswerAuthor } from "../../../types";
import { Component, RenderOptions } from "./base";

/**
 * 作者信息组件
 */
export class AuthorComponent implements Component {
  private author: AnswerAuthor;
  private options: RenderOptions;

  /**
   * 构造函数
   * @param author 作者信息
   * @param options 渲染选项
   */
  constructor(author: AnswerAuthor, options: RenderOptions) {
    this.author = author;
    this.options = options;
  }

  /**
   * HTML转义函数
   * @param unsafe 需要转义的字符串
   * @returns 转义后的安全字符串
   */
  private escapeHtml(unsafe: string): string {
    if (!unsafe) return "";
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * 渲染作者信息组件
   * @returns 作者信息HTML
   */
  public render(): string {
    if (!this.author) {
      return "";
    }

    const authorName = this.author.name;
    const authorAvatar = this.author.avatar || "";
    const authorBio = this.author.signature || "";
    const authorFollowersCount = this.author.followersCount || 0;
    const authorUrl = this.author.url || "";
    
    let authorHTML = `<div class="author-info">`;

    // 如果有作者头像，显示头像
    if (this.author.avatar) {
      authorHTML += `
        <div class="author-avatar" onclick="openPage('${authorUrl}')">
          <img src="${authorAvatar}" alt="${this.escapeHtml(authorName)}" referrerpolicy="no-referrer" />
        </div>
      `;
    }

    // 作者名称和简介
    // 如果有作者URL，将作者名字设为可点击链接
    const authorTitleHtml = `<div class="author-name">
      ${
        authorUrl
          ? `<a href="${authorUrl}" class="author-link">${this.escapeHtml(authorName)}</a>`
          : this.escapeHtml(authorName)
      }
      <span>|</span>
      <div class="author-fans" title="粉丝数 ${authorFollowersCount}">
        <svg t="1745304361368" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4733" width="12" height="12">
          <path fill="#FFFFFF" d="M479.352471 60.235294a260.999529 260.999529 0 1 1 0 522.059294 293.647059 293.647059 0 0 0-293.647059 293.647059 32.647529 32.647529 0 0 1-65.234824 0 359.002353 359.002353 0 0 1 222.569412-332.137412A260.999529 260.999529 0 0 1 479.412706 60.235294z m0 65.234824a195.764706 195.764706 0 1 0 0 391.529411 195.764706 195.764706 0 0 0 0-391.529411zM767.578353 614.881882c26.624 0 51.440941 11.143529 69.872941 31.322353 17.709176 19.395765 27.407059 44.875294 27.407059 71.920941 0 32.888471-15.36 57.103059-25.6 73.065412-11.745882 18.432-30.72 40.056471-56.500706 64.331294l-11.444706 10.541177a742.701176 742.701176 0 0 1-45.477647 38.249412 35.177412 35.177412 0 0 1-37.526588 3.011764l-4.758588-3.072c-0.903529-0.722824-21.383529-16.504471-45.357177-38.249411-31.623529-28.611765-54.512941-53.850353-67.945412-74.932706-6.144-9.637647-12.047059-19.275294-16.805647-30.418824a107.941647 107.941647 0 0 1 18.612706-114.447059 93.967059 93.967059 0 0 1 69.872941-31.322353c22.166588 0 43.851294 8.131765 61.018353 22.829177l1.807059 1.505882 1.807059-1.505882a94.268235 94.268235 0 0 1 61.018353-22.829177z m0 52.224a41.381647 41.381647 0 0 0-22.467765 6.866824l-5.12 3.794823-35.237647 29.394824-35.719529-29.756235a42.104471 42.104471 0 0 0-27.105883-10.300236 41.863529 41.863529 0 0 0-31.382588 14.396236 55.717647 55.717647 0 0 0-9.035294 58.789647c2.650353 6.204235 5.963294 12.047059 12.709647 22.708706 10.541176 16.504471 30.479059 38.490353 59.030588 64.331294l14.817883 13.071059 16.685176 13.974588 1.264941-0.90353c6.625882-5.421176 15.239529-12.709647 23.853177-20.359529l6.445176-5.722353c28.491294-25.840941 48.429176-47.766588 59.030589-64.391529 12.769882-19.877647 17.347765-30.72 17.347764-44.875295a53.970824 53.970824 0 0 0-13.733647-36.623058 41.803294 41.803294 0 0 0-31.322353-14.396236z" p-id="4734"></path>
        </svg>
        <span>${authorFollowersCount}</span>
      </div>
    </div>`;

    authorHTML += `
      <div class="author-details">
        ${authorTitleHtml}
        ${
          authorBio
            ? `<div class="author-bio">${this.escapeHtml(authorBio)}</div>`
            : ""
        }
      </div>
    </div>`;

    return authorHTML;
  }
}