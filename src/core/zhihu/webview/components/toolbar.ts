import { AnswerItem } from "../../../types";
import { Component, RenderOptions } from "./base";

/**
 * 工具栏组件
 */
export class ToolbarComponent implements Component {
  private url: string;
  private mediaDisplayMode: string = "normal";
  private immersiveMode: boolean = false;
  private answer: AnswerItem; // 当前回答
  private isArticle: boolean = false; // 是否为文章类型
  private contentToken: string = ""; // 内容ID，用于收藏功能
  private contentType: "article" | "answer" = "answer"; // 内容类型

  /**
   * 构造函数
   * @param url 回答或文章的URL
   */
  constructor(url: string, renderOptions: RenderOptions, answer: AnswerItem) {
    this.url = url;
    this.mediaDisplayMode = renderOptions.mediaDisplayMode || "normal";
    // 从localStorage获取沉浸模式状态
    this.immersiveMode = renderOptions.immersiveMode || false;
    this.answer = answer;
    // 判断是否为文章类型（通过URL判断）
    this.isArticle = url.includes('zhuanlan.zhihu.com/p/') || url.includes('/p/');
    
    // 提取内容ID和类型用于收藏功能
    if (this.isArticle) {
      // 文章类型，提取文章ID
      const articleIdMatch = url.match(/\/p\/(\d+)/);
      if (articleIdMatch) {
        this.contentToken = articleIdMatch[1];
        this.contentType = "article";
      }
    } else {
      // 回答类型，使用回答ID
      if (answer.id) {
        this.contentToken = answer.id.toString();
        this.contentType = "answer";
      }
    }
  }

  // 格式化数字，如果大于1000则显示为 1k、2k 等
  public formatNumber(num: number): string {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + "w";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  }

