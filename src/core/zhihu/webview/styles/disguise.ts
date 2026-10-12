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
  opacity: 0;
  transition: opacity 0.3s ease-out;
}

/* 显示状态 */
.disguise-code-interface.show {
  opacity: 1;
}

/* 隐藏动画状态 */
.disguise-code-interface.hiding {
  opacity: 0;
}

/* Fisher 欢迎消息 */
.fisher-welcome-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--vscode-notifications-background);
  color: var(--vscode-notifications-foreground);
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: normal;
  font-family: var(--vscode-font-family);
  border: 1px solid var(--vscode-notifications-border);
  box-shadow: 0 2px 8px var(--vscode-widget-shadow);
  z-index: 10001;
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
  transition: all 0.3s ease;
  pointer-events: none;
}

.fisher-welcome-message.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.fisher-welcome-message.hide {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}

/* 当伪装界面可见时，隐藏body滚动条 */
body:has(.disguise-code-interface:not([style*="display: none"])),
body:has(.disguise-code-interface[style*="display: block"]),
body.disguise-active {
  overflow: hidden !important;
}

/* 主体内容区域 - 使用CSS Grid布局 */
.disguise-main-content {
  display: grid;
  grid-template-columns: 50px 1fr;
  height: calc(100%);
  overflow: auto;
  scroll-behavior: smooth;
  position: relative;
  background-color: var(--vscode-editor-background);
}

/* 行号区域 - 使用grid布局确保与代码行对齐 */
.disguise-line-numbers {
  grid-column: 1;
  background-color: var(--vscode-editor-background);
  padding: 8px 4px 8px 8px;
  font-size: 13px;
  color: var(--vscode-editorLineNumber-foreground);
  text-align: right;
  line-height: 19px;
  user-select: none;
  position: relative;
  border-right: 1px solid var(--vscode-panel-border);
  display: flex;
  flex-direction: column;
}

/* 代码内容区域 */
.disguise-code-content {
  grid-column: 2;
  padding: 8px 16px;
  line-height: 19px;
  font-family: var(--vscode-editor-font-family, 'Consolas', 'Courier New', monospace);
  font-size: var(--vscode-editor-font-size, 14px);
  background-color: var(--vscode-editor-background);
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  display: flex;
  flex-direction: column;
}

/* 代码行容器样式 - 使用CSS Grid实现行号与代码的对齐 */
.disguise-code-line-container {
  display: contents; /* 让子元素直接参与父级grid布局 */
}

/* 代码行样式 */
.disguise-code-line {
  line-height: 19px;
  min-height: 19px;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  /* 使用CSS计数器和伪元素实现换行时的空行号 */
}

/* 行号样式 */
.disguise-line-number {
  display: flex;
  align-items: flex-start;
  height: auto;
  min-height: 19px;
  line-height: 19px;
  padding-top: 0;
}

/* 纯CSS解决方案：为换行的代码创建对应的空行号空间 */
.disguise-code-line {
  /* 当内容换行时，创建相应的视觉空间 */
  position: relative;
}

/* 使用CSS grid创建完美的行号对齐 */
.disguise-main-content {
  /* 重新定义以支持动态行高 */
  display: block;
  height: calc(100%);
  overflow: auto;
  scroll-behavior: smooth;
  position: relative;
}

.disguise-line-numbers,
.disguise-code-content {
  float: left;
}

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
  box-sizing: border-box;
}

.disguise-code-content {
  width: calc(100% - 50px);
  padding: 8px 16px;
  line-height: 19px;
  font-family: var(--vscode-editor-font-family, 'Consolas', 'Courier New', monospace);
  font-size: var(--vscode-editor-font-size, 14px);
  background-color: var(--vscode-editor-background);
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  box-sizing: border-box;
}

/* 清除浮动 */
.disguise-main-content::after {
  content: "";
  display: table;
  clear: both;
}
.disguise-line-number {
  display: block;
  height: 19px;
  line-height: 19px;
  min-height: 19px;
  position: relative;
}

