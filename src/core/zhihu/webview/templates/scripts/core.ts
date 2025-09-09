/**
 * 核心脚本 - 全局变量、初始化和消息处理
 */
export const coreScript = `
// VS Code WebView API
const vscode = acquireVsCodeApi();

// 媒体显示模式
let currentMediaMode = "\${MEDIA_DISPLAY_MODE}";

// Mini模式下的缩放比例
let currentMiniMediaScale = \${MINI_MEDIA_SCALE};

// 当前回答索引
let currentAnswerIndex = \${CURRENT_ANSWER_INDEX};

// 已加载回答数
let loadedAnswerCount = \${LOADED_ANSWER_COUNT};

// 文章ID
const articleId = "\${ARTICLE_ID}";

// 来源类型
const sourceType = "\${SOURCE_TYPE}";

// 资源基础路径
const resourcesBasePath = "\${RESOURCES_BASE_PATH}";

// 沉浸模式状态
let isImmersiveMode = false;

// 固定工具栏展开状态
let isFixedToolbarExpanded = false;

// 文档加载完成后执行
document.addEventListener("DOMContentLoaded", function() {
  setupKeyboardNavigation();
  setupStylePanel();
  setupBackTopButton();
  setupImmersiveMode();
  setupFixedToolbar();
  setupImageFancyBox();
  setupGrayscaleMode();
  setupToolbarConfig();

  // 初始化工具栏配置（需要在沉浸模式状态设置好后）
  // setTimeout(() => {
    initializeToolbarConfigFromLocalStorage();
  // }, 100);

  // 初始化快捷键配置
  setTimeout(() => {
    updateTooltipsWithShortcuts();
  }, 150);

  // 渲染数学公式
  setTimeout(() => {
    renderMathJax();
  }, 200);

  // 设置ESC键监听，支持关闭子评论弹窗
  setupEscKeyListener();

  // 初始化媒体显示模式
  updateMediaDisplayClass(currentMediaMode);

  // 初始化mini模式缩放比例
  if (currentMediaMode === 'mini') {
    updateMiniMediaScale(currentMiniMediaScale);
  }

  // 设置媒体显示单选按钮
  const radioButtons = document.querySelectorAll('input[name="media-display"]');
  for (const radio of radioButtons) {
    if (radio.value === currentMediaMode) {
      radio.checked = true;
    }

    radio.addEventListener('change', function() {
      if (this.checked) {
        currentMediaMode = this.value;
        updateMediaDisplayClass(currentMediaMode);
        // 向扩展发送消息，带上选定的模式
        vscode.postMessage({
          command: "setMediaMode",
          mode: currentMediaMode
        });
      }
    });
  }
});

// 监听来自扩展的消息
window.addEventListener('message', event => {
  const message = event.data;

  // 处理更新评论的消息
  if (message.command === 'updateComments') {
    const commentsContainer = document.querySelector('.comments-container');
    commentsContainer.innerHTML = message.html;
    // 滚动到评论区
    commentsContainer.scrollIntoView({ behavior: 'smooth' });

    // 重新初始化FancyBox，让新加载的评论图片支持点击放大
    setTimeout(() => {
      if (typeof initializeFancyBox === 'function') {
        initializeFancyBox();
      }

      // focus，以便响应键盘上下箭头来滚动
      const commentsList = commentsContainer.querySelector('.zhihu-comments-list');
      if (commentsList) {
        commentsList.focus();
      }
    }, 100);
  }

  // 处理更新子评论弹窗的消息
  else if (message.command === 'updateChildCommentsModal') {
    const mb = document.querySelector('.comments-modal-container');
    mb.innerHTML = message.html;

    // 重新初始化FancyBox，让子评论弹窗中的图片也支持点击放大
    setTimeout(() => {
      if (typeof initializeFancyBox === 'function') {
        initializeFancyBox();
      }

      // zhihu-comments-modal-child-comments focus
      const childCommentsList = document.querySelector('.zhihu-comments-modal-child-comments');
      if (childCommentsList) {
        childCommentsList.focus();
      }
    }, 100);
  }

  // 处理更新导航信息的消息
  else if (message.command === 'updateNavInfo') {
    updateNavInfo(message.loadedCount, message.totalCount, message.isLoading);
  }

  // 处理更新问题详情的消息
  else if (message.command === 'updateQuestionDetail') {
    const questionDetailContent = document.getElementById('questionDetailContent');
    if (questionDetailContent && message.data && message.data.questionDetail) {
      questionDetailContent.innerHTML = message.data.questionDetail;

      // 重新初始化FancyBox，让问题详情中的图片支持点击放大
      setTimeout(() => {
        if (typeof initializeFancyBox === 'function') {
          initializeFancyBox();
        }
      }, 100);

      console.log('问题详情内容已更新');
    }
  }
});

/**
 * 重新渲染数学公式
 */
function renderMathJax() {
  if (window.MathJax && window.MathJax.typesetPromise) {
    window.MathJax.typesetPromise().catch((err) => {
      console.warn('MathJax 渲染失败:', err);
    });
  }
}

/**
 * 设置ESC键监听，用于关闭子评论弹窗
 */
function setupEscKeyListener() {
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      // 检查是否有子评论弹窗打开
      const modal = document.querySelector('.zhihu-comments-modal');
      if (modal) {
        // 调用关闭子评论弹窗的函数
        if (typeof closeCommentsModal === 'function') {
          closeCommentsModal();
        }
      }
    }
  });
}
`;
