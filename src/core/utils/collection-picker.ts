import * as vscode from "vscode";
import { ZhihuApiService } from "../zhihu/api/index";
import { CollectionCacheManager } from "./collection-cache";

/**
 * 收藏夹选择器工具类
 */
export class CollectionPickerUtils {
  /**
   * 显示分页的收藏夹选择器（带缓存）
   * @param contentToken 内容ID
   * @param contentType 内容类型
   * @returns 选中的收藏夹ID，如果用户取消则返回null
   */
  public static async showCollectionPicker(
    contentToken: string,
    contentType: "article" | "answer"
  ): Promise<string | null> {

    let currentPage = 0;
    const limit = 5; // 保持每页5个收藏夹
    let allCollections: any[] = [];
    let totalCount = 0;
    let useCache = true;

    interface CollectionQuickPickItem extends vscode.QuickPickItem {
      collectionId: string;
      isDefault: boolean;
      isNavigation?: boolean;
      action?: "loadMore" | "refresh";
    }

    // 尝试从缓存加载
    const cachedData = CollectionCacheManager.getCachedCollections();
    if (cachedData) {
      allCollections = cachedData.collections;
      totalCount = cachedData.totalCount;
      currentPage = cachedData.lastPage;
      console.log(`使用缓存数据: ${allCollections.length}个收藏夹，总数${totalCount}，最后页面${currentPage}`);
    } else {
      useCache = false;
      console.log("没有缓存数据，将从API获取");
    }

    interface CollectionQuickPickItem extends vscode.QuickPickItem {
      collectionId: string;
      isDefault: boolean;
      isNavigation?: boolean;
      action?: "loadMore" | "refresh";
    }

    while (true) {
      try {
        // 如果使用缓存且已有数据，跳过API请求
        if (useCache && allCollections.length > 0) {
          console.log("使用缓存数据，跳过API请求");
        } else {
          // 获取当前页的收藏夹
          const collectionsResult = await ZhihuApiService.getUserCollections(
            contentToken,
            contentType,
            currentPage * limit,
            limit
          );

          console.log(`收藏夹API响应 (页面${currentPage}):`, collectionsResult);

          if (!collectionsResult || !collectionsResult.data) {
            vscode.window.showWarningMessage("获取收藏夹列表失败");
            return null;
          }

          const collections = collectionsResult.data;

          // 如果是第一页，重置集合
          if (currentPage === 0) {
            allCollections = collections;
          } else {
            // 追加新的收藏夹，避免重复
            const existingIds = new Set(allCollections.map(c => c.id));
            const newCollections = collections.filter((c: any) => !existingIds.has(c.id));
            allCollections.push(...newCollections);
          }

          // 检查是否还有更多页面 - 尝试多种可能的字段
          if (collectionsResult.paging && collectionsResult.paging.totals) {
            totalCount = collectionsResult.paging.totals;
          } else if (collectionsResult.totals) {
            totalCount = collectionsResult.totals;
          } else if (collectionsResult.paging && collectionsResult.paging.total) {
            totalCount = collectionsResult.paging.total;
          } else if (collectionsResult.favlists_count) {
            totalCount = collectionsResult.favlists_count;
          } else {
            // 如果没有总数信息，通过检查返回的数据量来判断是否有更多
            totalCount = allCollections.length + (collections.length === limit ? limit : 0);
          }

          console.log(`收藏夹分页信息: 当前加载=${allCollections.length}, 总数=${totalCount}, 本页数量=${collections.length}`);

          // 缓存数据
          CollectionCacheManager.setCachedCollections(
            allCollections,
            totalCount,
            currentPage
          );
        }

        const hasMorePages = allCollections.length < totalCount;

        if (allCollections.length === 0) {
          vscode.window.showWarningMessage(
            "您还没有创建任何收藏夹，请先去知乎网站创建收藏夹"
          );
          return null;
        }

        console.log(`用户收藏夹列表 (${allCollections.length}个):`, allCollections.map(c => ({
          id: c.id,
          title: c.title,
          count: c.item_count || c.answer_count || 0
        })));

        // 构建收藏夹选择列表
        const collectionItems: CollectionQuickPickItem[] = allCollections.map(
          (collection: any) => {
            // 检查是否为私密收藏夹
            const isPrivate = !collection.is_public  || collection.private || false;
            const privateIndicator = isPrivate ? " 🔒" : "";

            return {
              label: `${collection.title}${privateIndicator}`,
              description: collection.is_default
                ? "(默认收藏夹)"
                : `${collection.item_count || collection.answer_count || 0} 个收藏${isPrivate ? " · 私密" : ""}`,
              detail: collection.description || "无描述",
              collectionId: collection.id.toString(),
              isDefault: collection.is_default,
            };
          }
        );

        // 添加导航按钮
        if (hasMorePages) {
          collectionItems.push({
            label: "$(arrow-down) 加载更多收藏夹",
            description: `已显示 ${allCollections.length}/${totalCount} 个收藏夹`,
            detail: "点击加载更多收藏夹",
            collectionId: "",
            isDefault: false,
            isNavigation: true,
            action: "loadMore",
          });
        }

        // 添加刷新选项
        collectionItems.push({
          label: "$(refresh) 刷新收藏夹列表",
          description: useCache ? "当前使用缓存数据" : "重新获取最新收藏夹",
          detail: "点击重新获取收藏夹列表，获取最新的收藏夹数据",
          collectionId: "",
          isDefault: false,
          isNavigation: true,
          action: "refresh",
        });

        // 如果已经加载了多页，添加分页信息
        if (currentPage > 0 || useCache) {
          collectionItems.unshift({
            label: "$(info) 收藏夹列表",
            description: `已加载 ${allCollections.length}/${totalCount} 个收藏夹 ${useCache ? "(缓存)" : ""}`,
            detail: "选择下方的收藏夹进行收藏，带🔒的是私密收藏夹，否则是公开收藏夹",
            collectionId: "",
            isDefault: false,
            isNavigation: true,
          });
        }

        // 让用户选择收藏夹
        const selectedCollection = await vscode.window.showQuickPick(
          collectionItems,
          {
            placeHolder: "选择要收藏到的收藏夹",
            title: `收藏${contentType === "article" ? "文章" : "回答"} (${allCollections.length}/${totalCount})`,
            matchOnDescription: true,
            matchOnDetail: true,
            ignoreFocusOut: false,
          }
        );

        if (!selectedCollection) {
          // 用户取消了选择
          return null;
        }

        // 处理导航操作
        if (selectedCollection.isNavigation) {
          if (selectedCollection.action === "loadMore") {
            currentPage++;
            useCache = false; // 加载更多时不使用缓存
            continue; // 继续循环加载下一页
          } else if (selectedCollection.action === "refresh") {
            // 清除缓存并重新开始
            CollectionCacheManager.clearCache();
            currentPage = 0;
            allCollections = [];
            totalCount = 0;
            useCache = false;
            console.log("用户选择刷新，清除缓存并重新获取");
            continue; // 继续循环重新获取
          } else {
            continue; // 其他导航操作，继续显示选择器
          }
        }

        // 返回选中的收藏夹ID
        return selectedCollection.collectionId;

      } catch (error) {
        console.error("获取收藏夹列表时出错:", error);
        vscode.window.showErrorMessage(
          `获取收藏夹列表失败: ${error instanceof Error ? error.message : String(error)}`
        );
        return null;
      }
    }
  }
}
