/**
 * 文章模板
 */
export const articleTemplate = `
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>\${TITLE}</title>
    <style>
      \${MAIN_CSS}
      \${COMPONENTS_CSS}
      \${ARTICLE_CSS}
      \${AUTHOR_CSS}
      \${NAVIGATION_CSS}
      \${TOOLBAR_CSS}
      \${MEDIA_CSS}
      \${PANEL_CSS}
      \${COMMENTS_CSS}
    </style>
  </head>
  <body>
    <header>
      <h3>\${TITLE}</h3>
      <div class="article-meta \${MEDIA_MODE_CLASS}">
        \${AUTHOR_COMPONENT}
        <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: space-between; align-items: center;">
          <div>来源: <a href="\${SOURCE_URL}" target="_blank">知乎</a></div>
          <div class="tips" style="display:flex; justify-content: center; align-items: center;gap: 5px;">
            <svg t="1745309855325" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6781" width="12" height="12">
              <path d="M512 0.021489c-282.758945 0-511.978511 229.219565-511.978511 511.978511s229.219565 511.978511 511.978511 511.978511c282.752806 0 511.978511-229.219565 511.978511-511.978511S794.752806 0.021489 512 0.021489zM650.535193 799.341311c-30.110785 10.406001-53.770648 18.430768-71.779813 24.12035-17.759479 5.683443-38.609343 8.524141-62.269205 8.524141-36.280298 0-64.599274-8.057513-84.656075-23.679305-20.332071-16.089443-30.366611-35.953863-30.366611-60.573587 0-9.465582 0.76748-18.936281 2.297322-28.869514 1.567705-9.93221 4.121877-21.304212 7.225565-33.617655l37.547151-118.810966c3.353374-11.340279 1.453095-21.74628 3.78828-32.177863 2.316765-9.93221 3.333932-19.397792 3.333932-27.429723 0-15.647375 1.433652-26.053376-5.528923-31.742958-7.219425-6.15007-20.312628-4.383844-40.139186-4.383844-9.804297 0-19.832697 1.408069-29.854958 3.776-10.290367 2.847861-19.032472 0.607844-26.251897 3.455705l10.060123-36.926004c24.427342-8.997931 48.087205-16.562211 70.499657-22.719444 22.39301-6.617721 43.722804-9.458419 63.549362-9.458419 36.274158 0 64.09376 7.583722 83.631746 23.205515 19.551288 15.621792 41.169655 35.960003 41.169655 60.579727 0 5.215792-0.800225 14.213723-2.080382 27.461445-1.274016 12.773931-3.858888 24.613584-7.468089 35.486212L563.843762 673.880901c-2.847861 9.465582-5.65786 20.363793-7.986905 32.677237-2.585895 11.839653-3.858888 21.304212-3.858888 27.455305 0 15.621792 4.114714 26.494421 11.845793 32.184003 7.980765 5.65786 21.618367 8.498558 40.900525 8.498558 9.011234 0 19.321044-1.408069 30.878265-4.224208 11.564383-2.841721 19.800975-5.215792 24.946159-7.589862L650.535193 799.341311zM643.860167 319.355445c-17.240663 14.681374-38.315654 21.771863-62.768579 21.771863-24.434505 0-45.540196-7.090489-63.305815-21.771863-17.496489-14.213723-26.238594-31.710212-26.238594-52.547797 0-20.369933 8.742105-37.893029 26.238594-52.547797 17.765619-14.655791 38.872333-22.245653 63.305815-22.245653 24.421202 0 45.527916 7.55814 62.768579 22.245653 17.496489 14.681374 26.258037 32.209586 26.258037 52.547797C670.118204 287.644209 661.356656 305.141722 643.860167 319.355445z" fill="var(--vscode-descriptionForeground)" p-id="6782"></path>
            </svg>
            <div style="display: inline-flex; align-items: center; gap: 5px;">
              <span style="flex: 0 0 auto;">键盘</span>
              <div style="display: inline-flex; align-items: center;flex: 0 0 auto;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="m7 12l5-5v3h4v4h-4v3zm14-7v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2m-2 0H5v14h14z"/></svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="m17 12l-5 5v-3H8v-4h4V7zM3 19V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2m2 0h14V5H5z"/></svg>
              </div>
              <span style="flex: 0 0 auto;">切换上/下一条，</span>
              <span style="flex: 0 0 auto; display: inline-flex; align-items: center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3zM4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm5.723 13L16.58 6h-2.303L7.42 18z"/></svg>
              </span>
              <span style="flex: 0 0 auto;">调整图片/视频显示</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    \${NAVIGATION_COMPONENT}

    \${META_COMPONENT}

    <div class="article-content \${MEDIA_MODE_CLASS}">\${ARTICLE_CONTENT}</div>

    <!-- 评论区 -->
    \${COMMENTS_COMPONENT}

    \${NAVIGATION_COMPONENT}

    \${TOOLBAR_COMPONENT}

    \${STYLE_PANEL_COMPONENT}

    <!-- 图片预览 -->
    <div class="image-preview" id="image-preview">
      <div class="image-preview-close" onclick="hideImagePreview()">&times;</div>
      <img id="preview-image" src="" alt="图片预览" />
    </div>

    <script>
      \${SCRIPTS}
    </script>
  </body>
</html>
`;