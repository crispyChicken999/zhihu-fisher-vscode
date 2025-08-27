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
        <p>如果这个插件对您有帮助，欢迎支持开发者继续改进和维护！</p>
        <div class="donate-qr-container">
          <img src="https://img2024.cnblogs.com/blog/3085939/202504/3085939-20250425153014632-145153684.jpg" alt="微信赞赏码" class="donate-qr-code">
          <p class="donate-tip">微信扫码打开</p>
          <p>💖 感谢使用~ 谢谢支持！💖</p>
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
      }

      .donate-modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        cursor: pointer;
        backdrop-filter: blur(5px);
      }

      .donate-modal-content {
        position: relative;
        background: var(--vscode-editor-background);
        border: 1px solid var(--vscode-panel-border);
        border-radius: 8px;
        max-width: 400px;
        width: 90%;
        max-height: 90vh;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
      }

      .donate-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid var(--vscode-panel-border);
      }

      .donate-modal-header h3 {
        margin: 0;
        color: var(--vscode-foreground);
        font-size: 18px;
      }

      .donate-modal-close {
        background: none;
        border: none;
        color: var(--vscode-foreground);
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background-color 0.2s;
      }

      .donate-modal-close:hover {
        background: var(--vscode-toolbar-hoverBackground);
      }

      .donate-modal-body {
        padding-top: 20px;
        text-align: center;
        overflow: auto;
        scroll-behavior: smooth;
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
    modal.remove();
  }
}
`;
