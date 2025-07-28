/**
 * 键盘提示模板
 */
// 文章类型的键盘提示（只显示图片/视频调整）
export const articleKeyboardTips = `
<div style="display: inline-flex; align-items: center; gap: 5px;">
  <span style="flex: 0 0 auto;">键盘</span>
  <span style="flex: 0 0 auto; display: inline-flex; align-items: center;">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3zM4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm5.723 13L16.58 6h-2.303L7.42 18z"/></svg>
  </span>
  <span style="flex: 0 0 auto;">调整图片/视频显示</span>
</div>`;

// 问题类型的键盘提示（完整提示，包含上下切换）
export const questionKeyboardTips = `
<div style="display: inline-flex; align-items: center; gap: 5px;">
  <span style="flex: 0 0 auto;">键盘</span>
  <div style="display: inline-flex; align-items: center;flex: 0 0 auto;">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="m7 12l5-5v3h4v4h-4v3zm14-7v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2m-2 0H5v14h14z"/></svg>
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="m17 12l-5 5v-3H8v-4h4V7zM3 19V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2m2 0h14V5H5z"/></svg>
  </div>
  <span style="flex: 0 0 auto;">切换上/下一条，</span>
  <span style="flex: 0 0 auto; display: inline-flex; align-items: center;">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3zM4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm5.723 13L16.58 6h-2.303L7.42 18z"/></svg>
  </span>
  <span style="flex: 0 0 auto;">调整图片/视频显示</span>
</div>`;
