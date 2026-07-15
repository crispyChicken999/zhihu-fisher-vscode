/**
 * 加载中的HTML模板
 * 支持键盘快捷键切换上/下一篇内容，避免等待不感兴趣的内容加载完成
 */
export const loadingTemplate = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\${TITLE}</title>
  <style>
    /* ===== CSS Reset & Variables ===== */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      height: 100vh;
      font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe WPC', 'Segoe UI', system-ui, 'Ubuntu', 'Droid Sans', sans-serif);
      line-height: 1.6;
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      user-select: none;
      -webkit-user-select: none;
    }

    html.grayscale-mode {
      filter: grayscale(100%);
    }

    /* ===== Main Container ===== */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      max-width: 600px;
      width: 100%;
      padding: 40px 32px;
      text-align: center;
    }

    /* ===== Spinner ===== */
    .loading-spinner {
      width: 36px;
      height: 36px;
      border: 3px solid var(--vscode-panel-border);
      border-top-color: var(--vscode-progressBar-background);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 24px;
      flex-shrink: 0;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* ===== Type Badge ===== */
    .content-type-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      margin-bottom: 16px;
      letter-spacing: 0.3px;
    }

    .content-type-badge .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--vscode-badge-foreground);
      animation: pulse-dot 1.5s ease-in-out infinite;
    }

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    /* ===== Title Section (main visual focus) ===== */
    .title-section {
      width: 100%;
      margin-bottom: 24px;
    }

    .title-text {
      font-size: 17px;
      font-weight: 700;
      color: var(--vscode-foreground);
      word-wrap: break-word;
      line-height: 1.5;
      margin-bottom: 14px;
      max-width: 100%;
      letter-spacing: 0.02em;
    }

    .thumbnail-container {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 12px;
      border-radius: 6px;
      overflow: hidden;
    }

    .thumbnail-container img {
      max-width: 280px;
      max-height: 180px;
      width: auto;
      height: auto;
      border-radius: 6px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      object-fit: cover;
    }

    .thumbnail-container.mini img {
      width: \${MINI_MEDIA_SCALE}%;
      height: auto;
    }

    .thumbnail-container.none {
      display: none;
    }

    .excerpt-text {
      font-size: 14px;
      color: var(--vscode-descriptionForeground);
      line-height: 1.6;
      max-width: 100%;
      word-wrap: break-word;
      max-height: 132px;
      overflow-y: auto;
      scroll-behavior: smooth;
      padding: 0 4px;
    }

    /* ===== Divider ===== */
    .divider {
      width: 40%;
      height: 1px;
      background: var(--vscode-panel-border);
      margin: 16px auto 12px;
      opacity: 0.25;
    }

    /* ===== Navigation Section (secondary control) ===== */
    .nav-section {
      width: 100%;
      margin-bottom: 12px;
    }

    .nav-section-label {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 10px;
      opacity: 0.45;
    }

    .nav-section-label svg {
      width: 11px;
      height: 11px;
      opacity: 0.5;
    }

    .nav-buttons {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .nav-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border: 1px solid var(--vscode-panel-border);
      border-radius: 5px;
      background: transparent;
      color: var(--vscode-descriptionForeground);
      cursor: pointer;
      font-size: 12px;
      font-weight: 400;
      font-family: inherit;
      transition: all 0.15s ease;
      white-space: nowrap;
      width: fit-content;
      opacity: 0.7;
    }

    .nav-btn:hover {
      background: var(--vscode-list-hoverBackground);
      opacity: 1;
      color: var(--vscode-foreground);
    }

    .nav-btn:active {
      opacity: 0.6;
    }

    .nav-btn .shortcut-key {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      border-radius: 3px;
      font-size: 10px;
      font-weight: 500;
      font-family: var(--vscode-editor-font-family, monospace);
      letter-spacing: 0.3px;
      line-height: 1;
      opacity: 0.75;
    }

    .nav-btn .shortcut-separator {
      font-size: 10px;
      color: var(--vscode-descriptionForeground);
      opacity: 0.4;
      margin: 0 1px;
    }

    .nav-btn .arrow-icon {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
      opacity: 0.6;
    }

    /* ===== Tips Section (subtle hint) ===== */
    .tips-section {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      padding: 6px 12px;
      background: transparent;
      border: none;
      border-radius: 4px;
      margin-bottom: 10px;
      max-width: 100%;
      text-align: left;
      opacity: 0.5;
    }

    .tips-section .tips-icon {
      flex-shrink: 0;
      margin-top: 1px;
      font-size: 11px;
      opacity: 0.6;
    }

    .tips-section .tips-content {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      line-height: 1.5;
    }

    .tips-section .tips-content .settings-link {
      color: var(--vscode-textLink-foreground);
      cursor: pointer;
      text-decoration: none;
    }

    .tips-section .tips-content .settings-link:hover {
      text-decoration: underline;
    }

    /* ===== Browser Button ===== */
    .browser-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 14px;
      background: transparent;
      color: var(--vscode-textLink-foreground);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 400;
      font-family: inherit;
      transition: all 0.15s ease;
      opacity: 0.65;
    }

    .browser-btn:hover {
      background: var(--vscode-list-hoverBackground);
      opacity: 1;
    }

    /* ===== Toast Message (like fisher-welcome-message) ===== */
    .switch-toast {
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%) translateY(-12px);
      background: var(--vscode-notifications-background);
      color: var(--vscode-notifications-foreground);
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      font-family: var(--vscode-font-family);
      border: 1px solid var(--vscode-notifications-border);
      box-shadow: 0 4px 16px var(--vscode-widget-shadow);
      z-index: 10001;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
      text-align: center;
      white-space: nowrap;
    }

    .switch-toast.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    .switch-toast .toast-key {
      display: inline-block;
      padding: 2px 6px;
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      border-radius: 3px;
      font-size: 11px;
      font-weight: 600;
      font-family: var(--vscode-editor-font-family, monospace);
      margin: 0 2px;
      vertical-align: middle;
    }

    /* ===== Troubleshooting Modal ===== */
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

    .modal-footer .modal-btn {
      min-width: 70px;
      padding: 6px 10px;
      font-size: 13px;
      margin: 0;
      flex: 0 1 auto;
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.15s ease;
    }

    .modal-footer .modal-btn:hover {
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

    /* ===== Responsive: Small Screens (width < 480px) ===== */
    @media (max-width: 480px) {
      body {
        padding: 0;
        justify-content: flex-start;
        overflow-y: auto;
      }

      .loading-container {
        padding: 20px 14px;
        max-width: 100%;
      }

      .loading-spinner {
        width: 26px;
        height: 26px;
        border-width: 2px;
        margin-bottom: 14px;
      }

      .content-type-badge {
        font-size: 11px;
        padding: 3px 10px;
        margin-bottom: 10px;
      }

      .title-text {
        font-size: 15px;
        margin-bottom: 10px;
        max-height: none;
        overflow: visible;
      }

      .thumbnail-container img {
        max-width: 200px;
        max-height: 120px;
      }

      .excerpt-text {
        font-size: 13px;
        max-height: 80px;
      }

      .divider {
        margin: 12px auto 10px;
      }

      /* Small screen: only keep the action buttons */
      .nav-section-label {
        display: none;
      }

      .nav-buttons {
        flex-direction: row;
        gap: 10px;
        width: 100%;
      }

      .nav-btn {
        justify-content: center;
        padding: 6px 14px;
        font-size: 12px;
        gap: 6px;
      }

      .nav-btn .shortcut-key,
      .nav-btn .shortcut-separator {
        display: none;
      }

      .nav-btn .arrow-icon {
        width: 14px;
        height: 14px;
        opacity: 0.7;
      }

      .tips-section {
        display: none;
      }

      .browser-btn {
        font-size: 12px;
        padding: 6px 14px;
        opacity: 0.5;
      }

      .nav-buttons + .browser-btn {
        margin-top: 8px;
      }

      .switch-toast {
        font-size: 12px;
        padding: 8px 14px;
        top: 8px;
        max-width: 90vw;
      }
    }

    /* ===== Responsive: Medium Screens (480px - 768px) ===== */
    @media (min-width: 481px) and (max-width: 768px) {
      .loading-container {
        padding: 28px 20px;
        max-width: 90%;
      }

      .nav-btn {
        padding: 6px 12px;
        font-size: 12px;
      }
    }

  </style>
</head>
<body>
  <!-- Focus element for keyboard events -->
  <div id="focus-element" tabindex="-1" style="position:absolute;outline:none;"></div>

  <!-- Toast message (like fisher-welcome-message) -->
  <div id="switch-toast" class="switch-toast"></div>

  <div class="loading-container">
    <!-- Spinner -->
    <div class="loading-spinner"></div>

    <!-- Content Type Badge -->
    <div class="content-type-badge">
      <span class="dot"></span>
      <span>正在加载\${CONTENT_TYPE}...</span>
    </div>

    <!-- Title Section -->
    <div class="title-section">
      <div class="title-text">\${TITLE}</div>

      <!-- Thumbnail -->
      <div class="thumbnail-container \${MEDIA_DISPLAY_MODE}">
        <img id="previewImage" src="\${IMG_URL}" alt="配图" onLoad="this.style.display='block';" onError="this.style.display='none';">
      </div>

      <!-- Excerpt -->
      <div class="excerpt-text">\${EXCERPT}</div>
    </div>

    <div class="divider"></div>

    <!-- Navigation Section -->
    <div class="nav-section">
      <div class="nav-section-label">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"/>
        </svg>
        <span>不感兴趣？直接跳过</span>
      </div>
      <div class="nav-buttons">
        <button class="nav-btn" id="prev-btn" onclick="switchPrevArticleDirect()" title="快捷键切换上一篇内容">
          <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 20V7.825l-5.6 5.6L4 12l8-8l8 8l-1.4 1.425l-5.6-5.6V20z"/>
          </svg>
          <span>上一篇</span>
          <span class="shortcut-key" id="prev-shortcut-display"></span>
        </button>
        <button class="nav-btn" id="next-btn" onclick="switchNextArticleDirect()" title="快捷键切换下一篇内容">
          <span class="shortcut-key" id="next-shortcut-display"></span>
          <span>下一篇</span>
          <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 4v12.175l-5.6-5.6L4 12l8 8l8-8l-1.4-1.425l-5.6 5.6V4z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Tips Section -->
    <div class="tips-section">
      <span class="tips-icon">💡</span>
      <div class="tips-content">
        加载过程中可按快捷键切换上下篇内容，不喜欢的直接跳过~<br>
        点击按钮<strong>直接切换</strong>，快捷键需<strong>连续触发两次</strong>防止误触。<br>
        可在详情页的<span class="settings-link" onclick="openSettingsHint()">设置面板</span>中自定义快捷键。
      </div>
    </div>

    <!-- Browser Button -->
    <button class="browser-btn" onclick="openInBrowser()">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2z"/>
      </svg>
      在浏览器中打开
    </button>
  </div>

  <!-- Troubleshooting Modal -->
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
        <button class="modal-btn" onclick="updateCookie()">🔑 更新Cookie</button>
        <button class="modal-btn" onclick="configureBrowser()">🎯 配置浏览器</button>
        <button class="modal-btn" onclick="restartExtension()">🔄 重启扩展</button>
        <button class="modal-btn" onclick="restartVSCode()">🔄 重启VSCode</button>
        <button class="modal-btn" onclick="openInBrowser()">🌐 浏览器打开</button>
      </div>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    // ===== Focus Management =====
    // Auto-focus the focus element so keyboard shortcuts work without clicking
    const focusElement = document.getElementById('focus-element');
    if (focusElement) {
      focusElement.focus();
    }

    // Re-focus when window regains focus (tab switch)
    window.addEventListener('focus', function() {
      if (focusElement) {
        focusElement.focus();
      }
    });

    // Re-focus on click anywhere
    document.addEventListener('click', function() {
      if (focusElement && document.activeElement !== focusElement) {
        focusElement.focus();
      }
    });

    // ===== Double-trigger State =====
    let switchPending = null; // 'prev' | 'next' | null
    let switchPendingTimer = null;
    const DOUBLE_TRIGGER_TIMEOUT = 3000; // 3 seconds

        // ===== Shortcut Keys (read from localStorage, shared across same panel type) =====
    // Default shortcuts for prev/next article
    var defaultPrevShortcuts = ['W', 'Ctrl+↑'];
    var defaultNextShortcuts = ['S', 'Ctrl+↓'];

    function loadUserShortcuts() {
      try {
        var saved = localStorage.getItem('zhihu-fisher-shortcut-config');
        if (saved) {
          var config = JSON.parse(saved);
          if (config['prev-article'] && Array.isArray(config['prev-article']) && config['prev-article'].some(function(s) { return s && s.trim(); })) {
            prevShortcuts = config['prev-article'].filter(function(s) { return s && s.trim(); });
          }
          if (config['next-article'] && Array.isArray(config['next-article']) && config['next-article'].some(function(s) { return s && s.trim(); })) {
            nextShortcuts = config['next-article'].filter(function(s) { return s && s.trim(); });
          }
        }
      } catch(e) {
        // Ignore parse errors, use defaults
      }
    }

    var prevShortcuts = defaultPrevShortcuts.slice();
    var nextShortcuts = defaultNextShortcuts.slice();
    loadUserShortcuts();

    // Render ALL shortcut keys as badge pills on the buttons
    function renderShortcutKeys(shortcuts, containerId) {
      var container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = '';
      for (var i = 0; i < shortcuts.length; i++) {
        if (i > 0) {
          var sep = document.createElement('span');
          sep.className = 'shortcut-separator';
          sep.textContent = '|';
          container.appendChild(sep);
        }
        var badge = document.createElement('span');
        badge.className = 'shortcut-key';
        badge.textContent = shortcuts[i];
        container.appendChild(badge);
      }
    }

    renderShortcutKeys(prevShortcuts, 'prev-shortcut-display');
    renderShortcutKeys(nextShortcuts, 'next-shortcut-display');

    // ===== Toast Management =====
    function showToast(message) {
      const toast = document.getElementById('switch-toast');
      if (!toast) return;

      // Clear any existing timers
      if (toast._hideTimer) {
        clearTimeout(toast._hideTimer);
        toast._hideTimer = null;
      }

      toast.innerHTML = message;
      toast.classList.remove('show');

      // Force reflow
      void toast.offsetWidth;

      toast.classList.add('show');

      // Auto-hide after 2.5 seconds
      toast._hideTimer = setTimeout(function() {
        toast.classList.remove('show');
      }, 2500);
    }

    function buildToastMessage(direction, key) {
      var dirText = direction === 'prev' ? '上一篇' : '下一篇';
      return '再按一次 <span class="toast-key">' + key + '</span> 即可切换' + dirText + '内容';
    }

    // ===== Switch Article Functions =====
    // Direct switch (button click - no double-trigger needed)
    function switchPrevArticleDirect() {
      clearSwitchPending();
      vscode.postMessage({ command: 'switchToPreviousArticle' });
    }

    function switchNextArticleDirect() {
      clearSwitchPending();
      vscode.postMessage({ command: 'switchToNextArticle' });
    }

    // Double-trigger switch (keyboard shortcut)
    function triggerPrevArticle(matchedKey) {
      var key = matchedKey || prevShortcuts[0] || 'W';
      if (switchPending === 'prev') {
        clearSwitchPending();
        vscode.postMessage({ command: 'switchToPreviousArticle' });
      } else {
        clearSwitchPending();
        switchPending = 'prev';
        showToast(buildToastMessage('prev', key));
        switchPendingTimer = setTimeout(function() {
          clearSwitchPending();
        }, DOUBLE_TRIGGER_TIMEOUT);
      }
    }

    function triggerNextArticle(matchedKey) {
      var key = matchedKey || nextShortcuts[0] || 'S';
      if (switchPending === 'next') {
        clearSwitchPending();
        vscode.postMessage({ command: 'switchToNextArticle' });
      } else {
        clearSwitchPending();
        switchPending = 'next';
        showToast(buildToastMessage('next', key));
        switchPendingTimer = setTimeout(function() {
          clearSwitchPending();
        }, DOUBLE_TRIGGER_TIMEOUT);
      }
    }

        function clearSwitchPending() {
      switchPending = null;
      if (switchPendingTimer) {
        clearTimeout(switchPendingTimer);
        switchPendingTimer = null;
      }
      // Also hide toast
      var toast = document.getElementById('switch-toast');
      if (toast) {
        toast.classList.remove('show');
        if (toast._hideTimer) {
          clearTimeout(toast._hideTimer);
          toast._hideTimer = null;
        }
      }
    }

    // ===== Settings Hint =====
    function openSettingsHint() {
      vscode.postMessage({
        command: 'showNotification',
        message: '在详情页打开设置面板（按 . 键），切换到"快捷键"标签页即可自定义快捷键'
      });
    }

    // ===== Keyboard Shortcut Handling =====
    document.addEventListener('keyup', function(event) {
      // Ignore if troubleshooting modal is open
      var modal = document.getElementById('troubleshootingModal');
      if (modal && modal.style.display === 'block') {
        if (event.key === 'Escape') {
          closeTroubleshootingModal();
        }
        return;
      }

      // Allow Escape to cancel pending switch
      if (event.key === 'Escape' && switchPending) {
        clearSwitchPending();
        return;
      }

      // Build current key combination (consistent with shortcutsScript's event.code-based approach)
      var currentKey = '';
      if (event.ctrlKey) currentKey += 'Ctrl+';
      if (event.altKey) currentKey += 'Alt+';
      if (event.shiftKey) currentKey += 'Shift+';
      if (event.metaKey) currentKey += 'Meta+';

      if (event.code.startsWith('Digit')) {
        currentKey += event.code.replace('Digit', '');
      } else if (event.code.startsWith('Key')) {
        currentKey += event.code.replace('Key', '');
      } else if (event.key === ' ') {
        currentKey += 'Space';
      } else if (event.code === 'ArrowUp') {
        currentKey += '↑';
      } else if (event.code === 'ArrowDown') {
        currentKey += '↓';
      } else if (event.code === 'ArrowLeft') {
        currentKey += '←';
      } else if (event.code === 'ArrowRight') {
        currentKey += '→';
      } else if (event.code === 'Slash') {
        currentKey += '/';
      } else if (event.code === 'Period') {
        currentKey += '.';
      } else if (event.code === 'Comma') {
        currentKey += ',';
      } else {
        currentKey += event.key.length === 1 ? event.key.toUpperCase() : event.key;
      }

      // Check if it matches prev article shortcuts
      for (var i = 0; i < prevShortcuts.length; i++) {
        if (prevShortcuts[i] === currentKey) {
          triggerPrevArticle(currentKey);
          return;
        }
      }

      // Check if it matches next article shortcuts
      for (var j = 0; j < nextShortcuts.length; j++) {
        if (nextShortcuts[j] === currentKey) {
          triggerNextArticle(currentKey);
          return;
        }
      }
    });

    // ===== Custom Styles Loader =====
    function loadCustomStyles() {
      var defaultStyles = {
        fontSize: '14px',
        lineHeight: '1.6',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe WPC", "Segoe UI", system-ui, "Ubuntu", "Droid Sans", sans-serif',
        contentColor: getComputedStyle(document.body).getPropertyValue('--vscode-foreground').trim(),
        contentOpacity: 100,
        textAlign: 'left'
      };

      var hexToRgba = function(hex, opacity) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + (opacity / 100) + ')';
      };

      var savedStyles;
      try {
        savedStyles = JSON.parse(localStorage.getItem('zhihu-fisher-text-styles')) || defaultStyles;
      } catch(e) {
        savedStyles = defaultStyles;
      }

      if (savedStyles) {
        document.body.style.fontSize = savedStyles.fontSize;
        document.body.style.lineHeight = savedStyles.lineHeight;
        document.body.style.fontFamily = savedStyles.fontFamily;

        // 获取透明度设置
        var opacity = savedStyles.contentOpacity !== undefined ? savedStyles.contentOpacity : 100;

        // 应用自定义文字颜色(考虑透明度)
        var titleText = document.querySelector('.title-text');
        var excerptText = document.querySelector('.excerpt-text');

        if (savedStyles.contentColor && savedStyles.contentColor !== defaultStyles.contentColor) {
          var finalColor = opacity < 100 ? hexToRgba(savedStyles.contentColor, opacity) : savedStyles.contentColor;
          if (titleText) titleText.style.color = finalColor;
          if (excerptText) excerptText.style.color = finalColor;
        }
      }
    }

    function loadGrayscaleMode() {
      var isGrayscaleMode = localStorage.getItem('zhihu-fisher-grayscale-mode') === 'true';
      if (isGrayscaleMode) {
        document.querySelector('html').classList.add('grayscale-mode');
      }
    }

    function applyMiniMediaScale() {
      var imageContainer = document.querySelector('.thumbnail-container');
      if (imageContainer && imageContainer.classList.contains('mini')) {
        var savedMiniScale = localStorage.getItem('zhihu-fisher-mini-scale');
        if (savedMiniScale) {
          var scale = parseInt(savedMiniScale);
          if (scale >= 1 && scale <= 100) {
            var img = imageContainer.querySelector('img');
            if (img) {
              img.style.width = scale + '%';
            }
          }
        }
      }
    }

    window.addEventListener('load', function() {
      loadCustomStyles();
      loadGrayscaleMode();
      applyMiniMediaScale();
    });

    if (document.readyState === 'complete') {
      loadCustomStyles();
      loadGrayscaleMode();
      applyMiniMediaScale();
    }

    // ===== Post Message: Request Content Loading =====
    vscode.postMessage({ command: 'requestContent' });

    // Show troubleshooting modal after 15 seconds
    setTimeout(function() {
      showTroubleshootingModal();
    }, 15000);

    // ===== Utility Functions =====
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

    function showTroubleshootingModal() {
      var modal = document.getElementById('troubleshootingModal');
      if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        modal.focus();
      }
    }

    function closeTroubleshootingModal(event) {
      if (event && event.target !== event.currentTarget) {
        return;
      }
      var modal = document.getElementById('troubleshootingModal');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    }

    // Keyboard event for modal
    document.addEventListener('keydown', function(event) {
      var modal = document.getElementById('troubleshootingModal');
      if (modal && modal.style.display === 'block') {
        if (event.key === 'Escape') {
          closeTroubleshootingModal();
        }
      }
    });
  </script>
</body>
</html>
`;
