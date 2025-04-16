import * as vscode from "vscode";

// 知乎热榜项目接口
export interface ZhihuHotItem {
  id: string;
  title: string;
  url: string;
  excerpt?: string;
  hotValue?: string;
  imgUrl?: string;
}

// 知乎问题项目接口
export interface ZhihuQuestionItem {
  id: string;
  title: string;
  topics?: string[];
}

// 知乎回答项目接口
export interface ZhihuAnswerItem {
  id: string;
  authorName: string;
  authorAvatar?: string;
  upvoteCount?: string;
  answerUrl: string;
}

// 知乎作者信息接口
export interface ZhihuAuthor {
  name: string;
  avatar?: string;
  bio?: string;
  url?: string;
}

// 知乎文章接口
export interface ZhihuArticle {
  title: string;
  content: string;
  author?: ZhihuAuthor; // 使用作者对象替代单独的字段
  actualUrl?: string; // 实际URL字段用于存储回答链接
}

// Cookie相关信息
export interface CookieInfo {
  cookie: string;
  lastUpdated?: number; // 时间戳，记录上次更新时间
}
