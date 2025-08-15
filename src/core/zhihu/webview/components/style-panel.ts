import { Component, RenderOptions } from "./base";

/**
 * 样式设置面板组件
 */
export class StylePanelComponent implements Component {
  private mediaDisplayMode: string = "normal";
  private miniMediaScale: number = 50;
  private enableDisguise: boolean = true;
  private enableGrayscale: boolean = false;

  constructor(renderOptions: RenderOptions) {
    this.mediaDisplayMode = renderOptions.mediaDisplayMode || "normal";
    this.miniMediaScale = renderOptions.miniMediaScale || 50;
    this.enableDisguise =
      renderOptions.enableDisguise !== undefined
        ? renderOptions.enableDisguise
        : true;
    // 灰色模式从localStorage读取，不依赖renderOptions
    this.enableGrayscale = false;
  }

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

        <div class="style-panel-tips-wrapper">
          <div class="style-panel-tips">
            <span style="flex: 0 0 auto;">使用键盘</span>
            <span style="flex: 0 0 auto; display: inline-flex; align-items: center;" title="句号。键">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                  <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <path d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0-2 0"/>
                </g>
              </svg>
            </span>
            <span style="flex: 0 0 auto;">快速设置页面样式</span>
          </div>
        </div>

        <div class="style-panel-content">
          <div class="style-option">
            <label for="font-size-slider" style="display: block; margin-bottom: 5px;">字体大小</label>
            <div style="display: flex; align-items: center; gap: 10px;">
              <input type="range" id="font-size-slider" min="8" max="24" value="14" style="flex: 1;">
              <span id="font-size-value" style="width: 30px;">16px</span>
            </div>
          </div>

          <div class="style-option">
            <label for="line-height-slider" style="display: block; margin-bottom: 5px;">行高</label>
            <div style="display: flex; align-items: center; gap: 10px;">
              <input type="range" id="line-height-slider" min="1" max="2.5" value="1.6" step="0.1" style="flex: 1;">
              <span id="line-height-value" style="width: 30px;">1.6</span>
            </div>
          </div>

          <div class="style-option">
            <label for="max-width-slider" style="display: block; margin-bottom: 5px;">最大宽度</label>
            <div style="display: flex; align-items: center; gap: 10px;">
              <input type="range" id="max-width-slider" min="300" max="2400" value="800" step="50" style="flex: 1;">
              <span id="max-width-value" style="width: 30px;">800px</span>
            </div>
          </div>

          <div class="style-option">
            <label for="font-family-select" style="display: block; margin-bottom: 5px;">字体</label>
            <select id="font-family-select" placeholder="点击设置显示字体" class="panel-select">
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
            <label for="content-color-picker" style="display: block; margin-bottom: 10px;">字体颜色</label>
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

          <div class="style-option">
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

          <div class="style-option-divider"></div>

          <div class="style-option">
            <label style="display: block; margin-bottom: 10px;" for="media-display-select">多媒体（图片、视频等）显示方式</label>
            <select
              id="media-display-select"
              class="panel-select"
              onchange="changeMediaMode(this.value)"
              title="选择图片、视频等多媒体的显示方式"
            >
              <option value="normal" ${
                this.mediaDisplayMode === "normal" ? "selected" : ""
              }>正常显示</option>
              <option value="mini" ${
                this.mediaDisplayMode === "mini" ? "selected" : ""
              }>迷你模式</option>
              <option value="none" ${
                this.mediaDisplayMode === "none" ? "selected" : ""
              }>全部隐藏</option>
            </select>
          </div>

