# 知乎摸鱼 (Zhihu Fisher)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

知乎摸鱼是一款功能强大的VS Code扩展，专为开发者提供工作期间高效获取专业知识的解决方案。它允许您直接在代码编辑器中浏览知乎的高质量内容，无需切换窗口，提高"学习"效率。

> **提示**: 该扩展完美融入您的开发环境，外观上与开发文档无异，支持深色主题，降低"知识获取"过程中的视觉干扰。

## 🌟 主要特性

- **沉浸式阅读体验**: 将知乎的优质文章和问答无缝集成到VS Code中，无需打开浏览器
- **专注模式**: 纯文本阅读，减少干扰，提升"学习"效率
- **智能缓存**: 自动缓存已读内容，支持离线阅读
- **热门内容推荐**: 实时获取热门话题，无需手动搜索
- **隐私保护**: 低调的UI设计，使您的"研究活动"不会引起周围同事的注意
- **回答批量加载**: 一键加载问题下的多个高质量回答，方便对比学习
- **智能预加载**: 自动预加载下一批回答，无需等待，阅读体验更流畅

## 📋 使用方法

1. 在VS Code侧边栏中找到知乎图标
2. 点击"热榜"查看当前热门话题
3. 在命令面板中使用`知乎摸鱼: 输入链接`命令打开特定文章或问题
4. 使用`知乎摸鱼: 插入Cookie`命令登录您的账号获取完整阅读权限

## 🔑 高级技巧

### 快捷键

* `Alt+Z F`: 快速打开知乎费舍尔
* `Alt+Z H`: 打开热榜
* `Alt+Z C`: 设置Cookie
* `Esc`: 在阅读视图中快速切换回代码（紧急情况下使用）

### 工作模式

* **研究模式**: 内容以代码注释形式显示，远程看起来像在查看文档
* **学习模式**: 内容以Markdown形式显示，专注阅读体验
* **紧急模式**: 一键切换回代码编辑状态，便于应对突发情况

## 📖 架构文档

### 1. 总体架构概览

知乎摸鱼是一个VS Code扩展，设计用于在编辑器内浏览知乎内容。目前的架构采用了多层次的服务设计模式，主要由以下几个核心部分组成：

#### 1.1 核心组件

- **入口模块** (`extension.ts`): 扩展激活点，负责初始化各个服务和注册命令
- **服务层**：
  - **ZhihuService**: 核心服务协调器，整合其他子服务
  - **HotListService**: 负责获取知乎热榜数据
  - **ArticleService**: 管理文章/问答内容的获取和处理
  - **AnswerLoader**: 专门处理问答的加载和解析
  - **CookieManager**: 管理用户Cookie和登录状态
  - **PuppeteerManager**: 处理浏览器自动化操作
  - **ArticleCache**: 缓存已加载的内容
  - **ContentParser**: 解析HTML内容
- **视图层**：
  - **ArticleViewManager**: 管理所有文章视图
  - **ArticleView**: 单个文章的显示和交互
  - **ZhihuTreeDataProvider**: 提供侧边栏树视图数据
- **工具层**：
  - **HtmlRenderer**: 生成各种视图的HTML内容

#### 1.2 数据流转

```
用户操作 -> 命令注册 -> ZhihuService -> 各子服务 -> 数据获取/处理 -> 视图更新
```

### 2. 详细加载流程

#### 2.1 扩展初始化流程

1. **扩展激活** (`extension.ts` 中的 `activate` 函数)：
   - 创建 `ZhihuService` 实例
   - 创建 `ZhihuTreeDataProvider` 并注册树视图
   - 注册各种命令（刷新热榜、打开文章、设置Cookie等）
   - 初始化图标状态和配置监听

2. **热榜初始化**：
   - `ZhihuTreeDataProvider` 构造函数中调用 `loadHotList()`
   - 调用 `ZhihuService.getHotList()` → `HotListService.getHotList()`
   - 获取并解析热榜HTML内容，返回 `ZhihuHotItem[]`

#### 2.2 文章/问答加载流程

##### 2.2.1 打开文章/问答

1. 用户点击侧边栏热榜项或通过命令打开文章链接
2. 触发 `zhihu-fisher.openArticle` 命令
3. `ArticleViewManager.openArticle()` 方法被调用
4. 创建 `ArticleView` 实例
5. `ArticleView` 创建 WebView 面板
6. WebView 发送 `requestContent` 消息
7. 触发 `ArticleView.loadContent()`

##### 2.2.2 内容加载流程

1. **基础文章/单一回答**:
   - `ZhihuService.getArticleContent()` → `ArticleService.getArticleContent()`
   - 使用 Axios 获取页面内容
   - 使用 `ContentParser` 解析HTML并提取所需信息
   - 返回处理后的 `ZhihuArticle` 对象

2. **问题回答批量加载**:
   - 检测到问题URL格式 → 调用 `getBatchAnswers()`
   - 路径: `ArticleService.getBatchAnswers()` 
   - 检查问题ID是否有缓存
     - 有缓存：直接返回缓存数据
     - 无缓存：创建浏览器实例
       - 使用 `PuppeteerManager` 创建页面
       - 导航到问题页面
       - 提取问题标题和总回答数
       - 调用 `AnswerLoader.loadAllAnswers()` 加载回答
       - 存入缓存

