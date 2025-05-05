import { Component } from "./base";

/**
 * 样式设置面板组件
 */
export class StylePanelComponent implements Component {
  /**
   * 渲染样式设置面板
   * @returns 样式设置面板HTML
   */
  public render(): string {
    return `
      <div class="style-panel-mask" onclick="toggleStylePanel()"></div>
      <div class="style-panel" id="style-panel">
        <div class="style-panel-header">
          <h3 style="margin:10px 0; font-weight: bold;">外观设置</h3>
          <button class="style-panel-header-close" onclick="toggleStylePanel()">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24">
              <!-- Icon from Iconoir by Luca Burgio -->
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 6l12 12M6 18L18 6"/>
            </svg>
          </button>
        </div>

        <div class="style-panel-tips">
          <span style="flex: 0 0 auto;">使用键盘</span>
          <span style="flex: 0 0 auto; display: inline-flex; align-items: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><!-- Icon from Tabler Icons by Paweł Kuna - https://github.com/tabler/tabler-icons/blob/master/LICENSE --><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0-2 0"/></g></svg>
          </span>
          <span style="flex: 0 0 auto;">快速设置页面样式</span>
        </div>

        <div class="style-panel-content" style="padding: 0 20px 20px 20px;">
          <div class="style-option" style="margin: 10px 0;">
            <label for="font-size-slider" style="display: block; margin-bottom: 5px;">字体大小</label>
            <div style="display: flex; align-items: center; gap: 10px;">
              <input type="range" id="font-size-slider" min="8" max="24" value="14" style="flex: 1;">
              <span id="font-size-value">16px</span>
            </div>
          </div>

          <div class="style-option" style="margin: 10px 0;">
            <label for="line-height-slider" style="display: block; margin-bottom: 5px;">行高</label>
            <div style="display: flex; align-items: center; gap: 10px;">
              <input type="range" id="line-height-slider" min="1" max="2.5" value="1.6" step="0.1" style="flex: 1;">
              <span id="line-height-value">1.6</span>
            </div>
          </div>

          <div class="style-option" style="margin: 10px 0;">
            <label for="max-width-slider" style="display: block; margin-bottom: 5px;">最大宽度</label>
            <div style="display: flex; align-items: center; gap: 10px;">
              <input type="range" id="max-width-slider" min="500" max="2000" value="800" step="50" style="flex: 1;">
              <span id="max-width-value">800px</span>
            </div>
          </div>

          <div class="style-option" style="margin: 10px 0;">
            <label for="font-family-select" style="display: block; margin-bottom: 5px;">字体</label>
            <select id="font-family-select" placeholder="点击设置显示字体" class="font-family-select">
              <option value="">系统默认</option>
              <option value="'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB', sans-serif">微软雅黑</option>
              <option value="'Noto Serif SC', 'Source Han Serif SC', 'Source Han Serif CN', STSong, SimSun, serif">中文宋体</option>
              <option value="monospace, Consolas, 'Courier New', monospace">等宽字体</option>
              <option value="'SimSun', serif">宋体</option>
              <option value="'KaiTi', serif">楷体</option>
              <option value="'SimHei', sans-serif">黑体</option>
              <option value="'NSimSun', monospace">新宋体</option>
            </select>
          </div>

          <div class="style-option">
            <label for="content-color-picker" style="display: block; margin-bottom: 10px;">文章字体颜色</label>
            <div id="content-color-picker" class="color-picker-container">
              <input
                type="color"
                id="content-color"
                value="#000000"
                class="color-picker"
              >
              <span class="color-value" id="content-color-value">#000000</span>
            </div>
          </div>

          <div class="style-option" style="margin: 20px 0 10px 0;">
            <label style="display: block; margin-bottom: 10px;">媒体（图片、视频等）显示方式</label>
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
              <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                <input type="radio" name="media-display" value="none">
                <span>隐藏模式</span>
              </label>
              <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                <input type="radio" name="media-display" value="mini">
                <span>迷你模式</span>
              </label>
              <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                <input type="radio" name="media-display" value="normal" checked>
                <span>正常模式</span>
              </label>
            </div>
          </div>

          <div class="style-option" style="margin: 20px 0 10px 0;">
            <label style="display: block; margin-bottom: 10px;">对齐方式</label>
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
              <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                <input type="radio" name="text-align" value="left" checked>
                <span>左对齐</span>
              </label>
              <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                <input type="radio" name="text-align" value="center">
                <span>居中对齐</span>
              </label>
              <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                <input type="radio" name="text-align" value="right">
                <span>右对齐</span>
              </label>
              <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                <input type="radio" name="text-align" value="justify">
                <span>两端对齐</span>
              </label>
            </div>
          </div>

          <div class="style-buttons" style="display: flex; gap: 10px; margin-top: 20px;">
            <button class="button" id="style-reset-button" style="flex: 1;">重置样式</button>
          </div>
        </div>
      </div>
    `;
  }
}
