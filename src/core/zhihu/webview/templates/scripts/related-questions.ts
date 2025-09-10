/**
 * 相关问题模态框相关的JavaScript函数
 */
export const relatedQuestionsScript = `
// 全局变量用于存储相关问题数据
let relatedQuestionsData = \${RELATED_QUESTIONS_DATA};

// 页面加载完成后设置相关问题数据
document.addEventListener('DOMContentLoaded', function() {
  setRelatedQuestionsData(relatedQuestionsData);
});

// 监听来自VSCode的消息
window.addEventListener('message', function(event) {
  const message = event.data;

  if (message.command === 'updateRelatedQuestions') {
    // 更新相关问题数据
    setRelatedQuestionsData(message.data);
    console.log('收到相关问题数据更新，共', message.data ? message.data.length : 0, '个问题');

    // 修改title related-questions-icon
    const iconElement = document.querySelector('.related-questions-icon');
    if (iconElement) {
      const count = message.data ? message.data.length : 0;
      iconElement.setAttribute('title', \`相关问题 (\${count})\`);
    }

    // 如果当前弹窗已打开，则刷新弹窗内容
    const existingModal = document.querySelector('.related-questions-modal');
    if (existingModal) {
      refreshRelatedQuestionsModal();
    }
  }
});

// 显示相关问题弹窗
function showRelatedQuestionsModal() {
  // 创建弹窗HTML
  const modalHtml = createRelatedQuestionsModal();

  // 将弹窗添加到页面
  const modalContainer = document.createElement('div');
  modalContainer.innerHTML = modalHtml;
  document.body.appendChild(modalContainer.firstElementChild);

  // 阻止滚动
  document.body.style.overflow = 'hidden';

  // 聚焦到弹窗内容
  const modalBody = document.querySelector('.related-questions-modal-body');
  if (modalBody) {
    modalBody.focus();
  }
}

// 关闭相关问题弹窗
function closeRelatedQuestionsModal() {
  const modal = document.querySelector('.related-questions-modal');
  if (modal) {
    modal.remove();
  }

  // 恢复滚动
  document.body.style.overflow = '';
}

// 刷新相关问题弹窗内容
function refreshRelatedQuestionsModal() {
  const existingModal = document.querySelector('.related-questions-modal');
  if (!existingModal) {
    return;
  }

  // 记住之前的滚动位置
  const modalBody = existingModal.querySelector('.related-questions-modal-body');
  const scrollTop = modalBody ? modalBody.scrollTop : 0;

  // 关闭现有弹窗
  closeRelatedQuestionsModal();

  // 重新打开弹窗
  showRelatedQuestionsModal();

  // 恢复滚动位置
  setTimeout(() => {
    const newModalBody = document.querySelector('.related-questions-modal-body');
    if (newModalBody) {
      newModalBody.scrollTop = scrollTop;
    }
  }, 0);
}

// 创建相关问题弹窗HTML
function createRelatedQuestionsModal() {
  if (!relatedQuestionsData || relatedQuestionsData.length === 0) {
    return \`
      <div class="related-questions-modal">
        <div class="related-questions-modal-overlay" onclick="closeRelatedQuestionsModal()"></div>
        <div class="related-questions-modal-content">
          <div class="related-questions-modal-header">
            <h3>相关问题</h3>
            <button class="related-questions-modal-close" title="点击关闭（ESC）" onclick="closeRelatedQuestionsModal()">×</button>
          </div>
          <div class="related-questions-modal-body">
            <div style="text-align: center; padding: 20px; color: var(--vscode-descriptionForeground);">
              暂无相关问题
            </div>
          </div>
        </div>
      </div>
    \`;
  }

  const questionsHtml = relatedQuestionsData
    .map((question) => {
      const escapedTitle = escapeHtml(question.title);
      return \`
        <div class="related-question-item">
          <div class="question-content">
            <div class="question-title" title="\${escapedTitle}">
              \${escapedTitle}
            </div>
            <div class="question-meta">
              \${question.answerCount} 个回答 · \${question.followerCount} 人关注
            </div>
          </div>
          <div class="question-actions">
            <button class="action-btn" onclick="openPage('\${question.url}')" title="在浏览器中打开">
              <svg width="min(1em, 12px)" height="min(1em, 12px)" viewBox="0 0 24 24">
                <path fill="currentColor" d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2zM14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3z"/>
              </svg>
              浏览器
            </button>
            <button class="action-btn" onclick="openInVSCode('\${question.url}')" title="在VSCode中查看">
              <svg width="min(1em, 12px)" height="min(1em, 12px)" viewBox="0 0 24 24">
                <path fill="currentColor" d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zM18.5 16.5L13 12l5.5-4.5v9z"></path>
              </svg>
              VSCode
            </button>
          </div>
        </div>
      \`;
    })
    .join('');

  return \`
    <div class="related-questions-modal">
      <div class="related-questions-modal-overlay" onclick="closeRelatedQuestionsModal()"></div>
      <div class="related-questions-modal-content">
        <div class="related-questions-modal-header">
          <h3>相关问题 (\${relatedQuestionsData.length})</h3>
          <button class="related-questions-modal-close" title="点击关闭（ESC）" onclick="closeRelatedQuestionsModal()">×</button>
        </div>
        <div class="related-questions-modal-body">
          \${questionsHtml}
        </div>
      </div>
    </div>
  \`;
}

// 转义HTML字符
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 设置相关问题数据
function setRelatedQuestionsData(data) {
  relatedQuestionsData = data || [];
}

// 监听ESC键关闭弹窗
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const modal = document.querySelector('.related-questions-modal');
    if (modal) {
      closeRelatedQuestionsModal();
    }
  }
});
`;