/* 当行号对应换行代码时的空行号样式 */
.disguise-line-number.wrapped-line {
  color: transparent;
}

/* 代码行换行后的行号占位 */
.disguise-line-number.line-continuation::before {
  content: '';
  display: block;
  width: 100%;
  height: 19px;
}

/* ==================================================================
 * VSCode 代码高亮伪装样式（令牌色 / .mtk*）
 *
 * 这里只是「兜底调色板」：按 VS Code 注入到 webview <body> 上的主题类名
 * （vscode-dark / vscode-light / vscode-high-contrast / vscode-high-contrast-light）
 * 切换。色值取自 VS Code 内置主题（Dark+ / Light+ / HC Black / HC Light）的 tokenColors。
 *
 * 正常运行时会由扩展侧解析「当前主题真实令牌色」生成的 CSS 覆盖
 * （见 src/core/utils/theme-token-colors.ts，选择器形如 #disguise-code-interface .mtkN，
 *  id 选择器优先级高于本文件的类选择器，所以不用 !important）。
 *
 * 主题类名是 VS Code 自己维护的：切主题时会实时增删 body 上的 vscode-* 类，
 * 所以这份兜底样式同样不需要任何 JS 就能跟着主题变。
 * ================================================================== */
/* 深色（默认；Dark+ / Dark Modern / Dark 2026 系） */
.mtk1  { color: #d4d4d4; }  /* 普通文本 / 标点 */
.mtk2  { color: #1e1e1e; }  /* 背景色（极少用） */
.mtk3  { color: #000080; }
.mtk4  { color: #6a9955; }  /* 注释 */
.mtk5  { color: #569cd6; }  /* 关键字 */
.mtk6  { color: #b5cea8; }  /* 数字 / 常量 */
.mtk7  { color: #646695; }
.mtk8  { color: #569cd6; }  /* 字面量（ERROR 等） */
.mtk9  { color: #9cdcfe; }  /* 变量 / 标识符 */
.mtk10 { color: #b5cea8; }  /* 数字字面量 */
.mtk11 { color: #ce9178; }  /* 字符串 */
.mtk12 { color: #808080; }  /* CSS 选择符标点（. #） */
.mtk13 { color: #d7ba7d; }  /* CSS 类名 / id */
.mtk14 { color: #9cdcfe; }  /* CSS 属性名 */
.mtk15 { color: #dcdcaa; }  /* 函数 / 方法名 */
.mtk16 { color: #4ec9b0; }  /* 类型 / 类名 */
.mtk17 { color: #c586c0; }  /* 预处理 / 注解（@Override #include @media） */
.mtk18 { color: #569cd6; }  /* 标签名（HTML/XML） */
.mtk19 { color: #9cdcfe; }  /* 属性名 */
.mtk20 { color: #9cdcfe; }  /* JSON 键 */
.mtk21 { color: #569cd6; }  /* Markdown 强调 */
.mtk22 { color: #b267e6; }
.mtki  { font-style: italic; }
.mtkb  { font-weight: bold; }
.mtku  { text-decoration: underline; text-underline-position: under; }
.mtks  { text-decoration: line-through; }
.mtks.mtku { text-decoration: underline line-through; text-underline-position: under; }

/* 浅色（Light+ / Light Modern / Light 2026 系） */
.vscode-light .mtk1  { color: #000000; }
.vscode-light .mtk2  { color: #ffffff; }
.vscode-light .mtk3  { color: #000080; }
.vscode-light .mtk4  { color: #008000; }
.vscode-light .mtk5  { color: #0000ff; }
.vscode-light .mtk6  { color: #098658; }
.vscode-light .mtk7  { color: #646695; }
.vscode-light .mtk8  { color: #0000ff; }
.vscode-light .mtk9  { color: #001080; }
.vscode-light .mtk10 { color: #098658; }
.vscode-light .mtk11 { color: #a31515; }
.vscode-light .mtk12 { color: #800000; }
.vscode-light .mtk13 { color: #800000; }
.vscode-light .mtk14 { color: #e50000; }
.vscode-light .mtk15 { color: #795e26; }
.vscode-light .mtk16 { color: #267f99; }
.vscode-light .mtk17 { color: #af00db; }
.vscode-light .mtk18 { color: #800000; }
.vscode-light .mtk19 { color: #e50000; }
.vscode-light .mtk20 { color: #0451a5; }
.vscode-light .mtk21 { color: #000080; }
.vscode-light .mtk22 { color: #b267e6; }

/* 高对比深色（Default High Contrast） */
.vscode-high-contrast .mtk1  { color: #ffffff; }
.vscode-high-contrast .mtk2  { color: #000000; }
.vscode-high-contrast .mtk3  { color: #000080; }
.vscode-high-contrast .mtk4  { color: #7ca668; }
.vscode-high-contrast .mtk5  { color: #569cd6; }
.vscode-high-contrast .mtk6  { color: #b5cea8; }
.vscode-high-contrast .mtk7  { color: #646695; }
.vscode-high-contrast .mtk8  { color: #569cd6; }
.vscode-high-contrast .mtk9  { color: #9cdcfe; }
.vscode-high-contrast .mtk10 { color: #b5cea8; }
.vscode-high-contrast .mtk11 { color: #ce9178; }
.vscode-high-contrast .mtk12 { color: #808080; }
.vscode-high-contrast .mtk13 { color: #d7ba7d; }
.vscode-high-contrast .mtk14 { color: #d4d4d4; }
.vscode-high-contrast .mtk15 { color: #dcdcaa; }
.vscode-high-contrast .mtk16 { color: #4ec9b0; }
.vscode-high-contrast .mtk17 { color: #569cd6; }
.vscode-high-contrast .mtk18 { color: #569cd6; }
.vscode-high-contrast .mtk19 { color: #9cdcfe; }
.vscode-high-contrast .mtk20 { color: #9cdcfe; }
.vscode-high-contrast .mtk21 { color: #ffffff; }
.vscode-high-contrast .mtk22 { color: #b267e6; }

/* 高对比浅色（Default High Contrast Light）
   注意：VS Code 对 hc-light 会同时挂 vscode-high-contrast-light 和
   vscode-high-contrast 两个类名（向后兼容），所以这段必须放在上一段之后 */
.vscode-high-contrast-light .mtk1  { color: #292929; }
.vscode-high-contrast-light .mtk2  { color: #ffffff; }
.vscode-high-contrast-light .mtk3  { color: #000080; }
.vscode-high-contrast-light .mtk4  { color: #515151; }
.vscode-high-contrast-light .mtk5  { color: #0f4a85; }
.vscode-high-contrast-light .mtk6  { color: #096d48; }
.vscode-high-contrast-light .mtk7  { color: #646695; }
.vscode-high-contrast-light .mtk8  { color: #0f4a85; }
.vscode-high-contrast-light .mtk9  { color: #001080; }
.vscode-high-contrast-light .mtk10 { color: #096d48; }
.vscode-high-contrast-light .mtk11 { color: #0f4a85; }
.vscode-high-contrast-light .mtk12 { color: #0f4a85; }
.vscode-high-contrast-light .mtk13 { color: #0f4a85; }
.vscode-high-contrast-light .mtk14 { color: #264f78; }
.vscode-high-contrast-light .mtk15 { color: #5e2cbc; }
.vscode-high-contrast-light .mtk16 { color: #185e73; }
.vscode-high-contrast-light .mtk17 { color: #b5200d; }
.vscode-high-contrast-light .mtk18 { color: #0f4a85; }
.vscode-high-contrast-light .mtk19 { color: #264f78; }
.vscode-high-contrast-light .mtk20 { color: #0451a5; }
.vscode-high-contrast-light .mtk21 { color: #000080; }
.vscode-high-contrast-light .mtk22 { color: #b267e6; }
`;
