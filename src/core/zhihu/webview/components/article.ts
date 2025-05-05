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

    return $.html();
  }
}
