export const commentsCss = `
/* 评论容器样式 */
.zhihu-comments-container {
  margin: 10px 0;
  border-top: 1px solid var(--vscode-panel-border);
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
  font-size: 14px;
  color: var(--vscode-descriptionForeground);
  background-color: var(--vscode-editor-background);
}

/* 加载评论按钮 */
.zhihu-load-comments-btn, .zhihu-expand-comments-btn {
  background-color: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  border: none;
  border-radius: 2px;
  padding: 6px 8px;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.zhihu-load-comments-btn:hover, .zhihu-expand-comments-btn:hover {
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
  gap: 15px;
  overflow-y: auto;
  max-height: 70vh;
  padding-right: 10px;
}

/* 单个评论样式 - 使用与文章相同的背景 */
.zhihu-comment {
  padding: 12px;
  border-radius: 6px;
  transition: background-color 0.2s;
  border: 1px solid var(--vscode-panel-border);
  background-color: var(--vscode-editor-background);
}

.zhihu-comment:hover {
  background-color: var(--vscode-list-hoverBackground);
}

/* 评论头部：头像和作者信息 */
.zhihu-comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.zhihu-comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.zhihu-comment-author {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  max-width: 100%;
}

.zhihu-comment-author-name {
  width: fit-content;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
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
  opacity: 0.6;
  font-size: 0.9em;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  flex: 1;
}

/* 评论内容样式 */
.zhihu-comment-content {
  margin-bottom: 8px;
  overflow-wrap: break-word;
  word-break: break-all;
}

/* 评论内容中的图片和视频样式 */
.zhihu-comment-content img,
.zhihu-comment-content video {
  max-width: 100%;
  margin: 10px 0;
  border-radius: 4px;
}

/* 媒体模式应用到评论内容 */
.comments-container.hide-media img,
.comments-modal-container.hide-media img {
  display: none !important;
}

.comments-container.mini-media img,
.comments-modal-container.mini-media img {
  display: block !important;
  width: 20px !important;
  height: auto !important;
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
  gap: 5px;
  font-size: 12px;
  color: var(--vscode-descriptionForeground);
}

.zhihu-comment-like {
  color: #ff8582;
  display: inline-flex;
  align-items: center;
}

/* 子评论容器 */
.zhihu-child-comments {
  margin-top: 10px;
  margin-left: 10px;
  border-left: 2px solid var(--vscode-panel-border);
  padding-left: 15px;
}

/* 子评论样式 */
.zhihu-child-comment {
  padding-bottom: 10px;
  border-bottom: 1px solid var(--vscode-panel-border);
}

.zhihu-child-comment:not(:first-of-type) {
  padding: 10px 0;
}

.zhihu-child-comment:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

/* 子评论标题栏 */
.zhihu-child-comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.zhihu-child-comment-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.zhihu-child-comment-author-name {
  font-weight: 500;
}

.zhihu-child-comment-content {
  margin-bottom: 6px;
  line-height: 1.4;
}

.zhihu-child-comment-content p {
  margin: 0;
}

.zhihu-child-comment-footer {
  font-size: 12px;
  color: var(--vscode-descriptionForeground);
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
  padding: 5px 15px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
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
  padding: 5px 0 0 0;
  cursor: pointer;
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
}

.zhihu-comments-modal-content {
  z-index: 1001;
  background-color: var(--vscode-editor-background);
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 95vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 1);
  border: 1px solid var(--vscode-panel-border);
}

.zhihu-comments-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
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
  padding: 12px;
  border-bottom: 1px solid var(--vscode-panel-border);
  background-color: var(--vscode-editor-background);
}

.zhihu-comments-modal-child-comments {
  padding: 12px;
  overflow-y: auto;
  max-height: 65vh;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: var(--vscode-editor-background);
}

.zhihu-modal-pagination {
  padding: 12px;
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
`;
