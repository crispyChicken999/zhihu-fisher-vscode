/**
 * 组件样式
 */
export const componentsCss = `
/* 作者信息样式 */
.author-info {
  display: flex;
  align-items: center;
  margin: 15px 0;
  padding: 10px;
  border-radius: 4px;
  background-color: var(--vscode-editor-inactiveSelectionBackground);
  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px,
    rgba(0, 0, 0, 0.3) 0px 7px 13px -3px,
    rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
}

.author-avatar {
  margin-right: 15px;
  flex-shrink: 0;
}

.author-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
}

.author-avatar img:hover {
  filter: brightness(1.1) saturate(1.1);
  transform: scale(1.05) translateY(-2px);
}

.author-details {
  flex-grow: 1;
}

.author-name {
  font-weight: 600;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.author-name .author-fans {
  color: var(--vscode-descriptionForeground);
  display: flex;
  align-items: center;
}

.author-bio {
  font-size: 0.9em;
  color: var(--vscode-descriptionForeground);
}

.author-link {
  cursor: pointer;
  color: var(--vscode-textLink-foreground);
}

.author-link:hover {
  text-decoration: underline;
}

/* 分页器样式 */
.paginator {
  display: flex;
  align-items: center;
  gap: 5px;
}

.page-button {
  min-width: 30px;
  height: 30px;
  background-color: var(--vscode-button-secondaryBackground);
  color: var(--vscode-button-secondaryForeground);
  border: none;
  border-radius: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
}

.page-button:hover:not(.active-page):not(:disabled) {
  background-color: var(--vscode-button-secondaryHoverBackground);
}

.active-page {
  background-color: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  font-weight: bold;
}

.page-ellipsis {
  margin: 0 2px;
  color: var(--vscode-descriptionForeground);
}

/* 导航按钮样式 */
.navigation {
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
  align-items: center;
  flex-wrap: wrap;
}

.navigation-buttons {
  display: flex;
  gap: 10px;
}

.navigation-buttons .prev,
.navigation-buttons .next {
  background-color: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  border: none;
  padding: 0 8px;
  border-radius: 2px;
  cursor: pointer;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  flex-wrap: nowrap;
}

.navigation-buttons .prev:disabled,
.navigation-buttons .next:disabled {
  background-color: var(--vscode-button-secondaryBackground);
  color: var(--vscode-button-secondaryForeground);
  cursor: not-allowed;
}

.nav-info {
  color: var(--vscode-descriptionForeground);
  font-size: 0.9em;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  padding: 4px 0;
}

.nav-info > * {
  white-space: nowrap;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.nav-info .separator {
  margin: 0 8px;
  opacity: 0.7;
}

/* 回答元数据样式 */
.answer-meta {
  width: fit-content;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin: 12px 0;
  padding: 6px 10px;
  border-radius: 4px;
  background-color: var(--vscode-editor-inactiveSelectionBackground);
  color: var(--vscode-descriptionForeground);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.meta-item svg {
  opacity: 0.8;
}

.meta-item.like {
  color: #e53935;
}

.meta-item.comment {
  color: #42a5f5;
}

.meta-item.time {
  color: var(--vscode-descriptionForeground);
  display: flex;
  gap: 5px;
  overflow-x: auto;
}

.meta-item.time .update-time {
  opacity: 0.8;
  font-size: 0.9em;
}

/* 工具栏样式 */
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

.style-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 350px;
  max-width: 90%;
  font-size: 12px;
  background-color: var(--vscode-editor-background);
  border: 1px solid var(--vscode-panel-border);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  display: none;
  flex-direction: column;
  transition: all 0.2s ease-in-out;
  user-select: none;
}

.font-family-select {
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
  margin: 15px 15px 0;
  padding: 5px 0;
  display: flex;
  gap: 5px;
  justify-content: center;
  background: var(--vscode-activityBar-background);
  border-radius: 4px;
  align-items: center;
}

.style-panel-mask {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.1);
}

.style-panel.visible,
.style-panel-mask.visible {
  display: flex;
}
`;
