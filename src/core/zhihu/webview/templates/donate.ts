export const donateTemplate = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>☕ 请开发者喝杯咖啡~ ☕</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: var(--vscode-foreground);
      background: linear-gradient(135deg, var(--vscode-editor-background) 0%, var(--vscode-sideBar-background) 100%);
      padding: 20px;
      margin: 0;
      height: calc(100vh - 40px);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: auto;
    }

    .container {
      max-width: 450px;
      width: 90%;
      background: linear-gradient(135deg, var(--vscode-editor-background) 0%, var(--vscode-sideBar-background) 100%);
      border: 2px solid var(--vscode-focusBorder);
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
      overflow: hidden;
      animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes modalSlideIn {
      from { transform: translateY(-50px) scale(0.8); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    .header {
      padding: 16px 20px;
      background: linear-gradient(90deg, #ff6b6b, #ffa500);
      color: white;
      text-align: center;
    }

    .header h1 {
      margin: 0;
      color: white;
      font-size: 20px;
      font-weight: bold;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .body {
      padding: 24px 20px;
      text-align: center;
    }

    .donate-hero {
      margin-bottom: 20px;
    }

    .donate-emoji-rain {
      font-size: 28px;
      animation: float 3s ease-in-out infinite;
      margin-bottom: 15px;
      letter-spacing: 8px;
    }

    .donate-title {
      color: var(--vscode-foreground);
      font-size: 22px;
      font-weight: bold;
      margin: 10px 0;
      background: linear-gradient(90deg, #ff6b6b, #ffa500);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .donate-subtitle {
      color: var(--vscode-descriptionForeground);
      font-size: 16px;
      line-height: 1.5;
      margin: 0;
    }

    .donate-qr-container {
      margin: 20px 0;
    }

    .qr-wrapper {
      position: relative;
      display: inline-block;
    }

    .donate-qr-code {
      width: 180px;
      height: 180px;
      border-radius: 12px;
      border: 3px solid #ffa500;
      box-shadow: 0 8px 24px rgba(255, 165, 0, 0.3);
      transition: transform 0.3s;
    }

    .donate-qr-code:hover {
      transform: scale(1.05);
    }

    .qr-overlay {
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      background: #ff6b6b;
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      animation: pulse 2s infinite;
    }

    .donate-tip {
      color: var(--vscode-foreground);
      font-size: 16px;
      margin: 16px 0;
      font-weight: 500;
    }

    .social-section {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid var(--vscode-panel-border);
    }

    .social-text {
      color: var(--vscode-descriptionForeground);
      font-size: 14px;
      margin: 0 0 16px 0;
    }

    .github-star-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: linear-gradient(90deg, #333, #555);
      color: white;
      text-decoration: none;
      border-radius: 25px;
      font-weight: bold;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .github-star-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
      background: linear-gradient(90deg, #555, #777);
    }

    .star-icon {
      animation: pulse 1.5s infinite;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>☕ 请开发者喝杯咖啡~ ☕</h1>
    </div>
    
    <div class="body">
      <div class="donate-hero">
        <div class="donate-emoji-rain">😘✨🚀💎🎯</div>
        <h4 class="donate-title">用爱发电不易，期待您的支持</h4>
        <p class="donate-subtitle">☕ 请我喝杯咖啡吧~ ☕</p>
      </div>

      <div class="donate-qr-container">
        <div class="qr-wrapper">
          <img src="https://img2024.cnblogs.com/blog/3085939/202504/3085939-20250425153014632-145153684.jpg" alt="微信赞赏码" class="donate-qr-code">
          <div class="qr-overlay">
            <span class="scan-text">扫码赞赏</span>
          </div>
        </div>
        <p class="donate-tip">💫 微信扫一扫，您的支持是我开发的最大动力！ 💫</p>

        <div class="social-section">
          <p class="social-text">给个Star也是大大的支持！</p>
          <a href="https://github.com/crispyChicken999/zhihu-fisher-vscode" onclick="openGitHub()" class="github-star-btn">
            <span class="star-icon">⭐</span>
            <span>GitHub上点个Star</span>
            <span class="star-icon">⭐</span>
          </a>
        </div>
      </div>
    </div>
  </div>

  <script>
    function openGitHub() {
      // 通知VS Code扩展打开GitHub链接
      window.postMessage({ command: 'openGitHub' }, '*');
    }
    
    // 监听来自VS Code的消息
    window.addEventListener('message', event => {
      const message = event.data;
      switch (message.command) {
        case 'openGitHub':
          // 这里由VS Code扩展处理实际的链接打开
          break;
      }
    });
  </script>
</body>
</html>
`;
