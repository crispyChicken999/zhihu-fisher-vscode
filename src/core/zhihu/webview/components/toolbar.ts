import { Component } from "./base";
import { RenderOptions } from "./base";


/**
 * 工具栏组件
 */
export class ToolbarComponent implements Component {
  private url: string;
  private mediaDisplayMode: string = "normal";

  /**
   * 构造函数
   * @param url 回答或文章的URL
   */
  constructor(url: string, renderOptions: RenderOptions) {
    this.url = url;
    this.mediaDisplayMode = renderOptions.mediaDisplayMode || "normal";
  }

  /**
   * 渲染工具栏
   * @returns 工具栏HTML
   */
  public render(): string {
    return `
      <div class="toolbar">
        <div class="toolbar-left">
          <button class="button" onclick="openPage('${this.url}')">
            <div style="display: flex; align-items: center; gap: 5px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
                <!-- Icon from Iconoir by Luca Burgio -->
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 3h-6m6 0l-9 9m9-9v6"/>
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"/>
              </svg>
              在浏览器中打开
            </div>
          </button>
          <button class="button" onclick="copyLink(this,'${this.url}')">
            <div style="display: flex; align-items: center; gap: 5px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><!-- Icon from Tabler Icons by Paweł Kuna - https://github.com/tabler/tabler-icons/blob/master/LICENSE --><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M7 9.667A2.667 2.667 0 0 1 9.667 7h8.666A2.667 2.667 0 0 1 21 9.667v8.666A2.667 2.667 0 0 1 18.333 21H9.667A2.667 2.667 0 0 1 7 18.333z"/><path d="M4.012 16.737A2 2 0 0 1 3 15V5c0-1.1.9-2 2-2h10c.75 0 1.158.385 1.5 1M11 14l2 2l4-4"/></g></svg>
              复制链接
            </div>
          </button>
          <select
            class="button media-display-select"
            onchange="changeMediaMode(this.value)"
            title="选择媒体显示模式"
          >
            <option value="normal" ${
              this.mediaDisplayMode === "normal" ? "selected" : ""
            }>正常显示媒体</option>
            <option value="mini" ${
              this.mediaDisplayMode === "mini" ? "selected" : ""
            }>迷你媒体模式</option>
            <option value="none" ${
              this.mediaDisplayMode === "none" ? "selected" : ""
            }>不显示媒体</option>
          </select>
        </div>
        <div class="toolbar-right">
          <button class="button" onclick="toggleStylePanel()">
            <div style="display: flex; align-items: center; gap: 5px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
                <!-- Icon from Iconoir by Luca Burgio -->
                <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                  <path d="M12 2v1.5m0 17V22m10-10h-1.5M3.5 12H2m17.78-7.78l-1.06 1.06M5.28 18.72l-1.06 1.06m15.5 0l-1.06-1.06M5.28 5.28L4.22 4.22M17 12a5 5 0 1 1-10 0a5 5 0 0 1 10 0Z"/>
                </g>
              </svg>
              外观设置
            </div>
          </button>
        </div>
      </div>
    `;
  }
}