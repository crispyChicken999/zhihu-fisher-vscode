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
          <div class="export-features-section">
            <div class="feature-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <g fill="none"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M13.586 2A2 2 0 0 1 15 2.586L19.414 7A2 2 0 0 1 20 8.414V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2ZM12 4H6v16h12V10h-4.5A1.5 1.5 0 0 1 12 8.5zm3 10a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2zm-5-4a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2Zm4-5.586V8h3.586z"/></g>
              </svg>
              <div class="feature-content">
                <div class="feature-title">AI 分析总结</div>
                <div class="feature-desc">在 ChatGPT、Claude 等工具中分析</div>
              </div>
            </div>
            <div class="feature-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              <div class="feature-content">
                <div class="feature-title">永久保存</div>
                <div class="feature-desc">备份感兴趣的内容到本地</div>
              </div>
            </div>
            <div class="feature-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <div class="feature-content">
                <div class="feature-title">编辑阅读</div>
                <div class="feature-desc">在 Markdown 编辑器中打开</div>
              </div>
            </div>
          </div>

          <div class="export-warning">
            <div class="warning-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div class="export-warning-text">
              <div class="warning-title">保存位置</div>
              <div class="warning-items">
                <div class="warning-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 11 12 14 22 4"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                  <span>已打开文件夹：保存在工作区中</span>
                </div>
                <div class="warning-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 11 12 14 22 4"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                  <span>未打开文件夹：手动选择位置</span>
                </div>
                <div class="warning-item warning-important">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  <span>使用后请及时删除，避免误提交到 Git</span>
                </div>
              </div>
            </div>
          </div>

          <div class="export-content-section">
            <div class="section-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span>导出内容</span>
            </div>
            <div class="content-grid">
              <div class="content-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <g fill="none"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M13.586 2A2 2 0 0 1 15 2.586L19.414 7A2 2 0 0 1 20 8.414V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2ZM12 4H6v16h12V10h-4.5A1.5 1.5 0 0 1 12 8.5zm3 10a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2zm-5-4a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2Zm4-5.586V8h3.586z"/></g>
                </svg>
                <span>问题标题和详情</span>
              </div>
              <div class="content-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span>\${stats.answerCount} 个回答</span>
              </div>
              <div class="content-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
                <span>\${stats.commentCount} 条评论</span>
              </div>
              <div class="content-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>作者信息和元数据</span>
              </div>
            </div>
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
        flex: 1;
        padding: 1em;
        overflow-y: auto;
        scroll-behavior: smooth;
        background-color: var(--vscode-editor-background);
      }

      .export-modal-body:focus,
      .export-modal-body:focus-visible {
        outline: none;
      }

      .export-info {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      /* 功能特性区域 */
      .export-features-section {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .feature-item {
        display: flex;
        gap: 12px;
        padding: 12px;
        background: var(--vscode-input-background);
        border-radius: 6px;
        border: 1px solid var(--vscode-input-border);
        transition: all 0.2s ease;
      }

      .feature-item:hover {
        background: var(--vscode-list-hoverBackground);
        border-color: var(--vscode-focusBorder);
      }

      .feature-item svg {
        flex-shrink: 0;
        margin-top: 2px;
        color: var(--vscode-charts-blue);
      }

      .feature-content {
        flex: 1;
      }

      .feature-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--vscode-foreground);
        margin-bottom: 2px;
      }

      .feature-desc {
        font-size: 12px;
        color: var(--vscode-descriptionForeground);
        line-height: 1.4;
      }

      /* 警告区域 */
      .export-warning {
        display: flex;
        gap: 12px;
        padding: 14px;
        background: rgba(255, 191, 0, 0.08);
        border: 1px solid rgba(255, 191, 0, 0.3);
        border-radius: 6px;
      }

      .warning-icon {
        flex-shrink: 0;
      }

      .warning-icon svg {
        color: #f59e0b;
      }

      .export-warning-text {
        flex: 1;
      }

      .warning-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--vscode-foreground);
        margin-bottom: 8px;
      }

      .warning-items {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .warning-item {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-size: 12px;
        color: var(--vscode-descriptionForeground);
        line-height: 1.5;
      }

      .warning-item svg {
        flex-shrink: 0;
        margin-top: 2px;
        opacity: 0.7;
      }

      .warning-item.warning-important {
        color: #f59e0b;
        font-weight: 500;
      }

      .warning-item.warning-important svg {
        color: #f59e0b;
        opacity: 1;
      }

      /* 导出内容区域 */
      .export-content-section {
        background: var(--vscode-input-background);
        border: 1px solid var(--vscode-input-border);
        border-radius: 6px;
        padding: 14px;
      }

      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 600;
        color: var(--vscode-foreground);
        margin-bottom: 12px;
      }

      .section-title svg {
        color: var(--vscode-charts-purple);
      }

      .content-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }

      .content-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        background: var(--vscode-editor-background);
        border-radius: 4px;
        font-size: 12px;
        color: var(--vscode-foreground);
      }

      .content-item svg {
        flex-shrink: 0;
        opacity: 0.7;
      }

      .export-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        padding: 12px 16px;
        border-top: 1px solid var(--vscode-panel-border);
        background-color: var(--vscode-editor-background);
        flex-shrink: 0;
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
