import { AnswerItem } from "../../../types";
import { Component } from "./base";

/**
 * 回答元数据组件
 */
export class MetaComponent implements Component {
  private answer: AnswerItem;

  /**
   * 构造函数
   * @param answer 回答数据
   */
  constructor(answer: AnswerItem) {
    this.answer = answer;
  }

  /**
   * 渲染回答元数据
   * @returns 回答元数据HTML
   */
  public render(): string {
    if (!this.answer) {
      return "";
    }

    // 格式化数字，如果大于1000则显示为 1k、2k 等
    const formatNumber = (num: number): string => {
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + "w";
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + "k";
      }
      return num.toString();
    };

    // 美化时间格式，只保留年月日和时分
    const formatDateTime = (dateTimeStr: string): string => {
      if (!dateTimeStr) {
        return "";
      }

      // 尝试解析日期字符串
      try {
        // 如果已经是本地化格式，直接使用
        if (dateTimeStr.includes("/")) {
          return dateTimeStr.split(" ")[0];
        }

        // 处理时间戳（秒或毫秒）
        if (/^\d+$/.test(dateTimeStr)) {
          const timestamp = parseInt(dateTimeStr);
          // 如果是秒级时间戳，转换为毫秒
          const ms = timestamp < 1e12 ? timestamp * 1000 : timestamp;
          const date = new Date(ms);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            });
          }
        }

        // 处理ISO格式日期字符串
        let date = new Date(dateTimeStr);

        // 如果解析失败，尝试其他格式
        if (isNaN(date.getTime())) {
          // 尝试替换常见的中文日期格式
          const normalizedStr = dateTimeStr
            .replace(/年/g, "-")
            .replace(/月/g, "-")
            .replace(/日/g, "")
            .replace(/\s+/g, " ");

          date = new Date(normalizedStr);
        }

        // 如果还是解析失败，尝试手动解析
        if (isNaN(date.getTime())) {
          // 匹配类似 "2024-01-15 14:30" 的格式
          const match = dateTimeStr.match(
            /(\d{4})[年\-\/](\d{1,2})[月\-\/](\d{1,2})日?\s*(\d{1,2})?:?(\d{1,2})?/
          );
          if (match) {
            const [, year, month, day, hour = "0", minute = "0"] = match;
            date = new Date(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day),
              parseInt(hour),
              parseInt(minute)
            );
          }
        }

        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
        }

        // 如果所有解析都失败，返回原字符串
        return dateTimeStr;
      } catch (error) {
        console.warn("日期解析失败:", dateTimeStr, error);
        return dateTimeStr; // 如果解析出错，返回原字符串
      }
    };

    const likeCount = formatNumber(this.answer.likeCount || 0);
    const commentCount = formatNumber(this.answer.commentCount || 0);
    const publishTime = formatDateTime(this.answer.publishTime || "");
    const updateTime = formatDateTime(this.answer.updateTime || "");
    const isUpdated =
      this.answer.publishTime !== this.answer.updateTime &&
      this.answer.updateTime;

    return `
      <div class="answer-meta">
        <div class="meta-item like" title="${this.answer.likeCount}个赞同">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
              <path fill="currentColor" d="M4.148 9.175c-.55.294-.898.865-.898 1.493v9.385c0 .95.78 1.697 1.714 1.697h12.521c.579 0 1.024-.404 1.304-.725c.317-.362.618-.847.894-1.383c.557-1.08 1.08-2.494 1.459-3.893c.376-1.392.628-2.832.607-3.956c-.01-.552-.087-1.11-.312-1.556c-.247-.493-.703-.882-1.364-.882h-5.25c.216-.96.51-2.497.404-3.868c-.059-.758-.246-1.561-.723-2.189c-.509-.668-1.277-1.048-2.282-1.048c-.582 0-1.126.31-1.415.822m0 0l-1.28 2.266c-.512.906-1.3 1.58-2.258 2.176c-.638.397-1.294.727-1.973 1.07a50 50 0 0 0-1.148.591"/>
            </svg>
            <span>${likeCount}</span>
          </div>
          <div class="meta-item comment" title="${this.answer.commentCount}条评论 (可能和真实数量有出入，以加载评论的时候为准)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
              <g fill="none">
                <path fill="currentColor" d="M12 21a9 9 0 1 0-9-9c0 1.488.36 2.89 1 4.127L3 21l4.873-1c1.236.639 2.64 1 4.127 1" opacity=".16"/>
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9 9 0 1 0-9-9c0 1.488.36 2.89 1 4.127L3 21l4.873-1c1.236.639 2.64 1 4.127 1"/>
              </g>
            </svg>
            <span>${commentCount}</span>
          </div>
          <div class="meta-item time">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-1-13h2v6h-6v-2h4z"/>
            </svg>
            <span title="发布时间">${publishTime}</span>
            ${
              isUpdated
                ? `<span class="update-time">(更新于：${updateTime})</span>`
                : ""
            }
          </div>
        </div>
      </div>
    `;
  }
}
