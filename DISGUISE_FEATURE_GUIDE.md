# 伪装功能使用指南

## 功能概述

知乎 Fisher 的智能伪装功能可以在 WebView 失去焦点时，自动将标签页的图标、标题和整个界面伪装成 VSCode 代码编辑界面，提供最佳的隐蔽性。

## 功能配置

### 1. 基础配置

在VSCode设置中搜索 `zhihu-fisher` 可以找到以下相关配置：

- `zhihu-fisher.enableDisguise`: 启用智能伪装功能（默认：true）
- `zhihu-fisher.selectedDisguiseTypes`: 选择的伪装文件类型（建议通过界面设置）

### 2. 配置建议

```json
{
  "zhihu-fisher.enableDisguise": true,
  "zhihu-fisher.selectedDisguiseTypes": []   // 空数组表示使用所有类型
}
```

## 功能特性

### 1. 支持的伪装文件类型

- **编程语言**：JavaScript, TypeScript, Python, Java, C++, C#, Rust, Swift, Ruby, PHP, Lua, R
- **标记语言**：HTML, XML, Markdown, LaTeX
- **样式语言**：CSS, SCSS, Less
- **配置文件**：JSON, YAML, INI, Git配置文件
- **脚本文件**：PowerShell, SQL
- **日志文件**：各种日志格式

### 2. 智能代码生成

- 每种文件类型都有对应的代码生成器
- 生成的代码看起来真实但不具备实际逻辑
- 包含语法高亮和VSCode风格的界面

### 3. 触发机制

- **失去焦点时**：自动显示伪装界面
- **重新获得焦点时**：自动隐藏伪装界面，恢复原始内容
- **键盘快捷键**：`Ctrl+Shift+D` 手动切换伪装状态（可选）

## 技术实现

### 1. 核心组件

- `DisguiseManager`: 伪装管理器，负责生成伪装信息和界面
- `CodeGenerator`: 代码生成器，动态生成各种编程语言的代码
- `HtmlRenderer`: HTML渲染器，集成伪装界面到webview中

### 2. 工作流程

```
1. 用户打开文章 → 创建webview
2. webview失去焦点 → 触发伪装逻辑
3. 生成随机文件类型 → 生成对应代码
4. 渲染伪装界面 → 覆盖原始内容
5. webview重获焦点 → 隐藏伪装界面
```

### 3. 性能考虑

- 伪装界面在生成webview时一次性生成
- 使用CSS控制显隐，避免频繁DOM操作
- 代码生成采用工厂模式，支持各种文件类型

## 使用场景

### 智能伪装模式
- 默认启用的完整伪装模式
- 同时伪装标签页和界面内容
- 提供最佳的隐蔽性效果
- 在分屏模式下特别有效

## 注意事项

1. **性能影响**：伪装功能经过优化，对性能影响极小
2. **隐蔽性**：伪装效果取决于观察者的技术水平
3. **兼容性**：功能在所有支持的VSCode版本中都可正常工作

## 故障排除

### 1. 伪装不生效
- 检查 `enableDisguise` 配置是否开启
- 确认webview确实失去了焦点
- 查看控制台是否有错误信息

### 2. 界面伪装不显示
- 确认 `enableDisguise` 配置已开启（现在统一为完整伪装模式）
- 确认模板中包含伪装相关占位符
- 检查JavaScript控制脚本是否正确加载

### 3. 代码生成错误
- 检查 CodeGenerator 中是否包含对应文件类型的生成器
- 确认随机生成逻辑没有异常
- 查看语法高亮是否正确应用

## 开发者信息

如果你需要：
- 添加新的文件类型支持
- 修改伪装逻辑
- 优化性能

请参考以下文件：
- `src/core/utils/disguise-manager.ts` - 伪装管理器
- `src/core/utils/code-generator.ts` - 代码生成器
- `src/core/zhihu/webview/html.ts` - HTML渲染器
- `src/core/zhihu/webview/templates/article.ts` - 文章模板

---

*希望这个功能能帮助你更好地"摸鱼"！记住：适度摸鱼，健康工作 🐟*
