import * as vscode from "vscode";

/**
 * 工具提示内容管理
 * 统一管理插件中使用的各种工具提示内容
 */
export class TooltipContents {
  /**
   * 打赏支持的工具提示内容
   */
  static getSponsorTooltip(): vscode.MarkdownString {
    const tooltip = new vscode.MarkdownString(
      "🐟 **知乎摸鱼插件 - 打赏支持** 🐟\n\n" +
        "---\n\n" +
        "💡 这是一个**完全免费**的开源 VSCode 插件\n\n" +
        "🚀 如果这个插件对您有所帮助\n\n" +
        "☕ 可以考虑请开发者喝杯咖啡~\n\n" +
        "✨ **您的支持将用于：**\n\n" +
        "  - 持续维护和更新功能\n\n" +
        "  - 修复bug和优化体验\n\n" +
        "  - 开发更多实用功能\n\n" +
        "🥰 用爱发电不易，期待您的支持~\n\n" +
        "---\n\n" +
        "⚠️ **点击后将打开打赏页面**\n\n" +
        "💼 建议在没人盯着/注意时，或者在休息时间打开哦~\n\n" +
        "🤝 **感谢您的理解和支持！**\n\n" +
        "---\n\n" +
        "🌟 **觉得不错？也欢迎帮我点个星星~**\n\n" +
        "⭐ [**给项目点个星吧！**](https://github.com/crispyChicken999/zhihu-fisher-vscode) ⭐\n\n" +
        "📢 *您的每个 ⭐ 都是对开发者最大的鼓励！*"
    );

    // 设置支持信任的内容和链接
    tooltip.isTrusted = true;
    tooltip.supportHtml = true;
    tooltip.supportThemeIcons = true;

    return tooltip;
  }

  /**
   * 侧边栏伪装提示的工具提示内容
   */
  static getDisguiseTipsTooltip(): vscode.MarkdownString {
    const tooltip = new vscode.MarkdownString(
      "🐟 **知乎摸鱼插件 - 恢复提示** 🐟\n\n" +
        "___\n\n" +
        "💡 当前正处于 **伪装模式** 中\n\n" +
        "👆 点击任意文件（点我也可以）即可恢复侧边栏\n\n" +
        "🔄 快速切换回摸鱼状态\n\n" +
        "___\n\n" +
        "⚡ **快捷操作提示：**\n\n" +
        "  - 点击任意文件 → 恢复知乎侧边栏列表界面\n\n" +
        "  - 打开新文章时 → 自动进入伪装\n\n" +
        "  - 任意知乎详情页失去焦点 → 自动进入伪装\n\n" +
        "🤫 让您的摸鱼更加隐蔽安全~ 🐟"
    );

    // 设置支持信任的内容和主题图标
    tooltip.isTrusted = true;
    tooltip.supportThemeIcons = true;

    return tooltip;
  }

  /**
   * 获取简单的搜索提示工具提示
   */
  static getSearchTipsTooltip(): vscode.MarkdownString {
    const tooltip = new vscode.MarkdownString("点我输入关键词重新搜索");

    tooltip.isTrusted = true;

    return tooltip;
  }

  /**
   * 获取加载中提示的工具提示
   */
  static getLoadingTooltip(content: string): vscode.MarkdownString {
    const tooltip = new vscode.MarkdownString(content);

    tooltip.isTrusted = true;
    tooltip.supportThemeIcons = true;

    return tooltip;
  }

  /**
   * 获取刷新按钮的工具提示
   */
  static getRefreshTooltip(content: string): vscode.MarkdownString {
    const tooltip = new vscode.MarkdownString(content);

    tooltip.isTrusted = true;
    tooltip.supportThemeIcons = true;

    return tooltip;
  }

  /**
   * 浏览器配置错误 - 自定义路径无效
   */
  static getInvalidBrowserPathTooltip(): vscode.MarkdownString {
    const tooltip = new vscode.MarkdownString(
      "🚨 **自定义浏览器路径配置异常** 🚨\n\n" +
      "---\n\n" +
      "❌ 您设置的自定义浏览器路径无效或不可用\n\n" +
      "💡 **解决方案：**\n\n" +
      "  1️⃣ **重新设置路径** → 点击此处重新配置正确的浏览器路径\n\n" +
      "  2️⃣ **清空自定义设置** → 直接按 `ESC` 键清空，使用系统默认浏览器\n\n" +
      "  3️⃣ **重启VSCode** → 配置完成后需要重启才能生效\n\n" +
      "---\n\n" +
      "⚙️ **优先级说明：**\n\n" +
      "自定义路径 > 系统默认安装路径\n\n" +
      "📝 清空自定义设置后，插件会自动查找系统中已安装的浏览器"
    );

    tooltip.isTrusted = true;
    tooltip.supportThemeIcons = true;
    return tooltip;
  }

