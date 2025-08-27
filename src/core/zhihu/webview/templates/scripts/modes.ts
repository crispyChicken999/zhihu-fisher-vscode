/**
 * 模式设置脚本 - 沉浸模式、灰色模式等
 */
export const modesScript = `
/**
 * 设置灰色模式
 */
function setupGrayscaleMode() {
  // 从localStorage获取灰色模式状态
  const isGrayscaleMode = localStorage.getItem('zhihu-fisher-grayscale-mode') === 'true';

  // 如果灰色模式已开启，应用灰色模式样式
  if (isGrayscaleMode) {
    document.querySelector('html').classList.add('grayscale-mode');
  }

  // 初始化复选框状态（需要等DOM加载完成）
  setTimeout(() => {
    const grayscaleToggle = document.getElementById('grayscale-toggle');
    if (grayscaleToggle) {
      grayscaleToggle.checked = isGrayscaleMode;
    }
  }, 100);
}

/**
 * 切换灰色模式
 */
function toggleGrayscaleMode(enabled) {
  if (enabled !== undefined) {
    // 如果传入了参数，使用参数值
    if (enabled) {
      document.querySelector('html').classList.add('grayscale-mode');
    } else {
      document.querySelector('html').classList.remove('grayscale-mode');
    }

    // 保存状态到localStorage
    localStorage.setItem('zhihu-fisher-grayscale-mode', enabled);
  } else {
    // 如果没有传入参数，切换当前状态
    const currentEnabled = document.querySelector('html').classList.contains('grayscale-mode');
    const newEnabled = !currentEnabled;

    if (newEnabled) {
      document.querySelector('html').classList.add('grayscale-mode');
    } else {
      document.querySelector('html').classList.remove('grayscale-mode');
    }

    // 保存状态到localStorage
    localStorage.setItem('zhihu-fisher-grayscale-mode', newEnabled);

    // 同步设置面板中的复选框状态
    const grayscaleToggle = document.getElementById('grayscale-toggle');
    if (grayscaleToggle) {
      grayscaleToggle.checked = newEnabled;
    }
  }
}

/**
 * 设置沉浸模式
 */
function setupImmersiveMode() {
  // 从localStorage获取沉浸模式状态
  isImmersiveMode = localStorage.getItem('zhihu-fisher-immersive-mode') === 'true';

  // 如果沉浸模式已开启，应用沉浸模式样式
  if (isImmersiveMode) {
    document.body.classList.add('immersive-mode');
  }
}

/**
 * 切换沉浸模式
 */
function toggleImmersiveMode() {
  isImmersiveMode = !isImmersiveMode;

  if (isImmersiveMode) {
    document.body.classList.add('immersive-mode');
    // 进入沉浸模式时，确保工具栏状态正确设置
    setFixedToolbarExpanded(isFixedToolbarExpanded);
  } else {
    document.body.classList.remove('immersive-mode');
  }

  // 保存状态到localStorage
  localStorage.setItem('zhihu-fisher-immersive-mode', isImmersiveMode);

  // 重新获取并应用工具栏配置（因为某些按钮的可见性依赖于沉浸模式状态）
  const config = getToolbarConfig();
  applyToolbarConfig(config);

  // 回到顶部
  window.scrollTo(0, 0);
}

/**
 * 设置固定工具栏
 */
function setupFixedToolbar() {
  // 从localStorage获取工具栏展开状态，默认首次使用时展开
  const savedState = localStorage.getItem('zhihu-fisher-toolbar-expanded');
  isFixedToolbarExpanded = savedState === null ? true : savedState === 'true';

  // 应用初始状态
  setFixedToolbarExpanded(isFixedToolbarExpanded);
}

/**
 * 切换固定工具栏展开/收起状态
 */
function toggleFixedToolbar() {
  isFixedToolbarExpanded = !isFixedToolbarExpanded;
  setFixedToolbarExpanded(isFixedToolbarExpanded);

  // 保存状态到localStorage
  localStorage.setItem('zhihu-fisher-toolbar-expanded', isFixedToolbarExpanded);
}

/**
 * 设置固定工具栏展开状态
 * @param {boolean} expanded 是否展开
 */
function setFixedToolbarExpanded(expanded) {
  const toolbarExpandable = document.getElementById('toolbar-expandable');
  const toggleButton = document.getElementById('toolbar-toggle');

  if (!toolbarExpandable || !toggleButton) {
    // 如果元素还没有加载，延迟执行
    setTimeout(() => setFixedToolbarExpanded(expanded), 100);
    return;
  }

  const toggleIcon = toggleButton.querySelector('svg path');

  if (expanded) {
    toolbarExpandable.classList.add('expanded');
    toggleButton.classList.add('expanded');
    toggleButton.setAttribute('tooltip', '收起工具栏(T)');
    // 展开状态：箭头向下（收起图标）
    if (toggleIcon) {
      toggleIcon.setAttribute('d', 'M12 16l6-6-1.41-1.41L12 13.17l-4.59-4.58L6 10z');
    }
  } else {
    toolbarExpandable.classList.remove('expanded');
    toggleButton.classList.remove('expanded');
    toggleButton.setAttribute('tooltip', '展开工具栏(T)');
    // 收起状态：箭头向上（展开图标）
    if (toggleIcon) {
      toggleIcon.setAttribute('d', 'M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z');
    }
  }
}
`;
