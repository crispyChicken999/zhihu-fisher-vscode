import * as cheerio from "cheerio";
import { RenderOptions } from "./base";

/**
 * 内容处理工具类
 * 提供通用的HTML内容处理方法，用于文章内容和问题详情的统一处理
 */
export class ContentProcessor {
  /**
   * 检查是否为知乎内部链接
   * @param href 链接地址
   * @returns 是否为知乎内部链接
   */
  private static isZhihuInternalLink(href: string): boolean {
    if (!href) {
      return false;
    }

    try {
      const url = new URL(href);
      const hostname = url.hostname.toLowerCase();
      const pathname = url.pathname;

      // 检查是否为知乎域名
      if (hostname !== "www.zhihu.com" && hostname !== "zhuanlan.zhihu.com") {
        return false;
      }

      // 检查路径模式
      if (hostname === "www.zhihu.com") {
        // 匹配 /question/xxx 或 /question/xxx/answer/xxx
        return /^\/question\/\d+(?:\/answer\/\d+)?(?:\/|$)/.test(pathname);
      }

      if (hostname === "zhuanlan.zhihu.com") {
        // 匹配 /p/xxx
        return /^\/p\/\d+(?:\/|$)/.test(pathname);
      }

      return false;
    } catch (e) {
      return false;
    }
  }

  /**
   * 检测是否为盐选付费内容
   * @param $ Cheerio实例
   * @returns 是否为盐选内容
   */
  private static isPaidContent($: cheerio.CheerioAPI): boolean {
    const isPaid = $('.zhihu-fisher-content-is-paid-needed').length > 0;
    return isPaid;
  }

  /**
   * 生成版权警告HTML
   * @returns 版权警告HTML字符串
   */
  private static generateCopyrightWarning(): string {
    return `
      <div class="copyright-warning">
        <div class="copyright-warning-header">
          <svg class="copyright-warning-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          <h3 class="copyright-warning-title">版权保护提醒</h3>
        </div>

        <div class="copyright-warning-content">
          <p><strong>本内容为知乎盐选付费专栏</strong></p>
          <p>• 内容受版权保护，仅供个人学习使用</p>
          <p>• 完整内容需要在知乎平台付费购买</p>
          <p>• 请尊重原作者和平台的知识产权</p>
        </div>

        <div class="copyright-warning-highlight">
          <p>
            <strong>获取完整内容：</strong>
            请前往 <a href="https://www.zhihu.com/xen/market/vip-privileges" target="_blank">知乎盐选</a> 购买盐选会员或单独购买该专栏
          </p>
        </div>

        <div class="copyright-warning-footer">
          <p><strong>隐私声明：</strong>本插件仅将浏览器中已展示的内容搬运至VSCode中展示，不会上传、收集、存储或分析任何付费内容、用户数据或隐私信息，不会用于任何营利行为。</p>
          <p><strong>免责声明：</strong>插件不会绕过知乎的反爬机制，不会恶意破坏或影响原网站正常使用。知乎对盐选付费内容采用字体反爬技术，可能导致部分文字在插件中显示异常，盐选会员建议直接前往知乎官网查看，按键盘（B）浏览器打开。</p>
        </div>
      </div>
    `;
  }

