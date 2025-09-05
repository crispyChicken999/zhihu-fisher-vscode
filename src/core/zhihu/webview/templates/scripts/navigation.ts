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
 * 在VSCode中打开知乎链接（别名，用于相关问题等场景）
 * @param {string} url 知乎链接URL
 */
function openInVSCode(url) {
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

  // 确保 currentIndex 在有效范围内
  const validCurrentIndex = Math.min(Math.max(currentIndex, 0), loadedCount - 1);

  // 获取所有导航容器（可能有多个）
  const navigationElements = document.querySelectorAll('.navigation');

  navigationElements.forEach(navigation => {
    // 1. 更新导航按钮区域
    const navigationButtons = navigation.querySelector('.navigation-buttons');
    if (navigationButtons) {
      // 生成分页器HTML
      const generatePaginatorHtml = (currentPage, totalPages) => {
        if (totalPages <= 1) {
          return "";
        }

        let paginatorHtml = '<div class="paginator">';

        // 如果总页数小于等于7，直接显示所有页码
        if (totalPages <= 7) {
          for (let i = 1; i <= totalPages; i++) {
            const isActive = i === currentPage;
            paginatorHtml += \`<button class="page-button \${isActive ? "active-page" : ""}" \${
              isActive ? "disabled" : \`onclick="jumpToAnswer(\${i - 1})"\`
            }>\${i}</button>\`;
          }
        } else {
          // 复杂的分页逻辑
          const pageNumbers = [];

          // 始终显示第一页
          pageNumbers.push(1);

          // 计算中间部分的页码
          if (currentPage <= 4) {
            // 当前页靠近开始
            for (let i = 2; i <= 5; i++) {
              pageNumbers.push(i);
            }
            pageNumbers.push("ellipsis");
          } else if (currentPage >= totalPages - 3) {
            // 当前页靠近结束
            pageNumbers.push("ellipsis");
            for (let i = totalPages - 4; i <= totalPages - 1; i++) {
              pageNumbers.push(i);
            }
          } else {
            // 当前页在中间
            pageNumbers.push("ellipsis");
            pageNumbers.push(currentPage - 1);
            pageNumbers.push(currentPage);
            pageNumbers.push(currentPage + 1);
            pageNumbers.push("ellipsis");
          }

          // 始终显示最后一页
          pageNumbers.push(totalPages);

          // 生成页码按钮
          for (const item of pageNumbers) {
            if (item === "ellipsis") {
              paginatorHtml += '<span class="page-ellipsis">...</span>';
            } else {
              const isActive = item === currentPage;
              paginatorHtml += \`<button class="page-button \${
                isActive ? "active-page" : ""
              }" \${
                isActive ? "disabled" : \`onclick="jumpToAnswer(\${item - 1})"\`
              }>\${item}</button>\`;
            }
          }
        }

        paginatorHtml += "</div>";
        return paginatorHtml;
      };

      // 重新生成整个导航按钮区域的HTML
      const currentPage = validCurrentIndex + 1;
      const totalPages = loadedCount;
      const paginatorHtml = generatePaginatorHtml(currentPage, totalPages);

      navigationButtons.innerHTML = \`
        <button class="prev" onclick="loadPreviousAnswer()" \${validCurrentIndex === 0 ? "disabled" : ""}>
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20">
            <!-- Icon from OOUI by OOUI Team - https://github.com/wikimedia/oojs-ui/blob/master/LICENSE-MIT -->
            <path fill="currentColor" d="m4 10l9 9l1.4-1.5L7 10l7.4-7.5L13 1z"/>
          </svg>
          <span>上一个</span>
        </button>
        \${paginatorHtml}
        <button class="next" onclick="loadNextAnswer()" \${validCurrentIndex + 1 === loadedCount ? "disabled" : ""}>
          <span>下一个</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20">
            <!-- Icon from OOUI by OOUI Team - https://github.com/wikimedia/oojs-ui/blob/master/LICENSE-MIT -->
            <path fill="currentColor" d="M7 1L5.6 2.5L13 10l-7.4 7.5L7 19l9-9z"/>
          </svg>
        </button>
      \`;
    }

    // 2. 更新导航信息区域
    const navInfo = navigation.querySelector('.nav-info');
    if (navInfo) {
      // 生成页码跳转选择器
      const generatePageJumpSelector = () => {
        // 生成选项
        let options = "";
        for (let i = 0; i < loadedCount; i++) {
          const selected = i === validCurrentIndex ? "selected" : "";
          options += \`<option value="\${i}" \${selected}>\${i + 1}</option>\`;
        }

        return \`
          当前第
          <select onchange="jumpToAnswer(this.value)" class="answer-jump-select" title="跳转到指定回答（仅限已加载的回答）">
            \${options}
          </select>
          个回答
        \`;
      };

      // 生成加载图标
      const loadingIcon = isLoading
        ? \`<span class="loading-icon">
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
          </span>\`
        : "";

      // 重新生成整个nav-info区域的HTML
      const currentIndexText = generatePageJumpSelector();
      const totalText = totalCount > 0 ? \`共 \${totalCount} 个回答\` : "";

      navInfo.innerHTML = \`
        <span class="current-answer-info">\${currentIndexText}</span>
        <span class="separator">|</span>
        <div class="loaded-info">
          <span class="loaded-text">已加载 \${loadedCount} 个回答</span>
          \${loadingIcon}
        </div>
        \${totalText ? \`<span class="separator">| </span><span class="total-count">\${totalText}</span>\` : ""}
      \`;
    }
  });
}
`;