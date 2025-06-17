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

      const date = new Date(dateTimeStr);
      return date.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
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
        <div class="toolbar-left">
          <button class="button open-button" onclick="openPage('${this.url}')" tooltip="在浏览器中打开(B)" placement="top-left">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <!-- Icon from Iconoir by Luca Burgio -->
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 3h-6m6 0l-9 9m9-9v6"/>
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"/>
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
        </div>
        <div class="toolbar-right">
          <button class="button feedback-button" onclick="openPage('https://github.com/crispyChicken999/zhihu-fisher-vscode/issues')" tooltip="问题反馈和建议" placement="top">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"/>
            </svg>
          </button>
          <button class="button immersive-toggle" onclick="toggleImmersiveMode()" tooltip="沉浸模式(X)" placement="top">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M4 3a1 1 0 0 0-1 1v4h2V5h3V3zm16 0h-4v2h3v3h2V4a1 1 0 0 0-1-1M5 16v3h3v2H4a1 1 0 0 1-1-1v-4zm14 0v3h-3v2h4a1 1 0 0 0 1-1v-4zm-9-7a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1z"/>
            </svg>
          </button>
          <button class="button" onclick="toggleStylePanel()" tooltip="外观设置(。)" placement="top-right">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <!-- Icon from Iconoir by Luca Burgio -->
              <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                <path d="M12 2v1.5m0 17V22m10-10h-1.5M3.5 12H2m17.78-7.78l-1.06 1.06M5.28 18.72l-1.06 1.06m15.5 0l-1.06-1.06M5.28 5.28L4.22 4.22M17 12a5 5 0 1 1-10 0a5 5 0 0 1 10 0Z"/>
              </g>
            </svg>
          </button>
        </div>
      </div>

      <div class="fixed-toolbar">
        <button class="button" id="scroll-to-top" onclick="backTop()" tooltip="回到顶部(V)" placement="left">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><!-- Icon from TDesign Icons by TDesign - https://github.com/Tencent/tdesign-icons/blob/main/LICENSE --><path fill="currentColor" d="M4 4h16v2H4zm8 3.586l6.914 6.914l-1.414 1.414l-4.5-4.5V21h-2v-9.586l-4.5 4.5L5.086 14.5z"/></svg>
        </button>

        <!-- 沉浸模式下的工具栏按钮 -->
        <button class="button immersive-button author-button" onclick="openPage('${authorUrl}')" tooltip="作者：${authorName}&#010签名：${authorSignature}&#010(点击前往作者主页)" placement="left">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88a9.947 9.947 0 0 1 12.28 0C16.43 19.18 14.03 20 12 20z"/>
          </svg>
        </button>

        <button class="button immersive-button meta-button" tooltip="点赞数：${likeCount}&#010评论数：${commentCount}&#010发布时间：${publishTime}${isUpdated? '&#010更新于：' + updateTime : ''}" placement="left">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12.3 7.29c.2-.18.44-.29.7-.29c.27 0 .5.11.71.29c.19.21.29.45.29.71c0 .27-.1.5-.29.71c-.21.19-.44.29-.71.29c-.26 0-.5-.1-.7-.29c-.19-.21-.3-.44-.3-.71c0-.26.11-.5.3-.71m-2.5 4.68s2.17-1.72 2.96-1.79c.74-.06.59.79.52 1.23l-.01.06c-.14.53-.31 1.17-.48 1.78c-.38 1.39-.75 2.75-.66 3c.1.34.72-.09 1.17-.39c.06-.04.11-.08.16-.11c0 0 .08-.08.16.03c.02.03.04.06.06.08c.09.14.14.19.02.27l-.04.02c-.22.15-1.16.81-1.54 1.05c-.41.27-1.98 1.17-1.74-.58c.21-1.23.49-2.29.71-3.12c.41-1.5.59-2.18-.33-1.59c-.37.22-.59.36-.72.45c-.11.08-.12.08-.19-.05l-.03-.06l-.05-.08c-.07-.1-.07-.11.03-.2M5 3h14a2 2 0 0 1 2 2v14c0 .53-.21 1.04-.59 1.41c-.37.38-.88.59-1.41.59H5c-.53 0-1.04-.21-1.41-.59C3.21 20.04 3 19.53 3 19V5c0-1.11.89-2 2-2m14 16V5H5v14z"/>
          </svg>
        </button>

        <button class="button immersive-button comments-button" onclick="hanldeCommentsToggle()" tooltip="查看评论(，)" placement="left">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          </svg>
        </button>

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

        <button class="button immersive-button open-button" onclick="openPage('${this.url}')" tooltip="在浏览器中打开(B)" placement="left">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M19 19H5V5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.6l-9.8 9.8l1.4 1.4L19 6.4V10h2V3h-7z"/>
          </svg>
        </button>

        <button class="button immersive-button copy-button" onclick="copyLink(this,'${this.url}', true)" tooltip="复制链接(C)" placement="left">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
          </svg>
        </button>

        <button class="button immersive-button style-button" onclick="toggleStylePanel()" tooltip="外观设置(。)" placement="left">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 5q-.425 0-.712-.288T11 4V2q0-.425.288-.712T12 1t.713.288T13 2v2q0 .425-.288.713T12 5m4.95 2.05q-.275-.275-.275-.687t.275-.713l1.4-1.425q.3-.3.712-.3t.713.3q.275.275.275.7t-.275.7L18.35 7.05q-.275.275-.7.275t-.7-.275M20 13q-.425 0-.713-.288T19 12t.288-.712T20 11h2q.425 0 .713.288T23 12t-.288.713T22 13zm-8 10q-.425 0-.712-.288T11 22v-2q0-.425.288-.712T12 19t.713.288T13 20v2q0 .425-.288.713T12 23M5.65 7.05l-1.425-1.4q-.3-.3-.3-.725t.3-.7q.275-.275.7-.275t.7.275L7.05 5.65q.275.275.275.7t-.275.7q-.3.275-.7.275t-.7-.275m12.7 12.725l-1.4-1.425q-.275-.3-.275-.712t.275-.688t.688-.275t.712.275l1.425 1.4q.3.275.288.7t-.288.725q-.3.3-.725.3t-.7-.3M2 13q-.425 0-.712-.288T1 12t.288-.712T2 11h2q.425 0 .713.288T5 12t-.288.713T4 13zm2.225 6.775q-.275-.275-.275-.7t.275-.7L5.65 16.95q.275-.275.687-.275t.713.275q.3.3.3.713t-.3.712l-1.4 1.4q-.3.3-.725.3t-.7-.3M12 18q-2.5 0-4.25-1.75T6 12t1.75-4.25T12 6t4.25 1.75T18 12t-1.75 4.25T12 18m0-2q1.65 0 2.825-1.175T16 12t-1.175-2.825T12 8T9.175 9.175T8 12t1.175 2.825T12 16m0-4"/>
          </svg>
        </button>

        <button class="button immersive-button feedback-button" onclick="openPage('https://github.com/crispyChicken999/zhihu-fisher-vscode/issues')" tooltip="问题反馈/建议&#010(点击前往GitHub反馈)" placement="left">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"/>
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
