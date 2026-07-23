/**
 * localStorage 同步脚本 - 将 webview 的 localStorage 同步到 VSCode 用户配置
 * 用户更换电脑后，通过 VSCode Settings Sync 恢复所有详情页设置
 */
export const storageSyncScript = `
// ===== localStorage 同步到 VSCode 用户配置 =====

var STORAGE_KEY_PREFIX = 'zhihu-fisher-';
var SYNC_DEBOUNCE_MS = 500;
var syncTimer = null;

// 收集所有 zhihu-fisher-* 的 localStorage 数据
function collectAllStorage() {
  var data = {};
  for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    if (key && key.indexOf(STORAGE_KEY_PREFIX) === 0) {
      data[key] = localStorage.getItem(key);
    }
  }
  return data;
}

// 防抖同步到 VSCode 用户配置
function syncStorageToVSCode() {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(function() {
    var data = collectAllStorage();
    vscode.postMessage({
      command: 'syncWebviewStorage',
      data: data
    });
  }, SYNC_DEBOUNCE_MS);
}

// 从 VSCode 用户配置恢复 localStorage（比对：缺失→复制、不同→覆盖、相同→跳过）
function restoreStorageFromConfig(configData) {
  if (!configData || typeof configData !== 'object') return;

  var keys = Object.keys(configData);
  var restoredCount = 0;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (key.indexOf(STORAGE_KEY_PREFIX) !== 0) continue;

    var newValue = configData[key];
    var currentValue = localStorage.getItem(key);

    if (currentValue === null) {
      // 缺失 → 复制
      localStorage.setItem(key, newValue);
      restoredCount++;
    } else if (currentValue !== newValue) {
      // 不同 → 覆盖（VSCode 配置优先）
      localStorage.setItem(key, newValue);
      restoredCount++;
    }
    // 完全一样 → 跳过
  }

  if (restoredCount > 0) {
    console.log('已从 VSCode 配置恢复 ' + restoredCount + ' 项设置');
  }
}

// 监听来自扩展的恢复消息
window.addEventListener('message', function(event) {
  var message = event.data;
  if (message.command === 'restoreWebviewStorage') {
    restoreStorageFromConfig(message.data);
  }
});

// 重写 localStorage.setItem 来检测 zhihu-fisher-* 的变化并自动同步
var originalSetItem = localStorage.setItem.bind(localStorage);
localStorage.setItem = function(key, value) {
  originalSetItem(key, value);
  if (key && key.indexOf(STORAGE_KEY_PREFIX) === 0) {
    syncStorageToVSCode();
  }
};

// 页面 DOM 就绪后，请求扩展发送已保存的配置用于恢复
// 注意：此处不调用 syncStorageToVSCode()，避免在全新机器上空 localStorage
// 覆盖掉已保存的配置（requestStorageSync 和 syncWebviewStorage 之间的竞争条件）
document.addEventListener('DOMContentLoaded', function() {
  vscode.postMessage({ command: 'requestStorageSync' });
});
`;
