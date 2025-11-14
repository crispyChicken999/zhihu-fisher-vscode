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
  padding: 4px 0px;
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
  text-decoration: underline;
  padding: 4px 8px;
}

.immersive-author-trigger:hover svg {
  opacity: 1;
}

.immersive-author-popover {
  display: none;
  position: absolute;
  bottom: calc(100% + 4px);
  left: 0;
  padding: 12px;
  background-color: var(--vscode-editor-background);
  border: 1px solid var(--vscode-panel-border);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  min-width: 280px;
  max-width: 400px;
  white-space: normal;
}

.immersive-author-popover.show {
  display: block;
}

.immersive-author-popover .author-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.immersive-author-popover .author-popover-avatar {
  width: 3em;
  height: 3em;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

/* Mini模式下的头像 - 缩小尺寸 */
.immersive-author-popover .author-popover-avatar.mini-media {
  width: 2em;
  height: 2em;
}

/* 隐藏图片模式 - 完全隐藏头像 */
.immersive-author-popover .author-popover-avatar.hide-media {
  display: none;
}

.immersive-author-popover .author-info-text {
  flex-grow: 1;
}

.immersive-author-popover .author-popover-name {
  font-size: 1.2em;
  font-weight: 600;
  color: var(--vscode-foreground);
}

.immersive-author-popover .author-bio-text {
  font-size: 1em;
  color: var(--vscode-descriptionForeground);
  line-height: 1.4;
  margin-bottom: 10px;
}

.immersive-author-popover .author-follow-btn {
  width: 100%;
  justify-content: center;
}
`;