          <div class="style-option" id="mini-scale-option" style="${
            this.mediaDisplayMode === "mini" ? "" : "display: none;"
          }">
            <label for="mini-media-scale-slider" style="display: block; margin-bottom: 5px;">迷你模式下，多媒体（图片、视频）缩放比例</label>
            <div style="display: flex; align-items: center; gap: 10px;">
              <input type="range" id="mini-media-scale-slider" min="1" max="100" value="${
                this.miniMediaScale
              }" oninput="changeMiniMediaScale(this.value)" style="flex: 1;">
              <span id="mini-media-scale-value" style="width: 40px;">${
                this.miniMediaScale
              }%</span>
            </div>
          </div>

          <div class="style-option-divider"></div>

          <div class="style-option">
            <label style="display: block; margin-bottom: 10px;">
              智能伪装功能
              <span style="color: #666; font-size: 12px; margin-left: 8px;">
                (防老板/同事发现摸鱼)
              </span>
            </label>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input
                  type="checkbox"
                  id="disguise-toggle"
                  ${this.enableDisguise ? "checked" : ""}
                  onchange="toggleDisguiseMode(this.checked)"
                  style="transform: scale(1.2);"
                >
                <span style="font-weight: 500;">启用智能伪装</span>
              </label>
            </div>
            <div style="font-size: 12px; color: var(--vscode-descriptionForeground); line-height: 1.4; padding: 8px 12px; background: var(--vscode-textBlockQuote-background); border: 1px solid var(--vscode-textBlockQuote-border); border-radius: 4px;">
              <div style="margin-bottom: 4px;">
                <strong style="color: var(--vscode-editor-foreground);">功能说明：</strong>当页面失去焦点时，自动将标题和图标伪装成代码文件
              </div>
              <div style="margin-bottom: 4px;">
                <strong style="color: var(--vscode-editor-foreground);">使用场景：</strong>工作时间浏览内容，避免被老板/同事发现摸鱼 (～￣▽￣)～
              </div>
              <div>
                更多设置请在 <strong style="color: var(--vscode-textLink-foreground);">设置 → 扩展 → 知乎摸鱼</strong> 中调整，或在侧边栏菜单中快速切换
              </div>
            </div>
          </div>

          <div class="style-option-divider"></div>

          <div class="style-option">
            <label style="display: block; margin-bottom: 10px;">
              灰色模式
              <span style="color: #666; font-size: 12px; margin-left: 8px;">
                (降低页面色彩，减少视觉干扰)
              </span>
            </label>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input
                  type="checkbox"
                  id="grayscale-toggle"
                  ${this.enableGrayscale ? "checked" : ""}
                  onchange="toggleGrayscaleMode(this.checked)"
                  style="transform: scale(1.2);"
                >
                <span style="font-weight: 500;">启用灰色模式</span>
              </label>
            </div>
            <div style="font-size: 12px; color: var(--vscode-descriptionForeground); line-height: 1.4; padding: 8px 12px; background: var(--vscode-textBlockQuote-background); border: 1px solid var(--vscode-textBlockQuote-border); border-radius: 4px;">
              <div style="margin-bottom: 4px;">
                <strong style="color: var(--vscode-editor-foreground);">功能说明：</strong>将页面所有内容转为灰色显示，降低色彩干扰，防刺眼
              </div>
              <div>
                <strong style="color: var(--vscode-editor-foreground);">使用场景：</strong>统一颜色显示，更好地摸鱼，降低被老板/同事发现的风险😂
              </div>
            </div>
          </div>

          <div class="style-option-divider"></div>

          <!-- 工具栏自定义设置区域 -->
          <div class="style-option">
            <label style="display: block; margin-bottom: 10px; font-weight: bold;">
              工具栏自定义
              <span style="color: #666; font-size: 12px; margin-left: 8px;">
                (自定义显示哪些按钮及其顺序)
              </span>
            </label>
            <div style="font-size: 12px; color: var(--vscode-descriptionForeground); line-height: 1.4; padding: 8px 12px; background: var(--vscode-textBlockQuote-background); border: 1px solid var(--vscode-textBlockQuote-border); border-radius: 4px; margin-bottom: 10px;">
              <div style="margin-bottom: 4px;">
                <strong style="color: var(--vscode-editor-foreground);">功能说明：</strong>可以自定义显示哪些工具栏按钮，以及调整它们的显示顺序
              </div>
              <div style="margin-bottom: 4px;">
                <strong style="color: var(--vscode-editor-foreground);">使用方法：</strong>勾选要显示的按钮，拖拽按钮项调整顺序，设置会自动保存
              </div>
              <div>
                <strong style="color: var(--vscode-textLink-foreground);">提示：</strong>按钮按顺序号排列，彩色标签表示功能分类，在沉浸模式下可悬停按钮点击 × 快速隐藏
              </div>
            </div>

            <div id="toolbar-config-container" style="max-height: 400px; overflow-y: auto; border: 1px solid var(--vscode-panel-border); border-radius: 4px; padding: 10px;">
              <!-- 工具栏按钮配置将在这里动态生成 -->
            </div>

            <div style="display: flex; gap: 10px; margin-top: 10px;">
              <button class="button" onclick="resetToolbarConfig()" style="flex: 1; font-size: 12px;">
                恢复默认配置
              </button>
              <button class="button" onclick="toggleAllToolbarButtons()" style="flex: 1; font-size: 12px;">
                全选/全不选
              </button>
            </div>
          </div>
        </div>

        <div class="style-buttons">
          <button class="button" id="style-reset-button" style="flex: 1;">重置样式</button>
        </div>
      </div>
    `;
  }
}
