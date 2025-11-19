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

    <!-- FancyBox CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.css" />

    <!-- MathJax 配置 -->
    <script>
      window.MathJax = {
        tex: {
          inlineMath: [['\\\\(', '\\\\)']],
          displayMath: [['\\\\[', '\\\\]']],
          processEscapes: true,
          processEnvironments: true
        },
        options: {
          skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
          ignoreHtmlClass: 'tex2jax_ignore',
          processHtmlClass: 'tex2jax_process'
        },
        startup: {
          ready() {
            MathJax.startup.defaultReady();
            // 页面加载完成后重新渲染数学公式
            setTimeout(() => {
              if (window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise();
              }
            }, 100);
          }
        }
      };
    </script>

    <!-- FancyBox JS -->
    <script src="https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.umd.js" async></script>

    <!-- MathJax JS -->
    <script id="MathJax-script" src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js" async></script>

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
      \${DISGUISE_CSS}
      \${RELATED_QUESTIONS_CSS}
      \${QUESTION_DETAIL_CSS}
      \${ANSWER_SORT_CSS}
    </style>
  </head>
  <body data-content-id="\${CONTENT_ID}" data-sort-type="\${SORT_TYPE}">
    <!-- 伪装界面 -->
    \${DISGUISE_INTERFACE}

    <header>
      <h4><span id="sortModeTag" class="sort-mode-tag" style="display: none;">按时间排序</span>\${TITLE}\${QUESTION_DETAIL_COMPONENT_ICON}\${RELATED_QUESTION_COMPONENT_ICON}\${ANSWER_SORT_COMPONENT}</h4>
      <div class="article-meta \${MEDIA_MODE_CLASS}">
        \${AUTHOR_COMPONENT}
        <div class="article-meta-footer">
          <div>来源: <a href="\${SOURCE_URL}" target="_blank">知乎</a></div>
          <div class="tips">
            <svg t="1745309855325" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6781" width="12" height="12">
              <path d="M512 0.021489c-282.758945 0-511.978511 229.219565-511.978511 511.978511s229.219565 511.978511 511.978511 511.978511c282.752806 0 511.978511-229.219565 511.978511-511.978511S794.752806 0.021489 512 0.021489zM650.535193 799.341311c-30.110785 10.406001-53.770648 18.430768-71.779813 24.12035-17.759479 5.683443-38.609343 8.524141-62.269205 8.524141-36.280298 0-64.599274-8.057513-84.656075-23.679305-20.332071-16.089443-30.366611-35.953863-30.366611-60.573587 0-9.465582 0.76748-18.936281 2.297322-28.869514 1.567705-9.93221 4.121877-21.304212 7.225565-33.617655l37.547151-118.810966c3.353374-11.340279 1.453095-21.74628 3.78828-32.177863 2.316765-9.93221 3.333932-19.397792 3.333932-27.429723 0-15.647375 1.433652-26.053376-5.528923-31.742958-7.219425-6.15007-20.312628-4.383844-40.139186-4.383844-9.804297 0-19.832697 1.408069-29.854958 3.776-10.290367 2.847861-19.032472 0.607844-26.251897 3.455705l10.060123-36.926004c24.427342-8.997931 48.087205-16.562211 70.499657-22.719444 22.39301-6.617721 43.722804-9.458419 63.549362-9.458419 36.274158 0 64.09376 7.583722 83.631746 23.205515 19.551288 15.621792 41.169655 35.960003 41.169655 60.579727 0 5.215792-0.800225 14.213723-2.080382 27.461445-1.274016 12.773931-3.858888 24.613584-7.468089 35.486212L563.843762 673.880901c-2.847861 9.465582-5.65786 20.363793-7.986905 32.677237-2.585895 11.839653-3.858888 21.304212-3.858888 27.455305 0 15.621792 4.114714 26.494421 11.845793 32.184003 7.980765 5.65786 21.618367 8.498558 40.900525 8.498558 9.011234 0 19.321044-1.408069 30.878265-4.224208 11.564383-2.841721 19.800975-5.215792 24.946159-7.589862L650.535193 799.341311zM643.860167 319.355445c-17.240663 14.681374-38.315654 21.771863-62.768579 21.771863-24.434505 0-45.540196-7.090489-63.305815-21.771863-17.496489-14.213723-26.238594-31.710212-26.238594-52.547797 0-20.369933 8.742105-37.893029 26.238594-52.547797 17.765619-14.655791 38.872333-22.245653 63.305815-22.245653 24.421202 0 45.527916 7.55814 62.768579 22.245653 17.496489 14.681374 26.258037 32.209586 26.258037 52.547797C670.118204 287.644209 661.356656 305.141722 643.860167 319.355445z" fill="var(--vscode-descriptionForeground)" p-id="6782"></path>
            </svg>
            \${KEYBOARD_TIPS}
          </div>
        </div>
      </div>
    </header>

    \${NAVIGATION_COMPONENT}

    <div class="article-content \${MEDIA_MODE_CLASS}">\${ARTICLE_CONTENT}</div>

    \${META_COMPONENT}

    <!-- 评论区 -->
    \${COMMENTS_COMPONENT}

    \${NAVIGATION_COMPONENT}

    \${TOOLBAR_COMPONENT}

    \${QUESTION_DETAIL_COMPONENT_MODAL}

    \${STYLE_PANEL_COMPONENT}

    <script>
      \${SCRIPTS}
      \${DISGUISE_SCRIPT}
    </script>
  </body>
</html>
`;