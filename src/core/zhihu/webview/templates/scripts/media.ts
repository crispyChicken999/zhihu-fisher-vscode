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
    const contentImags = document.querySelectorAll('.article-content img:not(.formula):not(.fancybox-processed)');
    // question-detail-content
    const detailImages = document.querySelectorAll('.question-detail-content img:not(.formula):not(.fancybox-processed)');

    const allImages = [...contentImags, ...detailImages];
    allImages.forEach(function(img) {
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

      // 跳过表情包/贴纸图片（不支持点击放大）
      if (img.classList.contains('comment-sticker') || img.classList.contains('comment-text-emoji')) {
        return;
      }

      // 处理评论内容中的图片和动图
      if (img.classList.contains('comment-image') || img.classList.contains('comment-gif')) {
        img.setAttribute('data-fancybox', 'comment-gallery');
        img.setAttribute('data-caption', img.classList.contains('comment-gif') ? '评论动图' : '评论图片');
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
  const comments = document.querySelector('.comments-container');
  const commentsModal = document.querySelector('.comments-modal-container');
  const questionDetail = document.querySelector('.question-detail-content');
  const immersiveAuthorAvatar = document.querySelector('.immersive-author-popover .author-popover-avatar');

  if (content && meta) {
    // 移除所有模式类
    content.classList.remove('hide-media', 'mini-media');
    meta.classList.remove('hide-media', 'mini-media');
    if (comments) {
      comments.classList.remove('hide-media', 'mini-media');
    }
    if (commentsModal) {
      commentsModal.classList.remove('hide-media', 'mini-media');
    }
    if (questionDetail) {
      questionDetail.classList.remove('hide-media', 'mini-media');
    }
    if (immersiveAuthorAvatar) {
      immersiveAuthorAvatar.classList.remove('hide-media', 'mini-media');
    }

    // 添加当前模式类
    if (mode === 'none') {
      content.classList.add('hide-media');
      meta.classList.add('hide-media');
      if (comments) {
        comments.classList.add('hide-media');
      }
      if (commentsModal) {
        commentsModal.classList.add('hide-media');
      }
      if (questionDetail) {
        questionDetail.classList.add('hide-media');
      }
      if (immersiveAuthorAvatar) {
        immersiveAuthorAvatar.classList.add('hide-media');
      }
    } else if (mode === 'mini') {
      content.classList.add('mini-media');
      meta.classList.add('mini-media');
      if (comments) {
        comments.classList.add('mini-media');
      }
      if (commentsModal) {
        commentsModal.classList.add('mini-media');
      }
      if (questionDetail) {
        questionDetail.classList.add('mini-media');
      }
      if (immersiveAuthorAvatar) {
        immersiveAuthorAvatar.classList.add('mini-media');
      }
    }

    // 重新初始化FancyBox，因为显示模式可能会影响图片的可见性
    setTimeout(function() {
      if (typeof initializeFancyBox === 'function') {
        initializeFancyBox();
      }
      if (typeof setupMediaPlaceholders === 'function') {
        setupMediaPlaceholders();
      }
    }, 100);
  }
}

/**
 * 更新Mini模式下图片的实际缩放样式
 * @param {number} scale 缩放比例 (1-100)
 */
function updateMiniMediaScale(scale) {
  currentMiniMediaScale = scale;

  // 动态创建或更新样式
  let styleElement = document.getElementById('mini-media-scale-style');
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'mini-media-scale-style';
    document.head.appendChild(styleElement);
  }

  styleElement.textContent = \`
    .article-content.mini-media img:not(.formula):not(.thought-linkcard-image):not(.thought-image):not(.sticker),
    .question-detail-content.mini-media img:not(.formula):not(.thought-linkcard-image):not(.thought-image):not(.sticker) {
      width: calc(\${scale}%) !important;
      height: auto !important;
    }
    .article-content.mini-media video,
    .question-detail-content.mini-media video {
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

  // 更新media-display-select的值
  const select = document.getElementById('media-display-select');
  if (select) {
    select.value = currentMediaMode;
  }

  // 更新mini-scale-option的显示状态
  const miniScaleOption = document.getElementById('mini-scale-option');
  if (miniScaleOption) {
    miniScaleOption.style.display = currentMediaMode === 'mini' ? 'block' : 'none';
  }

  // 更新mini缩放比例设置显示
  updateMiniMediaScale(currentMiniMediaScale);

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
 * 获取视频元素的播放地址（兼容 src 属性和 <source> 子元素）
 * @param {HTMLVideoElement} video 视频元素
 * @returns {string} 视频源URL
 */
function getVideoSrc(video) {
  var src = video.getAttribute('src');
  if (src) return src;
  var source = video.querySelector('source');
  return source ? source.getAttribute('src') || '' : '';
}

/**
 * 下载/另存为媒体文件
 * @param {string} url 媒体文件URL
 * @param {string} type 媒体类型
 */
function mediaSaveAs(url, type) {
  vscode.postMessage({
    command: 'downloadMedia',
    url: url,
    type: type
  });
}

/**
 * 打开Fancybox画廊，支持上一张/下一张导航
 * 收集页面中所有图片（包括隐藏模式下占位符中的图片），
 * 从当前点击的图片开始展示
 * @param {string} currentSrc 当前点击的图片URL
 */
function openFancyboxGallery(currentSrc) {
  if (typeof Fancybox === 'undefined') {
    window.open(currentSrc, '_blank');
    return;
  }

  var sources = [];
  var seen = new Set();

  // 从已处理的fancybox图片中收集
  document.querySelectorAll('img[data-fancybox="article-gallery"]').forEach(function(img) {
    var s = img.getAttribute('src');
    if (s && !seen.has(s)) {
      sources.push({ src: s });
      seen.add(s);
    }
  });

  // 从占位符中收集（隐藏/迷你模式下图片不可见时的后备）
  // 排除表情占位符，因为表情包不支持点击放大
  document.querySelectorAll('[data-src]:not(.media-placeholder-emoji)').forEach(function(el) {
    var s = el.getAttribute('data-src');
    if (s && !seen.has(s)) {
      sources.push({ src: s });
      seen.add(s);
    }
  });

  // 找当前图片的起始索引
  var startIndex = 0;
  sources.forEach(function(item, index) {
    if (item.src === currentSrc) {
      startIndex = index;
    }
  });

  if (sources.length === 0) {
    // 没有收集到任何图片，直接打开当前图片
    sources = [{ src: currentSrc }];
  }

  Fancybox.show(sources, {
    startIndex: startIndex,
    Toolbar: {
      display: {
        left: ['infobar'],
        middle: [],
        right: ['slideshow', 'thumbs', 'close']
      }
    },
    Thumbs: { showOnStart: false },
    Images: { zoom: true }
  });
}

/**
 * 复制媒体到剪贴板
 * @param {string} url 媒体文件URL
 */
async function copyMediaToClipboard(url) {
  // 检查是否是视频（通过URL扩展名判断，避免下载整个视频文件）
  var videoExts = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv', '.mkv'];
  var isVideo = videoExts.some(function(ext) {
    return url.toLowerCase().indexOf(ext) !== -1;
  });

  if (isVideo) {
    // 视频无法直接复制到剪贴板，改为复制视频链接
    try {
      await navigator.clipboard.writeText(url);
      vscode.postMessage({
        command: 'showNotification',
        message: '视频链接已复制到剪贴板'
      });
    } catch (err) {
      console.error('复制视频链接失败:', err);
      vscode.postMessage({
        command: 'showNotification',
        message: '复制失败，请重试'
      });
    }
    return;
  }

  // 图片类型：尝试复制图片到剪贴板
  try {
    const response = await fetch(url, { referrerPolicy: 'no-referrer' });
    const blob = await response.blob();
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob
      })
    ]);
    vscode.postMessage({
      command: 'showNotification',
      message: '已复制到剪贴板'
    });
  } catch (err) {
    console.error('复制到剪贴板失败:', err);
    // 后备方案：用canvas复制图片
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise(function(resolve, reject) {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const blob = await new Promise(function(resolve) {
        canvas.toBlob(resolve, 'image/png');
      });
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ]);
      vscode.postMessage({
        command: 'showNotification',
        message: '已复制到剪贴板'
      });
    } catch (fallbackErr) {
      console.error('复制到剪贴板(后备)失败:', fallbackErr);
      vscode.postMessage({
        command: 'showNotification',
        message: '复制失败，请重试'
      });
    }
  }
}

// 初始化媒体相关功能
function changeMediaMode(mode) {
  currentMediaMode = mode;
  updateMediaDisplayClass(currentMediaMode);

  // 重新初始化媒体占位符交互
  setTimeout(function() {
    if (typeof setupMediaPlaceholders === 'function') {
      setupMediaPlaceholders();
    }
  }, 100);

  // 显示或隐藏mini缩放比例设置
  const miniScaleOption = document.getElementById('mini-scale-option');
  if (miniScaleOption) {
    miniScaleOption.style.display = mode === 'mini' ? 'block' : 'none';
  }

  // 更新media-display-select的值
  const select = document.getElementById('media-display-select');
  if (select) {
    select.value = currentMediaMode;
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

/* 更新Mini模式下图片缩放比例显示值 */
function updateMiniMediaScaleInputSpanValue(scale) {
  const scaleValue = parseInt(scale);

  // 更新显示值
  const scaleValueElement = document.getElementById('mini-media-scale-value');
  if (scaleValueElement) {
    scaleValueElement.textContent = scaleValue + '%';
  }
}

/**
 * 关闭媒体弹窗
 * @param {HTMLElement} popup 弹窗元素
 */
function closeMediaPopup(popup) {
  if (!popup) return;
  popup.classList.remove('visible');
  setTimeout(function() {
    popup.remove();
  }, 150);
}

/**
 * 为占位符添加hover缩略图弹窗的通用逻辑
 * 支持鼠标移到popup上保持不关闭，支持点击popup内图片放大
 * @param {HTMLElement} placeholder 占位符元素
 * @param {number} delay 延迟时间(ms)
 * @param {number} maxThumbWidth 缩略图最大宽度
 * @param {number} maxThumbHeight 缩略图最大高度
 * @param {string} caption 缩略图上方的提示文字（可选）
 * @param {boolean} enableGalleryClick 是否启用点击弹窗图片打开Fancybox画廊（默认true，表情包设为false）
 */
function addPlaceholderHoverPopup(placeholder, delay, maxThumbWidth, maxThumbHeight, caption, enableGalleryClick) {
  if (enableGalleryClick === undefined) enableGalleryClick = true;
  let popup = null;
  let loadTimer = null;
  let closeTimer = null;
  let isHoveringPopup = false;

  function scheduleClose() {
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(function() {
      if (popup && !isHoveringPopup) {
        closeMediaPopup(popup);
        popup = null;
        loadTimer = null;
      }
    }, 100);
  }

  function cancelClose() {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  }

  placeholder.addEventListener('mouseenter', function(e) {
    const src = placeholder.getAttribute('data-src');
    if (!src) return;

    // 如果之前有popup残留，清理掉
    if (popup) {
      closeMediaPopup(popup);
      popup = null;
    }
    cancelClose();

    loadTimer = setTimeout(function() {
      popup = document.createElement('div');
      popup.className = 'media-placeholder-popup';

      var escapedSrc = src.replace(/'/g, "\\'");
      var popupHtml = '<div class="popup-body">'
        + '<img src="' + src + '" referrerpolicy="no-referrer" loading="lazy" style="max-width:' + maxThumbWidth + 'px;max-height:' + maxThumbHeight + 'px;" />'
        + '<div class="popup-actions">'
          + '<button class="popup-action-btn" onclick="copyMediaToClipboard(&apos;' + escapedSrc + '&apos;)" title="复制到剪贴板"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M9 18q-.825 0-1.412-.587T7 16V4q0-.825.588-1.412T9 2h9q.825 0 1.413.588T20 4v12q0 .825-.587 1.413T18 18zm0-2h9V4H9zm-4 6q-.825 0-1.412-.587T3 20V6h2v14h11v2zm4-6V4z"/></svg></button>'
          + '<button class="popup-action-btn" onclick="mediaSaveAs(&apos;' + escapedSrc + '&apos;, &apos;image&apos;)" title="另存为"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="m12 16l-5-5l1.4-1.45l2.6 2.6V4h2v8.15l2.6-2.6L17 11zm-6 4q-.825 0-1.412-.587T4 18v-3h2v3h12v-3h2v3q0 .825-.587 1.413T18 20z"/></svg></button>'
        + '</div>'
        + '</div>';

      if (caption) {
        popupHtml += '<div class="media-placeholder-popup-caption">' + caption + '</div>';
      }

      popup.innerHTML = popupHtml;
      document.body.appendChild(popup);

      // popup 自身 hover 时保持不关闭
      popup.addEventListener('mouseenter', function() {
        isHoveringPopup = true;
        cancelClose();
      });
      popup.addEventListener('mouseleave', function() {
        isHoveringPopup = false;
        scheduleClose();
      });

      // 点击popup中的图片，触发FancyBox查看大图（表情包不启用）
      if (enableGalleryClick) {
        var popupImg = popup.querySelector('img');
        if (popupImg) {
          popupImg.addEventListener('click', function(e) {
            e.stopPropagation();
            closeMediaPopup(popup);
            popup = null;
            openFancyboxGallery(src);
          });
        }
      }

      requestAnimationFrame(function() {
        const rect = placeholder.getBoundingClientRect();
        const popupRect = popup.getBoundingClientRect();
        // 如果有caption，弹窗高度会包含caption（约24px），用 >20 阈值排除仅有caption的情况
        const heightThreshold = caption ? 40 : 10;
        const defaultHeight = caption ? maxThumbHeight + 24 : maxThumbHeight;
        const actualHeight = popupRect.height > heightThreshold ? popupRect.height : defaultHeight;
        const actualWidth = popupRect.width > 10 ? popupRect.width : maxThumbWidth;
        const gap = 8;

        // 优先显示在占位符上方
        let top = rect.top - actualHeight - gap;
        let left = rect.left;

        // 如果上方空间不够，显示在下方
        if (top < gap) {
          top = rect.bottom + gap;
        }

        // 防止右侧溢出
        if (left + actualWidth > window.innerWidth - gap) {
          left = window.innerWidth - actualWidth - gap;
        }

        // 防止左侧溢出
        if (left < gap) {
          left = gap;
        }

        popup.style.left = left + 'px';
        popup.style.top = top + 'px';

        // popup在上方 → caption放到图片上面（order:0）；popup在下方 → caption在图片下面（order:2）
        if (top < rect.top) {
          popup.classList.add('caption-on-top');
        } else {
          popup.classList.remove('caption-on-top');
        }

        popup.classList.add('visible');
      });
    }, delay);
  });

  placeholder.addEventListener('mouseleave', function() {
    if (loadTimer) {
      clearTimeout(loadTimer);
      loadTimer = null;
    }
    scheduleClose();
  });
}

/**
 * 设置视频占位符的hover预览
 * - mouseenter 时显示视频缩略预览（不自动播放）
 * - 鼠标移到popup上保持不关闭
 * - 点击popup中的视频开始播放
 * - mouseleave 时关闭弹窗并暂停播放
 * @param {HTMLElement} placeholder 视频占位符元素
 */
function addVideoPlaceholderHover(placeholder) {
  let popup = null;
  let loadTimer = null;
  let closeTimer = null;
  let clonedVideo = null;
  let isHoveringPopup = false;

  function scheduleClose() {
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(function() {
      if (popup && !isHoveringPopup) {
        if (clonedVideo) {
          clonedVideo.pause();
          clonedVideo = null;
        }
        closeMediaPopup(popup);
        popup = null;
        loadTimer = null;
      }
    }, 300);
  }

  function cancelClose() {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  }

  placeholder.addEventListener('mouseenter', function(e) {
    // 找到占位符之前的 video 元素（通过 .after() 添加，video 在前）
    var video = placeholder.previousElementSibling;
    if (!video || video.tagName !== 'VIDEO') return;

    // 清理残留popup
    if (popup) {
      if (clonedVideo) {
        clonedVideo.pause();
        clonedVideo = null;
      }
      closeMediaPopup(popup);
      popup = null;
    }
    cancelClose();

    loadTimer = setTimeout(function() {
      // 深克隆video元素避免影响原DOM
      clonedVideo = video.cloneNode(true);
      clonedVideo.controls = true;
      clonedVideo.muted = false;
      clonedVideo.style.maxWidth = '220px';
      clonedVideo.style.maxHeight = '140px';
      clonedVideo.style.display = 'block';
      clonedVideo.setAttribute('playsinline', '');

      popup = document.createElement('div');
      popup.className = 'media-placeholder-popup';

      // caption 放在 popup 内部，使用 flex order 控制位置
    var videoSrc = getVideoSrc(video);
      var escapedSrc = videoSrc.replace(/'/g, "\\'");

      // 创建主体容器：左侧媒体 + 右侧操作按钮
      var bodyDiv = document.createElement('div');
      bodyDiv.className = 'popup-body';

      clonedVideo.style.maxWidth = '220px';
      clonedVideo.style.maxHeight = '140px';
      clonedVideo.style.display = 'block';
      clonedVideo.setAttribute('playsinline', '');
      bodyDiv.appendChild(clonedVideo);

      var actionsDiv = document.createElement('div');
      actionsDiv.className = 'popup-actions';
      actionsDiv.innerHTML = '<button class="popup-action-btn" onclick="copyMediaToClipboard(&apos;' + escapedSrc + '&apos;)" title="复制链接到剪贴板"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M9 18q-.825 0-1.412-.587T7 16V4q0-.825.588-1.412T9 2h9q.825 0 1.413.588T20 4v12q0 .825-.587 1.413T18 18zm0-2h9V4H9zm-4 6q-.825 0-1.412-.587T3 20V6h2v14h11v2zm4-6V4z"/></svg></button>'
        + '<button class="popup-action-btn" onclick="mediaSaveAs(&apos;' + escapedSrc + '&apos;, &apos;video&apos;)" title="另存为"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="m12 16l-5-5l1.4-1.45l2.6 2.6V4h2v8.15l2.6-2.6L17 11zm-6 4q-.825 0-1.412-.587T4 18v-3h2v3h12v-3h2v3q0 .825-.587 1.413T18 20z"/></svg></button>';
      bodyDiv.appendChild(actionsDiv);

      popup.appendChild(bodyDiv);

      var captionDiv = document.createElement('div');
      captionDiv.className = 'media-placeholder-popup-caption';
      captionDiv.textContent = '点击播放视频';
      popup.appendChild(captionDiv);

      document.body.appendChild(popup);

      // popup 自身 hover 时保持不关闭
      popup.addEventListener('mouseenter', function() {
        isHoveringPopup = true;
        cancelClose();
      });
      popup.addEventListener('mouseleave', function() {
        isHoveringPopup = false;
        scheduleClose();
      });

      // 点击视频开始播放（用户手势触发，不会被浏览器拦截）
      clonedVideo.addEventListener('click', function(ev) {
        ev.stopPropagation();
        clonedVideo.currentTime = 0;
        clonedVideo.play().catch(function(err) {
          console.log('视频播放失败:', err);
        });
      });

      requestAnimationFrame(function() {
        const rect = placeholder.getBoundingClientRect();
        const popupRect = popup.getBoundingClientRect();
        const actualHeight = popupRect.height > 40 ? popupRect.height : 178;
        const actualWidth = popupRect.width > 10 ? popupRect.width : 220;
        const gap = 8;

        let top = rect.top - actualHeight - gap;
        let left = rect.left;

        if (top < gap) {
          top = rect.bottom + gap;
        }

        if (left + actualWidth > window.innerWidth - gap) {
          left = window.innerWidth - actualWidth - gap;
        }

        if (left < gap) {
          left = gap;
        }

        popup.style.left = left + 'px';
        popup.style.top = top + 'px';

        // popup在上方 → caption放到视频上面（order:0）；popup在下方 → caption在视频下面（order:2）
        if (top < rect.top) {
          popup.classList.add('caption-on-top');
        } else {
          popup.classList.remove('caption-on-top');
        }

        popup.classList.add('visible');
      });
    }, 300);
  });

  placeholder.addEventListener('mouseleave', function() {
    if (loadTimer) {
      clearTimeout(loadTimer);
      loadTimer = null;
    }
    scheduleClose();
  });

  // 点击tag直接展示popup并播放视频
  placeholder.addEventListener('click', function(e) {
    e.stopPropagation();

    var video = placeholder.previousElementSibling;
    if (!video || video.tagName !== 'VIDEO') return;

    // 如果已经有popup就清理掉
    if (loadTimer) {
      clearTimeout(loadTimer);
      loadTimer = null;
    }
    cancelClose();

    if (popup) {
      if (clonedVideo) {
        clonedVideo.pause();
        clonedVideo = null;
      }
      closeMediaPopup(popup);
      popup = null;
    }

    // 直接创建popup并播放（用户手势，不会被拦截）
    clonedVideo = video.cloneNode(true);
    clonedVideo.controls = true;
    clonedVideo.muted = false;
    clonedVideo.style.maxWidth = '220px';
    clonedVideo.style.maxHeight = '140px';
    clonedVideo.style.display = 'block';
    clonedVideo.setAttribute('playsinline', '');

    popup = document.createElement('div');
    popup.className = 'media-placeholder-popup';
    var videoSrc = getVideoSrc(video);
    var escapedSrc = videoSrc.replace(/'/g, "\\'");

    // 创建主体容器：左侧媒体 + 右侧操作按钮
    var bodyDiv = document.createElement('div');
    bodyDiv.className = 'popup-body';

    clonedVideo.style.maxWidth = '220px';
    clonedVideo.style.maxHeight = '140px';
    clonedVideo.style.display = 'block';
    clonedVideo.setAttribute('playsinline', '');
    bodyDiv.appendChild(clonedVideo);

    var actionsDiv = document.createElement('div');
    actionsDiv.className = 'popup-actions';
    actionsDiv.innerHTML = '<button class="popup-action-btn" onclick="copyMediaToClipboard(&apos;' + escapedSrc + '&apos;)" title="复制链接到剪贴板"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M9 18q-.825 0-1.412-.587T7 16V4q0-.825.588-1.412T9 2h9q.825 0 1.413.588T20 4v12q0 .825-.587 1.413T18 18zm0-2h9V4H9zm-4 6q-.825 0-1.412-.587T3 20V6h2v14h11v2zm4-6V4z"/></svg></button>'
      + '<button class="popup-action-btn" onclick="mediaSaveAs(&apos;' + escapedSrc + '&apos;, &apos;video&apos;)" title="另存为"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="m12 16l-5-5l1.4-1.45l2.6 2.6V4h2v8.15l2.6-2.6L17 11zm-6 4q-.825 0-1.412-.587T4 18v-3h2v3h12v-3h2v3q0 .825-.587 1.413T18 20z"/></svg></button>';
    bodyDiv.appendChild(actionsDiv);

    popup.appendChild(bodyDiv);

    var captionDiv = document.createElement('div');
    captionDiv.className = 'media-placeholder-popup-caption';
    captionDiv.textContent = '点击播放视频';
    popup.appendChild(captionDiv);

    document.body.appendChild(popup);

    popup.addEventListener('mouseenter', function() {
      isHoveringPopup = true;
      cancelClose();
    });
    popup.addEventListener('mouseleave', function() {
      isHoveringPopup = false;
      scheduleClose();
    });

    clonedVideo.addEventListener('click', function(ev) {
      ev.stopPropagation();
      clonedVideo.currentTime = 0;
      clonedVideo.play().catch(function(err) {
        console.log('视频播放失败:', err);
      });
    });

    var rect = placeholder.getBoundingClientRect();

    requestAnimationFrame(function() {
      const popupRect = popup.getBoundingClientRect();
      const actualHeight = popupRect.height > 40 ? popupRect.height : 178;
      const actualWidth = popupRect.width > 10 ? popupRect.width : 220;
      const gap = 8;

      let top = rect.top - actualHeight - gap;
      let left = rect.left;

      if (top < gap) {
        top = rect.bottom + gap;
      }

      if (left + actualWidth > window.innerWidth - gap) {
        left = window.innerWidth - actualWidth - gap;
      }

      if (left < gap) {
        left = gap;
      }

      popup.style.left = left + 'px';
      popup.style.top = top + 'px';

      if (top < rect.top) {
        popup.classList.add('caption-on-top');
      } else {
        popup.classList.remove('caption-on-top');
      }

      popup.classList.add('visible');
    });

    // 点击tag直接播放视频
    clonedVideo.currentTime = 0;
    clonedVideo.play().catch(function(err) {
      console.log('视频播放失败:', err);
    });
  });
}

/**
 * 设置媒体占位符的交互功能
 * - 图片/动图占位符：hover缩略图 + 点击查看大图（可在popup内点击）
 * - 视频占位符：hover预览 + 点击播放
 * - 表情占位符：仅hover缩略图预览（不支持点击放大）
 */
function setupMediaPlaceholders() {
  // 图片和动图占位符：支持hover缩略图 + 点击查看大图
  const clickSelectors = [
    '.media-placeholder-image[data-src]:not([data-placeholder-initialized])',
    '.media-placeholder-gif[data-src]:not([data-placeholder-initialized])'
  ];

  clickSelectors.forEach(function(selector) {
    document.querySelectorAll(selector).forEach(function(placeholder) {
      placeholder.setAttribute('data-placeholder-initialized', 'true');

      // 添加hover缩略图弹窗，带"点击查看大图"提示
      addPlaceholderHoverPopup(placeholder, 200, 160, 120, '点击查看大图');

      // 点击查看大图（使用FancyBox）
      placeholder.addEventListener('click', function(e) {
        e.stopPropagation();
        const src = placeholder.getAttribute('data-src');
        if (!src) return;
        openFancyboxGallery(src);
      });
    });
  });

  // 视频占位符：hover预览 + 点击播放
  document.querySelectorAll('.media-placeholder-video:not([data-placeholder-initialized])').forEach(function(placeholder) {
    placeholder.setAttribute('data-placeholder-initialized', 'true');
    addVideoPlaceholderHover(placeholder);
  });

  // 表情占位符：仅支持hover缩略图预览，不支持点击放大，带复制按钮
  document.querySelectorAll('.media-placeholder-emoji[data-src]:not([data-placeholder-initialized])').forEach(function(placeholder) {
    placeholder.setAttribute('data-placeholder-initialized', 'true');
    // 添加hover缩略图弹窗，带"复制到剪贴板"按钮
    // 最后一个参数false表示禁用点击弹窗图片打开Fancybox画廊
    addPlaceholderHoverPopup(placeholder, 200, 50, 50, undefined, false);
  });
}
`;
