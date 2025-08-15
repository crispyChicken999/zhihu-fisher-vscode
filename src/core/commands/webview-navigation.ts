import * as vscode from "vscode";
import { WebviewManager } from "../zhihu/webview";
import { CommentsUtils } from "../zhihu/webview/components/comments";

/**
 * 注册WebView导航相关命令
 */
export function registerWebviewNavigationCommands(): vscode.Disposable[] {
  const commands: vscode.Disposable[] = [];

  // 注册浏览指定知乎链接命令
  const openZhihuUrlCommand = vscode.commands.registerCommand(
    "zhihu-fisher.openZhihuUrl",
    async () => {
      const inputBox = await vscode.window.showInputBox({
        title: "浏览知乎链接",
        prompt: "请输入知乎文章或问题的URL地址",
        placeHolder:
          "例如: https://www.zhihu.com/question/123456 或 https://zhuanlan.zhihu.com/p/123456",
        ignoreFocusOut: true,
        validateInput: (input) => {
          if (!input || input.trim() === "") {
            return "请输入有效的URL地址";
          }

          // 检查URL格式
          try {
            const url = new URL(input.trim());

            // 检查是否是知乎域名
            const hostname = url.hostname.toLowerCase();
            if (
              hostname !== "www.zhihu.com" &&
              hostname !== "zhuanlan.zhihu.com"
            ) {
              return "请输入知乎域名的链接（www.zhihu.com 或 zhuanlan.zhihu.com）";
            }

            // 使用现有的 isZhihuInternalLink 方法检查链接是否有效
            if (!CommentsUtils.isZhihuInternalLink(input.trim())) {
              return "链接格式不正确，请输入有效的知乎文章或问题链接";
            }

            return null; // 验证通过
          } catch (error) {
            return "请输入有效的URL格式";
          }
        },
      });

      if (!inputBox) {
        return; // 用户取消输入
      }

      const url = inputBox.trim();

      try {
        // 使用WebviewManager的公共方法打开链接
        await WebviewManager.openZhihuUrlInWebview(url);

        vscode.window.showInformationMessage(`正在为您打开知乎链接...`);
      } catch (error) {
        console.error("打开知乎链接时出错:", error);
        vscode.window.showErrorMessage(
          `打开链接失败: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }
  );
  commands.push(openZhihuUrlCommand);

  return commands;
}
