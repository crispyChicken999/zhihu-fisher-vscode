import { Store } from "../../../stores";
import axios from "axios";
import { CookieManager } from "../../cookie";

export class CommentsManager {
  // offset自增即可
  private static commentsURL = (answerId: string) =>
    `https://www.zhihu.com/api/v4/answers/${answerId}/root_comments?order=normal&limit=20&offset=0`;
  private static childCommentsURL = (commentId: string) =>
    `https://www.zhihu.com/api/v4/comment_v5/comment/${commentId}/child_comment?order_by=ts&limit=20&offset=`;

  constructor() {}

  static async getComments() {
    console.log("getComments");
    const cookie = CookieManager.getCookie();
    const answerId = "1900260226910893141";
    const url = this.commentsURL(answerId);

    let params = {};

    try {
      const result = await axios({
        url: url,
        params,
        method: "GET",
        headers: {
          cookie,
        },
      });
      console.log("请求成功:", result.status);
      console.log("数据预览:", result.data);
      return result.data;
    } catch (error) {
      console.error("请求失败:", error);
      // console.log("错误详情:", error.response?.data || error.message);
      throw error;
    }
  }
}
