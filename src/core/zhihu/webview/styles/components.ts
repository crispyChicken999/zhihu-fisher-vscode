/**
 * 通用组件样式
 * 注意：大多数组件样式已被移动到各自的专门文件中
 * - author.ts: 作者信息相关样式
 * - article.ts: 文章内容相关样式
 * - navigation.ts: 导航和分页相关样式
 * - toolbar.ts: 工具栏相关样式
 * - media.ts: 媒体相关样式
 * - panel.ts: 样式设置面板相关样式
 * - comments.ts: 评论相关样式
 */
export const componentsCss = `
/* 通用卡片样式 */
.card {
  background-color: var(--vscode-editor-background);
  border-radius: 6px;
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid var(--vscode-panel-border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

/* 加载中样式 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  color: var(--vscode-descriptionForeground);
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--vscode-button-background);
  border-radius: 50%;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 错误提示样式 */
.error-message {
  background-color: var(--vscode-inputValidation-errorBackground);
  color: var(--vscode-inputValidation-errorForeground);
  border: 1px solid var(--vscode-inputValidation-errorBorder);
  padding: 15px;
  margin: 20px 0;
  border-radius: 4px;
}

/* 成功提示样式 */
.success-message {
  background-color: var(--vscode-terminal-ansiGreen);
  color: var(--vscode-editor-background);
  padding: 15px;
  margin: 20px 0;
  border-radius: 4px;
}

/* 提示信息样式 */
.info-message {
  background-color: var(--vscode-editor-inactiveSelectionBackground);
  padding: 15px;
  margin: 20px 0;
  border-radius: 4px;
  border-left: 5px solid var(--vscode-activityBarBadge-background);
}

/* 标签样式 */
.tag {
  display: inline-block;
  background-color: var(--vscode-button-secondaryBackground);
  color: var(--vscode-button-secondaryForeground);
  padding: 2px 8px;
  margin-right: 5px;
  border-radius: 10px;
  font-size: 0.8em;
}

/* 徽章样式 */
.badge {
  background-color: var(--vscode-activityBarBadge-background);
  color: var(--vscode-activityBarBadge-foreground);
  border-radius: 10px;
  padding: 0 6px;
  font-size: 0.8em;
  display: inline-flex;
  align-items: center;
  height: 16px;
  margin-left: 5px;
}

/* 知乎链接VSCode打开选项样式 */
.zhihu-link-vscode {
  display: inline-block;
  color: var(--vscode-textLink-foreground);
  cursor: pointer;
  font-size: 1em;
  font-weight: 500;
  margin: 3px 0 0 5px;
  padding: 2px 6px;
  border-radius: 3px;
  background-color: var(--vscode-button-secondaryBackground);
  border: 1px solid var(--vscode-button-secondaryBorder, transparent);
  transition: all 0.2s ease;
}

.zhihu-link-vscode:hover {
  background-color: var(--vscode-button-secondaryHoverBackground);
  color: var(--vscode-textLink-activeForeground);
  transform: translateY(-1px);
}
`;
