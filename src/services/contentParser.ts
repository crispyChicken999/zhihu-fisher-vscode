import * as cheerio from "cheerio";
import { marked } from "marked";
import { ZhihuArticle } from "./types";

/**
 * 负责解析HTML内容和格式转换
 */
export class ContentParser {
  /**
   * 将HTML转为Markdown
   */
  static htmlToMarkdown(html: string): string {
    return marked.parse(html) as string;
  }

  /**
   * 处理HTML内容中的图片
   * @param contentHtml HTML内容
   * @param hideImages 是否隐藏图片
   * @returns 处理后的HTML
   */
  static processHtmlContent(contentHtml: string, hideImages: boolean): string {
    if (!contentHtml) {
      return "";
    }

    const $ = cheerio.load(contentHtml);
    
    if (hideImages) {
      // 如果启用无图片模式，删除所有图片标签
      $("img").remove();
    } else {
      // 确保使用正确的图片URL
      $("img").each((_, img) => {
        const $img = $(img);
        // 优先使用data-actualsrc属性，这是知乎图片的真实URL
        const actualSrc = $img.attr("data-actualsrc");
        if (actualSrc) {
          $img.attr("src", actualSrc);
        } else if ($img.attr("data-original")) {
          // 备选：某些知乎图片使用data-original存储URL
          $img.attr("src", $img.attr("data-original"));
        }
      });
    }
    
    return $.html();
  }
  
  /**
   * 解析问题页面，提取标题和回答数等信息
   * @param html 页面HTML
   * @returns 解析结果
   */
  static parseQuestionPage(html: string): { title: string, totalAnswers: number } {
    const $ = cheerio.load(html);
    
    // 获取问题标题
    const title = $("h1.QuestionHeader-title").text().trim() || "未知问题";
    
    // 获取总回答数
    let totalAnswers = 0;
    const listHeaderText = $(".List-headerText span").text();
    if (listHeaderText) {
      const match = listHeaderText.match(/(\d+)/);
      if (match && match[1]) {
        totalAnswers = parseInt(match[1], 10);
      }
    }
    
    return { title, totalAnswers };
  }
  
  /**
   * 解析文章基本信息
   * @param $ cheerio实例
   * @param url 原始URL
   * @returns 解析结果
   */
  static parseArticleInfo($: cheerio.CheerioAPI, url: string): {
    title: string;
    author: string;
    authorAvatar: string;
    authorBio: string;
    authorUrl: string;
    contentHtml: string;
  } {
    let title = "";
    let author = "";
    let authorAvatar = "";
    let authorBio = "";
    let authorUrl = "";
    let contentHtml = "";
    
    // 1. 获取问题标题
    title = $("h1.QuestionHeader-title").text().trim();
    if (!title) {
      // 文章标题
      title = $("h1.Post-Title").text().trim();
    }
    if (!title) {
      // 更通用的标题选择器
      title = $("h1").first().text().trim();
    }
    
    // 2. 处理问题页面
    if (url.includes("/question/")) {
      const contentItem = $(".ContentItem.AnswerItem");
      
      if (contentItem.length > 0) {
        // 获取回答内容
        contentHtml = 
          contentItem.find(".RichContent-inner").html() ||
          contentItem.find(".RichText.ztext").html() ||
          "";
        
        // 获取作者信息
        const authorInfo = contentItem.find(".AuthorInfo");
        if (authorInfo.length > 0) {
          author = authorInfo.find("meta[itemprop='name']").attr("content") || "";
          authorAvatar = authorInfo.find(".Avatar").attr("src") || "";
          authorBio = authorInfo.find(".AuthorInfo-badgeText").text().trim();
          
          // 提取作者URL - 先尝试从meta标签获取
          const metaUrl = authorInfo.find("meta[itemprop='url']").attr("content");
          if (metaUrl) {
            authorUrl = metaUrl;
          }
        }
      }
    }
    // 3. 处理文章页面
    else if (url.includes("/p/")) {
      contentHtml =
        $(".Post-RichTextContainer").html() ||
        $(".PostIndex-content").html() ||
        $(".RichText.ztext").html() ||
        "";
      
      // 获取作者信息
      const authorInfo = $(".AuthorInfo").first();
      if (authorInfo.length > 0) {
        author = authorInfo.find(".meta[itemprop='name']").attr("content") || "";
        authorAvatar = authorInfo.find(".Avatar").attr("src") || "";
        authorBio = authorInfo.find(".AuthorInfo-badgeText").text().trim();
        
        // 提取作者URL
        const metaUrl = $("meta[itemprop='url']").attr("content");
        if (metaUrl) {
          authorUrl = metaUrl;
        } else {
          const userLinkHref = authorInfo.find(".UserLink-link").attr("href");
          if (userLinkHref) {
            authorUrl = userLinkHref.startsWith("http")
              ? userLinkHref
              : `https://www.zhihu.com${userLinkHref}`;
          }
        }
      }
    }
    // 4. 处理专栏文章
    else if (url.includes("/column/") || url.includes("/zhuanlan/")) {
      contentHtml =
        $(".RichText.ztext").html() ||
        $(".Post-RichTextContainer").html() ||
        "";
      
      // 获取作者信息
      const authorInfo = $(".AuthorInfo").first();
      if (authorInfo.length > 0) {
        author = authorInfo.find(".meta[itemprop='name']").attr("content") || "";
        authorAvatar = authorInfo.find(".Avatar").attr("src") || "";
        authorBio = authorInfo.find(".AuthorInfo-badgeText").text().trim();
        
        // 提取作者URL
        const metaUrl = $("meta[itemprop='url']").attr("content");
        if (metaUrl) {
          authorUrl = metaUrl;
        } else {
          const userLinkHref = authorInfo.find(".UserLink-link").attr("href");
          if (userLinkHref) {
            authorUrl = userLinkHref.startsWith("http")
              ? userLinkHref
              : `https://www.zhihu.com${userLinkHref}`;
          }
        }
      }
    }
    
    return { title, author, authorAvatar, authorBio, authorUrl, contentHtml };
  }
}