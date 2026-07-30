import * as vscode from "vscode";
import { Store } from "../stores";
import { WebviewManager } from "../zhihu/webview";
import { CommentsUtils } from "../zhihu/webview/components/comments";

/** 从粘贴的文本中提取知乎 URL（支持分享格式：标题+URL） */
function extractZhihuUrl(text: string): string | null {
  const match = text.match(
    /https?:\/\/(?:www\.)?zhihu\.com\/\S+|https?:\/\/zhuanlan\.zhihu\.com\/\S+/,
  );
  return match ? match[0].replace(/[。，、；！？）\)\]">'']+$/, "") : null;
}

/**
 * 注册WebView导航相关命令
 */
export function registerWebviewNavigationCommands(): vscode.Disposable[] {
  const commands: vscode.Disposable[] = [];

  // 注册浏览指定知乎链接命令
  const openZhihuUrlCommand = vscode.commands.registerCommand(
    "zhihu-fisher.openZhihuUrl",
    async () => {
      if( Store.Zhihu.recommend.isLoading) {
        vscode.window.showWarningMessage("当前正在加载推荐内容，请稍后再试...");
        return;
      }

      const inputBox = await vscode.window.showInputBox({
        title: "浏览知乎链接",
        prompt: "请输入知乎文章、问题或想法的URL地址",
        placeHolder:
          "支持纯URL或知乎分享格式（标题+URL），例如：https://www.zhihu.com/question/123456789",
        ignoreFocusOut: true,
        validateInput: (input) => {
          if (!input || input.trim() === "") {
            return "请输入有效的URL地址";
          }

          const trimmed = input.trim();

          // 尝试从粘贴的文本中提取知乎 URL（支持分享格式：标题+URL）
          const extractedUrl = extractZhihuUrl(trimmed);
          const urlToValidate = extractedUrl || trimmed;

          // 检查URL格式
          try {
            const url = new URL(urlToValidate);

            // 检查是否是知乎域名
            const hostname = url.hostname.toLowerCase();
            if (
              hostname !== "www.zhihu.com" &&
              hostname !== "zhuanlan.zhihu.com"
            ) {
              return "请输入知乎域名的链接（www.zhihu.com 或 zhuanlan.zhihu.com）";
            }

            // 使用现有的 isZhihuInternalLink 方法检查链接是否有效
            if (!CommentsUtils.isZhihuInternalLink(urlToValidate)) {
              return "链接格式不正确，请输入有效的知乎文章、问题或想法链接";
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

      // 从粘贴的文本中提取知乎 URL（支持分享格式：标题+URL）
      const url = extractZhihuUrl(inputBox.trim()) || inputBox.trim();

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
