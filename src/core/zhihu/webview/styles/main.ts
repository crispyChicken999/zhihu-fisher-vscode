/**
 * 主样式
 */
export const mainCss = `
/* 知乎阅读器主样式 */
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe WPC", "Segoe UI",
    system-ui, "Ubuntu", "Droid Sans", sans-serif;
  padding: 0 20px;
  margin: 0 auto;
  max-width: 800px;
  line-height: 1.6;
  color: var(--vscode-foreground);
  background-color: var(--vscode-editor-background);
}

h1, h2, h3, h4, h5, h6 {
  color: var(--vscode-editor-foreground);
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

h1 {
  font-size: 2em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--vscode-panel-border);
}

h2 {
  font-size: 1.5em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--vscode-panel-border);
}

h3 {
  font-size: 1.25em;
}

a {
  color: var(--vscode-textLink-foreground);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

code {
  font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
  background-color: var(--vscode-textCodeBlock-background);
  padding: 2px 4px;
  border-radius: 3px;
}

pre {
  background-color: var(--vscode-textCodeBlock-background);
  padding: 16px;
  border-radius: 3px;
  overflow: auto;
  position: relative;
}

pre code {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
}

img {
  max-width: 100%;
  height: auto;
}

blockquote {
  padding: 0 1em;
  color: var(--vscode-foreground);
  border-left: 0.25em solid var(--vscode-panel-border);
  margin: 0 0 16px 0;
}

hr {
  height: 0.25em;
  padding: 0;
  margin: 24px 0;
  background-color: var(--vscode-panel-border);
  border: 0;
}

table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 16px;
}

table th, table td {
  padding: 6px 13px;
  border: 1px solid var(--vscode-panel-border);
}

table tr {
  background-color: var(--vscode-editor-background);
  border-top: 1px solid var(--vscode-panel-border);
}

table tr:nth-child(2n) {
  background-color: var(--vscode-textCodeBlock-background);
}

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

.article-content {
  margin-top: 20px;
}

.article-content.hide-media img, .article-content.hide-media video {
  display: none;
}

.article-content.mini-media img:not(.formula) {
  width: calc(50%);
  height: auto;
}

..article-content.mini-media video {
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

/* 代码块相关样式 */
.code-lang {
  position: absolute;
  top: 0;
  right: 0;
  color: var(--vscode-descriptionForeground);
  font-size: 0.85em;
  padding: 2px 8px;
  background-color: var(--vscode-textCodeBlock-background);
  border-bottom-left-radius: 4px;
}

.code-copy-btn {
  position: absolute;
  top: 0;
  right: 40px;
  background-color: var(--vscode-button-secondaryBackground);
  color: var(--vscode-button-secondaryForeground);
  border: none;
  border-radius: 2px;
  padding: 2px 8px;
  font-size: 0.85em;
  cursor: pointer;
}

.code-copy-btn:hover {
  background-color: var(--vscode-button-secondaryHoverBackground);
}

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

/* 图片预览 */
.image-preview {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  display: none;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.image-preview img {
  max-width: 90%;
  max-height: 80%;
  object-fit: contain;
}

.image-preview-close {
  position: absolute;
  top: 20px;
  right: 20px;
  color: white;
  font-size: 30px;
  cursor: pointer;
}

/* 视频下载按钮 */
.video-download {
  display: inline-block;
  background-color: var(--vscode-button-secondaryBackground);
  color: var(--vscode-button-secondaryForeground);
  border: none;
  border-radius: 2px;
  padding: 4px 8px;
  margin: 5px 0 15px 0;
  cursor: pointer;
}

.video-download:hover {
  background-color: var(--vscode-button-secondaryHoverBackground);
}

/* 自适应调整 */
@media (max-width: 600px) {
  body {
    padding: 0 10px;
  }
  
  .navigation-buttons {
    width: 100%;
    justify-content: space-between;
  }
  
  .nav-info {
    width: 100%;
    justify-content: center;
    margin-top: 10px;
  }
}
`;