  /**
   * 处理HTML内容的通用方法
   * @param content 原始HTML内容
   * @param options 渲染选项
   * @param includeAdvancedFeatures 是否包含高级功能（如代码高亮、数学公式等）
   * @returns 处理后的HTML内容
   */
  public static processContent(
    content: string,
    options: RenderOptions,
    includeAdvancedFeatures: boolean = true
  ): string {
    if (!content) {
      return `<div class="empty-content">
        <p>内容为空</p>
      </div>`;
    }

    // 使用Cheerio处理HTML内容
    const $ = cheerio.load(content);

    // 检测是否为盐选付费内容
    const isPaid = this.isPaidContent($);
    let copyrightWarning = '';

    if (isPaid) {
      copyrightWarning = this.generateCopyrightWarning();
      // 移除原始的付费相关元素以避免重复显示
      $('.zhihu-fisher-content-is-paid-needed').remove();
    }

    const mediaDisplayMode = options.mediaDisplayMode || "normal";

    // 删除自定义样式，style标签，避免和我们内部的样式冲突
    $("style").remove();

    // 移除目录标识，因为没用到目录 .Catalog
    $(".Catalog").remove();

    // 处理GifPlayer组件，将jpg改为gif并删除播放图标
    $(".GifPlayer").each(function () {
      const gifPlayer = $(this);
      const img = gifPlayer.find("img.ztext-gif");

      if (img.length > 0) {
        // 获取原始src
        let src = img.attr("src");
        let dataThumbnail = img.attr("data-thumbnail");

        // 将.jpg改为.gif
        if (src && src.includes(".jpg")) {
          src = src.replace(/\.jpg(\?.*)?$/, ".gif$1");
          img.attr("src", src);
        }

        if (dataThumbnail && dataThumbnail.includes(".jpg")) {
          dataThumbnail = dataThumbnail.replace(/\.jpg(\?.*)?$/, ".gif$1");
          img.attr("data-thumbnail", dataThumbnail);
        }

        // 删除播放图标
        gifPlayer.find(".GifPlayer-icon").remove();

        // 设置图片样式和属性
        img.attr("referrerpolicy", "no-referrer");
        img.css("cursor", "default");

        img.css('display', '');

        // 根据媒体显示模式设置缩放
        if (mediaDisplayMode === "mini") {
          img.css("width", "calc(50%)");
        }

        // 设置父容器居中
        gifPlayer.css("text-align", "center");
      }
    });

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
              <img src="${
                maskImg.attr("src") || ""
              }" style="width: ${imageWidth}; filter:
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
            <img class="real-image" src="${
              realSrc || ""
            }" style="display: none; width:
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

    // 高级功能处理（仅在需要时包含）
    if (includeAdvancedFeatures) {
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

        // 提取数学公式内容
        let mathContent = "";

        // 尝试从不同的位置提取数学公式
        const texScript = mathEl.find('script[type*="math/tex"]');
        const mathHolder = mathEl.find(".math-holder");
        const dataTeX = mathEl.attr("data-tex");

        if (texScript.length > 0) {
          // 从 script 标签中提取
          mathContent = texScript.text().trim();
        } else if (mathHolder.length > 0) {
          // 从 math-holder 中提取
          mathContent = mathHolder.text().trim();
        } else if (dataTeX) {
          // 从 data-tex 属性中提取
          mathContent = dataTeX.trim();
        } else {
          // 从元素的文本内容中提取
          mathContent = mathEl.text().trim();
        }

        if (mathContent) {
          // 检查是否为行内公式还是块级公式
          const isInline =
            texScript.attr("type")?.includes("inline") ||
            (!mathContent.includes("\\[") && !mathContent.includes("$$"));

          // 清理公式内容，移除可能的包装符号
          mathContent = mathContent
            .replace(/^\$\$|\$\$$/, "") // 移除块级公式的 $$
            .replace(/^\$|\$$/, "") // 移除行内公式的 $
            .replace(/^\\\[|\\\]$/, "") // 移除 \[ \] 包装
            .replace(/^\\\(|\\\)$/, "") // 移除 \( \) 包装
            .trim();

          // 创建新的数学公式元素
          if (isInline) {
            // 行内公式
            mathEl.html(
              `<span class="math-inline" data-math="${mathContent}">\\(${mathContent}\\)</span>`
            );
          } else {
            // 块级公式
            mathEl.html(
              `<div class="math-display" data-math="${mathContent}">\\[${mathContent}\\]</div>`
            );
          }
        }
      });

      // 处理其他可能的数学公式元素
      $('script[type*="math/tex"]').each((i, el) => {
        const script = $(el);
        const mathContent = script.text().trim();
        const isInline = script.attr("type")?.includes("inline");

        if (mathContent) {
          let cleanContent = mathContent
            .replace(/^\$\$|\$\$$/, "")
            .replace(/^\$|\$$/, "")
            .replace(/^\\\[|\\\]$/, "")
            .replace(/^\\\(|\\\)$/, "")
            .trim();

          if (isInline) {
            script.replaceWith(
              `<span class="math-inline" data-math="${cleanContent}">\\(${cleanContent}\\)</span>`
            );
          } else {
            script.replaceWith(
              `<div class="math-display" data-math="${cleanContent}">\\[${cleanContent}\\]</div>`
            );
          }
        }
      });
    }

    // 处理所有链接（包括普通a标签和LinkCard）
    $("a").each((i, el) => {
      const link = $(el);
      let href = link.attr("href") || "";

      // tag type_a 去除，装饰 a 标签来的
      if (!href) {
        link.remove();
        return;
      }

      // 处理相对协议的URL（以//开头的链接），补全为https://
      if (href.startsWith("//")) {
        href = "https:" + href;
        link.attr("href", href);

        // 同时处理title属性
        const title = link.attr("title") || "";
        if (title.startsWith("//")) {
          link.attr("title", "https:" + title);
        }
      }

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

      // 处理知乎内部链接，添加VSCode打开选项
      const isZhihuInternalLink = this.isZhihuInternalLink(href);
      if (isZhihuInternalLink) {
        // 保持原有链接可以在浏览器中打开
        link.attr("href", href);
        link.attr("target", "_blank");

        link.attr("title", `${href} &#010(在浏览器中打开)`);

        // 在原有链接后添加VSCode打开选项
        const vscodeOption = $(
          `<span class="zhihu-link-vscode" onclick="openWebView('${href}');" title="${href} &#010(在 VSCode 中查看)"><svg width="min(1em, 12px)" height="min(1em, 12px)" viewBox="0 0 24 24"><path fill="currentColor" d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zM18.5 16.5L13 12l5.5-4.5v9z"></path></svg></span>`
        );

        // 将VSCode选项添加到链接后面
        link.after(vscodeOption);

        // 添加标记表示已处理
        link.addClass("zhihu-internal-processed");
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

    // FeeConsultCard去除（咨询卡片，谁要咨询啊无语）
    $(".FeeConsultCard").remove();

    // .RichText-ADLinkCardContainer 去除（广告，走开啊）
    $(".RichText-ADLinkCardContainer").remove();

    // .RichText-MCNLinkCardContainer 去除（自媒体推广，烦死了）
    $(".RichText-MCNLinkCardContainer").remove();


    // 如果是盐选内容，在内容前添加版权警告
    const finalHtml = $.html();
    if (isPaid && copyrightWarning) {
      return copyrightWarning + finalHtml;
    }

    return finalHtml;
  }
}
