/**
 * 相关问题组件样式
 */
export const relatedQuestionsCss = `
/* 相关问题图标 */
.related-questions-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  font-size: inherit;
  padding: 2px;
  border-radius: 4px;
  background-color: transparent;
  transition: transform 0.2s ease;
}

.related-questions-icon:hover {
  opacity: 1;
  background-color: var(--vscode-toolbar-hoverBackground);
  transform: translateY(-1px);
}

.related-questions-icon svg {
  width: min(1em, 12px);
  height: min(1em, 12px);
  fill: currentColor;
}

/* 相关问题弹窗样式 - 仿照子评论弹窗 */
.related-questions-modal {
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

.related-questions-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
}

.related-questions-modal-content {
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

.related-questions-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75em 1em;
  border-bottom: 1px solid var(--vscode-panel-border);
  background-color: var(--vscode-editor-background);
}

.related-questions-modal-header h3 {
  margin: 0;
  font-size: min(1.25em, 16px);
  font-weight: 700;
  color: var(--vscode-foreground);
}

.related-questions-modal-close {
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

.related-questions-modal-close:hover {
  background: var(--vscode-button-secondaryBackground);
  color: var(--vscode-button-foreground);
}

.related-questions-modal-body {
  padding: 1em;
  overflow-y: auto;
  scroll-behavior: smooth;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  gap: 1em;
  background-color: var(--vscode-editor-background);
}

.related-questions-modal-body:focus,
.related-questions-modal-body:focus-visible {
  outline: none;
}

/* 相关问题项样式 */
.related-question-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-direction: column;
  padding: 1em;
  border-radius: 0.5em;
  border: 1px solid var(--vscode-panel-border);
  background-color: var(--vscode-editor-background);
  transition: all 0.2s ease;
}

.related-question-item:hover {
  border-color: var(--vscode-commandCenter-activeBorder);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.question-content {
  flex: 1;
  min-width: 0;
}

.question-title {
  font-size: 1em;
  font-weight: 500;
  line-height: 1.4;
  color: var(--vscode-foreground);
  margin-bottom: 0.5em;
  word-wrap: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.question-meta {
  font-size: 0.9em;
  color: var(--vscode-descriptionForeground);
  line-height: 1.3;
}

.question-actions {
  display: flex;
  gap: 0.75em;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  align-self: flex-end;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  background-color: transparent;
  color: var(--vscode-button-foreground);
  border: 1px solid var(--vscode-panel-border);
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  height: 28px;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: var(--vscode-commandCenter-activeBorder);
  transform: translateY(-2px);
}

.action-btn svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}
`;
