/**
 * 想法样式
 */
export const thoughtCss = `
  /* 想法链接卡片容器 */
  .thought-link-card-container {
    margin: 1em 0;
    padding: 0;
    display: flex;
    align-items: flex-end;
  }

  /* 想法链接卡片 - 使用知乎原生的 LinkCard 类名 */
  .thought-link-card-container .LinkCard.new {
    display: flex;
    align-items: center;
    padding: 0.75em;
    border: 1px solid var(--vscode-panel-border);
    border-radius: 0.25em;
    text-decoration: none;
    color: var(--vscode-foreground);
    background-color: var(--vscode-editor-background);
    transition: all 0.2s ease;
  }

  .thought-link-card-container .LinkCard.new:hover {
    background-color: var(--vscode-list-hoverBackground);
    border-color: var(--vscode-focusBorder);
  }

  /* 链接卡片图片 - 固定尺寸，不受 mini-media 影响 */
  .thought-link-card-container .LinkCard-image {
    flex-shrink: 0;
    width: 6em;
    height: 4em;
    margin-right: 0.75em;
    overflow: hidden;
    border-radius: 0.125em;
  }

  .thought-link-card-container .LinkCard-image img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover;
  }

  /* hide-media 模式下隐藏 LinkCard 图片 */
  .article-content.hide-media .thought-link-card-container .LinkCard-image {
    display: none;
  }

  /* hide-media 模式下调整 LinkCard 布局 */
  .article-content.hide-media .thought-link-card-container .LinkCard.new {
    padding-left: 0.75em;
  }

  /* 链接卡片内容 */
  .thought-link-card-container .LinkCard-contents {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
  }

  /* 链接卡片标题 */
  .thought-link-card-container .LinkCard-title {
    font-size: 1em;
    font-weight: 500;
    line-height: 1.4;
    color: var(--vscode-foreground);
    margin-bottom: 0.25em;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  /* 链接卡片描述 */
  .thought-link-card-container .LinkCard-desc {
    font-size: 0.75em;
    line-height: 1.4;
    color: var(--vscode-descriptionForeground);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* 链接卡片描述中的标签 */
  .thought-link-card-container .LinkCard-desc .tag {
    display: inline-block;
    padding: 0.0625em 0.375em;
    margin-left: 0.25em;
    font-size: 0.6875em;
    background-color: var(--vscode-badge-background);
    color: var(--vscode-badge-foreground);
    border-radius: 0.125em;
  }

  /* 想法内容中的表情图片 */
  .article-content img.sticker {
    display: inline-block;
    width: 1.25em;
    height: 1.25em;
    vertical-align: middle;
    margin: 0 0.125em;
  }

  /* 想法图片容器 */
  .thought-images-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.75em;
    margin: 1em 0;
    padding: 0;
  }

  /* 想法图片项 - 固定小尺寸缩略图 */
  .thought-image-item {
    position: relative;
    overflow: hidden;
    border-radius: 0.25em;
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 0 0 auto;
    width: 5em;
    height: 5em;
    overflow: hidden;
  }

  .thought-image-item:hover img{
    transform: scale(1.05);
  }

  /* 想法图片 - 固定尺寸，不受 mini-media 影响 */
  .thought-image-item img {
    width: 100% !important;
    height: 100% !important;
    display: block;
    object-fit: cover;
    border-radius: 0.25em;
  }

  /* hide-media 模式下隐藏想法图片 */
  .article-content.hide-media .thought-images-container {
    display: none;
  }

  /* 想法标识 - 与sort-mode-tag样式完全一致 */
  .thought-badge {
    display: inline-block;
    border: 1px solid var(--vscode-badge-background);
    padding: 0.125em 0.25em;
    border-radius: 0.25em;
    font-size: 0.75em;
    font-weight: bold;
    margin-right: 0.5em;
    vertical-align: text-bottom;
  }
`;
