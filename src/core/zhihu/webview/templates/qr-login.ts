/**
 * 扫码登录页面模板
 * 使用 \$ 转义，避免模板字面量被 TypeScript 解释为插值表达式，
 * 在运行时通过 .replace() 替换为实际内容
 *
 * 采用 VSCode Webview 原生设计风格：
 * - 使用 VSCode CSS 变量
 * - 统一的间距和圆角体系
 * - SVG 图标替代 emoji
 * - 无 transform/scale 等过度动效
 */
export const qrLoginTemplate = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\${PAGE_TITLE}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, "Segoe WPC", "Segoe UI", system-ui, "Ubuntu", "Droid Sans", sans-serif);
      background-color: var(--vscode-editor-background);
      color: var(--vscode-foreground);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
      line-height: 1.6;
    }

    .container {
      max-width: 400px;
      width: 100%;
      padding: 32px 28px 24px;
      background-color: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      text-align: center;
    }

    .header {
      margin-bottom: 20px;
    }

    .header-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }

    .header-icon svg {
      width: 28px;
      height: 28px;
      color: var(--vscode-foreground);
      opacity: 0.8;
    }

    .header h1 {
      font-size: 18px;
      font-weight: 600;
      color: var(--vscode-editor-foreground);
      margin-bottom: 6px;
    }

    .header p {
      font-size: 13px;
      color: var(--vscode-descriptionForeground);
    }

    .qrcode-section {
      margin: 12px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .qrcode-image {
      width: 172px;
      height: 172px;
      border-radius: 4px;
      border: 1px solid var(--vscode-panel-border);
      padding: 8px;
      background-color: #ffffff;
      opacity: 0;
      transition: opacity 0.3s ease;
      image-rendering: pixelated;
    }

    .qrcode-image.qrcode-visible {
      opacity: 1;
    }

    .qrcode-tip {
      margin-top: 14px;
      font-size: 14px;
      color: var(--vscode-foreground);
    }

    .qrcode-tip strong {
      color: var(--vscode-textLink-foreground);
    }

    .wechat-tip {
      margin-top: 10px;
      padding: 6px 14px;
      background-color: var(--vscode-editor-inactiveSelectionBackground);
      border-radius: 4px;
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
    }

    .status-bar {
      margin-top: 16px;
      padding: 10px 16px;
      background-color: var(--vscode-editor-inactiveSelectionBackground);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 13px;
      color: var(--vscode-descriptionForeground);
      transition: background-color 0.2s ease, border-color 0.2s ease;
    }

    .status-bar.waiting {
      border: 1px solid transparent;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--vscode-progressBar-background);
      animation: pulse 2s ease-in-out infinite;
      flex-shrink: 0;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .status-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px 0;
    }

    .status-icon {
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .status-icon svg {
      width: 40px;
      height: 40px;
    }

    .status-icon.success svg {
      color: var(--vscode-testing-iconPassed, #4caf50);
    }

    .status-icon.error svg {
      color: var(--vscode-testing-iconFailed, #f44336);
    }

    .status-icon.warning svg {
      color: var(--vscode-editorWarning-foreground, #ff9800);
    }

    .loading-spinner svg {
      animation: spin 1.2s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    .status-text {
      font-size: 16px;
      font-weight: 600;
      color: var(--vscode-editor-foreground);
      margin-bottom: 6px;
    }

    .status-text.success-text {
      color: var(--vscode-testing-iconPassed, #4caf50);
    }

    .status-desc {
      font-size: 13px;
      color: var(--vscode-descriptionForeground);
      max-width: 300px;
      text-align: center;
    }

    .error-reasons {
      list-style: none;
      padding: 0;
      margin: 10px 0 16px;
      text-align: left;
      width: 100%;
    }

    .error-reasons li {
      position: relative;
      padding: 5px 0 5px 18px;
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      line-height: 1.5;
    }

    .error-reasons li::before {
      content: "";
      position: absolute;
      left: 4px;
      top: 11px;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background-color: var(--vscode-testing-iconFailed, #f44336);
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 12px;
      width: 100%;
    }

    .action-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 2px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.15s ease;
      font-family: inherit;
    }

    .action-btn:active {
      opacity: 0.8;
    }

    .action-btn.primary {
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }

    .action-btn.primary:hover {
      background-color: var(--vscode-button-hoverBackground);
    }

    .action-btn.secondary {
      background-color: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }

    .action-btn.secondary:hover {
      background-color: var(--vscode-button-secondaryHoverBackground);
    }

    .footer {
      margin-top: 20px;
      padding-top: 14px;
      border-top: 1px solid var(--vscode-panel-border);
    }

    .footer p {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
    }

    .footer a {
      color: var(--vscode-textLink-foreground);
      text-decoration: none;
      cursor: pointer;
    }

    .footer a:hover {
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .container {
        padding: 20px 16px 18px;
      }

      .qrcode-image {
        width: 140px;
        height: 140px;
      }

      .header h1 {
        font-size: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
      </div>
      <h1>扫码登录知乎</h1>
      <p>使用知乎 App 扫码，自动获取登录凭据</p>
    </div>

    \${MAIN_CONTENT}

    <div class="footer">
      <p>
        也可以 <a onclick="manualSetCookie()">手动设置 Cookie</a>
        · 登录凭据仅存储在本地
      </p>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    function manualSetCookie() {
      vscode.postMessage({ command: 'setCookie' });
    }

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        vscode.postMessage({ command: 'close' });
      }
    });
  </script>

  \${STATUS_SCRIPT}
</body>
</html>
`;
