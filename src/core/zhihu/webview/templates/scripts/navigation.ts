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
`;
