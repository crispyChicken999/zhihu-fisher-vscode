export const aboutTemplate = `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>关于知乎摸鱼</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: var(--vscode-foreground);
        background-color: var(--vscode-editor-background);
        padding: 20px;
        margin: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
      }
      h1 {
        color: var(--vscode-textLink-foreground);
        text-align: center;
        margin-bottom: 30px;
      }
      .section {
        margin-bottom: 30px;
        padding: 20px;
        border: 1px solid var(--vscode-panel-border);
        border-radius: 8px;
        background-color: var(--vscode-editor-background);
      }
      .section h2 {
        color: var(--vscode-textLink-foreground);
        margin-top: 0;
      }
      .feature-list {
        list-style: none;
        padding: 0;
      }
      .feature-list li {
        margin: 10px 0;
        padding: 8px 0;
        border-bottom: 1px solid var(--vscode-panel-border);
      }
      .feature-list li:last-child {
        border-bottom: none;
      }
      .donate-section {
        text-align: center;
        padding: 30px 20px;
      }
      .donate-qr {
        max-width: 200px;
        height: auto;
        border-radius: 8px;
        border: 1px solid var(--vscode-panel-border);
        margin: 20px 0;
      }
      .tech-stack {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 15px;
      }
      .tech-tag {
        background-color: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
      }
      .link {
        color: var(--vscode-textLink-foreground);
        text-decoration: none;
      }
      .link:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>🐟 知乎摸鱼 🐟</h1>

      <div class="section">
        <h2>📖 插件介绍</h2>
        <p>知乎摸鱼是一个强大的 Visual Studio Code 扩展，让您可以直接在编辑器中浏览知乎内容，支持热榜、推荐、搜索等功能。</p>
        <p>无需切换浏览器，随时随地享受知乎的精彩内容，让您的编程时光更加充实有趣！</p>
      </div>

      <div class="section">
        <h2>✨ 主要功能</h2>
        <ul class="feature-list">
          <li>🔥 <strong>热榜浏览</strong> - 实时获取知乎热榜内容</li>
          <li>⭐ <strong>个性推荐</strong> - 基于您的兴趣推荐精彩内容</li>
          <li>🔍 <strong>智能搜索</strong> - 快速搜索感兴趣的话题</li>
          <li>📱 <strong>沉浸阅读</strong> - 专注的阅读体验，支持多种显示模式</li>
          <li>🎨 <strong>个性化设置</strong> - 自定义字体、颜色、图片显示等</li>
          <li>⌨️ <strong>快捷键支持</strong> - 丰富的键盘快捷键操作</li>
          <li>💬 <strong>评论互动</strong> - 查看评论，了解更多观点</li>
          <li>🚀 <strong>高性能</strong> - 基于现代Web技术，流畅体验</li>
        </ul>
      </div>

      <div class="section">
        <h2>🛠️ 技术架构</h2>
        <p>本插件基于以下技术栈构建：</p>
        <div class="tech-stack">
          <span class="tech-tag">TypeScript</span>
          <span class="tech-tag">VS Code API</span>
          <span class="tech-tag">Puppeteer</span>
          <span class="tech-tag">Cheerio</span>
          <span class="tech-tag">Marked</span>
          <span class="tech-tag">WebView</span>
          <span class="tech-tag">Node.js</span>
        </div>
      </div>

      <div class="section">
        <h2>� Cookie 隐私保护</h2>
        <p><strong>我们非常重视您的隐私和数据安全：</strong></p>
        <ul class="feature-list">
          <li>🏠 <strong>本地存储</strong> - Cookie仅存储在本地VS Code配置中</li>
          <li>🚫 <strong>不会上传</strong> - 我们绝不收集、上传或分享您的Cookie</li>
          <li>🎯 <strong>用途限制</strong> - Cookie仅用于访问知乎内容，无其他用途</li>
          <li>🛡️ <strong>完全控制</strong> - 您可随时清除或更新Cookie设置</li>
        </ul>
        <p style="color: var(--vscode-descriptionForeground); font-style: italic;">
          简而言之：您的Cookie始终在您的控制之下，我们绝不会做任何损害您隐私的操作。
        </p>
      </div>

      <div class="section">
        <h2>🔗 相关链接</h2>
        <p>
          • GitHub: <a href="https://github.com/crispyChicken999/zhihu-fisher-vscode" class="link">crispyChicken999/zhihu-fisher-vscode</a><br>
          • 问题反馈: <a href="https://github.com/crispyChicken999/zhihu-fisher-vscode/issues" class="link">GitHub Issues</a><br>
          • 开发者: CrispyChicken
        </p>
      </div>

      <div class="section donate-section">
        <h2>☕ 支持开发者</h2>
        <p>如果这个插件对您有帮助，欢迎请开发者喝杯咖啡！</p>
        <img src="https://img2024.cnblogs.com/blog/3085939/202504/3085939-20250425153014632-145153684.jpg" alt="微信赞赏码" class="donate-qr">
        <p style="color: var(--vscode-descriptionForeground); font-size: 14px;">微信扫码打开</p>
        <p>您的支持是我持续开发的动力！感谢 💖</p>
      </div>
    </div>
  </body>
  </html>
`;
