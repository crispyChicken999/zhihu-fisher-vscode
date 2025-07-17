/**
 * 脚本模板
 */
export const scriptsTemplate = `
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
    }, 100);
  }
});

/**
 * 设置图片FancyBox功能
 */
function setupImageFancyBox() {
  // 等待jQuery和Fancybox加载完成
  if (typeof jQuery !== 'undefined' && typeof Fancybox !== 'undefined') {
    // 初始化FancyBox
    initializeFancyBox();

    // 监听内容变化，动态更新图片的fancybox属性
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
          // 延迟一下确保DOM更新完成
          setTimeout(initializeFancyBox, 100);
        }
      });
    });

    // 监听文章内容区域的变化
    const articleContent = document.querySelector('.article-content');
    if (articleContent) {
      observer.observe(articleContent, { childList: true, subtree: true });
    }
  } else {
    // 如果库还没加载完成，延迟再试
    setTimeout(setupImageFancyBox, 100);
  }
}

/**
 * 初始化FancyBox
 */
function initializeFancyBox() {
  try {
    // 为文章内容中的图片添加fancybox属性
    const images = document.querySelectorAll('.article-content img:not(.formula):not(.fancybox-processed)');
    images.forEach(function(img) {
      // 跳过公式图片
      if (img.classList.contains('formula')) {
        return;
      }

      // 添加data-fancybox属性
      img.setAttribute('data-fancybox', 'article-gallery');
      img.setAttribute('data-caption', img.alt || img.title || '图片');
      img.classList.add('fancybox-processed');

      // 添加鼠标样式提示
      img.style.cursor = 'pointer';
      img.title = '点击查看大图';
    });

    // 为评论中的图片添加fancybox属性（包括新加载的评论）
    const commentImages = document.querySelectorAll('.comments-container img:not(.fancybox-processed), .comments-modal-container img:not(.fancybox-processed)');
    commentImages.forEach(function(img) {
      // 跳过头像图片
      if (img.classList.contains('zhihu-comment-avatar') || img.classList.contains('zhihu-child-comment-avatar')) {
        return;
      }

      // 只处理评论内容中的图片
      if (img.classList.contains('comment-image')) {
        img.setAttribute('data-fancybox', 'comment-gallery');
        img.setAttribute('data-caption', '评论图片');
        img.classList.add('fancybox-processed');
        img.style.cursor = 'pointer';
        img.title = '点击查看大图';
      }
    });

    // 重新绑定Fancybox到所有具有data-fancybox属性的元素
    Fancybox.destroy(); // 先销毁现有实例
    Fancybox.bind('[data-fancybox]', {
      // 配置选项
      Toolbar: {
        display: {
          left: ['infobar'],
          middle: [],
          right: ['slideshow', 'thumbs', 'close']
        }
      },
      Thumbs: {
        showOnStart: false
      },
      Images: {
        zoom: true
      },
      // 自定义样式
      parentEl: document.body,
      dragToClose: true,
      hideScrollbar: false,
      placeFocusBack: false,
      trapFocus: false
    });
  } catch (error) {
    console.log('FancyBox初始化失败:', error);
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

/**
 * 加载评论|收起评论|展开评论
 */
function hanldeCommentsToggle() {
  const commentsContainer = document.querySelector('.comments-container');
  const loadCommentsBtn = document.querySelector('.zhihu-load-comments-btn');

  if (loadCommentsBtn) {
    // 如果找到按钮，那么说明没有加载评论，点击按钮加载评论
    const answerId = commentsContainer.getAttribute('data-answer-id');
    loadComments(answerId);
  } else {
    // 如果已经加载评论了，判断是否滚动到评论区
    const isInViewport = isElementInViewport(commentsContainer);
    if (isInViewport) {
      // 如果评论区在可视范围内，则收起评论
      const answerId = commentsContainer.getAttribute('data-answer-id');
      toggleCommentStatus(answerId);
    } else {
      // 如果评论区不在可视范围内，则滚动到评论区
      commentsContainer.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

/**
 * 判断元素是否在视口内
 * @param {HTMLElement} el 元素
 * @returns {boolean} 是否在视口内
 */
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

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

    // 左←箭头 - 上一个回答
    if (event.key === 'ArrowLeft') {
      loadPreviousAnswer();
    }

    // 右→箭头 - 下一个回答
    if (event.key === 'ArrowRight') {
      loadNextAnswer();
    }

    // 按 / 键切换媒体显示模式
    if (event.key === '/') {
      toggleMediaDisplay();
    }

    // 按 . 键切换样式面板
    if (event.key === '.') {
      toggleStylePanel();
    }

    // 按逗号 , 键切换评论区显示（展开/收起）
    if (event.key === ',') {
      hanldeCommentsToggle();
    }

    // 按 X 键切换沉浸模式
    if (event.key === 'x') {
      toggleImmersiveMode();
    }

    // 按 C 键复制链接
    if (event.key === 'c') {
      const copyButton = isImmersiveMode ?
        document.querySelector('.immersive-button.copy-button') :
        document.querySelector('.copy-button');

      // 如果ctrl也被按下，则不响应复制
      if (event.ctrlKey || event.metaKey) {
        return; // 不执行复制操作
      }

      if (copyButton) {
        copyLink(copyButton, copyButton.getAttribute('data-url'), isImmersiveMode);

        vscode.postMessage({
          command: 'showNotification',
          message: '链接已复制到剪贴板'
        });
      }
    }

    // 按 B 键浏览器打开链接
    if (event.key === 'b') {
      const openButton = document.querySelector('.open-button');
      if (openButton) {
        openButton.click();
      }
    }

    // 按 V 键回到顶部
    if (event.key === 'v') {
      backTop();
    }

    // 按 F 键收藏内容
    if (event.key === 'f') {
      const favoriteButton = document.querySelector('.favorite-button');
      if (favoriteButton) {
        favoriteButton.click();
      }
    }

    // 按 T 键切换工具栏展开/收起状态（仅在沉浸模式下有效）
    if (event.key === 't' && isImmersiveMode) {
      toggleFixedToolbar();
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
    document.querySelector('header').style.color = savedStyles.contentColor;
    document.querySelector('.article-content').style.color = savedStyles.contentColor;
    document.querySelector('.comments-container').style.color = savedStyles.contentColor;
    document.querySelector('.comments-modal-container').style.color = savedStyles.contentColor;
    document.querySelector('.article-content').style.textAlign = savedStyles.textAlign;
    document.querySelector('.comments-container').style.textAlign = savedStyles.textAlign;
    document.querySelector('.comments-modal-container').style.textAlign = savedStyles.textAlign;
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
        document.querySelector('header').style.color = color;
        document.querySelector('.article-content').style.color = color;
        document.querySelector('.comments-container').style.color = color;
        document.querySelector('.comments-modal-container').style.color = color;
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
        document.querySelector('header').style.textAlign = textAlign;
        document.querySelector('.article-content').style.textAlign = textAlign;
        document.querySelector('.comments-container').style.textAlign = textAlign;
        document.querySelector('.comments-modal-container').style.textAlign = textAlign;
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
      document.querySelector('header').style.color = defaultStyles.contentColor;
      document.querySelector('header').style.textAlign = defaultStyles.textAlign;
      document.querySelector('.article-content').style.color = defaultStyles.contentColor;
      document.querySelector('.comments-container').style.color = defaultStyles.contentColor;
      document.querySelector('.comments-modal-container').style.color = defaultStyles.contentColor;
      document.querySelector('.article-content').style.textAlign = defaultStyles.textAlign;
      document.querySelector('.comments-container').style.textAlign = defaultStyles.textAlign;
      document.querySelector('.comments-modal-container').style.textAlign = defaultStyles.textAlign;

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

        // 设置默认选中项
        const options = fontFamilySelect.options;
        for (let i = 0; i < options.length; i++) {
          if (options[i].value === fontFamilySelect.value) {
            options[i].selected = true;
            break;
          }
        }
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
 * 设置返回顶部按钮
 */
function setupBackTopButton() {
  const scrollToTopBtn = document.getElementById('scroll-to-top');

  document.addEventListener('scroll', function() {
    // 当页面滚动超过100px时显示按钮，否则隐藏
    if (window.scrollY > 100) {
      scrollToTopBtn.style.display = 'flex';
    } else {
      scrollToTopBtn.style.display = 'none';
    }
  });
}

// 回到顶部
function backTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // 显示或隐藏mini缩放比例设置
  const miniScaleOption = document.getElementById('mini-scale-option');
  if (miniScaleOption) {
    miniScaleOption.style.display = mode === 'mini' ? 'block' : 'none';
  }

  // 更新单选框
  const radio = document.querySelector(\`input[name="media-display"][value="\${currentMediaMode}"]\`);
  if (radio) {
    radio.checked = true;
  }

  // 保存设置
  vscode.postMessage({ command: "setMediaMode", mode: currentMediaMode });
}

/**
 * 改变Mini模式下图片缩放比例
 * @param {string} scale 缩放比例 (1-100)
 */
function changeMiniMediaScale(scale) {
  const scaleValue = parseInt(scale);

  // 更新显示值
  const scaleValueElement = document.getElementById('mini-media-scale-value');
  if (scaleValueElement) {
    scaleValueElement.textContent = scaleValue + '%';
  }

  // 更新CSS样式
  updateMiniMediaScale(scaleValue);

  // 保存到localStorage，用于加载页面使用
  localStorage.setItem('zhihu-fisher-mini-scale', scaleValue.toString());

  // 保存设置
  vscode.postMessage({ command: "setMiniMediaScale", scale: scaleValue });
}

/**
 * 更新Mini模式下图片的实际缩放样式
 * @param {number} scale 缩放比例 (1-100)
 */
function updateMiniMediaScale(scale) {
  // 动态创建或更新样式
  let styleElement = document.getElementById('mini-media-scale-style');
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'mini-media-scale-style';
    document.head.appendChild(styleElement);
  }

  styleElement.textContent = \`
    .article-content.mini-media img:not(.formula) {
      width: calc(\${scale}%) !important;
      height: auto !important;
    }
    .article-content.mini-media video {
      width: calc(\${scale}%) !important;
      min-width: 20% !important;
      height: auto !important;
      max-width: 100% !important;
      max-height: 100% !important;
    }
  \`;

  // 重新初始化FancyBox，确保缩放后的图片仍然可以点击放大
  setTimeout(function() {
    if (typeof initializeFancyBox === 'function') {
      initializeFancyBox();
    }
  }, 100);
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
    
    // 重新初始化FancyBox，因为显示模式可能会影响图片的可见性
    setTimeout(function() {
      if (typeof initializeFancyBox === 'function') {
        initializeFancyBox();
      }
    }, 100);
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
function copyLink(button, url, isImmersiveMode = false) {
  // 使用Clipboard API复制链接
  const tempInput = document.createElement("input");
  tempInput.value = url;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);

  // 暂时改变按钮文字
  const originalText = button.innerHTML;
  button.innerHTML = isImmersiveMode
    ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M18.333 6A3.667 3.667 0 0 1 22 9.667v8.666A3.667 3.667 0 0 1 18.333 22H9.667A3.667 3.667 0 0 1 6 18.333V9.667A3.667 3.667 0 0 1 9.667 6zM15 2c1.094 0 1.828.533 2.374 1.514a1 1 0 1 1-1.748.972C15.405 4.088 15.284 4 15 4H5c-.548 0-1 .452-1 1v9.998c0 .32.154.618.407.805l.1.065a1 1 0 1 1-.99 1.738A3 3 0 0 1 2 15V5c0-1.652 1.348-3 3-3zm1.293 9.293L13 14.585l-1.293-1.292a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 0 0-1.414-1.414"/></svg>'
    : \`
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
 * 显示不适内容图片
 * @param {HTMLElement} maskOverlay 遮挡层元素
 */
function showUncomfortableImage(maskOverlay) {
  const container = maskOverlay.closest('.uncomfortable-image-container');
  if (!container) return;
  
  const maskDiv = container.querySelector('.image-mask');
  const realImage = container.querySelector('.real-image');
  
  if (maskDiv && realImage) {
    // 隐藏遮挡层
    maskDiv.style.display = 'none';
    // 显示真实图片
    realImage.style.display = 'inline-block';
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

/**
 * 切换智能伪装功能
 */
function toggleDisguiseMode(enabled) {
  vscode.postMessage({
    command: "toggleDisguise",
    enabled: enabled
  });
}

// 加载评论
function loadComments(answerId, page = 1) {
  const commentsContainer = document.querySelector('.comments-container');
  commentsContainer.innerHTML = '<div class="zhihu-comments-loading"><div class="zhihu-comments-loading-spinner"></div>加载评论中...</div>';
  vscode.postMessage({
    command: "loadComments",
    answerId: answerId,
    page: page
  });
}

// 切换评论区的展开/收起状态
function toggleCommentStatus(answerId) {
  vscode.postMessage({
    command: "toggleCommentStatus",
    answerId: answerId
  });
}

// 加载更多评论（分页）
function loadMoreComments(answerId, page) {
  vscode.postMessage({
    command: "loadComments",
    answerId: answerId,
    page: page
  });
}

// 查看全部子评论
function loadAllChildComments(commentId) {
  const modalContainer = document.querySelector('.comments-modal-container');
  modalContainer.innerHTML = '<div class="zhihu-comments-loading" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000;"><div class="zhihu-comments-loading-spinner"></div>加载子评论中...</div>';

  vscode.postMessage({
    command: "loadChildComments",
    commentId: commentId
  });
}

// 加载子评论的更多页
function loadMoreChildComments(commentId, page) {
  vscode.postMessage({
    command: "loadChildComments",
    commentId: commentId,
    page: page
  });
}

// 关闭子评论弹窗
function closeCommentsModal() {
  const modal = document.querySelector('.zhihu-comments-modal');
  if (modal) {
    modal.remove();
  }
}

/**
 * 显示赞赏码弹窗
 */
function showDonateModal() {
  // 创建弹窗容器
  const modal = document.createElement('div');
  modal.className = 'donate-modal';
  modal.innerHTML = \`
    <div class="donate-modal-overlay" onclick="closeDonateModal()"></div>
    <div class="donate-modal-content">
      <div class="donate-modal-header">
        <h3>☕ 请开发者喝杯咖啡~ ☕</h3>
        <button class="donate-modal-close" onclick="closeDonateModal()">&times;</button>
      </div>
      <div class="donate-modal-body">
        <p>如果这个插件对您有帮助，欢迎支持开发者继续改进和维护！</p>
        <div class="donate-qr-container">
          <img src="https://img2024.cnblogs.com/blog/3085939/202504/3085939-20250425153014632-145153684.jpg" alt="微信赞赏码" class="donate-qr-code">
          <p class="donate-tip">微信扫码打开</p>
          <p>💖 感谢使用~ 谢谢支持！💖</p>
        </div>
      </div>
    </div>
  \`;

  document.body.appendChild(modal);

  // 添加样式
  if (!document.querySelector('#donate-modal-style')) {
    const style = document.createElement('style');
    style.id = 'donate-modal-style';
    style.textContent = \`
      .donate-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .donate-modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        cursor: pointer;
        backdrop-filter: blur(5px);
      }

      .donate-modal-content {
        position: relative;
        background: var(--vscode-editor-background);
        border: 1px solid var(--vscode-panel-border);
        border-radius: 8px;
        max-width: 400px;
        width: 90%;
        max-height: 90vh;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
      }

      .donate-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid var(--vscode-panel-border);
      }

      .donate-modal-header h3 {
        margin: 0;
        color: var(--vscode-foreground);
        font-size: 18px;
      }

      .donate-modal-close {
        background: none;
        border: none;
        color: var(--vscode-foreground);
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background-color 0.2s;
      }

      .donate-modal-close:hover {
        background: var(--vscode-toolbar-hoverBackground);
      }

      .donate-modal-body {
        padding-top: 20px;
        text-align: center;
        overflow: auto;
      }

      .donate-modal-body p {
        color: var(--vscode-foreground);
        margin: 0 0 10px 0;
        line-height: 1.5;
      }

      .donate-qr-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }

      .donate-qr-code {
        width: 200px;
        height: 200px;
        border-radius: 8px;
        border: 1px solid var(--vscode-panel-border);
      }

      .donate-tip {
        color: var(--vscode-descriptionForeground);
        font-size: 14px;
        margin: 0;
      }
    \`;
    document.head.appendChild(style);
  }
}

/**
 * 关闭赞赏码弹窗
 */
function closeDonateModal() {
  const modal = document.querySelector('.donate-modal');
  if (modal) {
    modal.remove();
  }
}

/**
 * 收藏内容到收藏夹
 */
function favoriteContent(contentToken, contentType) {
  // 发送收藏请求到VS Code扩展
  vscode.postMessage({
    command: "favoriteContent",
    contentToken: contentToken,
    contentType: contentType
  });
}

/**
 * 加载专栏评论（通过分页方向）
 */
function loadArticleComments(articleId, direction) {
  // const commentsContainer = document.querySelector('.comments-container');
  // commentsContainer.innerHTML = '<div class="zhihu-comments-loading"><div class="zhihu-comments-loading-spinner"></div>加载评论中...</div>';
  vscode.postMessage({
    command: "loadArticleComments",
    articleId: articleId,
    direction: direction
  });
}
`;
