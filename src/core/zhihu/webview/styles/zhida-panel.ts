/**
 * 知乎直答（Zhida）AI 面板弹窗样式
 * 风格参照项目内 question-detail-modal
 */
export const zhidaPanelCss = `
  /* ===== 弹窗容器 ===== */
  .zhida-modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    cursor: pointer;
    align-items: center;
    justify-content: center;
  }

  .zhida-modal.is-open {
    display: flex;
  }

  /* 遮罩 */
  .zhida-modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
  }

  /* ===== 弹窗主体 ===== */
  .zhida-modal-content {
    cursor: default;
    position: relative;
    z-index: 1001;
    background-color: var(--vscode-editor-background);
    border-radius: 8px;
    width: 90%;
    margin: 1em;
    max-width: 800px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 20px var(--vscode-scrollbar-shadow);
    border: 1px solid var(--vscode-panel-border);
  }

  /* ===== 标题栏 ===== */
  .zhida-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75em 1em;
    border-bottom: 1px solid var(--vscode-panel-border);
    background-color: var(--vscode-editor-background);
    flex-shrink: 0;
  }

  .zhida-modal-title {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    font-size: min(1.1em, 15px);
    font-weight: 700;
    color: var(--vscode-foreground);
  }

  .zhida-modal-close {
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

  .zhida-modal-close:hover {
    background: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-foreground);
  }

  /* ===== 内容区（左: 关键词，右: 回答）===== */
  .zhida-modal-body {
    display: flex;
    flex-direction: row;
    flex: 1;
    overflow: hidden;
    min-height: 0;
  }

  /* ===== 左侧关键词面板 ===== */
  .zhida-keyword-panel {
    width: 130px;
    flex-shrink: 0;
    padding: 16px 12px;
    border-right: 1px solid var(--vscode-panel-border);
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
    background-color: var(--vscode-editor-background);
  }

  .zhida-keyword-label {
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    user-select: none;
  }

  .zhida-keyword-bubble {
    display: inline-block;
    padding: 6px 5px;
    border-radius: 6px;
    background: var(--vscode-badge-background);
    color: var(--vscode-badge-foreground);
    font-size: 13px;
    font-weight: 500;
    word-break: break-all;
    max-width: 100%;
    border: 1px solid var(--vscode-panel-border);
  }

  /* ===== 右侧 AI 回答区域 ===== */
  .zhida-answer-panel {
    flex: 1;
    overflow-y: auto;
    padding: 16px 18px;
    min-height: 0;
    background-color: var(--vscode-editor-background);
  }

  /* ===== 加载状态 ===== */
  .zhida-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    gap: 14px;
    color: var(--vscode-descriptionForeground);
    font-size: 13px;
  }

  .zhida-loading-dots {
    display: flex;
    gap: 6px;
  }

  .zhida-loading-dots span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--vscode-progressBar-background);
    opacity: 0.7;
    animation: zhidaDotBounce 1.2s infinite ease-in-out;
  }

  .zhida-loading-dots span:nth-child(1) { animation-delay: 0s; }
  .zhida-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
  .zhida-loading-dots span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes zhidaDotBounce {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
    40% { transform: scale(1); opacity: 1; }
  }

  /* ===== AI 回答内容 ===== */
  .zhida-answer-content {
    color: var(--vscode-foreground);
    font-size: 14px;
    line-height: 1.75;
  }

  .zhida-answer-content p {
    margin: 0 0 12px;
  }

  .zhida-answer-content p:last-child {
    margin-bottom: 0;
  }

  .zhida-answer-content strong {
    font-weight: 700;
  }

  .zhida-answer-content ul,
  .zhida-answer-content ol {
    padding-left: 20px;
    margin: 0 0 12px;
  }

  .zhida-answer-content li {
    margin-bottom: 4px;
  }

  .zhida-answer-content pre {
    background: var(--vscode-textCodeBlock-background);
    border-radius: 4px;
    padding: 10px 12px;
    font-size: 13px;
    overflow-x: auto;
    white-space: pre-wrap;
  }

  .zhida-answer-content code {
    background: var(--vscode-textCodeBlock-background);
    border-radius: 3px;
    padding: 1px 5px;
    font-size: 13px;
  }

  .zhida-answer-content table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 12px;
    font-size: 13px;
  }

  .zhida-answer-content th,
  .zhida-answer-content td {
    border: 1px solid var(--vscode-panel-border);
    padding: 6px 10px;
    text-align: left;
  }

  .zhida-answer-content th {
    background: var(--vscode-editor-inactiveSelectionBackground);
    font-weight: 600;
  }

  /* ===== 错误状态 ===== */
  .zhida-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 20px;
    gap: 10px;
    color: var(--vscode-errorForeground);
    font-size: 13px;
    text-align: center;
  }

  /* ===== 底部 footer ===== */
  .zhida-modal-footer {
    padding: 0;
    border-top: 1px solid var(--vscode-panel-border);
    flex-shrink: 0;
    background-color: var(--vscode-editor-background);
    overflow: hidden;
    border-radius: 0 0 8px 8px;
  }

  /* 免责声明行 — 默认折叠，hover footer 时展开 */
  .zhida-disclaimer {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    padding: 0 14px;
    max-height: 0;
    overflow: hidden;
    font-size: 11px;
    line-height: 1.55;
    color: var(--vscode-inputValidation-warningForeground, var(--vscode-foreground));
    background-color: var(--vscode-inputValidation-warningBackground, rgba(200, 140, 0, 0.08));
    border-left: 3px solid var(--vscode-list-warningForeground, #bf8803);
    transition: max-height 0.3s ease, padding 0.3s ease;
  }

  .zhida-modal-footer:hover .zhida-disclaimer {
    max-height: 120px;
    padding: 7px 14px;
  }

  .zhida-disclaimer-icon {
    flex-shrink: 0;
    margin-top: 1px;
    color: var(--vscode-list-warningForeground, #bf8803);
  }

  .zhida-disclaimer strong {
    color: var(--vscode-list-warningForeground, #bf8803);
  }

  /* AI Tip 行 */
  .zhida-ai-tip {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 14px;
    text-align: center;
    justify-content: center;
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    background-color: var(--vscode-editor-background);
    cursor: default;
    transition: background-color 0.2s;
  }

  .zhida-modal-footer:hover .zhida-ai-tip {
    background-color: var(--vscode-list-hoverBackground);
  }

  .zhida-ai-tip svg {
    flex-shrink: 0;
    opacity: 0.6;
  }

  /* hover 提示文字 */
  .zhida-disclaimer-hint {
    opacity: 0.55;
    font-size: 10px;
    margin-left: 2px;
    white-space: nowrap;
  }

  /* ===== AI 总结按钮（与 question-detail-btn 风格一致） ===== */
  .zhida-summarize-btn {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 2px;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease, background-color 0.15s;
    vertical-align: text-bottom;
    opacity: 0.65;
  }

  .zhida-summarize-btn:focus,
  .zhida-summarize-btn:focus-visible {
    outline: none;
  }

  .zhida-summarize-btn:hover {
    opacity: 1;
    background-color: var(--vscode-toolbar-hoverBackground);
    transform: translateY(-1px);
  }

  .zhida-summarize-btn:active {
    background-color: var(--vscode-toolbar-activeBackground);
  }
`;
