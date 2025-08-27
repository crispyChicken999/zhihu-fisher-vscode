/**
 * 评论功能脚本 - 评论加载、投票等
 */
export const commentsScript = `
/**
 * 加载评论|收起评论|展开评论
 */
function hanldeCommentsToggle() {
  const commentsContainer = document.querySelector('.comments-container');
  const loadCommentsBtn = document.querySelector('.zhihu-load-comments-btn');

  if (loadCommentsBtn) {
    // 如果找到按钮，那么说明没有加载评论，点击按钮加载评论
    const answerId = commentsContainer.getAttribute('data-answer-id');
    loadComments(answerId);
  } else {
    // 如果已经加载评论了，判断是否滚动到评论区
    const isInViewport = isElementInViewport(commentsContainer);
    if (isInViewport) {
      // 如果评论区在可视范围内，则收起评论
      const answerId = commentsContainer.getAttribute('data-answer-id');
      toggleCommentStatus(answerId);
    } else {
      // 如果评论区不在可视范围内，则滚动到评论区
      commentsContainer.scrollIntoView({ behavior: 'smooth' });
      // focus，以便响应键盘上下箭头来滚动
      setTimeout(() => {
        const commentsList = commentsContainer.querySelector('.zhihu-comments-list');
        if (commentsList) {
          commentsList.focus();
        }
      }, 1000);
    }
  }
}

/**
 * 判断元素是否在视口内
 * @param {HTMLElement} el 元素
 * @returns {boolean} 是否在视口内
 */
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// 加载评论
function loadComments(answerId, page = 1) {
  const commentsContainer = document.querySelector('.comments-container');
  commentsContainer.innerHTML = '<div class="zhihu-comments-loading"><div class="zhihu-comments-loading-spinner"></div>加载评论中...</div>';
  vscode.postMessage({
    command: "loadComments",
    answerId: answerId,
    page: page
  });
}

// 投票功能
function voteContent(contentId, voteValue, contentType) {
  // 禁用所有投票按钮，防止重复点击
  const voteButtons = document.querySelectorAll('.vote-button');
  voteButtons.forEach(button => {
    button.disabled = true;
    button.style.opacity = '0.6';
  });

  vscode.postMessage({
    command: "voteContent",
    contentId: contentId,
    voteValue: voteValue,
    contentType: contentType
  });
}

// 切换评论区的展开/收起状态
function toggleCommentStatus(answerId) {
  vscode.postMessage({
    command: "toggleCommentStatus",
    answerId: answerId
  });
}

// 加载更多评论（分页）
function loadMoreComments(answerId, page) {
  vscode.postMessage({
    command: "loadComments",
    answerId: answerId,
    page: page
  });
}

// 查看全部子评论
function loadAllChildComments(commentId) {
  const modalContainer = document.querySelector('.comments-modal-container');
  modalContainer.innerHTML = '<div class="zhihu-comments-loading" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000;"><div class="zhihu-comments-loading-spinner"></div>加载子评论中...</div>';

  vscode.postMessage({
    command: "loadChildComments",
    commentId: commentId
  });
}

// 加载子评论的更多页
function loadMoreChildComments(commentId, page) {
  vscode.postMessage({
    command: "loadChildComments",
    commentId: commentId,
    page: page
  });
}

// 关闭子评论弹窗
function closeCommentsModal() {
  const modal = document.querySelector('.zhihu-comments-modal');
  if (modal) {
    modal.remove();
  }

  // .zhihu-comments-list focus
  const commentsList = document.querySelector('.zhihu-comments-list');
  if (commentsList) {
    commentsList.focus();
  }
}

/**
 * 加载专栏评论（通过分页方向）
 */
function loadArticleComments(articleId, direction) {
  vscode.postMessage({
    command: "loadArticleComments",
    articleId: articleId,
    direction: direction
  });
}
`;
