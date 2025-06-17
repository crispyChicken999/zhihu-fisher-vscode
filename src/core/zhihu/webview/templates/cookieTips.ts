/**
 * Cookie过期提示页面模板
 */
export const cookieTipsTemplate = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cookie已过期</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe WPC", "Segoe UI", system-ui, "Ubuntu", "Droid Sans", sans-serif;
      margin: 0;
      padding: 0;
      background-color: var(--vscode-editor-background);
      color: var(--vscode-foreground);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      line-height: 1.6;
    }

    .container {
      max-width: 600px;
      margin: 20px auto;
      padding: 40px 30px;
      text-align: center;
      background-color: var(--vscode-editor-background);
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--vscode-panel-border);
    }

    .icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 30px;
      background-color: var(--vscode-inputValidation-warningBackground);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 2s ease-in-out infinite;
    }

    .icon svg {
      width: 40px;
      height: 40px;
      fill: var(--vscode-inputValidation-warningForeground);
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.05);
        opacity: 0.8;
      }
    }

    h1 {
      color: var(--vscode-editor-foreground);
      margin: 0 0 20px 0;
      font-size: 28px;
      font-weight: 600;
    }

    .description {
      color: var(--vscode-descriptionForeground);
      margin-bottom: 30px;
      font-size: 16px;
      line-height: 1.6;
    }

    .button-group {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-top: 30px;
    }

    .button {
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 8px;
      padding: 14px 24px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      text-decoration: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .button:hover {
      background-color: var(--vscode-button-hoverBackground);
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .button:active {
      transform: translateY(0);
    }

    .button.primary {
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }

    .button.secondary {
      background-color: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border: 1px solid var(--vscode-button-border);
    }

    .button.secondary:hover {
      background-color: var(--vscode-button-secondaryHoverBackground);
    }

    .button svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }

    .tips {
      margin-top: 30px;
      padding: 20px;
      background-color: var(--vscode-editor-inactiveSelectionBackground);
      border-radius: 8px;
      border-left: 4px solid var(--vscode-button-background);
    }

    .tips h3 {
      margin: 0 0 15px 0;
      font-size: 16px;
      color: var(--vscode-editor-foreground);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tips ul {
      margin: 0;
      padding-left: 20px;
      text-align: left;
    }

    .tips li {
      color: var(--vscode-descriptionForeground);
      margin-bottom: 8px;
      font-size: 14px;
    }

    .status-info {
      margin-top: 20px;
      padding: 15px;
      background-color: var(--vscode-textPreformat-background);
      border-radius: 6px;
      font-size: 14px;
      color: var(--vscode-descriptionForeground);
    }

    @media (max-width: 600px) {
      .container {
        margin: 20px;
        padding: 30px 20px;
      }

      .button-group {
        flex-direction: column;
      }

      h1 {
        font-size: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><!-- Icon from UnJS Logos by UnJS - undefined --><g fill="none"><path fill="#AC5811" d="m3.998 8.94l-1.065.245s-1.478 2.28-1.8 4.705c-.203 1.522-.21 3.51-.07 4.5c.142.99.652 3.098 1.455 4.583c.772 1.43 1.525 1.992 2.347 2.49c.353.212.667.94 1.217 1.292c.516.33 1.196.395 1.196.395s1.88 2.953 5.947 3.465c4.772.6 7.108-1.555 7.108-1.555s1.91-.005 3.712-.777c2.022-.868 3.102-2.673 3.102-2.673s2.533-2.18 3.336-4.79c.645-2.095.662-6.078.167-7.953s-1.452-3.462-2.212-4.48c-.605-.81-7.36-4.4-8.175-4.72c-.813-.317-8.38-.812-8.663-.6c-.282.216-7.602 5.873-7.602 5.873"/><path fill="url(#unjsCookieEs0)" d="M6.633 4.937c-1.763 1.435-2.675 2.185-3.59 3.98c-.915 1.796-.62 4.178-.455 5.058c.162.88.457 2.577.62 3.425c.162.85.595 2.865 1.792 4.113c1.678 1.747 3.198 2.35 3.198 2.35s1.232 1.91 4.21 3.002c3.915 1.435 5.677-.652 7.177-1.207c1.5-.556 3.295-.588 4.83-1.666c1.533-1.077 3.23-2.382 4.34-5.122s.88-3.948.913-4.632c.032-.685-.066-3.98-1.338-6.003s-2.802-3.237-3.392-3.622c-1.305-.848-5.965-2.876-7.138-3.103c-1.175-.228-5.365.127-7.027.812c-1.663.685-4.14 2.615-4.14 2.615"/><path fill="#FFC86E" d="M14.07 17.865c-.277-.087-.57-.5-.64-1.382c-.098-1.258.83-1.606.83-1.606s1.105-.292 1.882-.57c.723-.257 1.243-.587 1.243-.587s.07-1.348.517-1.745c.45-.397 1.243-.362 2.125-.26c.88.103 2.298.69 2.09 1.225c-.207.535-.45 1.07-1.294 1.555a11.4 11.4 0 0 0-1.883 1.313c-.433.382-1.225.862-2.538 1.347s-1.932.835-2.332.71M6.637 6.618c-.83-.17-2.002 1.627-2.22 2.222c-.22.595-.445 2.045-.47 2.707c-.032.823-.047 1.595.298 2.223c.265.485.907.758 1.485.258c.577-.5 1.58-1.87 1.845-2.063c.265-.192 1.04-.447.735-1.707c-.125-.515-1.393-1.58-1.455-1.725c-.06-.143.252-1.818-.218-1.915m5.868-2.258c.032.483.427 1.255.855 1.673c.64.622 3.575 2.727 4.335 2.607s1.587-1.485 1.83-1.865c.242-.38.725-.915.915-1.157c.19-.243.69-.795.277-1.348c-.415-.552-1.45-.915-2.14-.967c-.69-.053-1.762-.5-2.677-.465s-3.48.277-3.395 1.522m12.08 6.437c.057.525.795.64 1.383 1.02c.587.38.985.778 1.33.673c.345-.103.815-.655.707-1.623c-.137-1.242-.915-2.832-2.002-2.78c-.658.033-.568 1.176-.568 1.176s-.885 1.225-.85 1.534"/><path fill="#CF701E" d="M10.368 7.558s-2.358-.015-2.316.22c.045.234.25 1.01.865 1.04s1.408.087 1.788-.03c.38-.118 1.435-.968 1.435-1.348s-.425-.937-.425-.937zm3.367 4.322s-.027.018-.067.05c-.118.098-.343.325-.255.58c.117.338.804.967 1.48.967s1.04-.63 1.157-1.04s.058-.66.058-.66zM8.477 13.8s-.41.147-.395.41c.015.262.118.747.645 1.26c.533.518 1.306.66 2.008.47c.703-.19 1.215-.717 1.158-1.42c-.058-.702-.733-1.245-.733-1.245zm-3.032 3.883s-.44.102-.395.395c.045.292.542 1.215 1.332 1.112s2.038-1.01 2.038-1.363c0-.352-.63-.82-.63-.82zm5.39 3.662s-.163.945 1.112 1.29c2.126.572 2.346-.718 2.346-.718zm8.348.438s-.57.57.077 1.017a3.04 3.04 0 0 0 2.08.523c.695-.078 1.17-.633 1.17-.633zm5.32-6.33s-1.076.542-.243 1.48c.632.715 2.08.57 2.672.167c.388-.263.503-.728.358-.963c-.148-.235-2.787-.684-2.787-.684m-4.16-6.21s-.058 1.227 1.597 1.187c2.315-.057 2.022-1.495 2.022-1.495z"/><path fill="#593329" d="M21.413 7.705s-1.085.675-1.203.953c-.117.277-.367 1.157.892 1.1c1.26-.058 2.52-.103 2.945-.615c.425-.513.323-.983.148-1.363s-1.16-1.817-1.942-1.8c-.513.01-.84 1.725-.84 1.725"/><path fill="#925849" d="M22.248 5.975s-.688-.087-1.29.982c-.6 1.07-.755 1.708-.755 1.708s1.222.005 1.954-.082c.733-.088 1.23-.543 1.23-.543s-.597-1.932-1.14-2.065"/><path fill="#593329" d="M13.928 10.973s-.6-.04-.646.192c-.044.235.088.833.293 1.095c.205.263.82.85 1.435.732s.98-.72 1.083-.927c.092-.195.192-.405.017-.667c-.178-.265-2.182-.425-2.182-.425"/><path fill="#925849" d="M14.82 10.035c-.51-.055-1.74.922-1.52 1.258c.245.367.287.135.962.472c.558.277.8.535 1.15.49s.768-.623.696-.857c-.073-.236-.598-1.29-1.288-1.363"/><path fill="#593329" d="m9.048 6.077l-1.2.83s-.045.563.205.87s.322.498 1.495.498c1.172 0 2.27-.16 2.475-.995c.204-.835-.155-1.37-.375-1.678s-2.6.475-2.6.475"/><path fill="#925949" d="M9.063 4.775c-.27.115-.908.983-1.055 1.363c-.148.38-.18.785-.16.79c.242.06 1.67.192 2.3.09s1.142-.38 1.347-.748c.163-.292.15-.68.15-.68s-.428-.77-1.015-1.005c-.585-.235-1.465.145-1.567.19"/><path fill="#593329" d="M8.057 13.855s-.1.152.09.445c.19.292.563.643 1.12.805c.558.16.953.38 1.318.338c.367-.045 1.085-.338 1.112-1.348c.03-1.01-.174-1.48-.614-1.92s-.758-.365-.758-.365z"/><path fill="#925849" d="M8.185 12.92c-.155.26-.27 1.105-.08 1.295s1.332.203 1.632.17c.303-.033 1.29-.498 1.306-.85c.014-.353-.175-.82-.175-.995s.22-.585-.38-.732s-1.983.57-2.303 1.112"/><path fill="#593329" d="M6.205 16.715s-.943.233-1.003.555c-.057.323.078.648.4.955c.323.307.558.63.805.6c.25-.03.908-.615 1.113-.805s.497-.527.47-.805a1.14 1.14 0 0 0-.41-.777c-.26-.22-1.375.277-1.375.277"/><path fill="#925849" d="M6.44 15.88c-.44.01-.778.542-.923.732c-.147.19-.395.646-.292.718c.102.073.527.118.732.25c.205.133.513.338.748.148s.44-.718.557-.893s.323-.395.323-.395s-.443-.575-1.145-.56"/><path fill="#593329" d="M11.818 19.41c-.088.102-1.333 1.113-1.333 1.113s.045.88.322 1.085c.278.204 1.143.497 1.7.614c.558.118 1.553.25 1.803.148s.512-.645.527-1.348c.015-.702-.235-1.227-.512-1.55s-.5-.442-.5-.442z"/><path fill="#925849" d="M13.473 20.728c.162-.183.352-1.7.352-1.7s-1.127-.865-1.598-.923c-.47-.058-1.024-.015-1.187.16c-.16.175-.79.805-.732 1.215c.057.41.175 1.04.175 1.04s2.652.59 2.99.207"/><path fill="#593329" d="M18.938 21.45s-.143.95.902 1.13c1.045.178 1.913.415 2.365.32s.903-.7.95-1.14s.072-1.075 0-1.248c-.19-.457-1.07-1.71-1.498-1.842c-.24-.073-.467-.033-.467-.033z"/><path fill="#925849" d="M19.615 19.785c-.467.517-.707 1.265-.682 1.66c.024.372 1.797.21 2.007.082c.21-.127.668-.697.682-.887s-.13-.785-.154-1.152c-.026-.368-.035-.868-.238-.855c-.203.012-.95.417-1.615 1.152"/><path fill="#593329" d="M25.61 13.335s.413.06.92.365c.592.355 1.212 1.26 1.165 1.998c-.047.737-.69 1.07-1.473 1.082c-.782.012-1.547-.03-1.69-.435c-.142-.405 1.078-3.01 1.078-3.01"/><path fill="#925849" d="M24.985 13.583c-.122.17-.44.69-.547 1.354s-.035 1.426.202 1.558c.238.13 1.545-.998 1.615-1.118c.073-.12-.418-1.937-.572-2.02c-.155-.082-.543.013-.698.226"/><defs><radialGradient id="unjsCookieEs0" cx="0" cy="0" r="1" gradientTransform="translate(16.041 14.399)scale(13.3005)" gradientUnits="userSpaceOnUse"><stop offset=".507" stop-color="#F29F58"/><stop offset=".715" stop-color="#F09D56"/><stop offset=".826" stop-color="#EB9550"/><stop offset=".914" stop-color="#E18745"/><stop offset=".99" stop-color="#D47436"/><stop offset="1" stop-color="#D27133"/></radialGradient></defs></g></svg>
    </div>

    <h1>Cookie已过期</h1>

    <div class="description">
      您的知乎登录凭证已过期，需要重新设置Cookie才能继续浏览内容。请选择以下操作之一：
    </div>

    <div class="button-group">
      <button class="button primary" onclick="setCookie()">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        设置Cookie
      </button>

      <button class="button secondary" onclick="openZhihu()">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M19 19H5V5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
        </svg>
        在浏览器中打开知乎
      </button>
      <button class="button secondary" onclick="refreshPage()">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
        </svg>
        刷新页面
      </button>
      <button class="button secondary" onclick="openFeedback()">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"/>
        </svg>
        意见反馈
      </button>
    </div>    <div class="tips">
      <h3>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" >
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
        如何获取Cookie？
      </h3>
      <ul>
        <li>在浏览器中登录知乎网站</li>
        <li>按F12打开开发者工具</li>
        <li>切换到Network（网络）标签页</li>
        <li>刷新页面，找到知乎的请求</li>
        <li>在请求头中复制Cookie值</li>
        <li>使用"设置Cookie"按钮粘贴Cookie</li>
      </ul>
    </div>

    <div class="tips" style="margin-top: 20px;">
      <h3>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
          <path fill="currentColor" d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"/>
        </svg>
        遇到问题？
      </h3>
      <ul>
        <li>如果Cookie设置后仍然无法访问，请检查Cookie是否完整</li>
        <li>确保Cookie是从知乎官网获取的最新版本</li>
        <li>如果问题持续存在，请点击"意见反馈"提交问题</li>
        <li>我们会尽快回复并解决您遇到的问题</li>
      </ul>
    </div>

    <div class="status-info">
      <strong>状态：</strong>登录凭证已失效，无法访问知乎内容
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    function setCookie() {
      vscode.postMessage({
        command: 'updateCookie'
      });
    }

    function openZhihu() {
      vscode.postMessage({
        command: 'openInBrowser',
        url: 'https://www.zhihu.com'
      });
    }    function refreshPage() {
      vscode.postMessage({
        command: 'requestContent'
      });
    }

    function openFeedback() {
      vscode.postMessage({
        command: 'openInBrowser',
        url: 'https://github.com/crispyChicken999/zhihu-fisher-vscode/issues'
      });
    }

    // 键盘快捷键支持
    document.addEventListener('keydown', function(event) {
      // Enter键设置Cookie
      if (event.key === 'Enter') {
        setCookie();
        event.preventDefault();
      }

      // Ctrl+R 刷新页面
      if (event.ctrlKey && event.key === 'r') {
        refreshPage();
        event.preventDefault();
      }
    });

    // 页面加载完成后聚焦到主按钮
    window.addEventListener('load', function() {
      document.querySelector('.button.primary').focus();
    });
  </script>
</body>
</html>
`;
