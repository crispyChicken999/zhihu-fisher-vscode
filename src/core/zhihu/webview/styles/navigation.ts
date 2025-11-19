/**
 * 导航按钮相关样式
 */
export const navigationCss = `
/* 分页器样式 */
.paginator {
  display: flex;
  align-items: center;
  gap: 5px;
  line-height: 0;
}

.page-button {
  width: 26px;
  height: 26px;
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
  margin: 10px 0;
  align-items: center;
  flex-wrap: wrap;
}

.navigation-buttons {
  display: flex;
  gap: 10px;
  user-select: none;
}

.navigation-buttons .prev,
.navigation-buttons .next {
  background-color: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  border: none;
  padding: 0 6px;
  height: 26px;
  border-radius: 2px;
  cursor: pointer;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  flex-wrap: nowrap;
}

.navigation-buttons .prev:hover,
.navigation-buttons .next:hover {
  background-color: var(--vscode-button-hoverBackground);
  color: var(--vscode-button-hoverForeground);
}

.navigation-buttons .prev:disabled,
.navigation-buttons .next:disabled {
  background-color: var(--vscode-button-secondaryBackground);
  color: var(--vscode-button-secondaryForeground);
  cursor: not-allowed;
}

.nav-info {
  color: var(--vscode-descriptionForeground);
  font-size: min(0.9em, 12px);
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  padding: 4px 0;
  user-select: none;
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

/* 回答跳转选择器样式 */
.answer-jump-select {
  user-select: none;
  background-color: var(--vscode-dropdown-background);
  color: var(--vscode-dropdown-foreground);
  border: 1px solid var(--vscode-dropdown-border);
  border-radius: 4px;
  padding: 0;
  font-size: 0.8em;
  outline: none;
  cursor: pointer;
  margin: 0 4px;
}

.answer-jump-select:hover {
  background-color: var(--vscode-dropdown-background);
  border-color: var(--vscode-focusBorder);
}

.answer-jump-select:focus {
  border-color: var(--vscode-focusBorder);
  box-shadow: 0 0 0 1px var(--vscode-focusBorder);
}

/* 导航信息各部分样式 */
.current-answer-info {
  /* 当前回答信息区域 */
}

.loaded-info {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.loaded-text {
  /* 已加载回答数文本 */
}

.loading-icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.total-count {
  /* 总回答数文本 */
}
`;