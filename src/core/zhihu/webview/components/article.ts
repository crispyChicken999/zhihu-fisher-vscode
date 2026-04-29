import { Component, RenderOptions } from "./base";
import { ContentProcessor } from "./content-processor";

/**
 * 文章内容组件
 */
export class ArticleContentComponent implements Component {
  private content: string;
  private options: RenderOptions;
  private contentType: "article" | "question" | "thought";

  /**
   * 构造函数
   * @param content 文章内容HTML
   * @param options 渲染选项
   * @param contentType 内容类型（article/question/thought）
   */
  constructor(
    content: string,
    options: RenderOptions,
    contentType: "article" | "question" | "thought" = "question",
  ) {
    this.content = content || "";
    this.options = options;
    this.contentType = contentType;
  }

  /**
   * 渲染文章内容
   * @returns 处理后的HTML内容
   */
  public render(): string {
    // 使用 ContentProcessor 处理内容，包含高级功能
    // 如果是想法内容，传入 isThought=true 以保留 LinkCard 的完整结构
    const isThought = this.contentType === "thought";
    return ContentProcessor.processContent(
      this.content,
      this.options,
      true,
      isThought,
    );
  }
}
