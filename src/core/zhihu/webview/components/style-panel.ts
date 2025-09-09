import { Component, RenderOptions } from "./base";

/**
 * 设置面板组件
 */
export class StylePanelComponent implements Component {
  private mediaDisplayMode: string = "normal";
  private miniMediaScale: number = 50;
  private enableDisguise: boolean = true;
  private enableGrayscale: boolean = false;
  private selectedDisguiseTypes: string[] = [];

  constructor(renderOptions: RenderOptions) {
    this.mediaDisplayMode = renderOptions.mediaDisplayMode || "normal";
    this.miniMediaScale = renderOptions.miniMediaScale || 50;
    this.enableDisguise =
      renderOptions.enableDisguise !== undefined
        ? renderOptions.enableDisguise
        : true;
    this.selectedDisguiseTypes = renderOptions.selectedDisguiseTypes || [];
    // 灰色模式从localStorage读取，不依赖renderOptions
    this.enableGrayscale = false;
  }

  /**
   * 渲染设置面板
   * @returns 设置面板HTML
   */
  public render(): string {
    return `
      <div class="style-panel-mask" onclick="toggleStylePanel()"></div>

      <div class="style-panel" id="style-panel">
        <div class="style-panel-header">
          <span>设置</span>
          <button class="style-panel-header-close" onclick="toggleStylePanel()">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24">
              <!-- Icon from Iconoir by Luca Burgio -->
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 6l12 12M6 18L18 6"/>
            </svg>
          </button>
        </div>

        <!-- Tab页导航 - 固定不滚动 -->
        <div class="style-tabs">
          <button class="style-tab-button active" onclick="switchStyleTab('text')" data-tab="text">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
              <path fill="currentColor" d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z"/>
            </svg>
            文本样式
          </button>
          <button class="style-tab-button" onclick="switchStyleTab('media')" data-tab="media">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
              <path fill="currentColor" d="M5 3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5zm0 2h14v14H5V5zm2 2v10h3l2.5-3.25L14.5 17H19V7H7z"/>
            </svg>
            多媒体
          </button>
          <button class="style-tab-button" onclick="switchStyleTab('enhancement')" data-tab="enhancement">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22L12 18.77L5.82 22L7 14.14l-5-4.87l6.91-1.01L12 2z"/>
            </svg>
            功能增强
          </button>
          <button class="style-tab-button" onclick="switchStyleTab('toolbar')" data-tab="toolbar">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
              <path fill="currentColor" d="M3 17h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V5H3z"/>
            </svg>
            工具栏
          </button>
          <button class="style-tab-button" onclick="switchStyleTab('shortcuts')" data-tab="shortcuts">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
              <path fill="currentColor" d="M6 20h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2zM7 9h2v2H7V9zm3 0h2v2h-2V9zm3 0h2v2h-2V9zm-6 3h2v2H7v-2zm3 0h2v2h-2v-2zm3 0h2v2h-2v-2zm-6 3h8v2H7v-2z"/>
            </svg>
            快捷键
          </button>
        </div>

        <div class="style-panel-content">
          <!-- 文本样式Tab -->
          <div class="style-tab-content active" id="text-tab">
            <div class="style-option">
              <label for="font-size-slider" class="style-option-label">字体大小</label>
              <div class="style-option-flex">
                <input type="range" id="font-size-slider" min="8" max="24" value="14" class="style-option-flex-1">
                <span id="font-size-value" class="style-option-width-30">16px</span>
              </div>
            </div>

            <div class="style-option">
              <label for="line-height-slider" class="style-option-label">行高</label>
              <div class="style-option-flex">
                <input type="range" id="line-height-slider" min="1" max="2.5" value="1.6" step="0.1" class="style-option-flex-1">
                <span id="line-height-value" class="style-option-width-30">1.6</span>
              </div>
            </div>

            <div class="style-option">
              <label for="max-width-slider" class="style-option-label">最大宽度</label>
              <div class="style-option-flex">
                <input type="range" id="max-width-slider" min="300" max="2400" value="800" step="50" class="style-option-flex-1">
                <span id="max-width-value" class="style-option-width-30">800px</span>
              </div>
            </div>

            <div class="style-option">
              <label for="font-family-select" class="style-option-label">字体</label>
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
              <label for="content-color-picker" class="style-option-label-inline">字体颜色</label>
              <div id="content-color-picker" class="color-picker-container">
                <input
                  type="color"
                  id="content-color"
                  value="#000000"
                  class="color-picker"
                >
                <span class="color-value" id="content-color-value">#000000</span>
              </div>

              <!-- 常用颜色快选 -->
              <div class="color-presets-container">
                <label class="color-presets-label">常用颜色:</label>
                <div class="color-presets">
                  <button class="color-preset-btn" data-color="#000000" title="黑色" style="background-color: #000000" onclick="selectPresetColor('#000000')"></button>
                  <button class="color-preset-btn" data-color="#333333" title="深灰" style="background-color: #333333" onclick="selectPresetColor('#333333')"></button>
                  <button class="color-preset-btn" data-color="#666666" title="中灰" style="background-color: #666666" onclick="selectPresetColor('#666666')"></button>
                  <button class="color-preset-btn" data-color="#999999" title="浅灰" style="background-color: #999999" onclick="selectPresetColor('#999999')"></button>
                  <button class="color-preset-btn" data-color="#1890ff" title="蓝色" style="background-color: #1890ff" onclick="selectPresetColor('#1890ff')"></button>
                  <button class="color-preset-btn" data-color="#52c41a" title="绿色" style="background-color: #52c41a" onclick="selectPresetColor('#52c41a')"></button>
                  <button class="color-preset-btn" data-color="#fa8c16" title="橙色" style="background-color: #fa8c16" onclick="selectPresetColor('#fa8c16')"></button>
                  <button class="color-preset-btn" data-color="#f5222d" title="红色" style="background-color: #f5222d" onclick="selectPresetColor('#f5222d')"></button>
                  <button class="color-preset-btn" data-color="#722ed1" title="紫色" style="background-color: #722ed1" onclick="selectPresetColor('#722ed1')"></button>
                  <button class="color-preset-btn" data-color="#eb2f96" title="粉色" style="background-color: #eb2f96" onclick="selectPresetColor('#eb2f96')"></button>
                  <button class="color-preset-btn" data-color="#13c2c2" title="青色" style="background-color: #13c2c2" onclick="selectPresetColor('#13c2c2')"></button>
                  <button class="color-preset-btn" data-color="#a0d911" title="黄绿" style="background-color: #a0d911" onclick="selectPresetColor('#a0d911')"></button>
                </div>
              </div>
            </div>

            <div class="style-option">
              <label class="style-option-label-inline">对齐方式</label>
              <div class="style-option-flex-wrap">
                <label class="style-option-flex style-option-gap-5 style-option-cursor-pointer">
                  <input type="radio" name="text-align" value="left" checked>
                  <span>左对齐</span>
                </label>
                <label class="style-option-flex style-option-gap-5 style-option-cursor-pointer">
                  <input type="radio" name="text-align" value="center">
                  <span>居中对齐</span>
                </label>
                <label class="style-option-flex style-option-gap-5 style-option-cursor-pointer">
                  <input type="radio" name="text-align" value="right">
                  <span>右对齐</span>
                </label>
                <label class="style-option-flex style-option-gap-5 style-option-cursor-pointer">
                  <input type="radio" name="text-align" value="justify">
                  <span>两端对齐</span>
                </label>
              </div>
            </div>
          </div>

          <!-- 多媒体Tab -->
          <div class="style-tab-content" id="media-tab">
            <div class="style-option">
              <label for="media-display-select" class="style-option-label-inline">多媒体（图片、视频等）显示方式</label>
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
              <label for="mini-media-scale-slider" class="style-option-label">迷你模式下，多媒体（图片、视频）缩放比例</label>
              <div class="style-option-flex">
                <input type="range" id="mini-media-scale-slider" min="1" max="100" value="${
                  this.miniMediaScale
                }" onchange="changeMiniMediaScale(this.value)" oninput="updateMiniMediaScaleInputSpanValue(this.value)" class="style-option-flex-1">
                <span id="mini-media-scale-value" class="style-option-width-40">${
                  this.miniMediaScale
                }%</span>
              </div>
            </div>

            <details class="style-option-help-details">
              <summary class="style-option-help-summary">功能说明</summary>
              <div class="style-option-help-content">
                <div class="style-option-help-margin-4">
                  <strong class="style-option-help-strong">正常显示：</strong>图片和视频以原始大小显示
                </div>
                <div class="style-option-help-margin-4">
                  <strong class="style-option-help-strong">迷你模式：</strong>将所有多媒体内容缩小显示，减少干扰
                </div>
                <div>
                  <strong class="style-option-help-strong">全部隐藏：</strong>完全隐藏图片和视频，专注文字内容
                </div>
              </div>
            </details>
          </div>

          <!-- 功能增强Tab -->
          <div class="style-tab-content" id="enhancement-tab">
            <div class="style-option">
              <label class="style-option-label-inline">
                灰色模式
                <span class="style-option-color-description">
                  (防刺眼，摸鱼更加隐蔽)
                </span>
              </label>

              <div class="style-option-flex style-option-label-inline">
                <label class="style-option-flex style-option-gap-8 style-option-cursor-pointer">
                  <input
                    type="checkbox"
                    id="grayscale-toggle"
                    ${this.enableGrayscale ? "checked" : ""}
                    onchange="toggleGrayscaleMode(this.checked)"
                    class="style-option-transform-scale"
                  >
                  <span class="style-option-font-weight">启用灰色模式</span>
                </label>
              </div>

              <details class="style-option-help-details">
                <summary class="style-option-help-summary">功能说明</summary>
                <div class="style-option-help-content">
                  <div class="style-option-help-margin-4">
                    <strong class="style-option-help-strong">功能说明：</strong>将页面所有内容转为灰色显示，降低色彩干扰，防刺眼
                  </div>
                  <div>
                    <strong class="style-option-help-strong">使用场景：</strong>统一颜色显示，更好地摸鱼，降低被老板/同事发现的风险😂
                  </div>
                  <div>
                    <strong class="style-option-help-strong">提示：</strong>伪装的代码界面和设置面板，不受灰色模式影响
                  </div>
                </div>
              </details>
            </div>

            <div class="style-option-divider"></div>

            <div class="style-option">
              <label class="style-option-label-inline">
                智能伪装功能
                <span class="style-option-color-description">
                  (避免被老板or同事发现摸鱼)
                </span>
              </label>

              <div class="style-option-flex style-option-label-inline">
                <label class="style-option-flex style-option-gap-8 style-option-cursor-pointer">
                  <input
                    type="checkbox"
                    id="disguise-toggle"
                    ${this.enableDisguise ? "checked" : ""}
                    onchange="toggleDisguiseMode(this.checked)"
                    class="style-option-transform-scale"
                  >
                  <span class="style-option-font-weight">启用智能伪装</span>
                </label>
              </div>

              <details class="style-option-help-details">
                <summary class="style-option-help-summary">功能说明</summary>
                <div class="style-option-help-content">
                  <div class="style-option-help-margin-4">
                    <strong class="style-option-help-strong">功能说明：</strong>当切换到其他页面时，自动将 <b>图标、标题和界面</b> 伪装成代码文件
                  </div>
                  <div class="style-option-help-margin-4">
                    <strong class="style-option-help-strong">使用场景：</strong>工作时间浏览内容，避免被老板/同事发现摸鱼 (～￣▽￣)～
                  </div>
                  <div>
                    更多设置请在 <strong class="style-option-help-strong-link">设置 → 扩展 → 知乎摸鱼</strong> 中调整，或在侧边栏菜单中快速切换
                  </div>
                </div>
              </details>
            </div>

            <div class="style-option-divider" ${this.enableDisguise ? '' : 'style="display: none;"'}></div>

            <!-- 伪装文件类型选择 -->
            <div class="style-option-section" id="disguise-types-section" ${this.enableDisguise ? '' : 'style="display: none;"'}>
              <label class="style-option-label-inline style-option-font-weight">
                自定义伪装文件类型
                <span class="style-option-color-description">
                  (选择希望伪装成的文件类型)
                </span>
              </label>
              <details class="style-option-help-details">
                <summary class="style-option-help-summary">使用说明</summary>
                <div class="style-option-help-content">
                  <div class="style-option-help-margin-4">
                    <strong class="style-option-help-strong">使用说明：</strong>勾选想要的文件类型，未勾选则使用全部类型随机伪装
                  </div>
                  <div>
                    <strong class="style-option-help-strong-link">提示：</strong>可以根据你的职业选择相关的文件类型，比如前端工程师选择 JS/HTML/CSS 等
                  </div>
                </div>
              </details>

              <div id="disguise-types-container" class="style-option-container">
                <!-- 文件类型选择项将在这里动态生成 -->
              </div>

              <div class="style-option-button-group">
                <button class="button style-option-button" onclick="selectAllDisguiseTypes()">
                  全选
                </button>
                <button class="button style-option-button" onclick="clearAllDisguiseTypes()">
                  全不选
                </button>
                <button class="button style-option-button" onclick="previewDisguise()">
                  预览效果
                </button>
              </div>
            </div>
          </div>

          <!-- 工具栏Tab -->
          <div class="style-tab-content" id="toolbar-tab">
            <div class="style-option">
              <label class="style-option-label-with-margin">
                工具栏自定义
                <span class="style-option-color-description">
                  (自定义显示哪些按钮及其顺序)
                </span>
              </label>
              <details class="style-option-help-details">
                <summary class="style-option-help-summary">功能说明</summary>
                <div class="style-option-help-content">
                  <div class="style-option-help-margin-4">
                    <strong class="style-option-help-strong">功能说明：</strong>可以自定义显示哪些工具栏按钮，以及调整它们的显示顺序
                  </div>
                  <div class="style-option-help-margin-4">
                    <strong class="style-option-help-strong">使用方法：</strong>勾选要显示的按钮，拖拽按钮项调整顺序，设置会自动保存
                  </div>
                  <div>
                    <strong class="style-option-help-strong-link">提示：</strong>按钮按顺序号排列，彩色标签表示功能分类，在沉浸模式下可悬停按钮点击 × 快速隐藏
                  </div>
                </div>
              </details>

              <div id="toolbar-config-container" class="style-option-container">
                <!-- 工具栏按钮配置将在这里动态生成 -->
              </div>

              <div class="style-option-button-group">
                <button class="button style-option-button" onclick="resetToolbarConfig()">
                  恢复默认配置
                </button>
                <button class="button style-option-button" onclick="toggleAllToolbarButtons()">
                  全选/全不选
                </button>
              </div>
            </div>
          </div>

          <!-- 快捷键Tab -->
          <div class="style-tab-content" id="shortcuts-tab">
            <div class="style-option">
              <label class="style-option-label-with-margin">
                快捷键自定义
                <span class="style-option-color-description">
                  (自定义按钮的快捷键)
                </span>
              </label>
              <details class="style-option-help-details">
                <summary class="style-option-help-summary">功能说明</summary>
                <div class="style-option-help-content">
                  <div class="style-option-help-margin-4">
                    <strong class="style-option-help-strong">功能说明：</strong>可以为每个按钮自定义快捷键，设置后将显示在按钮的提示信息中
                  </div>
                  <div class="style-option-help-margin-4">
                    <strong class="style-option-help-strong">使用方法：</strong>点击快捷键输入框，按下想要设置的键组合，设置会自动保存
                  </div>
                  <div>
                    <strong class="style-option-help-strong-link">提示：</strong>支持 Ctrl、Alt、Shift 等修饰键，但请避免与系统快捷键冲突。
                    <br/>
                    清空快捷键后将使用默认值，并且该页面下快捷键不生效避免误触。
                  </div>
                </div>
              </details>

              <div id="shortcuts-config-container" class="style-option-container">
                <!-- 快捷键配置将在这里动态生成 -->
              </div>

              <div class="style-option-button-group">
                <button class="button style-option-button" onclick="resetShortcutConfig()">
                  恢复默认快捷键
                </button>
                <button class="button style-option-button" onclick="clearAllShortcuts()">
                  清空所有快捷键
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="style-buttons">
          <button class="button style-option-flex-1" id="style-reset-button">恢复默认设置</button>
        </div>
      </div>
    `;
  }
}
