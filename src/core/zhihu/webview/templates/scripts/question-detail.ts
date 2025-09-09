/**
 * 问题详情弹窗脚本
 */
export const questionDetailScript = `
(function() {
  // 问题详情按钮和弹窗元素
  const questionDetailBtn = document.getElementById('questionDetailBtn');
  const questionDetailModal = document.getElementById('questionDetailModal');
  const questionDetailClose = document.getElementById('questionDetailClose');
  const questionDetailOverlay = questionDetailModal?.querySelector('.question-detail-modal-overlay');

  if (questionDetailBtn && questionDetailModal) {
    // 显示弹窗
    questionDetailBtn.addEventListener('click', () => {
      questionDetailModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });

    // 关闭弹窗函数
    function hideModal() {
      questionDetailModal.style.display = 'none';
      document.body.style.overflow = '';
    }

    // 关闭按钮点击事件
    if (questionDetailClose) {
      questionDetailClose.addEventListener('click', hideModal);
    }

    // 点击overlay背景关闭弹窗
    if (questionDetailOverlay) {
      questionDetailOverlay.addEventListener('click', hideModal);
    }

    // 点击弹窗外部区域关闭弹窗
    questionDetailModal.addEventListener('click', (e) => {
      if (e.target === questionDetailModal) {
        hideModal();
      }
    });

    // ESC键关闭弹窗
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && questionDetailModal.style.display === 'flex') {
        hideModal();
      }
    });
  }
})();
`;
