/**
 * 导航按钮相关样式
 */
export const navigationCss = `
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
  margin: 10px 0;
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

/* 自适应调整 */
@media (max-width: 600px) {
  .navigation-buttons {
    width: 100%;
    justify-content: space-between;
  }

  .nav-info {
    width: 100%;
    justify-content: center;
    margin-top: 10px;
    flex-wrap: wrap;
  }
}
`;