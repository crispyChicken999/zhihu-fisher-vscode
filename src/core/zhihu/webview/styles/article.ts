/**
 * 文章内容相关样式
 */
export const articleCss = `
/* 文章元数据样式 */
.article-meta {
  color: var(--vscode-descriptionForeground);
  margin-bottom: 10px;
  font-size: 0.9em;
}

.article-meta-footer {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
}

.tips {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
}

.article-meta.hide-media .author-avatar {
  display: none;
}

.article-meta.mini-media .author-avatar {
  width: 30px;
  height: 30px;
}

/* 文章内容样式 */
.article-content {
  margin: 10px 0;
}
.article-content video,
.article-content img {
  border-radius: 4px;
  box-shadow: 0 2px 8px var(--vscode-widget-shadow);
  transition: transform 0.3s ease;
}

.article-content img:not(.formula):hover {
  transform: translateY(-2px);
}

.article-content p {
  margin: 1em 0;
  word-break: break-word;
}

.article-content.hide-media img, .article-content.hide-media video {
  display: none;
}

.article-content.mini-media img:not(.formula) {
  /* 缩放比例现在通过JavaScript动态设置 */
}

.article-content.mini-media video {
  /* 缩放比例现在通过JavaScript动态设置 */
  margin: 1em 0;
}

.article-content img.formula {
  display: inline-block;
  vertical-align: middle;
  text-align: center;
}

.empty-container {
  display: none !important;
}

.table-container {
  width: 100%;
  overflow-x: auto;
  margin-bottom: 16px;
}

/* 回答元数据样式 */
.answer-meta {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-right: 6px;
  padding: 5px 8px;
  font-size: min(1em, 12px);
  border-radius: 2px;
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

/* 投票按钮样式 */
.vote-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
}

.vote-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0px 2px;
  border: 1px solid transparent;
  border-radius: 4px;
  background-color: var(--vscode-button-secondaryBackground);
  color: var(--vscode-button-secondaryForeground);
  cursor: pointer;
  font-size: 1em;
  font-weight: 500;
}

.vote-button:hover {
  background-color: var(--vscode-button-hoverBackground);
  transform: translateY(-1px);
}

.vote-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.vote-button svg {
  opacity: 0.8;
}

/* 投票按钮激活状态 */
.vote-button.active {
  font-weight: 600;
}

.vote-button.vote-up.active {
  background-color: var(--vscode-gitDecoration-addedResourceForeground, #28a745);
  color: var(--vscode-editor-background);
  border: 1px solid var(--vscode-gitDecoration-addedResourceForeground, #28a745);
  opacity: 0.9;
}

.vote-button.vote-up.active svg {
  color: var(--vscode-editor-background);
  opacity: 1;
}

.vote-button.vote-down.active {
  background-color: var(--vscode-gitDecoration-deletedResourceForeground, #dc3545);
  color: var(--vscode-editor-background);
  border: 1px solid var(--vscode-gitDecoration-deletedResourceForeground, #dc3545);
  opacity: 0.9;
}

.vote-button.vote-down.active svg {
  color: var(--vscode-editor-background);
  opacity: 1;
}

.vote-button.vote-neutral.active {
  background-color: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  border: 1px solid var(--vscode-contrastBorder, var(--vscode-button-background));
}

.vote-button.vote-neutral.active svg {
  color: var(--vscode-button-foreground);
  opacity: 1;
}

/* 暗色主题适配 - 现在使用主题变量，这部分可以简化 */
.vscode-dark .vote-button.vote-up.active,
.vscode-dark .vote-button.vote-down.active {
  opacity: 0.8;
}

.vscode-dark .vote-button.vote-neutral.active {
  background-color: var(--vscode-button-secondaryBackground);
  color: var(--vscode-button-secondaryForeground);
  border-color: var(--vscode-contrastBorder, var(--vscode-button-secondaryBackground));
}

.meta-item.like {
  color: #e53935;
}

.meta-item.comment {
  color: #42a5f5;
  cursor: pointer;
}
.meta-item.comment:hover {
  color: #1675fb !important;
}
.meta-item.comment:hover svg{
  filter: none !important;
}
.meta-item.time {
  color: var(--vscode-descriptionForeground);
  display: flex;
  gap: 5px;
}

.meta-item.time .update-time {
  opacity: 0.8;
  font-size: 0.9em;
}

p.ztext-empty-paragraph {
  display: none;
}

.RichText-LinkCardContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.ReferenceList a {
  word-break: break-all;
}

.RichText-LinkCardContainer a {
  width: fit-content;
  margin: 10px auto;
  padding: 5px 10px;
  border-radius: 4px;
  max-width: 500px;
  background: var(--vscode-textPreformat-background);
  color: var(--vscode-textLink-activeForeground);
  text-decoration: none;
  transition: transform 0.2s ease;
  word-break: break-all;
}

.RichText-LinkCardContainer a:before {
  content: "引用链接：";
  font-size: 0.8em;
  color: var(--vscode-descriptionForeground);
  margin-right: 5px;
}

.RichText-LinkCardContainer a:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  background-color: var(--vscode-button-secondaryHoverBackground);
  color: var(--vscode-textLink-activeForeground);
}

h1, h2, h3, h4, h5, h6 {
  color: inherit;
}

/* 不适内容图片样式 */
.uncomfortable-image-container {
  margin: 15px 0;
  text-align: center;
}

.image-mask {
  position: relative;
  display: inline-block;
  border-radius: 8px;
  overflow: hidden;
}

.mask-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  backdrop-filter: blur(2px);
}

.mask-overlay:hover {
  background: rgba(0, 0, 0, 0.5) !important;
  transform: scale(1.02);
}

.mask-overlay svg {
  margin-bottom: 8px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.real-image {
  border-radius: 8px;
  transition: opacity 0.3s ease;
  max-width: 100%;
  height: auto;
}

.real-image:hover {
  transform: scale(1.02);
  transition: transform 0.3s ease;
}
`;
