/**
 * 快捷键配置脚本 - 快捷键设置和管理
 */
export const shortcutsScript = `
/**
 * 获取快捷键配置
 */
function getShortcutConfig() {
  try {
    const saved = localStorage.getItem('zhihu-fisher-shortcut-config');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('读取快捷键配置失败:', error);
  }

  // 返回默认配置
  return getDefaultShortcutConfig();
}

/**
 * 保存快捷键配置
 */
function saveShortcutConfig(config) {
  try {
    localStorage.setItem('zhihu-fisher-shortcut-config', JSON.stringify(config));

    // 更新tooltip显示
    updateTooltipsWithShortcuts();
  } catch (error) {
    console.error('保存快捷键配置失败:', error);
  }
}

/**
 * 获取默认快捷键配置
 */
function getDefaultShortcutConfig() {
  return {
    'copy': ['C'],
    'open': ['B'],
    'favorite': ['F'],
    'style': ['.'],
    'comments': [','],
    'immersive': ['X'],
    'prev-article': ['W', 'Ctrl+↑'],
    'next-article': ['S', 'Ctrl+↓'],
    'prev-answer': ['A', '←'],
    'next-answer': ['D', '→'],
    'media-toggle': ['/'],
    'back-top': ['V'],
    'toolbar-toggle': ['T'],
    'grayscale': ['G'],
    'disguise': ['Space']
  };
}

/**
 * 渲染快捷键配置界面
 */
function renderShortcutConfig() {
  const container = document.getElementById('shortcuts-config-container');
  if (!container) return;

  const toolbarConfig = getToolbarConfig();
  const shortcutConfig = getShortcutConfig();

  // 按钮类别颜色
  const categoryColors = {
    'info': '#ffa726',
    'navigation': '#26a69a',
    'tools': '#2196f3',
    'function': '#f44336',
  };

  const categoryNames = {
    'info': '信息',
    'navigation': '导航',
    'tools': '工具',
    'function': '功能',
  };

  let html = '<div class="shortcut-buttons-list">';

  // 只显示可见的按钮
  toolbarConfig
    .filter(button => !['author', 'meta', 'feedback', 'donate'].includes(button.id)) // 排除不支持快捷键的按钮
    .sort((a, b) => a.order - b.order)
    .forEach(button => {
      const shortcuts = shortcutConfig[button.id] || [];
      const shortcutsArray = Array.isArray(shortcuts) ? shortcuts : (shortcuts ? [shortcuts] : []);
      const shortcutDisplay = shortcutsArray.join(' | ');

      html += \`
        <div class="shortcut-config-item" data-button-id="\${button.id}">
          <div class="shortcut-config-item-content">
            <span class="shortcut-config-item-title">\${button.name}</span>
            <span class="category-tag" style="background: \${categoryColors[button.category]};">
              \${categoryNames[button.category]}
            </span>
          </div>
          <div class="shortcut-config-controls">
            <div class="shortcut-inputs-container">
              \${shortcutsArray.map((shortcut, index) => \`
                <div class="shortcut-input-row">
                  <input
                    type="text"
                    id="shortcut-\${button.id}-\${index}"
                    value="\${shortcut}"
                    placeholder="点击设置快捷键"
                    title="点击设置快捷键"
                    readonly
                    onclick="startShortcutCapture('\${button.id}', \${index})"
                    class="shortcut-input"
                  >
                  <button
                    onclick="removeShortcut('\${button.id}', \${index})"
                    title="删除此快捷键"
                    class="shortcut-remove-btn"
                  >
                    ✕
                  </button>
                </div>
              \`).join('')}
              \${shortcutsArray.length === 0 ? \`
                <div class="shortcut-input-row">
                  <input
                    type="text"
                    id="shortcut-\${button.id}-0"
                    value=""
                    placeholder="点击设置快捷键"
                    title="点击设置快捷键"
                    readonly
                    onclick="startShortcutCapture('\${button.id}', 0)"
                    class="shortcut-input"
                  >
                  <button
                    onclick="removeShortcut('\${button.id}', 0)"
                    title="删除此快捷键"
                    class="shortcut-remove-btn"
                  >
                    ✕
                  </button>
                </div>
              \` : ''}
            </div>
            <button
              onclick="addShortcut('\${button.id}')"
              title="添加快捷键"
              class="shortcut-add-btn"
            >
              +
            </button>
            <button
              onclick="clearButtonShortcut('\${button.id}')"
              title="清除所有快捷键"
              class="shortcut-clear-btn"
            >
              清空
            </button>
          </div>
        </div>
      \`;
    });

  html += '</div>';

  // 添加全局快捷键设置
  html += \`
    <div class="global-shortcuts-section">
      <h4 class="global-shortcuts-title">全局快捷键</h4>
      <div class="global-shortcuts-desc">
        这些快捷键无需按钮即可使用
      </div>

      <div class="shortcut-config-item">
        <div class="global-shortcut-name">
          <span class="global-shortcut-name-text">媒体显示切换</span>
        </div>
        <div class="shortcut-config-controls">
          <input
            type="text"
            id="shortcut-media-toggle"
            value="\${shortcutConfig['media-toggle'] ? shortcutConfig['media-toggle'] : ''}"
            placeholder="点击设置快捷键"
            title="点击设置快捷键"
            readonly
            onclick="startShortcutCapture('media-toggle')"
            class="shortcut-input-single"
          >
          <button
            onclick="clearButtonShortcut('media-toggle')"
            title="清除快捷键"
            class="shortcut-clear-btn"
            style="display: \${shortcutConfig['media-toggle'] ? 'block' : 'none'};"
          >
            ✕
          </button>
        </div>
      </div>

      <div class="shortcut-config-item">
        <div class="global-shortcut-name">
          <span class="global-shortcut-name-text">回到顶部</span>
        </div>
        <div class="shortcut-config-controls">
          <input
            type="text"
            id="shortcut-back-top"
            value="\${shortcutConfig['back-top'] ? shortcutConfig['back-top'] : ''}"
            placeholder="点击设置快捷键"
            title="点击设置快捷键"
            readonly
            onclick="startShortcutCapture('back-top')"
            class="shortcut-input-single"
          >
          <button
            onclick="clearButtonShortcut('back-top')"
            title="清除快捷键"
            class="shortcut-clear-btn"
            style="display: \${shortcutConfig['back-top'] ? 'block' : 'none'};"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  \`;

  container.innerHTML = html;
}

/**
 * 开始快捷键捕获
 */
let capturingShortcut = null;
let capturingIndex = 0;
let capturingInput = null;

function startShortcutCapture(buttonId, index = 0) {
  let inputId;
  if (buttonId === 'media-toggle') {
    inputId = 'shortcut-media-toggle';
  } else if (buttonId === 'back-top') {
    inputId = 'shortcut-back-top';
  } else {
    inputId = \`shortcut-\${buttonId}-\${index}\`;
  }

  const input = document.getElementById(inputId);
  if (!input) return;

  capturingShortcut = buttonId;
  capturingIndex = index;
  capturingInput = input;

  // 保存原始值，用于取消时恢复
  input.setAttribute('data-original-value', input.value);

  input.value = '按下快捷键...';
  input.style.background = 'var(--vscode-inputValidation-infoBackground)';
  input.style.borderColor = 'var(--vscode-inputValidation-infoBorder)';

  // 获取输入框焦点，这样失去焦点时能够捕获到
  input.focus();

  // 添加键盘监听
  document.addEventListener('keydown', captureShortcut, true);

  // 添加失去焦点监听，如果点击其他地方取消设置
  input.addEventListener('blur', cancelShortcutCapture, { once: true });
}

/**
 * 取消快捷键捕获
 */
function cancelShortcutCapture() {
  if (!capturingShortcut || !capturingInput) return;

  // 恢复输入框状态
  capturingInput.value = capturingInput.getAttribute('data-original-value') || '';
  capturingInput.style.background = 'var(--vscode-input-background)';
  capturingInput.style.borderColor = 'transparent';

  // 移除监听
  document.removeEventListener('keydown', captureShortcut, true);
  capturingInput.removeEventListener('blur', cancelShortcutCapture);

  capturingShortcut = null;
  capturingIndex = 0;
  capturingInput = null;

  vscode.postMessage({
    command: 'showNotification',
    message: '已取消快捷键设置'
  });
}

/**
 * 添加快捷键
 */
function addShortcut(buttonId) {
  const shortcutConfig = getShortcutConfig();
  const shortcuts = shortcutConfig[buttonId] || [];
  const shortcutsArray = Array.isArray(shortcuts) ? shortcuts : (shortcuts ? [shortcuts] : []);

  // 添加空的快捷键
  shortcutsArray.push('');

  saveShortcutConfig({
    ...shortcutConfig,
    [buttonId]: shortcutsArray
  });

  renderShortcutConfig();
}

/**
 * 删除快捷键
 */
function removeShortcut(buttonId, index) {
  const shortcutConfig = getShortcutConfig();
  const shortcuts = shortcutConfig[buttonId] || [];
  const shortcutsArray = Array.isArray(shortcuts) ? shortcuts : (shortcuts ? [shortcuts] : ['']);

  if (shortcutsArray.length > index) {
    shortcutsArray.splice(index, 1);

    saveShortcutConfig({
      ...shortcutConfig,
      [buttonId]: shortcutsArray.length > 0 ? shortcutsArray : ['']
    });

    renderShortcutConfig();
    updateTooltipsWithShortcuts();
  }
}

/**
 * 检查快捷键是否与其他按钮冲突
 */
function findShortcutConflict(shortcut, currentButtonId, currentIndex = -1) {
  const config = getShortcutConfig();
  const toolbarConfig = getToolbarConfig();

  // 创建按钮名称映射
  const buttonNameMap = {
    'media-toggle': '媒体显示切换',
    'back-top': '回到顶部',
    'toolbar-toggle': '工具栏切换',
    ...toolbarConfig.reduce((map, button) => {
      map[button.id] = button.name;
      return map;
    }, {})
  };

  // 检查所有已配置的快捷键
  for (const [buttonId, shortcuts] of Object.entries(config)) {
    if (buttonId === currentButtonId) {
      // 对于当前按钮，检查是否与其他快捷键位置冲突
      if (shortcuts && Array.isArray(shortcuts) && currentIndex >= 0) {
        const conflictIndex = shortcuts.findIndex((key, index) =>
          key === shortcut && index !== currentIndex && key !== ''
        );
        if (conflictIndex !== -1) {
          return (buttonNameMap[buttonId] || buttonId) + ' (第' + (conflictIndex + 1) + '个快捷键)';
        }
      } else if (shortcuts && typeof shortcuts === 'string' && shortcuts === shortcut && currentIndex !== 0) {
        return (buttonNameMap[buttonId] || buttonId) + ' (第1个快捷键)';
      }
      continue; // 跳过其他检查，因为同一按钮内部冲突已检查完毕
    }

    // 检查与其他按钮的冲突
    if (shortcuts && Array.isArray(shortcuts) && shortcuts.includes(shortcut)) {
      return buttonNameMap[buttonId] || buttonId;
    } else if (shortcuts && typeof shortcuts === 'string' && shortcuts === shortcut) {
      return buttonNameMap[buttonId] || buttonId;
    }
  }

  return null;
}

/**
 * 捕获快捷键
 */
function captureShortcut(event) {
  if (!capturingShortcut) return;

  event.preventDefault();
  event.stopPropagation();

  // 检查是否按下 ESC 键取消设置
  if (event.key === 'Escape') {
    cancelShortcutCapture();
    return;
  }

  // 忽略单独的修饰键
  if (['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) {
    return;
  }

  // 构建快捷键字符串，使用 event.code 来区分小键盘
  let shortcut = '';
  if (event.ctrlKey) shortcut += 'Ctrl+';
  if (event.altKey) shortcut += 'Alt+';
  if (event.shiftKey) shortcut += 'Shift+';
  if (event.metaKey) shortcut += 'Meta+';

  // 优先使用 event.code 来区分主键盘和小键盘
  let key = event.code;

  // 处理特殊键
  if (event.key === ' ') {
    key = 'Space';
  } else if (key.startsWith('Digit')) {
    // 主键盘数字键：Digit0-9 -> 0-9
    key = key.replace('Digit', '');
  } else if (key.startsWith('Numpad')) {
    // 小键盘：保持 Numpad 前缀
    // NumpadEnter, Numpad0-9, NumpadAdd, etc.
  } else if (key.startsWith('Key')) {
    // 字母键：KeyA -> A
    key = key.replace('Key', '');
  } else if (key === 'Slash') {
    key = '/';
  } else if (key === 'Period') {
    key = '.';
  } else if (key === 'Comma') {
    key = ',';
  } else if (key === 'Semicolon') {
    key = ';';
  } else if (key === 'Quote') {
    key = "'";
  } else if (key === 'Backquote') {
    key = String.fromCharCode(96); // backtick
  } else if (key === 'Minus') {
    key = '-';
  } else if (key === 'Equal') {
    key = '=';
  } else if (key === 'BracketLeft') {
    key = '[';
  } else if (key === 'BracketRight') {
    key = ']';
  } else if (key === 'Backslash') {
    key = \`\\\\\`;
  } else if (key === 'ArrowUp') {
    key = '↑';
  } else if (key === 'ArrowDown') {
    key = '↓';
  } else if (key === 'ArrowLeft') {
    key = '←';
  } else if (key === 'ArrowRight') {
    key = '→';
  } else {
    // 对于其他键，使用 event.key 但转为大写
    key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
  }

  shortcut += key;

  // 检查快捷键是否已被其他按钮使用
  const config = getShortcutConfig();
  const conflictButton = findShortcutConflict(shortcut, capturingShortcut, capturingIndex);

  if (conflictButton) {
    // 恢复输入框状态
    capturingInput.value = capturingInput.getAttribute('data-original-value') || '';
    capturingInput.style.background = 'var(--vscode-input-background)';
    capturingInput.style.borderColor = 'transparent';

    // 移除监听
    document.removeEventListener('keydown', captureShortcut, true);
    capturingInput.removeEventListener('blur', cancelShortcutCapture);
    capturingShortcut = null;
    capturingIndex = 0;
    capturingInput = null;

    const map = {
      'media-toggle': '媒体显示切换',
      'back-top': '回到顶部',
      'toolbar-toggle': '收起/展开工具栏',
    }
    const conflictButtonName = map[conflictButton] || conflictButton;

    // 显示冲突提示
    vscode.postMessage({
      command: 'showNotification',
      message: \`快捷键 "\${shortcut}" 已被 "\${conflictButtonName}" 按钮使用，请选择其他快捷键\`,
      type: 'warning'
    });

    return;
  }

  // 获取当前配置
  const shortcuts = config[capturingShortcut] || [];
  const shortcutsArray = Array.isArray(shortcuts) ? shortcuts : (shortcuts ? [shortcuts] : []);

  // 更新指定索引的快捷键
  if (capturingIndex < shortcutsArray.length) {
    shortcutsArray[capturingIndex] = shortcut;
  } else {
    // 如果索引超出范围，添加到末尾
    shortcutsArray.push(shortcut);
  }

  // 保存配置
  config[capturingShortcut] = shortcutsArray;
  saveShortcutConfig(config);

  // 更新输入框显示
  if (capturingInput) {
    capturingInput.value = shortcut;
    capturingInput.style.background = 'var(--vscode-input-background)';
    capturingInput.style.borderColor = 'transparent';
  }

  // 立即更新工具提示，使新快捷键生效
  updateTooltipsWithShortcuts();

  // 移除监听
  document.removeEventListener('keydown', captureShortcut, true);
  if (capturingInput) {
    capturingInput.removeEventListener('blur', cancelShortcutCapture);
  }
  capturingShortcut = null;
  capturingIndex = 0;
  capturingInput = null;

  vscode.postMessage({
    command: 'showNotification',
    message: \`快捷键已设置: \${shortcut}\`
  });
}

/**
 * 清除按钮快捷键
 */
function clearButtonShortcut(buttonId) {
  const config = getShortcutConfig();
  config[buttonId] = [''];
  saveShortcutConfig(config);

  // 重新渲染
  renderShortcutConfig();
  updateTooltipsWithShortcuts();

  vscode.postMessage({
    command: 'showNotification',
    message: '快捷键已清除'
  });
}

/**
 * 重置快捷键配置
 */
function resetShortcutConfig(showTips = true) {
  const defaultConfig = getDefaultShortcutConfig();
  saveShortcutConfig(defaultConfig);
  renderShortcutConfig();

  if (!showTips) return;

  vscode.postMessage({
    command: 'showNotification',
    message: '快捷键已重置为默认配置'
  });
}

/**
 * 清空所有快捷键
 */
function clearAllShortcuts() {
  saveShortcutConfig({});
  renderShortcutConfig();

  vscode.postMessage({
    command: 'showNotification',
    message: '所有快捷键已清空，将使用默认快捷键'
  });
}

/**
 * 更新所有tooltip显示自定义快捷键
 */
function updateTooltipsWithShortcuts() {
  const shortcutConfig = getShortcutConfig();
  const toolbarConfig = getToolbarConfig();

  // 默认快捷键映射
  const defaultShortcuts = {
    'copy': ['C'],
    'open': ['B'],
    'favorite': ['F'],
    'style': ['。'],
    'comments': ['，'],
    'immersive': ['X'],
    'prev-article': ['Ctrl+↑', 'W'],
    'next-article': ['Ctrl+↓', 'S'],
    'prev-answer': ['←', 'A'],
    'next-answer': ['→', 'D']
  };

  toolbarConfig.forEach(function(button) {
    // 添加安全检查，确保按钮有必要属性
    if (!button || !button.id) {
      return;
    }

    // 跳过 author, meta, feedback, donate 按钮
    if (['author', 'meta', 'feedback', 'donate'].includes(button.id)) {
      return;
    }

    // 查找对应的按钮元素
    const buttonElements = document.querySelectorAll('.' + button.id + '-button');
    buttonElements.forEach(function(element) {
      let tooltip = button.tooltip || button.name || button.id || '';

      // 移除原有的快捷键信息（通过正则匹配括号内容）
      tooltip = tooltip.replace(/\\([^)]*\\)$/, '').trim();

      // 决定使用自定义快捷键还是默认快捷键
      const customShortcuts = shortcutConfig[button.id];
      const defaultShortcuts_button = defaultShortcuts[button.id];

      let finalShortcuts = [];

      // 检查用户是否有有效的自定义快捷键设置
      const hasValidCustomShortcuts = customShortcuts &&
        ((Array.isArray(customShortcuts) && customShortcuts.some(s => s && s.trim())) ||
        (typeof customShortcuts === 'string' && customShortcuts.trim()));

      if (hasValidCustomShortcuts) {
        // 使用自定义快捷键
        if (Array.isArray(customShortcuts)) {
          finalShortcuts = customShortcuts.filter(s => s && s.trim());
        } else {
          finalShortcuts = [customShortcuts.trim()];
        }
      } else {
        // 只有当用户完全没有设置或设置为空时，才使用默认快捷键
        const shouldUseDefault = !customShortcuts ||
          (Array.isArray(customShortcuts) && customShortcuts.length === 0) ||
          (Array.isArray(customShortcuts) && customShortcuts.every(key => !key || key.trim() === ''));

        if (shouldUseDefault && defaultShortcuts_button) {
          finalShortcuts = defaultShortcuts_button;
        }
      }

      // 添加快捷键信息
      if (finalShortcuts.length > 0) {
        tooltip += '(' + finalShortcuts.join(' | ') + ')';
      }

      element.setAttribute('tooltip', tooltip);
    });
  });

  // 处理全局快捷键
  const mediaToggleShortcuts = shortcutConfig['media-toggle'];
  const backTopShortcuts = shortcutConfig['back-top'];

  // 更新回到顶部按钮的tooltip
  const backTopButton = document.getElementById('scroll-to-top');
  if (backTopButton) {
    let tooltip = '回到顶部';

    // 检查是否有有效的自定义快捷键
    const hasValidBackTopShortcuts = backTopShortcuts &&
        ((Array.isArray(backTopShortcuts) && backTopShortcuts.some(s => s && s.trim())) ||
        (typeof backTopShortcuts === 'string' && backTopShortcuts.trim()));

    if (hasValidBackTopShortcuts) {
      // 使用自定义快捷键
      if (Array.isArray(backTopShortcuts)) {
        const validShortcuts = backTopShortcuts.filter(s => s && s.trim());
        if (validShortcuts.length > 0) {
          tooltip += '(' + validShortcuts.join(' | ') + ')';
        }
      } else {
        tooltip += '(' + backTopShortcuts + ')';
      }
    } else {
      // 只有当用户完全没有设置或设置为空时，才使用默认快捷键
      const shouldUseDefault = !backTopShortcuts ||
        (Array.isArray(backTopShortcuts) && backTopShortcuts.length === 0) ||
        (Array.isArray(backTopShortcuts) && backTopShortcuts.every(key => !key || key.trim() === ''));

      if (shouldUseDefault) {
        tooltip += '(V)'; // 默认快捷键
      }
    }

    backTopButton.setAttribute('tooltip', tooltip);
  }
}

/**
 * 检查按键是否匹配自定义快捷键
 */
function checkCustomShortcut(event) {
  // 如果正在捕获快捷键，不响应任何快捷键
  if (capturingShortcut) {
    console.log(capturingShortcut);
    return false;
  }

  const shortcutConfig = getShortcutConfig();

  // 构建当前按键的快捷键字符串
  let currentShortcut = '';
  if (event.ctrlKey) currentShortcut += 'Ctrl+';
  if (event.altKey) currentShortcut += 'Alt+';
  if (event.shiftKey) currentShortcut += 'Shift+';
  if (event.metaKey) currentShortcut += 'Meta+';

  // 使用 event.code 来区分小键盘
  let key = event.code;

  if (event.key === ' ') {
    key = 'Space';
  } else if (key.startsWith('Numpad')) {
    // 小键盘：保持 Numpad 前缀
    // NumpadEnter, Numpad0-9, NumpadAdd, etc.
  } else if (key.startsWith('Digit')) {
    key = key.replace('Digit', '');
  } else if (key.startsWith('Key')) {
    key = key.replace('Key', '');
  } else if (key === 'Slash') {
    key = '/';
  } else if (key === 'Period') {
    key = '.';
  } else if (key === 'Comma') {
    key = ',';
  } else if (key === 'Semicolon') {
    key = ';';
  } else if (key === 'Quote') {
    key = "'";
  } else if (key === 'Backquote') {
    key = String.fromCharCode(96);
  } else if (key === 'Minus') {
    key = '-';
  } else if (key === 'Equal') {
    key = '=';
  } else if (key === 'BracketLeft') {
    key = '[';
  } else if (key === 'BracketRight') {
    key = ']';
  } else if (key === 'Backslash') {
    key = \`\\\\\`;
  } else if (key === 'ArrowUp') {
    key = '↑';
  } else if (key === 'ArrowDown') {
    key = '↓';
  } else if (key === 'ArrowLeft') {
    key = '←';
  } else if (key === 'ArrowRight') {
    key = '→';
  } else {
    // 对于其他键，使用 event.key 但转为大写
    key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
  }

  currentShortcut += key;

  // 查找匹配的按钮
  for (const [buttonId, shortcuts] of Object.entries(shortcutConfig)) {
    if (shortcuts && Array.isArray(shortcuts) && shortcuts.includes(currentShortcut)) {
      event.preventDefault();

      if (buttonId === 'media-toggle') {
        // 媒体显示切换
        toggleMediaDisplay();
      } else if (buttonId === 'back-top') {
        // 回到顶部
        backTop();
      } else if (buttonId === 'toolbar-toggle') {
        // 工具栏切换
        if (isImmersiveMode && typeof toggleFixedToolbar === 'function') {
          toggleFixedToolbar();
        }
      } else if (buttonId === 'copy') {
        // 复制按钮
        const copyButton = document.querySelector('.copy-button');
        if (copyButton) {
          copyButton.click();
        }
      } else {
        // 对于所有其他按钮，直接点击按钮
        const buttonElement = document.querySelector('.' + buttonId + '-button');
        if (buttonElement) {
          buttonElement.click();
        }
      }

      return true; // 表示找到了匹配的快捷键
    }
  }

  // 这里还有一种情况是，比如下一个回答默认有两个快捷键：D 和 右箭头
  // 用户自定义时只设置了 D，那么按右箭头时不应该触发，只有当下一个回答的快捷键被清空时，才走默认快捷键
  // 检查是否应该使用默认快捷键
  const defaultShortcuts = getDefaultShortcutConfig();

  for (const [buttonId, defaultKeys] of Object.entries(defaultShortcuts)) {
    // 检查当前按键是否匹配某个按钮的默认快捷键
    if (defaultKeys && Array.isArray(defaultKeys) && defaultKeys.includes(currentShortcut)) {
      // 获取用户的自定义配置
      const userShortcuts = shortcutConfig[buttonId];

      // 只有当用户完全没有设置（undefined）或者设置为空数组时，才使用默认快捷键
      const shouldUseDefault = !userShortcuts ||
        (Array.isArray(userShortcuts) && userShortcuts.length === 0) ||
        (Array.isArray(userShortcuts) && userShortcuts.every(key => !key || key.trim() === ''));

      // 如果用户设置了快捷键，则阻止使用默认快捷键
      if (!shouldUseDefault) {
        return true;
      }
    }
  }

  return false; // 没有找到匹配的快捷键
}
`;
