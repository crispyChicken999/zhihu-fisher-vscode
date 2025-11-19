/**
 * 导出Markdown功能脚本
 */
export const exportScript = `
/**
 * 显示导出Markdown确认弹窗
 */
function showExportMarkdownModal() {
  // 直接向后端请求统计信息
  vscode.postMessage({
    command: 'getExportStats'
  });
}

/**
 * 显示导出确认弹窗（由后端调用）
 */
function displayExportModal(stats) {
  // 创建弹窗容器
  const modal = document.createElement('div');
  modal.className = 'export-modal';
  modal.innerHTML = \`
    <div class="export-modal-overlay" onclick="closeExportModal()"></div>
    <div class="export-modal-content">
      <div class="export-modal-header">
        <h3>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: text-bottom; margin-right: 6px;">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          导出为 Markdown
        </h3>
        <button class="export-modal-close" onclick="closeExportModal()">&times;</button>
      </div>
      <div class="export-modal-body">
        <div class="export-info">
          <p class="export-description">
            将当前页面的问题、回答及评论导出为 Markdown 格式文件，方便您：
          </p>
          <ul class="export-features">
            <li>使用 AI 工具（如 ChatGPT、Claude）进行分析总结</li>
            <li>永久保存和备份感兴趣的内容</li>
            <li>在支持 Markdown 的编辑器中阅读和编辑</li>
          </ul>
          <div class="export-content-desc">
            <p class="export-subtitle">将导出以下内容：</p>
            <ul class="export-content-list">
              <li>问题标题和详情</li>
              <li>所有已加载的回答（\${stats.answerCount} 个）</li>
              <li>回答的评论及其子评论（\${stats.commentCount} 条）</li>
              <li>作者信息、点赞数等元数据</li>
            </ul>
          </div>
          <div class="export-stats">
            <div class="stat-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span class="stat-text">\${stats.answerCount} 个回答</span>
            </div>
            <div class="stat-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
              <span class="stat-text">\${stats.commentCount} 条评论</span>
            </div>
          </div>
        </div>
        <div class="export-actions">
          <button class="export-btn export-btn-primary" onclick="confirmExportMarkdown()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            确认导出
          </button>
          <button class="export-btn export-btn-secondary" onclick="closeExportModal()">
            取消
          </button>
        </div>
      </div>
    </div>
  \`;

  document.body.appendChild(modal);

  // 添加样式（如果尚未添加）
  if (!document.querySelector('#export-modal-style')) {
    const style = document.createElement('style');
    style.id = 'export-modal-style';
    style.textContent = \`
      .export-modal {
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

      .export-modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.4);
        cursor: pointer;
        backdrop-filter: blur(5px);
      }

      .export-modal-content {
        cursor: default;
        z-index: 1001;
        background-color: var(--vscode-editor-background);
        border-radius: 8px;
        width: 90%;
        margin: 1em;
        max-width: 600px;
        max-height: 96vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 20px var(--vscode-scrollbar-shadow);
        border: 1px solid var(--vscode-panel-border);
      }

      @keyframes modalSlideIn {
        from {
          opacity: 0;
          transform: translateY(-20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .export-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75em 1em;
        border-bottom: 1px solid var(--vscode-panel-border);
        background-color: var(--vscode-editor-background);
      }

      .export-modal-header h3 {
        margin: 0;
        font-size: min(1.25em, 16px);
        font-weight: 700;
        color: var(--vscode-foreground);
      }

      .export-modal-close {
        background: transparent;
        border: none;
        font-size: 20px;
        line-height: 1;
        color: var(--vscode-foreground);
        cursor: pointer;
        padding: 0px 4px;
        border-radius: 4px;
        transition: background-color 0.2s;
      }

      .export-modal-close:hover {
        background: var(--vscode-button-secondaryBackground);
        color: var(--vscode-button-foreground);
      }

      .export-modal-body {
        padding: 1em;
        overflow-y: auto;
        scroll-behavior: smooth;
        max-height: 70vh;
        background-color: var(--vscode-editor-background);
      }

      .export-modal-body:focus,
      .export-modal-body:focus-visible {
        outline: none;
      }

      .export-info {
        margin-bottom: 12px;
      }

      .export-description {
        color: var(--vscode-descriptionForeground);
        font-size: 13px;
        line-height: 1.6;
        margin: 0 0 12px 0;
      }

      .export-features {
        color: var(--vscode-foreground);
        font-size: 13px;
        line-height: 1.8;
        margin: 0 0 16px 0;
        padding-left: 20px;
      }

      .export-features li {
        margin-bottom: 4px;
      }

      .export-content-desc {
        background: var(--vscode-textCodeBlock-background);
        border-radius: 4px;
        padding: 12px;
        margin-bottom: 12px;
        border: 1px solid var(--vscode-input-border);
      }

      .export-subtitle {
        font-size: 13px;
        font-weight: 600;
        color: var(--vscode-foreground);
        margin: 0 0 8px 0;
      }

      .export-content-list {
        color: var(--vscode-descriptionForeground);
        font-size: 12px;
        line-height: 1.6;
        margin: 0;
        padding-left: 20px;
      }

      .export-content-list li {
        margin-bottom: 4px;
      }

      .export-stats {
        display: flex;
        gap: 16px;
        padding: 10px 12px;
        background: var(--vscode-input-background);
        border-radius: 4px;
        border: 1px solid var(--vscode-input-border);
      }

      .stat-item {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .stat-item svg {
        flex-shrink: 0;
        opacity: 0.8;
      }

      .stat-text {
        color: var(--vscode-foreground);
        font-size: 13px;
        font-weight: 500;
      }

      .export-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 12px;
      }

      .export-btn {
        padding: 6px 14px;
        border-radius: 2px;
        border: 1px solid transparent;
        cursor: pointer;
        font-size: 13px;
        font-weight: 400;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.15s ease;
      }

      .export-btn-primary {
        background: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
      }

      .export-btn-primary:hover {
        background: var(--vscode-button-hoverBackground);
      }

      .export-btn-secondary {
        background: var(--vscode-button-secondaryBackground);
        color: var(--vscode-button-secondaryForeground);
      }

      .export-btn-secondary:hover {
        background: var(--vscode-button-secondaryHoverBackground);
      }

      /* 滚动条样式 */
      .export-modal-body::-webkit-scrollbar {
        width: 10px;
      }

      .export-modal-body::-webkit-scrollbar-track {
        background: var(--vscode-scrollbarSlider-background);
      }

      .export-modal-body::-webkit-scrollbar-thumb {
        background: var(--vscode-scrollbarSlider-hoverBackground);
        border-radius: 4px;
      }

      .export-modal-body::-webkit-scrollbar-thumb:hover {
        background: var(--vscode-scrollbarSlider-activeBackground);
      }
    \`;
    document.head.appendChild(style);
  }
}

/**
 * 关闭导出弹窗
 */
function closeExportModal() {
  const modal = document.querySelector('.export-modal');
  if (modal) {
    modal.remove();
  }
}

/**
 * 确认导出Markdown
 */
function confirmExportMarkdown() {
  // 关闭弹窗
  closeExportModal();

  // 发送导出请求到后端
  vscode.postMessage({
    command: 'exportMarkdown'
  });
}

/**
 * 显示导出成功提示
 */
function showExportSuccess(filePath) {
  vscode.postMessage({
    command: 'showNotification',
    message: '✅ Markdown文件已导出: ' + filePath
  });
}
`;
