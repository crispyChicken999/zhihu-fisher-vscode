/**
 * 工具栏配置脚本 - 工具栏按钮显示和排序管理
 */
export const toolbarScript = `
// ========================== 工具栏配置相关功能 ==========================

/**
 * 设置工具栏配置
 */
function setupToolbarConfig() {
  // 初始化工具栏配置显示
  renderToolbarConfig();
}

/**
 * 从localStorage初始化工具栏配置
 */
function initializeToolbarConfigFromLocalStorage() {
  try {
    const savedConfig = localStorage.getItem('zhihu-fisher-toolbar-config');
    if (savedConfig) {
      const userConfig = JSON.parse(savedConfig);

      // 如果之前保存的配置，缺少默认配置中的按钮，则补全，先看看有哪些按钮是缺失的，然后放到旧配置的后面，order顺延
      const defaultConfig = getDefaultToolbarConfig();
      const missingButtons = defaultConfig.filter(defBtn => !userConfig.some(oldBtn => oldBtn.id === defBtn.id));
      const maxOrder = userConfig.reduce((max, btn) => Math.max(max, btn.order), 0);
      missingButtons.forEach((btn, index) => {
        btn.order = maxOrder + index + 1;
        userConfig.push(btn);
      });

      localStorage.setItem('zhihu-fisher-toolbar-config', JSON.stringify(userConfig));

      // 直接应用配置到当前页面
      applyToolbarConfig(userConfig);
      // 同时更新配置面板显示
      renderToolbarConfig();
    }
  } catch (error) {
    console.warn('初始化工具栏配置失败:', error);
  }
}

/**
 * 渲染工具栏配置面板
 */
function renderToolbarConfig() {
  const container = document.getElementById('toolbar-config-container');
  if (!container) return;

  // 获取当前工具栏配置
  const toolbarConfig = getToolbarConfig();

  let html = '<div class="toolbar-buttons-list">';

  // 按order排序显示所有按钮
  toolbarConfig
    .sort((a, b) => a.order - b.order)
    .forEach(button => {
      // 根据分类添加标签颜色
      const categoryColors = {
        'info': '#ffa726',         // 绿色 - 信息功能
        'navigation': '#26a69a',  // 青色 - 导航功能
        'tools': '#2196f3',       // 蓝色 - 工具功能
        'function': '#f44336',    // 红色 - 核心功能
      };

      const categoryNames = {
        'info': '信息',
        'navigation': '导航',
        'tools': '工具',
        'function': '功能',
      };

      html += \`
        <div class="toolbar-config-item" data-button-id="\${button.id}" draggable="true">
          <label for="toolbar-\${button.id}">
            <!-- 复选框 -->
            <input type="checkbox" id="toolbar-\${button.id}" \${button.visible ? 'checked' : ''}
              onchange="toggleToolbarButton('\${button.id}', this.checked)"
              style="margin: 0; cursor: pointer;">

            <!-- 按钮信息 -->
            <div style="flex: 1; display: flex; align-items: center; gap: 8px;">
              <span style="margin: 0; cursor: pointer; font-size: 13px; font-weight: 500; padding: 5px 0;">
                \${button.name}
              </span>
              <span class="category-tag" style="font-size: 10px; padding: 2px 6px; border-radius: 10px; background: \${categoryColors[button.category]}; color: white; font-weight: bold;">
                \${categoryNames[button.category]}
              </span>
            </div>

            <!-- 顺序号 -->
            <span style="font-size: 11px; color: var(--vscode-descriptionForeground); min-width: 20px; text-align: center; background: var(--vscode-button-secondaryBackground); padding: 2px 6px; border-radius: 4px;">
              \${button.order}
            </span>

            <!-- 拖拽手柄 -->
            <span class="drag-handle" style="color: var(--vscode-descriptionForeground); cursor: move; font-size: 14px; font-weight: bold; padding: 0 4px; margin: 4px 0;">
              ⋮⋮
            </span>
          </label>
        </div>
      \`;
    });

  html += '</div>';

  container.innerHTML = html;

  // 初始化拖拽功能
  initializeToolbarDragAndDrop();
}

/**
 * 获取工具栏配置
 */
function getToolbarConfig() {
  try {
    // 从当前的工具栏组件获取配置，如果没有则使用默认配置
    const savedConfig = localStorage.getItem('zhihu-fisher-toolbar-config');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }

    // 返回默认配置
    return getDefaultToolbarConfig();
  } catch (error) {
    console.warn('获取工具栏配置失败:', error);
    return getDefaultToolbarConfig();
  }
}

/**
 * 获取默认工具栏配置
 */
function getDefaultToolbarConfig() {
  return [
    { id: 'author', name: '作者信息', category: 'info', visible: true, order: 1, },
    { id: 'meta', name: '文章信息', category: 'info', visible: true, order: 2, },
    { id: 'favorite', name: '收藏', category: 'function', visible: true, order: 3, },
    { id: 'open', name: '在浏览器中打开', category: 'tools', visible: true, order: 4, },
    { id: 'copy', name: '复制链接', category: 'tools', visible: true, order: 5, },
    { id: 'style', name: '设置', category: 'function', visible: true, order: 6, },
    { id: 'grayscale', name: '灰色模式', category: 'function', visible: true, order: 7, },
    { id: 'feedback', name: '问题反馈', category: 'tools', visible: true, order: 8, },
    { id: 'donate', name: '赞赏开发者', category: 'tools', visible: true, order: 9, },
    { id: 'immersive', name: '沉浸模式', category: 'function', visible: true, order: 10, },
    { id: 'comments', name: '查看评论', category: 'function', visible: true, order: 11, },
    { id: 'prev-article', name: '上一篇内容', category: 'navigation', visible: true, order: 12, },
    { id: 'next-article', name: '下一篇内容', category: 'navigation', visible: true, order: 13, },
    { id: 'prev-answer', name: '上一个回答', category: 'navigation', visible: true, order: 14, },
    { id: 'next-answer', name: '下一个回答', category: 'navigation', visible: true, order: 15, },
  ];
}

/**
 * 保存工具栏配置
 */
function saveToolbarConfig(config) {
  try {
    localStorage.setItem('zhihu-fisher-toolbar-config', JSON.stringify(config));
    // 立即应用配置到当前页面
    applyToolbarConfig(config);
  } catch (error) {
    console.error('保存工具栏配置失败:', error);
  }
}

/**
 * 应用工具栏配置到当前页面
 */
function applyToolbarConfig(config) {
  try {
    // 应用到固定工具栏
    const expandableToolbar = document.querySelector('.toolbar-expandable');
    if (expandableToolbar) {
      updateToolbarButtons(expandableToolbar, config, true);
    }

    // 检查并更新工具栏容器的显示状态
    updateToolbarContainerVisibility(config);
  } catch (error) {
    console.error('应用工具栏配置失败:', error);
  }
}

/**
 * 更新工具栏按钮的显示状态和顺序
 */
function updateToolbarButtons(toolbar, config, isExpandable) {
  const buttons = toolbar.querySelectorAll('.button');

  // 创建按钮映射
  const buttonMap = new Map();
  buttons.forEach(button => {
    const buttonId = getButtonIdFromClass(button.className);
    if (buttonId) {
      buttonMap.set(buttonId, button);
    }
  });

  // 先隐藏所有按钮
  buttons.forEach(button => {
    button.style.display = 'none';
  });

  // 按配置排序和显示按钮
  const sortedConfig = config
    .filter(btn => btn.visible) // 只显示visible为true的按钮
    .sort((a, b) => a.order - b.order);

  // 按新顺序重新显示和排列按钮
  sortedConfig.forEach((btnConfig, index) => {
    const button = buttonMap.get(btnConfig.id);
    if (button) {
      if (isExpandable) {
        // 可展开工具栏显示所有可见按钮
        button.style.display = 'flex';
        button.style.order = index.toString();

        // 如果配置中指定了 placement，则设置按钮的 placement
        if (btnConfig.placement) {
          button.setAttribute('placement', btnConfig.placement);
        }
      }
    }
  });
}

/**
 * 从按钮的class名称中提取按钮ID
 */
function getButtonIdFromClass(className) {
  // 尝试多种模式匹配按钮ID
  const patterns = [
    /([a-z-]+)-button/,
    /button[^a-z]*([a-z-]+)/,
    /toolbar-expandable-item[^a-z]*([a-z-]+)/
  ];

  for (const pattern of patterns) {
    const match = className.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // 如果是特殊按钮，直接检查ID
  const element = document.querySelector(\`.\${className.split(' ')[0]}\`);
  if (element && element.id) {
    return element.id;
  }

  // 检查常见的按钮类名
  const buttonMappings = {
    'scroll-to-top': 'scroll-to-top',
    'author-button': 'author',
    'meta-button': 'meta',
    'favorite-button': 'favorite',
    'open-button': 'open',
    'copy-button': 'copy',
    'style-button': 'style',
    'grayscale-button': 'grayscale',
    'feedback-button': 'feedback',
    'donate-button': 'donate',
    'immersive-button': 'immersive',
    'comments-button': 'comments',
    'prev-article-button': 'prev-article',
    'next-article-button': 'next-article',
    'prev-answer-button': 'prev-answer',
    'next-answer-button': 'next-answer'
  };

  for (const [cls, id] of Object.entries(buttonMappings)) {
    if (className.includes(cls)) {
      return id;
    }
  }

  return null;
}

/**
 * 更新工具栏容器的显示状态
 * @param {Array} config 工具栏配置数组
 */
function updateToolbarContainerVisibility(config) {
  // 检查是否有至少一个按钮可见
  const hasVisibleButton = config.some(btn => btn.visible);

  // 获取工具栏容器元素
  const toolbarExpandable = document.getElementById('toolbar-expandable');
  const toolbarToggle = document.getElementById('toolbar-toggle');

  if (toolbarExpandable && toolbarToggle) {
    if (hasVisibleButton) {
      // 至少有一个按钮可见，显示工具栏容器
      toolbarExpandable.style.display = '';
      toolbarToggle.style.display = '';
    } else {
      // 所有按钮都隐藏，隐藏工具栏容器
      toolbarExpandable.style.display = 'none';
      toolbarToggle.style.display = 'none';
    }
  }
}

/**
 * 切换工具栏按钮的可见性
 */
function toggleToolbarButton(buttonId, visible) {
  const config = getToolbarConfig();
  const button = config.find(btn => btn.id === buttonId);
  if (button) {
    button.visible = visible;
    saveToolbarConfig(config);

    // 检查并更新工具栏容器的显示状态
    updateToolbarContainerVisibility(config);
  }
}

/**
 * 隐藏工具栏按钮（从按钮的关闭按钮调用）
 */
function hideToolbarButton(buttonId, event) {
  event.stopPropagation(); // 阻止事件冒泡

  const config = getToolbarConfig();
  const button = config.find(btn => btn.id === buttonId);
  if (button) {
    button.visible = false;
    saveToolbarConfig(config);

    // 更新配置面板中的复选框状态
    const checkbox = document.getElementById(\`toolbar-\${buttonId}\`);
    if (checkbox) {
      checkbox.checked = false;
    }

    // 检查并更新工具栏容器的显示状态
    updateToolbarContainerVisibility(config);

    // 显示提示信息
    vscode.postMessage({
      command: 'showNotification',
      message: \`已隐藏"\${button.name}"按钮，可在样式设置面板中重新启用\`
    });
  }
}

/**
 * 重置工具栏配置为默认值
 */
function resetToolbarConfig() {
  const defaultConfig = getDefaultToolbarConfig();
  saveToolbarConfig(defaultConfig);
  renderToolbarConfig();

  // 检查并更新工具栏容器的显示状态
  updateToolbarContainerVisibility(defaultConfig);
}

/**
 * 全选/全不选工具栏按钮
 */
function toggleAllToolbarButtons() {
  const config = getToolbarConfig();
  const allVisible = config.every(btn => btn.visible);

  // 如果全部可见则隐藏全部，否则显示全部
  const newVisible = !allVisible;

  config.forEach(btn => {
    btn.visible = newVisible;
  });

  saveToolbarConfig(config);
  renderToolbarConfig();

  // 检查并更新工具栏容器的显示状态
  updateToolbarContainerVisibility(config);

  vscode.postMessage({
    command: 'showNotification',
    message: newVisible ? '已启用所有工具栏按钮' : '已隐藏所有工具栏按钮'
  });
}

/**
 * 初始化工具栏拖拽功能
 */
function initializeToolbarDragAndDrop() {
  const items = document.querySelectorAll('.toolbar-config-item');

  items.forEach(item => {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('drop', handleDrop);
    item.addEventListener('dragend', handleDragEnd);
  });
}

let draggedElement = null;

/**
 * 拖拽开始
 */
function handleDragStart(e) {
  draggedElement = this;
  this.style.opacity = '0.5';
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.outerHTML);
}

/**
 * 拖拽悬停
 */
function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  return false;
}

/**
 * 拖拽放置
 */
function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  if (draggedElement !== this) {
    // 交换元素位置
    const draggedId = draggedElement.getAttribute('data-button-id');
    const targetId = this.getAttribute('data-button-id');

    // 更新配置中的order
    updateButtonOrder(draggedId, targetId);
  }

  return false;
}

/**
 * 拖拽结束
 */
function handleDragEnd(e) {
  this.style.opacity = '1';
  draggedElement = null;
}

/**
 * 更新按钮顺序
 */
function updateButtonOrder(draggedId, targetId) {
  const config = getToolbarConfig();

  const draggedButton = config.find(btn => btn.id === draggedId);
  const targetButton = config.find(btn => btn.id === targetId);

  if (!draggedButton || !targetButton) return;

  const draggedOrder = draggedButton.order;
  const targetOrder = targetButton.order;

  // 如果拖拽到下方，将目标位置以上的按钮order减1，拖拽按钮设为目标order
  // 如果拖拽到上方，将目标位置以下的按钮order加1，拖拽按钮设为目标order
  if (draggedOrder < targetOrder) {
    // 向下拖拽：将中间的按钮order减1
    config.forEach(btn => {
      if (btn.order > draggedOrder && btn.order <= targetOrder) {
        btn.order--;
      }
    });
    draggedButton.order = targetOrder;
  } else if (draggedOrder > targetOrder) {
    // 向上拖拽：将中间的按钮order加1
    config.forEach(btn => {
      if (btn.order >= targetOrder && btn.order < draggedOrder) {
        btn.order++;
      }
    });
    draggedButton.order = targetOrder;
  }

  saveToolbarConfig(config);
  renderToolbarConfig();
}
`;
