/**
 * 样式设置面板相关样式
 */
export const panelCss = `
/* 样式设置面板 */
.style-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
  border-bottom: 1px solid var(--vscode-panel-border);
}

.style-panel-header-close {
  background: transparent;
  border: none;
  color: var(--vscode-foreground);
  font-size: 12px;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.style-panel-header-close:hover {
  background: var(--vscode-button-secondaryBackground);
  border-radius: 4px;
  color: var(--vscode-button-foreground);
}

.color-picker-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.color-picker-container .color-picker {
  width: 50px;
  height: 40px;
  border-radius: 4px;
  border: 1px solid var(--vscode-dropdown-border);
  cursor: pointer;
}

.style-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  line-height: 1.5;
  transform: translate(-50%, -50%);
  min-width: 450px;
  width: 75vw;
  max-width: 650px;
  font-size: 12px;
  background-color: var(--vscode-editor-background);
  border: 1px solid var(--vscode-panel-border);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 9999;
  display: none;
  flex-direction: column;
  user-select: none;
}

.panel-select {
  width: 100%;
  padding: 5px;
  border-radius: 4px;
  background-color: var(--vscode-dropdown-background);
  color: var(--vscode-dropdown-foreground);
  border: 1px solid var(--vscode-dropdown-border);
}

.style-panel-tips {
  font-size: 12px;
  color: var(--vscode-descriptionForeground);
  margin: 10px;
  padding: 5px 0;
  display: flex;
  gap: 5px;
  justify-content: center;
  background: var(--vscode-activityBar-background);
  border-radius: 4px;
  align-items: center;
}

.style-panel-tips-wrapper {
  border-bottom: 1px solid var(--vscode-panel-border);
}

.style-panel-content {
  margin-top: 1px;
  max-height: 70vh;
  overflow-y: auto;
  padding: 0 10px 0px 20px;
}

.style-option {
  margin: 10px 0;
}

.style-option-divider {
  margin: 15px 0;
  border-bottom: 1px dashed var(--vscode-panel-border);
}

.style-buttons {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-top: 1px solid var(--vscode-panel-border);
}

.style-panel-mask {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.25);
  z-index: 9998;
}

.style-panel.visible,
.style-panel-mask.visible {
  display: flex;
}

/* 伪装类型选择样式 */
#disguise-types-container {
  background: var(--vscode-editor-background);
}

#disguise-types-container label {
  transition: all 0.2s ease;
}

#disguise-types-container label:hover {
  background: var(--vscode-list-hoverBackground) !important;
  border-color: var(--vscode-textLink-foreground) !important;
}

#disguise-types-container input[type="checkbox"]:checked + img + div {
  color: var(--vscode-textLink-foreground);
}

#disguise-types-container .file-type-preview {
  font-family: var(--vscode-editor-font-family, 'Cascadia Code', Consolas, 'Courier New', monospace);
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
  background: var(--vscode-textBlockQuote-background);
  padding: 2px 6px;
  border-radius: 3px;
  margin-left: auto;
}
`;