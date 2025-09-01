/**
 * 伪装代码界面样式
 */
export const disguiseCss = `
/* 伪装代码界面主容器 */
.disguise-code-interface {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--vscode-editor-background);
  z-index: 10000;
  display: none;
  font-family: var(--vscode-editor-font-family, 'Consolas', 'Courier New', monospace);
  font-size: var(--vscode-editor-font-size, 14px);
  color: var(--vscode-editor-foreground);
  overflow: hidden;
}

/* 当伪装界面可见时，隐藏body滚动条 */
body:has(.disguise-code-interface:not([style*="display: none"])),
body:has(.disguise-code-interface[style*="display: block"]),
body.disguise-active {
  overflow: hidden !important;
}

/* 主体内容区域 */
.disguise-main-content {
  display: flex;
  height: calc(100% - 36px);
}

/* 行号区域 */
.disguise-line-numbers {
  width: 50px;
  background-color: var(--vscode-editor-background);
  border-right: 1px solid var(--vscode-panel-border);
  padding: 8px 4px 8px 8px;
  font-size: 13px;
  color: var(--vscode-editorLineNumber-foreground);
  text-align: right;
  line-height: 19px;
  user-select: none;
  overflow: hidden;
}

/* 代码内容区域 */
.disguise-code-content {
  flex: 1;
  overflow: auto;
  padding: 8px 16px;
  line-height: 19px;
  font-family: var(--vscode-editor-font-family, 'Consolas', 'Courier New', monospace);
  font-size: var(--vscode-editor-font-size, 14px);
  background-color: var(--vscode-editor-background);
}

/* 代码行样式 */
.disguise-code-line {
  line-height: 19px;
  min-height: 19px;
}

/* 行号样式 */
.disguise-line-number {
  display: block;
  height: 19px;
  line-height: 19px;
}

/* VSCode 代码高亮伪装样式 */
.mtk1  { color: var(--vscode-editor-foreground); }
.mtk2  { color: var(--vscode-editor-background); }
.mtk3  { color: var(--vscode-editorIndentGuide-activeBackground, #000080); }
.mtk4  { color: var(--vscode-editorLineNumber-activeForeground, #6a9955); }
.mtk5  { color: var(--vscode-debugTokenExpression-name, #569cd6); }
.mtk6  { color: var(--vscode-debugTokenExpression-number, #b5cea8); }
.mtk7  { color: var(--vscode-symbolIcon-colorForeground, #646695); }
.mtk8  { color: var(--vscode-editorWarning-foreground, #d7ba7d); }
.mtk9  { color: var(--vscode-debugTokenExpression-string, #9cdcfe); }
.mtk10 { color: var(--vscode-editorError-foreground, #f44747); }
.mtk11 { color: var(--vscode-debugTokenExpression-string, #ce9178); }
.mtk12 { color: var(--vscode-symbolIcon-functionForeground, #6796e6); }
.mtk13 { color: var(--vscode-editorLineNumber-foreground, #808080); }
.mtk14 { color: var(--vscode-editorError-foreground, #d16969); }
.mtk15 { color: var(--vscode-symbolIcon-functionForeground, #dcdcaa); }
.mtk16 { color: var(--vscode-symbolIcon-classForeground, #4ec9b0); }
.mtk17 { color: var(--vscode-symbolIcon-keywordForeground, #c586c0); }
.mtk18 { color: var(--vscode-symbolIcon-variableForeground, #4fc1ff); }
.mtk19 { color: var(--vscode-editorLineNumber-foreground, #c8c8c8); }
.mtk20 { color: var(--vscode-editor-foreground, #ffffff); }
.mtk21 { color: var(--vscode-editorWarning-foreground, #cd9731); }
.mtk22 { color: var(--vscode-symbolIcon-operatorForeground, #b267e6); }
.mtki  { font-style: italic; }
.mtkb  { font-weight: bold; }
.mtku  { text-decoration: underline; text-underline-position: under; }
.mtks  { text-decoration: line-through; }
.mtks.mtku { text-decoration: underline line-through; text-underline-position: under; }

.mtk1 { color: #d4d4d4; }
.mtk2 { color: #1e1e1e; }
.mtk3 { color: #000080; }
.mtk4 { color: #6a9955; }
.mtk5 { color: #569cd6; }
.mtk6 { color: #b5cea8; }
.mtk7 { color: #646695; }
.mtk8 { color: #d7ba7d; }
.mtk9 { color: #9cdcfe; }
.mtk10 { color: #f44747; }
.mtk11 { color: #ce9178; }
.mtk12 { color: #6796e6; }
.mtk13 { color: #808080; }
.mtk14 { color: #d16969; }
.mtk15 { color: #dcdcaa; }
.mtk16 { color: #4ec9b0; }
.mtk17 { color: #c586c0; }
.mtk18 { color: #4fc1ff; }
.mtk19 { color: #c8c8c8; }
.mtk20 { color: #ffffff; }
.mtk21 { color: #cd9731; }
.mtk22 { color: #b267e6; }
.mtki { font-style: italic; }
.mtkb { font-weight: bold; }
.mtku { text-decoration: underline; text-underline-position: under; }
.mtks { text-decoration: line-through; }
.mtks.mtku { text-decoration: underline line-through; text-underline-position: under; }
`;
