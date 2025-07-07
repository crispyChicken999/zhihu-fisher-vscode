import * as vscode from "vscode";
import { CookieManager } from "../cookie";

/**
 * 知乎API服务类，用于调用知乎的各种API接口
 */
export class ZhihuApiService {
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
      const cookie = CookieManager.getCookie();
      if (!cookie) {
        console.error("没有设置Cookie，无法发送不喜欢请求");
        vscode.window.showErrorMessage("需要设置知乎Cookie才能使用不喜欢功能");
        return false;
      }

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

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
          "Cache-Control": "no-cache",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Cookie: cookie,
          Origin: "https://www.zhihu.com",
          Pragma: "no-cache",
          Referer: "https://www.zhihu.com/",
          "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120"',
          "Sec-Ch-Ua-Mobile": "?0",
          "Sec-Ch-Ua-Platform": '"Windows"',
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: params.toString(),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("不喜欢请求响应:", result);

        if (result.success === true) {
          console.log("不喜欢请求成功");
          return true;
        } else {
          console.warn("不喜欢请求失败:", result);
          return false;
        }
      } else {
        console.error(
          "不喜欢请求HTTP错误:",
          response.status,
          response.statusText
        );
        return false;
      }
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
      const cookie = CookieManager.getCookie();
      if (!cookie) {
        console.error("没有设置Cookie，无法发送不再推荐作者请求");
        vscode.window.showErrorMessage(
          "需要设置知乎Cookie才能使用不再推荐作者功能"
        );
        return false;
      }

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

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
          "Cache-Control": "no-cache",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Cookie: cookie,
          Origin: "https://www.zhihu.com",
          Pragma: "no-cache",
          Referer: "https://www.zhihu.com/",
          "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120"',
          "Sec-Ch-Ua-Mobile": "?0",
          "Sec-Ch-Ua-Platform": '"Windows"',
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: params.toString(),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("不再推荐作者请求响应:", result);

        if (result.success === true) {
          console.log("不再推荐作者请求成功");
          return true;
        } else {
          console.warn("不再推荐作者请求失败:", result);
          return false;
        }
      } else {
        console.error(
          "不再推荐作者请求HTTP错误:",
          response.status,
          response.statusText
        );
        return false;
      }
    } catch (error) {
      console.error("发送不再推荐作者请求时出错:", error);
      return false;
    }
  }
}
