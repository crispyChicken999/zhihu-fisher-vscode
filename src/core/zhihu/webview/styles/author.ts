/**
 * 作者信息相关样式
 */
export const authorCss = `
/* 作者信息样式 */
.author-info {
  display: flex;
  align-items: center;
  margin: 10px 0;
  padding: 10px;
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
  font-size: 0.9em;
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
`;