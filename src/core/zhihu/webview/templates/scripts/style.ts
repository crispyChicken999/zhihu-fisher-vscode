/**
 * 样式面板和设置脚本
 */
export const styleScript = `
  // 默认样式
  const defaultStyles = {
    fontSize: '13px',
    lineHeight: '1.6',
    maxWidth: '800px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe WPC", "Segoe UI", system-ui, "Ubuntu", "Droid Sans", sans-serif',
    contentColor: getComputedStyle(document.body).getPropertyValue('--vscode-foreground').trim(),
    textAlign: 'left'
  };

/**
 * 设置样式面板
 */
function setupStylePanel() {
  // 样式面板相关功能的初始化

  // 从localStorage加载样式设置
  const savedStyles = JSON.parse(localStorage.getItem('zhihu-fisher-text-styles')) || defaultStyles;

  if (savedStyles) {
    // 更新页面的样式
    document.body.style.fontSize = savedStyles.fontSize;
    document.body.style.lineHeight = savedStyles.lineHeight;
    document.body.style.maxWidth = savedStyles.maxWidth;
    document.body.style.fontFamily = savedStyles.fontFamily;
    document.querySelector('header').style.color = savedStyles.contentColor;
    document.querySelector('.question-detail-content').style.color = savedStyles.contentColor;
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
    localStorage.setItem('zhihu-fisher-text-styles', JSON.stringify(styles));
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
        document.querySelector('.question-detail-content').style.color = color;
        updateLocalStorage();

        // 更新预设按钮的选中状态
        const presetButtons = document.querySelectorAll('.color-preset-btn');
        presetButtons.forEach(btn => {
          if (btn.dataset.color === color) {
            btn.classList.add('selected');
          } else {
            btn.classList.remove('selected');
          }
        });
      });

      colorInput.value = savedStyles.contentColor || defaultStyles.contentColor;
      colorValue.textContent = savedStyles.contentColor || defaultStyles.contentColor;

      // 初始化预设按钮的选中状态
      setTimeout(() => {
        const currentColor = colorInput.value;
        const presetButtons = document.querySelectorAll('.color-preset-btn');
        presetButtons.forEach(btn => {
          if (btn.dataset.color === currentColor) {
            btn.classList.add('selected');
          } else {
            btn.classList.remove('selected');
          }
        });
      }, 100);
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

      // 重置灰色模式
      document.querySelector('html').classList.remove('grayscale-mode');
      localStorage.setItem('zhihu-fisher-grayscale-mode', 'false');
      const grayscaleToggle = document.getElementById('grayscale-toggle');
      if (grayscaleToggle) {
        grayscaleToggle.checked = false;
      }

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

          // 重置预设按钮的选中状态
          const presetButtons = document.querySelectorAll('.color-preset-btn');
          presetButtons.forEach(btn => {
            if (btn.dataset.color === defaultStyles.contentColor) {
              btn.classList.add('selected');
            } else {
              btn.classList.remove('selected');
            }
          });
        }
      }

      if (textAlignSelect) {
        textAlignSelect.value = defaultStyles.textAlign;
      }

      // 更新localStorage
      localStorage.removeItem('zhihu-fisher-text-styles');

      // 重置工具栏设置
      resetToolbarConfig();
      localStorage.removeItem('zhihu-fisher-toolbar-config');

      // 重置伪装类型选择
      resetDisguiseTypesSelection();

      // 重置快捷键
      resetShortcutConfig(false); // 不显示提示

      // 重置immersive-mode
      document.body.classList.remove('immersive-mode');

      // 清空localStorage中的缓存
      localStorage.clear();
    });
  }

  // 初始化伪装类型选择器
  setTimeout(() => {
    initializeDisguiseTypesSelector();
  }, 100);
}

/**
 * 切换样式设置面板Tab页
 */
function switchStyleTab(tabName) {
  // 隐藏所有Tab内容
  const tabContents = document.querySelectorAll('.style-tab-content');
  tabContents.forEach(content => {
    content.classList.remove('active');
  });

  // 移除所有Tab按钮的active状态
  const tabButtons = document.querySelectorAll('.style-tab-button');
  tabButtons.forEach(button => {
    button.classList.remove('active');
  });

  // 显示选中的Tab内容
  const selectedTab = document.getElementById(tabName + '-tab');
  if (selectedTab) {
    selectedTab.classList.add('active');
  }

  // 激活选中的Tab按钮
  const selectedButton = document.querySelector('[data-tab="' + tabName + '"]');
  if (selectedButton) {
    selectedButton.classList.add('active');
  }

  // 根据不同的Tab执行特定的初始化逻辑
  if (tabName === 'toolbar') {
    renderToolbarConfig();
  } else if (tabName === 'shortcuts') {
    renderShortcutConfig();
  } else if (tabName === 'enhancement') {
    // 如果需要特殊处理enhancement tab，在这里添加
  }

  // .style-panel-content 滚动到顶部
  const panelContent = document.querySelector('.style-panel-content');
  if (panelContent) {
    panelContent.scrollTop = 0;
  }
}

/**
 * 选择预设颜色
 * @param {string} color - 颜色值
 */
function selectPresetColor(color) {
  const colorInput = document.getElementById('content-color');
  const colorValue = document.getElementById('content-color-value');

  if (colorInput && colorValue) {
    // 更新颜色选择器的值
    colorInput.value = color;
    colorValue.textContent = color;

    // 应用颜色到页面元素
    const header = document.querySelector('header');
    const articleContent = document.querySelector('.article-content');
    const commentsContainer = document.querySelector('.comments-container');
    const commentsModal = document.querySelector('.comments-modal-container');
    const questionDetail = document.querySelector('.question-detail-content');

    if (header) header.style.color = color;
    if (articleContent) articleContent.style.color = color;
    if (commentsContainer) commentsContainer.style.color = color;
    if (commentsModal) commentsModal.style.color = color;
    if (questionDetail) questionDetail.style.color = color;

    // 更新本地存储
    const savedStyles = JSON.parse(localStorage.getItem('zhihu-fisher-text-styles')) || defaultStyles;
    savedStyles.contentColor = color;
    localStorage.setItem('zhihu-fisher-text-styles', JSON.stringify(savedStyles));

    // 更新预设按钮的选中状态
    const presetButtons = document.querySelectorAll('.color-preset-btn');
    presetButtons.forEach(btn => {
      if (btn.dataset.color === color) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });
  }
}

/**
 * 切换样式面板显示
 */
function toggleStylePanel(tab) {
  const panel = document.getElementById('style-panel');
  const mask = document.querySelector('.style-panel-mask');

  if (tab) {
    switchStyleTab(tab);
  }

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

  // 显示/隐藏伪装类型选择区域
  const disguiseTypesSection = document.getElementById('disguise-types-section');
  if (disguiseTypesSection) {
    disguiseTypesSection.style.display = enabled ? 'block' : 'none';
  }
}

/**
 * 设置样式面板 - 初始化伪装类型选择器
 */
function initializeDisguiseTypesSelector() {
  const container = document.getElementById('disguise-types-container');
  if (!container) return;

  // 文件类型定义 - 与后端保持一致
  const fileTypes = {
    "file_type_cheader.svg": { name: "C 头文件", preview: "stdio.h" },
    "file_type_cpp.svg": { name: "C++ 源文件", preview: "main.cpp" },
    "file_type_cppheader.svg": { name: "C++ 头文件", preview: "common.hpp" },
    "file_type_csharp.svg": { name: "C# 源文件", preview: "Program.cs" },
    "file_type_css.svg": { name: "CSS 样式文件", preview: "style.css" },
    "file_type_git.svg": { name: "Git 配置文件", preview: ".gitignore" },
    "file_type_html.svg": { name: "HTML 网页文件", preview: "index.html" },
    "file_type_ini.svg": { name: "INI 配置文件", preview: "config.ini" },
    "file_type_java.svg": { name: "Java 源文件", preview: "Main.java" },
    "file_type_js.svg": { name: "JavaScript 源文件", preview: "index.js" },
    "file_type_json.svg": { name: "JSON 配置文件", preview: "package.json" },
    "file_type_less.svg": { name: "Less 样式文件", preview: "style.less" },
    "file_type_light_tex.svg": { name: "LaTeX 文档", preview: "main.tex" },
    "file_type_light_yaml.svg": { name: "YAML 配置文件", preview: "config.yaml" },
    "file_type_log.svg": { name: "日志文件", preview: "application.log" },
    "file_type_lua.svg": { name: "Lua 脚本", preview: "init.lua" },
    "file_type_markdown.svg": { name: "Markdown 文档", preview: "README.md" },
    "file_type_php3.svg": { name: "PHP 源文件", preview: "index.php" },
    "file_type_powershell.svg": { name: "PowerShell 脚本", preview: "Install.ps1" },
    "file_type_python.svg": { name: "Python 脚本", preview: "main.py" },
    "file_type_r.svg": { name: "R 语言脚本", preview: "analysis.r" },
    "file_type_ruby.svg": { name: "Ruby 脚本", preview: "app.rb" },
    "file_type_rust.svg": { name: "Rust 源文件", preview: "main.rs" },
    "file_type_rust_toolchain.svg": { name: "Rust 工具链配置", preview: "rust-toolchain" },
    "file_type_scss.svg": { name: "Sass 样式文件", preview: "_variables.scss" },
    "file_type_sql.svg": { name: "SQL 脚本", preview: "schema.sql" },
    "file_type_swift.svg": { name: "Swift 源文件", preview: "AppDelegate.swift" },
    "file_type_typescript.svg": { name: "TypeScript 源文件", preview: "index.ts" },
    "file_type_typescriptdef.svg": { name: "TypeScript 声明文件", preview: "global.d.ts" },
    "file_type_vue.svg": { name: "Vue 组件文件", preview: "App.vue" },
    "file_type_xml.svg": { name: "XML 配置文件", preview: "config.xml" },
    "file_type_xsl.svg": { name: "XSL 样式表", preview: "transform.xsl" }
  };

  // 获取当前已选择的类型
  const selectedTypes = getSelectedDisguiseTypes();

  // 生成HTML
  let html = '<div class="disguise-type-grid">';

  Object.entries(fileTypes).forEach(([iconFile, info]) => {
    const isChecked = selectedTypes.includes(iconFile);
    html += \`
      <label class="disguise-type-item \${isChecked ? 'selected' : ''}">
        <input
          type="checkbox"
          value="\${iconFile}"
          \${isChecked ? 'checked' : ''}
          onchange="updateDisguiseTypeSelection()"
          class="disguise-type-checkbox"
        >
        <img
          src="\${resourcesBasePath}/fake/\${iconFile}"
          class="disguise-type-icon"
          alt=""
        >
        <div class="disguise-type-content">
          <div class="disguise-type-name">
            \${info.name}
          </div>
          <div class="disguise-type-preview">
            示例: \${info.preview}
          </div>
        </div>
      </label>
    \`;
  });

  html += '</div>';
  container.innerHTML = html;
}

/**
 * 获取当前选中的伪装类型
 */
function getSelectedDisguiseTypes() {
  try {
    return JSON.parse(localStorage.getItem('zhihu-fisher-selected-disguise-types') || '[]');
  } catch {
    return [];
  }
}

/**
 * 更新伪装类型选择
 */
function updateDisguiseTypeSelection() {
  const container = document.getElementById('disguise-types-container');
  if (!container) return;

  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  const selectedTypes = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  // 保存到localStorage
  localStorage.setItem('zhihu-fisher-selected-disguise-types', JSON.stringify(selectedTypes));

  // 通知后端更新配置
  vscode.postMessage({
    command: "updateSelectedDisguiseTypes",
    selectedTypes: selectedTypes
  });

  // 更新选中状态的样式
  checkboxes.forEach(cb => {
    const label = cb.closest('label');
    if (label) {
      if (cb.checked) {
        label.classList.add('selected');
      } else {
        label.classList.remove('selected');
      }
    }
  });
}

/**
 * 全选伪装类型
 */
function selectAllDisguiseTypes() {
  const container = document.getElementById('disguise-types-container');
  if (!container) return;

  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(cb => {
    cb.checked = true;
  });
  updateDisguiseTypeSelection();
}

/**
 * 清空所有伪装类型选择
 */
function clearAllDisguiseTypes() {
  const container = document.getElementById('disguise-types-container');
  if (!container) return;

  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(cb => {
    cb.checked = false;
  });
  updateDisguiseTypeSelection();
}

/**
 * 预览伪装效果
 */
function previewDisguise() {
  const selectedTypes = getSelectedDisguiseTypes();
  
  vscode.postMessage({
    command: "previewDisguise",
    selectedTypes: selectedTypes
  });
}

/**
 * 重置伪装类型选择
 */
function resetDisguiseTypesSelection() {
  // 清空localStorage中的伪装类型选择
  localStorage.removeItem('zhihu-fisher-selected-disguise-types');

  // 通知vscode清空配置
  vscode.postMessage({
    command: "updateSelectedDisguiseTypes",
    selectedTypes: []
  });

  // 重新初始化伪装类型选择器（会显示所有选项为未选中状态）
  setTimeout(() => {
    initializeDisguiseTypesSelector();
  }, 100);
}
`;
