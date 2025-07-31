import * as vscode from "vscode";
import { Store } from "../stores";
import { ZhihuApiService } from "../zhihu/api";
import { CollectionItem, CollectionFolder, LinkItem } from "../types";
import { CollectionCacheManager } from "../utils/collection-cache";
import { sidebarCollectionsDataProvider } from "../zhihu/sidebar/collections";

/**
 * 注册收藏夹相关命令
 * @param sidebarCollections 收藏夹侧边栏数据提供者
 */
export function registerCollectionCommands(
  sidebarCollections: sidebarCollectionsDataProvider
): vscode.Disposable[] {
  const commands: vscode.Disposable[] = [];

  // 注册刷新收藏夹命令
  const refreshCollectionsCommand = vscode.commands.registerCommand(
    "zhihu-fisher.refreshCollections",
    () => sidebarCollections.refresh()
  );
  commands.push(refreshCollectionsCommand);

  // 注册刷新我创建的收藏夹命令
  const refreshMyCollectionsCommand = vscode.commands.registerCommand(
    "zhihu-fisher.refreshMyCollections",
    async () => {
      vscode.window.showInformationMessage("正在刷新我创建的收藏夹...");
      await sidebarCollections.refreshMyCollections();
    }
  );
  commands.push(refreshMyCollectionsCommand);

  // 注册刷新我关注的收藏夹命令
  const refreshFollowingCollectionsCommand = vscode.commands.registerCommand(
    "zhihu-fisher.refreshFollowingCollections",
    async () => {
      vscode.window.showInformationMessage("正在刷新我关注的收藏夹...");
      await sidebarCollections.refreshFollowingCollections();
    }
  );
  commands.push(refreshFollowingCollectionsCommand);

  // 注册加载更多收藏项命令
  const loadMoreCollectionItemsCommand = vscode.commands.registerCommand(
    "zhihu-fisher.loadMoreCollectionItems",
    async (collection: CollectionFolder) => {
      await sidebarCollections.loadMoreCollectionItems(collection);
    }
  );
  commands.push(loadMoreCollectionItemsCommand);

  // 注册加载更多我创建的收藏夹命令
  const loadMoreMyCollectionsCommand = vscode.commands.registerCommand(
    "zhihu-fisher.loadMoreMyCollections",
    async () => {
      await sidebarCollections.loadMoreMyCollections();
    }
  );
  commands.push(loadMoreMyCollectionsCommand);

  // 注册加载更多我关注的收藏夹命令
  const loadMoreFollowingCollectionsCommand = vscode.commands.registerCommand(
    "zhihu-fisher.loadMoreFollowingCollections",
    async () => {
      await sidebarCollections.loadMoreFollowingCollections();
    }
  );
  commands.push(loadMoreFollowingCollectionsCommand);

  // 注册打开收藏项命令
  const openCollectionItemCommand = vscode.commands.registerCommand(
    "zhihu-fisher.openCollectionItem",
    async (collectionItem: CollectionItem, collectionId?: string) => {
      if (!collectionItem) {
        vscode.window.showErrorMessage("无法获取收藏项信息");
        return;
      }

      // 根据收藏项类型处理
      if (collectionItem.type === "article") {
        // 文章直接打开
        const linkItem: LinkItem = {
          id: collectionItem.id,
          url: collectionItem.url,
          title: collectionItem.title,
          excerpt: collectionItem.excerpt,
          type: "article",
          imgUrl: collectionItem.thumbnail,
        };
        await vscode.commands.executeCommand(
          "zhihu-fisher.openArticle",
          linkItem,
          "collection",
          collectionId
        );
      } else if (collectionItem.type === "question") {
        // 问题直接打开
        const linkItem: LinkItem = {
          id: collectionItem.id,
          url: collectionItem.url,
          title: collectionItem.title,
          excerpt: collectionItem.excerpt,
          type: "question",
          imgUrl: collectionItem.thumbnail,
        };
        await vscode.commands.executeCommand(
          "zhihu-fisher.openArticle",
          linkItem,
          "collection",
          collectionId
        );
      } else if (collectionItem.type === "answer") {
        // 回答需要特殊处理：构建一个包含该回答的问题页面
        if (!collectionItem.question) {
          vscode.window.showErrorMessage("回答缺少问题信息");
          return;
        }

        const linkItem: LinkItem = {
          id: collectionItem.id || collectionItem.question.id,
          url: collectionItem.question.url,
          title: collectionItem.question.title,
          excerpt: collectionItem.excerpt,
          type: "question",
          imgUrl: collectionItem.thumbnail,
          answerUrl: collectionItem.url, // 保存特定回答的URL
        };

        // 打开问题页面，会自动加载回答，特定回答会被优先显示
        await vscode.commands.executeCommand(
          "zhihu-fisher.openArticle",
          linkItem,
          "collection",
          collectionId
        );
      }
    }
  );
  commands.push(openCollectionItemCommand);

  // 注册刷新收藏夹命令
  const refreshCollectionCommand = vscode.commands.registerCommand(
    "zhihu-fisher.refreshCollection",
    async (item: any) => {
      if (!item || !item.collectionFolder) {
        vscode.window.showErrorMessage("无法获取收藏夹信息");
        return;
      }

      const collection = item.collectionFolder;
      // 重置收藏夹状态
      collection.items = [];
      collection.isLoaded = false;
      collection.currentOffset = 0;

      // 重新加载
      await sidebarCollections.loadCollectionItems(collection.id);
      vscode.window.showInformationMessage(
        `收藏夹 "${collection.title}" 已刷新`
      );
    }
  );
  commands.push(refreshCollectionCommand);

  // 注册在浏览器中打开收藏夹命令
  const openCollectionInBrowserCommand = vscode.commands.registerCommand(
    "zhihu-fisher.openCollectionInBrowser",
    async (item: any) => {
      if (!item || !item.collectionFolder) {
        vscode.window.showErrorMessage("无法获取收藏夹信息");
        return;
      }

      const collection = item.collectionFolder;
      await vscode.env.openExternal(vscode.Uri.parse(collection.url));
    }
  );
  commands.push(openCollectionInBrowserCommand);

  // 注册在浏览器中打开收藏项命令
  const openCollectionItemInBrowserCommand = vscode.commands.registerCommand(
    "zhihu-fisher.openCollectionItemInBrowser",
    async (item: any) => {
      if (!item || !item.collectionItem) {
        vscode.window.showErrorMessage("无法获取收藏项信息");
        return;
      }

      const collectionItem = item.collectionItem;
      await vscode.env.openExternal(vscode.Uri.parse(collectionItem.url));
    }
  );
  commands.push(openCollectionItemInBrowserCommand);

  // 注册取消收藏命令
  const removeFromCollectionCommand = vscode.commands.registerCommand(
    "zhihu-fisher.removeFromCollection",
    async (item: any) => {
      if (!item || !item.collectionItem) {
        vscode.window.showErrorMessage("无法获取收藏项信息");
        return;
      }

      const collectionItem = item.collectionItem as CollectionItem;

      // 确认对话框
      const confirm = await vscode.window.showWarningMessage(
        `确定要取消收藏 "${collectionItem.title}" 吗？`,
        { modal: true },
        "取消"
      );

      if (confirm !== "取消") {
        return;
      }

      try {
        // 从侧边栏收藏夹中找到包含该收藏项的收藏夹
        let targetCollectionId: string | null = null;

        // 遍历我创建的收藏夹
        for (const collection of Store.Zhihu.collections.myCollections) {
          const foundItem = collection.items.find(
            (item) =>
              item.id === collectionItem.id && item.type === collectionItem.type
          );
          if (foundItem) {
            targetCollectionId = collection.id;
            break;
          }
        }

        // 如果在我创建的收藏夹中没找到，查找我关注的收藏夹
        if (!targetCollectionId) {
          for (const collection of Store.Zhihu.collections
            .followingCollections) {
            const foundItem = collection.items.find(
              (item) =>
                item.id === collectionItem.id &&
                item.type === collectionItem.type
            );
            if (foundItem) {
              targetCollectionId = collection.id;
              break;
            }
          }
        }

        if (!targetCollectionId) {
          vscode.window.showErrorMessage("无法找到包含该收藏项的收藏夹");
          return;
        }

        // 调用取消收藏API
        const contentType =
          collectionItem.type === "article" ? "article" : "answer";
        const success = await ZhihuApiService.removeFromCollection(
          targetCollectionId,
          collectionItem.id,
          contentType
        );

        if (success) {
          vscode.window.showInformationMessage(
            `成功取消收藏: ${collectionItem.title}`
          );

          // 从本地数据中移除该收藏项
          const targetCollection = [
            ...Store.Zhihu.collections.myCollections,
            ...Store.Zhihu.collections.followingCollections,
          ].find((c) => c.id === targetCollectionId);

          if (targetCollection) {
            const itemIndex = targetCollection.items.findIndex(
              (item) =>
                item.id === collectionItem.id &&
                item.type === collectionItem.type
            );
            if (itemIndex > -1) {
              targetCollection.items.splice(itemIndex, 1);
              // 更新总数
              if (targetCollection.totalCount !== undefined) {
                targetCollection.totalCount = Math.max(
                  0,
                  targetCollection.totalCount - 1
                );
              }
            }
          }

          // 刷新收藏夹视图
          sidebarCollections.refreshView();
        } else {
          vscode.window.showErrorMessage(
            `取消收藏失败: ${collectionItem.title}`
          );
        }
      } catch (error) {
        console.error("取消收藏时出错:", error);
        vscode.window.showErrorMessage(
          `取消收藏失败: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }
  );
  commands.push(removeFromCollectionCommand);

  // 注册清理收藏夹缓存命令
  const clearCollectionCacheCommand = vscode.commands.registerCommand(
    "zhihu-fisher.clearCollectionCache",
    async () => {
      CollectionCacheManager.clearCache();
      vscode.window.showInformationMessage(
        "已清理收藏夹缓存，下次收藏时将重新获取最新数据"
      );
    }
  );
  commands.push(clearCollectionCacheCommand);

  // 注册重置收藏列表命令
  const resetCollectionsListCommand = vscode.commands.registerCommand(
    "zhihu-fisher.resetCollectionsList",
    async () => {
      // 重置收藏夹数据
      Store.Zhihu.collections.myCollections = [];
      Store.Zhihu.collections.followingCollections = [];
      Store.Zhihu.collections.isLoading = false;

      // 刷新侧边栏
      sidebarCollections.reset();
    }
  );
  commands.push(resetCollectionsListCommand);

  // 注册在浏览器中打开"我创建的收藏夹"页面命令
  const openMyCollectionsInBrowserCommand = vscode.commands.registerCommand(
    "zhihu-fisher.openMyCollectionsInBrowser",
    async () => {
      if (!Store.Zhihu.collections.userInfo) {
        vscode.window.showWarningMessage("未找到用户信息，请先加载收藏夹");
        return;
      }

      const userToken = Store.Zhihu.collections.userInfo.url_token;
      const url = `https://www.zhihu.com/people/${userToken}/collections`;
      await vscode.env.openExternal(vscode.Uri.parse(url));
    }
  );
  commands.push(openMyCollectionsInBrowserCommand);

  // 注册在浏览器中打开"我关注的收藏夹"页面命令
  const openFollowingCollectionsInBrowserCommand =
    vscode.commands.registerCommand(
      "zhihu-fisher.openFollowingCollectionsInBrowser",
      async () => {
        if (!Store.Zhihu.collections.userInfo) {
          vscode.window.showWarningMessage("未找到用户信息，请先加载收藏夹");
          return;
        }

        const userToken = Store.Zhihu.collections.userInfo.url_token;
        const url = `https://www.zhihu.com/people/${userToken}/following_collections`;
        await vscode.env.openExternal(vscode.Uri.parse(url));
      }
    );
  commands.push(openFollowingCollectionsInBrowserCommand);

  // 注册创建收藏夹命令
  const createCollectionCommand = vscode.commands.registerCommand(
    "zhihu-fisher.createCollection",
    async () => {
      // 获取收藏夹名称
      const title = await vscode.window.showInputBox({
        prompt: "请输入收藏夹名称",
        placeHolder: "收藏夹名称",
        validateInput: (value: string) => {
          if (!value || value.trim().length === 0) {
            return "收藏夹名称不能为空";
          }
          if (value.trim().length > 50) {
            return "收藏夹名称不能超过50个字符";
          }
          return undefined;
        },
      });

      if (!title) {
        return; // 用户取消了输入
      }

      // 获取收藏夹描述
      const description = await vscode.window.showInputBox({
        prompt: "请输入收藏夹描述（可选）",
        placeHolder: "收藏夹描述",
        validateInput: (value: string) => {
          if (value && value.length > 200) {
            return "收藏夹描述不能超过200个字符";
          }
          return undefined;
        },
      });

      // 获取公开状态
      const visibilityOptions = ["公开（有其他人关注此收藏夹时不可设置为私密）", "私密（只有你自己可以查看这个收藏夹）"];
      const selectedVisibility = await vscode.window.showQuickPick(
        visibilityOptions,
        {
          placeHolder: "选择收藏夹可见性",
        }
      );

      if (!selectedVisibility) {
        return; // 用户取消了选择
      }

      const isPublic = selectedVisibility === "公开（有其他人关注此收藏夹时不可设置为私密）";

      // 显示加载进度
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "正在创建收藏夹...",
          cancellable: false,
        },
        async () => {
          try {
            const result = await ZhihuApiService.createCollection(
              title.trim(),
              description?.trim() || "",
              isPublic
            );

            if (result.success) {
              vscode.window.showInformationMessage(
                `收藏夹"${title}"创建成功！`
              );

              // 清空收藏夹选择器缓存，确保下次选择时获取最新列表
              CollectionCacheManager.clearCache();

              // 根据API响应直接添加新的收藏夹到本地数据，而不是重新获取
              if (result.collection) {
                const newCollection: CollectionFolder = {
                  id: result.collection.id.toString(),
                  title: result.collection.title,
                  url: result.collection.url.replace(
                    "api.zhihu.com",
                    "www.zhihu.com"
                  ),
                  description: result.collection.description,
                  creator: {
                    name: result.collection.creator.name,
                    avatar_url: result.collection.creator.avatar_url,
                    url_token:
                      result.collection.creator.url.split("/").pop() || "",
                  },
                  items: [],
                  isLoaded: false,
                  currentOffset: 0,
                  hasMore: true,
                  isLoading: false,
                  type: "created",
                  totalCount: result.collection.item_count,
                  isPrivate: !isPublic, // 根据用户选择的可见性设置私密状态
                  lastUpdated: new Date().toISOString().split('T')[0], // 设置当前日期为更新时间
                };

                // 添加到我创建的收藏夹列表的开头
                Store.Zhihu.collections.myCollections.unshift(newCollection);
                console.log(
                  `创建收藏夹后，我创建的收藏夹数量: ${Store.Zhihu.collections.myCollections.length}`
                );

                // 刷新视图 - 使用 setTimeout 确保状态更新完成
                setTimeout(() => {
                  sidebarCollections.refreshView();
                }, 100);
              }
            } else {
              vscode.window.showErrorMessage(
                `创建收藏夹失败：${result.error || "未知错误"}`
              );
            }
          } catch (error: any) {
            vscode.window.showErrorMessage(
              `创建收藏夹失败：${error.message || "未知错误"}`
            );
          }
        }
      );
    }
  );
  commands.push(createCollectionCommand);

  // 注册删除收藏夹命令
  const deleteCollectionCommand = vscode.commands.registerCommand(
    "zhihu-fisher.deleteCollection",
    async (treeItem: any) => {
      console.log("删除收藏夹命令参数:", treeItem);

      // 从树节点中获取CollectionFolder对象
      let collection: CollectionFolder;

      if (treeItem && treeItem.collectionFolder) {
        // 如果传递的是包含collectionFolder的对象
        collection = treeItem.collectionFolder;
        console.log("从treeItem.collectionFolder获取收藏夹:", collection);
      } else if (treeItem && treeItem.id && treeItem.title) {
        // 如果直接传递的是CollectionFolder对象
        collection = treeItem as CollectionFolder;
        console.log("直接使用treeItem作为收藏夹:", collection);
      } else {
        console.error("无法识别的参数类型:", treeItem);
        vscode.window.showErrorMessage("无效的收藏夹");
        return;
      }

      if (!collection || !collection.id) {
        console.error("收藏夹对象无效:", collection);
        vscode.window.showErrorMessage("无法获取收藏夹信息");
        return;
      }

      console.log("将要删除的收藏夹ID:", collection.id);

      // 确认删除
      const confirmResult = await vscode.window.showWarningMessage(
        `你确认要删除收藏夹"${collection.title}"吗？\n\n 删除收藏夹后，里面收藏的内容也会一并删除，此操作不可撤销！`,
        { modal: true },
        "确认删除"
      );

      if (confirmResult !== "确认删除") {
        return; // 用户取消了删除
      }

      // 显示删除进度
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `正在删除收藏夹"${collection.title}"...`,
          cancellable: false,
        },
        async () => {
          try {
            const result = await ZhihuApiService.deleteCollection(
              collection.id
            );

            if (result.success) {
              vscode.window.showInformationMessage(
                `收藏夹"${collection.title}"删除成功！`
              );

              // 清空收藏夹选择器缓存，确保下次选择时获取最新列表
              CollectionCacheManager.clearCache();

              // 直接从本地数据中删除收藏夹，而不是重新获取
              const collectionIndex =
                Store.Zhihu.collections.myCollections.findIndex(
                  (c) => c.id === collection.id
                );

              if (collectionIndex > -1) {
                Store.Zhihu.collections.myCollections.splice(
                  collectionIndex,
                  1
                );
                console.log(
                  `删除收藏夹后，我创建的收藏夹数量: ${Store.Zhihu.collections.myCollections.length}`
                );
              }

              // 刷新视图 - 使用 setTimeout 确保状态更新完成
              setTimeout(() => {
                sidebarCollections.refreshView();
              }, 100);
            } else {
              vscode.window.showErrorMessage(
                `删除收藏夹失败：${result.error || "未知错误"}`
              );
            }
          } catch (error: any) {
            vscode.window.showErrorMessage(
              `删除收藏夹失败：${error.message || "未知错误"}`
            );
          }
        }
      );
    }
  );
  commands.push(deleteCollectionCommand);

  return commands;
}
