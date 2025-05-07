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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe WPC', 'Segoe UI', system-ui, 'Ubuntu', 'Droid Sans', sans-serif;
      padding: 10px;
      line-height: 1.6;
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 95vh;
      justify-content: center;
      min-height: 500px;
      overflow: auto;
    }
    .loading-spinner {
      flex: 0 0 auto;
      width: 50px;
      height: 50px;
      border: 5px solid rgba(0, 0, 0, 0.1);
      border-top-color: var(--vscode-button-background);
      border-radius: 50%;
      animation: spin 1s ease-in-out infinite;
      margin-bottom: 20px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    h1, h2 {
      color: var(--vscode-editor-foreground);
    }
    .button {
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 8px 16px;
      border-radius: 2px;
      cursor: pointer;
      margin-top: 20px;
    }
    .button:hover {
      background-color: var(--vscode-button-hoverBackground);
    }
    .cookie-warning {
      display: none;
      margin-top: 20px;
      padding: 15px;
      background-color: var(--vscode-inputValidation-warningBackground);
      color: var(--vscode-inputValidation-warningForeground);
      border: 1px solid var(--vscode-inputValidation-warningBorder);
      border-radius: 3px;
      text-align: center;
      max-width: 500px;
    }
  </style>
</head>
<body>
  <div class="loading-container">
    <div class="loading-spinner"></div>
    <h2>正在加载文章内容...</h2>
    <h3 style="text-align:center;max-width:600px;">\${TITLE}</h3>
    <div style="border: 1px solid var(--vscode-panel-border); width:60%; max-width:600px; margin: 10px 30px;"></div>
    <p style="text-align:center;max-width:600px;max-height:300px;overflow:auto;">\${EXCERPT}</p>
    <button class="button" onclick="openInBrowser()">在浏览器中打开</button>

    <div id="cookieWarning" class="cookie-warning">
      <p><strong>提示：</strong>内容加载时间过长，可能是知乎Cookie已失效。</p>
      <p>请尝试更新您的Cookie信息后重新打开页面。</p>
      <button class="button" onclick="updateCookie()">更新Cookie</button>
    </div>
  </div>
  <script>
    const vscode = acquireVsCodeApi();

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