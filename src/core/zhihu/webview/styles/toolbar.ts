/**
 * 工具栏相关样式
 */
export const toolbarCss = `
/* 工具栏样式 */
.toolbar {
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
  padding: 10px 0;
  border-top: 1px solid var(--vscode-panel-border);
  flex-wrap: wrap;
  gap: 10px;
}

.toolbar-left, .toolbar-right {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.button {
  background-color: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  border: none;
  padding: 6px 12px;
  border-radius: 2px;
  cursor: pointer;
  margin-right: 0;
  font-size: 12px;
}

.button:hover {
  background-color: var(--vscode-button-hoverBackground);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 固定工具栏 */
.fixed-toolbar {
  position: fixed;
  right: 10px;
  bottom: 10px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.fixed-toolbar button {
  background-color: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  border: none;
  padding: 5px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.fixed-toolbar button:hover {
  background-color: var(--vscode-button-hoverBackground);
}

#scroll-to-top {
  display: none;
}

.media-display-select {
  background-color: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  border: none;
  padding: 8px 12px;
  border-radius: 2px;
  cursor: pointer;
  appearance: auto; /* 保留下拉箭头 */
}

.media-display-select:hover {
  background-color: var(--vscode-button-hoverBackground);
}

.media-display-select:focus {
  outline: 1px solid var(--vscode-focusBorder);
}

.media-display-select option {
  background-color: var(--vscode-dropdown-background);
  color: var(--vscode-dropdown-foreground);
}
`;