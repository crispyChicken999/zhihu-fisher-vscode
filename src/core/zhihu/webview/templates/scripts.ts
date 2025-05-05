/**
 * 脚本模板
 */
export const scriptsTemplate = `
// VS Code WebView API
const vscode = acquireVsCodeApi();

// 媒体显示模式
let currentMediaMode = "\${MEDIA_DISPLAY_MODE}";

// 当前回答索引
let currentAnswerIndex = \${CURRENT_ANSWER_INDEX};

// 已加载回答数
let loadedAnswerCount = \${LOADED_ANSWER_COUNT};

// 文章ID
const articleId = "\${ARTICLE_ID}";

// 文档加载完成后执行
document.addEventListener("DOMContentLoaded", function() {
  setupKeyboardNavigation();
  setupStylePanel();

  // 初始化媒体显示模式
  updateMediaDisplayClass(currentMediaMode);

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
          mode: mode
        });
      }
    });
  }
});

/**
 * 设置键盘导航
 */
function setupKeyboardNavigation() {
  document.addEventListener('keyup', function(event) {
    // 左箭头 - 上一个回答
    if (event.key === 'ArrowLeft') {
      loadPreviousAnswer();
    }

    // 右箭头 - 下一个回答
    if (event.key === 'ArrowRight') {
      loadNextAnswer();
    }

    // 按/键切换媒体显示模式
    if (event.key === '/') {
      toggleMediaDisplay();
    }

    if (event.key === '.') {
      toggleStylePanel();
    }
  });
}

/**
 * 设置样式面板
 */
function setupStylePanel() {
  // 默认样式
  const defaultStyles = {
    fontSize: '13px',
    lineHeight: '1.6',
    maxWidth: '800px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe WPC", "Segoe UI", system-ui, "Ubuntu", "Droid Sans", sans-serif',
    contentColor: getComputedStyle(document.body).getPropertyValue('--vscode-foreground').trim(),
    textAlign: 'left'
  };

  // 从localStorage加载样式设置
  const savedStyles = JSON.parse(localStorage.getItem('savedStyles')) || defaultStyles;

  if (savedStyles) {
    // 更新页面的样式
    document.body.style.fontSize = savedStyles.fontSize;
    document.body.style.lineHeight = savedStyles.lineHeight;
    document.body.style.maxWidth = savedStyles.maxWidth;
    document.body.style.fontFamily = savedStyles.fontFamily;
    document.querySelector('.article-content').style.color = savedStyles.contentColor;
    document.querySelector('.article-content').style.textAlign = savedStyles.textAlign;
  }

  const updateLocalStorage = () => {
    const styles = {
      fontSize: document.body.style.fontSize,
      lineHeight: document.body.style.lineHeight,
      maxWidth: document.body.style.maxWidth,
      fontFamily: document.body.style.fontFamily,
      contentColor: document.querySelector('#content-color').value,
      textAlign: document.querySelector('.article-content').style.textAlign
    };
    localStorage.setItem('savedStyles', JSON.stringify(styles));
  }

  // 字体大小滑块
  const fontSizeSlider = document.getElementById('font-size-slider');
  const fontSizeValue = document.getElementById('font-size-value');

  if (fontSizeSlider && fontSizeValue) {
    fontSizeSlider.addEventListener('input', function() {
      const fontSize = this.value;
      fontSizeValue.textContent = fontSize + 'px';
      document.body.style.fontSize = fontSize + 'px';
      updateLocalStorage();
    });

    fontSizeSlider.value = savedStyles.fontSize.replace('px', '') || defaultStyles.fontSize.replace('px', '');
    fontSizeValue.textContent = savedStyles.fontSize || defaultStyles.fontSize;
  }

  // 行高滑块
  const lineHeightSlider = document.getElementById('line-height-slider');
  const lineHeightValue = document.getElementById('line-height-value');

  if (lineHeightSlider && lineHeightValue) {
    lineHeightSlider.addEventListener('input', function() {
      const lineHeight = this.value;
      lineHeightValue.textContent = lineHeight;
      document.body.style.lineHeight = lineHeight;
      updateLocalStorage();
    });

    lineHeightSlider.value = savedStyles.lineHeight || defaultStyles.lineHeight;
    lineHeightValue.textContent = savedStyles.lineHeight || defaultStyles.lineHeight;
  }

  // 最大宽度滑块
  const maxWidthSlider = document.getElementById('max-width-slider');
  const maxWidthValue = document.getElementById('max-width-value');

  if (maxWidthSlider && maxWidthValue) {
    maxWidthSlider.addEventListener('input', function() {
      const maxWidth = this.value;
      maxWidthValue.textContent = maxWidth + 'px';
      document.body.style.maxWidth = maxWidth + 'px';
      updateLocalStorage();
    });

    maxWidthSlider.value = savedStyles.maxWidth.replace('px', '') || defaultStyles.maxWidth.replace('px', '');
    maxWidthValue.textContent = savedStyles.maxWidth || defaultStyles.maxWidth;
  }

  // 字体选择器
  const fontFamilySelect = document.getElementById('font-family-select');

  if (fontFamilySelect) {
    fontFamilySelect.addEventListener('change', function() {
      document.body.style.fontFamily = this.value;
      updateLocalStorage();
    });

    fontFamilySelect.value = savedStyles.fontFamily || defaultStyles.fontFamily;
    // 设置默认选中项
    const options = fontFamilySelect.options;
    for (let i = 0; i < options.length; i++) {
      if (options[i].value === fontFamilySelect.value) {
        options[i].selected = true;
        break;
      }
    }
  }

  // 字体颜色选择器 content-color-picker input
  const contentColorPicker = document.getElementById('content-color-picker');

  if (contentColorPicker) {
    const colorInput = contentColorPicker.querySelector('input[type="color"]');
    const colorValue = document.getElementById('content-color-value');

    if (colorInput && colorValue) {
      colorInput.addEventListener('input', function() {
        const color = this.value;
        colorValue.textContent = color;
        document.querySelector('.article-content').style.color = color;
        updateLocalStorage();
      });

      colorInput.value = savedStyles.contentColor || defaultStyles.contentColor;
      colorValue.textContent = savedStyles.contentColor || defaultStyles.contentColor;
    }
  }

  // 对齐方式选择器 text-align input radio
  const textAlignSelect = document.querySelectorAll('input[name="text-align"]');
  if (textAlignSelect) {
    textAlignSelect.forEach(function(radio) {
      radio.addEventListener('change', function() {
        const textAlign = this.value;
        document.querySelector('.article-content').style.textAlign = textAlign;
        updateLocalStorage();
      });

      if (radio.value === savedStyles.textAlign || radio.value === defaultStyles.textAlign) {
        radio.checked = true;
      }
    });
  }


  // 重置按钮
  const resetButton = document.getElementById('style-reset-button');

  if (resetButton) {
    resetButton.addEventListener('click', function() {
      // 重置所有样式
      document.body.style.fontSize = defaultStyles.fontSize;
      document.body.style.lineHeight = defaultStyles.lineHeight;
      document.body.style.maxWidth = defaultStyles.maxWidth;
      document.body.style.fontFamily = defaultStyles.fontFamily;
      document.querySelector('.article-content').style.color = defaultStyles.contentColor;
      document.querySelector('.article-content').style.textAlign = defaultStyles.textAlign;

      // 重置控件值
      if (fontSizeSlider && fontSizeValue) {
        fontSizeSlider.value = defaultStyles.fontSize.replace('px', '');
        fontSizeValue.textContent = defaultStyles.fontSize;
      }

      if (lineHeightSlider && lineHeightValue) {
        lineHeightSlider.value = defaultStyles.lineHeight;
        lineHeightValue.textContent = defaultStyles.lineHeight;
      }

      if (maxWidthSlider && maxWidthValue) {
        maxWidthSlider.value = defaultStyles.maxWidth.replace('px', '');
        maxWidthValue.textContent = defaultStyles.maxWidth;
      }

      if (fontFamilySelect) {
        fontFamilySelect.value = defaultStyles.fontFamily;
      }

      if (contentColorPicker) {
        const colorInput = contentColorPicker.querySelector('input[type="color"]');
        const colorValue = document.getElementById('content-color-value');
        if (colorInput && colorValue) {
          colorInput.value = defaultStyles.contentColor;
          colorValue.textContent = defaultStyles.contentColor;
        }
      }

      if (textAlignSelect) {
        textAlignSelect.value = defaultStyles.textAlign;
      }

      // 更新localStorage
      localStorage.removeItem('savedStyles');
    });
  }
}

/**
 * 切换媒体显示模式
 */
function toggleMediaDisplay() {
  const modes = ['normal', 'mini', 'none'];
  const currentIndex = modes.indexOf(currentMediaMode);
  const nextIndex = (currentIndex + 1) % modes.length;
  currentMediaMode = modes[nextIndex];

  // 更新DOM
  updateMediaDisplayClass(currentMediaMode);

  // 更新单选框
  const radio = document.querySelector(\`input[name="media-display"][value="\${currentMediaMode}"]\`);
  if (radio) {
    radio.checked = true;
  }

  // 保存设置
  vscode.postMessage({ command: "toggleMedia" });
}

// changeMediaMode
function changeMediaMode(mode) {
  currentMediaMode = mode;
  updateMediaDisplayClass(currentMediaMode);

  // 更新单选框
  const radio = document.querySelector(\`input[name="media-display"][value="\${currentMediaMode}"]\`);
  if (radio) {
    radio.checked = true;
  }

  // 保存设置
  vscode.postMessage({ command: "setMediaMode", mode: currentMediaMode });
}

/**
 * 更新媒体显示模式的CSS类
 * @param {string} mode 媒体显示模式
 */
function updateMediaDisplayClass(mode) {
  const content = document.querySelector('.article-content');
  const meta = document.querySelector('.article-meta');

  if (content && meta) {
    // 移除所有模式类
    content.classList.remove('hide-media', 'mini-media');
    meta.classList.remove('hide-media', 'mini-media');

    // 添加当前模式类
    if (mode === 'none') {
      content.classList.add('hide-media');
      meta.classList.add('hide-media');
    } else if (mode === 'mini') {
      content.classList.add('mini-media');
      meta.classList.add('mini-media');
    }
  }
}

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
 * 复制链接到剪贴板
 * @param {string} url 链接URL
 */
function copyLink(button,url) {
  // 使用Clipboard API复制链接
  const tempInput = document.createElement('input');
  tempInput.value = url;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);

  // 暂时改变按钮文字
  const originalText = button.innerHTML;
  button.innerHTML = \`
    <div style="display: flex; align-items: center; gap: 5px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M18.333 6A3.667 3.667 0 0 1 22 9.667v8.666A3.667 3.667 0 0 1 18.333 22H9.667A3.667 3.667 0 0 1 6 18.333V9.667A3.667 3.667 0 0 1 9.667 6zM15 2c1.094 0 1.828.533 2.374 1.514a1 1 0 1 1-1.748.972C15.405 4.088 15.284 4 15 4H5c-.548 0-1 .452-1 1v9.998c0 .32.154.618.407.805l.1.065a1 1 0 1 1-.99 1.738A3 3 0 0 1 2 15V5c0-1.652 1.348-3 3-3zm1.293 9.293L13 14.585l-1.293-1.292a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 0 0-1.414-1.414"/></svg>
      <span>已复制</span>
    </div>
  \`;

  // 3秒后恢复
  setTimeout(() => {
    button.innerHTML = originalText;
  }, 3000);
}

/**
 * 显示图片预览
 * @param {string} src 图片URL
 */
function showImagePreview(src) {
  const preview = document.getElementById('image-preview');
  const previewImage = document.getElementById('preview-image');
  
  if (preview && previewImage) {
    previewImage.src = src;
    preview.style.display = 'flex';
    
    // 禁止滚动
    document.body.style.overflow = 'hidden';
  }
}

/**
 * 隐藏图片预览
 */
function hideImagePreview() {
  const preview = document.getElementById('image-preview');
  
  if (preview) {
    preview.style.display = 'none';
    
    // 恢复滚动
    document.body.style.overflow = '';
  }
}

/**
 * 复制代码
 * @param {HTMLElement} button 复制按钮
 */
function copyCode(button) {
  const pre = button.parentElement;
  const code = pre.getAttribute('data-code');
  
  if (code) {
    // 使用Clipboard API复制代码
    const tempInput = document.createElement('input');
    tempInput.value = code;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    // 暂时改变按钮文字
    const originalText = button.textContent;
    button.textContent = '已复制';
    
    // 3秒后恢复
    setTimeout(() => {
      button.textContent = originalText;
    }, 3000);
  }
}

/**
 * 下载媒体文件
 * @param {string} url 媒体文件URL
 * @param {string} type 媒体类型
 */
function downloadMedia(url, type) {
  vscode.postMessage({
    command: 'downloadMedia',
    url: url,
    type: type
  });
}

/**
 * 切换样式面板显示
 */
function toggleStylePanel() {
  const panel = document.getElementById('style-panel');
  const mask = document.querySelector('.style-panel-mask');

  if (panel && mask) {
    const isVisible = panel.classList.contains('visible');

    if (isVisible) {
      panel.classList.remove('visible');
      mask.classList.remove('visible');
    } else {
      panel.classList.add('visible');
      mask.classList.add('visible');
    }
  }
}
`;
