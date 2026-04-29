/**
 * 加载中的HTML模板
 */
export const loadingTemplate = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\${TITLE}</title>
  <style>
    body {
      height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe WPC', 'Segoe UI', system-ui, 'Ubuntu', 'Droid Sans', sans-serif;
      padding: 20px;
      line-height: 1.6;
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      max-width: 800px;
      overflow: hidden;
    }

    /* 灰色模式样式 */
    html.grayscale-mode {
      filter: grayscale(100%);
    }

    .loading-container {
      height: fit-content;
      max-height: 90vh;
      justify-content: center;
      overflow: auto;
      scroll-behavior: smooth;
      padding: 0 20px;
      width: 100%;
      text-align: center;
    }

    .loading-spinner {
      flex: 0 0 40px;
      width: 40px;
      height: 40px;
      border: 5px solid rgba(0, 0, 0, 0.1);
      border-top-color: var(--vscode-button-background);
      border-radius: 50%;
      animation: spin 1s ease-in-out infinite;
      margin: 0 auto 30px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    h1, h2, h3 {
      color: var(--vscode-editor-foreground);
      margin: 10px 0;
      text-align: center;
    }
    h2 {
      font-size: 18px;
      font-weight: 500;
      margin-bottom: 20px;
    }
    h3 {
      font-size: 16px;
      font-weight: 400;
      max-width: 100%;
      word-wrap: break-word;
      margin-bottom: 15px;
      text-align: center;
    }
    p {
      max-width: 100%;
      max-height: 200px;
      overflow: auto;
      scroll-behavior: smooth;
      margin: 15px 0;
      color: var(--vscode-descriptionForeground);
      line-height: 1.5;
    }
    .divider {
      border: none;
      height: 1px;
      background-color: var(--vscode-panel-border);
      width: 60%;
      max-width: 600px;
      margin: 20px auto;
    }
    .button {
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 8px 16px;
      border-radius: 2px;
      cursor: pointer;
      margin: 5px;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: inline-block;
    }
    .button:hover {
      background-color: var(--vscode-button-hoverBackground);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .button.secondary {
      background-color: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }
    .button.secondary:hover {
      background-color: var(--vscode-button-secondaryHoverBackground);
    }
    .cookie-warning {
      display: none;
      margin: 20px auto;
      padding: 15px;
      background-color: var(--vscode-inputValidation-warningBackground);
      color: var(--vscode-inputValidation-warningForeground);
      border: 1px solid var(--vscode-inputValidation-warningBorder);
      border-radius: 3px;
      text-align: center;
      max-width: 500px;
    }
    .cookie-warning p {
      margin: 5px 0;
      font-size: 14px;
    }
    .image-container {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .image-container img {
      max-width: 300px;
      height: auto;
      border-radius: 5px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .image-container.mini img {
      width: \${MINI_MEDIA_SCALE}%;
      height: auto;
    }
    .image-container.none {
      display: none;
    }
    .title {
      font-size: 14px;
      font-weight: 600;
      margin: 10px 0;
      word-wrap: break-word;
      max-width: 100%;
    }
    .excerpt {
      max-width: 100%;
      max-height: 300px;
      overflow: auto;
      scroll-behavior: smooth;
      font-size: 14px;
    }
    .divider {
      border: 0px solid var(--vscode-panel-border);
      width: 60%;
      max-width:600px;
      margin: 10px auto;
    }

    /* 弹窗样式 */
    .modal-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      backdrop-filter: blur(2px);
    }

    .modal-content {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      max-width: 800px;
      width: 90vw;
      overflow: hidden;
      z-index: 1001;
    }

    .modal-header {
      padding: 10px 20px 10px;
      border-bottom: 1px solid var(--vscode-panel-border);
      background-color: var(--vscode-editor-background);
      z-index: 1002;
      display: flex;
      justify-content: space-between;
    }

    .modal-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--vscode-foreground);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: var(--vscode-descriptionForeground);
      border-radius: 3px;
      transition: all 0.2s ease;
    }

    .modal-close:hover {
      background-color: var(--vscode-toolbar-hoverBackground);
      color: var(--vscode-foreground);
    }

    .modal-body {
      padding: 6px 16px;
      overflow-y: auto;
      scroll-behavior: smooth;
      max-height: calc(90vh - 160px);
      line-height: 1.6;
    }

    .modal-body h4 {
      margin: 16px 0 8px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--vscode-foreground);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .modal-body p {
      margin: 8px 0;
      color: var(--vscode-descriptionForeground);
      font-size: 14px;
    }

    .modal-body .solution-item {
      margin: 12px 0;
      padding: 12px;
      background-color: var(--vscode-textBlockQuote-background);
      border-left: 3px solid var(--vscode-textBlockQuote-border);
      border-radius: 4px;
      text-align: left;
      transition: all 0.2s ease;
    }

    .modal-body .solution-item:hover {
      transform: translateY(-4px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      filter: brightness(1.25);
      border-radius: 8px;
    }

    .modal-body .solution-title {
      font-weight: 600;
      color: var(--vscode-foreground);
      margin-bottom: 4px;
    }

    .modal-body .solution-desc {
      color: var(--vscode-descriptionForeground);
      font-size: 13px;
      margin: 2px 0;
    }

    .modal-footer {
      padding: 10px;
      border-top: 1px solid var(--vscode-panel-border);
      background-color: var(--vscode-editor-background);
      text-align: center;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px;
    }

    .modal-footer .button {
      min-width: 70px;
      padding: 6px 10px;
      font-size: 13px;
      margin: 0;
      flex: 0 1 auto;
    }

    .modal-footer .button.primary {
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }

    .modal-footer .button.primary:hover {
      background-color: var(--vscode-button-hoverBackground);
    }

    .recommendation-steps {
      background-color: var(--vscode-textCodeBlock-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 4px;
      padding: 16px;
      margin: 16px 0;
      overflow: hidden;
    }

    .recommendation-steps h4 {
      margin-top: 0;
      color: var(--vscode-foreground);
    }

    .recommendation-steps ol {
      margin: 8px 0;
      padding-left: 20px;
    }

    .recommendation-steps li {
      margin: 6px 0;
      text-align: left;
      color: var(--vscode-descriptionForeground);
    }
  </style>
</head>
<body>
  <div class="loading-container">
    <div class="loading-spinner"></div>
    <h3>正在加载\${CONTENT_TYPE}...</h3>
    <!-- 缩略图容器 -->
    <div class="image-container \${MEDIA_DISPLAY_MODE}">
      <img id="previewImage" class="preview-image" src="\${IMG_URL}" alt="文章配图" onLoad="this.style.display='block';" onError="this.style.display='none';">
    </div>
    <div class="title">\${TITLE}</div>

    <div class="divider"></div>

    <p class="excerpt" >\${EXCERPT}</p>
    <button class="button" onclick="openInBrowser()">🌐 在浏览器中打开</button>

    <!-- 故障排除弹窗 -->
    <div id="troubleshootingModal" class="modal-overlay" onclick="closeTroubleshootingModal(event)">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">🤔 看起来好像卡住了，可能是以下问题</h3>
          <button class="modal-close" onclick="closeTroubleshootingModal()">&times;</button>
        </div>

        <div class="modal-body">
          <div class="solution-item">
            <div class="solution-title">1. Cookie失效</div>
            <div class="solution-desc">原因：知乎Cookie过期或失效，被重定向到登录页，无法抓取数据</div>
            <div class="solution-desc">解决：点击【更新Cookie】重新设置知乎登录信息</div>
          </div>

          <div class="solution-item">
            <div class="solution-title">2. 网络连接问题</div>
            <div class="solution-desc">原因：网络不稳定或速度过慢，导致加载失败</div>
            <div class="solution-desc">解决：检查网络连接，稍后重试，或切换网络环境</div>
          </div>

          <div class="solution-item">
            <div class="solution-title">3. 扩展状态异常</div>
            <div class="solution-desc">原因：设置了新Cookie仍不行，可能状态没更新</div>
            <div class="solution-desc">解决：点击【重启扩展】重新加载扩展功能。如果还不行，可以重启VSCode试试</div>
          </div>

          <div class="solution-item">
            <div class="solution-title">4. 浏览器引擎问题</div>
            <div class="solution-desc">原因：爬虫浏览器未正确安装或配置</div>
            <div class="solution-desc">解决：点击【配置浏览器】重新安装或设置浏览器</div>
          </div>

          <div class="solution-item">
            <div class="solution-title">5. 知乎服务器问题</div>
            <div class="solution-desc">原因：知乎服务器响应慢或临时不可用</div>
            <div class="solution-desc">解决：稍后重试，或直接在浏览器中打开链接。也可以关闭这个弹窗继续等待...</div>
          </div>

          <div class="recommendation-steps">
            <h4>💡 推荐操作顺序：</h4>
            <ol>
              <li>首先尝试【更新Cookie】</li>
              <li>如果还是不行，检查【配置浏览器】</li>
              <li>如果问题依然存在，点击【重启扩展】</li>
              <li>还不行？点击【重启VSCode】</li>
              <li>最后可以尝试【在浏览器中打开】</li>
            </ol>
          </div>
        </div>

        <div class="modal-footer">
          <button class="button primary" onclick="updateCookie()">🔑 更新Cookie</button>
          <button class="button primary" onclick="configureBrowser()">🎯 配置浏览器</button>
          <button class="button primary" onclick="restartExtension()">🔄 重启扩展</button>
          <button class="button primary" onclick="restartVSCode()">🔄 重启VSCode</button>
          <button class="button primary" onclick="openInBrowser()">🌐 浏览器打开</button>
        </div>
      </div>
    </div>
  </div>
  <script>
    const vscode = acquireVsCodeApi();

    // 加载并应用用户自定义样式
    function loadCustomStyles() {
      // 默认样式
      const defaultStyles = {
        fontSize: '14px',
        lineHeight: '1.6',
        maxWidth: '800px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe WPC", "Segoe UI", system-ui, "Ubuntu", "Droid Sans", sans-serif',
        contentColor: getComputedStyle(document.body).getPropertyValue('--vscode-foreground').trim(),
        contentOpacity: 100,
        textAlign: 'left'
      };

      // 将hex颜色转换为rgba格式
      const hexToRgba = (hex, opacity) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const alpha = opacity / 100;
        return \`rgba(\${r}, \${g}, \${b}, \${alpha})\`;
      };

      // 从localStorage加载样式设置
      const savedStyles = JSON.parse(localStorage.getItem('zhihu-fisher-text-styles')) || defaultStyles;

      if (savedStyles) {
        // 应用样式到loading页面
        document.body.style.fontSize = savedStyles.fontSize;
        document.body.style.lineHeight = savedStyles.lineHeight;
        document.body.style.maxWidth = savedStyles.maxWidth;
        document.body.style.fontFamily = savedStyles.fontFamily;

        // 获取透明度设置
        const opacity = savedStyles.contentOpacity !== undefined ? savedStyles.contentOpacity : 100;
        
        // 应用自定义文字颜色(考虑透明度)
        const loadingContainer = document.querySelector('.loading-container');
        const title = document.querySelector('h3');
        const loadingText = document.querySelector('h2');
        const excerpt = document.querySelector('.excerpt');

        if (savedStyles.contentColor && savedStyles.contentColor !== defaultStyles.contentColor) {
          // 根据透明度决定使用hex还是rgba格式
          const finalColor = opacity < 100 ? hexToRgba(savedStyles.contentColor, opacity) : savedStyles.contentColor;
          
          if (loadingContainer) loadingContainer.style.color = finalColor;
          if (title) title.style.color = finalColor;
          if (excerpt) excerpt.style.color = finalColor;
          if (loadingText) loadingText.style.color = finalColor;
        }

        if (loadingText) loadingText.style.textAlign = savedStyles.textAlign;
      }
    }

    // 加载并应用灰色模式
    function loadGrayscaleMode() {
      // 从localStorage获取灰色模式状态
      const isGrayscaleMode = localStorage.getItem('zhihu-fisher-grayscale-mode') === 'true';

      // 如果灰色模式已开启，应用灰色模式样式
      if (isGrayscaleMode) {
        document.querySelector('html').classList.add('grayscale-mode');
      }
    }

    // 应用Mini模式的动态缩放比例
    function applyMiniMediaScale() {
      const imageContainer = document.querySelector('.image-container');
      if (imageContainer && imageContainer.classList.contains('mini')) {
        // 从vscode配置或localStorage获取缩放比例
        const savedMiniScale = localStorage.getItem('zhihu-fisher-mini-scale');
        if (savedMiniScale) {
          const scale = parseInt(savedMiniScale);
          if (scale >= 1 && scale <= 100) {
            const img = imageContainer.querySelector('img');
            if (img) {
              img.style.width = scale + '%';
            }
          }
        }
      }
    }

    // 页面加载完成后应用自定义样式和图片显示模式
    window.addEventListener('load', function() {
      loadCustomStyles();
      loadGrayscaleMode();
      applyMiniMediaScale();
    });

    // 立即尝试加载样式（以防window.load事件已经触发）
    if (document.readyState === 'complete') {
      loadCustomStyles();
      loadGrayscaleMode();
      applyMiniMediaScale();
    }

    // 通知扩展加载内容
    vscode.postMessage({ command: 'requestContent' });

    // 15秒后显示故障排除弹窗
    setTimeout(() => {
      showTroubleshootingModal();
    }, 15000);

    function openInBrowser() {
      vscode.postMessage({ command: 'openInBrowser' });
    }

    function updateCookie() {
      vscode.postMessage({ command: 'updateCookie' });
    }

    function restartExtension() {
      vscode.postMessage({ command: 'restartExtension' });
    }

    function configureBrowser() {
      vscode.postMessage({ command: 'configureBrowser' });
    }

    function restartVSCode() {
      vscode.postMessage({ command: 'restartVSCode' });
    }

    // 显示故障排除弹窗
    function showTroubleshootingModal() {
      const modal = document.getElementById('troubleshootingModal');
      if (modal) {
        modal.style.display = 'block';
        // 防止背景滚动
        document.body.style.overflow = 'hidden';
        // 聚焦到弹窗，方便键盘操作
        modal.focus();
      }
    }

    // 关闭故障排除弹窗
    function closeTroubleshootingModal(event) {
      // 如果传入了事件对象，检查是否点击的是遮罩层
      if (event && event.target !== event.currentTarget) {
        return;
      }

      const modal = document.getElementById('troubleshootingModal');
      if (modal) {
        modal.style.display = 'none';
        // 恢复背景滚动
        document.body.style.overflow = 'auto';
      }
    }

    // 键盘事件处理
    document.addEventListener('keydown', function(event) {
      const modal = document.getElementById('troubleshootingModal');
      if (modal && modal.style.display === 'block') {
        // ESC键关闭弹窗
        if (event.key === 'Escape') {
          closeTroubleshootingModal();
        }
      }
    });
  </script>
</body>
</html>
`;
