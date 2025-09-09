import * as cheerio from "cheerio";
import { Component, RenderOptions } from "./base";
import { ContentProcessor } from "./content-processor";

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
    // 使用 ContentProcessor 处理内容，包含高级功能
    return ContentProcessor.processContent(this.content, this.options, true);
  }
}

