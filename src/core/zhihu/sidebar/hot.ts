import * as vscode from "vscode";
import * as cheerio from "cheerio";
import * as Puppeteer from "puppeteer";
import { Store } from "../../stores";
import { CookieManager } from "../cookie";
import { PuppeteerManager } from "../puppeteer";
import { StatusTreeItem, TreeItem, LinkItem } from "../../types";
import { TooltipContents } from "../../utils/tooltip-contents";

/**
 * 侧边栏的知乎热榜-树数据提供者
 * 提供知乎热榜的数据，用于在侧边栏的树视图中显示
 */
export class sidebarHotListDataProvider
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
  private treeView?: vscode.TreeView<TreeItem>; // TreeView 引用，用于更新标题

  constructor() {
    this.loadingStatusItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this.loadingStatusItem.text = "$(sync~spin) 加载知乎热榜中...";

    // 初始加载
    this.getSideBarHotList();
  }

  // 设置 TreeView 引用
  setTreeView(treeView: vscode.TreeView<TreeItem>): void {
    this.treeView = treeView;
  }

  // 更新侧边栏标题
  private updateTitle(): void {
    if (this.treeView) {
      const isLoading = Store.Zhihu.hot.isLoading;
      const list = Store.Zhihu.hot.list;

      if (isLoading) {
        this.treeView.title = "热榜(加载中...)";
      } else if (list.length > 0) {
        this.treeView.title = `热榜(${list.length}条)`;
      } else {
        this.treeView.title = "热榜";
      }
    }
  }

  // 刷新树视图
  refresh(): void {
    console.log("触发知乎热榜刷新...");
    this.getSideBarHotList();
  }

  // 重置热榜列表
  reset(): void {
    console.log("重置知乎热榜列表...");
    Store.Zhihu.hot.list = []; // 清空热榜列表
    Store.Zhihu.hot.isLoading = false; // 重置加载状态
    this.updateTitle(); // 更新标题
    this._onDidChangeTreeData.fire(); // 触发更新UI
  }

  // 仅刷新视图显示（不重新加载数据）
  refreshView(): void {
    console.log("刷新热榜视图显示...");
    this._onDidChangeTreeData.fire();
  }

  // 加载热榜内容
  private async getSideBarHotList(): Promise<void> {
    /**
     * 虽然这个是通过axios和cheerio来加载列表的，但是呢，最好还是等待puppeteer能正常启动再去加载。
     * 不然就容易出现困惑，明明热榜加载出来了，但是点不开文章啥的。
     * 因为其他地方用到puppeteer那么如果，puppeteer启动失败的话，也不让热榜加载出来。
     * 因为加载文章也需要puppeteer，只加载了热榜列表却点不开，加载列表就没意义了。
     * 那么这里也做一下判断。
     */
    this.canCreateBrowser = await PuppeteerManager.canCreateBrowser();
    if (!this.canCreateBrowser) {
      console.log("无法创建浏览器实例，热榜加载失败");
      Store.Zhihu.hot.isLoading = false; // 重置加载状态
      Store.Zhihu.hot.list = []; // 清空热榜列表
      this.updateTitle(); // 更新标题
      vscode.window.showErrorMessage(
        "无法创建浏览器实例，热榜加载失败，请检查浏览器配置情况。"
      );
      this._onDidChangeTreeData.fire(); // 触发更新UI，显示加载状态
      return;
    }

    // 避免重复加载
    if (Store.Zhihu.hot.isLoading) {
      console.log("正在加载中热榜，请稍候...");
      vscode.window.showInformationMessage("正在加载知乎热榜，请稍候...");
      return;
    }
    try {
      console.log("开始加载知乎热榜数据");
      this.loadingStatusItem.show();
      this.updateTitle(); // 开始加载时更新标题为加载中
      this._onDidChangeTreeData.fire(); // 触发更新UI，显示加载状态

      await this.getHotList();
      const list = Store.Zhihu.hot.list;
      console.log(`加载完成，获取到${list.length}个热榜项目`);

      this.loadingStatusItem.hide();
      this.updateTitle(); // 加载完成后更新标题显示条数
      this._onDidChangeTreeData.fire(); // 再次触发更新UI，显示加载结果

      if (list.length > 0) {
        vscode.window.showInformationMessage(
          `已更新知乎热榜，共${list.length}个热门话题`
        );
      }
    } catch (error) {
      Store.Zhihu.hot.isLoading = false;
      this.loadingStatusItem.hide();
      this.updateTitle(); // 出错时也要更新标题
      this._onDidChangeTreeData.fire(); // 触发更新UI，显示错误状态

      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("加载知乎热榜失败:", errorMsg);
    } finally {
      this.updateTitle(); // 更新侧边栏标题
    }
  }

  /** 实际获取热榜的方法（使用 Puppeteer 加载，避免 fetch 403） */
  async getHotList() {
    // 设置加载状态
    Store.Zhihu.hot.isLoading = true;
    this.updateTitle(); // 设置加载状态后更新标题

    const cookie = Store.Zhihu.cookie;
    if (!cookie) {
      CookieManager.promptForNewCookie("需要知乎Cookie才能获取热榜，请设置");
      throw new Error("需要设置知乎Cookie才能访问");
    }

    let page: Puppeteer.Page | null = null;
    try {
      // 通过 Puppeteer 加载热榜页面，自动处理 cookie 匹配（避免 fetch 直接发送完整 cookie 导致的 403）
      console.log("通过 Puppeteer 加载热榜页面...");
      page = await PuppeteerManager.createPage();

      await page.goto("https://www.zhihu.com/hot", {
        waitUntil: "networkidle0",
        timeout: 30000,
      });

      console.log("热榜页面加载完成，开始解析...");

      const responseData = await page.content();
      const $ = cheerio.load(responseData);

      // 检查是否有登录墙或验证码
      const isNeedLogin = !!$(".SignFlow-submitButton").length;

      if (isNeedLogin) {
        console.log("检测到登录墙或验证码");
        if (cookie) {
          // 如果已经有cookie但仍然被拦截，可能是cookie过期
          console.log("Cookie可能已失效，需要更新");
          CookieManager.promptForNewCookie("您的知乎Cookie可能已过期，请更新");
          throw new Error("知乎Cookie已失效，请更新");
        } else {
          // 如果没有cookie且被拦截
          console.log("需要设置Cookie才能访问");
          CookieManager.promptForNewCookie("需要知乎Cookie才能获取热榜，请设置");
          throw new Error("需要设置知乎Cookie才能访问");
        }
      }

      const hotList: LinkItem[] = [];

      try {
        console.log("尝试定位热榜列表容器 HotList-list...");
        const hotListContainer = $(".HotList-list");

        if (hotListContainer.length > 0) {
          console.log("找到热榜列表容器，开始解析热榜项...");
          const items = hotListContainer.find("section.HotItem");
          console.log(`找到${items.length}个热榜项目`);

          items.each((index, element) => {
            try {
              // 从每个HotItem中提取信息
              const titleElement = $(element).find(".HotItem-title");
              const linkElement = $(element).find(".HotItem-content a");

              const title = titleElement.text().trim();
              const url = linkElement.attr("href") || "";
              const id = `hot-${url.split("/").pop()}` || `hot-${index}`;

              const excerpt = `${
                $(element).find(".HotItem-excerpt").text().trim()
                  ? $(element).find(".HotItem-excerpt").text().trim()
                  : "🐟无摘要🐟"
              }`;
              const hotValue = $(element).find(".HotItem-metrics").text().trim();
              let imgUrl = $(element).find(".HotItem-img img").attr("src") || "";

              // 确保图片 URL 是完整的 HTTPS URL
              if (imgUrl && !imgUrl.startsWith("http")) {
                if (imgUrl.startsWith("//")) {
                  imgUrl = "https:" + imgUrl;
                } else if (imgUrl.startsWith("/")) {
                  imgUrl = "https://www.zhihu.com" + imgUrl;
                }
              }

              if (title && url) {
                hotList.push({
                  id,
                  title,
                  url: url.startsWith("http")
                    ? url
                    : `https://www.zhihu.com${url}`,
                  excerpt,
                  hotValue: hotValue
                    ? hotValue.includes("}")
                      ? hotValue.split("}")[1]
                      : hotValue
                    : undefined, // 如果热度为空，则设为 undefined
                  imgUrl: imgUrl || undefined,
                });
                console.log(
                  `成功解析热榜项 #${index + 1}: ${title}${
                    hotValue ? ` (${hotValue})` : ""
                  }${imgUrl ? " [有图]" : ""}`
                );
              }
            } catch (itemError) {
              console.error(`解析第${index + 1}个热榜项目失败:`, itemError);
            }
          });
        } else {
          console.log("未找到热榜列表容器");
          throw new Error("未找到热榜列表容器");
        }

        console.log(`成功解析出${hotList.length}个热榜项目`);

        Store.Zhihu.hot.list = hotList;
      } catch (error) {
        Store.Zhihu.hot.list = []; // 清空热榜列表
        console.error("获取知乎热榜失败:", error);
        throw new Error(
          `获取知乎热榜失败: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      } finally {
        // 重置加载状态
        Store.Zhihu.hot.isLoading = false;
      }
    } catch (error) {
      Store.Zhihu.hot.list = [];
      Store.Zhihu.hot.isLoading = false;
      throw error;
    } finally {
      if (page && !page.isClosed()) {
        await page.close().catch(() => {});
      }
    }
  }

  // 清空热榜列表
  clearList() {
    console.log("清空知乎热榜列表");
    Store.Zhihu.hot.list = []; // 清空热榜列表
    Store.Zhihu.hot.isLoading = false; // 重置加载状态
    this.updateTitle(); // 清空时更新标题
  }

  // 获取树项
  getTreeItem(element: TreeItem): vscode.TreeItem {
    return element;
  }

  // 获取子项
  async getChildren(element?: TreeItem): Promise<TreeItem[]> {
    if (element) {
      return []; // 热榜项没有子项
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
          TooltipContents.getInvalidBrowserPathTooltip()
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
          TooltipContents.getBrowserUnavailableTooltip()
        ),
      ];
    }

    const isCookieSet = CookieManager.isCookieSet();
    if (!isCookieSet) {
      // 如果没有设置cookie，显示需要设置cookie的提示
      return [
        new StatusTreeItem(
          "扫码登录知乎（推荐）",
          new vscode.ThemeIcon("device-mobile"),
          {
            command: "zhihu-fisher.loginViaQRCode",
            title: "扫码登录知乎",
          },
          TooltipContents.getCookieRequiredTooltip()
        ),
        new StatusTreeItem(
          "手动设置Cookie",
          new vscode.ThemeIcon("key"),
          {
            command: "zhihu-fisher.setCookie",
            title: "设置知乎Cookie",
          },
          TooltipContents.getCookieRequiredTooltip()
        ),
      ];
    }

    // 如果正在加载，显示一个加载项
    if (Store.Zhihu.hot.isLoading) {
      return [
        new StatusTreeItem(
          "正在加载知乎热榜...",
          new vscode.ThemeIcon("loading~spin"),
          null,
          TooltipContents.getHotLoadingTooltip()
        ),
      ];
    }
    const list = Store.Zhihu.hot.list;

    // 在顶部添加打赏入口
    const sponsorItem = new StatusTreeItem(
      "请我喝杯咖啡吧~ 支持插件持续更新~(￣▽￣)ノ",
      new vscode.ThemeIcon("coffee"),
      {
        command: "zhihu-fisher.buyMeCoffee",
        title: "查看详情",
      },
      TooltipContents.getSponsorTooltip()
    );

    // 如果有缓存的热榜项目，返回打赏入口 + 热榜列表
    if (list.length > 0) {
      const hotItems = list.map(
        (item) => new TreeItem(item, vscode.TreeItemCollapsibleState.None)
      );
      return [sponsorItem, ...hotItems];
    }

    return [
      new StatusTreeItem(
        "获取热榜失败，点击刷新按钮重试",
        new vscode.ThemeIcon("error"),
        {
          command: "zhihu-fisher.refreshHotList",
          title: "刷新知乎热榜",
        },
        TooltipContents.getRetryTooltip("hot")
      ),
    ];
  }
}
