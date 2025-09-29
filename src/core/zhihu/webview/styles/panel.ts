/**
 * 设置面板相关样式
 */
export const panelCss = `
/* 设置面板 */
.style-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid var(--vscode-panel-border);
}

.style-panel-header-close {
  background: transparent;
  border: none;
  color: var(--vscode-foreground);
  font-size: 12px;
  cursor: pointer;
  padding: 4px;
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

/* 颜色预设样式 */
.color-presets-container {
  margin-top: 8px;
}

.color-presets-label {
  font-size: 12px;
  color: var(--vscode-descriptionForeground);
  margin-bottom: 6px;
  display: block;
}

.color-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.color-preset-btn {
  width: 24px;
  height: 24px;
  border: 2px solid var(--vscode-dropdown-border);
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
  position: relative;
}

.color-preset-btn:hover {
  transform: scale(1.1);
  border-color: var(--vscode-textLink-foreground);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.color-preset-btn:active {
  transform: scale(0.95);
}

.color-preset-btn::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.8);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.color-preset-btn.selected::after {
  opacity: 1;
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

.style-panel-content {
  min-height: 300px;
  max-height: 70vh;
  overflow-y: auto;
  scroll-behavior: smooth;
  padding: 0px 15px;
}

.style-option {
  margin: 10px 0;
}

.style-option-divider {
  margin: 10px 0;
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

/* 项目类型选择器样式 */
.style-option-select {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid var(--vscode-input-border);
  background: var(--vscode-input-background);
  color: var(--vscode-input-foreground);
  border-radius: 2px;
  font-size: 13px;
  outline: none;
  cursor: pointer;
}

.style-option-select:focus {
  border-color: var(--vscode-focusBorder);
}

.style-option-select:hover {
  background: var(--vscode-list-hoverBackground);
}

/* 伪装文件类型选择项样式 */
.disguise-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
}

.disguise-type-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border: 1px solid var(--vscode-panel-border);
  border-radius: 4px;
  background: var(--vscode-editor-background);
  transition: all 0.2s ease;
}

.disguise-type-item:hover {
  background: var(--vscode-list-hoverBackground) !important;
  border-color: var(--vscode-textLink-foreground) !important;
}

.disguise-type-item.selected {
  border-color: var(--vscode-textLink-foreground);
  background: var(--vscode-textBlockQuote-background);
}

.disguise-type-checkbox {
  transform: scale(1.1);
}

.disguise-type-icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
}

.disguise-type-content {
  flex: 1;
  min-width: 0;
}

.disguise-type-name {
  font-weight: 500;
  color: var(--vscode-editor-foreground);
  margin-bottom: 2px;
}

.disguise-type-preview {
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
  font-family: monospace;
}

/* Tab页样式 */
.style-tabs {
  display: flex;
  border-bottom: 1px solid var(--vscode-panel-border);
  margin-bottom: 0;
  background: var(--vscode-editor-background);
  top: 0;
  z-index: 1;
}

.style-tab-button {
  flex: 1 0 auto;
  padding: 8px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  color: var(--vscode-foreground);
  font-size: 13px;
  transition: all 0.2s ease;
  position: relative;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.style-tab-button:focus-visible {
  outline: none;
}

.style-tab-button:hover {
  background: var(--vscode-list-hoverBackground) !important;
  color: var(--vscode-textLink-foreground) !important;
}

.style-tab-button.active {
  border-bottom: 2px solid var(--vscode-textLink-foreground);
  color: var(--vscode-textLink-foreground);
  font-weight: 600;
}

.style-tab-button svg {
  vertical-align: middle;
  margin-right: 4px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.style-tab-button:hover svg,
.style-tab-button.active svg {
  opacity: 1;
}

.style-tab-content {
  display: none;
  animation: fadeIn 0.3s ease-in-out;
}

.style-tab-content.active {
  display: block;
}

/* 样式选项相关 */
.style-option-label {
  display: block;
  margin-bottom: 5px;
}

.style-option-label-with-margin {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
}

.style-option-label-inline {
  display: block;
  margin-bottom: 10px;
}

.style-option-flex {
  display: flex;
  align-items: center;
  gap: 10px;
}

.style-option-flex-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.style-option-flex-1 {
  flex: 1;
}

.style-option-width-30 {
  width: 30px;
}

.style-option-width-40 {
  width: 40px;
}

.style-option-width-auto {
  flex: 0 0 auto;
}

.style-option-center {
  display: inline-flex;
  align-items: center;
}

.style-option-gap-5 {
  gap: 5px;
}

.style-option-gap-8 {
  gap: 8px;
}

.style-option-cursor-pointer {
  cursor: pointer;
}

.style-option-transform-scale {
  transform: scale(1.2);
}

.style-option-font-weight {
  font-weight: 500;
}

.style-option-font-weight-bold {
  font-weight: bold;
}

.style-option-color-description {
  color: #666;
  font-size: 12px;
  margin-left: 8px;
}

.style-option-help-text {
  font-size: 12px;
  color: var(--vscode-descriptionForeground);
  line-height: 1.4;
  padding: 8px 12px;
  background: var(--vscode-textBlockQuote-background);
  border: 1px solid var(--vscode-textBlockQuote-border);
  border-radius: 4px;
}

.style-option-help-text-with-margin {
  font-size: 12px;
  color: var(--vscode-descriptionForeground);
  line-height: 1.4;
  padding: 8px 12px;
  background: var(--vscode-textBlockQuote-background);
  border: 1px solid var(--vscode-textBlockQuote-border);
  border-radius: 4px;
  margin-bottom: 10px;
}

.style-option-help-text-large {
  font-size: 12px;
  color: var(--vscode-descriptionForeground);
  line-height: 1.4;
  padding: 12px;
  background: var(--vscode-textBlockQuote-background);
  border: 1px solid var(--vscode-textBlockQuote-border);
  border-radius: 4px;
  margin-top: 15px;
}

.style-option-help-strong {
  color: var(--vscode-editor-foreground);
}

.style-option-help-strong-link {
  color: var(--vscode-textLink-foreground);
}

.style-option-help-margin-4 {
  margin-bottom: 4px;
}

.style-option-help-margin-8 {
  margin-bottom: 8px;
}

/* Details/Summary 折叠样式 */
.style-option-help-details {
  margin: 10px 0;
  border: 1px solid var(--vscode-checkbox-background);
  border-radius: 4px;
  background: var(--vscode-textBlockQuote-background);
  overflow: hidden;
}

.style-option-help-details[open] .style-option-help-summary {
  background: var(--vscode-checkbox-background);
}

.style-option-help-summary {
  padding: 4px 12px;
  cursor: pointer;
  color: var(--vscode-button-secondaryForeground);
  border: none;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  user-select: none;
  position: relative;
}

.style-option-help-summary:hover {
  background: var(--vscode-checkbox-background);
  color: var(--vscode-button-foreground);
}

.style-option-help-summary::-webkit-details-marker {
  display: none;
}

.style-option-help-summary::before {
  content: '▶';
  font-size: 10px;
  color: var(--vscode-descriptionForeground);
  transition: transform 0.2s ease;
  margin-right: 4px;
}

.style-option-help-details[open] .style-option-help-summary::before {
  transform: rotate(90deg);
}

.style-option-help-content {
  padding: 10px;
  background: var(--vscode-textBlockQuote-background);
  color: var(--vscode-descriptionForeground);
  font-size: 12px;
  line-height: 1.4;
  border-top: 1px solid var(--vscode-checkbox-background);
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
  }
  to {
    opacity: 1;
    max-height: 200px;
    padding-top: 12px;
    padding-bottom: 12px;
  }
}

.style-option-section {
  margin-top: 10px;
}

.style-option-container {
  max-height: 50vh;
  overflow-y: auto;
  border: 1px solid var(--vscode-panel-border);
  border-radius: 4px;
  padding: 10px;
}

.style-option-button-group {
  display: flex;
  gap: 10px;
  margin: 10px 0;
}

.style-option-button {
  flex: 1;
  font-size: 12px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 快捷键配置样式 */
.shortcut-config-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border: 1px solid var(--vscode-panel-border);
  border-radius: 4px;
  margin-bottom: 10px;
  background: var(--vscode-editor-background);
  transition: all 0.2s ease;
}

.shortcut-config-item:hover {
  background: var(--vscode-list-hoverBackground) !important;
  border-color: var(--vscode-textLink-foreground) !important;
}

.shortcut-config-item-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.shortcut-config-item-title {
  font-size: 13px;
  font-weight: 500;
}

.category-tag {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  color: white;
  font-weight: bold;
}

.shortcut-config-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.shortcut-inputs-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.shortcut-input-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.shortcut-input {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid transparent;
  border-radius: 3px;
  background: var(--vscode-input-background);
  color: var(--vscode-input-foreground);
  text-align: center;
  cursor: pointer;
  font-size: 12px;
  max-width: 100px;
}

.shortcut-input-single {
  width: 120px;
  padding: 4px 8px;
  border: 1px solid transparent;
  border-radius: 3px;
  background: var(--vscode-input-background);
  color: var(--vscode-input-foreground);
  text-align: center;
  cursor: pointer;
  font-size: 12px;
}

.shortcut-input:hover,
.shortcut-input-single:hover {
  border-color: var(--vscode-focusBorder) !important;
}

.shortcut-remove-btn {
  padding: 2px 4px;
  border: none;
  background: var(--vscode-button-secondaryBackground);
  color: var(--vscode-button-secondaryForeground);
  border-radius: 3px;
  cursor: pointer;
  font-size: 10px;
}

.shortcut-add-btn {
  padding: 4px 6px;
  border: none;
  background: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  border-radius: 3px;
  cursor: pointer;
  font-size: 10px;
}

.shortcut-clear-btn {
  padding: 4px 6px;
  border: none;
  background: var(--vscode-button-secondaryBackground);
  color: var(--vscode-button-secondaryForeground);
  border-radius: 3px;
  cursor: pointer;
  font-size: 10px;
}

.shortcut-remove-btn:hover,
.shortcut-add-btn:hover,
.shortcut-clear-btn:hover {
  background: var(--vscode-button-hoverBackground);
  color: var(--vscode-button-foreground);
}

.global-shortcuts-section {
  margin-top: 10px;
  padding-top: 15px;
  border-top: 1px solid var(--vscode-panel-border);
}

.global-shortcuts-section .shortcut-config-item:last-of-type {
  margin-bottom: 0;
}

.global-shortcuts-title {
  margin: 0 0 10px 0;
  font-size: 13px;
  font-weight: bold;
}

.global-shortcuts-desc {
  font-size: 12px;
  color: var(--vscode-descriptionForeground);
  margin-bottom: 10px;
}

.global-shortcut-name {
  flex: 1;
}

.global-shortcut-name-text {
  font-size: 13px;
  font-weight: 500;
}
`;