# 欢迎使用知乎摸鱼插件 (Zhihu Fisher)

## 文件夹内容

- 这个文件夹包含了运行此插件所需的所有文件。
- `package.json` - 这是清单文件，声明了插件的配置和命令。
  - 插件注册了多个命令并定义了它们的标题和命令名称。通过这些信息，VS Code 可以在命令面板中显示这些命令。
- `src/extension.ts` - 这是主文件，提供了命令的具体实现。
  - 该文件导出一个 `activate` 函数，当插件第一次被激活时会调用此函数。在 `activate` 函数中注册了各种命令。
  - 命令的具体实现作为第二个参数传递给 `registerCommand`。

## 环境准备

- 安装推荐的扩展 (amodio.tsl-problem-matcher, ms-vscode.extension-test-runner, 和 dbaeumer.vscode-eslint)
- 确保已安装 Node.js 和 npm/pnpm

## 快速开始使用

## 快速开始使用

### 方法一：从源码运行（开发模式）

1. **克隆仓库并安装依赖**

   ```bash
   git clone https://github.com/crispyChicken999/zhihu-fisher-vscode.git
   cd zhihu-fisher-vscode
   npm install  # 或使用 pnpm install
   ```

2. **启动开发模式**

   - 按 `F5` 打开一个加载了插件的新 VS Code 窗口。
   - 或者在命令面板中按 (`Ctrl+Shift+P` 或 Mac 上的 `Cmd+Shift+P`) 并输入 "Debug: Start Debugging"。

3. **使用插件功能**
   - 在新打开的窗口中，按 `Ctrl+Shift+P` (或 Mac 上的 `Cmd+Shift+P`) 打开命令面板
   - 输入 "知乎" 或 "Zhihu" 查看所有可用命令
   - 选择你想要的功能，如：
     - `知乎摸鱼: 热榜` - 查看知乎热榜
     - `知乎摸鱼: 推荐` - 查看推荐内容
     - `知乎摸鱼: 搜索` - 搜索知乎内容
     - 等等...

### 方法二：安装打包好的插件

1. **下载 VSIX 文件**

   - 从 [Releases](https://github.com/crispyChicken999/zhihu-fisher-vscode/releases) 页面下载最新的 `.vsix` 文件

2. **安装插件**

   - 在 VS Code 中按 `Ctrl+Shift+P` 打开命令面板
   - 输入 "Extensions: Install from VSIX..."
   - 选择下载的 `.vsix` 文件进行安装

3. **重启 VS Code** 并开始使用插件

## 开发和调试

- 在 `src/extension.ts` 中设置断点来调试插件。
- 在调试控制台中查看插件的输出。
- 修改 `src/extension.ts` 中的代码后，可以从调试工具栏重新启动插件。
- 也可以重新加载 (`Ctrl+R` 或 Mac 上的 `Cmd+R`) 加载了插件的 VS Code 窗口来应用更改。

## 构建和打包

- **开发构建**: `npm run compile` 或 `npm run watch`
- **生产构建**: `npm run compile-production`
- **打包插件**: `npm run package` (生成 .vsix 文件)

## 主要功能特性

- 🔥 **知乎热榜** - 实时查看知乎热门话题
- 📝 **推荐内容** - 获取个性化推荐文章
- 🔍 **搜索功能** - 在 VS Code 中搜索知乎内容
- 📚 **收藏管理** - 查看和管理知乎收藏
- 🎭 **智能伪装** - 让摸鱼看起来像在写代码
- 🌙 **深色模式** - 适配 VS Code 主题

## 探索 API

- 你可以通过打开 `node_modules/@types/vscode/index.d.ts` 文件来查看完整的 VS Code API 文档。

## 运行测试

- 安装 [Extension Test Runner](https://marketplace.visualstudio.com/items?itemName=ms-vscode.extension-test-runner)
- 通过 **Tasks: Run Task** 命令运行 "watch" 任务。确保此任务正在运行，否则可能无法发现测试。
- 从活动栏打开测试视图，点击 "Run Test" 按钮，或使用快捷键 `Ctrl/Cmd + ; A`
- 在测试结果视图中查看测试结果输出。
- 修改 `src/test/extension.test.ts` 或在 `test` 文件夹中创建新的测试文件。
  - 提供的测试运行器只会考虑匹配名称模式 `**.test.ts` 的文件。
  - 你可以在 `test` 文件夹中创建子文件夹来按你想要的方式组织测试。

## 贡献指南

- 通过 [bundling your extension](https://code.visualstudio.com/api/working-with-extensions/bundling-extension) 减少插件大小并提高启动时间。
- 在 VS Code 插件市场上 [发布你的插件](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)。
- 通过设置 [持续集成](https://code.visualstudio.com/api/working-with-extensions/continuous-integration) 自动化构建。

## 问题反馈

如果您在使用过程中遇到任何问题，请在 [GitHub Issues](https://github.com/crispyChicken999/zhihu-fisher-vscode/issues) 中提交反馈。

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

**注意**: 本插件仅供学习和娱乐使用，请合理安排工作和休息时间。🎯
