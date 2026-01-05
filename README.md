<p align="center">
  <img src="https://img2024.cnblogs.com/blog/3085939/202504/3085939-20250428102917058-270629388.png" alt="zhihu-fisher"  width="200" height="200" />
</p>

<div align="center">

<h1>🐟 知乎摸鱼 (Zhihu Fisher)</h1>

![License](https://img.shields.io/badge/License-MIT-orange.svg)
![VSCode](https://img.shields.io/badge/VSCode-1.82.0%2B-blue.svg)
![Version](https://img.shields.io/badge/Version-0.5.8-green.svg)
![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20MacOS%20%7C%20Linux-purple.svg)

![Downloads](https://img.shields.io/visual-studio-marketplace/d/CrispyChicken.zhihu-fisher)
![Rating](https://img.shields.io/visual-studio-marketplace/r/CrispyChicken.zhihu-fisher)
![Stars](https://img.shields.io/github/stars/crispyChicken999/zhihu-fisher-vscode?style=social)

</div>

---

使用 VSCode，浏览知乎推荐及热榜内容，快乐摸鱼。提供沉浸模式、隐藏图片、灰色模式、智能伪装模式，避免摸鱼被发现！支持评论区、搜索内容、查看关注人动态、管理收藏夹等功能。

## 📑 目录

- [📑 目录](#-目录)
- [🔮 项目背景](#-项目背景)
- [📸 功能预览](#-功能预览)
- [✨ 主要功能](#-主要功能)
- [💻 系统要求](#-系统要求)
- [🚀 快速开始](#-快速开始)
  - [1. 安装插件](#1-安装插件)
  - [2. 配置浏览器](#2-配置浏览器)
  - [3. 配置 Cookie](#3-配置-cookie)
  - [4. 开始使用](#4-开始使用)
- [💥 更新日志](#-更新日志)
- [🗺️ 路线图](#️-路线图)
- [❓ 常见问题](#-常见问题)
- [🔧 技术实现](#-技术实现)
- [📬 问题反馈](#-问题反馈)
- [⚠️ 免责声明](#️-免责声明)
- [🤝 参与贡献](#-参与贡献)
- [🤝 贡献者](#-贡献者)
- [📄 开源协议](#-开源协议)
- [💖 欢迎赞赏](#-欢迎赞赏)
- [📊 Star History](#-star-history)

## 🔮 项目背景

- 假装敲代码，实则在 VSCode 中刷知乎！
- 其实就是想上班摸会鱼，直接网页刷知乎容易被抓包，并且网页有很多图片更明显了，老板同事一看就知道你小子在摸鱼。（工资-1😅）
- 扩展市场一搜，发现已有的基本上是几年前的产物了，许久不更新也用不了 😥，索性就直接写了一个。
- 写这个插件的初衷就是自己用，写了也就顺手开源出来，独乐乐不如众乐乐。 👌
- 如果有更多的意见和建议，欢迎提交[Issues](https://github.com/crispyChicken999/zhihu-fisher-vscode/issues)。我会尽快修复和更新~ 欢迎许愿 🤓☝
- 欢迎在[Github](https://github.com/crispyChicken999/zhihu-fisher-vscode)上帮我点个 Star ⭐，让更多人知道这个插件！
- 若本插件对您有所帮助，麻烦给个好评，感谢~（点一下插件名字旁边的五星即可 🎉，感谢！）
- 欢迎推荐给你的同事，让他们也能在 VSCode 中愉快摸鱼！🤣 独摸摸不如众摸摸~

## 📸 功能预览

<div align="center">

<img src="https://img2024.cnblogs.com/blog/3085939/202601/3085939-20260105093007226-1194584688.gif" alt="智能伪装模式示例" width="800">

_主要功能展示_

</div>

## ✨ 主要功能

1. 支持 加载`知乎热榜`
2. 支持 加载`知乎推荐`
3. 支持 加载`知乎关注`
4. 支持 加载`搜索结果`
5. 支持 加载特定`知乎链接`的内容
6. 支持 支持对回答、文章进行`赞同/不赞同`的操作
7. 支持 关注/取消关注`用户`，关注后可以在关注列表中查看该用户的最新动态
8. 支持 完整的`收藏夹`功能，查看和管理自己创建和关注的收藏夹
9. 支持 阅读区`样式调整`，详情页可以调整字体大小、颜色、排版等样式，更加隐蔽地摸鱼
10. 支持 调整`图片、视频等的显示方式`，提供多媒体模式切换（隐藏|迷你|正常）的功能，偷摸摸 or 光明正大地看图片
11. 支持 `快捷键`操作，键盘 `← → / A|D` 切换上/下一个回答，按 `/` 调整图片显示，按 `Crtl+↑↓ / W|S` 切换上/下篇内容
12. 支持 `快捷键自定义`，可以根据自己的习惯设置快捷键，按 `。` 打开设置面板，切换到快捷键 tab 进行调整即可
13. 支持 `评论区`（逗号），可以查看文章/回答的评论内容，同时支持查看评论的子评论
14. 支持 `沉浸模式`（X），强烈推荐使用 🎉，隐藏其他不重要的信息，只显示问题标题和回答内容
15. 支持 `收藏文章`（F）、问答到指定收藏夹，支持缓存收藏夹信息，避免每次都要重新加载
16. 支持 `灰色模式`（G），将页面所有内容转为灰色显示，进一步地摸鱼，降低被老板发现的风险
17. 支持 `智能伪装模式`，切到其他页面后自动将文章页面的标题和图标伪装为代码文件，界面伪装成代码编辑界面，避免摸鱼被发现，切回后自动恢复，支持快捷键 `Space` 显示/隐藏伪装界面
18. 支持 `侧边栏伪装模式`，侧边栏会伪装成文件列表，进一步增强伪装效果
19. 支持 `自定义智能伪装模式列表`，用户可以自定义伪装的标题和图标，满足不同用户的需求，例如前端开发可以伪装为 `HTML/JS/CSS` 文件，后端开发可以伪装为 `Python/Java/Go` 文件等
20. 支持 导出为 `Markdown` 文件，方便离线阅读和保存，导出的文件包含了问题标题、描述、每个回答的内容及评论信息、作者信息、点赞数、评论数等详细信息

更多功能，敬请探索~

## 💻 系统要求

- **VSCode 版本**：1.82.0 及以上
- **操作系统**：Windows / MacOS / Linux
- **浏览器**：Chrome 120+ 或使用插件自动安装的 Chromium

## 🚀 快速开始

### 1. 安装插件

在 VSCode 扩展市场搜索 "Zhihu Fisher" 并安装，安装完成后在侧边栏中找到 📖 图标。

### 2. 配置浏览器

本插件使用 Puppeteer 库在后台模拟浏览器访问知乎，因此需要配置 Chrome 浏览器路径。

配置完成后请重启 VSCode 以应用设置。

> **工作原理**：插件通过 Puppeteer 在后台启动浏览器，模拟用户浏览行为获取内容，然后在 VSCode 中进行展示。

插件提供两种浏览器配置方式：

1. **使用本地浏览器（推荐）**：使用已安装的 Chrome 浏览器
2. **自动安装浏览器**：通过插件自动下载并安装 Chromium

<details>
<summary>使用本地浏览器</summary>

您可以使用本地已安装的 Chrome 浏览器。在侧边栏设置入口或通过 `Ctrl/Command` + `,` 打开设置，搜索 `zhihu`，找到 `Custom Chrome Path`，输入本地浏览器的可执行文件路径。也可以直接侧边栏...找到`配置浏览器`输入路径。

> **版本要求**：建议使用 Chrome 120 及以上版本，以确保插件功能正常运行。

**参考路径**：Chrome 浏览器的默认安装路径如下（实际安装路径可能不同，请根据实际情况调整）：

---

<details>
<summary>💻 各系统默认浏览器路径</summary>

> 一般情况下谷歌浏览器都会安装在这个路径下，直接复制粘贴即可，如果不行就按照下面的方法去获取。

- **Windows 用户**：`C:\Program Files\Google\Chrome\Application\chrome.exe`，需要以`chrome.exe`结尾
- **Mac 用户**：`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
- **Linux 用户**：`/usr/bin/google-chrome` 或 `/snap/bin/chromium` （第一个路径是推荐的）

---

</details>

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
</details>

<details>
<summary>安装浏览器</summary>

选择自动安装后，Chromium 浏览器将被下载并安装到以下位置：

📦 Puppeteer 安装的浏览器路径

- **Windows 用户**：`C:\Users\[用户名]\.cache\puppeteer\chrome\win64-135.0.7049.84\chrome-win64\chrome.exe`
- **Mac 用户**：`/Users/[用户名]/Library/Caches/puppeteer/chrome/mac-x64-135.0.7049.84/chrome-mac-x64/Google Chrome.app/Contents/MacOS/Google Chrome`
- **Linux 用户**：`/home/[用户名]/.cache/puppeteer/chrome/linux-x64-135.0.7049.84/chrome-linux-x64/chrome`

</details>

### 3. 配置 Cookie

输入知乎账号的 Cookie 信息，插件将自动加载推荐及热榜内容。

<details>
<summary>Cookie 获取方式</summary>

在知乎网页端登录后，按 `F12` 打开开发者工具，切换到「网络」选项卡，选择任意一个请求，在请求头中找到 `Cookie` 字段，复制其值并粘贴到 VSCode 中的输入框。

<div align="center">

![获取Cookie的方式](https://img2024.cnblogs.com/blog/3085939/202504/3085939-20250424143443844-967882670.webp)
_Cookie 获取示例图_

</div>

> Cookie 使用说明：Cookie 仅存储在您的本地 VSCode 配置文件中，插件不会上传或分享您的 Cookie 信息。插件仅使用 Cookie 来模拟登录状态，获取知乎推荐和热榜内容。所有代码完全开源，欢迎审查源码验证安全性。

</details>

### 4. 开始使用

配置完成后，插件将自动加载内容。点击侧边栏中的内容即可开始阅读。开始愉快摸鱼吧 🐟🎉~

## 💥 更新日志

- 查看[完整更新日志](./CHANGELOG.md)，了解所有版本的详细更改。

## 🗺️ 路线图

- [ ] 支持多账号切换
- [ ] 支持离线阅读模式
- [ ] 提供数据统计和阅读分析
- [ ] 支持更多平台内容聚合
- [ ] ...

> 💡 欢迎在 [Issues](https://github.com/crispyChicken999/zhihu-fisher-vscode/issues) 中提出您的功能建议！

## ❓ 常见问题

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

---

> 更多问题，欢迎在 [Issues](https://github.com/crispyChicken999/zhihu-fisher-vscode/issues) 中进行反馈，我看到后会尽快修复。

## 🔧 技术实现

- 基于 VSCode 插件脚手架，使用 Puppeteer 在后台来模拟浏览知乎，抓取内容并渲染成 HTML，最后在 VSCode 中显示。
- 技术栈：TypeScript、Puppeteer、Cheerio、HTML、CSS

## 📬 问题反馈

- 在[GitHub Issues](https://github.com/crispyChicken999/zhihu-fisher-vscode/issues)中提交问题，我看到会尽快回复和修复。

## ⚠️ 免责声明

- **本插件仅供学习和研究目的使用，请勿用于任何商业用途。**
- **本项目与知乎官方无任何关联，仅为个人学习和技术研究项目。**

<details>
<summary>免责声明</summary>

**本插件仅供学习和研究目的使用，请勿用于任何商业用途。**

**隐私保护：** 本插件仅将浏览器中已展示的内容搬运至 VSCode 中展示，不会上传、收集、存储或分析任何用户数据或隐私信息，所有数据仅在本地处理，不会用于任何营利行为。

**技术说明：** 插件不会绕过知乎的反爬机制，不会恶意破坏或影响原网站正常使用。知乎对部分内容采用反爬技术，可能导致显示异常，建议直接前往知乎官网查看完整内容。

- **允许**：个人学习、技术研究、代码交流
- **禁止**：商业使用、大规模数据采集、违反知乎服务条款的行为
- **禁止**：用于任何可能损害知乎平台或用户利益的活动

**使用须知：**

- 遵守知乎的用户协议和服务条款
- 合理使用，避免给知乎服务器造成过大负担
- 尊重原创作者的版权和知识产权
</details>

<details>

<summary>使用须知</summary>

使用本插件即表示您同意以下条款：

1. **遵守法律法规**：遵守中华人民共和国相关法律法规
2. **遵守平台规则**：遵守知乎的用户协议和服务条款
3. **合理使用**：避免给知乎服务器造成过大负担
4. **尊重版权**：尊重原创作者的版权和知识产权
5. **自担风险**：因使用本插件产生的任何法律纠纷，作者不承担任何责任
6. **配合下架**：如知乎官方认为本项目侵权，作者将立即配合下架处理

🐟 **请合理使用，文明摸鱼！尊重知识产权，遵守平台规则！** 🐟

</details>

## 🤝 参与贡献

众人拾柴火焰高，欢迎各位开发者一同参与到本项目中来，共同完善和提升这个插件！

感谢每一位贡献者！🙏

更多说明，请查看 [OPEN_SOURCE.md](./OPEN_SOURCE.md)。

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

## 🤝 贡献者

感谢所有为本项目做出贡献的开发者！

<a href="https://github.com/crispyChicken999/zhihu-fisher-vscode/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=crispyChicken999/zhihu-fisher-vscode" />
</a>

> 贡献者头像由 [contrib.rocks](https://contrib.rocks) 自动生成

## 📄 开源协议

- 本项目采用 [MIT 协议](./LICENSE) 开源，您可以自由使用、修改和分发。

## 💖 欢迎赞赏

- 一分也是爱，您的支持是我更新的最大动力！ 💰
- 如果帮到你麻烦给个好评，感谢~（点一下插件名字旁边的五星即可 🎉，感谢！）
- 看到这里，帮忙给个 Star ⭐️ 支持一下吧！

![赞赏码](https://img2024.cnblogs.com/blog/3085939/202504/3085939-20250425153014632-145153684.jpg)

## 📊 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=crispyChicken999/zhihu-fisher-vscode&type=date&legend=top-left)](https://www.star-history.com/#crispyChicken999/zhihu-fisher-vscode&type=date&legend=top-left)
