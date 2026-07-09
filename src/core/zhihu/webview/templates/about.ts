/**
 * 关于页模板
 * @param version 扩展版本号（自动从 package.json 读取）
 */
export function aboutTemplate(version: string = "") {
  const versionDisplay = version ? `v${version}` : "";
  return `
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
        max-width: 640px;
        margin: 0 auto;
      }
      h1 {
        color: var(--vscode-textLink-foreground);
        text-align: center;
        margin-bottom: 30px;
        font-size: 28px;
      }
      .section {
        margin-bottom: 24px;
        padding: 20px 24px;
        border: 1px solid var(--vscode-panel-border);
        border-radius: 10px;
        background-color: var(--vscode-editor-background);
        transition: border-color 0.2s;
      }
      .section:hover {
        border-color: var(--vscode-textLink-foreground);
      }
      .section h2 {
        color: var(--vscode-textLink-foreground);
        margin-top: 0;
        margin-bottom: 16px;
        font-size: 18px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .section h3 {
        font-size: 15px;
        margin: 16px 0 10px;
        color: var(--vscode-foreground);
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .feature-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .feature-list li {
        margin: 6px 0;
        padding: 8px 10px;
        border-radius: 6px;
        display: flex;
        align-items: flex-start;
        gap: 10px;
        transition: background-color 0.15s;
      }
      .feature-list li:hover {
        background-color: var(--vscode-list-hoverBackground);
      }
      .feature-list li .feat-icon {
        flex-shrink: 0;
        width: 22px;
        text-align: center;
        font-size: 16px;
      }
      .feature-list li .feat-content {
        flex: 1;
      }
      .feature-list li .feat-title {
        font-weight: 600;
        font-size: 14px;
      }
      .feature-list li .feat-desc {
        font-size: 13px;
        color: var(--vscode-descriptionForeground);
        margin-top: 2px;
      }
      .badge-group {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;
      }
      .badge {
        display: inline-block;
        background-color: var(--vscode-badge-background);
        color: var(--vscode-badge-foreground);
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
      }
      .tech-stack {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;
      }
      .tech-tag {
        background-color: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        transition: opacity 0.15s;
      }
      .tech-tag:hover {
        opacity: 0.85;
      }
      .tech-cat {
        font-size: 12px;
        color: var(--vscode-descriptionForeground);
        margin-top: 4px;
        margin-bottom: 6px;
      }
      .donate-section {
        text-align: center;
        padding: 28px 24px;
      }
      .donate-qr {
        max-width: 180px;
        height: auto;
        border-radius: 8px;
        border: 1px solid var(--vscode-panel-border);
        margin: 16px 0;
      }
      .link {
        color: var(--vscode-textLink-foreground);
        text-decoration: none;
      }
      .link:hover {
        text-decoration: underline;
      }
      .version-badge {
        text-align: center;
        margin-bottom: 24px;
      }
      .version-badge span {
        background-color: var(--vscode-textLink-foreground);
        color: var(--vscode-editor-background);
        padding: 4px 16px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
      }
      .divider {
        height: 1px;
        background-color: var(--vscode-panel-border);
        margin: 18px 0;
      }
      .stat-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 10px;
        margin-top: 12px;
      }
      .stat-item {
        text-align: center;
        padding: 12px 8px;
        border-radius: 8px;
        background-color: var(--vscode-list-hoverBackground);
      }
      .stat-item .stat-num {
        font-size: 20px;
        font-weight: 700;
        color: var(--vscode-textLink-foreground);
      }
      .stat-item .stat-label {
        font-size: 12px;
        color: var(--vscode-descriptionForeground);
        margin-top: 2px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>🐟 知乎摸鱼</h1>
      <div class="version-badge">
        <span>${versionDisplay}</span>
      </div>

      <!-- 插件介绍 -->
      <div class="section">
        <h2>📖 插件介绍</h2>
        <p>知乎摸鱼是一个功能强大的 VS Code 扩展，让您无需离开编辑器即可畅览知乎全站内容。从热榜、推荐、关注动态到搜索、收藏夹管理，从沉浸式阅读到智能防被发现系统 — 我们致力于打造 IDE 中最舒适的知乎浏览体验。</p>
        <p>无论您是上班摸鱼、课间休息，还是单纯想在编码之余看看新鲜事，知乎摸鱼都能让您<strong>优雅地</strong>划水 😎</p>
        <div class="stat-grid">
          <div class="stat-item">
            <div class="stat-num">5+</div>
            <div class="stat-label">内容栏目</div>
          </div>
          <div class="stat-item">
            <div class="stat-num">32</div>
            <div class="stat-label">伪装语言类型</div>
          </div>
          <div class="stat-item">
            <div class="stat-num">20+</div>
            <div class="stat-label">快捷键</div>
          </div>
          <div class="stat-item">
            <div class="stat-num">5</div>
            <div class="stat-label">设置面板Tab</div>
          </div>
        </div>
      </div>

      <!-- 内容浏览 -->
      <div class="section">
        <h2>🔍 内容浏览</h2>
        <ul class="feature-list">
          <li>
            <span class="feat-icon">🔥</span>
            <div class="feat-content">
              <div class="feat-title">热榜</div>
              <div class="feat-desc">实时获取知乎全站热榜，掌握当下最热门话题</div>
            </div>
          </li>
          <li>
            <span class="feat-icon">⭐</span>
            <div class="feat-content">
              <div class="feat-title">个性推荐</div>
              <div class="feat-desc">基于您的兴趣推荐精彩内容，支持「不喜欢」和「屏蔽作者」来优化推荐</div>
            </div>
          </li>
          <li>
            <span class="feat-icon">👥</span>
            <div class="feat-content">
              <div class="feat-title">关注动态</div>
              <div class="feat-desc">查看关注人的创作和互动动态，支持过滤「赞同了」类型的内容</div>
            </div>
          </li>
          <li>
            <span class="feat-icon">🔎</span>
            <div class="feat-content">
              <div class="feat-title">智能搜索</div>
              <div class="feat-desc">快速搜索知乎全站的话题、文章和用户</div>
            </div>
          </li>
          <li>
            <span class="feat-icon">📑</span>
            <div class="feat-content">
              <div class="feat-title">收藏夹管理</div>
              <div class="feat-desc">完整支持浏览、收藏、取消收藏、创建、删除收藏夹，管理我创建的和关注的收藏夹</div>
            </div>
          </li>
          <li>
            <span class="feat-icon">🔗</span>
            <div class="feat-content">
              <div class="feat-title">浏览指定链接</div>
              <div class="feat-desc">直接输入知乎 URL（文章、问题、想法）即可在 WebView 中打开阅读</div>
            </div>
          </li>
        </ul>
      </div>

      <!-- 阅读体验 -->
      <div class="section">
        <h2>📱 阅读体验</h2>
        <ul class="feature-list">
          <li>
            <span class="feat-icon">🎯</span>
            <div class="feat-content">
              <div class="feat-title">沉浸模式</div>
              <div class="feat-desc">一键切换沉浸式阅读，隐藏工具栏，内容区域最大化，专注阅读不受干扰</div>
            </div>
          </li>
          <li>
            <span class="feat-icon">🔄</span>
            <div class="feat-content">
              <div class="feat-title">回答排序</div>
              <div class="feat-desc">支持默认排序和时间排序（由新到旧），根据需求灵活切换</div>
            </div>
          </li>
          <li>
            <span class="feat-icon">🧭</span>
            <div class="feat-content">
              <div class="feat-title">便捷导航</div>
              <div class="feat-desc">上/下一个回答、上/下一篇内容快捷切换，页码跳转选择器，已加载/总数实时显示</div>
            </div>
          </li>
          <li>
            <span class="feat-icon">💬</span>
            <div class="feat-content">
              <div class="feat-title">评论查看</div>
              <div class="feat-desc">加载并浏览回答的评论区，了解更多观点和讨论</div>
            </div>
          </li>
          <li>
            <span class="feat-icon">🔢</span>
            <div class="feat-content">
              <div class="feat-title">回答预加载</div>
              <div class="feat-desc">可自定义每批预加载的回答数量（5-50个），平衡加载速度和浏览体验</div>
            </div>
          </li>
          <li>
            <span class="feat-icon">📊</span>
            <div class="feat-content">
              <div class="feat-title">回答内容过滤</div>
              <div class="feat-desc">根据是否点击过赞来过滤回答（全部展示/仅展示未读），快速找到新鲜内容</div>
            </div>
          </li>
          <li>
            <span class="feat-icon">🧠</span>
            <div class="feat-content">
              <div class="feat-title">知乎直答 AI 集成</div>
              <div class="feat-desc">通过模拟点击知乎内置 AI 功能，在文章内直接获取 AI 对内容的总结和解释</div>
            </div>
          </li>
          <li>
            <span class="feat-icon">📥</span>
            <div class="feat-content">
              <div class="feat-title">导出 Markdown</div>
              <div class="feat-desc">将文章内容导出为 Markdown 文件，方便保存、分享或供 AI 工具分析总结</div>
            </div>
          </li>
        </ul>
      </div>

      <!-- 设置面板 -->
      <div class="section">
        <h2>🎨 全方位自定义设置</h2>
        <p style="font-size:13px;color:var(--vscode-descriptionForeground);margin-bottom:12px;">5 大设置面板，随心所欲定制您的阅读体验</p>
        <ul class="feature-list">
          <li>
            <span class="feat-icon">🔤</span>
            <div class="feat-content">
              <div class="feat-title">文本样式</div>
              <div class="feat-desc">字体大小、行高、最大宽度、字体族、字体颜色（含取色器+预设色）、透明度、对齐方式</div>
            </div>
          </li>
          <li>
            <span class="feat-icon">🖼️</span>
            <div class="feat-content">
              <div class="feat-title">多媒体控制</div>
              <div class="feat-desc">3 种图片/视频显示模式：正常显示、迷你模式（可调缩放比例 1-100%）、全部隐藏</div>
            </div>
          </li>
          <li>
            <span class="feat-icon">🚀</span>
            <div class="feat-content">
              <div class="feat-title">功能增强</div>
              <div class="feat-desc">灰色模式（防刺眼+更隐蔽）、智能伪装、侧边栏伪装、关注列表过滤、回答内容过滤</div>
            </div>
          </li>
          <li>
            <span class="feat-icon">🧩</span>
            <div class="feat-content">
              <div class="feat-title">工具栏自定义</div>
              <div class="feat-desc">自定义显示哪些按钮（作者信息、收藏、复制、导出等）及其排列顺序，甚至可拖拽调整</div>
            </div>
          </li>
          <li>
            <span class="feat-icon">⌨️</span>
            <div class="feat-content">
              <div class="feat-title">快捷键自定义</div>
              <div class="feat-desc">为每个功能按钮绑定自定义快捷键，支持 Ctrl/Alt/Shift 组合键</div>
            </div>
          </li>
        </ul>
      </div>

      <!-- 智能伪装 -->
      <div class="section">
        <h2>🎭 智能伪装系统</h2>
        <p style="font-size:13px;color:var(--vscode-descriptionForeground);margin-bottom:12px;">工作时间摸鱼的终极解决方案，从细节到整体全方位伪装</p>
        <ul class="feature-list">
          <li>
            <span class="feat-icon">🔄</span>
            <div class="feat-content">
              <div class="feat-title">详情页伪装</div>
              <div class="feat-desc">WebView 失去焦点时自动将标题、图标和整个文章界面伪装成真实代码编辑界面，获焦后自动恢复</div>
            </div>
          </li>
          <li>
            <span class="feat-icon">📁</span>
            <div class="feat-content">
              <div class="feat-title">侧边栏伪装</div>
              <div class="feat-desc">将知乎列表侧边栏伪装成项目文件结构，配合详情页伪装实现完整效果</div>
            </div>
          </li>
          <li>
            <span class="feat-icon">💻</span>
            <div class="feat-content">
              <div class="feat-title">32 种编程语言</div>
              <div class="feat-desc">支持 JS、TS、Python、Java、C++、Rust、Go、Vue、React 等 32 种语言的动态代码生成，语法高亮完美呈现</div>
            </div>
          </li>
          <li>
            <span class="feat-icon">🎯</span>
            <div class="feat-content">
              <div class="feat-title">自定义伪装类型</div>
              <div class="feat-desc">可根据您的职业选择偏好的伪装文件类型（如前端选 JS/HTML/CSS），未选择则全类型随机</div>
            </div>
          </li>
          <li>
            <span class="feat-icon">⚡</span>
            <div class="feat-content">
              <div class="feat-title">缓存状态查看</div>
              <div class="feat-desc">可随时查看伪装功能的启用状态、缓存数量和活跃 WebView</div>
            </div>
          </li>
        </ul>
      </div>

      <!-- 快捷键 -->
      <div class="section">
        <h2>⌨️ 快捷键一览</h2>
        <p style="font-size:13px;color:var(--vscode-descriptionForeground);margin-bottom:10px;">高效操作，触手可及 — 所有快捷键均支持在设置面板中自定义</p>
        <div class="badge-group">
          <span class="badge">A / D ← → 上下回答</span>
          <span class="badge">W / S 上下内容</span>
          <span class="badge">Ctrl+↑↓ 上下内容</span>
          <span class="badge">X 沉浸模式</span>
          <span class="badge">. 设置面板</span>
          <span class="badge">, 查看评论</span>
          <span class="badge">Space 代码伪装</span>
          <span class="badge">G 灰色模式</span>
          <span class="badge">/ 切换媒体</span>
          <span class="badge">F 收藏</span>
          <span class="badge">B 浏览器打开</span>
          <span class="badge">C 复制链接</span>
          <span class="badge">V 回到顶部</span>
          <span class="badge">T 切换工具栏</span>
        </div>
      </div>

      <!-- 浏览器配置 -->
      <div class="section">
        <h2>⚙️ 浏览器与调试</h2>
        <ul class="feature-list">
          <li>
            <span class="feat-icon">🌐</span>
            <div class="feat-content">
              <div class="feat-title">浏览器管理</div>
              <div class="feat-desc">支持自动安装 Puppeteer 内置浏览器，也支持自定义本机 Chrome 路径</div>
            </div>
          </li>
          <li>
            <span class="feat-icon">🐛</span>
            <div class="feat-content">
              <div class="feat-title">调试模式</div>
              <div class="feat-desc">开启后浏览器以可见模式运行，方便观察加载过程和排查问题</div>
            </div>
          </li>
          <li>
            <span class="feat-icon">🛠️</span>
            <div class="feat-content">
              <div class="feat-title">故障排除</div>
              <div class="feat-desc">内置故障排除指引，覆盖 Cookie 失效、网络问题、浏览器配置等常见场景</div>
            </div>
          </li>
          <li>
            <span class="feat-icon">🔄</span>
            <div class="feat-content">
              <div class="feat-title">一键重启</div>
              <div class="feat-desc">遇到异常状态时可快速重启扩展，无需重新加载 VS Code 窗口</div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Cookie 隐私 -->
      <div class="section">
        <h2>🍪 Cookie 隐私保护</h2>
        <p><strong>我们非常重视您的隐私和数据安全。所有操作均在本地执行，代码开源，欢迎审查。</strong></p>
        <ul class="feature-list">
          <li>
            <span class="feat-icon">🏠</span>
            <div class="feat-content">
              <div class="feat-title">本地存储</div>
              <div class="feat-desc">Cookie 仅存储在 VS Code 本地配置中，不会离开您的电脑</div>
            </div>
          </li>
          <li>
            <span class="feat-icon">🚫</span>
            <div class="feat-content">
              <div class="feat-title">不上传不分享</div>
              <div class="feat-desc">插件绝不收集、上传或分享您的 Cookie 给任何第三方</div>
            </div>
          </li>
          <li>
            <span class="feat-icon">🎯</span>
            <div class="feat-content">
              <div class="feat-title">用途单一</div>
              <div class="feat-desc">Cookie 仅用于在浏览器中访问知乎内容展示，无任何其他用途</div>
            </div>
          </li>
          <li>
            <span class="feat-icon">🛡️</span>
            <div class="feat-content">
              <div class="feat-title">完全可控</div>
              <div class="feat-desc">您可随时设置、更新或清除 Cookie，一切尽在掌控之中</div>
            </div>
          </li>
        </ul>
        <p style="color: var(--vscode-descriptionForeground); font-style: italic; font-size: 13px; margin-top: 12px;">
          简而言之：您的 Cookie 始终在您的控制之下，我们绝不会做任何损害您隐私的操作。
        </p>
      </div>

      <!-- 技术架构 -->
      <div class="section">
        <h2>⚡ 技术架构</h2>
        <p style="font-size:13px;color:var(--vscode-descriptionForeground);">本插件基于以下技术栈构建：</p>
        <div class="tech-cat">核心语言与框架</div>
        <div class="tech-stack">
          <span class="tech-tag">TypeScript</span>
          <span class="tech-tag">VS Code API</span>
          <span class="tech-tag">WebView</span>
          <span class="tech-tag">Node.js</span>
          <span class="tech-tag">ESBuild</span>
        </div>
        <div class="tech-cat">数据抓取与渲染</div>
        <div class="tech-stack">
          <span class="tech-tag">Puppeteer</span>
          <span class="tech-tag">Cheerio</span>
          <span class="tech-tag">Marked</span>
        </div>
        <div class="tech-cat">构建与质量</div>
        <div class="tech-stack">
          <span class="tech-tag">ESLint</span>
          <span class="tech-tag">pnpm</span>
        </div>
      </div>

      <!-- 相关链接 -->
      <div class="section">
        <h2>🔗 相关链接</h2>
        <p style="font-size:14px;line-height:2;">
          • GitHub 仓库：<a href="https://github.com/crispyChicken999/zhihu-fisher-vscode" class="link">crispyChicken999/zhihu-fisher-vscode</a><br>
          • 问题反馈：<a href="https://github.com/crispyChicken999/zhihu-fisher-vscode/issues" class="link">GitHub Issues</a><br>
          • 更新日志：<a href="https://github.com/crispyChicken999/zhihu-fisher-vscode/blob/master/CHANGELOG.md" class="link">CHANGELOG</a><br>
          • 开发者：CrispyChicken<br>
          • 版本：${versionDisplay}
        </p>
      </div>

      <!-- 支持开发者 -->
      <div class="section donate-section">
        <h2>☕ 支持开发者</h2>
        <p>如果这个插件对您有帮助，欢迎请开发者喝杯咖啡，您的支持是我持续开发的动力！❤️</p>
        <img src="https://img2024.cnblogs.com/blog/3085939/202504/3085939-20250425153014632-145153684.jpg" alt="微信赞赏码" class="donate-qr">
        <p style="color: var(--vscode-descriptionForeground); font-size: 13px;">微信扫码打开赞赏</p>
        <p style="font-size:13px;color:var(--vscode-descriptionForeground);margin-top:16px;">
          同时也欢迎在 <a href="https://github.com/crispyChicken999/zhihu-fisher-vscode" class="link">GitHub</a> 上点颗 ⭐️，或提交 <a href="https://github.com/crispyChicken999/zhihu-fisher-vscode/issues" class="link">Issue/PR</a> 来帮助改进插件！
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
}