  /**
   * 浏览器配置错误 - 无法创建浏览器实例
   */
  static getBrowserUnavailableTooltip(): vscode.MarkdownString {
    const tooltip = new vscode.MarkdownString(
      "🔧 **浏览器配置问题** 🔧\n\n" +
      "---\n\n" +
      "❓ **问题原因：**\n\n" +
      "插件依赖 Puppeteer 爬取数据，需要 Chrome 浏览器支持\n\n" +
      "可能的原因：\n\n" +
      "  - 未安装 Chrome 浏览器\n\n" +
      "  - 浏览器版本不兼容\n\n" +
      "  - 浏览器路径配置错误\n\n" +
      "---\n\n" +
      "🛠️ **解决方案：**\n\n" +
      "  1️⃣ **自动安装** → 让插件为您下载适配版本的 Chrome\n\n" +
      "  2️⃣ **手动配置** → 指定您已安装的 Chrome 浏览器路径\n\n" +
      "---\n\n" +
      "⚠️ **配置完成后请重启 VSCode**\n\n" +
      "💡 建议选择自动安装，更加稳定可靠"
    );

    tooltip.isTrusted = true;
    tooltip.supportThemeIcons = true;
    return tooltip;
  }

  /**
   * Cookie 未设置提示
   */
  static getCookieRequiredTooltip(): vscode.MarkdownString {
    const tooltip = new vscode.MarkdownString(
      "🍪 **需要设置知乎 Cookie** 🍪\n\n" +
      "---\n\n" +
      "🔐 **为什么需要 Cookie？**\n\n" +
      "知乎需要登录才能访问内容，Cookie 用于身份验证\n\n" +
      "---\n\n" +
      "📋 **获取步骤：**\n\n" +
      "  1️⃣ 打开浏览器，访问 [知乎首页](https://www.zhihu.com)\n\n" +
      "  2️⃣ 登录您的知乎账号\n\n" +
      "  3️⃣ 按 `F12` 打开开发者工具\n\n" +
      "  4️⃣ 切换到 `Network` （网络）选项卡\n\n" +
      "  5️⃣ 刷新页面，点击任意一个请求\n\n" +
      "  6️⃣ 在 `Request Headers` 中找到 `Cookie` 字段\n\n" +
      "  7️⃣ 复制完整的 Cookie 值到 VSCode 输入框\n\n" +
      "---\n\n" +
      "🎯 **图文教程**\n\n" +
      "在扩展商店搜索 `zhihu fisher`，查看扩展详情页的设置说明\n\n" +
      "⚠️ **设置完成后请重启 VSCode**"
    );

    tooltip.isTrusted = true;
    tooltip.supportHtml = true;
    tooltip.supportThemeIcons = true;
    return tooltip;
  }

  /**
   * 热榜加载中提示
   */
  static getHotLoadingTooltip(): vscode.MarkdownString {
    const tooltip = new vscode.MarkdownString(
      "⚡ **正在加载知乎热榜** ⚡\n\n" +
      "---\n\n" +
      "🚀 **加载特点：**\n\n" +
      "  - 热榜加载速度最快，通常 5 秒内完成\n\n" +
      "  - 无需模拟滚动，一次性获取完整列表\n\n" +
      "  - 实时同步知乎官方热榜数据\n\n" +
      "---\n\n" +
      "💭 请耐心等待片刻... 🐟"
    );

    tooltip.isTrusted = true;
    tooltip.supportThemeIcons = true;
    return tooltip;
  }

  /**
   * 推荐内容加载中提示
   */
  static getRecommendLoadingTooltip(): vscode.MarkdownString {
    const tooltip = new vscode.MarkdownString(
      "🎯 **正在加载个性化推荐** 🎯\n\n" +
      "---\n\n" +
      "🤖 **智能爬取过程：**\n\n" +
      "  - 模拟真实用户访问知乎首页\n\n" +
      "  - 自动滚动加载更多推荐内容\n\n" +
      "  - 智能解析问题回答和专栏文章\n\n" +
      "---\n\n" +
      "⏱️ **预计用时：** 10-30 秒\n\n" +
      "🔄 如加载时间过长，可能是网络问题或 Cookie 过期\n\n" +
      "💡 **小贴士：** 加载期间暂时无法打开文章，避免冲突\n\n" +
      "---\n\n" +
      "🐟 请耐心等待智能推荐为您精选内容..."
    );

    tooltip.isTrusted = true;
    tooltip.supportThemeIcons = true;
    return tooltip;
  }

  /**
   * 搜索加载中提示
   */
  static getSearchLoadingTooltip(query: string): vscode.MarkdownString {
    const tooltip = new vscode.MarkdownString(
      `🔍 **正在搜索："${query}"** 🔍\n\n` +
      "---\n\n" +
      "🕷️ **智能搜索过程：**\n\n" +
      "  - 访问知乎搜索页面\n\n" +
      "  - 模拟用户滚动浏览\n\n" +
      "  - 解析问题回答和专栏文章\n\n" +
      "  - 去重筛选优质内容\n\n" +
      "---\n\n" +
      "⏱️ **预计用时：** 15-40 秒\n\n" +
      "🎯 搜索结果将包含相关的问题讨论和专栏文章\n\n" +
      "---\n\n" +
      "💭 请耐心等待搜索结果... 🐟"
    );

    tooltip.isTrusted = true;
    tooltip.supportThemeIcons = true;
    return tooltip;
  }

