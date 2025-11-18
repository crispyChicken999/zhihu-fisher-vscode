<p align="center">
  <img src="https://img2024.cnblogs.com/blog/3085939/202504/3085939-20250428102917058-270629388.png" alt="zhihu-fisher"  width="200" height="200" />
</p>

# 🐟 知乎摸鱼 🐟 (Zhihu Fisher)

![License](https://img.shields.io/badge/License-MIT-orange.svg)
![VSCode](https://img.shields.io/badge/VSCode-1.82.0%2B-blue.svg)
![Version](https://img.shields.io/badge/Version-0.5.3-green.svg)
![Supported](https://img.shields.io/badge/Supported-Windows_MacOS_Linux-purple.svg)

使用 VSCode，浏览知乎推荐及热榜内容，快乐摸鱼。提供沉浸模式、图片/视频展示方式、灰色模式、智能伪装模式，避免摸鱼被发现！支持评论区、搜索、收藏夹等功能。

## 🔮 背景 🔮

- 假装敲代码，实则在 VSCode 中刷知乎！
- 其实就是想上班摸会鱼，直接网页刷知乎容易被抓包，而且网页有很多图片，老板同事一看就知道你小子在摸鱼。（工资-1😅）
- 结果发现市场中的那些插件，基本上都是几年前的产物了，不更新了或者用不了 😥，索性就直接写了一个。
- 写这个的初衷就是自己用，顺便开源出来给大家用用，毕竟 VSCode 现在这么火，能在里面愉快地摸鱼也是不错的选择 😁
- 如果有更多的意见和建议，欢迎提交[Issues](https://github.com/crispyChicken999/zhihu-fisher-vscode/issues)。我会尽快修复和更新~ 欢迎许愿 🤓☝
- 若本插件对您有所帮助，麻烦给个好评，感谢~（点一下插件名字旁边的五星即可 🎉，感谢！）
- 欢迎推荐给你的同事，让他们也能在 VSCode 中愉快摸鱼！🤣 独摸摸不如众摸摸~

## 🚀 主要功能 🚀

1. 支持 加载知乎热榜
2. 支持 加载知乎推荐
3. 支持 加载知乎关注
4. 支持 加载搜索结果
5. 支持 加载特定知乎链接的内容
6. 支持 支持对回答、文章进行赞同/不赞同的操作
7. 支持 完整的收藏夹功能，查看和管理自己创建和关注的收藏夹
8. 支持 阅读区样式调整，详情页可以调整字体大小、颜色、排版等样式，更加隐蔽地摸鱼
9. 支持 切换多媒体（图片、视频等）模式（隐藏|迷你|正常）的功能，偷摸摸 or 光明正大地看图片 😏
10. 支持 快捷键操作，键盘 `← → / A|D` 切换上/下一个回答，按 `/` 调整图片显示，按 `Crtl+↑↓ / W|S` 切换上/下篇内容
11. 支持 自定义快捷键，可以根据自己的习惯设置快捷键
12. 支持 评论区（，），可以查看文章/回答的评论内容，同时支持查看评论的子评论
13. 支持 沉浸模式（X）【推荐使用 👍】，隐藏其他不重要的信息，只显示问题标题和回答内容
14. 支持 收藏文章（F）、问答到指定收藏夹，支持缓存收藏夹信息，避免每次都要重新加载
15. 支持 灰色模式（G），将页面所有内容转为灰色显示，进一步地摸鱼，降低被老板发现的风险 😂
16. 支持 智能伪装模式，切到其他页面后自动将文章页面的标题和图标伪装为代码文件，界面伪装成代码编辑界面，避免摸鱼被发现，切回后自动恢复
17. 支持 侧边栏伪装模式，侧边栏会伪装成文件列表，进一步增强伪装效果
18. 支持 智能伪装模式自定义，用户可以自定义伪装的标题和图标，满足不同用户的需求，例如前端开发可以伪装为 HTML/JS/CSS 文件，后端开发可以伪装为 Python/Java/Go 文件等

更多功能，敬请探索~

<img src="https://img2024.cnblogs.com/blog/3085939/202507/3085939-20250711153038514-925146507.png" alt="智能伪装模式示例" width="400">

## 🎯 支持的 VSCode 版本 🎯

- **1.82.0** 及以上版本

## 🎉 使用方式 🎉

### 1. 安装插件

- 安装后在 VSCode 侧边栏中找到 📖 图标

### 2. 配置浏览器

- 按照指示配置插件使用的 Chrome 浏览器，配置完成后重启 VSCode 以应用规则。
- 因为用到这个 Puppeteer 这个库，其原理就是在后台打开知乎，模拟人在浏览，然后把内容搬运到 VSCode 中进行展示。
- 如果没配置浏览器的话，就没法在后台加载页面了。

#### 2.1 配置方式

插件提供两种配置方式：`使用本地浏览器（推荐）` 和 `安装浏览器` 。

<details>
<summary>使用本地浏览器</summary>

你可以选择安装，也可以使用本地已经安装的谷歌浏览器，侧边栏有入口可以设置，或者`Ctrl/Commend`+`,`打开设置，搜索框输入`zhihu`，找到`Custom Chrome Path`，输入本地浏览器的路径即可。

> 你自己指定的谷歌浏览器版本不要太低，建议 120 以上。不然有可能加载不出来！

本地浏览器地址类似：（谷歌浏览器的安装路径，其实默认就是下面的路径，但是实际安装不一定是默认的路径，就需要你指定一下）

<details>
<summary>💻 各系统默认浏览器路径</summary>

- **Windows 用户**：`C:\Program Files\Google\Chrome\Application\chrome.exe`，需要以`chrome.exe`结尾
- **Mac 用户**：`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
- **Linux 用户**：`/usr/bin/google-chrome` 或 `/snap/bin/chromium` （第一个路径是推荐的）

</details>

<details>
<summary>Windows 获取本地 Chrome 浏览器路径的方法</summary>

1. 在桌面上找到 Chrome 浏览器的快捷方式，右键点击，选择"属性"
2. 在"快捷方式"选项卡中，找到"目标"字段，复制该路径
3. 将路径中的`"C:\Program Files\Google\Chrome\Application\chrome.exe"`去掉引号，保留路径部分即可

- 如果还是不清楚，可以参照下图：
  ![获取本地浏览器路径的方式](https://img2024.cnblogs.com/blog/3085939/202504/3085939-20250425154308398-1262720236.png)

</details>

<details>
<summary>Mac 获取本地 Chrome 浏览器路径的方法</summary>

1. 打开终端（Terminal），输入以下命令：`ls /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome`
2. 如果显示了路径，则说明 Chrome 浏览器已安装在该位置
3. 如果没有安装，可以在终端中输入以下命令进行安装：`brew install --cask google-chrome`
4. 安装完成后，重新运行第一步的命令即可（如果找不到请百度，因为手头没有 Mac 电脑，无法测试）

</details>

<details>
<summary>Linux 获取本地 Chrome 浏览器路径的方法</summary>

1. 打开终端，输入以下命令：`which google-chrome` 或 `which chromium-browser`
2. 如果显示了路径，则说明 Chrome 浏览器已安装在该位置
3. 如果没有安装，可以在终端中输入以下命令进行安装：`sudo apt install google-chrome-stable` 或 `sudo apt install chromium-browser`
4. 安装完成后，重新运行第一步的命令即可
5. 如果还是不清楚，可以百度一下，因为手头没有 Linux 电脑，无法测试 🤔

</details>
</details>

<details>
<summary>安装浏览器</summary>

如果你选择了安装，那么这个浏览器安装完成后会在：

<details>
<summary>📦 Puppeteer 安装的浏览器路径</summary>

- **Windows 用户**：`C:\Users\[用户名]\.cache\puppeteer\chrome\win64-135.0.7049.84\chrome-win64\chrome.exe`
- **Mac 用户**：`/Users/[用户名]/Library/Caches/puppeteer/chrome/mac-x64-135.0.7049.84/chrome-mac-x64/Google Chrome.app/Contents/MacOS/Google Chrome`
- **Linux 用户**：`/home/[用户名]/.cache/puppeteer/chrome/linux-x64-135.0.7049.84/chrome-linux-x64/chrome`

</details>
</details>

### 3. 配置 Cookie

输入知乎的 Cookie，然后就会自动加载推荐及热榜内容

<details>
<summary>Cookie 获取方式</summary>

在知乎网页端登录后，按 F12 打开开发者工具，切换到"网络"选项卡，选择一个请求，找到请求头中的`Cookie`字段，复制其值，粘贴到 VSCode 中输入框即可

</details>

<details>
<summary>Cookie 获取示例图</summary>

![获取Cookie的方式](https://img2024.cnblogs.com/blog/3085939/202504/3085939-20250424143443844-967882670.webp)

</details>

<details>
<summary>Cookie 说明</summary>

**简单说就是：Cookie 就存在你电脑里，插件不会偷偷上传，要来也没用 😂**

你的 Cookie 存在 VSCode 的配置文件里面。插件只是用它来帮你刷刷知乎，看看推荐和热榜内容而已。

代码完全开源，不会上传/分析你的数据，不信的话可以你可以翻翻源码 😁

</details>

### 4. 开始使用

加载完成后点击内容即可查看，就可以愉快 🐟 摸鱼 🐟 啦~

## 💥 更新日志 💥

- 查看[完整更新日志](./CHANGELOG.md)，了解所有版本的详细更改。

## 📝 TODO 📝

<details>
<summary>目前已完成的功能</summary>

- ~~重构代码，简化流程~~ **(v0.0.6 已重构)**
- ~~增加更多功能，比如搜索、收藏等~~ **(v0.0.8 已实现搜索功能，v0.2.2 已实现收藏功能)**
- ~~详情页面添加回答跳转功能~~ **(v0.0.7 已实现分页跳转)**
- ~~支持快捷键切换图片隐藏和显示~~ **(v0.1.0 已实现)**
- ~~支持用户指定自己的 Chrome.exe 浏览器地址，就不用下载新的了~~ **(v0.1.1 已实现)**
- ~~支持小图模式，比如想要摸鱼，但是也想偷偷看图片~~ **(v0.1.3 已实现)**
- ~~支持设置文章的各种样式，比如字体大小、颜色等~~ **(v0.1.3 已实现)**
- ~~支持加载回答的评论等。~~ **(v0.1.4 已实现)**

</details>

🤗 更多功能，欢迎许愿 🎉~

## 🐞 已知问题 🐞

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
    - 我是想着不管你机制怎么变，我都是模拟人在访问，那么就算慢点也无妨，毕竟也能够加载出来 😂
4.  **评论可能出现重复**
    - 因为新版接口有防爬机制，所以用的是无限制的旧版接口，那么有时候可能会看到重复的评论，这个我也没招，毕竟是接口返回回来的。哎凑合着看吧哈哈...

</details>

---

> 更多问题，欢迎在 [Issues](https://github.com/crispyChicken999/zhihu-fisher-vscode/issues) 中进行反馈，我看到后会尽快修复。

## 🤓☝ 实现原理 🤓☝

- 基于 VSCode 插件脚手架，使用 Puppeteer 在后台来模拟浏览知乎，抓取内容并渲染成 HTML，最后在 VSCode 中显示。
- 技术栈：TypeScript、Puppeteer、Cherrio、HTML、CSS

## 📬 反馈问题 📬

- 在[GitHub Issues](https://github.com/crispyChicken999/zhihu-fisher-vscode/issues)中提交问题，我看到会尽快回复和修复。

## 🌟 开源项目 & 免责声明 🌟

<details>
<summary>代码开源说明</summary>

本项目现已完全开源！欢迎各位有志之士一同参与开发和完善：

- **欢迎贡献代码** - 提交 Pull Request
- **报告问题** - 在 [Issues](https://github.com/crispyChicken999/zhihu-fisher-vscode/issues) 中反馈 Bug
- **功能建议** - 提出新功能想法和改进建议
- **完善文档** - 帮助改进文档和使用说明
- **Star 支持** - 给项目点个 Star，让更多人发现
</details>

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

🐟 **请合理使用，文明摸鱼！** 🐟

## 🤝 参与贡献 🤝

- 我们欢迎所有形式的贡献！无论您是新手还是专家，都可以为项目做出贡献：

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

- 感谢每一位贡献者！🙏
- 更多说明，请查看 [OPEN_SOURCE.md](./OPEN_SOURCE.md)。

## 📄 开源协议 📄

- 本项目采用 [MIT 协议](./LICENSE) 开源，您可以自由使用、修改和分发。

## 💖 欢迎赞赏 💖

- 一分也是爱，您的支持是我更新的最大动力！ 💰
- 如果帮到你麻烦给个好评，感谢~（点一下插件名字旁边的五星即可 🎉，感谢！）
- 看到这里，帮忙给个 Star ⭐️ 支持一下吧！

![赞赏码](https://img2024.cnblogs.com/blog/3085939/202504/3085939-20250425153014632-145153684.jpg)

## ⭐️ Star History ⭐️

[![Star History Chart](https://api.star-history.com/svg?repos=crispyChicken999/zhihu-fisher-vscode&type=date&legend=top-left)](https://www.star-history.com/#crispyChicken999/zhihu-fisher-vscode&type=date&legend=top-left)
