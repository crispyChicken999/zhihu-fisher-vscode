/**
 * 回答排序选择器样式
 */
export const answerSortCss = `
  /* 排序选择器容器 */
  .answer-sort-selector {
    position: relative;
    display: inline-flex;
    align-items: center;
    vertical-align: text-bottom;
  }

  /* 排序按钮 */
  .answer-sort-button {
    cursor: pointer;
    padding: 2px;
    border: none;
    background: none;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
    color: inherit;
  }

  .answer-sort-button:focus,
  .answer-sort-button:focus-visible {
    outline: none;
  }

  .answer-sort-button:hover {
    background-color: var(--vscode-toolbar-hoverBackground);
    transform: translateY(-2px);
  }

  .answer-sort-button:active {
    background-color: var(--vscode-toolbar-activeBackground);
  }

  /* 排序弹出层 - Fixed 全屏 */
  .answer-sort-popover {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    justify-content: center;
    align-items: center;
  }

  .answer-sort-popover.show {
    display: flex;
  }

  /* 遮罩层 */
  .answer-sort-popover .popover-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    z-index: 1;
  }

  /* 主体内容 */
  .answer-sort-popover .popover-content-wrapper {
    position: relative;
    z-index: 2;
    background-color: var(--vscode-editor-background);
    border: 1px solid var(--vscode-panel-border);
    border-radius: 8px;
    box-shadow: 0 4px 20px var(--vscode-scrollbar-shadow);
    width: 90%;
    max-width: 320px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    animation: aspPop 0.2s ease-out;
  }

  @keyframes aspPop {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* 标题栏 */
  .answer-sort-popover .popover-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75em 1em;
    border-bottom: 1px solid var(--vscode-panel-border);
    background-color: var(--vscode-editor-background);
  }

  .answer-sort-popover .popover-header h3 {
    margin: 0;
    font-size: min(1.25em, 16px);
    font-weight: 700;
    color: var(--vscode-foreground);
  }

  .answer-sort-popover .popover-close {
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

  .answer-sort-popover .popover-close:hover {
    background: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-foreground);
  }

  /* 内容区域 */
  .answer-sort-popover .popover-body {
    overflow-y: auto;
    background-color: var(--vscode-editor-background);
  }

  /* 排序选项 */
  .answer-sort-option {
    padding: 12px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    user-select: none;
    transition: background-color 0.2s ease;
    position: relative;
    color: var(--vscode-foreground);
  }

  .answer-sort-option:hover {
    background-color: var(--vscode-list-hoverBackground);
  }

  .answer-sort-option.active {
    background-color: var(--vscode-list-activeSelectionBackground);
    color: var(--vscode-list-activeSelectionForeground);
    cursor: default;
  }

  .answer-sort-option.active:hover {
    background-color: var(--vscode-list-activeSelectionBackground);
  }

  /* 排序选项图标 */
  .sort-option-icon {
    font-size: 1.2em;
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }

  /* 排序选项文字 */
  .sort-option-text {
    flex: 1;
    font-size: 1em;
  }

  /* 选中标记 */
  .sort-option-check {
    font-size: 1.2em;
    color: inherit;
    font-weight: bold;
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }

  /* 当排序模式为时间排序时，给标题添加标签 */
  .sort-mode-tag {
    display: inline-block;
    border: 1px solid var(--vscode-badge-background);
    padding: 2px 4px;
    border-radius: 4px;
    font-size: 0.75em;
    font-weight: bold;
    margin-right: 0.5em;
    vertical-align: text-bottom;
  }

  /* 提示信息 */
  .sort-tips {
    padding: 8px 16px;
    font-size: 0.85em;
    color: var(--vscode-descriptionForeground);
    border-top: 1px solid var(--vscode-panel-border);
    line-height: 1.5;
  }
`;
