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
  /* 缩放比例现在通过JavaScript动态设置 */
}

.article-content.mini-media video {
  /* 缩放比例现在通过JavaScript动态设置 */
  margin: 10px 0;
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

p.ztext-empty-paragraph {
  display: none;
}

.RichText-LinkCardContainer {
  display: flex;
  justify-content: center;
  align-items: center;
}

.RichText-LinkCardContainer a {
  width: fit-content;
  margin: 10px auto;
  padding: 8px 15px;
  border-radius: 8px;
  max-width: 500px;
  background: var(--vscode-textPreformat-background);
  color: var(--vscode-textLink-activeForeground);
  text-decoration: none;
  transition: all 0.2s ease;
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
