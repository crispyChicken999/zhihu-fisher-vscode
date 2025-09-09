/**
 * 问题详情组件样式
 */
export const questionDetailCss = `
  /* 问题详情按钮样式 */
  .question-detail-btn {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 0;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    vertical-align: text-bottom;
  }

  .question-detail-btn:focus,
  .question-detail-btn:focus-visible {
    outline: none;
  }

  .question-detail-btn:hover {
    background-color: var(--vscode-toolbar-hoverBackground);
    transform: translateY(-2px);
  }

  .question-detail-btn:active {
    background-color: var(--vscode-toolbar-activeBackground);
  }

  .question-detail-btn svg {
  }

  /* 问题详情弹窗样式 - 参照 related-questions-modal */
  .question-detail-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    z-index: 1000;
    cursor: pointer;
    align-items: center;
    justify-content: center;
  }

  .question-detail-modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
  }

  .question-detail-modal-content {
    cursor: default;
    z-index: 1001;
    background-color: var(--vscode-editor-background);
    border-radius: 8px;
    width: 90%;
    margin: 1em;
    max-width: 800px;
    max-height: 96vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 20px var(--vscode-scrollbar-shadow);
    border: 1px solid var(--vscode-panel-border);
  }

  .question-detail-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75em 1em;
    border-bottom: 1px solid var(--vscode-panel-border);
    background-color: var(--vscode-editor-background);
  }

  .question-detail-modal-header h3 {
    margin: 0;
    font-size: min(1.25em, 16px);
    font-weight: 700;
    color: var(--vscode-foreground);
  }

  .question-detail-close {
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

  .question-detail-close:hover {
    background: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-foreground);
  }

  .question-detail-modal-body {
    padding: 1em;
    overflow-y: auto;
    scroll-behavior: smooth;
    max-height: 70vh;
    background-color: var(--vscode-editor-background);
  }

  .question-detail-modal-body:focus,
  .question-detail-modal-body:focus-visible {
    outline: none;
  }

  .question-detail-content {
    color: inherit;
    line-height: inherit;
  }

  .question-detail-content.hide-media img {
    display: none;
  }

  .question-detail-content figure div {
    text-align: center;
  }

  /* 问题详情内容中的段落样式 */
  .question-detail-content p {
    margin: 1em 0;
    word-break: break-word;
  }

  .question-detail-content p:first-child {
    margin-top: 0;
  }


  .question-detail-content p:last-child {
    margin-bottom: 0;
  }

  .question-detail-content video,
  .question-detail-content img {
    border-radius: 4px;
    box-shadow: 0 2px 8px var(--vscode-widget-shadow);
    transition: transform 0.3s ease;
    text-align: center;
  }

  .question-detail-content img:hover {
    transform: translateY(-2px);
  }

  /* 问题详情内容中的链接样式 */
  .question-detail-content a {
    color: var(--vscode-textLink-foreground);
    text-decoration: none;
  }

  .question-detail-content a:hover {
    text-decoration: underline;
    color: var(--vscode-textLink-activeForeground);
  }

  /* 问题详情内容中的分割线样式 */
  .question-detail-content hr {
    border: none;
    border-top: 1px solid var(--vscode-panel-border);
    margin: 16px 0;
  }

  /* 媒体显示模式支持 */
  .question-detail-content.media-mini img {
    max-width: var(--mini-media-scale, 50%);
  }

  .question-detail-content.media-hidden img {
    display: none;
  }

  /* 响应式设计 */
  @media (max-width: 600px) {
    .question-detail-modal {
      padding: 10px;
    }
    
    .question-detail-modal-content {
      max-height: 90vh;
    }
    
    .question-detail-modal-header {
      padding: 12px 16px;
    }
    
    .question-detail-modal-body {
      padding: 16px;
    }
  }
`;
