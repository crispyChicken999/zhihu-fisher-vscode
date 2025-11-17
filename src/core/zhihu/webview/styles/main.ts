/**
 * 主样式
 */
export const mainCss = `
/* 知乎阅读器主样式 */
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe WPC", "Segoe UI",
    system-ui, "Ubuntu", "Droid Sans", sans-serif;
  padding: 0 1.5em;
  margin: 0 auto;
  max-width: 800px;
  line-height: 1.6;
  color: var(--vscode-foreground);
  background-color: var(--vscode-editor-background);
  scroll-behavior: smooth;
}

/* 当样式面板可见时，隐藏body的滚动条防止滚动 */
body:has(.style-panel.visible),
body:has(.zhihu-comments-modal-overlay) {
  overflow: hidden;
}

body.immersive-mode {
  padding: 0 max(50px, 2.5em) 0 1em;
}

/* 灰色模式样式 - 只对知乎内容生效，不影响伪装界面和其他UI元素 */
html.grayscale-mode body > *:not(.disguise-code-interface):not(.style-panel):not(.style-panel-mask):not(.fisher-welcome-message):not(.comments-modal-container):not(.related-questions-modal):not(.question-detail-modal):not(.immersive-author-popover):not(.immersive-author-info) {
  filter: grayscale(100%);
}


/* 确保伪装界面在灰色模式下保持正常颜色 */
html.grayscale-mode .disguise-code-interface {
  filter: none !important;
}

/* 确保样式面板在灰色模式下保持正常颜色 */
html.grayscale-mode .style-panel,
html.grayscale-mode .style-panel-mask {
  filter: none !important;
}

html.grayscale-mode .zhihu-comments-modal-content {
  filter: grayscale(100%);
}

/* 确保欢迎消息在灰色模式下保持正常颜色 */
html.grayscale-mode .fisher-welcome-message {
  filter: none !important;
}

/* FancyBox 自定义样式 */
.fancybox__container {
  --fancybox-bg: var(--vscode-editor-background);
  --fancybox-color: var(--vscode-foreground);
}

.fancybox__backdrop {
  background: rgba(0, 0, 0, 0.8) !important;
}

.fancybox__toolbar {
  background: var(--vscode-titleBar-activeBackground) !important;
  border-bottom: 1px solid var(--vscode-panel-border) !important;
}

.fancybox__button {
  color: var(--vscode-foreground) !important;
}

.fancybox__button:hover {
  background: var(--vscode-button-hoverBackground) !important;
}

.fancybox__infobar {
  color: var(--vscode-foreground) !important;
  background: var(--vscode-statusBar-background) !important;
}

h1, h2, h3, h4, h5, h6 {
  color: var(--vscode-editor-foreground);
  margin-bottom: min(15px, 1em);
  font-weight: 600;
  line-height: 1.25;
}

h1 {
  font-size: 2em;
  margin-top: 0.67em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--vscode-panel-border);
}

h2 {
  font-size: 1.5em;
  margin-top: 0.83em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--vscode-panel-border);
}

h3 {
  font-size: 1.25em;
  margin-top: 1em;
}

h4 {
  font-size: 1.1em;
  margin-top: 1.2em;
}

h5 {
  font-size: 1em;
  margin-top: 1.5em;
}

h6 {
  font-size: 0.9em;
  margin-top: 1.75em;
}

body.immersive-mode .article-content h1,
body.immersive-mode .article-content h2,
body.immersive-mode .article-content h3,
body.immersive-mode .article-content h4,
body.immersive-mode .article-content h5,
body.immersive-mode .article-content h6 {
  font-size: 1em;
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
  scroll-behavior: smooth;
  position: relative;
}

pre code {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
}

figcaption {
  text-align: center;
  margin-top: 0.67em;
}

img {
  max-width: 100%;
  height: auto;
}

blockquote {
  padding: 0 1em;
  border-left: 0.25em solid var(--vscode-panel-border);
  margin: 0 0 16px 0;
  opacity: 0.8;
}

hr {
  height: 2px;
  padding: 0;
  margin: 12px 0;
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
`;