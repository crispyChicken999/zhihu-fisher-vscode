<p align="center">
  <img src="https://img2024.cnblogs.com/blog/3085939/202504/3085939-20250428102917058-270629388.png" alt="zhihu-fisher" width="200" height="200" />
</p>

<div align="center">

<h1>🐟 知乎摸鱼 (Zhihu Fisher)</h1>

![License](https://badgen.net/badge/License/MIT/red)
![VSCode](https://badgen.net/badge/VSCode/1.82.0+/blue?icon=visualstudio)
![Version](https://badgen.net/badge/Version/0.7.7/orange?icon=git)
![Platform](https://badgen.net/badge/Platform/Windows|MacOS|Linux/purple?icon=windows)

![Downloads](https://badgen.net/vs-marketplace/d/CrispyChicken.zhihu-fisher?label=Downloads&color=blue)
![Installs](https://badgen.net/vs-marketplace/i/CrispyChicken.zhihu-fisher?label=Installs&color=green)
![Rating](https://badgen.net/vs-marketplace/rating/CrispyChicken.zhihu-fisher?label=Rating&color=yellow)
![Stars](https://badgen.net/github/stars/crispyChicken999/zhihu-fisher-vscode?icon=github&label=Stars&color=gray)

</div>

使用 VSCode，浏览知乎推荐及热榜内容，快乐摸鱼。提供沉浸模式、隐藏图片、灰色模式、智能伪装模式，避免摸鱼被发现！支持评论区、搜索内容、查看关注人动态、管理收藏夹等功能。

## 📑 目录 (Table of Contents)

- [📑 目录 (Table of Contents)](#-目录-table-of-contents)
- [🔮 项目背景 (Project Background)](#-项目背景-project-background)
- [📸 功能预览 (Feature Preview)](#-功能预览-feature-preview)
- [✨ 主要功能 (Key Features)](#-主要功能-key-features)
- [💻 系统要求 (System Requirements)](#-系统要求-system-requirements)
- [🚀 快速开始 (Quick Start)](#-快速开始-quick-start)
  - [1. 安装插件](#1-安装插件)
  - [2. 配置浏览器](#2-配置浏览器)
  - [3. 配置 Cookie](#3-配置-cookie)
  - [4. 开始使用](#4-开始使用)
- [💥 更新日志 (Changelog)](#-更新日志-changelog)
- [🗺️ TODO (Roadmap)](#️-todo-roadmap)
- [❓ 常见问题 (FAQ)](#-常见问题-faq)
- [🔧 技术实现 (Technical Implementation)](#-技术实现-technical-implementation)
- [📬 问题反馈 (Issue Feedback)](#-问题反馈-issue-feedback)
- [⚠️ 免责声明 (Disclaimer)](#️-免责声明-disclaimer)
- [🤝 参与贡献 (Contributing)](#-参与贡献-contributing)
- [🤝 贡献者 (Contributors)](#-贡献者-contributors)
- [📄 开源协议 (License)](#-开源协议-license)
- [💖 赞赏支持 (Support)](#-赞赏支持-support)
- [⭐ Star History](#-star-history)

## 🔮 项目背景 (Project Background)

- 假装敲代码，实则在 VSCode 中刷知乎！
- 其实就是想上班摸会鱼，直接网页刷知乎容易被抓包，并且网页有很多图片更明显了，老板同事一看就知道你小子在摸鱼。（工资-1😅）
- 扩展市场一搜，发现已有插件基本上是几年前的产物了，许久不更新，基本上用不了 😥，索性就直接写了一个。
- 写这个插件的初衷就是写来自己用，就顺手开源出来，独乐乐不如众乐乐。 👌
- 如果有更多的意见和建议，欢迎提交[Issues](https://github.com/crispyChicken999/zhihu-fisher-vscode/issues)。我会尽快修复和更新~ 欢迎许愿 🤓☝
- 若本插件对您有所帮助，麻烦给个好评，感谢~（点一下插件名字旁边的五星即可 🎉，感谢！）
- 帮我在 [Github](https://github.com/crispyChicken999/zhihu-fisher-vscode) 上点个 Star ⭐吧~ 让更多人知道这个插件！
- 用爱发电不易，也欢迎大家[赞赏](#-赞赏支持-support)~ 😘
- 欢迎推荐给你的同事，让他们也能在 VSCode 中愉快摸鱼！🤣 独摸摸不如众摸摸~

## 📸 功能预览 (Feature Preview)

<div align="center">

<img src="https://img2024.cnblogs.com/blog/3085939/202601/3085939-20260105093007226-1194584688.gif" alt="智能伪装模式示例" width="800">

_主要功能展示_

</div>

## ✨ 主要功能 (Key Features)

1. 支持 加载`知乎热榜`
2. 支持 加载`知乎推荐`
3. 支持 加载`知乎关注`
4. 支持 加载`搜索结果`
5. 支持 加载`知乎链接`的内容，如问题、文章、想法等（通过侧边栏 `...` - 浏览指定链接加载）
6. 支持 支持对回答、文章、想法进行`赞同/不赞同、点赞评论`的操作
7. 支持 关注/取消关注`用户`，关注后可以在关注列表中查看该用户的最新动态
8. 支持 完整的`收藏夹`功能，查看和管理自己创建和关注的收藏夹
9. 支持 阅读区`样式调整`，详情页可以调整字体大小、颜色、排版等样式，更加隐蔽地摸鱼
10. 支持 调整`图片、视频等的显示方式`，提供多媒体模式切换（隐藏|迷你|正常）的功能，偷摸摸 or 光明正大地看图片，隐藏模式支持鼠标悬浮 `[图片]`、`[动图]`、`[视频]`、`[表情]` 查看缩略图、偷摸摸看视频
11. 支持 `快捷键`操作，键盘 `← → / A|D` 切换上/下一个回答，按 `/` 调整图片显示，按 `Crtl+↑↓ / W|S` 切换上/下篇内容
12. 支持 `快捷键自定义`，可以根据自己的习惯设置快捷键，按 `。` 打开设置面板，切换到快捷键 tab 进行调整即可
13. 支持 `评论区`（逗号），可以查看文章/回答/想法的评论内容，同时支持查看评论的子评论
14. 支持 `沉浸模式`（X），**强烈推荐使用** 🎉，隐藏其他不重要的信息，只显示问题标题和回答内容
15. 支持 `收藏文章`（F）、问答、想法到指定收藏夹，支持缓存收藏夹信息，避免每次都要重新加载
16. 支持 `灰色模式`（G），将页面所有内容转为灰色显示，进一步地摸鱼，降低被老板发现的风险
17. 支持 `智能伪装模式`，切到其他页面后自动将文章页面的标题和图标伪装为代码文件，界面伪装成代码编辑界面，避免摸鱼被发现，切回后自动恢复，支持快捷键 `Space` 显示/隐藏伪装界面
18. 支持 `侧边栏伪装模式`，侧边栏会伪装成文件列表，进一步增强伪装效果
19. 支持 `自定义智能伪装模式列表`，用户可以自定义伪装的标题和图标，满足不同用户的需求，例如前端开发可以伪装为 `HTML/JS/CSS` 文件，后端开发可以伪装为 `Python/Java/Go` 文件等
20. 支持 导出为 `Markdown` 文件，方便离线阅读和保存，导出的文件包含了问题标题、描述、每个回答的内容及评论信息、作者信息、点赞数、评论数等详细信息
21. 支持 `知乎 AI (知乎直答)` 弹窗查看内容中的关键词解释
22. 支持 `AI 总结回答` 功能，一键获取当前回答的核心内容摘要
23. 支持 `过滤点赞内容`，现在可以通过配置来选择是否过滤关注的人的点赞内容，使阅读可以更加聚焦在创作内容上
24. 支持 `想法（PinItem）`类型内容，可以在关注列表中查看、浏览想法详情，支持点赞、收藏、评论、不喜欢等完整交互功能
25. 支持 `问题详情页回答过滤`，可以按已读（这里认为点过赞/踩就是已经读过了的状态）状态过滤回答内容，支持在侧边栏快速切换过滤模式（仅限问题详情页，文章和想法不可用），提供全部展示、仅展示未读（点赞/点踩按钮都未点击过）两种模式

更多功能，敬请探索~

## 💻 系统要求 (System Requirements)

- **VSCode 版本**：1.82.0 及以上
- **操作系统**：Windows / MacOS / Linux
- **浏览器**：Chrome 120+ 或使用插件自动安装的 Chromium

## 🚀 快速开始 (Quick Start)

### 1. 安装插件

在 VSCode 扩展市场搜索 "Zhihu Fisher" 并安装，安装完成后在侧边栏中找到 📖 图标。

---

### 2. 配置浏览器

本插件使用 Puppeteer 库在后台模拟浏览器访问知乎，因此需要配置 Chrome 浏览器路径。
配置完成后，请重启 VSCode 以应用设置。

> **工作原理**：插件通过 Puppeteer 在后台启动浏览器，模拟用户浏览行为获取内容，然后在 VSCode 中进行展示。

⚙️ 插件提供两种浏览器配置方式：

1. **使用本地浏览器（推荐）**：使用已安装的 Chrome 浏览器
2. **自动安装浏览器**：通过插件自动下载并安装 Chromium

<details>
<summary>使用本地浏览器</summary>

您可以使用本地已安装的 Chrome 浏览器。在侧边栏设置入口或通过 `Ctrl/Command` + `,` 打开设置，搜索 `zhihu`，找到 `Custom Chrome Path`，输入本地浏览器的可执行文件路径。也可以直接侧边栏...找到`配置浏览器`输入路径。

> **版本要求**：建议使用 Chrome 120 及以上版本，以确保插件功能正常运行。

**参考路径**：Chrome 浏览器的默认安装路径如下（实际安装路径可能不同，请根据实际情况调整）：

💻 各系统默认浏览器路径:

> 一般情况下谷歌浏览器都会安装在`示例路径`下，直接复制粘贴即可，如果不行就按照下面的方法去获取。

- **Windows 用户**：需要以`chrome.exe`结尾
  ```
  C:\Program Files\Google\Chrome\Application\chrome.exe
  ```
- **Mac 用户**：
  ```
  /Applications/Google Chrome.app/Contents/MacOS/Google Chrome
  ```
- **Linux 用户**：
  ```
  /usr/bin/google-chrome
  ```

<details>
<summary>Windows 获取本地 Chrome 浏览器路径的方法</summary>

1. 在桌面上找到 Chrome 浏览器的快捷方式，右键点击，选择"属性"
2. 在"快捷方式"选项卡中，找到"目标"字段，复制该路径
3. 将路径中的`"C:\Program Files\Google\Chrome\Application\chrome.exe"`去掉引号，保留路径部分即可

- 如果还是不清楚，可以参照下图：
  ![获取本地浏览器路径的方式](https://img2024.cnblogs.com/blog/3085939/202504/3085939-20250425154308398-1262720236.png)

---

</details>

<details>
<summary>Mac 获取本地 Chrome 浏览器路径的方法</summary>

1. 打开终端（Terminal），输入以下命令：`ls /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome`
2. 如果显示了路径，则说明 Chrome 浏览器已安装在该位置
3. 如果没有安装，可以在终端中输入以下命令进行安装：`brew install --cask google-chrome`
4. 安装完成后，重新运行第一步的命令即可（如果找不到请百度，因为手头没有 Mac 电脑，无法测试）

---

</details>

<details>
<summary>Linux 获取本地 Chrome 浏览器路径的方法</summary>

1. 打开终端，输入以下命令：`which google-chrome` 或 `which chromium-browser`
2. 如果显示了路径，则说明 Chrome 浏览器已安装在该位置
3. 如果没有安装，可以在终端中输入以下命令进行安装：`sudo apt install google-chrome-stable` 或 `sudo apt install chromium-browser`
4. 安装完成后，重新运行第一步的命令即可
5. 如果还是不清楚，可以百度一下，因为手头没有 Linux 电脑，无法测试 🤔

---

</details>

---

</details>

<details>
<summary>安装浏览器</summary>

选择自动安装后，Chromium 浏览器将被下载并安装到以下位置：

📦 Puppeteer 安装的浏览器路径

- **Windows 用户**：`C:\Users\[用户名]\.cache\puppeteer\chrome\win64-135.0.7049.84\chrome-win64\chrome.exe`
- **Mac 用户**：`/Users/[用户名]/Library/Caches/puppeteer/chrome/mac-x64-135.0.7049.84/chrome-mac-x64/Google Chrome.app/Contents/MacOS/Google Chrome`
- **Linux 用户**：`/home/[用户名]/.cache/puppeteer/chrome/linux-x64-135.0.7049.84/chrome-linux-x64/chrome`

</details>

---

### 3. 配置 Cookie

插件需要登录知乎账号才能访问推荐、热榜等需要登录的内容。提供两种配置方式：

<details>
<summary>方式一：扫码登录（推荐）</summary>

无需手动复制 Cookie，使用知乎 App 扫码即可自动登录。

1. 在侧边栏标题右键菜单中选择 **【扫码登录知乎】**
2. 使用知乎 App 扫描显示的二维码
3. 确认登录后，Cookie 将自动配置完成

> 💡 扫码登录使用**独立的无痕浏览器上下文**，与您的日常浏览数据完全隔离，不会读取或修改您已有的知乎 Cookie。
> 详细原理和隐私说明请参考下方的 [📱 扫码登录隐私说明](#-扫码登录隐私说明-点击展开)。

</details>

<details>
<summary>方式二：手动设置 Cookie</summary>

如果您无法使用扫码登录，也可以手动从浏览器获取 Cookie：

在知乎网页端登录后，按 `F12` 打开开发者工具，切换到「网络」选项卡，选择任意一个请求，在请求头中找到 `Cookie` 字段，复制其值并粘贴到 VSCode 中的输入框。

<div align="center">

![获取Cookie的方式](https://img2024.cnblogs.com/blog/3085939/202504/3085939-20250424143443844-967882670.webp)
_Cookie 获取示例图_

</div>

</details>

> 🔒 **隐私说明**：Cookie 仅存储在您的本地 VSCode 配置文件中，插件不会上传或分享您的 Cookie 信息。插件仅使用 Cookie 来模拟登录状态，获取知乎推荐和热榜内容。所有代码完全开源，欢迎审查源码验证安全性。

---

> **💡 提示**：如果 Cookie 过期或登录状态失效，可以随时在侧边栏菜单中选择【扫码登录】或【设置 Cookie】重新配置。

---

### 4. 开始使用

配置完成后，插件将自动加载内容。点击侧边栏中的内容即可开始阅读。开始愉快摸鱼吧 🐟🎉~

> **离线安装**：如果 VS Marketplace 无法访问，也可以从 [GitHub Releases](https://github.com/crispyChicken999/zhihu-fisher-vscode/releases) 下载 `.vsix` 文件手动安装。

## 💥 更新日志 (Changelog)

- 查看[完整更新日志](./CHANGELOG.md)，了解所有版本的详细更改。

## 🗺️ TODO (Roadmap)

- [ ] 支持多账号切换
- [ ] 支持离线阅读模式
- [ ] 提供数据统计和阅读分析
- [ ] 支持更多平台内容聚合
- [ ] ...

> 💡 欢迎在 [Issues](https://github.com/crispyChicken999/zhihu-fisher-vscode/issues) 中提出您的功能建议！
> **注意**：本插件**不计划支持**任何绕过付费墙、破解会员限制或去广告功能。

## ❓ 常见问题 (FAQ)

<details>
<summary>已修复的问题</summary>

1.  ~~**推荐列表可能加载不出来**~~ **(v0.3.0 已优化，在设置 Cookie 时去除了 BEC 参数，但是最好知乎首页也切换到推荐列表后，再拿 Cookie，预防一手)**
    - ~~可能跟 Cookie 中 BEC 参数有关，那么需要你前往知乎首页，点击推荐切换到推荐列表，然后刷新页面，获取新的 Cookie，粘贴到 VSCode 中即可。~~
    - ~~我猜这个参数可能记录了用户的操作，比如之前切换到热榜列表，那么下次打开知乎也切到热榜，所以需要切到推荐后再拿 Cookie。 ~~
2.  ~~**在加载回答的时候，会出现页面状态重置的问题**~~ **(v0.3.4 已修复，局部刷新 DOM，避免整个覆盖导致状态丢失)**
    - ~~就比如打开了子评论的弹窗正看着，然后又加载了一批回答，那么页面就会回到初始状态（对应的就是子评论弹窗被关闭，页面回到顶部）。~~
    - ~~这个问题是因为直接将整个 HTML 文档替换来更新状态导致的。代码是用 TS 写的没用主流框架，暂时也没动力改了，凑合着用吧。~~
    - ~~其实应该通过 postMessage 的方式去通知文档哪里需要更新，而不是整个文档重新生成然后替换~~

</details>

<details>
<summary>当前已知限制</summary>

3.  **为啥要等推荐列表加载出来才能查看内容呢？**
    - 如果在推荐加载过程中，你查看了内容，Puppeteer 就会打开一个新标签页获取内容。
    - 那么对应知乎首页的标签页失去焦点，我们在后台尝试滚动加载更多会失效，所以需要等推荐列表加载完成后再查看内容。
    - 我是想着不管你机制怎么变，我都是模拟人在访问，那么就算慢点也无妨，毕竟也能够加载出来
4.  **评论可能出现重复**
    - 因为新版接口有防爬机制，所以用的是无限制的旧版接口，那么有时候可能会看到重复的评论，这个我也没招，毕竟是接口返回回来的。哎凑合着看吧哈哈...

</details>

> 更多问题，欢迎在 [Issues](https://github.com/crispyChicken999/zhihu-fisher-vscode/issues) 中进行反馈，我看到后会尽快修复。

## 🔧 技术实现 (Technical Implementation)

- 基于 VSCode 插件脚手架，使用 Puppeteer 在后台来模拟浏览知乎，抓取内容并渲染成 HTML，最后在 VSCode 中显示。
- 技术栈：TypeScript、Puppeteer、Cheerio、HTML、CSS

## 📬 问题反馈 (Issue Feedback)

- 在[GitHub Issues](https://github.com/crispyChicken999/zhihu-fisher-vscode/issues)中提交问题，我看到会尽快回复和修复。

## ⚠️ 免责声明 (Disclaimer)

本插件为个人开源项目，仅供**个人学习、技术研究和日常摸鱼**使用。

- **内容获取**：插件通过本地浏览器内核（Puppeteer）加载知乎网页，所有内容均为用户本人已登录状态下可见的内容，**不绕过任何付费墙、不破解任何反爬机制、不盗用他人账户凭证**。
- **交互操作**：点赞、评论等功能由**用户手动触发**，每次操作对应一次真实的浏览器交互，**不存在自动、批量、预设脚本行为**。
- **数据安全**：用户的知乎 Cookie 仅存储在本地 VSCode 配置文件中，不会被上传或共享给任何第三方。所有代码完全开源，欢迎审查源码验证安全性。

<details>
<summary>📱 扫码登录隐私说明 (点击展开)</summary>

本插件自 v0.7.5 起新增扫码登录功能。我们理解您可能对扫码登录的安全性和隐私存在顾虑，以下是详细的技术说明：

1. **技术原理**
   - 插件通过 Puppeteer 在本地启动一个**沙箱浏览器实例**，访问知乎官方的登录页面（`https://www.zhihu.com/signin`）。
   - 知乎官方页面会生成一个**临时二维码**，插件仅对该二维码区域进行**截图**并在 VSCode 中展示给您。
   - 您使用知乎 App 扫码后，知乎服务器会直接向该浏览器实例下发登录态 Cookie，插件**自动捕获并保存**到本地配置中。

2. **隐私保障**
   - ✅ **二维码由知乎官方生成**：二维码内容由知乎官方服务器生成并控制，插件仅负责截图展示，**不做任何篡改、替换或重定向**。
   - ✅ **本地无痕浏览**：扫码登录使用独立的**无痕浏览器上下文**，与您的日常浏览数据完全隔离，不会读取或修改您已有的知乎 Cookie。
   - ✅ **Cookie 仅存本地**：登录成功后获取的 Cookie **仅保存到您本地的 VSCode 配置文件**（与手动设置 Cookie 保存位置完全相同），**不会以任何形式上传或发送到任何第三方服务器**。
   - ✅ **临时会话自动清理**：扫码完成后，用于登录的浏览器实例和临时上下文会被**立即关闭并清理**，不会留下任何残留数据。
   - ✅ **代码完全开源**：扫码登录的完整逻辑均在 [`src/core/commands/qr-login.ts`](https://github.com/crispyChicken999/zhihu-fisher-vscode/blob/master/src/core/commands/qr-login.ts) 中实现，欢迎审查源码验证上述描述。

3. **为什么不直接使用账号密码登录？**
   - 插件**不提供**账号密码登录方式，原因如下：
     - 账号密码登录需要将您的凭证发送到知乎服务器进行验证，这可能被恶意利用。
     - 扫码登录是 OAuth 标准的授权模式，您直接与知乎官方交互，插件全程不接触您的账号密码。
     - 二维码具有**一次性**和**时效性**（通常 2-5 分钟），即使被截获也难以被重放利用。

4. **使用建议**
   - 请确保从**官方 VS Marketplace** 或 **GitHub Releases** 渠道安装本插件，避免使用来路不明的修改版本。
   - 扫码时请确认 VSCode 中显示的二维码是知乎官方登录页内容（建议核对域名是否为 `zhihu.com`）。
   - 如遇到任何安全问题，请通过 [GitHub Issues](https://github.com/crispyChicken999/zhihu-fisher-vscode/issues) 反馈。

</details>

> 🐟 **请合理使用，文明摸鱼！尊重知识产权，遵守平台规则！**

使用者应遵守 [知乎用户协议](https://www.zhihu.com/terms) 及相关法律法规。因使用本插件产生的任何纠纷或损失，**开发者不承担任何责任**。若知乎官方认为本插件存在侵权或不妥之处，请联系开发者，将在收到通知后第一时间配合处理（下架或修改）。

<details>
<summary>详细使用条款 (点击展开)</summary>

使用本插件即表示您同意以下条款：

1. **遵守法律法规**：遵守中华人民共和国相关法律法规
2. **遵守平台规则**：遵守知乎的用户协议和服务条款
3. **合理使用**：避免给知乎服务器造成过大负担
4. **尊重版权**：尊重原创作者的版权和知识产权
5. **自担风险**：因使用本插件产生的任何纠纷或损失，开发者不承担任何责任
6. **配合下架**：如知乎官方认为本项目侵权，作者将立即配合下架处理

</details>

## 🤝 参与贡献 (Contributing)

众人拾柴火焰高，欢迎各位开发者一同参与到本项目中来，共同完善和提升这个插件！
感谢每一位贡献者！🙏

<details>
<summary>贡献方式</summary>

1. **Fork** 本仓库到您的 GitHub 账户
2. **Clone** 到本地：`git clone https://github.com/crispyChicken999/zhihu-fisher-vscode.git`
3. **创建分支**：`git checkout -b feature/your-feature-name`
4. **提交更改**：`git commit -am 'Add some feature'`
5. **推送分支**：`git push origin feature/your-feature-name`
6. **提交 Pull Request**
</details>

<details>
<summary>开发说明</summary>

```bash
# 安装依赖
npm install

# 启动开发模式
npm run watch

# 按 F5 开始调试
```

</details>

> 更多说明，请查看 [OPEN_SOURCE.md](./OPEN_SOURCE.md)。

## 🤝 贡献者 (Contributors)

感谢所有为本项目做出贡献的开发者！

<a href="https://github.com/crispyChicken999/zhihu-fisher-vscode/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=crispyChicken999/zhihu-fisher-vscode" />
</a>

> 贡献者头像由 [contrib.rocks](https://contrib.rocks) 自动生成

## 📄 开源协议 (License)

- 本项目采用 [MIT 协议](./LICENSE) 开源，您可以自由使用、修改和分发。

## 💖 赞赏支持 (Support)

- 如果这个插件让你的摸鱼时光更愉快，可以扫码请我喝杯咖啡 ☕。
- **这是完全自愿的赠与行为，与插件功能无关，不构成任何形式的购买或对价关系**。
- 你的支持是我更新的动力~ ❤️ 看到这里，帮忙给个 Star ⭐️ 支持一下吧！

![赞赏码](https://img2024.cnblogs.com/blog/3085939/202504/3085939-20250425153014632-145153684.jpg)

> 如果帮到你，也欢迎给个好评 ⭐（点一下插件名字旁边的五星即可 🎉），或者在 [GitHub](https://github.com/crispyChicken999/zhihu-fisher-vscode) 上点个 Star 支持一下！

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=crispyChicken999/zhihu-fisher-vscode&type=date&legend=top-left)](https://www.star-history.com/#crispyChicken999/zhihu-fisher-vscode&type=date&legend=top-left)
