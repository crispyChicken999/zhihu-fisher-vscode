/**
 * 工具功能脚本 - 复制、收藏、下载等
 */
export const utilsScript = `
/**
 * 复制链接到剪贴板
 * @param {string} url 链接URL
 */
function copyLink(button, url, isImmersiveMode = false) {
  // 使用Clipboard API复制链接
  const tempInput = document.createElement("input");
  tempInput.value = url;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);

  // 暂时改变按钮文字
  const originalText = button.innerHTML;
  button.innerHTML = isImmersiveMode
    ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M18.333 6A3.667 3.667 0 0 1 22 9.667v8.666A3.667 3.667 0 0 1 18.333 22H9.667A3.667 3.667 0 0 1 6 18.333V9.667A3.667 3.667 0 0 1 9.667 6zM15 2c1.094 0 1.828.533 2.374 1.514a1 1 0 1 1-1.748.972C15.405 4.088 15.284 4 15 4H5c-.548 0-1 .452-1 1v9.998c0 .32.154.618.407.805l.1.065a1 1 0 1 1-.99 1.738A3 3 0 0 1 2 15V5c0-1.652 1.348-3 3-3zm1.293 9.293L13 14.585l-1.293-1.292a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 0 0-1.414-1.414"/></svg>'
    : \`
    <div style="display: flex; align-items: center; gap: 5px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M18.333 6A3.667 3.667 0 0 1 22 9.667v8.666A3.667 3.667 0 0 1 18.333 22H9.667A3.667 3.667 0 0 1 6 18.333V9.667A3.667 3.667 0 0 1 9.667 6zM15 2c1.094 0 1.828.533 2.374 1.514a1 1 0 1 1-1.748.972C15.405 4.088 15.284 4 15 4H5c-.548 0-1 .452-1 1v9.998c0 .32.154.618.407.805l.1.065a1 1 0 1 1-.99 1.738A3 3 0 0 1 2 15V5c0-1.652 1.348-3 3-3zm1.293 9.293L13 14.585l-1.293-1.292a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 0 0-1.414-1.414"/></svg>
      <span>已复制</span>
    </div>
  \`;

  // 3秒后恢复
  setTimeout(() => {
    button.innerHTML = originalText;
  }, 3000);

  vscode.postMessage({
    command: 'showNotification',
    message: '链接已复制到剪贴板'
  });
}

/**
 * 复制代码
 * @param {HTMLElement} button 复制按钮
 */
function copyCode(button) {
  const pre = button.parentElement;
  const code = pre.getAttribute('data-code');

  if (code) {
    // 使用Clipboard API复制代码
    const tempInput = document.createElement('input');
    tempInput.value = code;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    // 暂时改变按钮文字
    const originalText = button.textContent;
    button.textContent = '已复制';

    // 3秒后恢复
    setTimeout(() => {
      button.textContent = originalText;
    }, 3000);
  }
}

/**
 * 收藏内容到收藏夹
 */
function favoriteContent(contentToken, contentType) {
  // 发送收藏请求到VS Code扩展
  vscode.postMessage({
    command: "favoriteContent",
    contentToken: contentToken,
    contentType: contentType
  });
}

/**
 * 显示赞赏码弹窗
 */
function showDonateModal() {
  // 创建弹窗容器
  const modal = document.createElement('div');
  modal.className = 'donate-modal';
  modal.innerHTML = \`
    <div class="donate-modal-overlay" onclick="closeDonateModal()"></div>
    <div class="donate-modal-content">
      <div class="donate-modal-header">
        <h3>☕ 请开发者喝杯咖啡~ ☕</h3>
        <button class="donate-modal-close" onclick="closeDonateModal()">&times;</button>
      </div>
      <div class="donate-modal-body">
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
            <a href="https://github.com/crispyChicken999/zhihu-fisher-vscode" target="_blank" class="github-star-btn">
              <span class="star-icon">⭐</span>
              <span>GitHub上点个Star</span>
              <span class="star-icon">⭐</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  \`;

  document.body.appendChild(modal);

  // 添加样式
  if (!document.querySelector('#donate-modal-style')) {
    const style = document.createElement('style');
    style.id = 'donate-modal-style';
    style.textContent = \`
      .donate-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeScaleIn 0.3s ease-out;
      }

      @keyframes fadeScaleIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }

      @keyframes fadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.9); }
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }

      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }

      .donate-modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4));
        cursor: pointer;
        backdrop-filter: blur(8px);
      }

      .donate-modal-content {
        position: relative;
        background: linear-gradient(135deg, var(--vscode-editor-background) 0%, var(--vscode-sideBar-background) 100%);
        border: 2px solid var(--vscode-focusBorder);
        border-radius: 16px;
        max-width: 450px;
        width: 90%;
        max-height: 90vh;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      @keyframes modalSlideIn {
        from { transform: translateY(-50px) scale(0.8); opacity: 0; }
        to { transform: translateY(0) scale(1); opacity: 1; }
      }

      .donate-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: linear-gradient(90deg, #ff6b6b, #ffa500);
        color: white;
        border-bottom: none;
      }

      .donate-modal-header h3 {
        margin: 0;
        color: white;
        font-size: 20px;
        font-weight: bold;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .donate-modal-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s;
      }

      .donate-modal-close:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: rotate(90deg);
      }

      .donate-modal-body {
        padding: 24px 20px;
        text-align: center;
        overflow: auto;
        scroll-behavior: smooth;
      }

      .donate-hero {
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

      .donate-stats {
        display: flex;
        justify-content: space-around;
        margin: 20px 0;
        padding: 16px;
        background: var(--vscode-input-background);
        border-radius: 12px;
        border: 1px solid var(--vscode-input-border);
      }

      .stat-item {
        text-align: center;
      }

      .stat-number {
        font-size: 24px;
        font-weight: bold;
        color: #ffa500;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 12px;
        color: var(--vscode-descriptionForeground);
      }

      .donate-motivation {
        margin: 20px 0;
        padding: 16px;
        background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 165, 0, 0.1));
        border-radius: 12px;
        border-left: 4px solid #ff6b6b;
      }

      .motivate-text {
        color: var(--vscode-foreground);
        font-size: 16px;
        margin: 0 0 8px 0;
      }

      .highlight {
        background: linear-gradient(90deg, #ff6b6b, #ffa500);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-weight: bold;
      }

      .small-text {
        color: var(--vscode-descriptionForeground);
        font-size: 14px;
        margin: 0;
        font-style: italic;
      }

      .donate-qr-container {
      }

      .qr-wrapper {
        position: relative;
        display: inline-block;
        margin: 10px 0;
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

      .donate-benefits {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin: 20px 0;
        padding: 16px;
        background: var(--vscode-input-background);
        border-radius: 12px;
      }

      .benefit-item {
        color: var(--vscode-foreground);
        font-size: 14px;
        text-align: left;
        padding: 4px 0;
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
      }

      .donate-modal-body p {
        color: var(--vscode-foreground);
        margin: 0 0 10px 0;
        line-height: 1.5;
      }

      .donate-qr-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }

      .donate-qr-code {
        width: 200px;
        height: 200px;
        border-radius: 8px;
        border: 1px solid var(--vscode-panel-border);
      }

      .donate-tip {
        color: var(--vscode-descriptionForeground);
        font-size: 14px;
        margin: 0;
      }
    \`;
    document.head.appendChild(style);
  }
}

/**
 * 关闭赞赏码弹窗
 */
function closeDonateModal() {
  const modal = document.querySelector('.donate-modal');
  if (modal) {
    modal.style.animation = 'fadeOut 0.3s ease-out forwards';
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}
`;
