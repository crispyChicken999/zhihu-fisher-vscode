/**
 * 作者相关脚本 - 处理关注功能和沉浸模式作者信息
 */
export const authorScript = `
/**
 * 切换关注作者状态
 * @param {string} authorId 作者ID
 */
function toggleFollowAuthor(authorId) {
  const buttons = document.querySelectorAll(\`.author-follow-btn[data-author-id="\${authorId}"]\`);
  if (!buttons.length) {
    return;
  }

  const button = buttons[0];
  const isFollowing = button.getAttribute('data-is-following') === 'true';
  const action = isFollowing ? 'unfollow' : 'follow';

  // 禁用所有相关按钮
  buttons.forEach(btn => {
    btn.disabled = true;
    btn.style.opacity = '0.5';
  });

  // 发送消息到扩展
  vscode.postMessage({
    command: action + 'Author',
    authorId: authorId
  });
}

/**
 * 更新作者关注状态（由扩展调用）
 * @param {string} authorId 作者ID
 * @param {boolean} isFollowing 是否关注
 */
function updateAuthorFollowStatus(authorId, isFollowing) {
  const buttons = document.querySelectorAll(\`.author-follow-btn[data-author-id="\${authorId}"]\`);

  buttons.forEach(button => {
    button.setAttribute('data-is-following', isFollowing);
    button.disabled = false;
    button.style.opacity = '1';

    const textSpan = button.querySelector('.follow-text');
    if (textSpan) {
      textSpan.textContent = isFollowing ? '已关注' : '关注';
    }

    button.title = isFollowing ? '取消关注' : '关注作者';
  });
}

/**
 * 切换沉浸模式作者信息popover显示
 * @param {string} authorId 作者ID
 */
function toggleImmersiveAuthorPopover(authorId) {
  const popover = document.querySelector(\`.immersive-author-popover[data-author-id="\${authorId}"]\`);
  if (!popover) {
    return;
  }

  const isShown = popover.classList.contains('show');

  // 关闭所有其他popover
  document.querySelectorAll('.immersive-author-popover.show').forEach(p => {
    if (p !== popover) {
      p.classList.remove('show');
    }
  });

  // 切换当前popover
  if (isShown) {
    popover.classList.remove('show');
  } else {
    popover.classList.add('show');
  }
}

/**
 * 点击页面其他地方关闭popover
 */
document.addEventListener('click', function(event) {
  // 检查点击的是否是trigger或popover内部
  const isTrigger = event.target.closest('.immersive-author-trigger');
  const isPopover = event.target.closest('.immersive-author-popover');

  if (!isTrigger && !isPopover) {
    // 关闭所有popover
    document.querySelectorAll('.immersive-author-popover.show').forEach(p => {
      p.classList.remove('show');
    });
  }
});
`;
