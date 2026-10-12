export const disguiseScript =`
// 伪装界面控制
(function() {
  const disguiseElement = document.getElementById('disguise-code-interface');
  let welcomeMessageElement = null;

  // 伪装界面的令牌色样式容器（.mtk*）
  // HTML 里已经按「渲染那一刻的主题」内联了一份，这里负责在主题变化时更新它
  const themeTokensStyle = document.getElementById('fisher-theme-tokens');

  // 应用扩展下发的令牌色样式（空字符串表示「当前主题解析不出来」，
  // 清掉内联样式，交给 styles/disguise.ts 里按主题类型写的兜底调色板）
  function applyThemeTokens(css) {
    if (themeTokensStyle && typeof css === 'string') {
      themeTokensStyle.textContent = css;
    }
  }

  // 主动向扩展要一次令牌色：用 webview 自己拿到的主题 id 做校准，
  // 避免「HTML 渲染时刻」和「页面真正显示时刻」之间主题已经变了
  function requestThemeTokens() {
    if (!themeTokensStyle) {
      return;
    }
    const body = document.body;
    vscode.postMessage({
      command: 'themeTokensRequest',
      themeId: (body && body.dataset && body.dataset.vscodeThemeId) || '',
      themeKind: (body && body.dataset && body.dataset.vscodeThemeKind) || ''
    });
  }

  // 创建欢迎消息元素
  function createWelcomeMessage() {
    if (!welcomeMessageElement) {
      welcomeMessageElement = document.createElement('div');
      welcomeMessageElement.className = 'fisher-welcome-message';
      welcomeMessageElement.textContent = '欢迎回到 🐟 Fisher 🐟';
      document.body.appendChild(welcomeMessageElement);
    }
  }

  // 显示欢迎消息
  function showWelcomeMessage() {
    createWelcomeMessage();
    // 延迟显示以确保DOM已渲染
    setTimeout(() => {
      welcomeMessageElement.classList.add('show');
    }, 100);

    // 1秒后自动隐藏
    setTimeout(() => {
      hideWelcomeMessage();
    }, 1000);
  }

  // 隐藏欢迎消息
  function hideWelcomeMessage() {
    if (welcomeMessageElement) {
      welcomeMessageElement.classList.remove('show');
      welcomeMessageElement.classList.add('hide');
      // 动画完成后移除元素
      setTimeout(() => {
        if (welcomeMessageElement && welcomeMessageElement.parentNode) {
          welcomeMessageElement.parentNode.removeChild(welcomeMessageElement);
          welcomeMessageElement = null;
        }
      }, 300); // 匹配伪装界面的隐藏动画时间
    }
  }

  // 存储待执行的定时器ID，用于实现打断功能
  let welcomeMessageTimer = null;
  let hideDisguiseTimer = null;
  let hideElementTimer = null;

  // 监听来自扩展的消息
  window.addEventListener('message', function(event) {
    const message = event.data;

    // 主题令牌色更新（扩展在主题/配色设置变化时推送）
    if (message.command === 'themeTokens') {
      applyThemeTokens(message.css);
      return;
    }

    if (message.command === 'showDisguise' && disguiseElement) {
      // 打断功能：清除所有待执行的hideDisguise相关定时器
      if (welcomeMessageTimer) {
        clearTimeout(welcomeMessageTimer);
        welcomeMessageTimer = null;
      }
      if (hideDisguiseTimer) {
        clearTimeout(hideDisguiseTimer);
        hideDisguiseTimer = null;
      }
      if (hideElementTimer) {
        clearTimeout(hideElementTimer);
        hideElementTimer = null;
      }

      // 如果当前有欢迎消息在显示，立即隐藏它
      hideWelcomeMessage();

      // 清理所有可能的状态类，确保动画正常
      disguiseElement.classList.remove('show', 'hiding');
      // 先设置为透明状态
      disguiseElement.style.opacity = '0';
      disguiseElement.style.display = 'block';

      // 使用双重 requestAnimationFrame 确保状态完全重置
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // 移除内联样式，让CSS类接管
          disguiseElement.style.opacity = '';
          disguiseElement.classList.add('show');
        });
      });
      document.body.classList.add('disguise-active');
    } else if (message.command === 'hideDisguise' && disguiseElement) {
      // 打断功能：如果之前有showDisguise正在执行，不需要特别处理，直接开始hideDisguise流程

      // 新的时序：先显示欢迎消息，保持伪装界面
      showWelcomeMessage();

      // 等待1秒后同时隐藏伪装界面和欢迎消息
      welcomeMessageTimer = setTimeout(() => {
        // 同时开始隐藏动画
        if (disguiseElement) {
          disguiseElement.classList.remove('show');
          disguiseElement.classList.add('hiding');
        }

        hideWelcomeMessage();

        // 动画完成后隐藏伪装元素
        hideElementTimer = setTimeout(() => {
          if (disguiseElement) {
            disguiseElement.style.display = 'none';
            disguiseElement.classList.remove('hiding');
            document.body.classList.remove('disguise-active');
          }
          hideElementTimer = null; // 清除定时器引用
        }, 300); // 与CSS动画时间匹配
        welcomeMessageTimer = null; // 清除定时器引用
      }, 1000); // 等待1秒
    }
  });

  // 暴露全局函数供快捷键使用
  window.toggleDisguiseInterface = function() {
    if (!disguiseElement) return;

    const isVisible = disguiseElement.style.display === 'block' || disguiseElement.classList.contains('show');

    if (isVisible) {
      // 当前显示，需要隐藏 - 只通知extension，等待后端检查后再执行
      vscode.postMessage({
        command: 'manualDisguiseToggle',
        action: 'hide'
      });
      // 不再直接发送hideDisguise，等待后端响应
    } else {
      // 当前隐藏，需要显示 - 只通知extension，等待后端检查后再执行
      vscode.postMessage({
        command: 'manualDisguiseToggle',
        action: 'show'
      });
      // 不再直接发送showDisguise，等待后端响应
    }
  };

  // 为伪装界面添加点击事件监听，点击时退出伪装
  if (disguiseElement) {
    disguiseElement.addEventListener('click', function() {
      const isVisible = disguiseElement.style.display === 'block' || disguiseElement.classList.contains('show');

      if (isVisible) {
        // 如果伪装界面可见，点击时隐藏
        vscode.postMessage({
          command: 'manualDisguiseToggle',
          action: 'hide'
        });
      }
    });
  }

  // 脚本执行时校准一次令牌色（此时 VS Code 已经把主题 id 写进 body.dataset）
  requestThemeTokens();
})();
`;