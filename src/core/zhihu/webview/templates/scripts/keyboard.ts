/**
 * 键盘导航脚本 - 快捷键处理
 */
export const keyboardScript = `
/**
 * 设置键盘导航
 */
function setupKeyboardNavigation() {
  // 设置焦点，以便触发键盘事件，就不用需要点一下才能触发了
  const letsFocus = document.createElement('div');
  letsFocus.setAttribute('id', 'focus-element');
  letsFocus.tabIndex = -1; // 使元素可聚焦
  letsFocus.style.outline = 'none'; // 隐藏焦点轮廓
  letsFocus.style.position = 'absolute'; // 绝对定位
  document.body.appendChild(letsFocus);
  letsFocus.focus();
  window.scrollTo(0, 0); // 滚动到顶部

  document.addEventListener('keyup', function(event) {
    const isFancyboxOpen = document.querySelector('.fancybox__container') !== null;
    // 如果fancybox打开了，那么不响应
    if (isFancyboxOpen) {
      return;
    }

    // 如果打开了 style-panel 并且 className 里面有 visible
    const stylePanel = document.getElementById('style-panel');
    // 如果在快捷键设置界面，不响应快捷键
    const shortcutsTab = document.querySelector('[data-tab="shortcuts"]');
    if (shortcutsTab && shortcutsTab.classList.contains('active') && stylePanel && stylePanel.classList.contains('visible')) {
      return;
    }

    // 首先检查自定义快捷键
    if (checkCustomShortcut(event)) {
      return; // 如果匹配了自定义快捷键，就不再执行默认的快捷键逻辑
    }

    // 左←箭头 - 上一个回答
    if (event.key === 'ArrowLeft') {
      loadPreviousAnswer();
    }

    // 右→箭头 - 下一个回答
    if (event.key === 'ArrowRight') {
      loadNextAnswer();
    }

    // Ctrl + 上箭头 - 上一篇文章/问题
    if (event.ctrlKey && event.key === 'ArrowUp') {
      // inner-link类型不响应上下篇切换快捷键
      if (sourceType === 'inner-link') {
        return;
      }
      loadPreviousArticle();
      event.preventDefault();
    }

    // Ctrl + 下箭头 - 下一篇文章/问题
    if (event.ctrlKey && event.key === 'ArrowDown') {
      // inner-link类型不响应上下篇切换快捷键
      if (sourceType === 'inner-link') {
        return;
      }
      loadNextArticle();
      event.preventDefault();
    }

    // W - 上一篇文章/问题
    if (event.key.toLowerCase() === 'w') {
      // inner-link类型不响应上下篇切换快捷键
      if (sourceType === 'inner-link') {
        return;
      }
      loadPreviousArticle();
    }

    // S - 下一篇文章/问题
    if (event.key.toLowerCase() === 's') {
      // inner-link类型不响应上下篇切换快捷键
      if (sourceType === 'inner-link') {
        return;
      }
      loadNextArticle();
    }

    // A - 上一个回答
    if (event.key.toLowerCase() === 'a') {
      loadPreviousAnswer();
    }

    // D - 下一个回答
    if (event.key.toLowerCase() === 'd') {
      loadNextAnswer();
    }

    // X - 切换沉浸模式
    if (event.key.toLowerCase() === 'x') {
      toggleImmersiveMode();
    }

    // C - 复制文章链接
    if (event.key.toLowerCase() === 'c') {
      const copyButton = document.querySelector('.copy-button');
      if (copyButton) {
        copyButton.click();
      }
    }

    // B - 在浏览器中打开
    if (event.key.toLowerCase() === 'b') {
      const openButton = document.querySelector('.open-button');
      if (openButton) {
        openButton.click();
      }
    }

    // F - 收藏文章
    if (event.key.toLowerCase() === 'f') {
      const favoriteButton = document.querySelector('.favorite-button');
      if (favoriteButton) {
        favoriteButton.click();
      }
    }

    // 句号 . - 切换样式面板
    if (event.key === '.') {
      toggleStylePanel();
    }

    // 逗号 , - 加载评论或滚动到评论区
    if (event.key === ',') {
      hanldeCommentsToggle();
    }

    // G - 切换灰度模式
    if (event.key.toLowerCase() === 'g') {
      toggleGrayscaleMode();
    }

    // / - 切换媒体显示模式
    if (event.key === '/') {
      toggleMediaDisplay();
    }

    // V - 回到顶部
    if (event.key.toLowerCase() === 'v') {
      backTop();
    }

    // T - 工具栏展开/收起（仅在沉浸模式下有效）
    if (event.key.toLowerCase() === 't') {
      if (isImmersiveMode) {
        toggleFixedToolbar();
      }
    }
  });
}

// 用于记录按键序列
let currentShortcut = '';

/**
 * 检查是否匹配自定义快捷键
 * @param {KeyboardEvent} event 键盘事件
 * @returns {boolean} 是否匹配了自定义快捷键
 */
function checkCustomShortcut(event) {
  const shortcutConfig = getShortcutConfig();

  // 构建当前按键组合字符串
  let key = '';

  // 添加修饰键
  if (event.ctrlKey) {
    key += 'Ctrl+';
  }
  if (event.altKey) {
    key += 'Alt+';
  }
  if (event.shiftKey) {
    key += 'Shift+';
  }

  // 处理特殊键名称
  if (event.code.startsWith('Digit')) {
    key += event.code.replace('Digit', '');
  } else if (event.code.startsWith('Key')) {
    key += event.code.replace('Key', '');
  } else if (event.key === '/') {
    key += '/';
  } else if (event.key === '.') {
    key += '.';
  } else if (event.key === ',') {
    key += ',';
  } else if (event.key === ';') {
    key += ';';
  } else if (event.key === "'") {
    key += "'";
  } else if (event.code === 'Backquote') {
    key += String.fromCharCode(96);
  } else if (event.key === '-') {
    key += '-';
  } else if (event.key === '=') {
    key += '=';
  } else if (event.key === '[') {
    key += '[';
  } else if (event.key === ']') {
    key += ']';
  } else if (event.key === '\\\\') {
    key += \`\\\\\`;
  } else if (event.key === 'ArrowUp') {
    key += '↑';
  } else if (event.key === 'ArrowDown') {
    key += '↓';
  } else if (event.key === 'ArrowLeft') {
    key += '←';
  } else if (event.key === 'ArrowRight') {
    key += '→';
  } else {
    // 对于其他键，使用 event.key 但转为大写
    key += event.key.length === 1 ? event.key.toUpperCase() : event.key;
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

  return false; // 没有找到匹配的快捷键
}
`;
