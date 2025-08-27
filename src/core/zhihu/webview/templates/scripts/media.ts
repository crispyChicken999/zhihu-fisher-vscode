/**
 * 媒体处理脚本 - 图片、视频等媒体功能
 */
export const mediaScript = `
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
 * 设置回到顶部按钮
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

/**
 * 回到顶部
 */
function backTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
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

// 初始化媒体相关功能
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
`;
