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
`;