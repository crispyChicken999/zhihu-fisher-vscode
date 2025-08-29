import * as vscode from 'vscode';
import { Store } from '../stores';

/**
 * 注册媒体显示相关命令
 */
export function registerMediaCommands(): vscode.Disposable[] {
  const commands: vscode.Disposable[] = [];

  // 注册切换媒体显示模式命令
  const toggleMediaCommand = vscode.commands.registerCommand(
    "zhihu-fisher.toggleMedia",
    () => {
      const config = vscode.workspace.getConfiguration("zhihu-fisher");
      const currentMode = config.get<string>("mediaDisplayMode", "normal");

      // 三种模式循环切换：normal -> mini -> none -> normal
      let newMode: string;
      switch (currentMode) {
        case "normal":
          newMode = "mini";
          break;
        case "mini":
          newMode = "none";
          break;
        case "none":
        default:
          newMode = "normal";
          break;
      }

      // 更新配置
      config
        .update("mediaDisplayMode", newMode, vscode.ConfigurationTarget.Global)
        .then(() => {
          // 根据不同模式显示不同提示
          let statusText = "";
          switch (newMode) {
            case "normal":
              statusText = "图片、视频将正常展示";
              break;
            case "mini":
              statusText = "已切换到小图模式";
              break;
            case "none":
              statusText = "图片、视频将全部隐藏";
              break;
          }
          vscode.window.showInformationMessage(
            `${statusText}，重新打开文章来查看效果。`
          );
        });
    }
  );
  commands.push(toggleMediaCommand);

  // 注册设置正常媒体模式命令
  const setMediaModeNormalCommand = vscode.commands.registerCommand(
    "zhihu-fisher.setMediaModeNormal",
    async () => {
      const config = vscode.workspace.getConfiguration("zhihu-fisher");
      await config.update(
        "mediaDisplayMode",
        "normal",
        vscode.ConfigurationTarget.Global
      );
      vscode.window.showInformationMessage("图片和视频正常展示~");
    }
  );
  commands.push(setMediaModeNormalCommand);

  // 注册设置迷你媒体模式命令
  const setMediaModeMiniCommand = vscode.commands.registerCommand(
    "zhihu-fisher.setMediaModeMini",
    async () => {
      const config = vscode.workspace.getConfiguration("zhihu-fisher");
      await config.update(
        "mediaDisplayMode",
        "mini",
        vscode.ConfigurationTarget.Global
      );
      vscode.window.showInformationMessage(
        "图片和视频将缩小尺寸展示，方便偷偷看哈哈~"
      );
    }
  );
  commands.push(setMediaModeMiniCommand);

  // 注册设置无媒体模式命令
  const setMediaModeNoneCommand = vscode.commands.registerCommand(
    "zhihu-fisher.setMediaModeNone",
    async () => {
      const config = vscode.workspace.getConfiguration("zhihu-fisher");
      await config.update(
        "mediaDisplayMode",
        "none",
        vscode.ConfigurationTarget.Global
      );
      vscode.window.showInformationMessage("图片和视频将不再展示~");
    }
  );
  commands.push(setMediaModeNoneCommand);

  // 注册查看大图命令
  const showFullImageCommand = vscode.commands.registerCommand(
    "zhihu-fisher.showFullImage",
    (item: any) => {
      let imageUrl: string | undefined;
      let title: string = "图片预览";

      // 兼容不同的参数格式
      if (item && item.imgUrl && item.title) {
        // 新格式：直接传递 imgUrl 和 title
        imageUrl = item.imgUrl;
        title = item.title;
      } else if (item && item.listItem && item.listItem.imgUrl) {
        // 原有格式：通过 listItem 传递
        imageUrl = item.listItem.imgUrl;
        title = `缩略图预览 - ${item.listItem.title.substring(0, 10)}`;
      } else {
        vscode.window.showInformationMessage("该项目没有图片");
        return;
      }

      if (imageUrl) {
        const panel = vscode.window.createWebviewPanel(
          "previewImage",
          title,
          vscode.ViewColumn.Active, // 在当前编辑组显示
          {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
              vscode.Uri.joinPath(Store.context!.extensionUri, "resources")
            ],
          }
        );

        // 设置Webview内容
        panel.webview.html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>图片预览</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background-color: var(--vscode-editor-background);
              }
              img {
                max-width: 100%;
                max-height: 90vh;
                height: auto;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
              }
            </style>
          </head>
          <body>
            <img src="${imageUrl}" alt="预览图片" onerror="document.body.innerHTML='<p style=color:var(--vscode-errorForeground)>图片加载失败</p>'" />
          </body>
          </html>
        `;
      } else {
        vscode.window.showInformationMessage("无法获取图片URL");
      }
    }
  );
  commands.push(showFullImageCommand);

  // 注册设置迷你模式缩放比例命令
  const setMiniMediaScaleCommand = vscode.commands.registerCommand(
    "zhihu-fisher.setMiniMediaScale",
    async () => {
      const config = vscode.workspace.getConfiguration("zhihu-fisher");
      const currentScale = config.get<number>("miniMediaScale", 50);

      // 显示输入框让用户输入缩放比例
      const scaleInput = await vscode.window.showInputBox({
        title: "设置迷你模式图片缩放比例",
        prompt: "请输入缩放比例 (1-100)",
        value: currentScale.toString(),
        validateInput: (value: string) => {
          const num = parseInt(value);
          if (isNaN(num)) {
            return "请输入有效的数字";
          }
          if (num < 1 || num > 100) {
            return "缩放比例必须在 1-100 之间";
          }
          return undefined;
        }
      });

      if (scaleInput !== undefined) {
        const newScale = parseInt(scaleInput);
        await config.update(
          "miniMediaScale", 
          newScale, 
          vscode.ConfigurationTarget.Global
        );
        vscode.window.showInformationMessage(
          `已设置迷你模式图片缩放比例为 ${newScale}%，重新打开文章来查看效果。`
        );
      }
    }
  );
  commands.push(setMiniMediaScaleCommand);

  return commands;
}
