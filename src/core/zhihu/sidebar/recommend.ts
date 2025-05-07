import * as vscode from "vscode";
import * as Puppeteer from "puppeteer";
import { Store } from "../../stores";
import { CookieManager } from "../cookie";
import { PuppeteerManager } from "../puppeteer";
import { StatusTreeItem, TreeItem, LinkItem } from "../../types";

/**
 * 侧边栏的知乎推荐-树数据提供者
 * 提供知乎推荐的数据，用于在侧边栏的树视图中显示
 */
export class sidebarRecommendListDataProvider
  implements vscode.TreeDataProvider<TreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    TreeItem | undefined | null | void
  > = new vscode.EventEmitter<TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    TreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private loadingStatusItem: vscode.StatusBarItem;
  private canCreateBrowser: boolean = false; // 是否可以创建浏览器实例

  constructor() {
    this.loadingStatusItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this.loadingStatusItem.text = "$(sync~spin) 加载知乎推荐中...";

    // 初始加载
    this.getSideBarRecommendList();
  }

  // 刷新树视图
  refresh(): void {
    console.log("触发知乎推荐刷新...");
    this.getSideBarRecommendList();
  }

  // 加载推荐列表
  private async getSideBarRecommendList(): Promise<void> {
    // 看看能不能创建浏览器实例，不能则认为加载不出推荐列表
    this.canCreateBrowser = await PuppeteerManager.canCreateBrowser();
    if (!this.canCreateBrowser) {
      console.log("无法创建浏览器实例，推荐加载失败");
      Store.Zhihu.recommend.isLoading = false; // 重置加载状态
      Store.Zhihu.recommend.list = []; // 清空推荐列表
      vscode.window.showErrorMessage(
        "无法创建浏览器实例，推荐加载失败，请检查浏览器配置情况。"
      );
      this._onDidChangeTreeData.fire(); // 触发更新UI，显示加载状态
      return;
    }

    // 避免重复加载
    if (Store.Zhihu.recommend.isLoading) {
      console.log("正在加载中推荐，请稍候...");
      vscode.window.showInformationMessage("正在加载中推荐，请稍候...");
      return;
    }

    try {
      this.loadingStatusItem.show();

      console.log("开始加载知乎推荐数据");
      this._onDidChangeTreeData.fire(); // 触发更新UI，显示加载状态

      await this.getRecommendList();
      const list = Store.Zhihu.recommend.list;
      console.log(`加载完成，获取到${list.length}个推荐项目`);

      this.loadingStatusItem.hide();
      this._onDidChangeTreeData.fire(); // 再次触发更新UI，显示加载结果

      if (list.length > 0) {
        vscode.window.showInformationMessage(
          `已更新知乎推荐，共${list.length}个推荐话题`
        );
      }
    } catch (error) {
      Store.Zhihu.recommend.isLoading = false;
      this.loadingStatusItem.hide();
      this._onDidChangeTreeData.fire(); // 触发更新UI，显示错误状态

      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("加载知乎推荐失败:", errorMsg);
    }
  }

  // 通过爬虫获取推荐列表
  async getRecommendList() {
    console.log("开始获取知乎首页推荐...");

    Store.Zhihu.recommend.isLoading = true; // 设置加载状态

    const isCookieSet = CookieManager.isCookieSet();
    if (!isCookieSet) {
      CookieManager.promptForNewCookie("需要知乎Cookie才能获取推荐，请设置");
      throw new Error("需要设置知乎Cookie才能访问");
    }

    // 创建并获取浏览器页面
    const page = await PuppeteerManager.createPage();

    console.log("导航到知乎首页...");
    await page.goto("https://www.zhihu.com/", {
      waitUntil: "networkidle0", // "domcontentloaded"
      timeout: 30000, // 30秒超时
    });

    PuppeteerManager.setPageInstance("recommend", page); // 设置页面实例

    try {
      console.log("页面加载完成，开始读取页面...");
      await PuppeteerManager.simulateHumanScroll(page);
      await PuppeteerManager.delay(500);

      const isCookieExpired = await CookieManager.checkIfPageHasLoginElement(
        page
      );
      if (isCookieExpired) {
        console.log("检测到登录墙或验证码");
        console.log("Cookie过期，请重新登录！");
        if (isCookieSet) {
          // 如果已经有cookie但仍然被拦截，可能是cookie过期
          console.log("Cookie可能已失效，需要更新");
          CookieManager.promptForNewCookie("您的知乎Cookie可能已过期，请更新");
          throw new Error("知乎Cookie已失效，请更新");
        } else {
          // 如果没有cookie且被拦截
          console.log("需要设置Cookie才能访问");
          CookieManager.promptForNewCookie(
            "需要知乎Cookie才能获取推荐内容，请设置"
          );
          throw new Error("需要设置知乎Cookie才能访问");
        }
      }

      console.log("开始提取推荐内容...");

      // 尝试滚动页面加载更多内容
      await this.scrollToLoadMore(page);

      const recommendList = await this.parseRecommendList(page);
      console.log(`成功解析出${recommendList.length}个推荐项目`);
      console.log("推荐列表解析完成，更新Store...");
      Store.Zhihu.recommend.list = recommendList; // 更新推荐列表
    } catch (error) {
      console.error("获取推荐列表失败:", error);
      // 处理错误
      if (error instanceof Puppeteer.TimeoutError) {
        console.error("页面加载超时，可能是网络问题或知乎反爬虫机制");
      } else {
        console.error("发生错误:", (error as Error).message);
      }
    } finally {
      console.log("关闭知乎首页...");
      await page.close(); // 关闭页面
      // 重置加载状态
      Store.Zhihu.recommend.isLoading = false;
    }
  }

  // 解析推荐列表
  private async parseRecommendList(page: Puppeteer.Page): Promise<LinkItem[]> {
    const recommendList = await page.evaluate(() => {
      const items: LinkItem[] = [];

      const feedItems = Array.from(
        document.querySelectorAll(".TopstoryItem-isRecommend .Feed")
      );

      if (feedItems.length > 0) {
        console.log(`找到${feedItems.length}个Feed项`);

        feedItems.forEach((item, index) => {
          // title <meta itemprop="name" content="长辈的什么行为让你感到窒息？">
          const titleElement = item.querySelector('meta[itemprop="name"]');
          const title = titleElement
            ? (titleElement as HTMLMetaElement).content
            : "未知标题";

          //<meta itemprop="url" content="https://www.zhihu.com/question/608280827">
          const urlElement = item.querySelector('meta[itemprop="url"]');
          const url = urlElement
            ? (urlElement as HTMLMetaElement).content
            : "未知链接";

          const id =
            `recommend-${url.split("/").pop() as string}` ||
            `recommend-${index}`; // 获取问题的ID

          const excerptElement = item.querySelector(".RichContent .RichText");
          const excerpt = excerptElement
            ? `【${title}】\n\n${
                (excerptElement as HTMLMetaElement).textContent
                  ? (excerptElement as HTMLMetaElement).textContent
                  : "没找到问题摘要(っ °Д °;)っ"
              }`
            : "没找到问题摘要(っ °Д °;)っ";

          // 原因是首页推荐，展示的是回答，那么热门的话题可能会出现多次，导致提取重复
          if (items.some((item) => item.id === id)) {
            console.log(`推荐项 #${index + 1} 已存在，跳过...`);
            return;
          }

          items.push({
            id,
            url,
            title,
            excerpt,
          });
          console.log(`成功解析推荐项 #${index + 1}: ${title}`);
        });
      }

      return items;
    });

    return recommendList;
  }

  // 滚动页面加载更多内容
  private async scrollToLoadMore(page: Puppeteer.Page) {
    let scrollAttempts = 3; // 滚动尝试次数
    for (let i = 0; i < scrollAttempts; i++) {
      console.log(`执行页面滚动 #${i + 1}/${scrollAttempts}`);
      const scrollHeight = await page.evaluate(() => {
        return document.body.scrollHeight;
      });

      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      await PuppeteerManager.delay(500); // 等待加载

      const newScrollHeight = await page.evaluate(() => {
        return document.body.scrollHeight;
      });

      if (newScrollHeight > scrollHeight) {
        console.log(
          `滚动高度: ${scrollHeight}px -> ${newScrollHeight}px，认为有更多内容`
        );
        console.log("成功加载更多内容");
      } else {
        console.log("没有更多内容可加载");
      }
    }
  }

  // 清空推荐列表
  clearList(): void {
    console.log("清空推荐列表...");
    Store.Zhihu.recommend.list = [];
    Store.Zhihu.recommend.isLoading = false;
  }

  // 获取树项
  getTreeItem(element: TreeItem): vscode.TreeItem {
    return element;
  }

  // 获取子项
  async getChildren(element?: TreeItem): Promise<TreeItem[]> {
    if (element) {
      return []; // 推荐项没有子项
    }

    const isUserSetCustomPath = PuppeteerManager.isUserSetCustomPath();
    const isUserChromePathValid = PuppeteerManager.isUserChromePathValid();
    if (isUserSetCustomPath && !isUserChromePathValid) {
      // 如果用户设置了自定义路径，并且路径无效，显示提示
      return [
        new StatusTreeItem(
          "自定义浏览器路径无效，请重新设置",
          new vscode.ThemeIcon("error"),
          {
            command: "zhihu-fisher.setCustomChromePath",
            title: "设置自定义浏览器路径",
          },
          "您设置的自定义浏览器路径无效，请重新设置。\n " +
            "【解决方法】\n" +
            "  点我重新设置~ 如果不想用自定义路径，点我然后直接按ESC即可清空设置。\n " +
            "  清空设置后，插件会尝试使用默认位置的浏览器，如果没安装，会提示你安装。\n" +
            "【注意】\n" +
            "  设置完成后，请重启VSCode。避免出现bug。\n" +
            "  优先级是：自定义路径 > 默认安装路径 \n"
        ),
      ];
    }

    if (!this.canCreateBrowser) {
      // 如果不能创建浏览器，显示提示
      return [
        new StatusTreeItem(
          "爬虫无法创建浏览器，点我去配置浏览器",
          new vscode.ThemeIcon("error"),
          {
            command: "zhihu-fisher.configureBrowser",
            title: "配置浏览器",
          },
          "点我配置爬虫浏览器\n " +
            "【原因】\n" +
            "  插件依赖Puppeteer去爬取页面数据，如果没有安装浏览器，或者配置的浏览器不是谷歌原版Chrome浏览器，\n" +
            "  就会导致爬虫无法在后台创建浏览器实例，进而无法爬取数据。\n " +
            "【解决方法】\n" +
            "  点我去配置浏览器，提供两种方式：\n" +
            "  在弹出的窗口中你可以选择安装默认的浏览器，或者选择自定义路径。\n" +
            "【注意】\n" +
            "  设置完成后，请重启VSCode。避免出现bug。\n"
        ),
      ];
    }

    const isCookieSet = CookieManager.isCookieSet();
    if (!isCookieSet) {
      // 如果没有设置cookie，显示需要设置cookie的提示
      return [
        new StatusTreeItem(
          "需要设置知乎Cookie才能获取推荐",
          new vscode.ThemeIcon("key"),
          {
            command: "zhihu-fisher.setCookie",
            title: "设置知乎Cookie",
          },
          "点我设置Cookie\n" +
            "【获取方式】\n" +
            "  去到知乎首页，登陆自己的账号，然后点击F12打开开发者工具\n" +
            "  选择 Network 选项卡，刷新页面，点击一个请求，找到请求头Request Headers，\n" +
            "  里面 Cookie 字段，复制值的所有内容，粘贴到 VSCode 的输入框里面。\n" +
            "【注意】\n" +
            "  设置完成后，请重启VSCode。避免出现bug。\n" +
            "【tips】\n" +
            "  主包主包，我还是看不懂咋办啊TAT？\n" +
            "  打开扩展，搜zhihu fisher，点开来，里面有设置 Cookie 的说明图。"
        ),
      ];
    }

    // 如果正在加载，显示一个加载项
    if (Store.Zhihu.recommend.isLoading) {
      return [
        new StatusTreeItem(
          "正在加载知乎推荐...",
          new vscode.ThemeIcon("loading~spin"),
          null,
          "爬虫正在后台访问知乎首页(～￣▽￣)～\n" +
            "模拟滚动加载更多中，请耐心等待加载完成...\n" +
            "╰(￣ω￣ｏ)暂时不允许打开文章，避免列表加载卡住和出现bug。\n" +
            "【注意】\n" +
            "如果长时间没有响应，请确保浏览器正确配置，或者点击标题栏中的刷新按钮。\n" +
            "如果还不行那么可能是Cookie失效了，去知乎首页看看需不需要登录。\n" +
            "如果需要登录，说明Cookie失效了，请重新设置Cookie。\n"
        ),
      ];
    }
    const list = Store.Zhihu.recommend.list;

    // 如果有缓存的推荐项目，直接返回
    if (list.length > 0) {
      return list.map(
        (item) => new TreeItem(item, vscode.TreeItemCollapsibleState.None)
      );
    }

    return [
      new StatusTreeItem(
        "获取推荐失败，点击刷新按钮重试",
        new vscode.ThemeIcon("error"),
        {
          command: "zhihu-fisher.refreshRecommendList",
          title: "刷新知乎推荐",
        },
        "点我刷新推荐"
      ),
    ];
  }
}
