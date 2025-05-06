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

/* 自适应调整 */
@media (max-width: 600px) {
  body {
    padding: 0 10px;
  }
}
`;