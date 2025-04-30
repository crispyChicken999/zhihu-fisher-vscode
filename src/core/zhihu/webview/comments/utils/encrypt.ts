// @ts-ignore
// import { generateXZse96Header } from "./utils/encrypt";

// const d_c0 = await CookieManager.getCookieValue("d_c0");
// console.log("d_c0: ", d_c0);

// const params = {
//   order_by: "score",
//   limit: 20,
// };

// const x_zse_96 = generateXZse96Header(
//   "/api/v4/comment_v5/answers/1900260226910893141/root_comment?order_by=score&limit=20&offset=",
//   d_c0!
// );
// console.log('x_zse_96: ', x_zse_96);


// @ts-ignore
import { getXZse96 } from "./g_encrypt";
/**
 * 生成完整的x-zse-96请求头值
 * @param url 请求URL (不包含域名部分)
 * @param d_c0Cookie d_c0 cookie值
 * @returns 完整的x-zse-96值
 */
export function generateXZse96Header(url: string, d_c0Cookie: string): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const source = `101_3_3.0+${url}+${d_c0Cookie}|${timestamp}`;
  return getXZse96(source);
}
