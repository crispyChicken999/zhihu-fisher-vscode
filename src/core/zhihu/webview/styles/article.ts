/**
 * 文章内容相关样式
 */
export const articleCss = `
/* 文章元数据样式 */
.article-meta {
  color: var(--vscode-descriptionForeground);
  margin-bottom: 20px;
  font-size: 0.9em;
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

.article-content p {
  margin: 10px 0;
}

.article-content.hide-media img, .article-content.hide-media video {
  display: none;
}

.article-content.mini-media img:not(.formula) {
  width: calc(50%);
  height: auto;
}

.article-content.mini-media video {
  width: calc(50%);
  height: auto;
  max-width: 100%;
  max-height: 100%;
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
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin: 10px 0;
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
`;