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
    .loading-container {
      height: fit-content;
      max-height: 90vh;
      justify-content: center;
      overflow: auto;
      padding-right: 20px;
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
      margin: 20px 0;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .button:hover {
      background-color: var(--vscode-button-hoverBackground);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
      max-width: 80%;
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
      font-size: 14px;
    }
    .divider {
      border: 0px solid var(--vscode-panel-border);
      width: 60%;
      max-width:600px;
      margin: 10px auto;
    }
  </style>
</head>
<body>
  <div class="loading-container">
    <div class="loading-spinner"></div>
    <h3>正在加载文章内容...</h3>
    <!-- 缩略图容器 -->
    <div class="image-container \${MEDIA_DISPLAY_MODE}">
      <img id="previewImage" class="preview-image" src="\${IMG_URL}" alt="文章配图" onLoad="this.style.display='block';" onError="this.style.display='none';">
    </div>
    <div class="title">\${TITLE}</div>

    <div class="divider"></div>

    <p class="excerpt" >\${EXCERPT}</p>
    <button class="button" onclick="openInBrowser()">在浏览器中打开</button>

    <div id="cookieWarning" class="cookie-warning">
      <p><strong>提示：</strong>内容加载时间过长，可能是知乎Cookie已失效。</p>
      <p>请尝试更新您的Cookie信息后重新打开页面。</p>
      <button class="button" onclick="updateCookie()">更新Cookie</button>
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
        textAlign: 'left'
      };

      // 从localStorage加载样式设置
      const savedStyles = JSON.parse(localStorage.getItem('savedStyles')) || defaultStyles;

      if (savedStyles) {
        // 应用样式到loading页面
        document.body.style.fontSize = savedStyles.fontSize;
        document.body.style.lineHeight = savedStyles.lineHeight;
        document.body.style.maxWidth = savedStyles.maxWidth;
        document.body.style.fontFamily = savedStyles.fontFamily;

        // 应用自定义文字颜色
        const loadingContainer = document.querySelector('.loading-container');
        const title = document.querySelector('h3');
        const loadingText = document.querySelector('h2');
        const excerpt = document.querySelector('.excerpt');

        if (savedStyles.contentColor && savedStyles.contentColor !== defaultStyles.contentColor) {
          if (loadingContainer) loadingContainer.style.color = savedStyles.contentColor;
          if (title) title.style.color = savedStyles.contentColor;
          if (excerpt) excerpt.style.color = savedStyles.contentColor;
          if (loadingText) loadingText.style.color = savedStyles.contentColor;
        }

        if (loadingText) loadingText.style.textAlign = savedStyles.textAlign;
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
      applyMiniMediaScale();
    });

    // 立即尝试加载样式（以防window.load事件已经触发）
    if (document.readyState === 'complete') {
      loadCustomStyles();
      applyMiniMediaScale();
    }

    // 通知扩展加载内容
    vscode.postMessage({ command: 'requestContent' });

    // 10秒后显示Cookie提示
    setTimeout(() => {
      document.getElementById('cookieWarning').style.display = 'block';
    }, 10000);

    function openInBrowser() {
      vscode.postMessage({ command: 'openInBrowser' });
    }

    function updateCookie() {
      vscode.postMessage({ command: 'updateCookie' });
    }
  </script>
</body>
</html>
`;
