/**
 * 导航脚本 - 文章和回答导航功能
 */
export const navigationScript = `
/**
 * 加载上一个回答
 */
function loadPreviousAnswer() {
  if (currentAnswerIndex > 0) {
    // 发送消息给扩展
    window.scrollTo(0, 0); // 滚动到顶部
    vscode.postMessage({ command: "loadPreviousAnswer" });
  }
}

/**
 * 加载下一个回答
 */
function loadNextAnswer() {
  window.scrollTo(0, 0); // 滚动到顶部
  vscode.postMessage({ command: "loadNextAnswer" });
}

/**
 * 跳转到指定回答
 * @param {number} index 回答索引
 */
function jumpToAnswer(index) {
  window.scrollTo(0, 0); // 滚动到顶部
  vscode.postMessage({
    command: "jumpToAnswer",
    index: parseInt(index, 10)
  });
}

/**
 * 加载上一篇文章/问题
 */
function loadPreviousArticle() {
  window.scrollTo(0, 0); // 滚动到顶部
  vscode.postMessage({ command: "loadPreviousArticle" });
}

/**
 * 加载下一篇文章/问题
 */
function loadNextArticle() {
  window.scrollTo(0, 0); // 滚动到顶部
  vscode.postMessage({ command: "loadNextArticle" });
}

/**
 * 在外部浏览器中打开链接
 * @param {string} url 链接URL
 */
function openPage(url) {
  event.preventDefault(); // 阻止默认点击行为
  vscode.postMessage({
    command: 'openInBrowser',
    url: url
  });
}

/**
 * 在VSCode中打开知乎链接
 * @param {string} url 知乎链接URL
 */
function openWebView(url) {
  event.preventDefault(); // 阻止默认点击行为
  vscode.postMessage({
    command: 'openZhihuLink',
    url: url
  });
}

/**
 * 更新导航信息
 * @param {number} loadedCount 已加载回答数
 * @param {number} totalCount 总回答数
 * @param {boolean} isLoading 是否正在加载
 * @param {number} currentIndex 当前选中的回答索引（可选）
 */
function updateNavInfo(loadedCount, totalCount, isLoading, currentIndex) {
  // 更新全局变量
  loadedAnswerCount = loadedCount;

  // 如果没有传入 currentIndex，尝试从全局变量或 select 元素获取
  if (currentIndex === undefined) {
    // 先尝试从全局变量获取
    if (typeof currentAnswerIndex !== 'undefined') {
      currentIndex = currentAnswerIndex;
    } else {
      // 如果没有全局变量，从第一个 select 元素获取
      const firstSelect = document.querySelector('.answer-jump-select');
      currentIndex = firstSelect ? parseInt(firstSelect.value) || 0 : 0;
    }
  }

  // 获取所有的nav-info元素（可能有多个）
  const navInfoElements = document.querySelectorAll('.nav-info');

  navInfoElements.forEach(navInfo => {
    // 1. 更新该 navInfo 内部的页面跳转选择器
    const answerJumpSelect = navInfo.querySelector('.answer-jump-select');
    if (answerJumpSelect && loadedCount > 1) {
      // 确保 currentIndex 在有效范围内
      const validCurrentIndex = Math.min(Math.max(currentIndex, 0), loadedCount - 1);

      // 清空现有选项
      answerJumpSelect.innerHTML = '';

      // 重新生成选项
      for (let i = 0; i < loadedCount; i++) {
        const option = document.createElement('option');
        option.value = i.toString();
        option.textContent = (i + 1).toString();

        // 设置选中状态
        if (i === validCurrentIndex) {
          option.selected = true;
        }

        answerJumpSelect.appendChild(option);
      }
    }
  
    // 2. 更新"已加载 X 个回答"文本
    const loadedText = navInfo.querySelector('.loaded-text');
    if (loadedText) {
      loadedText.textContent = \`已加载 \${loadedCount} 个回答\`;
    }

    // 3. 处理加载图标
    const loadedInfo = navInfo.querySelector('.loaded-info');
    if (loadedInfo) {
      let loadingIcon = loadedInfo.querySelector('.loading-icon');

      if (isLoading) {
        // 如果正在加载但没有图标，添加图标
        if (!loadingIcon) {
          const iconSpan = document.createElement('span');
          iconSpan.className = 'loading-icon';
          iconSpan.innerHTML = \`
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                <path stroke-dasharray="16" stroke-dashoffset="16" d="M12 3c4.97 0 9 4.03 9 9">
                  <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.3s" values="16;0"/>
                  <animateTransform attributeName="transform" dur="1.5s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/>
                </path>
                <path stroke-dasharray="64" stroke-dashoffset="64" stroke-opacity=".3" d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z">
                  <animate fill="freeze" attributeName="stroke-dashoffset" dur="1.2s" values="64;0"/>
                </path>
              </g>
            </svg>
          \`;
          loadedInfo.appendChild(iconSpan);
        }
      } else {
        // 如果不在加载但有图标，移除图标
        if (loadingIcon) {
          loadingIcon.remove();
        }
      }
    }

    // 4. 更新"共 X 个回答"文本
    const totalCountElement = navInfo.querySelector('.total-count');
    if (totalCountElement && totalCount > 0) {
      totalCountElement.textContent = \`共 \${totalCount} 个回答\`;
    }
  });
}
`;