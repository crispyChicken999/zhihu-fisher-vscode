import * as vscode from "vscode";
import { CookieManager } from "../cookie";

/**
 * HTTP请求选项接口
 */
interface RequestOptions {
  method: "GET" | "POST" | "DELETE";
  body?: string;
  contentType?: string;
}

/**
 * 知乎API服务类，用于调用知乎的各种API接口
 */
export class ZhihuApiService {
  /**
   * 获取通用的请求头
   */
  private static getCommonHeaders(cookie: string, contentType?: string): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      "Cache-Control": "no-cache",
      Cookie: cookie,
      "DNT": "1",
      Origin: "https://www.zhihu.com",
      Pragma: "no-cache",
      Referer: "https://www.zhihu.com/",
      "Sec-Ch-Ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Windows"',
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36",
      "X-Requested-With": "XMLHttpRequest",
    };

    if (contentType) {
      headers["Content-Type"] = contentType;
    }

    return headers;
  }

  /**
   * 通用的HTTP请求方法
   */
  private static async makeRequest(
    url: string,
    options: RequestOptions,
    operationName: string
  ): Promise<any> {
    try {
      const cookie = CookieManager.getCookie();
      if (!cookie) {
        const errorMsg = `没有设置Cookie，无法${operationName}`;
        console.error(errorMsg);
        vscode.window.showErrorMessage(`需要设置知乎Cookie才能使用${operationName}功能`);
        throw new Error(errorMsg);
      }

      console.log(`${operationName}: ${url}`);

      const response = await fetch(url, {
        method: options.method,
        headers: this.getCommonHeaders(cookie, options.contentType),
        body: options.body,
      });

      if (response.ok) {
        // 对于DELETE请求，通常没有响应体，直接返回成功
        if (options.method === "DELETE") {
          console.log(`${operationName}成功`);
          return { success: true };
        }

        const result = await response.json();
        console.log(`${operationName}响应:`, result);
        return result;
      } else {
        const errorMsg = `${operationName}HTTP错误: ${response.status} ${response.statusText}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error(`${operationName}时出错:`, error);
      throw error;
    }
  }

  /**
   * 发送不喜欢请求到知乎
   * @param contentToken 内容token
   * @param contentType 内容类型，文章为2，问题为1
   * @returns Promise<boolean> 是否成功
   */
  static async sendDislikeRequest(
    contentToken: string,
    contentType: 1 | 2
  ): Promise<boolean> {
    try {
      const url = "https://www.zhihu.com/api/v4/zrec-feedback/uninterested";
      const params = new URLSearchParams({
        scene_code: "RECOMMEND",
        content_type: contentType.toString(),
        content_token: contentToken,
        uninterested_type: "less_similar",
        feed_deliver_type: "Normal",
        desktop: "true",
      });

      console.log(
        `发送不喜欢请求: contentToken=${contentToken}, contentType=${contentType}`
      );

      const result = await this.makeRequest(
        url,
        {
          method: "POST",
          body: params.toString(),
          contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        },
        "不喜欢请求"
      );

      return result.success === true;
    } catch (error) {
      console.error("发送不喜欢请求时出错:", error);
      return false;
    }
  }

  /**
   * 发送不再推荐作者请求到知乎
   * @param contentToken 内容token
   * @param contentType 内容类型，文章为2，问题为1
   * @returns Promise<boolean> 是否成功
   */
  static async sendDislikeAuthorRequest(
    contentToken: string,
    contentType: 1 | 2
  ): Promise<boolean> {
    try {
      const url = "https://www.zhihu.com/api/v4/zrec-feedback/uninterested";
      const params = new URLSearchParams({
        scene_code: "RECOMMEND",
        content_type: contentType.toString(),
        content_token: contentToken,
        uninterested_type: "author",
        feed_deliver_type: "Normal",
        desktop: "true",
      });

      console.log(
        `发送不再推荐作者请求: contentToken=${contentToken}, contentType=${contentType}`
      );

      const result = await this.makeRequest(
        url,
        {
          method: "POST",
          body: params.toString(),
          contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        },
        "不再推荐作者请求"
      );

      return result.success === true;
    } catch (error) {
      console.error("发送不再推荐作者请求时出错:", error);
      return false;
    }
  }

  /**
   * 获取用户的收藏夹列表
   * @param contentId 内容ID
   * @param contentType 内容类型 'answer' | 'article'
   * @param offset 分页偏移量，默认为0
   * @param limit 每页数量，默认为10
   * @returns Promise<any> 收藏夹列表
   */
  static async getUserCollections(
    contentId: string,
    contentType: "answer" | "article",
    offset: number = 0,
    limit: number = 10
  ): Promise<any> {
    try {
      const url = `https://www.zhihu.com/api/v4/collections/contents/${contentType}/${contentId}?offset=${offset}&limit=${limit}`;

      const result = await this.makeRequest(
        url,
        {
          method: "GET",
        },
        "获取收藏夹列表"
      );

      return result;
    } catch (error) {
      console.error("获取收藏夹列表时出错:", error);
      throw error;
    }
  }

  /**
   * 收藏内容到指定收藏夹
   * @param collectionId 收藏夹ID
   * @param contentId 内容ID
   * @param contentType 内容类型 'answer' | 'article'
   * @returns Promise<boolean> 是否成功
   */
  static async addToCollection(
    collectionId: string,
    contentId: string,
    contentType: "answer" | "article"
  ): Promise<boolean> {
    try {
      const url = `https://www.zhihu.com/api/v4/collections/${collectionId}/contents?content_id=${contentId}&content_type=${contentType}`;

      const result = await this.makeRequest(
        url,
        {
          method: "POST",
          contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        },
        "收藏内容"
      );

      return result.success === true;
    } catch (error) {
      console.error("收藏内容时出错:", error);
      return false;
    }
  }

  /**
   * 从收藏夹中取消收藏内容
   * @param collectionId 收藏夹ID
   * @param contentId 内容ID
   * @param contentType 内容类型 'answer' | 'article'
   * @returns Promise<boolean> 是否成功
   */
  static async removeFromCollection(
    collectionId: string,
    contentId: string,
    contentType: "answer" | "article"
  ): Promise<boolean> {
    try {
      const url = `https://www.zhihu.com/api/v4/collections/${collectionId}/contents/${contentId}?content_type=${contentType}`;

      const result = await this.makeRequest(
        url,
        {
          method: "DELETE",
        },
        "取消收藏内容"
      );

      return result.success === true;
    } catch (error) {
      console.error("取消收藏内容时出错:", error);
      return false;
    }
  }
}
