/**
 * 工具栏相关样式
 */
export const toolbarCss = `
/* 工具栏样式 */
.toolbar {
  display: flex;
  margin: 10px 0;
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
  padding: 5px;
  border-radius: 2px;
  cursor: pointer;
  margin-right: 0;
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.button:hover {
  background-color: var(--vscode-button-hoverBackground);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 固定工具栏 */
.fixed-toolbar {
  position: fixed;
  right: 10px;
  bottom: 10px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  height: 95vh;
  gap: 10px;
  max-height: 560px;
  flex-wrap: nowrap;
  align-items: flex-end;
}

.fixed-toolbar button {
  background-color: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  border: none;
  padding: 5px 6px;
  border-radius: 2px;
  cursor: pointer;
}

.fixed-toolbar button:hover {
  background-color: var(--vscode-button-hoverBackground);
}

#scroll-to-top {
  display: none;
}

.media-display-select {
  background-color: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  border: none;
  padding: 8px 12px;
  border-radius: 2px;
  cursor: pointer;
  appearance: auto; /* 保留下拉箭头 */
}

.media-display-select:hover {
  background-color: var(--vscode-button-hoverBackground);
}

.media-display-select:focus {
  outline: 1px solid var(--vscode-focusBorder);
}

.media-display-select option {
  background-color: var(--vscode-dropdown-background);
  color: var(--vscode-dropdown-foreground);
}

/* 沉浸模式相关样式 */
/* 沉浸模式下隐藏相关元素 */
body.immersive-mode .author-info,
body.immersive-mode .article-meta,
body.immersive-mode .toolbar,
body.immersive-mode .zhihu-load-comments-btn,
body.immersive-mode .zhihu-expand-comments-btn,
body.immersive-mode .zhihu-comments-tips,
body.immersive-mode .navigation .navigation-buttons {
  display: none !important;
}

/* 正常模式下：隐藏第二个 answer-meta（文章内容后的） */
body:not(.immersive-mode) .article-content + .answer-meta {
}

/* 沉浸模式下：隐藏第一个 answer-meta（文章内容前的），显示第二个 */
body.immersive-mode header + * + .answer-meta {
}

/* 沉浸模式下保持显示的元素（第二个 answer-meta） */
body.immersive-mode .article-content + .answer-meta {
  display: flex !important;
  justify-content: center;
  padding: 0;
  margin: 10px 0;
  background: none;
  border-radius: 0px;
  max-width: fit-content;
  font-size: 0.9em;
  gap: 10px;
}

/* 沉浸模式下的 meta-item 样式优化 */
body.immersive-mode .answer-meta .meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
  color: var(--vscode-descriptionForeground);
}
body.immersive-mode .answer-meta .vote-buttons svg,
body.immersive-mode .answer-meta .meta-item svg {
  opacity: 1;
  width: 15px;
  height: 15px;
  filter: grayscale(100%);
}

body.immersive-mode .navigation {
  justify-content: center;
}

body.immersive-mode .comments-modal-container + .navigation {
  display: none !important;
}

/* 固定工具栏中的沉浸模式按钮 */
.immersive-button {
  display: none; /* 默认隐藏 */
}

body.immersive-mode .immersive-button {
  display: flex; /* 沉浸模式下显示 */
}

/* 基础按钮 - 始终显示 */
.toolbar-essential {
  display: flex;
}

/* 切换按钮 */
.toolbar-toggle {
  display: flex;
  background-color: var(--vscode-button-background);
  border: 1px solid var(--vscode-button-border, transparent);
}

.toolbar-toggle:hover {
  background-color: var(--vscode-button-hoverBackground);
}

.toolbar-toggle.expanded {
  background-color: var(--vscode-button-secondaryBackground);
}

/* 可展开的工具栏容器 */
.toolbar-expandable {
  display: none;
  flex-direction: column;
  gap: 10px;
  max-height: 0;
  opacity: 0;
  pointer-events: none;
}

.toolbar-expandable.expanded {
  max-height: 600px;
  opacity: 1;
  pointer-events: auto;
  display: flex;
}

/* 可展开按钮项 */
.toolbar-expandable-item {
  display: flex;
  position: relative;
}

/* 按钮关闭功能 */
.toolbar-expandable-item .button-close {
  position: absolute;
  top: -9px;
  right: -6px;
  width: 16px;
  height: 16px;
  background-color: var(--vscode-errorForeground);
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  opacity: 0;
  border: 1px solid var(--vscode-activityBarTop-activeBorder, transparent);
  transition: all 0.3s;
}

.toolbar-expandable-item:hover .button-close {
  display: flex;
  top: -6px;
  opacity: 1;
}

.button-close:hover {
  background-color: var(--vscode-errorHoverBackground, #f14c4c);
}

.button-close svg {
  width: 8px;
  height: 8px;
  color: white;
}

/* 沉浸模式下的工具栏按钮 */
.toolbar-config-item label{
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border: 1px solid var(--vscode-panel-border);
  border-radius: 6px;
  margin-bottom: 6px;
  background: var(--vscode-editor-background);
  transition: all 0.2s ease;
  cursor: pointer;
}

.toolbar-config-item:hover .drag-handle {
  background: var(--vscode-button-hoverBackground);
  border-radius: 4px;
}

.toolbar-config-item:hover label {
  background: var(--vscode-list-hoverBackground);
  border-color: var(--vscode-focusBorder);
}

/* 非沉浸模式下隐藏固定工具栏的展开按钮和扩展项 */
body:not(.immersive-mode) .toolbar-toggle,
body:not(.immersive-mode) .toolbar-expandable-item {
  display: none !important;
}

body.immersive-mode .toolbar-toggle {
  display: flex;
}

body.immersive-mode .toolbar-expandable-item {
  display: flex;
}

/* 作者信息悬浮提示 */
.author-tooltip {
  position: fixed;
  max-width: 300px;
  background-color: var(--vscode-editor-background);
  border: 1px solid var(--vscode-panel-border);
  border-radius: 4px;
  padding: 10px;
  z-index: 1200;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: none;
}

.meta-tooltip {
  position: fixed;
  max-width: 300px;
  background-color: var(--vscode-editor-background);
  border: 1px solid var(--vscode-panel-border);
  border-radius: 4px;
  padding: 10px;
  z-index: 1200;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: none;
}

/* 优化沉浸阅读体验 */
body.immersive-mode .article-content {
  margin: 0 auto;
}

body.immersive-mode .comments-container {
  margin: 0 auto;
}


/* 工具栏按钮悬停效果 */
/* tooltip样式 */
[tooltip] {
  position: relative;
}

[tooltip]::after {
  display: none;
  content: attr(tooltip);
  position: absolute;
  text-align: left;
  white-space: pre;
  font-size: 12px;
  padding: 8px 15px;
  border-radius: 4px;
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.4);
  z-index: 100;
}

[tooltip]::before {
  display: none;
  content: '';
  position: absolute;
  border: 5px solid transparent;
  border-bottom-width: 0;
  z-index: 100;
}

[tooltip]:hover::after {
  display: block;
}

[tooltip]:hover::before {
  display: block;
}

[tooltip][placement^="top"]::after, [tooltip][placement^="top"]::before {
  animation: anime-top 300ms ease-out forwards;
}

[tooltip][placement^="right"]::after, [tooltip][placement^="right"]::before {
  animation: anime-right 300ms ease-out forwards;
}

[tooltip][placement^="bottom"]::after, [tooltip][placement^="bottom"]::before {
  animation: anime-bottom 300ms ease-out forwards;
}

[tooltip][placement^="left"]::after, [tooltip][placement^="left"]::before {
  animation: anime-left 300ms ease-out forwards;
}

/* 气泡主题 */
.tooltip-theme-dark, [tooltip]::after {
  color: #fff;
  background-color: #313131;
}

.tooltip-theme-light, [tooltip][effect="light"]::after {
  color: #313131;
  background-color: #fff;
  border: 1px solid #313131;
}

/* 气泡位置 */
/*----上----*/
.tooltip-placement-top, [tooltip]:not([placement])::after, [tooltip][placement=""]::after, [tooltip][placement="top"]::after {
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translate(-50%, 0);
}

.tooltip-placement-top-right, [tooltip][placement="top-right"]::after {
  bottom: calc(100% + 10px);
  left: 100%;
  transform: translate(-100%, 0);
}

.tooltip-placement-top-left, [tooltip][placement="top-left"]::after {
  bottom: calc(100% + 10px);
  left: 0;
  transform: translate(0, 0);
}

/*----右----*/
.tooltip-placement-right, [tooltip][placement="right"]::after {
  left: calc(100% + 10px);
  top: 50%;
  transform: translate(0, -50%);
}

.tooltip-placement-right-top, [tooltip][placement="right-top"]::after {
  left: calc(100% + 10px);
  top: 0;
  transform: translate(0, 0);
}

.tooltip-placement-right-bottom, [tooltip][placement="right-bottom"]::after {
  left: calc(100% + 10px);
  top: 100%;
  transform: translate(0, -100%);
}

/*----下----*/
.tooltip-placement-bottom, [tooltip][placement="bottom"]::after {
  top: calc(100% + 10px);
  left: 50%;
  transform: translate(-50%, 0);
}

.tooltip-placement-bottom-right, [tooltip][placement="bottom-right"]::after {
  top: calc(100% + 10px);
  left: 100%;
  transform: translate(-100%, 0);
}

.tooltip-placement-bottom-left, [tooltip][placement="bottom-left"]::after {
  top: calc(100% + 10px);
  left: 0;
  transform: translate(0, 0);
}

/*----左----*/
.tooltip-placement-left, [tooltip][placement="left"]::after {
  right: calc(100% + 10px);
  top: 50%;
  transform: translate(0, -50%);
}

.tooltip-placement-left-top, [tooltip][placement="left-top"]::after {
  right: calc(100% + 10px);
  top: 0;
  transform: translate(0, 0);
}

.tooltip-placement-left-bottom, [tooltip][placement="left-bottom"]::after {
  right: calc(100% + 10px);
  top: 100%;
  transform: translate(0, -100%);
}

/* 三角形主题 */
.triangle-theme-dark, [tooltip]::before {
  border-top-color: #313131;
}

.triangle-theme-light, [tooltip][effect="light"]::before {
  border-top-color: #313131;
}

/* 三角形位置 */
/*----上----*/
.triangle-placement-top, [tooltip]:not([placement])::before, [tooltip][placement=""]::before, [tooltip][placement="top"]::before {
  bottom: calc(100% + 5px);
  left: 50%;
  transform: translate(-50%, 0);
}

.triangle-placement-top-left, [tooltip][placement="top-left"]::before {
  bottom: calc(100% + 5px);
  left: 10px;
}

.triangle-placement-top-right, [tooltip][placement="top-right"]::before {
  bottom: calc(100% + 5px);
  right: 10px;
}

/*----右----*/
.triangle-placement-right, [tooltip][placement="right"]::before, .triangle-placement-right-top, [tooltip][placement="right-top"]::before, .triangle-placement-right-bottom, [tooltip][placement="right-bottom"]::before {
  left: calc(100% + 3px);
  top: 50%;
  transform: translate(0, -50%) rotateZ(90deg);
}

.triangle-placement-right-top, [tooltip][placement="right-top"]::before {
  top: 10px;
}

.triangle-placement-right-bottom, [tooltip][placement="right-bottom"]::before {
  bottom: 10px;
  top: auto;
  transform: translate(0, 0) rotateZ(90deg);
}

/*----下----*/
.triangle-placement-bottom, [tooltip][placement="bottom"]::before, .triangle-placement-bottom-left, [tooltip][placement="bottom-left"]::before, .triangle-placement-bottom-right, [tooltip][placement="bottom-right"]::before {
  top: calc(100% + 5px);
  left: 50%;
  transform: translate(-50%, 0) rotateZ(180deg);
}

.triangle-placement-bottom-left, [tooltip][placement="bottom-left"]::before {
  transform: translate(0, 0) rotateZ(180deg);
  left: 10px;
}

.triangle-placement-bottom-right, [tooltip][placement="bottom-right"]::before {
  right: 10px;
  left: auto;
}

/*----左----*/
.triangle-placement-left, [tooltip][placement="left"]::before, .triangle-placement-left-top, [tooltip][placement="left-top"]::before, .triangle-placement-left-bottom, [tooltip][placement="left-bottom"]::before {
  right: calc(100% + 3px);
  top: 50%;
  transform: translate(0, -50%) rotateZ(270deg);
}

.triangle-placement-left-top, [tooltip][placement="left-top"]::before {
  top: 10px;
}

.triangle-placement-left-bottom, [tooltip][placement="left-bottom"]::before {
  bottom: 10px;
  top: auto;
  transform: translate(0, 0) rotateZ(270deg);
}

@keyframes anime-top {
  from {
    opacity: .5;
    bottom: 150%;
  }
}

@keyframes anime-bottom {
  from {
    opacity: .5;
    top: 150%;
  }
}

@keyframes anime-left {
  from {
    opacity: .5;
    right: 150%;
  }
}

@keyframes anime-right {
  from {
    opacity: .5;
    left: 150%;
  }
}

`;
