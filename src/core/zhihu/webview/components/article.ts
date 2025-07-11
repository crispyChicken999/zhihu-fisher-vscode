import * as cheerio from "cheerio";
import { Component, RenderOptions } from "./base";

/**
 * 文章内容组件
 */
export class ArticleContentComponent implements Component {
  private content: string;
  private options: RenderOptions;

  /**
   * 构造函数
   * @param content 文章内容HTML
   * @param options 渲染选项
   */
  constructor(content: string, options: RenderOptions) {
    this.content = content || "";
    this.options = options;
  }

  /**
   * 渲染文章内容
   * @returns 处理后的HTML内容
   */
  public render(): string {
    if (!this.content) {
      return `<div class="empty-content">
        <p>内容为空</p>
      </div>`;
    }

    // 使用Cheerio处理HTML内容
    const $ = cheerio.load(this.content);

    const mediaDisplayMode = this.options.mediaDisplayMode || "normal";

    // 删除GifPlayer元素
    $(".GifPlayer").remove();

    // 如果是svg并且里面有个circle和path元素，则认为是加载视频的按钮，应该去掉这个svg
    $("svg").each(function () {
      const hasCircle = $(this).find("circle").length > 0;
      const hasPath = $(this).find("path").length > 0;
      if (hasCircle && hasPath) {
        $(this).remove(); // 删除svg元素
      }
    });

    // 处理不适内容图片遮挡
    $("figure").each(function () {
      const figure = $(this);

      // 查找遮挡层和真实图片
      const maskDiv = figure.find(".css-19ad9zw");
      const originalImg = figure.find("img.origin_image");
      const maskImg = figure.find(".css-19ad9zw img");
      const warningButton = figure.find(".css-twzs76");

      if (
        maskDiv.length > 0 &&
        originalImg.length > 0 &&
        warningButton.length > 0
      ) {
        // 这是一个不适内容图片

        // 无媒体模式时直接移除整个figure
        if (mediaDisplayMode === "none") {
          figure.remove();
          return;
        }

        // 处理真实图片的src
        let realSrc = originalImg.attr("src");
        const dataOriginal = originalImg.attr("data-original");
        const dataActualSrc = originalImg.attr("data-actualsrc");

        // 优先使用data-actualsrc，其次使用data-original，最后使用src
        if (dataActualSrc) {
          realSrc = dataActualSrc;
        } else if (dataOriginal) {
          realSrc = dataOriginal;
        }

        // 创建新的结构
        const warningText =
          figure.find(".css-i01rlp").text() || "该图片有可能会引起不适";
        const buttonText = figure.find(".css-efsslj").text() || "继续查看";
        const imageWidth = mediaDisplayMode === "mini" ? "50%" : "100%";

        const newStructure = `
          <div class="uncomfortable-image-container">
            <!-- 遮挡层 -->
            <div class="image-mask">
              <img src="${maskImg.attr("src") || ""}" style="width: ${imageWidth}; filter:
              blur(10px);" referrerpolicy="no-referrer" />
              <div class="mask-overlay" onclick="showUncomfortableImage(this)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M7.517 4.474c1.206-.453 2.608-.724 4.234-.724 6.036 0 8.834 3.715 9.985 6.161a5.255 5.255 0 0 1-.393 5.219 11.207 11.207 0 0 1-3.027 3.036.75.75 0 1 1-.835-1.245c.058-.04.115-.078.171-.118a9.704 9.704 0 0 0 2.447-2.511 3.755 3.755 0 0 0 .28-3.742c-1.003-2.131-3.374-5.3-8.628-5.3-1.456 0-2.679.242-3.706.628a.75.75 0 1 1-.528-1.404ZM5.498 6.382a.75.75 0 0 1-.07 1.059c-1.126.987-1.854 2.148-2.306 3.105a3.756 3.756 0 0 0 .281 3.749c1.206 1.787 3.71 4.26 8.348 4.26 1.237 0 2.315-.175 3.253-.462a.75.75 0 1 1 .438 1.435c-1.084.33-2.31.527-3.69.527-5.28 0-8.198-2.855-9.592-4.921a5.256 5.256 0 0 1-.394-5.228c.513-1.09 1.353-2.435 2.674-3.593a.75.75 0 0 1 1.058.07Z"
                    clip-rule="evenodd"
                  ></path>
                  <path
                    fill-rule="evenodd"
                    d="M20.048 20.012a.75.75 0 0 1-1.06.036l-15.5-14.5a.75.75 0 0 1 1.025-1.096l15.5 14.5a.75.75 0 0 1 .035 1.06Z"
                    clip-rule="evenodd"
                  ></path>
                  <path
                    fill-rule="evenodd"
                    d="M9.559 11.535c-.203 1.067.554 2.164 1.808 2.374a2.36 2.36 0 0 0 1.707-.36.75.75 0 0 1 1.043.191.75.75 0 0 1-.215 1.04 3.893 3.893 0 0 1-2.816.602c-1.984-.331-3.381-2.13-3.007-4.094.06-.311.16-.607.297-.881a.768.768 0 0 1 1.01-.358.733.733 0 0 1 .338.995 1.908 1.908 0 0 0-.165.491Zm1.219-2.362a.769.769 0 0 1 .716-.797c.302-.02.61-.007.92.045 1.784.299 3.086 1.775 3.066 3.501a.77.77 0 0 1-.762.754.73.73 0 0 1-.744-.74c.011-.948-.72-1.854-1.842-2.041a2.427 2.427 0 0 0-.566-.028.732.732 0 0 1-.788-.694Z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <div style="font-size: 12px; margin-bottom: 4px">${warningText}</div>
                <div style="font-size: 14px; font-weight: bold">${buttonText}</div>
              </div>
            </div>
            <!-- 真实图片（隐藏） -->
            <img class="real-image" src="${realSrc || ""}" style="display: none; width:
            ${imageWidth};" referrerpolicy="no-referrer"
            data-width="${originalImg.attr("data-rawwidth") || ""}"
            data-height="${originalImg.attr("data-rawheight") || ""}" />
          </div>
        `;

        // 替换原有内容
        figure.html(newStructure);
      }
    });

    // 处理图片元素
    $("img").each(function () {
      // 无媒体模式时直接移除
      if (mediaDisplayMode === "none") {
        $(this).remove();
        return;
      }

      // 处理图片源地址
      const actualSrc = $(this).attr("data-actualsrc");
      const originalSrc = $(this).attr("data-original");

      // 优先使用data-actualsrc，其次使用data-original
      if (actualSrc) {
        $(this).attr("src", actualSrc);
        $(this).attr("data-actualsrc-processed", "true");
      } else if (originalSrc) {
        $(this).attr("src", originalSrc);
        $(this).attr("data-original-processed", "true");
      }

      // 添加no-referrer属性以避免跨域问题
      $(this).attr("referrerpolicy", "no-referrer");

      // 设置图片的父盒子div text-align:center
      $(this).parent().css("text-align", "center");

      // 根据模式设置缩放
      if (mediaDisplayMode === "mini") {
        $(this).css("width", "calc(50%)");
      } else {
        $(this).css("transform", "");
      }
    });

    // 处理视频元素
    $("video").each(function () {
      // 无媒体模式时直接移除
      if (mediaDisplayMode === "none") {
        $(this).remove();
        return;
      }

      // 设置父盒子div的对齐方式为center
      $(this)
        .parent()
        .css("display", "flex")
        .css("justify-content", "center")
        .css("align-items", "center");

      // 添加控件
      $(this).attr("controls", "controls");

      // 根据模式设置缩放
      if (mediaDisplayMode === "mini") {
        $(this).css("width", "calc(50%)");
      } else {
        $(this).css("transform", "");
      }
    });

    // 处理代码块，添加语法高亮和复制功能
    $("pre").each((i, el) => {
      const pre = $(el);
      const lang =
        pre.find("code").attr("class")?.replace("language-", "") || "";
      const codeContent = pre.text();

      // 添加复制按钮
      const copyButton = $(
        `<button class="code-copy-btn" onclick="copyCode(this)">复制</button>`
      );
      pre.prepend(copyButton);

      // 添加语言标识
      if (lang) {
        const langTag = $(`<span class="code-lang">${lang}</span>`);
        pre.prepend(langTag);
      }

      // 存储原始代码以便复制
      pre.attr("data-code", codeContent);
    });

    // 处理表格，添加响应式包装器
    $("table").each((i, el) => {
      const table = $(el);
      table.wrap('<div class="table-container"></div>');
    });

    // 处理数学公式
    $(".ztext-math").each((i, el) => {
      const mathEl = $(el);
      mathEl.addClass("latex-formula");
    });

    // 处理所有链接（包括普通a标签和LinkCard）
    $("a").each((i, el) => {
      const link = $(el);
      let href = link.attr("href") || "";

      // 处理知乎重定向链接
      if (href.includes("link.zhihu.com/?target=")) {
        try {
          const targetParam = new URL(href).searchParams.get("target");
          if (targetParam) {
            href = decodeURIComponent(targetParam);
            link.attr("href", href);
            // 添加标记表示已处理
            link.addClass("zhihu-redirect-processed");
          }
        } catch (e) {
          // 如果解析失败，保留原始链接
        }
      }

      // 对LinkCard进行特殊处理
      if (link.hasClass("LinkCard")) {
        const text = link.attr("data-text") || "";
        // 清空原有内容并设置为简化链接
        link.empty();
        link.text(text || href);
        link.addClass("zhihu-processed-link");
      }
    });

    return $.html();
  }
}