3. **回答提取和滚动加载**:
   ```
   AnswerLoader.loadAllAnswers()
   └─ 循环执行直到达到目标数量或无新回答:
      └─ PuppeteerManager.simulateHumanScroll() 模拟滚动
      └─ extractAnswersFromPage() 提取当前页面上的回答
      └─ 过滤重复回答并添加到结果中
      └─ 通过progressCallback通知UI更新状态
   ```

4. **增量加载更多回答**:
   - 用户浏览过程中，当接近已加载的最后回答时，自动触发加载更多
   - 通过 `ArticleService.loadMoreBatchAnswers()` 或 `setCurrentViewingIndex()` 实现
   - 复用已有页面或创建新页面继续加载

#### 2.3 UI 交互流程

1. **WebView消息处理**:
   - `ArticleView` 设置消息处理器监听 WebView 消息
   - 支持导航、在浏览器中打开、切换图片显示、加载下一个/上一个回答等操作
   - 消息触发相应的服务调用和UI更新

2. **进度回调机制**:
   - 使用 `ProgressCallback` 接口实时更新加载状态
   - `onBatchProgress` 回调函数更新UI显示的进度信息

### 3. 当前架构中的问题

根据代码分析，目前存在的主要问题有：

1. **流程复杂度过高**:
   - 多层服务嵌套调用导致流程难以追踪
   - `ArticleService` 与 `AnswerLoader` 职责有重叠

2. **异步处理混乱**:
   - 多个异步操作嵌套，错误处理不够集中
   - 数据流转不清晰，状态更新分散在多个位置

3. **兼容性处理过度**:
   - 代码中有多处针对极端情况的特殊处理
   - 过多的备选方案和兼容性代码增加了复杂度

4. **缓存机制不够透明**:
   - 缓存操作分散在多个服务中，难以统一管理
   - 缓存状态更新逻辑复杂

5. **页面处理逻辑混乱**:
   - Puppeteer 页面实例管理不够清晰
   - 页面复用和关闭逻辑分散在多处

6. **视图更新机制不集中**:
   - UI更新状态分散在多个回调和事件处理中
   - 缺乏统一的状态管理机制

### 4. 重构建议

#### 4.1 简化服务层次结构

```
现状:
ZhihuService -> ArticleService -> AnswerLoader -> ...

建议:
ZhihuService -> ContentService | HotlistService | CacheService
```

#### 4.2 明确数据流向

1. **采用单向数据流模式**:
   - 数据请求 -> 缓存 -> 显示
   - 用户操作 -> 状态更新 -> 视图更新

2. **集中状态管理**:
   - 为问题/回答创建统一的状态管理器
   - 减少跨组件的状态依赖

#### 4.3 简化页面处理逻辑

1. **统一页面管理**:
   - 创建专门的 `PageManager` 服务管理所有页面操作
   - 明确页面生命周期，避免泄露和重复创建

2. **优化批量加载策略**:
   - 使用更智能的增量加载算法
   - 将复杂的滚动和提取逻辑封装为更简洁的API

#### 4.4 优化错误处理

1. **集中式错误处理**:
   - 创建统一的错误处理策略
   - 为不同类型的错误提供明确的恢复路径

2. **改进错误提示**:
   - 为常见问题提供更友好的用户提示
   - 减少技术细节暴露给用户

#### 4.5 改进模块化设计

1. **按功能划分模块**:
   - 内容加载模块
   - 用户认证模块
   - UI渲染模块
   - 缓存管理模块

2. **清晰的接口设计**:
   - 为每个模块定义明确的公共接口
   - 减少模块间的直接依赖

### 5. 重构规划

#### 第一阶段：代码审查和梳理

1. 完整记录当前所有流程和依赖关系
2. 确定核心功能点和必要的兼容性代码
3. 编写详细的测试用例覆盖主要功能点

#### 第二阶段：架构重构

1. 重新设计服务层结构，减少层级和依赖
2. 实现统一的状态管理机制
3. 优化页面管理和加载流程

#### 第三阶段：功能优化

1. 简化HTML解析和渲染逻辑
2. 优化滚动加载算法
3. 改进缓存机制，提高离线可用性

#### 第四阶段：测试和发布

1. 对照测试用例验证功能完整性
2. 性能和内存占用测试
3. 更新文档和发布新版本

### 6. 新架构设计草图

```
extension.ts (入口点)
├─ commands/ (命令注册)
├─ services/
│  ├─ ContentService (内容获取，统一接口)
│  │  ├─ ArticleLoader (文章加载)
│  │  └─ AnswerLoader (回答加载)
│  ├─ HotlistService (热榜服务)
│  ├─ AuthService (认证服务)
│  │  └─ CookieManager (Cookie管理)
│  ├─ CacheService (缓存服务)
│  └─ BrowserService (浏览器自动化)
│     └─ PageManager (页面管理)
├─ views/
│  ├─ ViewManager (视图管理)
│  ├─ ArticleView (文章视图)
│  └─ HotlistView (热榜视图)
├─ utils/
│  ├─ Renderer (HTML渲染)
│  ├─ Parser (内容解析)
│  └─ Logger (日志工具)
└─ models/ (数据模型)
   ├─ Article
   ├─ Answer
   └─ Hotlist
```

## 📝 使用场景

* 等待代码编译时利用碎片时间学习
* 在长会议中保持"高效"
* 跟进技术领域最新动态
* 解决工作中的"技术疑难"

## 📜 免责声明

本扩展仅用于学习研究，请用户遵守知乎用户协议。开发者不对任何由于使用本扩展造成的问题负责。