  // 美化时间格式，只保留年月日和时分
  public formatDateTime(dateTimeStr: string): string {
    if (!dateTimeStr) {
      return "";
    }

    // 尝试解析日期字符串
    try {
      // 如果已经是本地化格式，直接使用
      if (dateTimeStr.includes("/")) {
        return dateTimeStr.split(" ")[0];
      }

      // 处理时间戳（秒或毫秒）
      if (/^\d+$/.test(dateTimeStr)) {
        const timestamp = parseInt(dateTimeStr);
        // 如果是秒级时间戳，转换为毫秒
        const ms = timestamp < 1e12 ? timestamp * 1000 : timestamp;
        const date = new Date(ms);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
        }
      }

      // 处理ISO格式日期字符串
      let date = new Date(dateTimeStr);
      
      // 如果解析失败，尝试其他格式
      if (isNaN(date.getTime())) {
        // 尝试替换常见的中文日期格式
        const normalizedStr = dateTimeStr
          .replace(/年/g, '-')
          .replace(/月/g, '-')
          .replace(/日/g, '')
          .replace(/\s+/g, ' ');
        
        date = new Date(normalizedStr);
      }
      
      // 如果还是解析失败，尝试手动解析
      if (isNaN(date.getTime())) {
        // 匹配类似 "2024-01-15 14:30" 的格式
        const match = dateTimeStr.match(/(\d{4})[年\-\/](\d{1,2})[月\-\/](\d{1,2})日?\s*(\d{1,2})?:?(\d{1,2})?/);
        if (match) {
          const [, year, month, day, hour = "0", minute = "0"] = match;
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
        }
      }

      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      // 如果所有解析都失败，返回原字符串
      return dateTimeStr;
    } catch (error) {
      console.warn("日期解析失败:", dateTimeStr, error);
      return dateTimeStr; // 如果解析出错，返回原字符串
    }
  }

  /**
   * 渲染工具栏
   * @returns 工具栏HTML
   */
  public render(): string {
    const immersiveClass = this.immersiveMode ? "immersive-mode-active" : "";
    const likeCount = this.formatNumber(this.answer.likeCount || 0);
    const commentCount = this.formatNumber(this.answer.commentCount || 0);
    const publishTime = this.formatDateTime(this.answer.publishTime || "");
    const updateTime = this.formatDateTime(this.answer.updateTime || "");
    const isUpdated =
      this.answer.publishTime !== this.answer.updateTime &&
      this.answer.updateTime;

    const authorName = this.answer.author.name || "神秘人"; // 作者名称
    const authorUrl = this.answer.author.url || "https://www.zhihu.com"; // 作者主页URL
    const authorSignature = this.answer.author.signature || "神秘人，没有留下签名哦╰(￣ω￣ｏ)"; // 作者签名

    return `
      <div class="toolbar ${immersiveClass}">
        <button class="button immersive-toggle" onclick="toggleImmersiveMode()" tooltip="沉浸模式(X)" placement="top">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M4 3a1 1 0 0 0-1 1v4h2V5h3V3zm16 0h-4v2h3v3h2V4a1 1 0 0 0-1-1M5 16v3h3v2H4a1 1 0 0 1-1-1v-4zm14 0v3h-3v2h4a1 1 0 0 0 1-1v-4zm-9-7a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1z"/>
          </svg>
        </button>

        <button class="button copy-button" onclick="copyLink(this,'${this.url}')" tooltip="复制链接(C)" placement="top">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
              <path d="M7 9.667A2.667 2.667 0 0 1 9.667 7h8.666A2.667 2.667 0 0 1 21 9.667v8.666A2.667 2.667 0 0 1 18.333 21H9.667A2.667 2.667 0 0 1 7 18.333z"/>
              <path d="M4.012 16.737A2 2 0 0 1 3 15V5c0-1.1.9-2 2-2h10c.75 0 1.158.385 1.5 1"/>
            </g>
          </svg>
        </button>

        <button class="button open-button" onclick="openPage('${this.url}')" tooltip="在浏览器中打开(B)" placement="top-left">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2z"/>
          </svg>
        </button>

        <button class="button favorite-button" onclick="favoriteContent('${this.contentToken}', '${this.contentType}')" tooltip="收藏到收藏夹(F)" placement="top">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M17.562 21.56a1 1 0 0 1-.465-.116L12 18.764l-5.097 2.68a1 1 0 0 1-1.45-1.053l.973-5.676l-4.124-4.02a1 1 0 0 1 .554-1.705l5.699-.828l2.549-5.164a1.04 1.04 0 0 1 1.793 0l2.548 5.164l5.699.828a1 1 0 0 1 .554 1.705l-4.124 4.02l.974 5.676a1 1 0 0 1-.985 1.169Z"/>
          </svg>
        </button>

        <button class="button" onclick="toggleStylePanel()" tooltip="外观设置(。)" placement="top">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="m8.3.7l7.875 7.875q.575.575.575 1.425t-.575 1.425l-4.75 4.75q-.575.575-1.425.575t-1.425-.575l-4.75-4.75Q3.25 10.85 3.25 10t.575-1.425L8.575 3.8l-1.7-1.7q-.3-.3-.288-.7T6.9.7q.3-.275.7-.287T8.3.7M10 5.225L5.225 10h9.55zM19 17q-.825 0-1.412-.587T17 15q0-.525.313-1.125T18 12.75q.225-.3.475-.625T19 11.5q.275.3.525.625t.475.625q.375.525.688 1.125T21 15q0 .825-.587 1.413T19 17M4 24q-.825 0-1.412-.587T2 22t.588-1.412T4 20h16q.825 0 1.413.588T22 22t-.587 1.413T20 24z"/>
          </svg>
        </button>

        <button class="button feedback-button" onclick="openPage('https://github.com/crispyChicken999/zhihu-fisher-vscode/issues')" tooltip="问题反馈 | 提建议(许愿)&#010(点击前往GitHub反馈)" placement="top">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"/>
          </svg>
        </button>

        <button class="button donate-button" onclick="showDonateModal()" tooltip="感谢您的使用( •̀ ω •́ )✧&#010觉得不错？欢迎请开发者喝杯咖啡~&#010(点击赞赏)" placement="top">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M11 18q-2.925 0-4.962-2.037T4 11V5q0-.825.588-1.412T6 3h12.5q1.45 0 2.475 1.025T22 6.5t-1.025 2.475T18.5 10H18v1q0 2.925-2.037 4.963T11 18M6 8h10V5H6zm12 0h.5q.625 0 1.063-.437T20 6.5t-.437-1.062T18.5 5H18zM4 21v-2h16v2z"/>
          </svg>
        </button>
      </div>

      <!-- 沉浸模式下的工具栏按钮 -->
      <div class="fixed-toolbar">
        <button class="button immersive-button" id="scroll-to-top" onclick="backTop()" tooltip="回到顶部(V)" placement="left">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M4.08 11.92L12 4l7.92 7.92l-1.42 1.41l-5.5-5.5V22h-2V7.83l-5.5 5.5zM12 4h10V2H2v2z"/>
          </svg>
        </button>

        <button class="button immersive-button author-button" onclick="openPage('${authorUrl}')" tooltip="作者：${authorName}&#010签名：${authorSignature}&#010(点击前往作者主页)" placement="left">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M9 11.75A1.25 1.25 0 0 0 7.75 13A1.25 1.25 0 0 0 9 14.25A1.25 1.25 0 0 0 10.25 13A1.25 1.25 0 0 0 9 11.75m6 0A1.25 1.25 0 0 0 13.75 13A1.25 1.25 0 0 0 15 14.25A1.25 1.25 0 0 0 16.25 13A1.25 1.25 0 0 0 15 11.75M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m0 18c-4.41 0-8-3.59-8-8c0-.29 0-.58.05-.86c2.36-1.05 4.23-2.98 5.21-5.37a9.97 9.97 0 0 0 10.41 3.97c.21.71.33 1.47.33 2.26c0 4.41-3.59 8-8 8"/>
          </svg>
        </button>

        <button class="button immersive-button meta-button" tooltip="点赞数：${likeCount}&#010评论数：${commentCount}&#010发布时间：${publishTime}${isUpdated? '&#010更新于：' + updateTime : ''}" placement="left">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M11 17h2v-6h-2zm1-8q.425 0 .713-.288T13 8t-.288-.712T12 7t-.712.288T11 8t.288.713T12 9m0 13q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"/>
          </svg>
        </button>

        <button class="button immersive-button comments-button" onclick="hanldeCommentsToggle()" tooltip="查看评论(，)" placement="left">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M9 22c-.6 0-1-.4-1-1v-3H4c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2h-6.1l-3.7 3.7c-.2.2-.4.3-.7.3zm1-6v3.1l3.1-3.1H20V4H4v12zm6.3-10l-1.4 3H17v4h-4V8.8L14.3 6zm-6 0L8.9 9H11v4H7V8.8L8.3 6z" />
          </svg>
        </button>

        ${!this.isArticle ? `
        <button class="button immersive-button prev-button" onclick="loadPreviousAnswer()" tooltip="上一个回答(←)" placement="left">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
            <path fill="currentColor" d="m5.83 9l5.58-5.58L10 2l-8 8l8 8l1.41-1.41L5.83 11H18V9z"/>
          </svg>
        </button>

        <button class="button immersive-button next-button" onclick="loadNextAnswer()" tooltip="下一个回答(→)" placement="left">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
            <path fill="currentColor" d="M2 11h12.2l-5.6 5.6L10 18l8-8l-8-8l-1.4 1.4L14.2 9H2z"/>
          </svg>
        </button>
        ` : ''}

        <button class="button immersive-button open-button" onclick="openPage('${this.url}')" tooltip="在浏览器中打开(B)" placement="left">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2z"/>
          </svg>
        </button>

        <button class="button immersive-button favorite-button" onclick="favoriteContent('${this.contentToken}', '${this.contentType}')" tooltip="收藏到收藏夹(F)" placement="left">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M17.562 21.56a1 1 0 0 1-.465-.116L12 18.764l-5.097 2.68a1 1 0 0 1-1.45-1.053l.973-5.676l-4.124-4.02a1 1 0 0 1 .554-1.705l5.699-.828l2.549-5.164a1.04 1.04 0 0 1 1.793 0l2.548 5.164l5.699.828a1 1 0 0 1 .554 1.705l-4.124 4.02l.974 5.676a1 1 0 0 1-.985 1.169Z"/>
          </svg>
        </button>

        <button class="button immersive-button copy-button" onclick="copyLink(this,'${this.url}', true)" tooltip="复制链接(C)" placement="left">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
          </svg>
        </button>

        <button class="button immersive-button style-button" onclick="toggleStylePanel()" tooltip="外观设置(。)" placement="left">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="m8.3.7l7.875 7.875q.575.575.575 1.425t-.575 1.425l-4.75 4.75q-.575.575-1.425.575t-1.425-.575l-4.75-4.75Q3.25 10.85 3.25 10t.575-1.425L8.575 3.8l-1.7-1.7q-.3-.3-.288-.7T6.9.7q.3-.275.7-.287T8.3.7M10 5.225L5.225 10h9.55zM19 17q-.825 0-1.412-.587T17 15q0-.525.313-1.125T18 12.75q.225-.3.475-.625T19 11.5q.275.3.525.625t.475.625q.375.525.688 1.125T21 15q0 .825-.587 1.413T19 17M4 24q-.825 0-1.412-.587T2 22t.588-1.412T4 20h16q.825 0 1.413.588T22 22t-.587 1.413T20 24z"/>
          </svg>
        </button>

        <button class="button immersive-button feedback-button" onclick="openPage('https://github.com/crispyChicken999/zhihu-fisher-vscode/issues')" tooltip="问题反馈 | 提建议(许愿)&#010(点击前往GitHub反馈)" placement="left">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"/>
          </svg>
        </button>

        <button class="button immersive-button donate-button" onclick="showDonateModal()" tooltip="感谢您的使用( •̀ ω •́ )✧&#010觉得不错？欢迎请开发者喝杯咖啡~&#010(点击赞赏)" placement="left-bottom">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M11 18q-2.925 0-4.962-2.037T4 11V5q0-.825.588-1.412T6 3h12.5q1.45 0 2.475 1.025T22 6.5t-1.025 2.475T18.5 10H18v1q0 2.925-2.037 4.963T11 18M6 8h10V5H6zm12 0h.5q.625 0 1.063-.437T20 6.5t-.437-1.062T18.5 5H18zM4 21v-2h16v2z"/>
          </svg>
        </button>

        <button class="button immersive-button immersive-toggle" onclick="toggleImmersiveMode()" tooltip="退出沉浸模式(X)" placement="left">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <g fill="none" fill-rule="evenodd">
              <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M20 7h-3V4a1 1 0 1 0-2 0v3a2 2 0 0 0 2 2h3a1 1 0 1 0 0-2M7 9a2 2 0 0 0 2-2V4a1 1 0 1 0-2 0v3H4a1 1 0 1 0 0 2zm0 8H4a1 1 0 1 1 0-2h3a2 2 0 0 1 2 2v3a1 1 0 1 1-2 0zm10-2a2 2 0 0 0-2 2v3a1 1 0 1 0 2 0v-3h3a1 1 0 1 0 0-2z"/>
            </g>
          </svg>
        </button>
      </div>
    `;
  }
}
