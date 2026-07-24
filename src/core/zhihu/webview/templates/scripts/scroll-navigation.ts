/**
 * 滚动导航脚本 - 滚动到页面边界后继续滚动切换回答
 */
export const scrollNavigationScript = `
// 滚动导航状态机
const ScrollNavState = { IDLE: 'idle', SHOWING: 'showing', ARMED: 'armed' };
let scrollNavState = ScrollNavState.IDLE;
let scrollNavAccumulatedDelta = 0;
let scrollNavDirection = 0; // 1: 向下, -1: 向上, 0: 无
let scrollNavIdleTimer = null;
let scrollNavToastEl = null;
let scrollNavRingProgress = null;
let scrollNavToastText = null;
let scrollNavArrowEl = null;
let scrollNavArmedTimestamp = 0;

const SCROLL_NAV_RING_CIRCUMFERENCE = 44; // 2 * Math.PI * 7 (r=7)
const SCROLL_NAV_SHOW_THRESHOLD = 100;
const SCROLL_NAV_TRIGGER_THRESHOLD = 350;
const SCROLL_NAV_IDLE_TIMEOUT = 3000;
const SCROLL_NAV_ARMED_DELAY = 300;
const SCROLL_NAV_BOUNDARY_TOLERANCE = 5;

function scrollNavIsAtTop() {
  return window.scrollY <= SCROLL_NAV_BOUNDARY_TOLERANCE;
}

function scrollNavIsAtBottom() {
  return window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - SCROLL_NAV_BOUNDARY_TOLERANCE;
}

function scrollNavIsCommentsScrolledToBottom() {
  var commentsList = document.querySelector('.zhihu-comments-list');
  if (commentsList && commentsList.offsetParent !== null && commentsList.scrollHeight > commentsList.clientHeight) {
    var atBottom = commentsList.scrollTop + commentsList.clientHeight >= commentsList.scrollHeight - SCROLL_NAV_BOUNDARY_TOLERANCE;
    if (!atBottom) return false;
  }
  var commentsContainer = document.querySelector('.comments-container');
  if (commentsContainer && commentsContainer.offsetParent !== null && commentsContainer.scrollHeight > commentsContainer.clientHeight) {
    var containerAtBottom = commentsContainer.scrollTop + commentsContainer.clientHeight >= commentsContainer.scrollHeight - SCROLL_NAV_BOUNDARY_TOLERANCE;
    if (!containerAtBottom) return false;
  }
  return true;
}

function scrollNavShouldDisable() {
  if (localStorage.getItem('zhihu-fisher-scroll-navigation-enabled') === 'false') return true;
  if (typeof sourceType !== 'undefined' && (sourceType === 'article' || sourceType === 'thought')) return true;
  var di = document.getElementById('disguise-interface');
  if (di && di.style.display !== 'none') return true;
  var dci = document.querySelector('.disguise-code-interface');
  if (dci && dci.style.display !== 'none') return true;
  if (document.querySelector('.fancybox__container')) return true;
  var sp = document.getElementById('style-panel');
  if (sp && sp.classList.contains('visible')) return true;
  var cm = document.querySelector('.comments-modal-container');
  if (cm && cm.innerHTML.trim() !== '') return true;
  return false;
}

function scrollNavCreateToast() {
  if (scrollNavToastEl) return;

  scrollNavToastEl = document.createElement('div');
  scrollNavToastEl.id = 'scroll-nav-toast';
  scrollNavToastEl.className = 'scroll-nav-toast';

  // 环形进度条 SVG（小巧圆圈）
  var ringSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  ringSvg.setAttribute('class', 'scroll-nav-toast-ring');
  ringSvg.setAttribute('width', '18');
  ringSvg.setAttribute('height', '18');
  ringSvg.setAttribute('viewBox', '0 0 18 18');

  var ringBg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  ringBg.setAttribute('class', 'scroll-nav-toast-ring-bg');
  ringBg.setAttribute('cx', '9');
  ringBg.setAttribute('cy', '9');
  ringBg.setAttribute('r', '7');
  ringSvg.appendChild(ringBg);

  scrollNavRingProgress = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  scrollNavRingProgress.setAttribute('class', 'scroll-nav-toast-ring-progress');
  scrollNavRingProgress.setAttribute('cx', '9');
  scrollNavRingProgress.setAttribute('cy', '9');
  scrollNavRingProgress.setAttribute('r', '7');
  scrollNavRingProgress.setAttribute('stroke-dasharray', SCROLL_NAV_RING_CIRCUMFERENCE);
  scrollNavRingProgress.setAttribute('stroke-dashoffset', SCROLL_NAV_RING_CIRCUMFERENCE);
  ringSvg.appendChild(scrollNavRingProgress);

  scrollNavToastEl.appendChild(ringSvg);

  // 箭头
  scrollNavArrowEl = document.createElement('span');
  scrollNavArrowEl.className = 'scroll-nav-toast-arrow';
  scrollNavToastEl.appendChild(scrollNavArrowEl);

  // 文字
  scrollNavToastText = document.createElement('span');
  scrollNavToastText.className = 'scroll-nav-toast-text';
  scrollNavToastEl.appendChild(scrollNavToastText);

  document.body.appendChild(scrollNavToastEl);

  scrollNavToastEl.addEventListener('click', function() {
    if (scrollNavState === ScrollNavState.SHOWING || scrollNavState === ScrollNavState.ARMED) {
      scrollNavTriggerSwitch();
    }
  });
}

function scrollNavShowToast(direction) {
  if (!scrollNavToastEl) return;
  scrollNavToastEl.classList.remove('visible', 'bottom', 'top');
  void scrollNavToastEl.offsetHeight;

  if (direction === 1) {
    scrollNavToastEl.classList.add('bottom');
    scrollNavToastEl.setAttribute('tooltip', '滚动切换回答\\n可在 设置 → 功能增强 中关闭');
    scrollNavToastEl.setAttribute('placement', 'top');
    scrollNavArrowEl.textContent = '↓';
    scrollNavToastText.textContent = '滚动切换 · 下一个回答';
  } else {
    scrollNavToastEl.classList.add('top');
    scrollNavToastEl.setAttribute('tooltip', '滚动切换回答\\n可在 设置 → 功能增强 中关闭');
    scrollNavToastEl.setAttribute('placement', 'bottom');
    scrollNavArrowEl.textContent = '↑';
    scrollNavToastText.textContent = '滚动切换 · 上一个回答';
  }
  scrollNavToastEl.classList.add('visible');
}

function scrollNavHideToast() {
  if (!scrollNavToastEl) return;
  scrollNavToastEl.classList.remove('visible', 'armed', 'bottom', 'top');
  setTimeout(function() {
    if (scrollNavState === ScrollNavState.IDLE && scrollNavRingProgress) {
      scrollNavRingProgress.setAttribute('stroke-dashoffset', SCROLL_NAV_RING_CIRCUMFERENCE);
    }
  }, 300);
}

function scrollNavUpdateProgress(delta) {
  if (!scrollNavRingProgress) return;
  var progress = Math.min(delta / SCROLL_NAV_TRIGGER_THRESHOLD, 1);
  var offset = SCROLL_NAV_RING_CIRCUMFERENCE * (1 - progress);
  scrollNavRingProgress.setAttribute('stroke-dashoffset', offset);

  if (progress >= 1 && scrollNavState !== ScrollNavState.ARMED) {
    scrollNavState = ScrollNavState.ARMED;
    scrollNavArmedTimestamp = Date.now();
    scrollNavToastEl.classList.add('armed');
    if (scrollNavDirection === 1) {
      scrollNavToastText.textContent = '确认切换 · 下一个回答';
    } else {
      scrollNavToastText.textContent = '确认切换 · 上一个回答';
    }
  }
}

function scrollNavTriggerSwitch() {
  if (scrollNavDirection === 1) {
    if (typeof loadNextAnswer === 'function') loadNextAnswer();
  } else if (scrollNavDirection === -1) {
    if (typeof loadPreviousAnswer === 'function') loadPreviousAnswer();
  }
  scrollNavResetAll();
}

function scrollNavResetAll() {
  scrollNavState = ScrollNavState.IDLE;
  scrollNavAccumulatedDelta = 0;
  scrollNavDirection = 0;
  scrollNavArmedTimestamp = 0;
  if (scrollNavIdleTimer) {
    clearTimeout(scrollNavIdleTimer);
    scrollNavIdleTimer = null;
  }
  scrollNavHideToast();
  if (scrollNavRingProgress) {
    scrollNavRingProgress.setAttribute('stroke-dashoffset', SCROLL_NAV_RING_CIRCUMFERENCE);
  }
}

function setupScrollNavigation() {
  if (localStorage.getItem('zhihu-fisher-scroll-navigation-enabled') === null) {
    localStorage.setItem('zhihu-fisher-scroll-navigation-enabled', 'true');
  }
  if (scrollNavShouldDisable()) return;
  scrollNavCreateToast();

  window.addEventListener('wheel', function(e) {
    if (scrollNavShouldDisable()) { scrollNavResetAll(); return; }
    if (!scrollNavToastEl) scrollNavCreateToast();

    var newDirection = e.deltaY > 0 ? 1 : (e.deltaY < 0 ? -1 : 0);
    if (newDirection === 0) return;

    if (scrollNavDirection !== 0 && newDirection !== scrollNavDirection) {
      scrollNavResetAll();
      return;
    }

    var atTop = scrollNavIsAtTop();
    var atBottom = scrollNavIsAtBottom();

    if (scrollNavState === ScrollNavState.IDLE) {
      if (newDirection === 1 && atBottom) {
        if (typeof loadedAnswerCount === 'undefined' || typeof currentAnswerIndex === 'undefined') return;
        if (currentAnswerIndex + 1 >= loadedAnswerCount) return;
        if (!scrollNavIsCommentsScrolledToBottom()) return;
        if (scrollNavDirection === 1) {
          scrollNavAccumulatedDelta += Math.abs(e.deltaY);
        } else {
          scrollNavDirection = 1;
          scrollNavAccumulatedDelta = Math.abs(e.deltaY);
        }
        if (scrollNavAccumulatedDelta >= SCROLL_NAV_SHOW_THRESHOLD) {
          scrollNavState = ScrollNavState.SHOWING;
          scrollNavShowToast(1);
          scrollNavUpdateProgress(scrollNavAccumulatedDelta);
        }
        scrollNavResetIdleTimer();
        return;
      }
      if (newDirection === -1 && atTop) {
        if (typeof currentAnswerIndex === 'undefined') return;
        if (currentAnswerIndex <= 0) return;
        if (scrollNavDirection === -1) {
          scrollNavAccumulatedDelta += Math.abs(e.deltaY);
        } else {
          scrollNavDirection = -1;
          scrollNavAccumulatedDelta = Math.abs(e.deltaY);
        }
        if (scrollNavAccumulatedDelta >= SCROLL_NAV_SHOW_THRESHOLD) {
          scrollNavState = ScrollNavState.SHOWING;
          scrollNavShowToast(-1);
          scrollNavUpdateProgress(scrollNavAccumulatedDelta);
        }
        scrollNavResetIdleTimer();
        return;
      }
    }

    if (scrollNavState === ScrollNavState.SHOWING || scrollNavState === ScrollNavState.ARMED) {
      if ((scrollNavDirection === 1 && !scrollNavIsAtBottom()) ||
          (scrollNavDirection === -1 && !scrollNavIsAtTop())) {
        scrollNavResetAll();
        return;
      }
      if (scrollNavDirection === 1 && !scrollNavIsCommentsScrolledToBottom()) {
        scrollNavResetAll();
        return;
      }
      scrollNavAccumulatedDelta += Math.abs(e.deltaY);
      scrollNavUpdateProgress(scrollNavAccumulatedDelta);
      scrollNavResetIdleTimer();
      if (scrollNavState === ScrollNavState.ARMED &&
          scrollNavAccumulatedDelta > SCROLL_NAV_TRIGGER_THRESHOLD &&
          Date.now() - scrollNavArmedTimestamp >= SCROLL_NAV_ARMED_DELAY) {
        scrollNavTriggerSwitch();
      }
    }
  }, { passive: true });

  document.addEventListener('mouseleave', function() { scrollNavResetAll(); });
}

function scrollNavResetIdleTimer() {
  if (scrollNavIdleTimer) clearTimeout(scrollNavIdleTimer);
  scrollNavIdleTimer = setTimeout(function() { scrollNavResetAll(); }, SCROLL_NAV_IDLE_TIMEOUT);
}
`;
