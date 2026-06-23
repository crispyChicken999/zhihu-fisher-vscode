/**
 * 媒体相关样式
 */
export const mediaCss = `
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

figure {
  text-align: center;
}

/* 媒体占位符 - 默认隐藏（normal/mini模式下不显示），hide-media模式下显示 */
.media-placeholder {
  display: none;
}

/* hide-media模式下显示占位符 */
.hide-media .media-placeholder-image,
.hide-media .media-placeholder-gif,
.hide-media .media-placeholder-video {
  display: inline-block;
}

.hide-media .media-placeholder-emoji {
  display: inline;
}

/* 占位符视觉样式（仅在hide-media模式可见时生效） */
.media-placeholder-image {
  padding: 2px 0px;
  color: var(--vscode-textLink-foreground);
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
  text-underline-offset: 2px;
  transition: all 0.3s;
  position: relative;
}

.media-placeholder-image:hover {
  background-color: var(--vscode-editor-selectionBackground);
  text-decoration: underline;
  padding: 2px 5px;
}

.media-placeholder-gif {
  padding: 2px 0px;
  color: var(--vscode-textLink-foreground);
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
  text-underline-offset: 2px;
  transition: all 0.3s;
  position: relative;
  margin: 0 2px;
}

.media-placeholder-gif:hover {
  background-color: var(--vscode-editor-selectionBackground);
  text-decoration: underline;
  padding: 2px 5px;
}

.media-placeholder-video {
  padding: 2px 0px;
  color: var(--vscode-textLink-foreground);
  border-radius: 3px;
  font-size: 12px;
  margin: 2px;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s;
  text-underline-offset: 2px;
}

.media-placeholder-video:hover {
  color: var(--vscode-textLink-activeForeground);
  background-color: var(--vscode-editor-selectionBackground);
  text-decoration: underline;
  padding: 2px 5px;
}

.media-placeholder-emoji {
  color: var(--vscode-descriptionForeground);
  font-size: inherit;
  cursor: default;
  padding: 0 1px;
  transition: all 0.3s;
}

.media-placeholder-emoji:hover {
  color: var(--vscode-textLink-activeForeground);
}

/* hide-media模式下隐藏不适内容图片的遮罩层和真实图片 */
.hide-media .uncomfortable-image-container .image-mask,
.hide-media .uncomfortable-image-container .real-image {
  display: none !important;
}

/* hide-media模式下隐藏评论媒体容器（与.comments-container.hide-media规则保持一致） */
.comments-modal-container.hide-media .comment-image-container,
.comments-modal-container.hide-media .comment-gif-container,
.comments-modal-container.hide-media .comment-sticker-container,
.comments-modal-container.hide-media .comment-text-emoji {
  display: none !important;
}

/* 媒体占位符缩略图弹窗 */
.media-placeholder-popup {
  position: fixed;
  z-index: 9999;
  opacity: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: auto;
  transform: translateY(4px);
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.media-placeholder-popup.visible {
  opacity: 1;
  transform: translateY(0);
}

.media-placeholder-popup img {
  border-radius: 4px;
  border: 2px solid var(--vscode-panel-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  background-color: var(--vscode-editor-background);
  display: block;
  cursor: pointer;
  order: 1;
}

.media-placeholder-popup video {
  border-radius: 4px;
  border: 2px solid var(--vscode-panel-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  background-color: #000;
  display: block;
  cursor: pointer;
  order: 1;
}

.media-placeholder-popup-caption {
  order: 2;
  padding: 2px 6px;
  font-size: 11px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.75);
  border-radius: 3px;
  line-height: 1.6;
  white-space: nowrap;
  pointer-events: none;
  margin-top: 4px;
}

/* popup 出现在 placeholder 上方时，caption 切换到图片/视频上方 */
.media-placeholder-popup.caption-on-top .media-placeholder-popup-caption {
  order: 0;
  margin-top: 0;
  margin-bottom: 4px;
}
`;