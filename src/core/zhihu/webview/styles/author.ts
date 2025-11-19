/**
 * 作者信息相关样式
 */
export const authorCss = `
/* 作者信息样式 */
.author-info {
  display: flex;
  align-items: center;
  margin: 1em 0;
  padding: min(1em, 10px);
  border-radius: 4px;
  background-color: var(--vscode-editor-inactiveSelectionBackground);
  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px,
    rgba(0, 0, 0, 0.3) 0px 7px 13px -3px,
    rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
}

.author-avatar {
  margin-right: 15px;
  flex-shrink: 0;
}

.author-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  transition: all 0.3s ease;
}

.author-avatar img:hover {
  filter: brightness(1.1) saturate(1.1);
  transform: scale(1.05) translateY(-2px);
}

.author-details {
  flex-grow: 1;
}

.author-name {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
}

.author-name .author-fans {
  color: var(--vscode-descriptionForeground);
  display: flex;
  align-items: center;
}

.author-bio {
  font-size: 1em;
  margin-top: 4px;
  color: var(--vscode-descriptionForeground);
}

.author-link {
  cursor: pointer;
  color: var(--vscode-textLink-foreground);
}

.author-link:hover {
  text-decoration: underline;
}

/* 关注按钮样式 */
.author-follow-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background-color: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 500;
  transition: transform 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
  position: relative;
}

.author-follow-btn .follow-text {
  transition: opacity 0.2s ease;
}

/* 未关注状态 - hover显示"立即关注" */
.author-follow-btn[data-is-following="false"]:hover .follow-text::before {
  content: "立即";
}

/* 已关注状态 - hover时文字变为"取消关注" */
.author-follow-btn[data-is-following="true"]:hover .follow-text {
  opacity: 0;
}

.author-follow-btn[data-is-following="true"]:hover::after {
  content: "取消关注";
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  white-space: nowrap;
}

.author-follow-btn:hover {
  background-color: var(--vscode-button-hoverBackground);
  transform: translateY(-1px);
}

.author-follow-btn:active {
  transform: translateY(0);
}

.author-follow-btn[data-is-following="true"] {
  background-color: var(--vscode-button-secondaryBackground);
  color: var(--vscode-button-secondaryForeground);
}

.author-follow-btn[data-is-following="true"] svg {
  display: none;
}

.author-follow-btn[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 沉浸模式下的作者信息悬浮窗 */
.immersive-author-info {
  display: none;
  position: relative;
}

/* 仅在沉浸模式下的 answer-meta 中显示 */
body.immersive-mode .answer-meta .immersive-author-info {
  display: inline-flex;
  align-items: center;
}

.immersive-author-trigger {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: inherit;
  cursor: pointer;
  font-weight: 500;
  padding: 0px;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 1em;
  white-space: nowrap;
}

.immersive-author-trigger svg {
  flex-shrink: 0;
  opacity: 0.8;
}

.immersive-author-trigger:hover {
  background-color: var(--vscode-list-hoverBackground);
  padding: 0px 4px;
}

.immersive-author-trigger:hover svg {
  opacity: 1;
}

/* Popover 容器 - Fixed 全屏 */
.immersive-author-popover {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  justify-content: center;
  align-items: center;
}

.immersive-author-popover.show {
  display: flex;
}

/* 遮罩层 */
.immersive-author-popover .popover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  z-index: 1;
}

/* 主体内容 */
.immersive-author-popover .popover-content-wrapper {
  position: relative;
  z-index: 2;
  background-color: var(--vscode-editor-background);
  border: 1px solid var(--vscode-panel-border);
  border-radius: 8px;
  box-shadow: 0 4px 20px var(--vscode-scrollbar-shadow);
  width: 90%;
  max-width: 450px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: popoverFadeIn 0.2s ease-out;
}

@keyframes popoverFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 标题栏 */
.immersive-author-popover .popover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75em 1em;
  border-bottom: 1px solid var(--vscode-panel-border);
  background-color: var(--vscode-editor-background);
}

.immersive-author-popover .popover-header h3 {
  margin: 0;
  font-size: min(1.25em, 16px);
  font-weight: 700;
  color: var(--vscode-foreground);
}

.immersive-author-popover .popover-close {
  background: transparent;
  border: none;
  font-size: 20px;
  line-height: 1;
  color: var(--vscode-foreground);
  cursor: pointer;
  padding: 0px 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.immersive-author-popover .popover-close:hover {
  background: var(--vscode-button-secondaryBackground);
  color: var(--vscode-button-foreground);
}

/* 内容区域 */
.immersive-author-popover .popover-body {
  padding: 1em;
  overflow-y: auto;
  background-color: var(--vscode-editor-background);
}

.immersive-author-popover .popover-content-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

/* 左侧信息 */
.immersive-author-popover .author-info-left {
  flex-grow: 1;
  min-width: 0; /* 防止flex子项溢出 */
}

.immersive-author-popover .author-basic-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.immersive-author-popover .author-popover-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid var(--vscode-editor-background);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.immersive-author-popover .author-popover-avatar.mini-media {
  width: 32px;
  height: 32px;
}

.immersive-author-popover .author-popover-avatar.hide-media {
  display: none;
}

.immersive-author-popover .author-text-info {
  flex-grow: 1;
  min-width: 0;
}

.immersive-author-popover .author-popover-name {
  font-size: 1.1em;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.immersive-author-popover .author-bio-text {
  font-size: 0.9em;
  color: var(--vscode-descriptionForeground);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 右侧按钮 */
.immersive-author-popover .author-info-right {
  flex-shrink: 0;
}

.immersive-author-popover .author-follow-btn {
  width: auto;
  min-width: 80px;
  justify-content: center;
}
`;