  /**
   * 刷新推荐列表提示
   */
  static getRefreshRecommendTooltip(): vscode.MarkdownString {
    const tooltip = new vscode.MarkdownString(
      "🔄 **刷新个性化推荐** 🔄\n\n" +
      "---\n\n" +
      "✨ 点击获取最新的个性化推荐内容\n\n" +
      "🎯 基于您的兴趣和浏览习惯智能推荐\n\n" +
      "📱 与知乎 App 推荐算法同步\n\n" +
      "（其实就是知乎首页的内容搬过来而已哈哈😄）"
    );

    tooltip.isTrusted = true;
    tooltip.supportThemeIcons = true;
    return tooltip;
  }

  /**
   * 重新搜索提示
   */
  static getSearchAgainTooltip(): vscode.MarkdownString {
    const tooltip = new vscode.MarkdownString(
      "🔍 **重新搜索内容** 🔍\n\n" +
      "---\n\n" +
      "💡 点击输入新的关键词进行搜索\n\n" +
      "🎯 支持搜索问题、文章、话题等各类内容\n\n" +
      "⚡ 实时获取最新搜索结果"
    );

    tooltip.isTrusted = true;
    tooltip.supportThemeIcons = true;
    return tooltip;
  }

  /**
   * 开始搜索提示
   */
  static getStartSearchTooltip(): vscode.MarkdownString {
    const tooltip = new vscode.MarkdownString(
      "🔍 **开始搜索知乎内容** 🔍\n\n" +
      "---\n\n" +
      "🎉 点击开始您的知乎探索之旅！\n\n" +
      "💫 发现感兴趣的问题和优质文章\n\n" +
      "🚀 智能搜索，精准匹配"
    );

    tooltip.isTrusted = true;
    tooltip.supportThemeIcons = true;
    return tooltip;
  }

  /**
   * 加载失败重试提示
   */
  static getRetryTooltip(type: 'hot' | 'recommend' | 'follow'): vscode.MarkdownString {
    const typeNameMap: Record<'hot' | 'recommend' | 'follow', string> = {
      'hot': '热榜',
      'recommend': '推荐',
      'follow': '关注'
    };
    const typeName = typeNameMap[type];
    const tooltip = new vscode.MarkdownString(
      `🔄 **${typeName}加载失败，点击重试** 🔄\n\n` +
      "---\n\n" +
      "❓ **可能的原因：**\n\n" +
      "  - 网络连接不稳定\n\n" +
      "  - 知乎服务暂时不可用\n\n" +
      "  - Cookie 可能已过期\n\n" +
      "---\n\n" +
      "💡 **建议操作：**\n\n" +
      "  1️⃣ 检查网络连接\n\n" +
      "  2️⃣ 点击重试加载\n\n" +
      "  3️⃣ 如仍失败，请检查 Cookie 是否有效\n\n" +
      "---\n\n" +
      "🎯 点击此处重新加载"
    );

    tooltip.isTrusted = true;
    tooltip.supportThemeIcons = true;
    return tooltip;
  }

  /**
   * 关注内容加载中提示
   */
  static getFollowLoadingTooltip(): vscode.MarkdownString {
    const tooltip = new vscode.MarkdownString(
      "👥 **正在加载关注动态** 👥\n\n" +
      "---\n\n" +
      "🤖 **智能爬取过程：**\n\n" +
      "  - 模拟真实用户访问知乎关注页面\n\n" +
      "  - 自动滚动加载更多关注动态\n\n" +
      "  - 解析关注用户的最新回答和文章\n\n" +
      "  - 筛选你关注的人的动态内容\n\n" +
      "  - 内容包括关注的人赞过的回答、关注了问题/文章、回答了问题等\n\n" +
      "---\n\n" +
      "⏱️ **预计用时：** 10-30 秒\n\n" +
      "🔄 如加载时间过长，可能是网络问题或 Cookie 过期\n\n" +
      "💡 **小贴士：** 加载期间暂时无法打开文章，避免冲突\n\n" +
      "---\n\n" +
      "🐟 请耐心等待，为您获取关注的最新动态..."
    );

    tooltip.isTrusted = true;
    tooltip.supportThemeIcons = true;
    return tooltip;
  }

  /**
   * 刷新关注列表提示
   */
  static getRefreshFollowTooltip(): vscode.MarkdownString {
    const tooltip = new vscode.MarkdownString(
      "🔄 **刷新关注动态** 🔄\n\n" +
      "---\n\n" +
      "✨ 点击获取关注用户的最新动态\n\n" +
      "👥 查看你关注的人最新发布的回答和文章\n\n" +
      "📱 与知乎 App 关注页面同步\n\n" +
      "🎯 第一时间了解感兴趣的内容创作者的更新"
    );

    tooltip.isTrusted = true;
    tooltip.supportThemeIcons = true;
    return tooltip;
  }
}
