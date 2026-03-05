/**
 * 知乎直答（Zhida）AI 弹窗前端脚本
 * 注意：vscode / acquireVsCodeApi 已在 core.ts 顶层声明，这里直接使用 vscode 变量
 */
export const zhidaScript = `
// ===== 知乎直答：打开弹窗并触发关键词查询 =====
// keyword: 可选，已知的关键词（链接文字），可直接预填
function openZhidaPanel(href, keyword) {
  if (!href) return;
  // 预填关键词（不等后端就能显示）
  var displayKeyword = keyword || '';
  _zhidaShowModal('loading', displayKeyword);
  vscode.postMessage({ command: 'openZhidaPanel', href: href });
}

// ===== 知乎直答：触发 AI 总结 =====
function requestZhidaSummary(answerId) {
  if (!answerId) return;
  _zhidaShowModal('loading', '这篇内容讲了什么？');
  vscode.postMessage({ command: 'zhidaSummarize', answerId: answerId });
}

// ===== 关闭弹窗 =====
function closeZhidaModal() {
  var modal = document.getElementById('zhidaModal');
  if (!modal) return;
  modal.classList.remove('is-open');
  document.body.style.overflow = '';
}

// ===== 内部：切换弹窗状态并清空旧内容 =====
function _zhidaShowModal(state, keyword) {
  var modal = document.getElementById('zhidaModal');
  var keywordEl = document.getElementById('zhidaKeyword');
  var loadingEl = document.getElementById('zhidaLoading');
  var answerEl  = document.getElementById('zhidaAnswerContent');
  var errorEl   = document.getElementById('zhidaError');
  var errorMsg  = document.getElementById('zhidaErrorMsg');

  if (!modal) return;

  // 打开弹窗
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  // 更新关键词（undefined 表示保持现有内容不变）
  if (keywordEl && keyword !== undefined) {
    keywordEl.textContent = keyword || '-';
  }

  // 切换状态，进入 loading 时清空旧内容
  if (state === 'loading') {
    if (answerEl) { answerEl.innerHTML = ''; answerEl.style.display = 'none'; }
    if (errorEl)  { errorEl.style.display = 'none'; }
    if (errorMsg) { errorMsg.textContent = ''; }
    if (loadingEl) loadingEl.style.display = 'flex';
  } else if (state === 'success') {
    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl)   errorEl.style.display = 'none';
    if (answerEl)  answerEl.style.display = 'block';
  } else if (state === 'error') {
    if (loadingEl) loadingEl.style.display = 'none';
    if (answerEl)  answerEl.style.display = 'none';
    if (errorEl)   errorEl.style.display = 'flex';
  }
}

// ===== 接收 extension host 的 zhidaResult 消息 =====
(function() {
  window.addEventListener('message', function(event) {
    var message = event.data;
    if (!message || message.command !== 'zhidaResult') return;

    var modal = document.getElementById('zhidaModal');
    // 如果弹窗已被用户关闭，忽略
    if (!modal || !modal.classList.contains('is-open')) return;

    var state      = message.state;
    var keyword    = message.keyword;
    var answerHtml = message.answerHtml;
    var error      = message.error;

    var keywordEl = document.getElementById('zhidaKeyword');
    var answerEl  = document.getElementById('zhidaAnswerContent');
    var errorMsg  = document.getElementById('zhidaErrorMsg');

    if (state === 'loading') {
      // 如果后端发来的 keyword 为空，不覆盖前端已预填的关键词
      if (keyword) _zhidaShowModal('loading', keyword);
      else _zhidaShowModal('loading', undefined); // 只切换 loading 状态，不改关键词
    } else if (state === 'success') {
      // 更新关键词（后端可能有更准确的关键词）
      if (keywordEl && keyword) keywordEl.textContent = keyword;
      if (answerEl) answerEl.innerHTML = answerHtml || '';
      _zhidaShowModal('success', keyword);
    } else if (state === 'error') {
      if (errorMsg) errorMsg.textContent = error || '发生未知错误';
      _zhidaShowModal('error', keyword || '');
    }
  });

  // ESC 键关闭
  document.addEventListener('keydown', function(e) {
    var modal = document.getElementById('zhidaModal');
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
      closeZhidaModal();
    }
  });
})();
`;
