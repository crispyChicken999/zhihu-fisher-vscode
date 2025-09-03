export const commentsCss = `
/* 评论容器样式 */
.zhihu-comments-container {
  margin: 10px 0;
  border-top: 1px solid var(--vscode-panel-border);
}

.comments-container:has(.zhihu-expand-comments-btn),
.comments-container:has(.zhihu-load-comments-btn) {
  display: inline-flex;
  vertical-align: top;
}

.zhihu-comments-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  margin: 10px 0;
}

.zhihu-comments-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.zhihu-comments-header .zhihu-comments-tips {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  font-size: 1em;
  color: var(--vscode-descriptionForeground);
  background-color: var(--vscode-editor-background);
}

/* 加载评论按钮 */
.zhihu-load-comments-btn,
.zhihu-reload-comments-btn,
.zhihu-expand-comments-btn {
  background-color: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  border: none;
  border-radius: 2px;
  padding: 3.5px 7px;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.zhihu-load-comments-btn:hover,
.zhihu-reload-comments-btn:hover,
.zhihu-expand-comments-btn:hover {
  background-color: var(--vscode-button-hoverBackground);
}

/* 评论加载中样式 */
.zhihu-comments-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  color: var(--vscode-descriptionForeground);
}

.zhihu-comments-loading-spinner {
  width: 25px;
  height: 25px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--vscode-button-background);
  border-radius: 50%;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 评论列表样式 */
.zhihu-comments-list {
  display: flex;
  flex-direction: column;
  gap: 1em;
  overflow-y: auto;
  scroll-behavior: smooth;
  max-height: 70vh;
  padding-right: 10px;.
}

.zhihu-comments-list:focus,
.zhihu-comments-list:focus-visible {
  outline: none;
}

/* 单个评论样式 - 使用与文章相同的背景 */
.zhihu-comment {
  padding: 1em;
  border-radius: max(0.33em, 4px);
  transition: background-color 0.2s;
  border: 1px solid var(--vscode-panel-border);
  background-color: var(--vscode-editor-background);
  transition: box-shadow 0.3s, border-color 0.3s;
}

.zhihu-comment:last-child {
  margin-bottom: 10px;
}

.zhihu-comments-modal-child-comments .zhihu-comment:last-child {
  margin-bottom: 0;
}

.zhihu-comment:hover {
  border-color: var(--vscode-commandCenter-activeBorder);
  box-shadow: inset 0px 0px 1em 0px var(--vscode-commandCenter-activeBorder);
}

/* 评论头部：头像和作者信息 */
.zhihu-comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.67em;
}

.zhihu-comment-avatar {
  width: 2.5em;
  height: 2.5em;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  margin-right: 0.67em;
}

.zhihu-comment-author {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 100%;
}

.comments-container .zhihu-comment-author {
  max-width: calc(100% - 2.5em - 0.67em);
}

.comments-container.mini-media .zhihu-comment-author {
  max-width: calc(100% - 2em - 0.67em);
}

.zhihu-comment-author-name {
  width: fit-content;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  display: flex;
  align-items: center;
}

.zhihu-comment-author-name a {
  color: var(--vscode-textLink-foreground);
  text-decoration: none;
}

.zhihu-comment-author-name a:hover {
  text-decoration: underline;
}

.zhihu-comment-author-headline {
  color: var(--vscode-descriptionForeground);
  line-height: 1.2;
  opacity: 0.5;
  font-size: 0.8em;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  flex: 1;
  align-self: flex-end;
  margin-left: 0.67em;
}

/* 评论内容样式 */
.zhihu-comment-content {
  margin-bottom: 0.67em;
  overflow-wrap: break-word;
  word-break: break-all;
}

/* 评论内容中的图片和视频样式 */
.zhihu-comment-content img,
.zhihu-comment-content video {
  max-width: 100%;
  border-radius: 4px;
}

/* 媒体模式应用到评论内容 */
.comments-container.hide-media img,
.comments-container.hide-media video,
.comments-container.hide-media .comment-gif-container,
.comments-container.hide-media .comment-sticker-container,
.comments-container.hide-media .comment-text-emoji,
.comments-container.hide-media .comment-image-container,
.comments-modal-container.hide-media video,
.comments-modal-container.hide-media img {
  display: none !important;
}

.comments-container.mini-media img.zhihu-comment-avatar,
.comments-modal-container.mini-media img.zhihu-comment-avatar,
.comments-modal-container.mini-media img.zhihu-reply-to-avatar {
  display: block !important;
  width: 2em !important;
  height: 2em !important;
  max-width: 20px;
  max-height: 20px;
}

/* 评论内容中的图片和链接居中显示 */
.zhihu-comment-content a {
  color: var(--vscode-textLink-foreground);
  text-decoration: none;
}

.zhihu-comment-content a:hover {
  text-decoration: underline;
}

.zhihu-comment-content p {
  margin: 0;
}

/* 评论底部：时间、点赞数等 */
.zhihu-comment-footer {
  display: flex;
  align-items: center;
  gap: 0.5em;
  font-size: 0.9em;
  opacity: 0.8;
}

.zhihu-comment-like {
  color: #ff8582;
  display: inline-flex;
  align-items: center;
}

/* 子评论容器 */
.zhihu-child-comments {
  margin-top: 1em;
  margin-left: 1em;
  border-left: 2px solid var(--vscode-panel-border);
  padding-left: 1.5em;
}

/* 子评论样式 */
.zhihu-child-comment {
  padding-bottom: 1em;
  border-bottom: 1px solid var(--vscode-panel-border);
}

.zhihu-child-comment:not(:first-of-type) {
  padding: 1em 0;
}

.zhihu-child-comment:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

/* 子评论标题栏 */
.zhihu-child-comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5em;
}

.zhihu-child-comment-avatar {
  width: 1.5em;
  height: 1.5em;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 0.67em;
}

.zhihu-child-comment-author-name {
  font-weight: 500;
}

.zhihu-child-comment-content {
  margin-bottom: 0.5em;
  line-height: 1.4;
}

.zhihu-child-comment-content p {
  word-break: break-all;
  margin: 0;
}

.zhihu-child-comment-footer {
  font-size: 0.9em;
  opacity: 0.8;
}

/* 分页按钮 */
.zhihu-comment-pagination {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
}

.zhihu-comment-pagination button {
  background-color: var(--vscode-button-background);
  color: var(--vscode-button-secondaryForeground);
  border: none;
  padding: 4px 6px;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 2px;
}

.zhihu-comment-pagination button svg {
  height: 100%;
}

.zhihu-comment-pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--vscode-button-secondaryBackground);
}

.zhihu-comment-pagination button:hover:not(:disabled) {
  background-color: var(--vscode-button-hoverBackground);
}

.zhihu-comment-pagination .page-info {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 查看全部回复按钮 */
.zhihu-show-all-replies-btn {
  background: transparent;
  color: var(--vscode-textLink-foreground);
  border: none;
  padding: 0.67em 0 0 0;
  cursor: pointer;
  font-size: 1em;
}

.zhihu-show-all-replies-btn:hover {
  text-decoration: underline;
}

/* 子评论弹窗样式 */
.zhihu-comments-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  z-index: 1000;
  cursor: pointer;
  align-items: center;
  justify-content: center;
}

.zhihu-comments-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
}

.zhihu-comments-modal-content {
  cursor: default;
  z-index: 1001;
  background-color: var(--vscode-editor-background);
  border-radius: 8px;
  width: 100%;
  margin: 10px 50px 5px 10px;
  max-width: 600px;
  max-height: 97vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px var(--vscode-scrollbar-shadow);
  border: 1px solid var(--vscode-panel-border);
}

.zhihu-comments-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid var(--vscode-panel-border);
  background-color: var(--vscode-editor-background);
}

.zhihu-comments-modal-header h3 {
  margin: 0;
  font-size: 16px;
}

.zhihu-comments-modal-close {
  background: transparent;
  border: none;
  font-size: 22px;
  line-height: 1;
  color: var(--vscode-foreground);
  cursor: pointer;
  padding: 0 5px;
}

.zhihu-comments-modal-close:hover {
  background: var(--vscode-button-secondaryBackground);
  border-radius: 4px;
  color: var(--vscode-button-foreground);
}

.zhihu-comments-modal-parent-comment {
  padding: 1em;
  border-bottom: 1px solid var(--vscode-panel-border);
  background-color: var(--vscode-editor-background);
}

.zhihu-comments-modal-parent-comment .zhihu-comment-content {
  max-height: 20vh;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.zhihu-comments-modal-child-comments {
  padding: 1em;
  overflow-y: auto;
  scroll-behavior: smooth;
  max-height: 65vh;
  display: flex;
  flex-direction: column;
  gap: 1em;
  background-color: var(--vscode-editor-background);
}

.zhihu-comments-modal-child-comments:focus,
.zhihu-comments-modal-child-comments:focus-visible {
  outline: none;
}

.zhihu-modal-pagination {
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  border-top: 1px solid var(--vscode-panel-border);
  background-color: var(--vscode-editor-background);
}

.zhihu-modal-pagination button {
  background-color: var(--vscode-button-background);
  color: var(--vscode-button-secondaryForeground);
  border: none;
  padding: 5px 15px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.zhihu-modal-pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--vscode-button-secondaryBackground);
}

.zhihu-modal-pagination button:hover:not(:disabled) {
  background-color: var(--vscode-button-hoverBackground);
}

.zhihu-modal-pagination button .vscode-icon {
  width: 16px;
  height: 16px;
  fill: var(--vscode-button-secondaryForeground);
}

/* 评论图片样式 */
.comment-image-container {
  margin: 8px 0;
}

.comment-image {
  border-radius: 4px;
  object-fit: cover;
  cursor: pointer;
  transition: opacity 0.2s ease;
  border: 1px solid var(--vscode-panel-border);
}

.comment-image:hover {
  opacity: 0.8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 适配暗色主题 */
.vscode-dark .comment-image {
  border-color: var(--vscode-panel-border);
  opacity: 0.9;
}

.vscode-dark .comment-image:hover {
  opacity: 1;
}

/* 动图容器样式 */
.comment-gif-container {
  position: relative;
  display: flex;
  width: fit-content;
  margin: 8px 0;
}

.comment-gif {
  border-radius: 4px;
  object-fit: cover;
  cursor: pointer;
  transition: opacity 0.2s ease;
  border: 1px solid var(--vscode-panel-border);
}

.comment-gif:hover {
  opacity: 0.8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.gif-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
  pointer-events: none;
  user-select: none;
}

/* 适配暗色主题 */
.vscode-dark .comment-gif {
  border-color: var(--vscode-panel-border);
  opacity: 0.9;
}

.vscode-dark .comment-gif:hover {
  opacity: 1;
}

/* 表情包样式 */
.comment-sticker-container {
  display: inline-block;
  margin: 0 2px;
  vertical-align: middle;
  position: relative;
}

.comment-sticker {
  width: 64px;
  height: 64px;
  border-radius: 4px;
  object-fit: contain;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
  vertical-align: middle;
}

.comment-sticker:hover {
  transform: scale(1.1);
  opacity: 0.9;
}

/* 适配暗色主题 */
.vscode-dark .comment-sticker:hover {
  opacity: 1;
}

/* 文本表情样式 */
.comment-text-emoji {
  width: 1.5em;
  height: 1.5em;
  display: inline;
  object-fit: contain;
  vertical-align: text-bottom;
}

/* 图片容器样式 */
.comment-image-container {
  margin: 8px 0;
  position: relative;
  display: inline-block;
}

.comment-image {
  width: 100px;
  height: 100px;
  cursor: pointer;
  border-radius: 4px;
  object-fit: cover;
}

.comment-gif {
  width: 120px;
  height: 80px;
  cursor: pointer;
  border-radius: 4px;
  object-fit: cover;
}

.gif-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
}

/* Mini媒体模式下的表情样式 */
.comments-container.mini-media .comment-sticker,
.comments-modal-container.mini-media .comment-sticker {
  width: 51px !important;  /* 64px * 0.8 */
  height: 51px !important;
  min-width: 24px;
  min-height: 24px;
}

.comments-container.mini-media .comment-text-emoji,
.comments-modal-container.mini-media .comment-text-emoji {
  width: 1.2em !important;
  height: 1.2em !important;
}

.comments-container.mini-media .comment-image,
.comments-modal-container.mini-media .comment-image {
  width: 50px !important;  /* 100px * 0.5 */
  height: 50px !important;
  min-width: 20px;
  min-height: 20px;
}

.comments-container.mini-media .comment-gif,
.comments-modal-container.mini-media .comment-gif {
  width: 84px !important;  /* 120px * 0.7 */
  height: 56px !important;  /* 80px * 0.7 */
  min-width: 30px;
  min-height: 20px;
}

.comments-container.mini-media .comment-gif-container,
.comments-modal-container.mini-media .comment-gif-container {
  display: inline-block !important;
}

/* 评论标签样式 */
.comment-tag {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  margin-left: 6px;
  vertical-align: middle;
  font-weight: 500;
  line-height: 1.2;
}

/* 回复关系样式 */
.reply-to-author {
  font-size: 12px;
  color: var(--vscode-descriptionForeground);
  margin-bottom: 4px;
  line-height: 1.4;
}

.reply-to-author a {
  color: var(--vscode-textLink-foreground);
  text-decoration: none;
  font-weight: 500;
}

.reply-to-author a:hover {
  color: var(--vscode-textLink-activeForeground);
  text-decoration: underline;
}

/* 在子评论中的回复关系样式调整 */
.zhihu-child-comment .reply-to-author {
  font-size: 11px;
  margin-bottom: 2px;
}

.zhihu-child-comment .comment-tag {
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 10px;
  margin-left: 4px;
}

/* 回复链样式 */
.zhihu-reply-chain {
  display: flex;
  align-items: center;
}

.reply-arrow {
  color: var(--vscode-descriptionForeground);
  font-size: 12px;
  margin: 0 0.67em;
}

.zhihu-reply-to-avatar {
  width: 1.5em;
  height: 1.5em;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  margin-right: 0.67em;
}

/* 回复链中的作者名称样式 */
.zhihu-reply-chain a {
  color: var(--vscode-textLink-foreground);
  text-decoration: none;
  font-weight: 600;
}

.zhihu-reply-chain a:hover {
  text-decoration: underline;
}

/* 作者标签样式 */
.author-tag {
  display: inline-block;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 1em;
  margin-left: 4px;
  vertical-align: middle;
}

/* 无媒体模式下的图片文本样式 */
.comment-image-text {
  display: inline-block;
  padding: 2px 6px;
  background-color: var(--vscode-editor-inactiveSelectionBackground);
  color: var(--vscode-descriptionForeground);
  border-radius: 3px;
  font-size: 11px;
  margin: 0 2px;
  vertical-align: middle;
}

/* 适配暗色主题 */
.vscode-dark .comment-image-text {
  background-color: var(--vscode-editor-selectionBackground);
}
`;
