/**
 * 错误页面的HTML模板
 */
export const errorTemplate = `
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

    .error-container {
      height: fit-content;
      max-height: 90vh;
      justify-content: center;
      overflow: auto;
      scroll-behavior: smooth;
      padding-right: 20px;
      width: 100%;
      text-align: center;
    }

    .error-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 30px;
      border-radius: 50%;
      background-color: var(--vscode-errorForeground);
      display: flex;
      justify-content: center;
      font-size: 36px;
      font-size: 42px;
      line-height: 69px;
      color: var(--vscode-editor-background);
    }

    .error-title {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 20px;
      color: var(--vscode-errorForeground);
    }

    .error-description {
      font-size: 16px;
      margin-bottom: 30px;
      color: var(--vscode-descriptionForeground);
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .error-reason {
      background-color: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
      text-align: left;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .error-reason h4 {
      margin-top: 0;
      margin-bottom: 15px;
      color: var(--vscode-foreground);
      font-size: 16px;
      font-weight: 600;
    }

    .error-reason ul {
      margin: 0;
      padding-left: 20px;
    }

    .error-reason li {
      margin-bottom: 8px;
      color: var(--vscode-descriptionForeground);
    }

    .error-actions {
      display: flex;
      gap: 15px;
      align-items: center;
      margin-top: 30px;
      justify-content: center;
    }

    .action-button {
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s ease;
      text-decoration: none;
      display: inline-block;
    }

    .action-button:hover {
      background-color: var(--vscode-button-hoverBackground);
    }

    .action-button.secondary {
      background-color: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }

    .action-button.secondary:hover {
      background-color: var(--vscode-button-secondaryHoverBackground);
    }

    .url-info {
      background-color: var(--vscode-textBlockQuote-background);
      border-left: 4px solid var(--vscode-textBlockQuote-border);
      padding: 15px;
      margin: 20px 0;
      border-radius: 0 4px 4px 0;
      font-family: monospace;
      font-size: 14px;
      word-break: break-all;
      color: var(--vscode-descriptionForeground);
    }

    .footer-note {
      margin-top: 40px;
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      text-align: center;
    }

    /* 响应式设计 */
    @media (max-width: 600px) {
      body {
        padding: 10px;
      }

      .error-container {
        padding-right: 10px;
      }

      .error-title {
        font-size: 20px;
      }

      .error-reason {
        padding: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="error-container">
    <div class="error-icon">
      ⚠️
    </div>

    <h1 class="error-title">\${ERROR_TITLE}</h1>

    <div class="error-description">
      \${ERROR_DESCRIPTION}
    </div>

    <div class="url-info">
      当前URL: \${SOURCE_URL}
    </div>

    <div class="error-reason">
      <h4>💡 可能的原因：</h4>
      <ul>
        \${ERROR_REASONS}
      </ul>
    </div>

    <div class="error-actions">
      \${ERROR_ACTIONS}
    </div>

    <div class="footer-note">
      如果问题持续存在，请检查网络连接或稍后重试
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    // 在外部浏览器中打开链接
    function openInBrowser(url) {
      vscode.postMessage({
        command: 'openInBrowser',
        url: url
      });
    }

    // 重新加载页面
    function reloadPage() {
      vscode.postMessage({
        command: 'reloadPage'
      });
    }

    // 设置Cookie
    function setCookie() {
      vscode.postMessage({
        command: 'setCookie'
      });
    }
  </script>
</body>
</html>
`;
