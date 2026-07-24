/**
 * 滚动导航 Toast 样式 — 小巧玲珑，内联环形进度条
 */
export const scrollNavigationCss = `
/* 滚动导航 Toast — VSCode 通知风格 */
.scroll-nav-toast {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  background: var(--vscode-notifications-background);
  color: var(--vscode-notifications-foreground);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: normal;
  font-family: var(--vscode-font-family);
  border: 1px solid var(--vscode-notifications-border);
  box-shadow: 0 2px 8px var(--vscode-widget-shadow);
  z-index: 10001;
  opacity: 0;
  pointer-events: none;
  display: flex;
  align-items: center;
  gap: 8px;
  user-select: none;
  transition: opacity 0.2s ease;
}

.scroll-nav-toast.visible {
  opacity: 1;
  pointer-events: auto;
}

/* 底部 Toast — 从屏幕底端蹦上来 */
.scroll-nav-toast.bottom {
  bottom: 8px;
  top: auto;
}

.scroll-nav-toast.bottom.visible {
  animation: scroll-nav-bounce-up 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

/* 顶部 Toast — 从屏幕顶端蹦下来 */
.scroll-nav-toast.top {
  top: 8px;
  bottom: auto;
}

.scroll-nav-toast.top.visible {
  animation: scroll-nav-bounce-down 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

/* 蹦入动画 — 从底部向上 */
@keyframes scroll-nav-bounce-up {
  from {
    transform: translateX(-50%) translateY(60px);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

/* 蹦入动画 — 从顶部向下 */
@keyframes scroll-nav-bounce-down {
  from {
    transform: translateX(-50%) translateY(-60px);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

/* === 内联环形进度条（小巧圆圈） === */
.scroll-nav-toast-ring {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
}

.scroll-nav-toast-ring-bg {
  fill: none;
  stroke: var(--vscode-notifications-border);
  stroke-width: 1.5;
  opacity: 0.5;
}

.scroll-nav-toast-ring-progress {
  fill: none;
  stroke: var(--vscode-progressBar-background);
  stroke-width: 1.5;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: 9px 9px;
  transition: stroke-dashoffset 0.12s linear;
}

/* ARMED 状态环脉冲 */
.scroll-nav-toast.armed .scroll-nav-toast-ring-progress {
  animation: scroll-nav-ring-pulse 0.6s ease-in-out alternate infinite;
}

/* 箭头 */
.scroll-nav-toast-arrow {
  display: inline-block;
  font-size: 14px;
  line-height: 1;
  color: var(--vscode-notifications-foreground);
  opacity: 0.7;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

/* ARMED 状态箭头弹跳 */
.scroll-nav-toast.armed .scroll-nav-toast-arrow {
  opacity: 1;
  animation: scroll-nav-arrow-bounce 0.4s ease-in-out alternate infinite;
}

/* 文字 */
.scroll-nav-toast-text {
  color: var(--vscode-notifications-foreground);
  font-size: 12px;
  white-space: nowrap;
  line-height: 1.4;
  opacity: 0.85;
  transition: opacity 0.2s ease;
}

/* ARMED 状态文字 */
.scroll-nav-toast.armed .scroll-nav-toast-text {
  opacity: 1;
  font-weight: 500;
}

/* 环形脉冲动画 */
@keyframes scroll-nav-ring-pulse {
  from { opacity: 0.6; }
  to { opacity: 1; }
}

/* 箭头弹跳动画 */
@keyframes scroll-nav-arrow-bounce {
  from { transform: translateY(0); }
  to { transform: translateY(2px); }
}
`;
