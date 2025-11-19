/**
 * 回答排序功能脚本
 */
export const answerSortScript = `
/**
 * 切换排序选择弹出层
 */
function toggleAnswerSortPopover() {
  const popover = document.getElementById('answerSortPopover');
  if (!popover) return;

  popover.classList.toggle('show');
}

/**
 * 切换回答排序方式
 * @param {string} sortType - 排序类型: 'default' 或 'updated'
 */
function switchAnswerSort(sortType) {
  // 从body的data属性获取当前排序类型
  const currentSortType = document.body.getAttribute('data-sort-type') || 'default';

  // 关闭popover
  const popover = document.getElementById('answerSortPopover');
  if (popover) {
    popover.classList.remove('show');
  }

  // 如果点击的是当前排序,不执行任何操作
  if (sortType === currentSortType) {
    console.log('当前排序已选中，无需切换', currentSortType);
    return;
  }

  // 从body的data属性获取问题ID
  const questionId = document.body.getAttribute('data-content-id');
  console.log('获取到的问题ID:', questionId);

  if (!questionId) {
    console.error('无法获取问题ID');
    return;
  }

  // 构建新的URL
  let newUrl;

  if (sortType === 'updated') {
    // 时间排序: https://www.zhihu.com/question/xxx/answers/updated
    newUrl = \`https://www.zhihu.com/question/\${questionId}/answers/updated\`;
  } else {
    // 默认排序: https://www.zhihu.com/question/xxx
    newUrl = \`https://www.zhihu.com/question/\${questionId}\`;
  }

  // 通知VS Code切换回答排序
  vscode.postMessage({
    command: 'switchAnswerSort',
    url: newUrl,
    sortType: sortType
  });
}
`;
