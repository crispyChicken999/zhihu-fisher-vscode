export const donateTemplate = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>☕ 请开发者喝杯咖啡~ ☕</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      padding: 0;
      margin: 0;
      height: 100vh;
      width: 100vw;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
    }

    /* ===== Floating Emoji Layer ===== */
    .emoji-bg {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
      transform: translateZ(0);
      will-change: transform;
    }

    .floating-emoji {
      position: absolute;
      opacity: 0;
      animation: emojiFloat var(--dur) ease-in-out var(--delay) infinite;
      font-size: var(--size);
      will-change: transform, opacity;
      filter: blur(0);
      transition: filter 0.3s;
    }

    @keyframes emojiFloat {
      0% {
        opacity: 0;
        transform: translateY(110vh) translateX(0) rotate(0deg) scale(0.5);
      }
      10% {
        opacity: var(--max-opacity, 0.6);
      }
      85% {
        opacity: var(--max-opacity, 0.6);
      }
      100% {
        opacity: 0;
        transform: translateY(-10vh) translateX(var(--drift, 40px)) rotate(var(--spin, 360deg)) scale(1.2);
      }
    }

    /* ===== VS Code Panel Container (3D Tilt) ===== */
    .container-wrapper {
      position: relative;
      z-index: 1;
      perspective: 1200px;
      animation: containerIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes containerIn {
      from {
        opacity: 0;
        transform: translateY(30px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .container {
      position: relative;
      width: 450px;
      margin: 0 auto;
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 12px;
      box-shadow:
        0 16px 48px rgba(0, 0, 0, 0.35),
        0 4px 12px rgba(0, 0, 0, 0.2);
      overflow: hidden;
      transform-style: preserve-3d;
      transition: transform 0.1s ease-out, box-shadow 0.3s;
      will-change: transform;
      cursor: default;
    }

    /* Spotlight overlay that follows mouse */
    .container::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 1;
      border-radius: 12px;
      background: radial-gradient(
        800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
        rgba(255, 165, 0, 0.06) 0%,
        rgba(255, 107, 107, 0.03) 30%,
        transparent 60%
      );
      pointer-events: none;
      transition: background 0.15s ease-out;
    }

    /* Second subtle spotlight layer for depth */
    .container::after {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 0;
      border-radius: 12px;
      background: radial-gradient(
        400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
        rgba(255, 255, 255, 0.03) 0%,
        transparent 50%
      );
      pointer-events: none;
      transition: background 0.15s ease-out;
    }

    /* Content layer sits above ::before/::after */
    .container-content {
      position: relative;
      z-index: 3;
      transform: translateZ(20px);
    }

    /* ===== VS Code Title Bar ===== */
    .title-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: var(--vscode-titleBar-activeBackground, var(--vscode-editor-background));
      border-bottom: 1px solid var(--vscode-panel-border);
      user-select: none;
      cursor: default;
    }

    .title-bar-dots {
      display: flex;
      gap: 8px;
    }

    .title-bar-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      flex-shrink: 0;
      transition: opacity 0.2s;
    }

    .title-bar-dot:hover {
      opacity: 0.8;
    }

    .title-bar-dot.red { background: #ff5f57; }
    .title-bar-dot.yellow { background: #ffbd2e; }
    .title-bar-dot.green { background: #28c840; }

    .title-bar-text {
      flex: 1;
      font-size: 13px;
      font-weight: 500;
      color: var(--vscode-titleBar-activeForeground, var(--vscode-foreground));
      text-align: center;
      opacity: 0.85;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .title-bar-icon {
      font-size: 16px;
      flex-shrink: 0;
    }

    /* ===== Body Content ===== */
    .body {
      padding: 28px 24px 24px;
      text-align: center;
    }

    /* ---- Hero Section ---- */
    .hero {
      margin-bottom: 20px;
    }

    .hero-emoji-row {
      font-size: 32px;
      letter-spacing: 10px;
      margin-bottom: 12px;
      display: flex;
      justify-content: center;
      gap: 4px;
    }

    .hero-emoji-row span {
      display: inline-block;
      animation: heroBounce 2s ease-in-out infinite;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
    }

    @keyframes heroBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    .hero-emoji-row span:nth-child(2) { animation-delay: 0.15s; }
    .hero-emoji-row span:nth-child(3) { animation-delay: 0.3s; }
    .hero-emoji-row span:nth-child(4) { animation-delay: 0.45s; }
    .hero-emoji-row span:nth-child(5) { animation-delay: 0.6s; }

    .hero-title {
      font-size: 22px;
      font-weight: 700;
      margin: 8px 0;
      background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 50%, #ff6b6b 100%);
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: gradientShift 3s ease-in-out infinite;
    }

    @keyframes gradientShift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    .hero-subtitle {
      font-size: 15px;
      color: var(--vscode-descriptionForeground);
      line-height: 1.6;
      margin: 4px 0 0;
    }

    .hero-subtitle .highlight {
      background: linear-gradient(90deg, #ff6b6b, #ffa500);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 600;
    }

    /* ---- Stats Row ---- */
    .stats-row {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin: 16px 0 16px;
      padding: 12px 16px;
      background: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border, transparent);
      border-radius: 10px;
    }

    .stat-item {
      text-align: center;
      flex: 1;
    }

    .stat-number {
      font-size: 22px;
      font-weight: 700;
      color: #ffa500;
      margin-bottom: 2px;
    }

    .stat-label {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.8;
    }

    /* ---- QR Code Section ---- */
    .qr-section {
      margin: 16px 0;
    }

    .qr-wrapper {
      position: relative;
      display: inline-block;
      cursor: pointer;
    }

    .qr-wrapper::before {
      content: '';
      position: absolute;
      inset: -4px;
      border-radius: 16px;
      background: linear-gradient(135deg, #ff6b6b, #ffa500, #ff6b6b);
      background-size: 200% 200%;
      animation: qrBorderGlow 3s ease-in-out infinite;
      z-index: -1;
      opacity: 0.6;
    }

    @keyframes qrBorderGlow {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    .donate-qr-code {
      width: 180px;
      height: 180px;
      border-radius: 12px;
      display: block;
      background: white;
      transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s;
      box-shadow: 0 8px 24px rgba(255, 165, 0, 0.25);
    }

    .donate-qr-code:hover {
      transform: scale(1.06) translateZ(10px);
      box-shadow: 0 12px 36px rgba(255, 165, 0, 0.4);
    }

    .qr-badge {
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #ff6b6b, #ffa500);
      color: white;
      padding: 5px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.5px;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
      animation: badgePulse 2s ease-in-out infinite;
    }

    @keyframes badgePulse {
      0%, 100% { transform: translateX(-50%) scale(1); box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4); }
      50% { transform: translateX(-50%) scale(1.04); box-shadow: 0 6px 20px rgba(255, 107, 107, 0.55); }
    }

    .qr-tip {
      margin-top: 18px;
      font-size: 15px;
      font-weight: 500;
      color: var(--vscode-foreground);
    }

    .qr-tip .emoji-small {
      display: inline-block;
      animation: tipSparkle 1.5s ease-in-out infinite;
    }

    @keyframes tipSparkle {
      0%, 100% { transform: scale(1) rotate(0deg); }
      50% { transform: scale(1.2) rotate(10deg); }
    }

    /* ---- Divider ---- */
    .divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 20px 0;
      color: var(--vscode-panel-border);
    }

    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--vscode-panel-border);
    }

    .divider-text {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      opacity: 0.6;
      white-space: nowrap;
    }

    /* ---- GitHub Button ---- */
    .social-section {
      text-align: center;
    }

    .social-text {
      font-size: 14px;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 14px;
    }

    .github-star-btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 12px 28px;
      background: linear-gradient(135deg, #2d333b 0%, #444c56 100%);
      color: #cdd9e5;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      border: 1px solid #444c56;
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      cursor: pointer;
    }

    .github-star-btn:hover {
      transform: translateY(-3px) translateZ(5px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
      background: linear-gradient(135deg, #444c56 0%, #5b6670 100%);
      border-color: #636e7b;
      color: #ffffff;
    }

    .github-star-btn:active {
      transform: translateY(-1px);
    }

    .star-icon {
      display: inline-block;
      font-size: 18px;
      line-height: 1;
    }

    .star-icon.left {
      animation: starSpin 2s ease-in-out infinite;
    }

    .star-icon.right {
      animation: starSpin 2s ease-in-out infinite 0.5s;
    }

    @keyframes starSpin {
      0%, 100% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(15deg) scale(1.15); }
    }

    /* ---- Footer ---- */
    .footer {
      margin-top: 18px;
      padding-top: 14px;
      border-top: 1px solid var(--vscode-panel-border);
    }

    .footer-text {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      opacity: 0.55;
    }

    /* ===== Responsive ===== */
    @media (max-width: 500px) {
      .body { padding: 20px 16px 16px; }
      .container { width: 96%; border-radius: 10px; }
      .donate-qr-code { width: 150px; height: 150px; }
      .stats-row { gap: 12px; padding: 10px 8px; }
      .hero-title { font-size: 19px; }
    }

    @media (prefers-reduced-motion: reduce) {
      .floating-emoji,
      .hero-emoji-row span,
      .donate-qr-code,
      .github-star-btn,
      .qr-badge,
      .qr-tip .emoji-small,
      .star-icon,
      .container-wrapper,
      .container,
      .hero-title {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  </style>
</head>
<body>
  <!-- Floating Emoji Background -->
  <div class="emoji-bg" id="emojiBg"></div>

  <!-- Main Card with 3D Tilt -->
  <div class="container-wrapper" id="containerWrapper">
    <div class="container" id="donateContainer">
      <!-- Content -->
      <div class="container-content">
        <!-- VS Code Title Bar -->
        <div class="title-bar">
          <div class="title-bar-dots">
            <div class="title-bar-dot red"></div>
            <div class="title-bar-dot yellow"></div>
            <div class="title-bar-dot green"></div>
          </div>
          <span class="title-bar-text">请开发者喝杯咖啡~</span>
        </div>

        <!-- Content Body -->
        <div class="body">
      <div class="hero">
        <div class="hero-emoji-row">
          <span>😘</span>
          <span>✨</span>
          <span>🚀</span>
          <span>💎</span>
          <span>🎯</span>
        </div>
        <h4 class="hero-title">用爱发电不易，期待您的支持</h4>
        <p class="hero-subtitle">
          <span class="highlight">☕ 请我喝杯咖啡吧~ ☕</span>
        </p>
      </div>

      <div class="stats-row">
        <div class="stat-item">
          <div class="stat-number">⚡</div>
          <div class="stat-label">持续更新</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">🐟</div>
          <div class="stat-label">快乐摸鱼</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">💝</div>
          <div class="stat-label">用爱发电</div>
        </div>
      </div>

      <div class="qr-section">
        <div class="qr-wrapper">
          <img
            src="https://img2024.cnblogs.com/blog/3085939/202504/3085939-20250425153014632-145153684.jpg"
            alt="微信赞赏码"
            class="donate-qr-code"
          />
          <div class="qr-badge">❤️ 扫码赞赏</div>
        </div>
        <p class="qr-tip">
          <span class="emoji-small">💫</span>
          微信扫一扫，支持开发者
          <span class="emoji-small">💫</span>
        </p>
      </div>

      <div class="divider">
        <span class="divider-text">也欢迎</span>
      </div>

      <div class="social-section">
        <p class="social-text">给个 Star 也是大大的支持！</p>
        <a
          href="https://github.com/crispyChicken999/zhihu-fisher-vscode"
          onclick="openGitHub()"
          class="github-star-btn"
        >
          <span class="star-icon left">⭐</span>
          <span>GitHub 上点个 Star</span>
          <span class="star-icon right">⭐</span>
        </a>
      </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    (function() {
      var container = document.getElementById('donateContainer');

      if (!container) return;

      // Tilt sensitivity
      var tiltMax = 8;
      var scale = 1.02;

      var handleMouseMove = function(e) {
        var rect = container.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var width = rect.width;
        var height = rect.height;

        // Spotlight position (used by CSS ::before)
        container.style.setProperty('--mouse-x', x + 'px');
        container.style.setProperty('--mouse-y', y + 'px');

        // 3D Tilt
        var rotateX = (y - height / 2) / 25;
        var rotateY = -(x - width / 2) / 25;

        rotateX = Math.max(-tiltMax, Math.min(tiltMax, rotateX));
        rotateY = Math.max(-tiltMax, Math.min(tiltMax, rotateY));

        container.style.transform =
          'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(' + scale + ', ' + scale + ', ' + scale + ')';
        container.style.boxShadow =
          '0 24px 56px rgba(0, 0, 0, 0.4), 0 6px 16px rgba(0, 0, 0, 0.25)';
      };

      var handleMouseLeave = function() {
        container.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        container.style.boxShadow =
          '0 16px 48px rgba(0, 0, 0, 0.35), 0 4px 12px rgba(0, 0, 0, 0.2)';
        container.style.setProperty('--mouse-x', '50%');
        container.style.setProperty('--mouse-y', '50%');
      };

      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);

      // ---- Generate Floating Emojis ----
      var emojis = [
        '☕', '❤️', '✨', '⭐', '💫', '🌟', '🎉', '🎊',
        '😊', '😘', '🥰', '💖', '💝', '🌺', '🌸', '🌈',
        '🎵', '🎶', '💎', '🔥', '🚀', '🎯', '💪', '🙏',
        '🍵', '🧋', '🥤', '🎨', '✨', '💕', '💗', '🎈',
        '🦋', '🍀', '🌻', '🌷', '⭐', '💡', '🎆', '🎇',
        '🥳', '🎁', '💌', '🕊️'
      ];

      var bgContainer = document.getElementById('emojiBg');
      var count = 24;

      for (var i = 0; i < count; i++) {
        var el = document.createElement('span');
        el.className = 'floating-emoji';
        el.textContent = emojis[i % emojis.length];

        var size = 16 + Math.random() * 28;
        var left = Math.random() * 100;
        var dur = 8 + Math.random() * 16;
        var delay = Math.random() * 18;
        var drift = (Math.random() - 0.5) * 80;
        var spin = (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360);
        var maxOpacity = 0.15 + Math.random() * 0.35;

        el.style.setProperty('--size', size + 'px');
        el.style.left = left + '%';
        el.style.setProperty('--dur', dur + 's');
        el.style.setProperty('--delay', delay + 's');
        el.style.setProperty('--drift', drift + 'px');
        el.style.setProperty('--spin', spin + 'deg');
        el.style.setProperty('--max-opacity', maxOpacity);

        bgContainer.appendChild(el);
      }
    })();

    // ---- Open GitHub ----
    function openGitHub() {
      window.postMessage({ command: 'openGitHub' }, '*');
    }

    window.addEventListener('message', function(event) {
      var message = event.data;
      switch (message.command) {
        case 'openGitHub':
          break;
      }
    });
  </script>
</body>
</html>
`;
